"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth";

/**
 * AuthProvider — mounts once at the root layout.
 *
 * On every page load it tries POST /auth/refresh (sends the httpOnly refresh
 * cookie automatically). If that succeeds we restore the user session in
 * Zustand memory; if it fails the user is treated as logged out.
 *
 * This is the only place session bootstrapping happens — no localStorage,
 * no SSR reads, just the httpOnly cookie exchange.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const refresh = useAuthStore((s) => s.refresh);
  const setLoading = useAuthStore((s) => s.setLoading);
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh, setLoading]);

  return <>{children}</>;
}
