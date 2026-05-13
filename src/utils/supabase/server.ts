import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicEnv } from "@/lib/supabase-env";

export const createClient = async () => {
  const { url, anonKey } = getSupabasePublicEnv();

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll bisa dipanggil dari Server Component.
          // Abaikan karena refresh session ditangani middleware.
        }
      }
    }
  });
};
