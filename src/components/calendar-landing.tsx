"use client";

import { CalendarDays, CircleAlert, Languages, LogIn, Star } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  calendarCellsForMonth,
  eventDescription,
  eventText,
  eventTouchesDate,
  formatDate,
  formatHijri,
  formatMonth,
  monthStartsBetween,
  toIsoDate,
  weekdayLabels
} from "@/lib/dates";
import type { AcademicYear, CalendarEvent, Category, LocaleMode } from "@/lib/types";

type CalendarLandingProps = {
  academicYear: AcademicYear;
  categories: Category[];
  events: CalendarEvent[];
  usingSampleData: boolean;
};

export function CalendarLanding({
  academicYear,
  categories,
  events,
  usingSampleData
}: CalendarLandingProps) {
  const [locale, setLocale] = useState<LocaleMode>("ar");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const dir = locale === "ar" ? "rtl" : "ltr";
  const months = useMemo(
    () => monthStartsBetween(academicYear.startDate, academicYear.endDate),
    [academicYear.endDate, academicYear.startDate]
  );
  const selectedEvents = selectedDate
    ? events.filter((event) => eventTouchesDate(event, selectedDate))
    : [];
  const importantEvents = events
    .filter((event) => event.isImportant)
    .slice()
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 5);

  return (
    <main dir={dir} className="min-h-screen">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--accent-strong)]">
              <CalendarDays size={18} />
              <span>{locale === "ar" ? "التقويم الأكاديمي" : "Kalender Akademik"}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-normal sm:text-4xl">
              {locale === "ar" ? "الأوقات المهمة للمشرفين" : "Waktu Penting Pembina"}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
              {locale === "ar"
                ? "اعرض السنة الأكاديمية، الأحداث الفردية، والفترات المهمة بدون تسجيل الدخول."
                : "Lihat tahun akademik, event individual, dan rentang kegiatan tanpa perlu login."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-md border border-[var(--line)] bg-[var(--panel)] p-1">
              <button
                className={`focus-ring rounded px-3 py-2 text-sm font-semibold ${
                  locale === "ar"
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--muted)]"
                }`}
                onClick={() => setLocale("ar")}
                type="button"
              >
                عربي
              </button>
              <button
                className={`focus-ring rounded px-3 py-2 text-sm font-semibold ${
                  locale === "id"
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--muted)]"
                }`}
                onClick={() => setLocale("id")}
                type="button"
              >
                Indonesia
              </button>
            </div>
            <Link
              className="focus-ring inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm font-semibold text-[var(--foreground)]"
              href="/admin/login"
            >
              <LogIn size={16} />
              <span>{locale === "ar" ? "دخول المدير" : "Admin"}</span>
            </Link>
          </div>
        </header>

        {usingSampleData ? (
          <div className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <CircleAlert className="mt-0.5 shrink-0" size={18} />
            <p>
              {locale === "ar"
                ? "يعرض هذا الموقع بيانات تجريبية لأن قاعدة البيانات لم يتم إعدادها بعد."
                : "Aplikasi sedang menampilkan data contoh karena database belum dikonfigurasi."}
            </p>
          </div>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">{academicYear.name}</h2>
                <p className="text-sm text-[var(--muted)]">
                  {formatDate(academicYear.startDate, locale)} -{" "}
                  {formatDate(academicYear.endDate, locale)}
                </p>
              </div>
              <Languages className="text-[var(--accent)]" size={22} />
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {months.map((month) => (
                <MonthCalendar
                  key={month.toISOString()}
                  events={events}
                  locale={locale}
                  month={month}
                  onSelectDate={setSelectedDate}
                  selectedDate={selectedDate}
                />
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <section className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Star size={18} className="text-[var(--gold)]" />
                <h2 className="font-bold">
                  {locale === "ar" ? "الأحداث المهمة" : "Sorotan Penting"}
                </h2>
              </div>
              <div className="space-y-3">
                {importantEvents.map((event) => (
                  <EventSummary key={event.id} event={event} locale={locale} />
                ))}
              </div>
            </section>

            <section className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-4">
              <h2 className="mb-3 font-bold">
                {locale === "ar" ? "الفئات" : "Kategori"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span
                    className="rounded px-2 py-1 text-xs font-semibold text-white"
                    key={category.id}
                    style={{ backgroundColor: category.color }}
                  >
                    {locale === "ar" ? category.nameAr : category.nameId}
                  </span>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </section>

      {selectedDate ? (
        <DateDetail
          date={selectedDate}
          events={selectedEvents}
          locale={locale}
          onClose={() => setSelectedDate(null)}
        />
      ) : null}
    </main>
  );
}

function MonthCalendar({
  events,
  locale,
  month,
  onSelectDate,
  selectedDate
}: {
  events: CalendarEvent[];
  locale: LocaleMode;
  month: Date;
  onSelectDate: (date: string) => void;
  selectedDate: string | null;
}) {
  const cells = calendarCellsForMonth(month);

  return (
    <section className="overflow-hidden rounded-md border border-[var(--line)] bg-white">
      <h3 className="border-b border-[var(--line)] px-3 py-2 text-sm font-bold">
        {formatMonth(month, locale)}
      </h3>
      <div className="calendar-grid border-b border-[var(--line)] bg-stone-50">
        {weekdayLabels[locale].map((day) => (
          <div className="px-2 py-2 text-center text-xs font-bold text-[var(--muted)]" key={day}>
            {day}
          </div>
        ))}
      </div>
      <div className="calendar-grid">
        {cells.map((cell) => {
          const dateIso = toIsoDate(cell);
          const dayEvents = events.filter((event) => eventTouchesDate(event, dateIso));
          const inMonth = cell.getMonth() === month.getMonth();

          return (
            <button
              className={`focus-ring min-h-24 border-b border-e border-[var(--line)] p-2 text-start transition hover:bg-teal-50 ${
                inMonth ? "bg-white" : "bg-stone-50 text-stone-400"
              } ${selectedDate === dateIso ? "ring-2 ring-inset ring-[var(--accent)]" : ""}`}
              key={dateIso}
              onClick={() => onSelectDate(dateIso)}
              type="button"
            >
              <span className="block text-lg font-bold leading-none">{cell.getDate()}</span>
              <span className="mt-1 block text-[10px] leading-none text-stone-400">
                {formatHijri(dateIso)}
              </span>
              <span className="mt-2 flex flex-col gap-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <span
                    className="truncate rounded px-1.5 py-1 text-[10px] font-semibold text-white"
                    key={event.id}
                    style={{ backgroundColor: event.category?.color ?? "#0f766e" }}
                  >
                    {eventText(event, locale)}
                  </span>
                ))}
                {dayEvents.length > 2 ? (
                  <span className="text-[10px] font-semibold text-[var(--muted)]">
                    +{dayEvents.length - 2}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function EventSummary({ event, locale }: { event: CalendarEvent; locale: LocaleMode }) {
  return (
    <article className="border-s-4 ps-3" style={{ borderColor: event.category?.color ?? "#0f766e" }}>
      <p className="text-xs font-semibold text-[var(--muted)]">
        {formatDate(event.startDate, locale)}
        {event.endDate ? ` - ${formatDate(event.endDate, locale)}` : ""}
      </p>
      <h3 className="text-sm font-bold">{eventText(event, locale)}</h3>
    </article>
  );
}

function DateDetail({
  date,
  events,
  locale,
  onClose
}: {
  date: string;
  events: CalendarEvent[];
  locale: LocaleMode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/30 p-3 sm:items-center sm:justify-center">
      <section
        className="max-h-[86vh] w-full max-w-xl overflow-auto rounded-md bg-[var(--panel)] p-4 shadow-2xl"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">{formatDate(date, locale)}</h2>
            <p className="text-sm text-[var(--muted)]">{formatHijri(date)}</p>
          </div>
          <button
            className="focus-ring rounded-md border border-[var(--line)] px-3 py-1.5 text-sm font-semibold"
            onClick={onClose}
            type="button"
          >
            {locale === "ar" ? "إغلاق" : "Tutup"}
          </button>
        </div>

        <div className="space-y-3">
          {events.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              {locale === "ar" ? "لا توجد أحداث في هذا التاريخ." : "Tidak ada event pada tanggal ini."}
            </p>
          ) : (
            events.map((event) => (
              <article
                className="rounded-md border border-[var(--line)] bg-white p-3"
                key={event.id}
              >
                <p
                  className="mb-2 inline-flex rounded px-2 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: event.category?.color ?? "#0f766e" }}
                >
                  {event.category
                    ? locale === "ar"
                      ? event.category.nameAr
                      : event.category.nameId
                    : locale === "ar"
                      ? "حدث"
                      : "Event"}
                </p>
                <h3 className="font-bold">{eventText(event, locale)}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {formatDate(event.startDate, locale)}
                  {event.endDate ? ` - ${formatDate(event.endDate, locale)}` : ""}
                </p>
                {eventDescription(event, locale) ? (
                  <p className="mt-2 text-sm leading-6">{eventDescription(event, locale)}</p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
