import { CalendarLanding } from "@/components/calendar-landing";
import { getCalendarData } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  let data: Awaited<ReturnType<typeof getCalendarData>> | null = null;
  let errorMessage = "";

  try {
    data = await getCalendarData();
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Gagal memuat data dari server dan database.";
  }

  if (!data) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4">
        <section className="w-full rounded-md border border-red-200 bg-red-50 p-5 text-red-800">
          <h1 className="text-lg font-bold">Koneksi server/database terputus</h1>
          <p className="mt-2 text-sm">{errorMessage}</p>
        </section>
      </main>
    );
  }

  return <CalendarLanding {...data} />;
}
