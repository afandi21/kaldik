"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useSessionContext } from "@/components/session-provider";

export function UserMenu() {
  const router = useRouter();
  const { session } = useSessionContext();
  const [isLoading, setIsLoading] = useState(false);

  if (!session?.user) {
    return null;
  }

  async function handleSignOut() {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        router.push(`/admin/login?error=${encodeURIComponent(error.message)}`);
        return;
      }
      router.push("/admin/login");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-[var(--muted)]">{session.user.email}</span>
      <button
        className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-neutral-50"
        disabled={isLoading}
        onClick={handleSignOut}
        type="button"
      >
        <LogOut size={16} />
        {isLoading ? "Keluar..." : "Keluar"}
      </button>
    </div>
  );
}
