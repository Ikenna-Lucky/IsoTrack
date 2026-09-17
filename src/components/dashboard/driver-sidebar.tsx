"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { useState } from "react";
import {
  Bike,
  Car,
  ChevronRight,
  DollarSign,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Star,
  TrendingUp,
  Truck,
  Zap,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { useDriverProfile } from "@/hooks/use-driver";
import { getShipmentList, useShipments } from "@/hooks/use-shipments";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

const NAV_ITEMS: Array<{ href: Route; label: string; icon: typeof LayoutDashboard; exact?: boolean }> = [
  { href: "/driver", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/driver/deliveries", label: "Deliveries", icon: Package },
  { href: "/driver/earnings", label: "Earnings", icon: DollarSign },
];

const BOTTOM_ITEMS: Array<{ href: Route; label: string; icon: typeof Settings }> = [
  { href: "/driver/settings", label: "Settings", icon: Settings },
  { href: "/driver/help", label: "Help", icon: HelpCircle },
];

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "DR";
}

function VehicleIcon({ type }: { type: string | undefined }) {
  if (type === "truck" || type === "van") return <Truck className="h-3 w-3 text-stone-600" />;
  if (type === "bike") return <Bike className="h-3 w-3 text-stone-600" />;
  return <Car className="h-3 w-3 text-stone-600" />;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function DriverSidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { data: driver } = useDriverProfile();
  const { data: shipmentsData } = useShipments({ pageSize: 200 });
  const shipments = getShipmentList(shipmentsData);

  const today = new Date().toDateString();
  const todayShipments = shipments.filter((shipment) => shipment.status === "delivered" && shipment.actualDelivery && new Date(shipment.actualDelivery).toDateString() === today);
  const todayEarnings = todayShipments.reduce((sum, shipment) => sum + Math.round(shipment.priceKobo * 0.4), 0);
  const activeDelivery = shipments.find((shipment) => ["assigned", "picked_up", "in_transit", "out_for_delivery"].includes(shipment.status));
  const displayName = user?.name ?? driver?.user?.name ?? "Driver";
  const isOnline = driver?.status !== "offline";

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-black/70 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-[230px] flex-col border-r border-white/[0.07] bg-[#080b0a]",
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.07] px-5">
          <Logo href="/driver" size={34} tone="light" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-300/75">Driver</span>
        </div>

        <div className="px-4 pb-3 pt-4">
          <div className={cn("flex items-center gap-2.5 rounded-md border px-3.5 py-2.5", isOnline ? "border-teal-400/20 bg-teal-400/10" : "border-white/[0.07] bg-white/[0.03]")}>
            <span className="relative flex h-2 w-2 shrink-0">
              {isOnline && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-60" />}
              <span className={cn("relative inline-flex h-2 w-2 rounded-full", isOnline ? "bg-teal-200" : "bg-stone-600")} />
            </span>
            <span className={cn("text-[13px] font-black", isOnline ? "text-teal-100" : "text-stone-500")}>{isOnline ? "Online" : "Offline"}</span>
            <span className="ml-auto text-[10px] font-bold capitalize text-stone-600">{driver?.status?.replace("_", " ") ?? "setup"}</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-1">
          <p className="px-2.5 pb-2 pt-1 text-[9px] font-black uppercase tracking-[0.18em] text-stone-700">Route</p>
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-md border px-3 py-2.5 text-[13px] font-bold transition-all",
                  active ? "border-teal-400/25 bg-teal-400/10 text-teal-200" : "border-transparent text-stone-500 hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-stone-200",
                )}
              >
                {active && <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-r-full bg-amber-300" />}
                <Icon className={cn("h-4 w-4 shrink-0", active ? "text-teal-200" : "text-stone-700 group-hover:text-stone-300")} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="h-3 w-3 text-teal-200/70" />}
              </Link>
            );
          })}

          <p className="px-2.5 pb-2 pt-4 text-[9px] font-black uppercase tracking-[0.18em] text-stone-700">Account</p>
          {BOTTOM_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-md border px-3 py-2.5 text-[13px] font-bold transition-all",
                  active ? "border-teal-400/25 bg-teal-400/10 text-teal-200" : "border-transparent text-stone-600 hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-stone-200",
                )}
              >
                {active && <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-r-full bg-amber-300" />}
                <Icon className={cn("h-4 w-4 shrink-0", active ? "text-teal-200" : "text-stone-700 group-hover:text-stone-300")} />
                {label}
              </Link>
            );
          })}
        </nav>

        {activeDelivery && (
          <div className="border-t border-white/[0.07] px-4 pb-3 pt-3">
            <div className="space-y-2 rounded-md border border-teal-400/20 bg-teal-400/10 p-3">
              <p className="text-[9px] font-black uppercase tracking-wider text-teal-200">Active job</p>
              <p className="font-mono text-[11px] font-black text-stone-100">{activeDelivery.trackingId}</p>
              <p className="truncate text-[10px] text-stone-500">{activeDelivery.pickupAddress.city} to {activeDelivery.deliveryAddress.city}</p>
              <Link href="/driver/deliveries" onClick={onClose} className="flex w-full items-center justify-center rounded-md border border-teal-400/25 bg-black/25 py-1.5 text-[10px] font-black text-teal-100 transition hover:bg-teal-400/[0.16]">
                Open job
              </Link>
            </div>
          </div>
        )}

        <div className="border-t border-white/[0.07] px-4 pb-3 pt-3">
          <div className="space-y-2 rounded-md border border-white/[0.07] bg-white/[0.03] p-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-amber-200" />
              <p className="text-[10px] font-black uppercase tracking-wider text-stone-600">Today</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] text-stone-600"><TrendingUp className="h-3 w-3" />Earnings</span>
              <span className="text-[10px] font-black text-emerald-200">{formatNaira(todayEarnings)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] text-stone-600"><Package className="h-3 w-3" />Trips</span>
              <span className="text-[10px] font-black text-teal-200">{todayShipments.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] text-stone-600"><Star className="h-3 w-3" />Rating</span>
              <span className="text-[10px] font-black text-amber-200">{driver?.rating ? driver.rating.toFixed(1) : "Not rated"}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-white/[0.07] px-4 pb-4 pt-3">
          <div className="flex items-center gap-3 rounded-md border border-white/[0.07] bg-white/[0.03] px-3 py-2.5">
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={displayName} className="h-7 w-7 shrink-0 rounded object-cover ring-1 ring-teal-400/20" />
            ) : (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-teal-400/10 text-[11px] font-black uppercase text-teal-200 ring-1 ring-teal-400/20">{getInitials(displayName)}</div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-stone-200">{displayName}</p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <VehicleIcon type={driver?.vehicleType} />
                <p className="truncate font-mono text-[10px] text-stone-600">{driver?.vehiclePlate ?? "No vehicle"}</p>
              </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="driver-signout-title">
          <div className="w-full max-w-sm rounded-md border border-white/[0.08] bg-[#0d1412] shadow-2xl shadow-black/40">
            <div className="border-b border-white/[0.07] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-rose-400/20 bg-rose-400/10">
                  <LogOut className="h-5 w-5 text-rose-200" />
                </div>
                <div>
                  <h2 id="driver-signout-title" className="text-base font-black text-stone-50">Sign out of driver dashboard?</h2>
                  <p className="mt-1 text-sm leading-6 text-stone-500">Your session will close. Any live location sharing stops when you sign out.</p>
                </div>
              </div>
            </div>
            <div className="grid gap-2 p-4 sm:grid-cols-2">
              <button onClick={() => setConfirmOpen(false)} className="rounded-md border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-black text-stone-200 transition hover:bg-white/[0.06]">Stay signed in</button>
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
