"use client";

import { updateAcademicYear } from "@/app/admin/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { AcademicYear } from "@/lib/types";

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

export function EditYearButton({
  year,
  disabled
}: {
  year: AcademicYear;
  disabled: boolean;
}) {
  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    const details = e.currentTarget.closest("details") as HTMLDetailsElement;
    if (details) details.removeAttribute("open");
  };

  return (
    <details className="group">
      <summary className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-bold text-white hover:bg-[var(--accent-strong)]">
        Edit
      </summary>
      <div className="mt-3 rounded-md border border-[var(--line)] bg-gray-50 p-4 space-y-3">
        <form action={updateAcademicYear} className="grid gap-3 sm:grid-cols-2">
          <input name="id" type="hidden" value={year.id} />
          <Input defaultValue={year.name} label="Nama" name="name" required />
          <Input defaultValue={year.startDate || ""} label="Mulai" name="start_date" required type="date" />
          <Input defaultValue={year.endDate || ""} label="Selesai" name="end_date" required type="date" />
          <Checkbox defaultChecked={year.isActive} label="Aktif" name="is_active" />
          <div className="flex gap-2 sm:col-span-2">
            <FormSubmitButton
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700"
              disabled={disabled}
              icon="save"
              label="Simpan"
            />
            <button
              type="button"
              onClick={handleClose}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--text)]"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </details>
  );
}
