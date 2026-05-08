import { redirect } from "next/navigation";
import { AdminLoginButton } from "@/components/admin-login-button";
import { getCurrentSession } from "@/lib/admin";
import { adminEmail } from "@/lib/auth";

export default async function AdminLoginPage() {
  const session = await getCurrentSession();

  if (session?.user?.email?.toLowerCase() === adminEmail) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-md rounded-md border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm">
        <p className="text-sm font-semibold text-[var(--accent-strong)]">Admin</p>
        <h1 className="mt-2 text-2xl font-bold">Masuk Kalender Akademik</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Gunakan akun Google admin untuk mengelola tahun akademik, kategori, dan event.
        </p>
        <div className="mt-6">
          <AdminLoginButton />
        </div>
        <p className="mt-4 text-xs text-[var(--muted)]">
          Admin yang diizinkan: {adminEmail}
        </p>
      </section>
    </main>
  );
}
