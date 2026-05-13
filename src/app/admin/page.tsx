import Link from "next/link";
import { CalendarPlus, Database, Home, Plus } from "lucide-react";
import {
  createAcademicYear,
  createCategory,
  createEvent,
  deleteAcademicYear,
  deleteCategory,
  deleteEvent,
  updateCategory,
  updateEvent
} from "@/app/admin/actions";
import { EditYearButton } from "@/components/edit-year-button";
import { FormSubmitButton } from "@/components/form-submit-button";
import { UserMenu } from "@/components/user-menu";
import { requireAdmin } from "@/lib/admin";
import { getAdminData } from "@/lib/db";
import type { AcademicYear, CalendarEvent, Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string; tab?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const currentTab = (await params)?.tab ?? "years";
  
  let isServerConnected = true;
  let connectionMessage = "";
  let academicYears: AcademicYear[] = [];
  let activeYear: AcademicYear | null = null;
  let categories: Category[] = [];
  let events: CalendarEvent[] = [];

  try {
    const data = await getAdminData();
    academicYears = data.academicYears;
    activeYear = data.activeYear;
    categories = data.categories;
    events = data.events;
  } catch (error) {
    isServerConnected = false;
    connectionMessage =
      error instanceof Error ? error.message : "Gagal memuat data dari backend/database.";
  }

  const formsDisabled = !isServerConnected;

  const tabs = [
    { id: "years", label: "Pengaturan Tahun Akademik Aktif" },
    { id: "events", label: "Kelola Event" },
    { id: "categories", label: "Kelola Kategori" }
  ];

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--line)] bg-[var(--panel)] sticky top-0 z-40">
        <section className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--accent-strong)]">Dashboard Admin</p>
              <h1 className="mt-1 text-2xl font-bold">Kalender Akademik</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${
                    isServerConnected ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                <span>{isServerConnected ? "Terhubung" : "Terputus"}</span>
              </div>
              <Link
                className="focus-ring inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold"
                href="/"
              >
                <Home size={16} />
                Lihat Landing
              </Link>
              <UserMenu />
            </div>
          </div>

          <div className="flex gap-1 border-b border-[var(--line)] -mb-4 overflow-x-auto">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={`/admin?tab=${tab.id}`}
                className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition $
                  currentTab === tab.id
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-transparent text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </section>
      </header>

      <section className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        {!isServerConnected && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            Database belum tersambung: {connectionMessage}
          </div>
        )}
        {params?.error === "database" && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            Data gagal disimpan. Periksa koneksi database Supabase dan coba lagi.
          </div>
        )}

        {isServerConnected && activeYear && (
          <>
            {currentTab === "years" && (
              <>
                <FormCard title="Tahun Akademik Baru" icon={<Database size={18} />}>
                  <form action={createAcademicYear} className="space-y-3">
                    <Input label="Nama" name="name" placeholder="Tahun Akademik 2026/2027" required />
                    <Input label="Tanggal mulai" name="start_date" required type="date" />
                    <Input label="Tanggal selesai" name="end_date" required type="date" />
                    <Checkbox label="Jadikan aktif" name="is_active" />
                    <SubmitButton disabled={formsDisabled} label="Tambah Tahun" />
                  </form>
                </FormCard>
                <ManageYears disabled={formsDisabled} years={academicYears} />
              </>
            )}

            {currentTab === "events" && (
              <>
                <FormCard title="Event Baru" icon={<CalendarPlus size={18} />}>
                  <EventForm
                    academicYears={academicYears}
                    categories={categories}
                    defaultYearId={activeYear.id}
                    disabled={formsDisabled || academicYears.length === 0}
                    submitLabel="Tambah Event"
                  />
                </FormCard>
                <ManageEvents
                  academicYears={academicYears}
                  activeYear={activeYear}
                  categories={categories}
                  disabled={formsDisabled}
                  events={events}
                />
              </>
            )}

            {currentTab === "categories" && (
              <>
                <FormCard title="Kategori Baru" icon={<Plus size={18} />}>
                  <form action={createCategory} className="space-y-3">
                    <Input label="Nama Arab" name="name_ar" placeholder="اختبار" required />
                    <Input label="Nama Indonesia" name="name_id" placeholder="Ujian" required />
                    <Input label="Warna" name="color" required type="color" defaultValue="#0f766e" />
                    <SubmitButton disabled={formsDisabled} label="Tambah Kategori" />
                  </form>
                </FormCard>
                <ManageCategories categories={categories} disabled={formsDisabled} />
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function ManageYears({ disabled, years }: { disabled: boolean; years: AcademicYear[] }) {
  return (
    <section className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-4">
      <h2 className="mb-4 text-lg font-bold">Daftar Tahun Akademik</h2>
      <div className="space-y-3">
        {years.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Belum ada tahun akademik.</p>
        ) : (
          years.map((year) => (
            <YearCard key={year.id} year={year} disabled={disabled} />
          ))
        )}
      </div>
    </section>
  );
}

function YearCard({ year, disabled }: { year: AcademicYear; disabled: boolean }) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <article className="rounded-md border border-[var(--line)] bg-white p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="grid gap-4 sm:grid-cols-3 flex-1">
          <div>
            <p className="text-xs font-semibold text-[var(--muted)]">Nama</p>
            <p className="mt-1 text-sm font-medium">{year.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--muted)]">Mulai</p>
            <p className="mt-1 text-sm font-medium">{formatDate(year.startDate)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--muted)]">Selesai</p>
            <p className="mt-1 text-sm font-medium">{formatDate(year.endDate)}</p>
          </div>
          <div className="sm:col-span-3">
            <p className="text-xs font-semibold text-[var(--muted)]">Status</p>
            <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold">
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${year.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
              {year.isActive ? "Aktif" : "Tidak Aktif"}
            </p>
          </div>
        </div>
        <div className="flex gap-2 md:flex-col">
          <EditYearButton year={year} disabled={disabled} />
          <DeleteButton action={deleteAcademicYear} disabled={disabled} id={year.id} />
        </div>
      </div>
    </article>
  );
}

