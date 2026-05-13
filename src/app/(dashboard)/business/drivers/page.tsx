"use client";

import { useState, useMemo } from "react";
import {
  Star,
  Phone,
  Truck,
  Bike,
  Car,
  TrendingUp,
  Search,
  LayoutGrid,
  List,
  Trophy,
  Medal,
  Award,
  Package,
  Loader2,
} from "lucide-react";
import { useDrivers } from "@/hooks/use-driver";
import { useShipments, getShipmentList } from "@/hooks/use-shipments";
import type { Driver, DriverStatus, VehicleType, Shipment } from "@/types";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    .map((p) => p[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<
  DriverStatus,
  { label: string; color: string; bg: string; border: string; dot: string; ring: string }
> = {
  available:   { label: "Available",   color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "#10b981", ring: "ring-emerald-400" },
  on_delivery: { label: "On Delivery", color: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/20",     dot: "#0ea5e9", ring: "ring-sky-400"     },
  offline:     { label: "Offline",     color: "text-zinc-500",    bg: "bg-zinc-500/10",    border: "border-zinc-700/30",    dot: "#52526a", ring: "ring-zinc-700"    },
};

const VEHICLE_ICONS: Record<VehicleType, React.ElementType> = {
  bike:  Bike,
  car:   Car,
  van:   Truck,
  truck: Truck,
};

// ─── Star rating ──────────────────────────────────────────────────────────────

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "h-2.5 w-2.5",
            s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-zinc-700",
          )}
        />
      ))}
      <span className="ml-1 text-[10px] font-semibold text-amber-400">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

// ─── Podium ───────────────────────────────────────────────────────────────────

const PODIUM_ICONS = [Trophy, Medal, Award];
const PODIUM_COLORS = [
  { ring: "ring-amber-400",  bg: "from-amber-500/20 to-orange-500/20",  border: "border-amber-500/25",  text: "text-amber-400",  num: "text-amber-400"  },
  { ring: "ring-zinc-400",   bg: "from-zinc-500/15 to-zinc-400/10",     border: "border-zinc-500/20",   text: "text-zinc-400",   num: "text-zinc-400"   },
  { ring: "ring-orange-500", bg: "from-orange-500/15 to-amber-600/10",  border: "border-orange-500/20", text: "text-orange-400", num: "text-orange-400" },
];

