"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { BusinessSidebar } from "@/components/dashboard/business-sidebar";
import { BusinessTopbar } from "@/components/dashboard/business-topbar";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ProfileCompletionBanner } from "@/components/dashboard/profile-completion-banner";
import { useBusinessProfileCompletion } from "@/hooks/use-profile-completion";
import { useAuthStore } from "@/store/auth";
import "../../landing-theme.css";

function BusinessWorkspace({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const pathname = usePathname();
  const completion = useBusinessProfileCompletion();
  const isOverview = pathname === "/business" || pathname === "/business/drivers";
  const title =
    pathname === "/business"
      ? "Overview"
      : pathname.startsWith("/business/shipments/new")
        ? "New shipment"
        : pathname.startsWith("/business/shipments")
          ? "Shipments"
          : pathname.startsWith("/business/drivers")
            ? "Private fleet"
            : pathname.startsWith("/business/analytics")
              ? "Analytics"
              : pathname.startsWith("/business/settings")
                ? "Settings"
                : "Help";
  return (
    <div className="landing-page min-h-dvh bg-[var(--landing-canvas)] text-[var(--landing-ink)]">
      <a
        href="#business-content"
        className="sr-only z-50 rounded-md bg-[var(--landing-panel)] p-4 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <BusinessSidebar open={sidebarOpen} onClose={closeSidebar} />
      <div className="min-w-0 lg:ml-64">
        <BusinessTopbar
          title={title}
          menuOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main
          id="business-content"
          tabIndex={-1}
          className={`min-h-[calc(100dvh-5rem)] p-4 outline-none sm:p-8 xl:p-10 ${isOverview ? "" : "bg-[#070907] text-stone-100 [&_.text-stone-50]:text-stone-50! [&_.text-teal-100]:text-teal-100!"}`}
        >
          {!isOverview && <ProfileCompletionBanner completion={completion} />}
          {children}
        </main>
      </div>
    </div>
  );
}

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const accountId = useAuthStore((state) => state.user?.id);
  return (
    <AuthGuard role="business">
      <BusinessWorkspace key={accountId}>{children}</BusinessWorkspace>
    </AuthGuard>
  );
}
