import type { CalendarEvent, LocaleMode } from "@/lib/types";

export const weekdayLabels: Record<LocaleMode, string[]> = {
  ar: ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"],
  id: ["Sabtu", "Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at"]
};

const monthFormatters: Record<LocaleMode, Intl.DateTimeFormat> = {
  ar: new Intl.DateTimeFormat("ar-SA", { month: "long", year: "numeric" }),
  id: new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" })
};

const dateFormatters: Record<LocaleMode, Intl.DateTimeFormat> = {
  ar: new Intl.DateTimeFormat("ar-SA", {
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

const hijriFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-tbla", {
  day: "numeric",
  month: "short"
});

export function toDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

export function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatDate(value: string, locale: LocaleMode) {
  return dateFormatters[locale].format(toDate(value));
}

export function formatMonth(date: Date, locale: LocaleMode) {
  return monthFormatters[locale].format(date);
}

export function formatHijri(value: string) {
  try {
    return hijriFormatter.format(toDate(value));
  } catch {
    return "";
  }
}

export function monthStartsBetween(startDate: string, endDate: string) {
  const start = toDate(startDate);
  const end = toDate(endDate);
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
  const end = event.endDate ?? event.startDate;
  return event.startDate <= dateIso && end >= dateIso;
}

export function eventText(event: CalendarEvent, locale: LocaleMode) {
  return locale === "ar" ? event.titleAr : event.titleId;
}

export function eventDescription(event: CalendarEvent, locale: LocaleMode) {
  return locale === "ar" ? event.descriptionAr : event.descriptionId;
}
