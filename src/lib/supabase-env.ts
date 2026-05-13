export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase env belum lengkap. Wajib isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY (atau NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)."
    );
  }

  return { url, anonKey };
}

export function getAdminEmail() {
  return process.env.ADMIN_EMAIL?.toLowerCase() ?? "";
}
