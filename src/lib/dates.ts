import type { CalendarEvent, Category, LocaleMode } from "@/lib/types";

export const weekdayLabels: Record<LocaleMode, string[]> = {
  ar: ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"],
  id: ["Sabtu", "Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at"]
};

const monthFormatters: Record<LocaleMode, Intl.DateTimeFormat> = {
  ar: new Intl.DateTimeFormat("ar-SA", { month: "long", year: "numeric" }),
  id: new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" })
};

const dateFormatters: Record<LocaleMode, Intl.DateTimeFormat> = {
  ar: new Intl.DateTimeFormat("ar-SA-u-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }),
  id: new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  })
};

const hijriMonthFormatters: Record<LocaleMode, Intl.DateTimeFormat> = {
  ar: new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", { month: "long" }),
  id: new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", { month: "long" })
};

const hijriYearFormatters: Record<LocaleMode, Intl.DateTimeFormat> = {
  ar: new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-arab", { year: "numeric" }),
  id: new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura-nu-latn", { year: "numeric" })
};

const hijriDayFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-arab", {
  day: "numeric"
});

export function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/u.test(value.trim());
}

export function toDate(value: string | null | undefined) {
  const normalized = String(value ?? "").trim();
  const datePart = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/u)?.[0];

  if (!datePart || !isIsoDate(datePart)) {
    return new Date("invalid");
  }

  const [year, month, day] = datePart.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return new Date("invalid");
  }

  return date;
}

export function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isFridayHoliday(value: string | Date | null | undefined) {
  const date = value instanceof Date ? value : toDate(value);
  return !Number.isNaN(date.getTime()) && date.getDay() === 5;
}

function isHolidayCategory(category?: Pick<Category, "nameAr" | "nameId"> | string | null) {
  const text =
    typeof category === "string"
      ? category
      : `${category?.nameId ?? ""} ${category?.nameAr ?? ""}`;

  return /libur|holiday|cuti|idul|fitri|adha|kemerdekaan|independence|إجازة|عطلة|عيد/u.test(
    text.toLowerCase()
  );
}

function eventSearchText(event: Pick<CalendarEvent, "titleAr" | "titleId" | "category">) {
  return `${event.titleId} ${event.titleAr} ${event.category?.nameId ?? ""} ${event.category?.nameAr ?? ""}`.toLowerCase();
}

export function isSpecificHolidayEvent(event: Pick<CalendarEvent, "titleAr" | "titleId" | "category">) {
  return /libur|holiday|cuti|ramadhan|ramadan|idul|fitri|adha|pegawai|mahasiswa|santri|siswa|student|إجازة|عطلة|رمضان|عيد|الطلاب|الموظفين/u.test(
    eventSearchText(event)
  );
}

export function isActiveAcademicEvent(event: Pick<CalendarEvent, "titleAr" | "titleId" | "category">) {
  return /aktif|kuliah|lecture|study|belajar|pembelajaran|akademik|درس|دراسة|محاضرة|أكاد/u.test(
    eventSearchText(event)
  );
}

export function getEventVisualPriority(event: Pick<CalendarEvent, "titleAr" | "titleId" | "category">) {
  if (isSpecificHolidayEvent(event)) {
    return 2;
  }

  if (isActiveAcademicEvent(event)) {
    return 1;
  }

  return 0;
}

export function getDominantEventForDate(events: CalendarEvent[], dateIso: string) {
  return events
    .filter((event) => eventTouchesDate(event, dateIso))
    .sort((a, b) => getEventVisualPriority(b) - getEventVisualPriority(a))[0] ?? null;
}

