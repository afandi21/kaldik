"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function EmailPasswordLoginForm({ nextPath = "/admin" }: { nextPath?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("afandi.ahmad21@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Login email/password gagal diproses.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <label className="block text-sm font-semibold">
        Email
        <input
          className="mt-1 w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>
      <label className="block text-sm font-semibold">
        Password
        <input
          className="mt-1 w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      <button
        className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-3 text-sm font-bold text-white hover:bg-[var(--accent-strong)] disabled:opacity-70"
        disabled={isLoading}
        type="submit"
      >
        <LogIn size={16} />
        {isLoading ? "Memproses..." : "Masuk dengan Email & Password"}
      </button>
    </form>
  );
}
