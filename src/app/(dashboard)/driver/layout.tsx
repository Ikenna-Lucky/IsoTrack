"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { DriverSidebar } from "@/components/dashboard/driver-sidebar";
import { DriverTopbar } from "@/components/dashboard/driver-topbar";
import { DriverBottomNav } from "@/components/dashboard/driver-bottom-nav";
import { useAuthStore } from "@/store/auth";
import { AuthGuard } from "@/components/auth/auth-guard";
import "../../landing-theme.css";

// ─── Page title resolver ──────────────────────────────────────────────────────

function usePageTitle(): string {
  const pathname = usePathname();
  if (pathname === "/driver") return "Overview";
  if (pathname.startsWith("/driver/deliveries")) return "Deliveries";
  if (pathname.startsWith("/driver/earnings")) return "Delivery record";
  if (pathname.startsWith("/driver/settings")) return "Settings";
  if (pathname.startsWith("/driver/help")) return "Help & Docs";
  return "Driver";
}

// ─── Layout ───────────────────────────────────────────────────────────────────

function DriverWorkspace({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const title = usePageTitle();
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="landing-page min-h-dvh bg-[var(--landing-canvas)] text-[var(--landing-ink)]">
      <a
        href="#driver-content"
        className="sr-only z-50 rounded-md bg-[var(--landing-panel)] p-4 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <DriverSidebar open={sidebarOpen} onClose={closeSidebar} />
      <div className="flex min-h-screen flex-col lg:ml-64">
        <DriverTopbar
          title={title}
          menuOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main
          id="driver-content"
          tabIndex={-1}
          className="min-w-0 flex-1 p-4 pb-24 sm:p-8 sm:pb-24 lg:pb-10 xl:p-10"
        >
          {children}
        </main>
      </div>
      <DriverBottomNav onMenuOpen={() => setSidebarOpen(true)} />
    </div>
  );
}

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const accountId = useAuthStore((state) => state.user?.id);
  return (
    <AuthGuard role="driver">
      <DriverWorkspace key={accountId}>{children}</DriverWorkspace>
    </AuthGuard>
  );
}
