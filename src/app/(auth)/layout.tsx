import type { Metadata } from "next";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import "../landing-theme.css";

export const metadata: Metadata = {
  title: { default: "IsoTrack", template: "%s | IsoTrack" },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthPageShell>{children}</AuthPageShell>;
}
