"use client";

import { LogIn, Settings, Home, CalendarDays, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSessionContext } from "@/components/session-provider";
import { UserMenu } from "./user-menu";
import type { LocaleMode } from "@/lib/types";

export function Navbar({ 
  locale, 
  setLocale,
  hijriOffset, 
  isAdminPage = false 
}: { 
  locale: LocaleMode; 
  setLocale?: (locale: LocaleMode) => void;
  hijriOffset: number;
  isAdminPage?: boolean;
}) {
  const router = useRouter();
  const { session } = useSessionContext();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleHijriChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      setIsUpdating(true);
      const offset = parseInt(e.target.value, 10);
      
      const response = await fetch("/api/admin/settings/hijri-offset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offset }),
      });

      if (!response.ok) throw new Error("Failed to update Hijri offset");

      // Force server components to fetch new data
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Gagal mengubah penyesuaian kalender Hijriah.");
    } finally {
      setIsUpdating(false);
    }
  };

  const isRtl = locale === "ar";
  const dir = isRtl ? "rtl" : "ltr";

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-white/95 py-3 backdrop-blur" dir={dir}>
      <div className="mx-auto flex max-w-[1480px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink)]">
            <CalendarDays size={18} />
          </div>
          <div className="hidden sm:block">
            {isAdminPage && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-0.5">Dashboard Admin</p>
            )}
            <h1 className="meta-display text-xl leading-tight text-[var(--ink)]">
              {locale === "ar" ? "التقويم الأكاديمي" : "Kalender Akademik"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Toggle (Landing Page only) */}
          {!isAdminPage && setLocale && (
            <div className="hidden sm:inline-flex rounded-full border border-[var(--line)] bg-white p-1">
              <button
                className={`focus-ring rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  locale === "ar" ? "bg-[var(--ink)] text-white" : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
                onClick={() => setLocale("ar")}
              >
                عربي
              </button>
              <button
                className={`focus-ring rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  locale === "id" ? "bg-[var(--ink)] text-white" : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
                onClick={() => setLocale("id")}
              >
                ID
              </button>
            </div>
          )}

          {/* Settings Menu (Admin Only) */}
          {session && (
            <div className="group relative">
              <button className="focus-ring flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-neutral-50">
                <Settings size={16} />
                <span className="hidden md:inline">{locale === "ar" ? "الإعدادات" : "Pengaturan"}</span>
              </button>
              
              <div className="absolute right-0 mt-2 w-64 origin-top-right scale-95 opacity-0 invisible group-hover:scale-100 group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-2xl shadow-black/5">
                  <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">
                      {locale === "ar" ? "تعديل التقويم الهجري" : "Penyesuaian Hijriah"}
                    </p>
                    <select
                      className="w-full h-11 rounded-xl border border-[var(--line)] bg-neutral-50 px-3 text-sm font-semibold text-[var(--ink)] outline-none focus:border-[var(--ink)] transition-colors cursor-pointer"
                      value={hijriOffset}
                      onChange={handleHijriChange}
                      disabled={isUpdating}
                    >
                      <option value="-2">Mundur 2 Hari (-2)</option>
                      <option value="-1">Mundur 1 Hari (-1)</option>
                      <option value="0">Normal (0)</option>
                      <option value="1">Maju 1 Hari (+1)</option>
                      <option value="2">Maju 2 Hari (+2)</option>
                    </select>
                  </div>
                  <div className="pt-4 border-t border-[var(--line)]">
                    <p className="text-[10px] leading-relaxed text-[var(--muted)]">
                      {locale === "ar" 
                        ? "سيتم تحديث التقويم فوراً بعد تغيير الإعدادات." 
                        : "Perubahan akan langsung memperbarui seluruh tampilan kalender."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isAdminPage ? (
            <>
              <Link
                className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-neutral-50"
                href="/"
              >
                <Home size={16} />
                <span className="hidden lg:inline">Lihat Landing</span>
              </Link>
              <UserMenu />
            </>
          ) : (
            <Link
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
              href="/admin"
            >
              <LogIn size={16} />
              <span>{locale === "ar" ? "دخول المدير" : "Admin"}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
