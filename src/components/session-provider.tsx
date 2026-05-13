"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

type SessionContextValue = {
  session: Session | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) {
          setError(sessionError.message);
        }
        setSession(data.session ?? null);
      })
      .catch(() => {
        if (active) {
          setError("Gagal mengambil session.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo(
    () => ({ session, loading, error, clearError }),
    [session, loading, error, clearError]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext harus dipakai di dalam <SessionProvider />.");
  }

  return context;
}
