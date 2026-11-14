import type { Metadata } from "next";
import { AccountEmailForm } from "@/components/auth/account-email-form";
export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default function Page() {
  return <AccountEmailForm purpose="forgot" />;
}
