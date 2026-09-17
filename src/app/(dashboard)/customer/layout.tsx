"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { CustomerSidebar } from "@/components/dashboard/customer-sidebar";
import { CustomerTopbar } from "@/components/dashboard/customer-topbar";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ProfileCompletionBanner } from "@/components/dashboard/profile-completion-banner";
import { useCustomerProfileCompletion } from "@/hooks/use-profile-completion";

// ─── Page title map ───────────────────────────────────────────────────────────

function usePageTitle(): string {
  const pathname = usePathname();
  if (pathname === "/customer") return "Overview";
  if (pathname.startsWith("/customer/shipments")) return "My Shipments";
  if (pathname.startsWith("/customer/track")) return "Track Package";
  if (pathname.startsWith("/customer/settings")) return "Settings";
  return "Customer";
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const title = usePageTitle();
  const completion = useCustomerProfileCompletion();

  return (
    <AuthGuard role="customer">
    <div className="min-h-screen bg-[#070907]">
      <CustomerSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-screen flex-col lg:ml-[230px]">
        <CustomerTopbar
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-7 xl:p-8">
          <ProfileCompletionBanner completion={completion} />
          {children}
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}
