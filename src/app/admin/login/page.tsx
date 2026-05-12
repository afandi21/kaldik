import { redirect } from "next/navigation";
import { LogIn } from "lucide-react";
import { loginAdmin } from "@/app/admin/login/actions";
import { getCurrentSession } from "@/lib/admin";
import { adminEmail } from "@/lib/auth";

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await getCurrentSession();
  const params = await searchParams;
  const hasError = params?.error === "invalid-credentials";

  if (session?.user?.email?.toLowerCase() === adminEmail) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-md rounded-md border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm">
        <p className="text-sm font-semibold text-[var(--accent-strong)]">Admin</p>
        <h1 className="mt-2 text-2xl font-bold">Masuk Kalender Akademik</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Masuk dengan email dan password admin untuk mengelola tahun akademik, kategori, dan event.
        </p>
        {hasError ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            Email atau password salah.
          </p>
        ) : null}
        <form action={loginAdmin} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold">
            Email
            <input
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
              defaultValue={adminEmail}
              name="email"
              required
              type="email"
            />
          </label>
          <label className="block text-sm font-semibold">
            Password
            <input
              autoComplete="current-password"
              className="mt-1 w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
              name="password"
              required
              type="password"
            />
          </label>
          <button
            className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-3 text-sm font-bold text-white hover:bg-[var(--accent-strong)]"
            type="submit"
          >
            <LogIn size={18} />
            Masuk
          </button>
        </form>
        <p className="mt-4 text-xs text-[var(--muted)]">
          Admin yang diizinkan: {adminEmail}
        </p>
      </section>
    </main>
  );
}
