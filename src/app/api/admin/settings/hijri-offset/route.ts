import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { offset } = await request.json();

    if (typeof offset !== "number" || offset < -2 || offset > 2) {
      return new NextResponse("Invalid offset value", { status: 400 });
    }

    await queryDatabase(
      `insert into system_settings (key, value, updated_at) values ('HIJRI_OFFSET', $1, now()) on conflict (key) do update set value = excluded.value, updated_at = excluded.updated_at`,
      [offset.toString()]
    );

    return NextResponse.json({ success: true, offset });
  } catch (error) {
    console.error("Failed to update HIJRI_OFFSET", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