export function calculateActiveDays(
  startValue: string | Date | null | undefined,
  endValue?: string | Date | null,
  category?: Pick<Category, "nameAr" | "nameId"> | string | null
) {
  const start = startValue instanceof Date ? startValue : toDate(startValue);
  const end = endValue instanceof Date ? endValue : toDate(endValue ?? (startValue as string | null | undefined));

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return 0;
  }

  let total = 0;
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const finalDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const startIso = toIsoDate(start);
  const endIso = toIsoDate(end);
  const canCountSandwichedFriday = isHolidayCategory(category);

  while (cursor <= finalDate) {
    const cursorIso = toIsoDate(cursor);
    const isFriday = isFridayHoliday(cursor);
    const isEdge = cursorIso === startIso || cursorIso === endIso;

    if (!isFriday || (canCountSandwichedFriday && !isEdge)) {
      total += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return total;
}

export const calculateDuration = calculateActiveDays;
export const countActiveDays = calculateActiveDays;

export function calculateNetActiveDays(
  startValue: string | Date | null | undefined,
  endValue: string | Date | null | undefined,
  events: CalendarEvent[]
) {
  const start = startValue instanceof Date ? startValue : toDate(startValue);
  const end = endValue instanceof Date ? endValue : toDate(endValue);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return 0;
  }

  let total = 0;
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const finalDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  while (cursor <= finalDate) {
    const dateIso = toIsoDate(cursor);
    const dominantEvent = getDominantEventForDate(events, dateIso);

    if (!isFridayHoliday(cursor) && !dominantEvent?.category && !dominantEvent) {
      total += 1;
    } else if (
      !isFridayHoliday(cursor) &&
      dominantEvent &&
      isActiveAcademicEvent(dominantEvent) &&
      !events.some((event) => eventTouchesDate(event, dateIso) && isSpecificHolidayEvent(event))
    ) {
      total += 1;
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return total;
}

export function formatDate(value: string | null | undefined, locale: LocaleMode, fallback = "-") {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return dateFormatters[locale].format(date);
}

export function formatMonth(date: Date, locale: LocaleMode) {
  return monthFormatters[locale].format(date);
}

export function formatHijri(value: string, locale: LocaleMode = "ar", hijriOffset = 0) {
  try {
    const date = toDate(value);
    if (Number.isNaN(date.getTime())) return "";
    
    const adjustedDate = new Date(date);
    adjustedDate.setDate(adjustedDate.getDate() + hijriOffset);
    
    const day = hijriDayFormatter.format(adjustedDate);
    const month = hijriMonthFormatters[locale].format(adjustedDate);
    return `${day} ${month}`;
  } catch {
    return "";
  }
}

export function getHijriParts(value: string | Date, locale: LocaleMode, hijriOffset = 0) {
  const date = value instanceof Date ? value : toDate(value);
  if (Number.isNaN(date.getTime())) {
    return { day: "", month: "", year: "" };
  }

  const adjustedDate = new Date(date);
  adjustedDate.setDate(adjustedDate.getDate() + hijriOffset);

  return {
    day: hijriDayFormatter.format(adjustedDate),
    month: hijriMonthFormatters[locale].format(adjustedDate),
    year: hijriYearFormatters[locale].format(adjustedDate)
  };
}

export function formatHijriDay(value: string | Date, hijriOffset = 0) {
  // Always use Eastern Arabic numerals for Hijri days
  const date = value instanceof Date ? value : toDate(value);
  if (Number.isNaN(date.getTime())) return "";
  
  const adjustedDate = new Date(date);
  adjustedDate.setDate(adjustedDate.getDate() + hijriOffset);
  return hijriDayFormatter.format(adjustedDate);
}

export function formatMonthHeader(month: Date, cells: Date[], locale: LocaleMode, hijriOffset = 0) {
  const hijriMonths = new Set<string>();
  let hijriYear = "";

  cells.forEach((cell) => {
    const parts = getHijriParts(cell, locale, hijriOffset);
    if (parts.month) {
      hijriMonths.add(parts.month);
    }
    if (!hijriYear && parts.year) {
      hijriYear = parts.year;
    }
  });

  const hijriMonthText = Array.from(hijriMonths).join("/");
  
  if (locale === "ar") {
    const hijriText = hijriMonthText ? `${hijriMonthText}${hijriYear ? ` ${hijriYear}` : ""}` : "";
    return `${formatMonth(month, locale)} م${hijriText ? ` - ${hijriText}` : ""}`;
  } else {
    const hijriText = hijriMonthText ? `${hijriMonthText}${hijriYear ? ` ${hijriYear}` : ""}` : "";
    return `${formatMonth(month, locale)} M${hijriText ? ` - ${hijriText}` : ""}`;
  }
}

export function monthStartsBetween(startDate: string, endDate: string) {
  const start = toDate(startDate);
  const end = toDate(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return [];
  }

  const months: Date[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);

  while (current <= end) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

export function calendarCellsForMonth(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const saturdayFirstOffset = (first.getDay() + 1) % 7;
  const cells: Date[] = [];
  const cursor = new Date(first);

  cursor.setDate(first.getDate() - saturdayFirstOffset);

  while (cells.length < 42) {
    cells.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  if (last.getDay() === 5 && cells.length > 35) {
    return cells.slice(0, 35);
  }

  return cells;
}

export function eventTouchesDate(event: CalendarEvent, dateIso: string) {
  const start = toDate(event.startDate);
  if (Number.isNaN(start.getTime())) {
    return false;
  }

  const end = event.endDate ? toDate(event.endDate) : start;
  if (Number.isNaN(end.getTime())) {
    return false;
  }

  const date = toDate(dateIso);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return toIsoDate(start) <= toIsoDate(date) && toIsoDate(end) >= toIsoDate(date);
}

export function eventText(event: CalendarEvent, locale: LocaleMode) {
  return locale === "ar" ? event.titleAr : event.titleId;
}

export function eventDescription(event: CalendarEvent, locale: LocaleMode) {
  return locale === "ar" ? event.descriptionAr : event.descriptionId;
}
