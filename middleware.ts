import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminEmail, getSupabasePublicEnv } from "@/lib/supabase-env";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const isAdminLogin = request.nextUrl.pathname === "/admin/login";
  const response = await updateSession(request);

  if (isAdminLogin) {
    return response;
  }

  const adminEmail = getAdminEmail();
  if (!adminEmail) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("error", "admin-email-missing");
    return NextResponse.redirect(url);
  }

  try {
    const { url, anonKey } = getSupabasePublicEnv();
    const supabase = createServerClient(
      url,
      anonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          }
        }
      }
    );
    const {
      data: { user }
    } = await supabase.auth.getUser();
    const userEmail = user?.email?.toLowerCase();

    if (userEmail === adminEmail) {
      return response;
    }
  } catch {
    // Keep default redirect behavior below.
  }

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"]
};
