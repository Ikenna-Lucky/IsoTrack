"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Package, Search, Bell, Menu, X, LogOut } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { useAuthStore } from "@/store/auth";
import { CURRENT_CUSTOMER } from "@/lib/mock/customer";
import { cn } from "@/lib/utils";

// ─── Nav ─────────────────────────────────────────────────────────────────────

const NAV = [
  { href: "/customer", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/customer/shipments", label: "My Shipments", icon: Package },
  { href: "/customer/track", label: "Track Package", icon: Search },
];

// ─── Page title ───────────────────────────────────────────────────────────────

function usePageTitle() {
  const p = usePathname();
  if (p === "/customer") return "Overview";
  if (p.startsWith("/customer/shipments")) return "My Shipments";
  if (p.startsWith("/customer/track")) return "Track Package";
  return "Dashboard";
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const title = usePageTitle();
  const logout = useAuthStore((s) => s.logout);
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top nav bar (always visible) */}
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-white/[0.06] bg-zinc-950/90 px-4 backdrop-blur-sm">
        <Logo size="sm" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-teal-500">
          Customer
        </span>

        {/* Desktop nav links */}
        <nav className="ml-6 hidden md:flex items-center gap-1">
          {NAV.map(({ href, label, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-teal-500/10 text-teal-400"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Notification bell */}
          <button className="relative rounded-md p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200 transition-colors">
            <Bell size={17} />
            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-teal-500" />
          </button>

          {/* Avatar */}
          <div className="h-7 w-7 flex items-center justify-center rounded-full bg-teal-500/20 text-[10px] font-semibold text-teal-400">
            {CURRENT_CUSTOMER.avatar}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden rounded-md p-1.5 text-zinc-400 hover:bg-white/[0.06]"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile nav dropdown */}
      {open && (
        <div className="sticky top-14 z-10 border-b border-white/[0.06] bg-zinc-950 px-4 py-2 md:hidden">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-teal-400" : "text-zinc-400",
                )}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
          <button
            onClick={() => void logout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-rose-500/70 hover:text-rose-400 transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      )}

      {/* Page content */}
      <main className="mx-auto max-w-4xl p-4 sm:p-6">{children}</main>
    </div>
  );
}
