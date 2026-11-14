"use client";

import { usePathname } from "next/navigation";
import { AuthPageLayout } from "./auth-page-layout";

export function AuthPageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mode = ["/login", "/forgot-password", "/reset-password", "/verify-email"].includes(pathname)
    ? "signin"
    : pathname === "/join-fleet"
      ? "invitation"
      : "signup";
  return <AuthPageLayout mode={mode}>{children}</AuthPageLayout>;
}
