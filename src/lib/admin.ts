import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminEmail, auth } from "@/lib/auth";

export async function getCurrentSession() {
  try {
    return await auth.api.getSession({
      headers: await headers()
    });
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getCurrentSession();
  const email = session?.user?.email?.toLowerCase();

  if (email !== adminEmail) {
    redirect("/admin/login");
  }

  return session;
}
