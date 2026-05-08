import { CalendarLanding } from "@/components/calendar-landing";
import { getCalendarData } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getCalendarData();

  return <CalendarLanding {...data} />;
}
