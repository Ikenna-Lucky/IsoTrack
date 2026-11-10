"use client";

import { usePathname } from "next/navigation";
import { AuthPageLayout } from "./auth-page-layout";

export function AuthPageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mode =
    pathname === "/login" ? "signin" : pathname === "/join-fleet" ? "invitation" : "signup";
  return <AuthPageLayout mode={mode}>{children}</AuthPageLayout>;
}
