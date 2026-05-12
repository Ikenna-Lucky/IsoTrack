"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  DollarSign,
  LogOut,
  HelpCircle,
  Settings,
  ChevronRight,
  Zap,
  Star,
  TrendingUp,
  Bike,
} from "lucide-react";
import type { Route } from "next";
import { Logo } from "@/components/shared/logo";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import { CURRENT_DRIVER, DAILY_EARNINGS, formatNaira } from "@/lib/mock/driver";

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/driver",           label: "Overview",   icon: LayoutDashboard, exact: true },
  { href: "/driver/deliveries",label: "Deliveries", icon: Package                      },
  { href: "/driver/earnings",  label: "Earnings",   icon: DollarSign                   },
];

const BOTTOM_ITEMS = [
  { href: "/driver/settings", label: "Settings",   icon: Settings   },
  { href: "/driver/help",     label: "Help & Docs", icon: HelpCircle },
];

// ─── Derived stats ────────────────────────────────────────────────────────────

const todayStats  = DAILY_EARNINGS[DAILY_EARNINGS.length - 1]!;
const weekEarnings = DAILY_EARNINGS.reduce((s, d) => s + d.earning, 0);

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

export function DriverSidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const logout   = useAuthStore((s) => s.logout);

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
          "bg-[#09090c] border-r border-white/[0.05]",
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
      >
        {/* ── Logo ── */}
        <div className="flex h-14 shrink-0 items-center gap-3 px-5 border-b border-white/[0.04]">
          <Logo href="/driver" size={26} />
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-teal-600">
              Driver
            </span>
          </div>
        </div>

        {/* ── Online status pill ── */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-teal-500/20 bg-teal-500/[0.07] px-3.5 py-2.5">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
            </span>
            <span className="text-[13px] font-semibold text-teal-300">Online</span>
            <span className="ml-auto text-[10px] text-teal-600 font-medium">Available</span>
          </div>
        </div>

        {/* ── Main nav ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
          <p className="px-2.5 pt-1 pb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-700">
            Main Menu
          </p>

          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href as Route}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                  active
                    ? "bg-gradient-to-r from-teal-500/[0.14] to-teal-500/[0.06] text-teal-400 border border-teal-500/[0.2]"
                    : "text-zinc-500 border border-transparent hover:text-zinc-200 hover:bg-white/[0.04] hover:border-white/[0.04]",
                )}
              >
                {/* Left accent bar */}
                {active && (
                  <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-teal-400" />
                )}

                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors duration-150",
                    active
                      ? "text-teal-400"
                      : "text-zinc-700 group-hover:text-zinc-300",
                  )}
                />

                <span className="flex-1">{label}</span>

                {active && (
                  <ChevronRight className="h-3 w-3 text-teal-400/60" />
                )}
              </Link>
            );
          })}

          {/* ── Support section ── */}
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
                    ? "bg-gradient-to-r from-teal-500/[0.14] to-teal-500/[0.06] text-teal-400 border-teal-500/[0.2]"
                    : "text-zinc-600 border-transparent hover:text-zinc-300 hover:bg-white/[0.04] hover:border-white/[0.04]",
                )}
              >
                {active && (
                  <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-teal-400" />
                )}
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    active ? "text-teal-400" : "text-zinc-700 group-hover:text-zinc-400",
                  )}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── Today at a glance ── */}
        <div className="px-4 pb-3 pt-3 border-t border-white/[0.04]">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-2">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="h-3 w-3 text-teal-400" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                Today at a Glance
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-zinc-700" />
                <span className="text-[10px] text-zinc-600">Earnings</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400">
                {formatNaira(todayStats.earning)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Package className="h-3 w-3 text-zinc-700" />
                <span className="text-[10px] text-zinc-600">Deliveries</span>
              </div>
              <span className="text-[10px] font-semibold text-teal-400">
                {todayStats.deliveries} trips
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Star className="h-3 w-3 text-zinc-700" />
                <span className="text-[10px] text-zinc-600">Rating</span>
              </div>
              <span className="text-[10px] font-semibold text-amber-400">
                ★ {CURRENT_DRIVER.rating}
              </span>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-white/[0.04] flex items-center justify-between">
              <span className="text-[10px] text-zinc-700">Week total</span>
              <span className="text-[10px] font-semibold text-zinc-400">
                {formatNaira(weekEarnings)}
              </span>
            </div>
          </div>
        </div>

        {/* ── User card + logout ── */}
        <div className="px-4 pb-4 border-t border-white/[0.04] pt-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.025] border border-white/[0.05] px-3 py-2.5 mb-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500/30 to-emerald-500/30 border border-teal-500/25 text-[11px] font-bold text-teal-300 uppercase ring-1 ring-teal-500/10 ring-offset-1 ring-offset-[#09090c]">
              {CURRENT_DRIVER.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-zinc-200 truncate">
                {CURRENT_DRIVER.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Bike className="h-2.5 w-2.5 text-zinc-600" />
                <p className="text-[10px] text-zinc-600 truncate font-mono">
                  {CURRENT_DRIVER.vehiclePlate}
                </p>
              </div>
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