function Podium({
  drivers,
  shipments,
}: {
  drivers: Driver[];
  shipments: Shipment[];
}) {
  const top3 = [...drivers].sort((a, b) => b.rating - a.rating).slice(0, 3);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold text-white">Top Performers</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Ranked by rating</p>
        </div>
        <Trophy className="h-4 w-4 text-amber-400/60" />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        {top3.map((driver, idx) => {
          const cfg = PODIUM_COLORS[idx]!;
          const PodiumIcon = PODIUM_ICONS[idx]!;
          const activeShipment = shipments.find(
            (s) =>
              s.driverId === driver.id &&
              (s.status === "in_transit" ||
                s.status === "out_for_delivery" ||
                s.status === "assigned" ||
                s.status === "picked_up"),
          );
          const monthlyEarnings = shipments
            .filter((s) => s.driverId === driver.id && s.status === "delivered")
            .reduce((sum, s) => sum + Math.round(s.priceKobo * 0.4), 0);

          return (
            <div
              key={driver.id}
              className={cn(
                "relative rounded-xl border p-4 text-center min-w-[160px] flex-shrink-0 sm:flex-1",
                cfg.border,
                idx === 0 && "ring-1 ring-amber-400/20 shadow-[0_0_24px_rgba(251,191,36,0.06)]",
              )}
            >
              {/* Rank badge */}
              <div className={cn("absolute -top-2.5 left-1/2 -translate-x-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-[#0d0d11] border", cfg.border)}>
                <PodiumIcon className={cn("h-2.5 w-2.5", cfg.text)} />
              </div>

              {/* Avatar */}
              <div
                className={cn(
                  "mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ring-2 ring-offset-2 ring-offset-[#0d0d11] text-xs font-bold text-white uppercase",
                  cfg.bg, cfg.ring,
                )}
              >
                {getInitials(driver.user.name)}
              </div>

              <p className="text-xs font-semibold text-white truncate mb-1">
                {driver.user.name.split(" ")[0]}
              </p>
              <RatingStars rating={driver.rating} />
              <p className="text-[10px] text-zinc-600 mt-1.5">
                {driver.totalDeliveries} deliveries
              </p>
              <p className={cn("text-xs font-bold mt-1", cfg.num)}>
                {formatNaira(monthlyEarnings)}
              </p>
              {activeShipment && (
                <div className="mt-2 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/[0.12] px-1.5 py-1">
                  <p className="text-[9px] text-emerald-400 font-mono truncate">
                    {activeShipment.trackingId}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Driver card (grid view) ──────────────────────────────────────────────────

function DriverCard({
  driver,
  shipments,
  maxDeliveries,
}: {
  driver: Driver;
  shipments: Shipment[];
  maxDeliveries: number;
}) {
  const cfg = STATUS_CFG[driver.status];
  const VehicleIcon = VEHICLE_ICONS[driver.vehicleType];

  const activeShipment = shipments.find(
    (s) =>
      s.driverId === driver.id &&
      (s.status === "in_transit" ||
        s.status === "out_for_delivery" ||
        s.status === "assigned" ||
        s.status === "picked_up"),
  ) ?? null;

  const monthlyEarnings = shipments
    .filter((s) => s.driverId === driver.id && s.status === "delivered")
    .reduce((sum, s) => sum + Math.round(s.priceKobo * 0.4), 0);

  const utilizationPct = maxDeliveries > 0
    ? Math.round((driver.totalDeliveries / maxDeliveries) * 100)
    : 0;

  return (
    <div className="group relative rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-5 hover:border-white/[0.11] hover:shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all duration-300 cursor-pointer overflow-hidden">
      {/* Subtle status glow */}
      <div
        className="absolute -top-8 -right-8 h-20 w-20 rounded-full blur-2xl opacity-[0.12] pointer-events-none"
        style={{ backgroundColor: cfg.dot }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="relative">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/15 to-teal-500/15 text-sm font-bold text-sky-200 ring-2 ring-offset-2 ring-offset-[#0d0d11]",
              cfg.ring,
            )}
          >
            {getInitials(driver.user.name)}
          </div>
          <div
            className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0d0d11]"
            style={{ backgroundColor: cfg.dot, boxShadow: `0 0 6px ${cfg.dot}` }}
          />
        </div>
        <span
          className={cn(
            "flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
            cfg.color, cfg.bg, cfg.border,
          )}
        >
          {cfg.label}
        </span>
      </div>

      {/* Name */}
      <p className="text-sm font-semibold text-white mb-1">{driver.user.name}</p>
      <RatingStars rating={driver.rating} />

      {/* Vehicle */}
      <div className="flex items-center gap-1.5 mt-2.5 mb-3 text-[11px] text-zinc-600">
        <VehicleIcon className="h-3.5 w-3.5 text-zinc-700" />
        <span className="capitalize">{driver.vehicleType}</span>
        <span className="text-zinc-800">·</span>
        <span className="font-mono">{driver.vehiclePlate}</span>
      </div>

      {/* Utilization bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] text-zinc-700 uppercase tracking-wider">Fleet utilization</span>
          <span className="text-[9px] font-semibold text-zinc-500">{utilizationPct}%</span>
        </div>
        <div className="h-1 w-full rounded-full bg-white/[0.05] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${utilizationPct}%`,
              background: `linear-gradient(to right, ${cfg.dot}, ${cfg.dot}88)`,
            }}
          />
        </div>
      </div>

      {/* Active shipment or status */}
      {activeShipment ? (
        <div className="rounded-xl bg-sky-500/[0.06] border border-sky-500/[0.12] px-3 py-2">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-sky-600 mb-0.5">
            Active Delivery
          </p>
          <p className="text-[11px] font-mono font-semibold text-sky-400">
            {activeShipment.trackingId}
          </p>
          <p className="text-[10px] text-zinc-600 truncate">
            → {activeShipment.deliveryAddress.city}
          </p>
        </div>
      ) : driver.status === "available" ? (
        <div className="rounded-xl bg-amber-500/[0.05] border border-amber-500/[0.1] px-3 py-2">
          <p className="text-[10px] text-amber-500/60">Available for assignment</p>
        </div>
      ) : (
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] px-3 py-2">
          <p className="text-[10px] text-zinc-700">Currently offline</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
        <div>
          <p className="text-[10px] text-zinc-600">Lifetime earnings</p>
          <p className="text-xs font-semibold text-zinc-300">{formatNaira(monthlyEarnings)}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {driver.user.phone && (
            <a
              href={`tel:${driver.user.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-500 hover:text-white hover:border-white/[0.15] transition-all"
              title="Call driver"
            >
              <Phone className="h-3 w-3" />
            </a>
          )}
          <div className="flex items-center gap-1 text-[10px] text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            <span>{driver.totalDeliveries} trips</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Driver list row ──────────────────────────────────────────────────────────

function DriverRow({
  driver,
  shipments,
}: {
  driver: Driver;
  shipments: Shipment[];
}) {
  const cfg = STATUS_CFG[driver.status];
  const VehicleIcon = VEHICLE_ICONS[driver.vehicleType];

  const activeShipment = shipments.find(
    (s) =>
      s.driverId === driver.id &&
      (s.status === "in_transit" ||
        s.status === "out_for_delivery" ||
        s.status === "assigned" ||
        s.status === "picked_up"),
  ) ?? null;

  const earnings = shipments
    .filter((s) => s.driverId === driver.id && s.status === "delivered")
    .reduce((sum, s) => sum + Math.round(s.priceKobo * 0.4), 0);

  return (
    <div className="group flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors border-b border-white/[0.04] last:border-b-0">
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/15 to-teal-500/15 text-xs font-bold text-sky-200 ring-2 ring-offset-2 ring-offset-[#0d0d11]",
            cfg.ring,
          )}
        >
          {getInitials(driver.user.name)}
        </div>
      </div>

      {/* Name + vehicle */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-zinc-200 truncate">{driver.user.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <VehicleIcon className="h-3 w-3 text-zinc-700" />
          <span className="text-[10px] text-zinc-600 capitalize">{driver.vehicleType}</span>
          <span className="text-zinc-800 text-[10px]">·</span>
          <span className="text-[10px] font-mono text-zinc-600">{driver.vehiclePlate}</span>
        </div>
      </div>

      {/* Rating */}
      <div className="hidden sm:block shrink-0">
        <RatingStars rating={driver.rating} />
        <p className="text-[10px] text-zinc-600 mt-0.5">{driver.totalDeliveries} trips</p>
      </div>

      {/* Status / active delivery */}
      <div className="hidden md:block shrink-0 min-w-[140px]">
        {activeShipment ? (
          <div>
            <p className="text-[10px] font-mono font-semibold text-sky-400">{activeShipment.trackingId}</p>
            <p className="text-[10px] text-zinc-600">→ {activeShipment.deliveryAddress.city}</p>
          </div>
        ) : (
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
              cfg.color, cfg.bg, cfg.border,
            )}
          >
            {cfg.label}
          </span>
        )}
      </div>

      {/* Earnings */}
      <div className="hidden lg:block shrink-0 text-right min-w-[80px]">
        <p className="text-xs font-semibold text-zinc-300 tabular-nums">{formatNaira(earnings)}</p>
        <p className="text-[10px] text-zinc-600">lifetime</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        {driver.user.phone && (
          <a
            href={`tel:${driver.user.phone}`}
            className="flex h-7 items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 text-[10px] font-medium text-zinc-400 hover:text-white hover:border-white/[0.15] transition-all"
          >
            <Phone className="h-3 w-3" />
            Call
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type StatusFilter = DriverStatus | "all";

export default function DriversPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search,       setSearch]       = useState("");
  const [viewMode,     setViewMode]     = useState<"grid" | "list">("grid");

  const { data: drivers = [], isLoading: driversLoading } = useDrivers();
  const { data: shipmentsData, isLoading: shipmentsLoading } = useShipments({ pageSize: 200 });
  const shipments = getShipmentList(shipmentsData);

  const isLoading = driversLoading || shipmentsLoading;

  const maxDeliveries = useMemo(
    () => Math.max(1, ...drivers.map((d) => d.totalDeliveries)),
    [drivers],
  );

  const filtered = useMemo(
    () =>
      drivers.filter((d) => {
        const matchStatus = statusFilter === "all" || d.status === statusFilter;
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          d.user.name.toLowerCase().includes(q) ||
          d.vehiclePlate.toLowerCase().includes(q) ||
          (d.user.email ?? "").toLowerCase().includes(q);
        return matchStatus && matchSearch;
      }),
    [drivers, statusFilter, search],
  );

  const availableCount   = drivers.filter((d) => d.status === "available").length;
  const onDeliveryCount  = drivers.filter((d) => d.status === "on_delivery").length;
  const offlineCount     = drivers.filter((d) => d.status === "offline").length;
  const avgRating = drivers.length
    ? (drivers.reduce((s, d) => s + d.rating, 0) / drivers.length).toFixed(1)
    : "—";
  const totalDeliveries = drivers.reduce((s, d) => s + d.totalDeliveries, 0);

  const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
    { label: "All",          value: "all"          },
    { label: "Available",    value: "available"    },
    { label: "On Delivery",  value: "on_delivery"  },
    { label: "Offline",      value: "offline"      },
  ];

  const statusCount = (s: StatusFilter) =>
    s === "all" ? drivers.length : drivers.filter((d) => d.status === s).length;

  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Drivers</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            {availableCount} available · {onDeliveryCount} on delivery · {offlineCount} offline
          </p>
        </div>
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
        </div>
      )}

      {!isLoading && (
        <>
          {/* ── Stats strip ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Drivers",    value: String(drivers.length),  color: "text-sky-400",     sub: "Fleet size"   },
              { label: "On Delivery",      value: String(onDeliveryCount), color: "text-emerald-400", sub: "Active now"   },
              { label: "Avg Rating",       value: avgRating,               color: "text-amber-400",   sub: "Fleet average"},
              { label: "Total Deliveries", value: String(totalDeliveries), color: "text-violet-400",  sub: "All time"     },
            ].map(({ label, value, color, sub }) => (
              <div
                key={label}
                className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-4 hover:border-white/[0.1] transition-colors"
              >
                <p className={`text-2xl font-bold ${color} tabular-nums`}>{value}</p>
                <p className="text-xs font-medium text-zinc-400 mt-0.5">{label}</p>
                <p className="text-[10px] text-zinc-600">{sub}</p>
              </div>
            ))}
          </div>

          {/* ── Podium ── */}
          {drivers.length >= 3 && (
            <Podium drivers={drivers} shipments={shipments} />
          )}

          {/* ── Filters + view toggle ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search driver or plate…"
                className="w-full rounded-xl border border-white/[0.07] bg-[#0d0d11] pl-9 pr-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/[0.15] transition-all"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status filter */}
              {STATUS_FILTERS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium border capitalize transition-all",
                    statusFilter === value
                      ? "bg-sky-500/[0.12] border-sky-500/30 text-sky-400"
                      : "border-white/[0.07] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.12]",
                  )}
                >
                  {label}
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white/[0.07] px-1 text-[9px] font-bold">
                    {statusCount(value)}
                  </span>
                </button>
              ))}

              {/* View toggle */}
              <div className="flex items-center rounded-xl border border-white/[0.07] bg-white/[0.03] p-0.5 ml-auto sm:ml-0">
                {(["grid", "list"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                      viewMode === mode
                        ? "bg-sky-500/[0.15] text-sky-400"
                        : "text-zinc-600 hover:text-zinc-300",
                    )}
                  >
                    {mode === "grid" ? "Grid" : "List"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Driver list ── */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl border border-white/[0.05] bg-[#0d0d11]">
              <p className="text-sm font-medium text-zinc-500">No drivers match your filters</p>
              <button
                onClick={() => { setStatusFilter("all"); setSearch(""); }}
                className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((d) => (
                <DriverCard
                  key={d.id}
                  driver={d}
                  shipments={shipments}
                  maxDeliveries={Math.max(...drivers.map((dr) => dr.totalDeliveries), 1)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-3 px-5 py-2.5 border-b border-white/[0.05] text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                <span>Driver</span>
                <span className="hidden sm:block">Vehicle</span>
                <span>Status</span>
                <span className="hidden sm:block">Rating</span>
                <span>Deliveries</span>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {filtered.map((d) => (
                  <DriverRow key={d.id} driver={d} shipments={shipments} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
