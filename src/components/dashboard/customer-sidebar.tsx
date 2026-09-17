"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { useState } from "react";
import {
  Clock,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Search,
  Settings,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { getShipmentList, useShipments } from "@/hooks/use-shipments";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

const NAV_ITEMS: Array<{
  href: Route;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}> = [
  { href: "/customer", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/customer/shipments", label: "My Shipments", icon: Package },
  { href: "/customer/track", label: "Track Package", icon: Search },
  { href: "/customer/settings", label: "Settings", icon: Settings },
] as const;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CustomerSidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { data: shipmentsData } = useShipments({ pageSize: 100 });
  const shipments = getShipmentList(shipmentsData);

  const activeDelivery = shipments.find(
    (shipment) => shipment.status === "out_for_delivery" || shipment.status === "in_transit",
  );
  const activeCount = shipments.filter((shipment) =>
    ["assigned", "picked_up", "in_transit", "out_for_delivery"].includes(shipment.status),
  ).length;
  const deliveredCount = shipments.filter((shipment) => shipment.status === "delivered").length;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

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
          <Logo href="/customer" size={34} tone="light" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-300/70">
            Customer
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-2.5 pb-2 text-[9px] font-black uppercase tracking-[0.18em] text-stone-700">
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
                  "group relative flex items-center gap-3 rounded-md border px-3 py-2.5 text-[13px] font-bold transition-all",
                  active
                    ? "border-teal-400/25 bg-teal-400/10 text-teal-200"
                    : "border-transparent text-stone-500 hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-stone-200",
                )}
              >
                {active && <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-r-full bg-amber-300" />}
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    active ? "text-teal-200" : "text-stone-700 group-hover:text-stone-300",
                  )}
                />
                <span className="flex-1">{label}</span>
                {label === "My Shipments" && activeCount > 0 && !active && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded bg-amber-400/15 px-1 text-[9px] font-black text-amber-200">
                    {activeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {activeDelivery && (
          <div className="border-t border-white/[0.07] px-4 pb-3 pt-3">
            <div className="space-y-2 rounded-md border border-teal-400/20 bg-teal-400/10 p-3">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-300" />
                <p className="text-[9px] font-black uppercase tracking-wider text-teal-200">
                  Live delivery
                </p>
              </div>
              <p className="text-[11px] font-mono font-black text-stone-200">
                {activeDelivery.trackingId}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
                <MapPin className="h-2.5 w-2.5 shrink-0 text-teal-200/70" />
                <span className="truncate">
                  {activeDelivery.pickupAddress.city} to {activeDelivery.deliveryAddress.city}
                </span>
              </div>
              {activeDelivery.estimatedDelivery && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-200">
                  <Clock className="h-2.5 w-2.5 shrink-0" />
                  ETA{" "}
                  {new Date(activeDelivery.estimatedDelivery).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
              )}
              <Link
                href="/customer/track"
                onClick={onClose}
                className="mt-1 flex w-full items-center justify-center rounded-md border border-teal-400/25 bg-black/25 py-1.5 text-[10px] font-bold text-teal-200 transition hover:bg-teal-400/[0.16]"
              >
                Track now
              </Link>
            </div>
          </div>
        )}

        <div className="border-t border-white/[0.07] px-4 pb-3 pt-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border border-white/[0.07] bg-white/[0.03] px-3 py-2.5">
              <p className="text-base font-black tabular-nums text-stone-100">{deliveredCount}</p>
              <p className="mt-0.5 text-[9px] text-stone-600">Delivered</p>
            </div>
            <div className="rounded-md border border-teal-400/20 bg-teal-400/10 px-3 py-2.5">
              <p className="text-base font-black tabular-nums text-teal-200">{activeCount}</p>
              <p className="mt-0.5 text-[9px] text-stone-600">Active</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-white/[0.07] px-4 pb-4 pt-3">
          <div className="flex items-center gap-3 rounded-md border border-white/[0.07] bg-white/[0.03] px-3 py-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-teal-400/10 text-[11px] font-black uppercase text-teal-200 ring-1 ring-teal-400/20">
              {(user?.name ?? "CU").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-stone-200">{user?.name ?? "Customer"}</p>
              <p className="truncate text-[10px] text-stone-600">{user?.email ?? ""}</p>
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="customer-signout-title"
        >
          <div className="w-full max-w-sm rounded-md border border-white/[0.08] bg-[#0d1412] shadow-2xl shadow-black/40">
            <div className="border-b border-white/[0.07] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-rose-400/20 bg-rose-400/10">
                  <LogOut className="h-5 w-5 text-rose-200" />
                </div>
                <div>
                  <h2 id="customer-signout-title" className="text-base font-black text-stone-50">
                    Sign out of IsoTrack?
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    Your dashboard session will close. Any shipment already in progress will keep updating when you sign back in.
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
