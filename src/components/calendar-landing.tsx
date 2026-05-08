"use client";

import {
  CalendarDays,
  CircleAlert,
  Languages,
  LogIn,
  Sparkles,
  Star
} from "lucide-react";
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
    <main dir={dir} className="page-shell min-h-screen">
      <section className="mx-auto flex w-full max-w-[1480px] flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-5 sm:py-4 lg:px-8">
        <header className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--accent-strong)]">
                <CalendarDays size={18} />
                <span>{locale === "ar" ? "التقويم الأكاديمي" : "Kalender Akademik"}</span>
              </div>
              <div className="flex flex-col gap-2 xl:flex-row xl:items-end">
                <h1 className="text-[1.65rem] font-black leading-tight tracking-normal text-[var(--ink)] sm:text-4xl">
                  {locale === "ar" ? "الأوقات المهمة للمشرفين" : "Waktu Penting Pembina"}
                </h1>
                <span className="w-fit rounded bg-teal-50 px-2.5 py-1 text-xs font-bold text-[var(--accent-strong)]">
                  {academicYear.name}
                </span>
              </div>
              <p className="max-w-3xl text-sm leading-6 text-[var(--muted)]">
                {locale === "ar"
                  ? "تقويم سريع وواضح لمعرفة الأيام المهمة، الفترات الطويلة، وتفاصيل كل تاريخ بدون تسجيل الدخول."
                  : "Kalender cepat dan jelas untuk melihat tanggal penting, rentang kegiatan, dan detail tiap hari tanpa login."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
              <div className="inline-flex w-full rounded-md border border-[var(--line)] bg-white p-1 shadow-sm sm:w-auto">
              <button
                className={`focus-ring flex-1 rounded px-3 py-2 text-sm font-semibold sm:flex-none ${
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
                className={`focus-ring flex-1 rounded px-3 py-2 text-sm font-semibold sm:flex-none ${
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
                className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--ink)] px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--accent-strong)] sm:w-auto"
                href="/admin/login"
              >
                <LogIn size={16} />
                <span>{locale === "ar" ? "دخول المدير" : "Admin"}</span>
              </Link>
            </div>
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

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 rounded-md border border-[var(--line)] bg-[var(--panel)] p-2 shadow-sm sm:p-4">
            <div className="mb-4 flex flex-col gap-3 border-b border-[var(--line)] pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-[var(--ink)]">
                  {locale === "ar" ? "السنة الأكاديمية النشطة" : "Tahun Akademik Aktif"}
                </h2>
                <p className="mt-1 text-sm font-medium text-[var(--muted)]">
                  {formatDate(academicYear.startDate, locale)} -{" "}
                  {formatDate(academicYear.endDate, locale)}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-teal-50 px-3 py-2 text-sm font-bold text-[var(--accent-strong)]">
                <Languages size={18} />
                <span>{locale === "ar" ? "عرض عربي" : "Mode Indonesia"}</span>
              </div>
            </div>
            <div className="grid gap-3 lg:grid-cols-2 2xl:gap-4">
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

          <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
            <section className="rounded-md border border-[var(--line)] bg-[var(--ink)] p-3 text-white shadow-sm sm:p-4">
              <div className="mb-4 flex items-center gap-2">
                <Star size={18} className="text-amber-300" />
                <h2 className="font-black">
                  {locale === "ar" ? "الأحداث المهمة" : "Sorotan Penting"}
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {importantEvents.map((event) => (
                  <EventSummary key={event.id} event={event} locale={locale} />
                ))}
              </div>
            </section>

            <section className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-3 shadow-sm sm:p-4">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles size={17} className="text-[var(--gold)]" />
                <h2 className="font-black">
                {locale === "ar" ? "الفئات" : "Kategori"}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span
                    className="rounded px-2 py-1 text-xs font-bold text-white"
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
    <section className="overflow-hidden rounded-md border border-[var(--line)] bg-white shadow-sm">
      <div className="border-b border-[var(--line)] bg-[var(--ink)] px-2.5 py-2 text-white sm:px-3">
        <h3 className="text-xs font-black sm:text-sm">{formatMonth(month, locale)}</h3>
      </div>
      <div className="calendar-grid border-b border-[var(--line)] bg-stone-100">
        {weekdayLabels[locale].map((day) => (
          <div
            className="truncate px-0.5 py-2 text-center text-[10px] font-black text-[var(--muted)] sm:px-1 sm:text-xs"
            key={day}
            title={day}
          >
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
              className={`calendar-cell focus-ring border-b border-e border-[var(--line)] p-1.5 text-start transition hover:bg-teal-50 sm:p-2 ${
                inMonth ? "bg-white text-[var(--foreground)]" : "bg-stone-50 text-stone-400"
              } ${selectedDate === dateIso ? "ring-2 ring-inset ring-[var(--accent)]" : ""}`}
              key={dateIso}
              onClick={() => onSelectDate(dateIso)}
              type="button"
            >
              <span className="block text-base font-black leading-none sm:text-xl">
                {cell.getDate()}
              </span>
              <span className="mt-1 block min-h-3 truncate text-[9px] font-semibold leading-none text-stone-400 sm:text-[10px]">
                {formatHijri(dateIso)}
              </span>
              <span className="mt-2 flex flex-col gap-1 sm:mt-2">
                {dayEvents.slice(0, 2).map((event) => (
                  <span
                    className="h-1.5 rounded-full px-0 py-0 text-[0px] font-bold text-white shadow-sm sm:h-auto sm:truncate sm:rounded-sm sm:px-1.5 sm:py-1 sm:text-[10px]"
                    key={event.id}
                    style={{ backgroundColor: event.category?.color ?? "#0f766e" }}
                  >
                    {eventText(event, locale)}
                  </span>
                ))}
                {dayEvents.length > 2 ? (
                  <span className="text-[9px] font-bold text-[var(--muted)] sm:text-[10px]">
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
    <article className="rounded-md bg-white/10 p-3 ring-1 ring-white/10">
      <div className="mb-2 h-1.5 w-12 rounded-full" style={{ backgroundColor: event.category?.color ?? "#0f766e" }} />
      <p className="text-xs font-bold text-white/70">
        {formatDate(event.startDate, locale)}
        {event.endDate ? ` - ${formatDate(event.endDate, locale)}` : ""}
      </p>
      <h3 className="mt-1 text-sm font-black leading-5 text-white">{eventText(event, locale)}</h3>
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
    <div className="fixed inset-0 z-50 flex items-end bg-black/40 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <section
        className="max-h-[88vh] w-full max-w-xl overflow-auto rounded-md border border-[var(--line)] bg-[var(--panel)] p-3 shadow-2xl sm:p-4"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[var(--ink)]">{formatDate(date, locale)}</h2>
            <p className="text-sm font-semibold text-[var(--muted)]">{formatHijri(date)}</p>
          </div>
          <button
            className="focus-ring rounded-md border border-[var(--line)] bg-white px-3 py-1.5 text-sm font-bold"
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
                className="rounded-md border border-[var(--line)] bg-white p-4 shadow-sm"
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
