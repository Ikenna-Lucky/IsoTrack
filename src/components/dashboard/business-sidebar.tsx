"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  ChevronRight,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Package,
  Plus,
  Settings,
  Truck,
  Zap,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { useBusinessAnalytics, useBusinessProfile } from "@/hooks/use-business";
import { useDrivers } from "@/hooks/use-driver";
import { getShipmentList, useShipments } from "@/hooks/use-shipments";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

const NAV_ITEMS: Array<{
  href: Route;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  badge?: boolean;
}> = [
  { href: "/business", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/business/shipments", label: "Shipments", icon: Package, badge: true },
  { href: "/business/drivers", label: "Drivers", icon: Truck },
  { href: "/business/analytics", label: "Analytics", icon: BarChart3 },
];

const BOTTOM_ITEMS: Array<{ href: Route; label: string; icon: typeof Settings }> = [
  { href: "/business/settings", label: "Settings", icon: Settings },
  { href: "/business/help", label: "Help", icon: HelpCircle },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function BusinessSidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: shipmentsData } = useShipments({ pageSize: 200 });
  const { data: drivers = [] } = useDrivers();
  const { data: analytics } = useBusinessAnalytics();
  const { data: business } = useBusinessProfile();
  const shipments = getShipmentList(shipmentsData);

  const pendingCount = shipments.filter((shipment) => shipment.status === "pending" || shipment.status === "assigned").length;
  const activeDriverCount = drivers.filter((driver) => driver.status === "available" || driver.status === "on_delivery").length;
  const inTransitCount = shipments.filter((shipment) => shipment.status === "in_transit" || shipment.status === "out_for_delivery").length;
  const totalRevenue = analytics?.totalRevenueKobo ?? 0;

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-[230px] flex-col border-r border-white/[0.07] bg-[#080b0a]",
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.07] px-5">
          <Logo href="/business" size={34} tone="light" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-300/75">
            Business
          </span>
        </div>

        <div className="px-4 pb-3 pt-4">
          <Link
            href="/business/shipments/new"
            onClick={onClose}
            className="group flex w-full items-center gap-2.5 rounded-md bg-amber-300 px-3.5 py-2.5 text-[13px] font-black text-black transition hover:bg-amber-200"
          >
            <Plus className="h-4 w-4 shrink-0" />
            New shipment
            <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-70 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-1">
          <p className="px-2.5 pb-2 pt-1 text-[9px] font-black uppercase tracking-[0.18em] text-stone-700">
            Operations
          </p>

          {NAV_ITEMS.map(({ href, label, icon: Icon, exact, badge }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-md border px-3 py-2.5 text-[13px] font-bold transition-all",
                  active
                    ? "border-teal-400/25 bg-teal-400/10 text-teal-200"
                    : "border-transparent text-stone-500 hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-stone-200",
                )}
              >
                {active && <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-r-full bg-amber-300" />}
                <Icon className={cn("h-4 w-4 shrink-0", active ? "text-teal-200" : "text-stone-700 group-hover:text-stone-300")} />
                <span className="flex-1">{label}</span>
                {badge && pendingCount > 0 && !active && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded bg-amber-400/15 px-1 text-[9px] font-black text-amber-200">
                    {pendingCount}
                  </span>
                )}
                {active && <ChevronRight className="h-3 w-3 text-teal-200/70" />}
              </Link>
            );
          })}

          <p className="px-2.5 pb-2 pt-4 text-[9px] font-black uppercase tracking-[0.18em] text-stone-700">
            Account
          </p>

          {BOTTOM_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-md border px-3 py-2.5 text-[13px] font-bold transition-all",
                  active
                    ? "border-teal-400/25 bg-teal-400/10 text-teal-200"
                    : "border-transparent text-stone-600 hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-stone-200",
                )}
              >
                {active && <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-r-full bg-amber-300" />}
                <Icon className={cn("h-4 w-4 shrink-0", active ? "text-teal-200" : "text-stone-700 group-hover:text-stone-300")} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.07] px-4 pb-3 pt-3">
          <div className="space-y-2 rounded-md border border-white/[0.07] bg-white/[0.03] p-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-amber-200" />
              <p className="text-[10px] font-black uppercase tracking-wider text-stone-600">
                Dispatch snapshot
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-stone-600">Active drivers</span>
              <span className="text-[10px] font-black text-emerald-200">{activeDriverCount} online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-stone-600">Revenue</span>
              <span className="text-[10px] font-black text-stone-200">{formatNaira(totalRevenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-stone-600">Moving now</span>
              <span className="text-[10px] font-black text-teal-200">{inTransitCount} shipments</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-white/[0.07] px-4 pb-4 pt-3">
          <div className="flex items-center gap-3 rounded-md border border-white/[0.07] bg-white/[0.03] px-3 py-2.5">
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={user.name} className="h-7 w-7 shrink-0 rounded object-cover ring-1 ring-teal-400/20" />
            ) : (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-teal-400/10 text-[11px] font-black uppercase text-teal-200 ring-1 ring-teal-400/20">
                {(user?.name ?? "BU").slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-stone-200">{business?.businessName ?? user?.name ?? "Business"}</p>
              <p className="truncate text-[10px] text-stone-600">{user?.name ?? ""}</p>
            </div>
          </div>

          <button
            onClick={() => setConfirmOpen(true)}
            className="group flex w-full items-center gap-2.5 rounded-md border border-white/[0.06] px-3 py-2 text-[12px] font-bold text-stone-600 transition hover:border-rose-400/20 hover:bg-rose-400/[0.08] hover:text-rose-300"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="business-signout-title">
          <div className="w-full max-w-sm rounded-md border border-white/[0.08] bg-[#0d1412] shadow-2xl shadow-black/40">
            <div className="border-b border-white/[0.07] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-rose-400/20 bg-rose-400/10">
                  <LogOut className="h-5 w-5 text-rose-200" />
                </div>
                <div>
                  <h2 id="business-signout-title" className="text-base font-black text-stone-50">Sign out of business dashboard?</h2>
                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    Your operations session will close. Shipments and driver updates will continue in the background.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-2 p-4 sm:grid-cols-2">
              <button
                onClick={() => setConfirmOpen(false)}
                className="rounded-md border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-black text-stone-200 transition hover:bg-white/[0.06]"
              >
                Stay signed in
              </button>
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  logout();
                }}
                className="rounded-md bg-rose-300 px-4 py-2.5 text-sm font-black text-black transition hover:bg-rose-200"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
