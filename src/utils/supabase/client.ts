import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/supabase-env";

export const createClient = () => {
  const { url, anonKey } = getSupabasePublicEnv();

  return createBrowserClient(url, anonKey);
};