function ManageCategories({ categories, disabled }: { categories: Category[]; disabled: boolean }) {
  return (
    <section className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-4">
      <h2 className="mb-4 text-lg font-bold">Daftar Kategori</h2>
      <div className="grid gap-3 lg:grid-cols-2">
        {categories.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Belum ada kategori.</p>
        ) : (
          categories.map((category) => (
            <article className="rounded-md border border-[var(--line)] bg-white p-4" key={category.id}>
              <form action={updateCategory} className="grid gap-3 sm:grid-cols-2 items-end">
                <input name="id" type="hidden" value={category.id} />
                <Input defaultValue={category.nameAr} label="Nama Arab" name="name_ar" required />
                <Input defaultValue={category.nameId} label="Nama Indonesia" name="name_id" required />
                <Input defaultValue={category.color} label="Warna" name="color" required type="color" />
                <div className="flex gap-2">
                  <IconButton disabled={disabled} icon="save" label="Simpan" />
                  <DeleteButton action={deleteCategory} disabled={disabled} id={category.id} />
                </div>
              </form>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function ManageEvents({
  academicYears,
  activeYear,
  categories,
  disabled,
  events
}: {
  academicYears: AcademicYear[];
  activeYear: AcademicYear;
  categories: Category[];
  disabled: boolean;
  events: CalendarEvent[];
}) {
  return (
    <section className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-4">
      <div className="mb-4">
        <h2 className="text-lg font-bold">Event Aktif</h2>
        <p className="text-sm text-[var(--muted)]">{activeYear.name}</p>
      </div>
      <div className="space-y-3">
        {events.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Belum ada event di tahun ini.</p>
        ) : (
          events.map((event) => (
            <details className="rounded-md border border-[var(--line)] bg-white p-4 group" key={event.id}>
              <summary className="cursor-pointer text-sm font-bold flex justify-between items-center">
                <span>{event.startDate}{event.endDate ? ` - ${event.endDate}` : ""} · {event.titleId}</span>
                <span className="text-xs text-[var(--muted)]">»</span>
              </summary>
              <div className="mt-4 pt-4 border-t border-[var(--line)]">
                <EventForm
                  academicYears={academicYears}
                  categories={categories}
                  disabled={disabled}
                  event={event}
                  submitLabel="Simpan Event"
                />
                <DeleteButton action={deleteEvent} disabled={disabled} id={event.id} className="mt-3" />
              </div>
            </details>
          ))
        )}
      </div>
    </section>
  );
}

function EventForm({
  academicYears,
  categories,
  defaultYearId,
  disabled,
  event,
  submitLabel
}: {
  academicYears: AcademicYear[];
  categories: Category[];
  defaultYearId?: string;
  disabled: boolean;
  event?: CalendarEvent;
  submitLabel: string;
}) {
  return (
    <form action={event ? updateEvent : createEvent} className="grid gap-3 sm:grid-cols-2">
      {event && <input name="id" type="hidden" value={event.id} />}
      <label className="block text-sm font-semibold">
        Tahun Akademik
        <select
          className="mt-1 w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
          defaultValue={event?.academicYearId ?? defaultYearId}
          name="academic_year_id"
        >
          {academicYears.map((year) => (
            <option key={year.id} value={year.id}>
              {year.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-semibold">
        Kategori
        <select
          className="mt-1 w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
          defaultValue={event?.categoryId ?? ""}
          name="category_id"
        >
          <option value="">Tanpa kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nameId}
            </option>
          ))}
        </select>
      </label>
      <Input defaultValue={event?.titleAr ?? ""} label="Judul Arab" name="title_ar" required />
      <Input defaultValue={event?.titleId ?? ""} label="Judul Indonesia" name="title_id" required />
      <Textarea defaultValue={event?.descriptionAr ?? ""} label="Deskripsi Arab" name="description_ar" />
      <Textarea defaultValue={event?.descriptionId ?? ""} label="Deskripsi Indonesia" name="description_id" />
      <Input defaultValue={event?.startDate ?? ""} label="Tanggal mulai" name="start_date" required type="date" />
      <Input defaultValue={event?.endDate ?? ""} label="Tanggal selesai" name="end_date" type="date" />
      <Checkbox defaultChecked={event?.isImportant ?? false} label="Tampilkan di sorotan penting" name="is_important" />
      <div className="flex items-end">
        <IconButton disabled={disabled} icon="save" label={submitLabel} />
      </div>
    </form>
  );
}

function FormCard({
  children,
  icon,
  title
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[var(--accent)]">{icon}</span>
        <h2 className="font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input
        className="mt-1 w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
        {...props}
      />
    </label>
  );
}

function Textarea({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <textarea
        className="mt-1 min-h-20 w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
        {...props}
      />
    </label>
  );
}

function Checkbox({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold">
      <input type="checkbox" {...props} />
      {label}
    </label>
  );
}

function SubmitButton({ disabled, label }: { disabled?: boolean; label: string }) {
  return (
    <FormSubmitButton
      className="focus-ring inline-flex w-full justify-center rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--accent-strong)]"
      disabled={disabled}
      label={label}
    />
  );
}

function IconButton({
  disabled,
  icon,
  label
}: {
  disabled?: boolean;
  icon: "save";
  label: string;
}) {
  return (
    <FormSubmitButton
      className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-bold text-white hover:bg-[var(--accent-strong)]"
      disabled={disabled}
      icon={icon}
      label={label}
    />
  );
}

function DeleteButton({
  action,
  className,
  disabled,
  id
}: {
  action: (formData: FormData) => Promise<void>;
  className?: string;
  disabled?: boolean;
  id: string;
}) {
  return (
    <form action={action} className={className}>
      <input name="id" type="hidden" value={id} />
      <FormSubmitButton
        className="focus-ring inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
        disabled={disabled}
        icon="trash"
        label="Hapus"
        pendingLabel="Menghapus..."
      />
    </form>
  );
}
