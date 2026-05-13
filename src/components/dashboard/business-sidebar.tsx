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
  ArrowRight,
  ChevronRight,
  LogOut,
  HelpCircle,
  Zap,
} from "lucide-react";
import type { Route } from "next";
import { Logo } from "@/components/shared/logo";
import { useAuthStore } from "@/store/auth";
import { useDrivers } from "@/hooks/use-driver";
import { useShipments, getShipmentList } from "@/hooks/use-shipments";
import { useBusinessAnalytics } from "@/hooks/use-business";
import { cn } from "@/lib/utils";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/business", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/business/shipments", label: "Shipments", icon: Package, badge: true },
  { href: "/business/drivers", label: "Drivers", icon: Truck },
  { href: "/business/analytics", label: "Analytics", icon: BarChart3 },
];

const BOTTOM_ITEMS = [
  { href: "/business/settings", label: "Settings", icon: Settings },
  { href: "/business/help", label: "Help", icon: HelpCircle },
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

  // Real data for sidebar counts
  const { data: shipmentsData } = useShipments({ pageSize: 200 });
  const { data: drivers = [] }  = useDrivers();
  const { data: analytics }     = useBusinessAnalytics();
  const shipments                = getShipmentList(shipmentsData);

  const pendingCount      = shipments.filter((s) => s.status === "pending" || s.status === "in_transit").length;
  const activeDriverCount = drivers.filter((d) => d.status === "available" || d.status === "on_delivery").length;
  const totalRevenue      = analytics?.totalRevenueKobo ?? 0;
  const inTransitCount    = shipments.filter((s) => s.status === "in_transit" || s.status === "out_for_delivery").length;

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
          "bg-[#09090c] border-r border-white/[0.05]",
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
      >
        {/* ── Logo ── */}
        <div className="flex h-14 shrink-0 items-center gap-3 px-5 border-b border-white/[0.04]">
          <Logo href="/business" size={26} />
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">
              Business
            </span>
          </div>
        </div>

        {/* ── Quick action ── */}
        <div className="px-4 pt-4 pb-3">
          <Link
            href={"/business/shipments/new" as Route}
            onClick={onClose}
            className="group flex items-center gap-2.5 w-full rounded-xl bg-sky-500 px-3.5 py-2.5 text-[13px] font-semibold text-white hover:bg-sky-400 active:scale-[0.98] transition-all shadow-lg shadow-sky-500/20"
          >
            <Plus className="h-4 w-4 shrink-0" />
            New Shipment
            <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-70 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* ── Main nav ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
          <p className="px-2.5 pt-1 pb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-700">
            Main Menu
          </p>

          {NAV_ITEMS.map(({ href, label, icon: Icon, exact, badge }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href as Route}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                  active
                    ? "bg-gradient-to-r from-sky-500/[0.14] to-sky-500/[0.06] text-sky-400 border border-sky-500/[0.2]"
                    : "text-zinc-500 border border-transparent hover:text-zinc-200 hover:bg-white/[0.04] hover:border-white/[0.04]",
                )}
              >
                {/* Left accent bar for active */}
                {active && (
                  <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-sky-400" />
                )}

                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors duration-150",
                    active ? "text-sky-400" : "text-zinc-700 group-hover:text-zinc-300",
                  )}
                />

                <span className="flex-1">{label}</span>

                {/* Pending badge */}
                {badge && pendingCount > 0 && !active && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500/20 px-1 text-[9px] font-bold text-sky-400">
                    {pendingCount}
                  </span>
                )}

                {active && <ChevronRight className="h-3 w-3 text-sky-400/60" />}
              </Link>
            );
          })}

          {/* ── Section: Support ── */}
          <p className="px-2.5 pt-4 pb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-700">
            Support
          </p>

          {BOTTOM_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href as Route}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium border transition-all duration-150",
                  active
                    ? "bg-gradient-to-r from-sky-500/[0.14] to-sky-500/[0.06] text-sky-400 border-sky-500/[0.2]"
                    : "text-zinc-600 border-transparent hover:text-zinc-300 hover:bg-white/[0.04] hover:border-white/[0.04]",
                )}
              >
                {active && (
                  <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-sky-400" />
                )}
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    active ? "text-sky-400" : "text-zinc-700 group-hover:text-zinc-400",
                  )}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── Fleet snapshot ── */}
        <div className="px-4 pb-3 pt-3 border-t border-white/[0.04]">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-2">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="h-3 w-3 text-sky-400" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                Fleet Snapshot
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-600">Active drivers</span>
              <span className="text-[10px] font-semibold text-emerald-400">
                {activeDriverCount} online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-600">Revenue (MTD)</span>
              <span className="text-[10px] font-semibold text-zinc-300">
                {formatNaira(totalRevenue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-600">In transit</span>
              <span className="text-[10px] font-semibold text-violet-400">
                {inTransitCount} shipments
              </span>
            </div>
          </div>
        </div>

        {/* ── User card + logout ── */}
        <div className="px-4 pb-4 border-t border-white/[0.04] pt-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.025] border border-white/[0.05] px-3 py-2.5 mb-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/30 to-teal-500/30 border border-sky-500/25 text-[11px] font-bold text-sky-300 uppercase ring-1 ring-sky-500/10 ring-offset-1 ring-offset-[#09090c]">
              {user?.name?.slice(0, 2) ?? "BU"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-zinc-200 truncate">
                {user?.name ?? "Business"}
              </p>
              <p className="text-[10px] text-zinc-600 truncate">{user?.email ?? ""}</p>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="group flex items-center gap-3 w-full rounded-xl px-3 py-2 text-[12px] font-medium text-zinc-600 border border-transparent hover:text-rose-400 hover:bg-rose-500/[0.07] hover:border-rose-500/[0.1] transition-all duration-150"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0 group-hover:text-rose-400 transition-colors" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
