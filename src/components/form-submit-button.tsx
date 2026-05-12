"use client";

import { useFormStatus } from "react-dom";
import { Save, Trash2 } from "lucide-react";

type SubmitIcon = "save" | "trash";

const icons = {
  save: Save,
  trash: Trash2
};

export function FormSubmitButton({
  className,
  disabled,
  icon,
  label,
  pendingLabel = "Menyimpan..."
}: {
  className: string;
  disabled?: boolean;
  icon?: SubmitIcon;
  label: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  const Icon = icon ? icons[icon] : null;

  return (
    <button className={className} disabled={disabled || pending} type="submit">
      {Icon ? <Icon size={15} /> : null}
      {pending ? pendingLabel : label}
    </button>
  );
}
