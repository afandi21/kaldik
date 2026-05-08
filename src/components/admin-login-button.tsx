"use client";

import { LogIn } from "lucide-react";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient();

export function AdminLoginButton() {
  return (
    <button
      className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-3 text-sm font-bold text-white hover:bg-[var(--accent-strong)]"
      onClick={() =>
        authClient.signIn.social({
          provider: "google",
          callbackURL: "/admin"
        })
      }
      type="button"
    >
      <LogIn size={18} />
      Masuk dengan Google
    </button>
  );
}
