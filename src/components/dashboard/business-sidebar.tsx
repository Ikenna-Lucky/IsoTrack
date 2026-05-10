"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Truck,
  BarChart3,
  Settings,
  Plus,
  ChevronRight,
  LogOut,
  HelpCircle,
} from "lucide-react";
import type { Route } from "next";
import { Logo } from "@/components/shared/logo";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/business", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/business/shipments", label: "Shipments", icon: Package },
  { href: "/business/drivers", label: "Drivers", icon: Truck },
  { href: "/business/analytics", label: "Analytics", icon: BarChart3 },
];

const BOTTOM_ITEMS = [
  { href: "/business/settings", label: "Settings", icon: Settings },
  { href: "/business/help", label: "Help & Docs", icon: HelpCircle },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

export function BusinessSidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-[230px] flex-col",
          "bg-[#0a0a0f] border-r border-white/[0.05]",
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
      >
        {/* ── Logo ── */}
        <div className="flex h-14 shrink-0 items-center gap-3 px-5 border-b border-white/[0.04]">
          <Logo href="/business" size={26} />
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-700">
            Business
          </span>
        </div>

        {/* ── Quick action ── */}
        <div className="px-4 pt-4 pb-2">
          <Link
            href={"/business/shipments/new" as Route}
            onClick={onClose}
            className="flex items-center gap-2 w-full rounded-xl bg-sky-500/10 border border-sky-500/20 px-3 py-2.5 text-sm font-medium text-sky-400 hover:bg-sky-500/[0.15] hover:border-sky-500/30 transition-all duration-200"
          >
            <Plus className="h-4 w-4 shrink-0" />
            New Shipment
          </Link>
        </div>

        {/* ── Main nav ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-px">
          <p className="px-2 pt-2 pb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-700">
            Navigation
          </p>
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href as Route}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-sky-500/[0.12] text-sky-400 border border-sky-500/[0.18]"
                    : "text-zinc-500 border border-transparent hover:text-zinc-200 hover:bg-white/[0.04]",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors duration-200",
                    active
                      ? "text-sky-400"
                      : "text-zinc-700 group-hover:text-zinc-300",
                  )}
                />
                <span className="flex-1">{label}</span>
                {active && (
                  <ChevronRight className="h-3 w-3 text-sky-400/50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom section ── */}
        <div className="px-3 pb-2 border-t border-white/[0.04] pt-3 space-y-px">
          {BOTTOM_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href as Route}
              onClick={onClose}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 border border-transparent hover:text-zinc-300 hover:bg-white/[0.04] transition-all duration-200"
            >
              <Icon className="h-4 w-4 shrink-0 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
              {label}
            </Link>
          ))}

          <button
            onClick={() => logout()}
            className="group flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 border border-transparent hover:text-rose-400 hover:bg-rose-500/[0.07] hover:border-rose-500/[0.1] transition-all duration-200"
          >
            <LogOut className="h-4 w-4 shrink-0 text-zinc-700 group-hover:text-rose-400 transition-colors" />
            Sign out
          </button>
        </div>

        {/* ── User card ── */}
        <div className="px-4 pb-4 pt-2 border-t border-white/[0.04]">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.05] px-3 py-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/25 to-teal-500/25 border border-sky-500/20 text-[11px] font-bold text-sky-300 uppercase">
              {user?.name?.slice(0, 2) ?? "BU"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-zinc-300 truncate">
                {user?.name ?? "Business"}
              </p>
              <p className="text-[10px] text-zinc-600 truncate">
                {user?.email ?? ""}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
