"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Languages,
  LogIn,
  Sparkles,
  Star
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  calculateDuration,
  calendarCellsForMonth,
  eventDescription,
  eventText,
  eventTouchesDate,
  formatDate,
  formatHijri,
  formatHijriDay,
  formatMonthHeader,
  getDominantEventForDate,
  isFridayHoliday,
  monthStartsBetween,
  toIsoDate,
  weekdayLabels
} from "@/lib/dates";
import type { AcademicYear, CalendarEvent, Category, LocaleMode } from "@/lib/types";

type CalendarLandingProps = {
  academicYear: AcademicYear;
  categories: Category[];
  events: CalendarEvent[];
};

export function CalendarLanding({
  academicYear,
  categories,
  events
}: CalendarLandingProps) {
  const [locale, setLocale] = useState<LocaleMode>("ar");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const dir = locale === "ar" ? "rtl" : "ltr";
  const months = useMemo(
    () => monthStartsBetween(academicYear.startDate, academicYear.endDate),
    [academicYear.endDate, academicYear.startDate]
  );
  const firstMonth = months[0] ?? null;
  const lastMonth = months[months.length - 1] ?? null;
  const currentMonthIndex = getMonthIndex(currentDate);
  const isAtFirstMonth = firstMonth ? currentMonthIndex <= getMonthIndex(firstMonth) : false;
  const isAtLastMonth = lastMonth ? currentMonthIndex >= getMonthIndex(lastMonth) : false;
  const selectedEvents = selectedDate
    ? events.filter((event) => eventTouchesDate(event, selectedDate))
    : [];
  
  // Filter important events by current month
  const importantEvents = useMemo(() => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    return events
      .filter((event) => event.isImportant)
      .filter((event) => {
        // Check if event overlaps with current month
        const eventStart = new Date(event.startDate);
        const eventEnd = event.endDate ? new Date(event.endDate) : eventStart;
        
        // Event overlaps if:
        // 1. Event starts in this month, OR
        // 2. Event ends in this month, OR
        // 3. Event spans across this month
        return (
          (eventStart.getFullYear() === currentYear && eventStart.getMonth() === currentMonth) ||
          (eventEnd.getFullYear() === currentYear && eventEnd.getMonth() === currentMonth) ||
          (eventStart < new Date(currentYear, currentMonth + 1, 0) && 
           eventEnd > new Date(currentYear, currentMonth, 1))
        );
      })
      .slice()
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .slice(0, 5);
  }, [events, currentDate]);

  const changeMonth = (offset: number) => {
    setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() + offset, 1));
    setSelectedDate(null);
  };

  return (
    <main dir={dir} className="page-shell min-h-screen bg-white text-[var(--foreground)]">
      <section className="mx-auto flex w-full max-w-[1480px] flex-col gap-20 px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-white/95 py-3 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink)]">
                <CalendarDays size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                  {academicYear.name}
                </p>
                <h1 className="meta-display text-xl leading-tight text-[var(--ink)] sm:text-2xl">
                  {locale === "ar" ? "التقويم الأكاديمي" : "Kalender Akademik"}
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
              <div className="inline-flex w-full rounded-full border border-[var(--line)] bg-white p-1 sm:w-auto">
                <button
                  className={`focus-ring flex-1 rounded-full px-4 py-2 text-sm font-semibold sm:flex-none ${
                    locale === "ar"
                      ? "bg-[var(--ink)] text-white"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                  onClick={() => setLocale("ar")}
                  type="button"
                >
                  عربي
                </button>
                <button
                  className={`focus-ring flex-1 rounded-full px-4 py-2 text-sm font-semibold sm:flex-none ${
                    locale === "id"
                      ? "bg-[var(--ink)] text-white"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                  onClick={() => setLocale("id")}
                  type="button"
                >
                  Indonesia
                </button>
              </div>
              <Link
                className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 sm:w-auto"
                href="/admin/login"
              >
                <LogIn size={16} />
                <span>{locale === "ar" ? "دخول المدير" : "Admin"}</span>
              </Link>
            </div>
          </div>
        </header>

        <HeroShowcase academicYear={academicYear} locale={locale} />

        <section className="hidden">
          <div className="min-h-[420px] overflow-hidden rounded-[32px] border border-[var(--line)] bg-neutral-950">
            <div
              className="flex h-full min-h-[420px] flex-col justify-end bg-cover bg-center p-8 text-white sm:p-10"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(0,0,0,0.06), rgba(0,0,0,0.72)), url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80')"
              }}
            >
              <div className="max-w-2xl space-y-5">
                <span className="inline-flex w-fit rounded-full border border-white/35 px-4 py-2 text-sm font-semibold text-white">
                  {formatDate(academicYear.startDate, locale)} - {formatDate(academicYear.endDate, locale)}
                </span>
                <h2 className="meta-display text-4xl leading-[1.05] text-white sm:text-5xl lg:text-6xl">
                  {locale === "ar" ? "الأوقات المهمة للمشرفين" : "Waktu Penting Pembina"}
                </h2>
                <p className="max-w-xl text-base leading-7 text-white/85">
                  {locale === "ar"
                    ? "تقويم سريع وواضح لمعرفة الأيام المهمة والفترات الطويلة وتفاصيل كل تاريخ بدون تسجيل الدخول."
                    : "Kalender cepat dan jelas untuk melihat tanggal penting, rentang kegiatan, dan detail tiap hari tanpa login."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-[var(--line)] bg-white p-8">
            <div className="flex h-full flex-col justify-between gap-8">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase text-[var(--muted)]">
                  {locale === "ar" ? "السنة الأكاديمية النشطة" : "Tahun Akademik Aktif"}
                </p>
                <h2 className="meta-subhead text-3xl leading-tight text-[var(--ink)]">
                  {academicYear.name}
                </h2>
                <p className="text-base leading-6 text-[var(--muted)]">
                  {formatDate(academicYear.startDate, locale)} - {formatDate(academicYear.endDate, locale)}
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-full border border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--ink)]">
                <Languages size={18} />
                <span>{locale === "ar" ? "عرض عربي" : "Mode Indonesia"}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 rounded-[32px] border border-[var(--line)] bg-white p-4 sm:p-8">
            <MonthCalendar
              events={events}
              isNextDisabled={isAtLastMonth}
              isPreviousDisabled={isAtFirstMonth}
              locale={locale}
              month={currentDate}
              onNext={() => changeMonth(1)}
              onPrevious={() => changeMonth(-1)}
              onSelectDate={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>

          <aside className="space-y-8 xl:sticky xl:top-24 xl:self-start">
            <section className="rounded-[32px] border border-[var(--line)] bg-[var(--ink)] p-8 text-white">
              <div className="mb-6 flex items-center gap-3">
                <Star size={18} className="text-white" />
                <h2 className="meta-subhead text-2xl leading-tight">
                  {locale === "ar" ? "الأحداث المهمة" : "Sorotan Penting"}
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {importantEvents.map((event) => (
                  <EventSummary key={event.id} event={event} locale={locale} />
                ))}
              </div>
            </section>

            <section className="rounded-[32px] border border-[var(--line)] bg-white p-8">
              <div className="mb-6 flex items-center gap-3">
                <Sparkles size={17} className="text-[var(--ink)]" />
                <h2 className="meta-subhead text-2xl leading-tight text-[var(--ink)]">
                  {locale === "ar" ? "الفئات" : "Kategori"}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-white"
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

        <AcademicSummary events={events} locale={locale} />
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

function getMonthIndex(date: Date) {
  return date.getFullYear() * 12 + date.getMonth();
}

function HeroShowcase({
  academicYear,
  locale
}: {
  academicYear: AcademicYear;
  locale: LocaleMode;
}) {
  const activeAcademicYear = getAcademicYearLabel(academicYear.name);

  return (
    <section className="hero-band-marketing relative isolate min-h-[480px] overflow-hidden rounded-[32px] border border-[var(--line)] bg-white sm:min-h-[560px] lg:min-h-[640px]">
      <Image
        alt="Gedung kampus"
        className="object-cover"
        fill
        priority
        sizes="(min-width: 1480px) 1480px, 100vw"
        src="https://lh3.googleusercontent.com/gps-cs-s/APNQkAHbD81nIrS3q54kLpDmZPkxpJYJPYwlYEHCuxXRzRCJotHkphO2gRcxJvnraTPUdgvBHOGHJOp75W8fAzmpSnn6X6s4lTAM61x5bm9e_ScNbFa6RqtGlT7-eGU7MPfseeher-gt=s680-w680-h510-rw"
      />
      <div className="absolute inset-0 bg-[rgba(10,19,23,0.4)]" />
      <div className="relative z-10 flex min-h-[480px] flex-col justify-end p-8 text-white sm:min-h-[560px] sm:p-12 lg:min-h-[640px] lg:p-16">
        <div className="max-w-4xl space-y-6">
          <span className="inline-flex w-fit rounded-full border border-white/35 px-4 py-2 text-sm font-semibold text-white">
            {formatDate(academicYear.startDate, locale)} - {formatDate(academicYear.endDate, locale)}
          </span>
          <h2
            className="meta-display text-[clamp(3rem,8vw,4rem)] font-medium leading-[1.04] text-white"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            {locale === "ar"
              ? `العام الدراسي سنة ${activeAcademicYear}`
              : `Tahun Akademik ${activeAcademicYear}`}
          </h2>
        </div>
      </div>
    </section>
  );
}

function getAcademicYearLabel(name: string) {
  return name.match(/\d{4}\s*\/\s*\d{4}/u)?.[0].replace(/\s+/gu, "") ?? name;
}

function MonthCalendar({
  events,
  isNextDisabled,
  isPreviousDisabled,
  locale,
  month,
  onNext,
  onPrevious,
  onSelectDate,
  selectedDate
}: {
  events: CalendarEvent[];
  isNextDisabled: boolean;
  isPreviousDisabled: boolean;
  locale: LocaleMode;
  month: Date;
  onNext: () => void;
  onPrevious: () => void;
  onSelectDate: (date: string) => void;
  selectedDate: string | null;
}) {
  const cells = calendarCellsForMonth(month);
  const monthTitle = formatMonthHeader(month, cells, locale);
  const previousLabel = locale === "ar" ? "الشهر السابق" : "Bulan sebelumnya";
  const nextLabel = locale === "ar" ? "الشهر التالي" : "Bulan berikutnya";

  return (
    <section className="overflow-hidden rounded-[32px] border border-[var(--line)] bg-white p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 pb-5">
        <button
          aria-label={previousLabel}
          className="focus-ring inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--ink)] transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-35"
          disabled={isPreviousDisabled}
          onClick={onPrevious}
          title={previousLabel}
          type="button"
        >
          {locale === "ar" ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
        <h3 className="meta-display min-w-0 flex-1 truncate text-center text-base leading-tight text-[var(--ink)] sm:text-xl">
          {monthTitle}
        </h3>
        <button
          aria-label={nextLabel}
          className="focus-ring inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--ink)] transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-35"
          disabled={isNextDisabled}
          onClick={onNext}
          title={nextLabel}
          type="button"
        >
          {locale === "ar" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
      <div className="calendar-grid gap-2 bg-white sm:gap-3">
        {weekdayLabels[locale].map((day) => (
          <div
            className="truncate px-0.5 py-2 text-center text-sm font-bold text-[var(--ink)] sm:px-1 sm:text-lg"
            key={day}
            title={day}
          >
            {day}
          </div>
        ))}
      </div>
      <div className="calendar-grid mt-2 gap-2 sm:mt-3 sm:gap-3">
        {cells.map((cell) => {
          const dateIso = toIsoDate(cell);
          const dominantEvent = getDominantEventForDate(events, dateIso);
          const inMonth = cell.getMonth() === month.getMonth();

          return (
            <CalendarCell
              date={cell}
              dateIso={dateIso}
              eventColor={dominantEvent?.category?.color}
              hasEvent={Boolean(dominantEvent)}
              inMonth={inMonth}
              key={dateIso}
              onSelectDate={onSelectDate}
              selected={selectedDate === dateIso}
            />
          );
        })}
      </div>
    </section>
  );
}

function CalendarCell({
  date,
  dateIso,
  eventColor,
  hasEvent,
  inMonth,
  onSelectDate,
  selected
}: {
  date: Date;
  dateIso: string;
  eventColor?: string;
  hasEvent: boolean;
  inMonth: boolean;
  onSelectDate: (date: string) => void;
  selected: boolean;
}) {
  const isFriday = isFridayHoliday(date);
  const hasActiveEvent = hasEvent && Boolean(eventColor);

  let cellStyle = "bg-white text-[var(--foreground)] hover:bg-neutral-50";
  if (isFriday) {
    cellStyle = "bg-[#e41e3f] text-white hover:bg-[#e41e3f]";
  } else if (hasActiveEvent) {
    cellStyle = "text-white hover:brightness-95";
  } else if (!inMonth) {
    cellStyle = "bg-neutral-50 text-neutral-400 hover:bg-neutral-50";
  }

  return (
    <button
      className={`calendar-cell focus-ring rounded-2xl p-2 text-start transition sm:rounded-3xl sm:p-3 ${cellStyle} ${
        selected ? "ring-2 ring-inset ring-[var(--accent)]" : ""
      }`}
      onClick={() => onSelectDate(dateIso)}
      style={!isFriday && hasActiveEvent ? { backgroundColor: eventColor ?? "#0064e0" } : undefined}
      type="button"
    >
      <span className="flex h-full min-h-16 flex-col justify-between sm:min-h-20">
        <span className="block text-lg font-semibold leading-none sm:text-2xl">
          {date.getDate()}
        </span>
        <span
          className={`block text-[10px] font-semibold leading-none sm:text-xs ${
            isFriday || hasActiveEvent ? "text-white/85" : "text-[var(--muted)]"
          }`}
        >
          {formatHijriDay(dateIso)}
        </span>
      </span>
    </button>
  );
}

function EventSummary({ event, locale }: { event: CalendarEvent; locale: LocaleMode }) {
  return (
    <article className="rounded-xl border border-white/15 bg-white/8 p-4 transition hover:bg-white/12">
      <div className="mb-3 h-1 w-10 rounded-full" style={{ backgroundColor: event.category?.color ?? "#0064e0" }} />
      <p className="text-xs font-semibold leading-snug text-white/70">
        {formatDate(event.startDate, locale)}
        {event.endDate ? ` - ${formatDate(event.endDate, locale)}` : ""}
      </p>
      <h3 
        className="mt-3 text-sm font-semibold leading-5 text-white" 
        style={{ letterSpacing: "-0.14px" }}
      >
        {eventText(event, locale)}
      </h3>
    </article>
  );
}

type SummaryCategory = "staffHoliday" | "academicActivity" | "studentHoliday";

const summaryCategories: Array<{
  id: SummaryCategory;
  labelAr: string;
  labelId: string;
}> = [
  { id: "staffHoliday", labelAr: "إجازة الموظفين", labelId: "Libur Pegawai" },
  { id: "academicActivity", labelAr: "النشاط الأكاديمي", labelId: "Aktivitas Akademik" },
  { id: "studentHoliday", labelAr: "إجازة الطلاب", labelId: "Libur Mahasiswa" }
];

function AcademicSummary({ events, locale }: { events: CalendarEvent[]; locale: LocaleMode }) {
  const semesters = splitEventsBySemester(events);

  return (
    <section className="rounded-[32px] border border-[var(--line)] bg-white p-6 sm:p-8">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--muted)]">
            {locale === "ar" ? "ملخص التقويم" : "Ringkasan Kalender"}
          </p>
          <h2 className="meta-display mt-1 text-3xl leading-tight text-[var(--ink)]">
            {locale === "ar" ? "ملخص السنة الأكاديمية" : "Ringkasan Tahun Akademik"}
          </h2>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <SemesterSummary
          events={semesters.first}
          locale={locale}
          title={locale === "ar" ? "الفصل الدراسي الأول" : "Semester Ganjil"}
        />
        <SemesterSummary
          events={semesters.second}
          locale={locale}
          title={locale === "ar" ? "الفصل الدراسي الثاني" : "Semester Genap"}
        />
      </div>
    </section>
  );
}

function SemesterSummary({
  events,
  locale,
  title
}: {
  events: CalendarEvent[];
  locale: LocaleMode;
  title: string;
}) {
  return (
    <section className="rounded-[32px] border border-[var(--line)] bg-white p-6">
      <h3 className="meta-subhead text-2xl leading-tight text-[var(--ink)]">{title}</h3>
      <div className="mt-6 space-y-6">
        {summaryCategories.map((category) => {
          const categoryEvents = events.filter((event) => summarizeEvent(event) === category.id);
          const total = categoryEvents.reduce(
            (sum, event) => sum + calculateDuration(event.startDate, event.endDate, event.category),
            0
          );

          return (
            <section key={category.id}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-[var(--ink)]">
                  {locale === "ar" ? category.labelAr : category.labelId}
                </h4>
                <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-white">
                  {locale === "ar" ? "المجموع" : "Total"} {total}
                </span>
              </div>
              <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {categoryEvents.length === 0 ? (
                  <p className="py-3 text-sm text-[var(--muted)]">
                    {locale === "ar" ? "لا توجد بيانات." : "Belum ada data."}
                  </p>
                ) : (
                  categoryEvents.map((event) => (
                    <SummaryRow event={event} key={event.id} locale={locale} />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function SummaryRow({ event, locale }: { event: CalendarEvent; locale: LocaleMode }) {
  return (
    <article className="grid gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div>
        <p className="text-sm font-semibold text-[var(--ink)]">{eventText(event, locale)}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {formatDate(event.startDate, locale)}
          {event.endDate ? ` - ${formatDate(event.endDate, locale)}` : ""}
        </p>
      </div>
      <span className="w-fit rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold text-[var(--ink)]">
        {calculateDuration(event.startDate, event.endDate, event.category)}
      </span>
    </article>
  );
}

function splitEventsBySemester(events: CalendarEvent[]) {
  const sorted = events.slice().sort((a, b) => a.startDate.localeCompare(b.startDate));
  if (sorted.length === 0) {
    return { first: [], second: [] };
  }

  const firstDate = new Date(sorted[0].startDate);
  const lastDate = new Date(sorted[sorted.length - 1].endDate ?? sorted[sorted.length - 1].startDate);
  const midpoint = firstDate.getTime() + (lastDate.getTime() - firstDate.getTime()) / 2;

  return sorted.reduce(
    (semesters, event) => {
      const eventTime = new Date(event.startDate).getTime();
      if (eventTime <= midpoint) {
        semesters.first.push(event);
      } else {
        semesters.second.push(event);
      }
      return semesters;
    },
    { first: [] as CalendarEvent[], second: [] as CalendarEvent[] }
  );
}

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
    <div className="fixed inset-0 z-50 flex items-end bg-black/45 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <section
        className="max-h-[88vh] w-full max-w-xl overflow-auto rounded-[32px] border border-[var(--line)] bg-white p-6 sm:p-8"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="meta-display text-2xl leading-tight text-[var(--ink)]">{formatDate(date, locale)}</h2>
            <p className="mt-1 text-sm font-semibold text-[var(--muted)]">{formatHijri(date)}</p>
          </div>
          <button
            className="focus-ring rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]"
            onClick={onClose}
            type="button"
          >
            {locale === "ar" ? "إغلاق" : "Tutup"}
          </button>
        </div>

        <div className="space-y-3">
          {events.length === 0 ? (
            <p className="text-base leading-6 text-[var(--muted)]">
              {locale === "ar" ? "لا توجد أحداث في هذا التاريخ." : "Tidak ada event pada tanggal ini."}
            </p>
          ) : (
            events.map((event) => (
              <article
                className="rounded-2xl border border-[var(--line)] bg-white p-5"
                key={event.id}
              >
                <p
                  className="mb-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: event.category?.color ?? "#0064e0" }}
                >
                  {event.category
                    ? locale === "ar"
                      ? event.category.nameAr
                      : event.category.nameId
                    : locale === "ar"
                      ? "حدث"
                      : "Event"}
                </p>
                <h3 className="text-base font-semibold text-[var(--ink)]">{eventText(event, locale)}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {formatDate(event.startDate, locale)}
                  {event.endDate ? ` - ${formatDate(event.endDate, locale)}` : ""}
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
                  {calculateDuration(event.startDate, event.endDate, event.category)} hari aktif
                </p>
                {eventDescription(event, locale) ? (
                  <p className="mt-3 text-base leading-6 text-[var(--foreground)]">{eventDescription(event, locale)}</p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
