"use client";

import { usePathname } from "next/navigation";

// Keep the registration and invitation layouts intact while sign-in is redesigned.
export function AuthLayoutSwitch({
  children,
  signIn,
}: {
  children: React.ReactNode;
  signIn: React.ReactNode;
}) {
  return usePathname() === "/login" ? signIn : children;
}
