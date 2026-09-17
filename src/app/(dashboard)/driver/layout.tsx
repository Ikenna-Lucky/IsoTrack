"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { DriverSidebar } from "@/components/dashboard/driver-sidebar";
import { DriverTopbar } from "@/components/dashboard/driver-topbar";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ProfileCompletionBanner } from "@/components/dashboard/profile-completion-banner";
import { useDriverProfileCompletion } from "@/hooks/use-profile-completion";

// ─── Page title resolver ──────────────────────────────────────────────────────

function usePageTitle(): string {
  const pathname = usePathname();
  if (pathname === "/driver") return "Overview";
  if (pathname.startsWith("/driver/deliveries")) return "Deliveries";
  if (pathname.startsWith("/driver/earnings")) return "Earnings";
  if (pathname.startsWith("/driver/settings")) return "Settings";
  if (pathname.startsWith("/driver/help")) return "Help & Docs";
  return "Driver";
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const title = usePageTitle();
  const completion = useDriverProfileCompletion();

  return (
    <AuthGuard role="driver">
      <div className="min-h-screen bg-[#070907] text-stone-100">
        <DriverSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-h-screen flex-col lg:ml-[230px]">
          <DriverTopbar title={title} onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 pb-24 sm:p-6 lg:p-7 lg:pb-7 xl:p-8">
            <ProfileCompletionBanner completion={completion} />
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
