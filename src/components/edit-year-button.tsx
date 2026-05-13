"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { updateAcademicYear } from "@/app/admin/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { AcademicYear } from "@/lib/types";

function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block text-sm font-semibold text-[var(--ink)]">
      {label}
      <input
        className="mt-2 h-11 w-full rounded-lg border border-[var(--line)] bg-white px-3 text-sm outline-none transition focus:border-[var(--accent)]"
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
    <label className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
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
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    await updateAcademicYear(formData);
    detailsRef.current?.removeAttribute("open");
    router.refresh();
  };

  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    const details = e.currentTarget.closest("details") as HTMLDetailsElement;
    if (details) details.removeAttribute("open");
  };

  return (
    <details className="group" ref={detailsRef}>
      <summary className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800">
        Edit
      </summary>
      <div className="mt-4 rounded-[32px] border border-[var(--line)] bg-white p-8">
        <form action={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <input name="id" type="hidden" value={year.id} />
          <Input defaultValue={year.name} label="Nama" name="name" required />
          <Input defaultValue={year.startDate || ""} label="Mulai" name="start_date" required type="date" />
          <Input defaultValue={year.endDate || ""} label="Selesai" name="end_date" required type="date" />
          <Checkbox defaultChecked={year.isActive} label="Aktif" name="is_active" />
          <div className="flex gap-2 sm:col-span-2">
            <FormSubmitButton
              className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
              disabled={disabled}
              icon="save"
              label="Simpan"
              pendingLabel="Menyimpan..."
            />
            <button
              type="button"
              onClick={handleClose}
              className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </details>
  );
}
