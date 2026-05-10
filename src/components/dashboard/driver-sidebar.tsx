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
  Bike,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import { CURRENT_DRIVER } from "@/lib/mock/driver";

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/driver", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/driver/deliveries", label: "Deliveries", icon: Package },
  { href: "/driver/earnings", label: "Earnings", icon: DollarSign },
];

const BOTTOM_ITEMS = [
  { href: "/driver/settings", label: "Settings", icon: Settings },
  { href: "/driver/help", label: "Help & Docs", icon: HelpCircle },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

export function DriverSidebar({ open, onClose }: Props) {
  const pathname = usePathname();
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

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-[230px] flex-col",
          "border-r border-white/[0.06] bg-zinc-950",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b border-white/[0.06] px-4">
          <Logo size="sm" />
          <span className="ml-1 text-[10px] font-semibold tracking-widest text-teal-500 uppercase">
            Driver
          </span>
        </div>

        {/* Online status badge */}
        <div className="mx-3 mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-emerald-400">Online · Available</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(href, exact);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-teal-500/10 text-teal-400"
                        : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200",
                    )}
                  >
                    <Icon size={16} />
                    {label}
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-teal-400" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Vehicle info */}
          <div className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              Your vehicle
            </p>
            <div className="flex items-center gap-2">
              <Bike size={14} className="text-zinc-500" />
              <span className="text-xs text-zinc-400">{CURRENT_DRIVER.vehicleType}</span>
              <span className="ml-auto rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                {CURRENT_DRIVER.vehiclePlate}
              </span>
            </div>
          </div>
        </nav>

        {/* Bottom items */}
        <div className="border-t border-white/[0.06] px-2 py-2">
          {BOTTOM_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300 transition-colors"
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
          <button
            onClick={() => void logout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-rose-500/70 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>

        {/* User card */}
        <div className="border-t border-white/[0.06] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/20 text-xs font-semibold text-teal-400">
              {CURRENT_DRIVER.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-zinc-200">
                {CURRENT_DRIVER.name}
              </p>
              <p className="text-[10px] text-zinc-500">★ {CURRENT_DRIVER.rating} · {CURRENT_DRIVER.totalDeliveries} trips</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
