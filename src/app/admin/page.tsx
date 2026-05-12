import Link from "next/link";
import { CalendarPlus, Database, Home, Plus } from "lucide-react";
import {
  createAcademicYear,
  createCategory,
  createEvent,
  deleteAcademicYear,
  deleteCategory,
  deleteEvent,
  updateAcademicYear,
  updateCategory,
  updateEvent
} from "@/app/admin/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { requireAdmin } from "@/lib/admin";
import { getAdminData } from "@/lib/db";
import type { AcademicYear, CalendarEvent, Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const { academicYears, activeYear, categories, events, usingSampleData } =
    await getAdminData();
  const formsDisabled = usingSampleData;

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="flex flex-col gap-3 border-b border-[var(--line)] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--accent-strong)]">Dashboard Admin</p>
            <h1 className="mt-1 text-3xl font-bold">Kelola Kalender Akademik</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Tambah, edit, dan hapus tahun akademik, kategori, serta event bilingual.
            </p>
          </div>
          <Link
            className="focus-ring inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm font-semibold"
            href="/"
          >
            <Home size={16} />
            Lihat Landing
          </Link>
        </header>

        {usingSampleData ? (
          <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Database belum tersambung. Form admin membutuhkan `DATABASE_URL` dan tabel Supabase
            sesuai `supabase/schema.sql`.
          </div>
        ) : null}
        {params?.error === "database" ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            Data gagal disimpan. Periksa koneksi database Supabase dan coba lagi.
          </div>
        ) : null}

        <section className="grid gap-5 lg:grid-cols-3">
          <FormCard title="Tahun Akademik Baru" icon={<Database size={18} />}>
            <form action={createAcademicYear} className="space-y-3">
              <Input label="Nama" name="name" placeholder="Tahun Akademik 2026/2027" required />
              <Input label="Tanggal mulai" name="start_date" required type="date" />
              <Input label="Tanggal selesai" name="end_date" required type="date" />
              <Checkbox label="Jadikan aktif" name="is_active" />
              <SubmitButton disabled={formsDisabled} label="Tambah Tahun" />
            </form>
          </FormCard>

          <FormCard title="Kategori Baru" icon={<Plus size={18} />}>
            <form action={createCategory} className="space-y-3">
              <Input label="Nama Arab" name="name_ar" placeholder="اختبار" required />
              <Input label="Nama Indonesia" name="name_id" placeholder="Ujian" required />
              <Input label="Warna" name="color" required type="color" defaultValue="#0f766e" />
              <SubmitButton disabled={formsDisabled} label="Tambah Kategori" />
            </form>
          </FormCard>

          <FormCard title="Event Baru" icon={<CalendarPlus size={18} />}>
            <EventForm
              academicYears={academicYears}
              categories={categories}
              defaultYearId={activeYear.id}
              disabled={formsDisabled || academicYears.length === 0}
              submitLabel="Tambah Event"
            />
          </FormCard>
        </section>

        <ManageYears disabled={formsDisabled} years={academicYears} />
        <ManageCategories categories={categories} disabled={formsDisabled} />
        <ManageEvents
          academicYears={academicYears}
          activeYear={activeYear}
          categories={categories}
          disabled={formsDisabled}
          events={events}
        />
      </section>
    </main>
  );
}

function ManageYears({ disabled, years }: { disabled: boolean; years: AcademicYear[] }) {
  return (
    <section className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-4">
      <h2 className="mb-4 text-lg font-bold">Kelola Tahun Akademik</h2>
      <div className="grid gap-3 lg:grid-cols-2">
        {years.map((year) => (
          <article className="rounded-md border border-[var(--line)] bg-white p-3" key={year.id}>
            <form action={updateAcademicYear} className="grid gap-3 md:grid-cols-2">
              <input name="id" type="hidden" value={year.id} />
              <Input defaultValue={year.name} label="Nama" name="name" required />
              <Input defaultValue={year.startDate} label="Mulai" name="start_date" required type="date" />
              <Input defaultValue={year.endDate} label="Selesai" name="end_date" required type="date" />
              <Checkbox defaultChecked={year.isActive} label="Aktif" name="is_active" />
              <div className="flex gap-2 md:col-span-2">
                <IconButton disabled={disabled} icon="save" label="Simpan" />
              </div>
            </form>
            <form action={deleteAcademicYear} className="mt-2">
              <input name="id" type="hidden" value={year.id} />
              <DangerButton disabled={disabled} label="Hapus Tahun" />
            </form>
          </article>
        ))}
      </div>
    </section>
  );
}

