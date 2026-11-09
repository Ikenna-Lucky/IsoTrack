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

/**
 * AuthGuard — wraps each dashboard layout.
 *
 * Waits for the AuthProvider's refresh() call to finish before rendering
 * anything. This prevents child components from firing API requests while
 * getAccessToken() is still null, which caused every request to go out
 * without an Authorization header and get a 401.
 *
 * After loading:
 *  - If not authenticated → redirect to /login
 *  - If a required role is specified and the user's role doesn't match → redirect to /login
 *  - Otherwise → render children normally
 */
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

  // While the refresh call is in flight, render a full-page skeleton so
  // no child hook can fire an API request with a missing token.
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

  // After loading: if not authenticated (or wrong role), return null while
  // the router.replace() above navigates away.
  if (!isAuthenticated || (role && userRole !== role)) {
    return null;
  }

  return <>{children}</>;
}
