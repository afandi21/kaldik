import "server-only";
import { redirect } from "next/navigation";
import { getAdminEmail } from "@/lib/supabase-env";
import { createClient } from "@/utils/supabase/server";

export async function getCurrentSession() {
  const adminEmail = getAdminEmail();
  if (!adminEmail) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user?.email || user.email.toLowerCase() !== adminEmail) {
      return null;
    }
    return { user: { email: user.email } };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getCurrentSession();
  const adminEmail = getAdminEmail();
  const email = session?.user?.email?.toLowerCase();

  if (!adminEmail || email !== adminEmail) {
    redirect("/admin/login");
  }

  return session;
}
