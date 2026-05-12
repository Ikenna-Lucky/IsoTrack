"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Search,
  LogOut,
  MapPin,
  Clock,
} from "lucide-react";
import type { Route } from "next";
import { Logo } from "@/components/shared/logo";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import {
  CURRENT_CUSTOMER,
  CUSTOMER_SHIPMENTS,
  STATUS_META,
} from "@/lib/mock/customer";

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/customer",           label: "Overview",      icon: LayoutDashboard, exact: true },
  { href: "/customer/shipments", label: "My Shipments",  icon: Package },
  { href: "/customer/track",     label: "Track Package", icon: Search },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CustomerSidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const activeDelivery = CUSTOMER_SHIPMENTS.find(
    (s) => s.status === "out_for_delivery" || s.status === "in_transit",
  );

  const activeCount = CUSTOMER_SHIPMENTS.filter(
    (s) => s.status === "out_for_delivery" || s.status === "in_transit" || s.status === "assigned" || s.status === "picked_up",
  ).length;

  const deliveredCount = CUSTOMER_SHIPMENTS.filter((s) => s.status === "delivered").length;

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
          <Logo href="/customer" size={26} />
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">
            Customer
          </span>
        </div>

        {/* ── Main nav ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <p className="px-2.5 pb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-700">
            Menu
          </p>

          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href as Route}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150 border",
                  active
                    ? "bg-gradient-to-r from-violet-500/[0.14] to-violet-500/[0.06] text-violet-400 border-violet-500/[0.2]"
                    : "text-zinc-500 border-transparent hover:text-zinc-200 hover:bg-white/[0.04] hover:border-white/[0.04]",
                )}
              >
                {active && (
                  <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-violet-400" />
                )}
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors duration-150",
                    active ? "text-violet-400" : "text-zinc-700 group-hover:text-zinc-300",
                  )}
                />
                <span className="flex-1">{label}</span>
                {label === "My Shipments" && activeCount > 0 && !active && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-500/20 px-1 text-[9px] font-bold text-violet-400">
                    {activeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Active delivery snapshot ── */}
        {activeDelivery && (
          <div className="px-4 pb-3 border-t border-white/[0.04] pt-3">
            <div className="rounded-xl border border-violet-500/[0.18] bg-violet-500/[0.05] p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                <p className="text-[9px] font-bold uppercase tracking-wider text-violet-400">
                  Live Delivery
                </p>
              </div>
              <p className="text-[11px] font-mono font-semibold text-zinc-300">
                {activeDelivery.trackingId}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <MapPin className="h-2.5 w-2.5 text-violet-400/60 shrink-0" />
                <span className="truncate">
                  {activeDelivery.pickup.city} → {activeDelivery.delivery.city}
                </span>
              </div>
              {activeDelivery.driver?.eta && (
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-violet-400">
                  <Clock className="h-2.5 w-2.5 shrink-0" />
                  ETA {activeDelivery.driver.eta}
                </div>
              )}
              <Link
                href={"/customer/track" as Route}
                onClick={onClose}
                className="mt-1 flex items-center justify-center gap-1 w-full rounded-lg border border-violet-500/25 bg-violet-500/10 py-1.5 text-[10px] font-semibold text-violet-400 hover:bg-violet-500/[0.18] transition-all"
              >
                Track now
              </Link>
            </div>
          </div>
        )}

        {/* ── Stats strip ── */}
        <div className="px-4 pb-3 border-t border-white/[0.04] pt-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
              <p className="text-base font-bold text-white tabular-nums">{deliveredCount}</p>
              <p className="text-[9px] text-zinc-600 mt-0.5">Delivered</p>
            </div>
            <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
              <p className="text-base font-bold text-violet-400 tabular-nums">{activeCount}</p>
              <p className="text-[9px] text-zinc-600 mt-0.5">Active</p>
            </div>
          </div>
        </div>

        {/* ── User card + logout ── */}
        <div className="px-4 pb-4 border-t border-white/[0.04] pt-3 space-y-2">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.025] border border-white/[0.05] px-3 py-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border border-violet-500/25 text-[11px] font-bold text-violet-300 uppercase ring-1 ring-violet-500/10 ring-offset-1 ring-offset-[#09090c]">
              {(user?.name ?? CURRENT_CUSTOMER.name).slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-zinc-200 truncate">
                {user?.name ?? CURRENT_CUSTOMER.name}
              </p>
              <p className="text-[10px] text-zinc-600 truncate">
                {user?.email ?? CURRENT_CUSTOMER.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="group flex w-full items-center gap-2.5 rounded-xl border border-white/[0.04] px-3 py-2 text-[12px] font-medium text-zinc-600 hover:border-rose-500/20 hover:bg-rose-500/[0.06] hover:text-rose-400 transition-all duration-200"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0 transition-colors" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
