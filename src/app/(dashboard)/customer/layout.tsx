"use client";
import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { CustomerSidebar } from "@/components/dashboard/customer-sidebar";
import { CustomerTopbar } from "@/components/dashboard/customer-topbar";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuthStore } from "@/store/auth";
import "../../landing-theme.css";
function CustomerWorkspace({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const path = usePathname();
  const title = path.startsWith("/customer/shipments")
    ? "My shipments"
    : path.startsWith("/customer/track")
      ? "Track a package"
      : path.startsWith("/customer/settings")
        ? "Settings"
        : "Overview";
  return (
    <div className="landing-page min-h-dvh bg-[var(--landing-canvas)] text-[var(--landing-ink)]">
      <a
        href="#customer-content"
        className="sr-only z-50 rounded-md bg-[var(--landing-panel)] p-4 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <CustomerSidebar open={open} onClose={close} />
      <div className="min-w-0 lg:ml-64">
        <CustomerTopbar title={title} menuOpen={open} onMenuClick={() => setOpen(true)} />
        <main
          id="customer-content"
          tabIndex={-1}
          className="min-h-[calc(100dvh-5rem)] p-4 outline-none sm:p-8 xl:p-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const id = useAuthStore((state) => state.user?.id);
  return (
    <AuthGuard role="customer">
      <CustomerWorkspace key={id}>{children}</CustomerWorkspace>
    </AuthGuard>
  );
}
