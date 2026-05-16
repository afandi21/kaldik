"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function HijriOffsetSelect({ initialOffset }: { initialOffset: number }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      setIsLoading(true);
      const offset = parseInt(e.target.value, 10);
      
      const response = await fetch("/api/admin/settings/hijri-offset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ offset }),
      });

      if (!response.ok) {
        throw new Error("Failed to update Hijri offset");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Gagal mengubah penyesuaian kalender Hijriah.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <select
      className="focus-ring h-9 rounded-full border border-[var(--line)] bg-white px-3 text-xs font-semibold text-[var(--ink)] outline-none disabled:opacity-50"
      defaultValue={initialOffset}
      disabled={isLoading}
      onChange={handleChange}
    >
      <option value="-2">Mundur 2 Hari (-2)</option>
      <option value="-1">Mundur 1 Hari (-1)</option>
      <option value="0">Normal (0)</option>
      <option value="1">Maju 1 Hari (+1)</option>
      <option value="2">Maju 2 Hari (+2)</option>
    </select>
  );
}