function ManageCategories({ categories, disabled }: { categories: Category[]; disabled: boolean }) {
  return (
    <section className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-4">
      <h2 className="mb-4 text-lg font-bold">Kelola Kategori</h2>
      <div className="grid gap-3 lg:grid-cols-2">
        {categories.map((category) => (
          <article className="rounded-md border border-[var(--line)] bg-white p-3" key={category.id}>
            <form action={updateCategory} className="grid gap-3 md:grid-cols-2">
              <input name="id" type="hidden" value={category.id} />
              <Input defaultValue={category.nameAr} label="Nama Arab" name="name_ar" required />
              <Input defaultValue={category.nameId} label="Nama Indonesia" name="name_id" required />
              <Input defaultValue={category.color} label="Warna" name="color" required type="color" />
              <div className="flex items-end">
                <IconButton disabled={disabled} icon="save" label="Simpan" />
              </div>
            </form>
            <form action={deleteCategory} className="mt-2">
              <input name="id" type="hidden" value={category.id} />
              <DangerButton disabled={disabled} label="Hapus Kategori" />
            </form>
          </article>
        ))}
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
        <h2 className="text-lg font-bold">Kelola Event Aktif</h2>
        <p className="text-sm text-[var(--muted)]">{activeYear.name}</p>
      </div>
      <div className="grid gap-3">
        {events.map((event) => (
          <details className="rounded-md border border-[var(--line)] bg-white p-3" key={event.id}>
            <summary className="cursor-pointer text-sm font-bold">
              {event.startDate}
              {event.endDate ? ` - ${event.endDate}` : ""} · {event.titleId}
            </summary>
            <div className="mt-4">
              <EventForm
                academicYears={academicYears}
                categories={categories}
                disabled={disabled}
                event={event}
                submitLabel="Simpan Event"
              />
              <form action={deleteEvent} className="mt-2">
                <input name="id" type="hidden" value={event.id} />
                <DangerButton disabled={disabled} label="Hapus Event" />
              </form>
            </div>
          </details>
        ))}
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
    <form action={event ? updateEvent : createEvent} className="grid gap-3 md:grid-cols-2">
      {event ? <input name="id" type="hidden" value={event.id} /> : null}
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
      <Input defaultValue={event?.titleAr} label="Judul Arab" name="title_ar" required />
      <Input defaultValue={event?.titleId} label="Judul Indonesia" name="title_id" required />
      <Textarea defaultValue={event?.descriptionAr ?? ""} label="Deskripsi Arab" name="description_ar" />
      <Textarea
        defaultValue={event?.descriptionId ?? ""}
        label="Deskripsi Indonesia"
        name="description_id"
      />
      <Input defaultValue={event?.startDate} label="Tanggal mulai" name="start_date" required type="date" />
      <Input defaultValue={event?.endDate ?? ""} label="Tanggal selesai" name="end_date" type="date" />
      <Checkbox defaultChecked={event?.isImportant} label="Tampilkan di sorotan penting" name="is_important" />
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

function DangerButton({ disabled, label }: { disabled?: boolean; label: string }) {
  return (
    <FormSubmitButton
      className="focus-ring inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700"
      disabled={disabled}
      icon="trash"
      label={label}
      pendingLabel="Menghapus..."
    />
  );
}
