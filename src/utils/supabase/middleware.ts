import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabasePublicEnv } from "@/lib/supabase-env";

export const updateSession = async (request: NextRequest) => {
  let env: ReturnType<typeof getSupabasePublicEnv>;
  try {
    env = getSupabasePublicEnv();
  } catch {
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    });
  }

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  try {
    const supabase = createServerClient(env.url, env.anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

          supabaseResponse = NextResponse.next({
            request
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        }
      }
    });

    await supabase.auth.getUser();
  } catch {
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    });
  }

  return supabaseResponse;
};
