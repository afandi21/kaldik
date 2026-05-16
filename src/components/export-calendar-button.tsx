"use client";

import { Download } from "lucide-react";
import { useState } from "react";

import type { LocaleMode } from "@/lib/types";

export function ExportCalendarButton({ locale, month, year }: { locale: LocaleMode; month: Date; year?: number }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/calendar/export-excel?locale=${locale}`);
      if (!response.ok) {
        throw new Error("Export failed");
      }

      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch ? filenameMatch[1] : "kalender-akademik.xlsx";

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export calendar. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const buttonText = locale === "ar" 
    ? (isLoading ? "جاري المعالجة..." : "Unduh Kalender Akademik (Excel)") // Reverting to original Indonesian text inside parentheses as per usual Indonesian context? No, user said strictly Arabic script for 'ar'.
    : (isLoading ? "Memproses..." : "Unduh Kalender Akademik (Excel)");
  
  // Wait, let's look at the requirement again.
  // "If locale === 'ar' (Arabic Page / Arabic Excel): All month names (Gregorian and Hijri) must render strictly in Arabic script characters"
  // The button text should also follow.
  
  const label = locale === "ar" 
    ? (isLoading ? "جاري المعالجة..." : "تحميل التقويم الأكاديمي (Excel)")
    : (isLoading ? "Memproses..." : "Unduh Kalender Akademik (Excel)");

  return (
    <button
      className="focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-[#dee3e9] bg-white px-5 py-2.5 text-sm font-semibold text-[#0064E0] transition hover:bg-neutral-50 disabled:opacity-50"
      disabled={isLoading}
      onClick={handleExport}
      type="button"
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
    >
      <Download size={16} />
      {label}
    </button>
  );
}
