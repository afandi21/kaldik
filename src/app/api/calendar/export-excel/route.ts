import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getCalendarData } from "@/lib/db";
import {
  calendarCellsForMonth,
  eventTouchesDate,
  formatHijriDay,
  formatMonthHeader,
  isFridayHoliday,
  toIsoDate,
  monthStartsBetween
} from "@/lib/dates";
import type { CalendarEvent } from "@/lib/types";

// Duplicate of summary logic from frontend to ensure exact match
type SummaryCategory = "staffHoliday" | "academicActivity" | "studentHoliday";

function summarizeEvent(event: CalendarEvent): SummaryCategory | null {
  const text = `${event.titleId} ${event.titleAr} ${event.category?.nameId ?? ""} ${event.category?.nameAr ?? ""}`.toLowerCase();

  if (/study|belajar|pembelajaran|درس|دراسة|أسابيع الدراسة|aktif|kuliah/u.test(text)) {
    return "academicActivity";
  }
  if (/exam|ujian|اختبار|امتحان|أسابيع الاختبار/u.test(text)) {
    return "academicActivity";
  }
  if (/pegawai|staff|karyawan|الموظفين/u.test(text)) {
    return "staffHoliday";
  }
  if (/mahasiswa|santri|siswa|student|الطلاب/u.test(text)) {
    return "studentHoliday";
  }
  if (/semester|idul|fitri|adha|kemerdekaan|independence|religious|libur|holiday|إجازة|عطلة|عيد/u.test(text)) {
    return "studentHoliday";
  }

  return null;
}

function isLevel2Event(event: CalendarEvent): boolean {
  const text = `${event.titleId} ${event.titleAr} ${event.category?.nameId ?? ""} ${event.category?.nameAr ?? ""}`.toLowerCase();
  if (/idul|adha|عيد الأضحى|الأضحى|عيد/i.test(text)) return true;
  if (/ramadan|ramadhan|رمضان/i.test(text)) return true;
  if (/pegawai|staff|karyawan|الموظفين/i.test(text)) return true;
  if (/mahasiswa|student|siswa|الطلاب/i.test(text)) return true;
  const sum = summarizeEvent(event);
  if (sum === "staffHoliday" || sum === "studentHoliday") return true;
  return false;
}

