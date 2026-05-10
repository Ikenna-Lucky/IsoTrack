"use client";

import { useState } from "react";
import { Star, Phone, Truck, Bike, Car, Package, TrendingUp, Search } from "lucide-react";
import {
  MOCK_DRIVERS,
  MOCK_SHIPMENTS,
  formatNaira,
  type DriverStatus,
  type VehicleType,
} from "@/lib/mock/business";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<DriverStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  active: { label: "Active", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "#10b981" },
  idle: { label: "Idle", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", dot: "#f59e0b" },
  offline: { label: "Offline", color: "text-zinc-500", bg: "bg-zinc-500/10", border: "border-zinc-500/20", dot: "#52526a" },
};

const VEHICLE_ICONS: Record<VehicleType, React.ElementType> = {
  motorcycle: Bike,
  car: Car,
  van: Truck,
  truck: Truck,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DriversPage() {
  const [statusFilter, setStatusFilter] = useState<DriverStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = MOCK_DRIVERS.filter((d) => {
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.vehiclePlate.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Drivers</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          {MOCK_DRIVERS.filter((d) => d.status === "active").length} active ·{" "}
          {MOCK_DRIVERS.filter((d) => d.status === "idle").length} idle ·{" "}
          {MOCK_DRIVERS.filter((d) => d.status === "offline").length} offline
        </p>
      </div>

      {/* Summary stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Drivers", value: String(MOCK_DRIVERS.length), color: "text-sky-400" },
          { label: "Active Now", value: String(MOCK_DRIVERS.filter((d) => d.status === "active").length), color: "text-emerald-400" },
          { label: "Avg Rating", value: (MOCK_DRIVERS.reduce((s, d) => s + d.rating, 0) / MOCK_DRIVERS.length).toFixed(1), color: "text-amber-400" },
          { label: "Total Deliveries", value: String(MOCK_DRIVERS.reduce((s, d) => s + d.totalDeliveries, 0)), color: "text-violet-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-[11px] text-zinc-600 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search driver or plate…"
            className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] pl-9 pr-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-1">
          {(["all", "active", "idle", "offline"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-xl px-3 py-2 text-xs font-medium border capitalize transition-all",
                statusFilter === s
                  ? "bg-sky-500/[0.12] text-sky-400 border-sky-500/[0.2]"
                  : "text-zinc-600 border-white/[0.06] hover:text-zinc-300 hover:bg-white/[0.04]",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Driver grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((driver) => {
          const meta = STATUS_META[driver.status];
          const VehicleIcon = VEHICLE_ICONS[driver.vehicleType];
          const currentShipment = driver.currentShipmentId
            ? MOCK_SHIPMENTS.find((s) => s.trackingId === driver.currentShipmentId)
            : null;

          return (
            <div
              key={driver.id}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/[0.1] hover:bg-white/[0.035] transition-all duration-300 cursor-pointer"
            >
              {/* Avatar + status */}
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-teal-500/20 border border-sky-500/20 text-sm font-bold text-sky-300">
                    {driver.avatar}
                  </div>
                  {/* Status indicator */}
                  <div
                    className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#09090b]"
                    style={{ backgroundColor: meta.dot }}
                  />
                </div>
                <span
                  className={cn(
                    "flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    meta.color, meta.bg, meta.border,
                  )}
                >
                  {meta.label}
                </span>
              </div>

              {/* Name + rating */}
              <p className="text-sm font-semibold text-white mb-0.5">{driver.name}</p>
              <div className="flex items-center gap-1.5 mb-3">
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                <span className="text-xs font-medium text-amber-400">{driver.rating}</span>
                <span className="text-zinc-700 text-xs">·</span>
                <span className="text-[11px] text-zinc-600">{driver.totalDeliveries} deliveries</span>
              </div>

              {/* Vehicle + plate */}
              <div className="flex items-center gap-2 mb-3 text-[11px] text-zinc-600">
                <VehicleIcon className="h-3.5 w-3.5 text-zinc-700" />
                <span className="capitalize">{driver.vehicleType}</span>
                <span className="text-zinc-800">·</span>
                <span className="font-mono">{driver.vehiclePlate}</span>
              </div>

              {/* Current shipment or idle message */}
              {currentShipment ? (
                <div className="rounded-xl bg-sky-500/[0.06] border border-sky-500/[0.12] px-3 py-2 mt-2">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-sky-600 mb-0.5">
                    Current Delivery
                  </p>
                  <p className="text-[11px] font-mono font-medium text-sky-400">
                    {currentShipment.trackingId}
                  </p>
                  <p className="text-[10px] text-zinc-600 truncate">
                    {currentShipment.delivery.address}, {currentShipment.delivery.city}
                  </p>
                </div>
              ) : driver.status === "idle" ? (
                <div className="rounded-xl bg-amber-500/[0.06] border border-amber-500/[0.1] px-3 py-2 mt-2">
                  <p className="text-[10px] text-amber-500/70">Available for assignment</p>
                </div>
              ) : (
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] px-3 py-2 mt-2">
                  <p className="text-[10px] text-zinc-700">Currently offline</p>
                </div>
              )}

              {/* Earnings */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
                <div>
                  <p className="text-[10px] text-zinc-600">Monthly earnings</p>
                  <p className="text-xs font-semibold text-zinc-300">{formatNaira(driver.monthlyEarnings)}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>+12%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
