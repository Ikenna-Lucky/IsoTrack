"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth";

// Restore in-memory auth from the HttpOnly refresh cookie after a page reload.
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