function daysBetween(startIso: string, endIso?: string | null): number {
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : start;
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

function getDominantCellColor(dateIso: string, events: CalendarEvent[]): string | null {
  const dateObj = new Date(dateIso);
  if (isFridayHoliday(dateObj)) {
    return "#e41e3f";
  }

  const onDate = events.filter((ev) => eventTouchesDate(ev, dateIso));
  const level2 = onDate.filter(isLevel2Event);

  if (level2.length === 1) {
    return level2[0].category?.color ?? null;
  }

  if (level2.length > 1) {
    let dominant = level2[0];
    let maxDays = daysBetween(dominant.startDate, dominant.endDate);

    for (const ev of level2.slice(1)) {
      const d = daysBetween(ev.startDate, ev.endDate);
      if (d > maxDays) {
        dominant = ev;
        maxDays = d;
      }
    }
    return dominant.category?.color ?? null;
  }

  const base = onDate.find((ev) => summarizeEvent(ev) === "academicActivity");
  if (base) {
    return base.category?.color ?? null;
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = (searchParams.get("locale") || "ar") as "ar" | "id";

    const data = await getCalendarData();
    const activeYear = data.academicYear;
    const hijriOffset = data.hijriOffset || 0;

    if (!activeYear) {
      return new NextResponse("No active academic year found", { status: 400 });
    }

    const months = monthStartsBetween(activeYear.startDate, activeYear.endDate);

    // 1. Initialize Workbook and Sheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Kaldik System";
    const sheet = workbook.addWorksheet("Kalender");
    
    if (locale === "ar") {
      // Force physical Right-to-Left for Arabic
      sheet.views = [{ rightToLeft: true, state: "normal", activeCell: "A1", showGridLines: true }];
    } else {
      // Keep default Left-to-Right for Indonesian
      sheet.views = [{ rightToLeft: false, state: "normal", activeCell: "A1", showGridLines: true }];
    }

    // 2. Setup Columns (7 columns for Saturday - Friday)
    sheet.columns = [
      { key: "col1", width: 15 },
      { key: "col2", width: 15 },
      { key: "col3", width: 15 },
      { key: "col4", width: 15 },
      { key: "col5", width: 15 },
      { key: "col6", width: 15 },
      { key: "col7", width: 15 }
    ];

    let currentRowNumber = 1;

    // Loop through each month
    months.forEach((targetDate) => {
      const cells = calendarCellsForMonth(targetDate);

      // Month Header
      const monthHeader = formatMonthHeader(targetDate, cells, locale, hijriOffset);
      const rowHeader = sheet.getRow(currentRowNumber);
      rowHeader.values = [monthHeader];
      rowHeader.height = 40;
      sheet.mergeCells(`A${currentRowNumber}:G${currentRowNumber}`);

      const headerCell = sheet.getCell(`A${currentRowNumber}`);
      headerCell.font = { bold: true, size: 16 };
      headerCell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };

      currentRowNumber++;

      // Day Names
      const dayNames = locale === "ar" 
        ? ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]
        : ["Sabtu", "Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
      
      const rowDayNames = sheet.getRow(currentRowNumber);
      rowDayNames.values = dayNames;
      rowDayNames.height = 30;
      rowDayNames.eachCell((cell) => {
        cell.font = { bold: true, size: 12 };
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        cell.border = {
          top: { style: "thin", color: { argb: "FFDEE3E9" } },
          left: { style: "thin", color: { argb: "FFDEE3E9" } },
          bottom: { style: "thin", color: { argb: "FFDEE3E9" } },
          right: { style: "thin", color: { argb: "FFDEE3E9" } }
        };
      });

      currentRowNumber++;

      // Calendar Body Cells
      for (let i = 0; i < cells.length; i += 7) {
        const weekCells = cells.slice(i, i + 7);
        if (weekCells.length === 0) continue;

        const gregorianRow = sheet.getRow(currentRowNumber);
        gregorianRow.height = 28;
        currentRowNumber++;

        const hijriRow = sheet.getRow(currentRowNumber);
        hijriRow.height = 20;
        currentRowNumber++;

        weekCells.forEach((cellDate, index) => {
          const colIndex = index + 1; // 1-based index (A-G)
          const gregCell = gregorianRow.getCell(colIndex);
          const hijriCell = hijriRow.getCell(colIndex);
          const dateIso = toIsoDate(cellDate);
          
          const hijriDay = formatHijriDay(dateIso, hijriOffset).trim();
          const gregorianDay = cellDate.getDate();

          // Base text values
          gregCell.value = gregorianDay;
          hijriCell.value = hijriDay;

          // Gregorian Cell: Standard Number, Size 14, Bold, Centered
          gregCell.numFmt = "0";
          gregCell.alignment = { vertical: "middle", horizontal: "center" };
          
          // Hijri Cell: Regular String, Size 10, Centered
          hijriCell.alignment = { vertical: "middle", horizontal: "center" };

          // Unified Visual Block Illusion (Outer Border only, no middle line)
          const borderColor = { argb: "FFDEE3E9" };
          gregCell.border = {
            top: { style: "thin", color: borderColor },
            left: { style: "thin", color: borderColor },
            right: { style: "thin", color: borderColor }
          };
          hijriCell.border = {
            bottom: { style: "thin", color: borderColor },
            left: { style: "thin", color: borderColor },
            right: { style: "thin", color: borderColor }
          };

          // Apply Color rules
          const colorHex = getDominantCellColor(dateIso, data.events);
          const inMonth = cellDate.getMonth() === targetDate.getMonth();
          const isFriday = isFridayHoliday(cellDate);

          let fgColor = "FFFFFFFF"; // Default white
          let gregFontColor = "FF0F172A"; // #0f172a (Slate 900)
          let hijriFontColor = "FF64748B"; // #64748b (Slate 500 subdued)

          if (isFriday) {
            fgColor = "FFE41E3F"; // #e41e3f (Friday Red)
            gregFontColor = "FFFFFFFF";
            hijriFontColor = "FFFFFFFF";
          } else if (colorHex) {
            fgColor = "FF" + colorHex.replace("#", "").toUpperCase();
            gregFontColor = "FFFFFFFF";
            hijriFontColor = "B3FFFFFF"; // Subdued white on colored background
          } else if (!inMonth) {
            fgColor = "FFF9FAFB"; // neutral-50
            gregFontColor = "FF9CA3AF"; // neutral-400
            hijriFontColor = "FF9CA3AF"; // neutral-400
          }

          const fillStyle: ExcelJS.Fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: fgColor }
          };

          gregCell.fill = fillStyle;
          hijriCell.fill = fillStyle;

          gregCell.font = { 
            name: "Arial",
            size: 14, 
            bold: true, 
            color: { argb: gregFontColor } 
          };
          hijriCell.font = { 
            name: "Arial",
            size: 10, 
            bold: false, 
            color: { argb: hijriFontColor } 
          };
        });
      }

      // Add separation spacing (2 blank rows)
      currentRowNumber += 2;
    });

    // Generate output
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="kalender-akademik-${activeYear.name.replace(/\//g, "-")}.xlsx"`
      }
    });
  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
