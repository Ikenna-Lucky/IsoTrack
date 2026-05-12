"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { DriverSidebar } from "@/components/dashboard/driver-sidebar";
import { DriverTopbar } from "@/components/dashboard/driver-topbar";

// ─── Page title resolver ──────────────────────────────────────────────────────

function usePageTitle(): string {
  const pathname = usePathname();
  if (pathname === "/driver") return "Overview";
  if (pathname.startsWith("/driver/deliveries")) return "Deliveries";
  if (pathname.startsWith("/driver/earnings")) return "Earnings";
  if (pathname.startsWith("/driver/settings")) return "Settings";
  if (pathname.startsWith("/driver/help"))     return "Help & Docs";
  return "Driver";
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const title = usePageTitle();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <DriverSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-[230px] flex flex-col min-h-screen">
        <DriverTopbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
