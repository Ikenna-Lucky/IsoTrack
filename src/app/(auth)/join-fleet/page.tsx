import { RegisterForm } from "@/components/auth/register-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join your fleet",
  description: "Accept your business invitation to join its private driver fleet.",
};

export default function JoinFleetPage() {
  return <RegisterForm invitation />;
}
