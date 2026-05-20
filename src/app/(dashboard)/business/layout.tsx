"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { BusinessSidebar } from "@/components/dashboard/business-sidebar";
import { BusinessTopbar } from "@/components/dashboard/business-topbar";
import { AuthGuard } from "@/components/auth/auth-guard";

// ─── Page title map ───────────────────────────────────────────────────────────

function usePageTitle(): string {
  const pathname = usePathname();
  if (pathname === "/business") return "Overview";
  if (pathname.startsWith("/business/shipments/new")) return "New Shipment";
  if (pathname.startsWith("/business/shipments")) return "Shipments";
  if (pathname.startsWith("/business/drivers")) return "Drivers";
  if (pathname.startsWith("/business/analytics")) return "Analytics";
  if (pathname.startsWith("/business/settings")) return "Settings";
  return "Business";
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const title = usePageTitle();

  return (
    <AuthGuard role="business">
    <div className="min-h-screen bg-[#09090b]">
      {/* Sidebar */}
      <BusinessSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content — offset by sidebar width on desktop */}
      <div className="lg:ml-[230px] flex flex-col min-h-screen">
        <BusinessTopbar
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}
