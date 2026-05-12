"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { CustomerSidebar } from "@/components/dashboard/customer-sidebar";
import { CustomerTopbar } from "@/components/dashboard/customer-topbar";

// ─── Page title map ───────────────────────────────────────────────────────────

function usePageTitle(): string {
  const pathname = usePathname();
  if (pathname === "/customer") return "Overview";
  if (pathname.startsWith("/customer/shipments")) return "My Shipments";
  if (pathname.startsWith("/customer/track")) return "Track Package";
  return "Customer";
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const title = usePageTitle();

  return (
    <div className="min-h-screen bg-[#09090b]">
      <CustomerSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:ml-[230px] flex flex-col min-h-screen">
        <CustomerTopbar
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
