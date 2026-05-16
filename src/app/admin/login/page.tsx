import { redirect } from "next/navigation";
import { LogIn } from "lucide-react";
import { EmailPasswordLoginForm } from "@/components/email-password-login-form";
import { getCurrentSession } from "@/lib/admin";
import { getAdminEmail } from "@/lib/supabase-env";

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string; next?: string }>;
}) {
  const adminEmail = getAdminEmail();
  const session = await getCurrentSession();
  const params = await searchParams;
  const errorMessage = params?.error;

  if (session?.user?.email?.toLowerCase() === adminEmail) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 bg-white">
      <section
        className="w-full max-w-md rounded-[32px] border border-[rgba(0,0,0,0.06)] bg-white/60 backdrop-blur-md p-8 shadow-lg"
        style={{ fontFamily: 'Poppins, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial', letterSpacing: '-0.16px' }}
      >
        <div className="flex justify-center">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Logo_STAI_As_-_Sunnah.png/960px-Logo_STAI_As_-_Sunnah.png"
            alt="STAI As-Sunnah logo"
            className="w-24 h-24 object-contain"
          />
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm font-semibold text-[var(--accent-strong)]">Admin</p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--text)]">Masuk Kalender Akademik</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Masuk dengan email/password untuk mengelola tahun akademik, kategori, dan event.
          </p>
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-6 space-y-3">
          <EmailPasswordLoginForm nextPath={params?.next ?? "/admin"} />
        </div>
      </section>
    </main>
  );
}
