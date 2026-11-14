"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import type { UserRole } from "@/types";
import { roleRoutes } from "@/lib/auth-routing";
import type { Route } from "next";

interface Props {
  role?: UserRole;
  children: React.ReactNode;
}

// Wait for session restoration before mounting dashboard hooks.
export function AuthGuard({ role, children }: Props) {
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userRole = useAuthStore((s) => s.user?.role);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (role && userRole !== role) {
      router.replace((userRole ? roleRoutes[userRole] : "/login") as Route);
    }
  }, [isLoading, isAuthenticated, userRole, role, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-sky-500/30 border-t-sky-500 animate-spin" />
          <p className="text-xs text-zinc-600">Loading session…</p>
        </div>
      </div>
    );
  }

  // Keep protected components unmounted while the redirect runs.
  if (!isAuthenticated || (role && userRole !== role)) {
    return null;
  }

  return <>{children}</>;
}
