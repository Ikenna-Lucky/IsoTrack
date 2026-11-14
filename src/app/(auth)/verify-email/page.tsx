import type { Metadata } from "next";
import { AccountEmailForm } from "@/components/auth/account-email-form";
export const metadata: Metadata = {
  title: "Verify email",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default function Page() {
  return <AccountEmailForm purpose="verify" />;
}
