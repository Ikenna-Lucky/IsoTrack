"use client";

import { useState } from "react";
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
  CheckCircle2,
} from "lucide-react";
import {
  MOCK_DRIVERS,
  MOCK_SHIPMENTS,
  formatNaira,
  type DriverStatus,
  type VehicleType,
} from "@/lib/mock/business";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<
  DriverStatus,
  { label: string; color: string; bg: string; border: string; dot: string; ring: string }
> = {
  active:  { label: "Active",  color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "#10b981", ring: "ring-emerald-400" },
  idle:    { label: "Idle",    color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   dot: "#f59e0b", ring: "ring-amber-400"   },
  offline: { label: "Offline", color: "text-zinc-500",    bg: "bg-zinc-500/10",    border: "border-zinc-700/30",    dot: "#52526a", ring: "ring-zinc-700"    },
};

const VEHICLE_ICONS: Record<VehicleType, React.ElementType> = {
  motorcycle: Bike,
  car:        Car,
  van:        Truck,
  truck:      Truck,
};

// ─── Star rating bar ──────────────────────────────────────────────────────────

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
      <span className="ml-1 text-[10px] font-semibold text-amber-400">{rating}</span>
    </div>
  );
}

// ─── Podium ───────────────────────────────────────────────────────────────────

const PODIUM_ICONS = [Trophy, Medal, Award];
const PODIUM_COLORS = [
  { ring: "ring-amber-400", bg: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/25", text: "text-amber-400", num: "text-amber-400" },
  { ring: "ring-zinc-400",  bg: "from-zinc-500/15 to-zinc-400/10",    border: "border-zinc-500/20",  text: "text-zinc-400",  num: "text-zinc-400"  },
  { ring: "ring-orange-500",bg: "from-orange-500/15 to-amber-600/10", border: "border-orange-500/20",text: "text-orange-400",num: "text-orange-400" },
];

function Podium() {
  const top3 = [...MOCK_DRIVERS].sort((a, b) => b.rating - a.rating).slice(0, 3);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold text-white">Top Performers</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Ranked by rating this month</p>
        </div>
        <Trophy className="h-4 w-4 text-amber-400/60" />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        {top3.map((driver, idx) => {
          const cfg = PODIUM_COLORS[idx]!;
          const PodiumIcon = PODIUM_ICONS[idx]!;
          const currentShipment = driver.currentShipmentId
            ? MOCK_SHIPMENTS.find((s) => s.trackingId === driver.currentShipmentId)
            : null;
          return (
            <div
              key={driver.id}
              className={cn(
                "relative rounded-xl border p-4 text-center min-w-[160px] flex-shrink-0 sm:flex-1",
                cfg.border,
                idx === 0 && "ring-1 ring-amber-400/20 shadow-[0_0_24px_rgba(251,191,36,0.06)]",
              )}
              style={{ background: `linear-gradient(135deg, ${cfg.bg.split(" ")[0].replace("from-","").replace(/\//g, " / ")})` }}
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
                {driver.avatar}
              </div>

              <p className="text-xs font-semibold text-white truncate mb-1">
                {driver.name.split(" ")[0]}
              </p>
              <RatingStars rating={driver.rating} />
              <p className="text-[10px] text-zinc-600 mt-1.5">
                {driver.totalDeliveries} deliveries
              </p>
              <p className={cn("text-xs font-bold mt-1", cfg.num)}>
                {formatNaira(driver.monthlyEarnings)}
              </p>
              {driver.status === "active" && currentShipment && (
                <div className="mt-2 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/[0.12] px-1.5 py-1">
                  <p className="text-[9px] text-emerald-400 font-mono truncate">
                    {currentShipment.trackingId}
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

function DriverCard({ driver }: { driver: (typeof MOCK_DRIVERS)[0] }) {
  const cfg = STATUS_CFG[driver.status];
  const VehicleIcon = VEHICLE_ICONS[driver.vehicleType];
  const currentShipment = driver.currentShipmentId
    ? MOCK_SHIPMENTS.find((s) => s.trackingId === driver.currentShipmentId)
    : null;

  // Utilization: deliveries this month relative to fleet max
  const maxDeliveries = Math.max(...MOCK_DRIVERS.map((d) => d.totalDeliveries));
  const utilizationPct = Math.round((driver.totalDeliveries / maxDeliveries) * 100);

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
            {driver.avatar}
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
      <p className="text-sm font-semibold text-white mb-1">{driver.name}</p>
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

      {/* Current shipment or status */}
      {currentShipment ? (
        <div className="rounded-xl bg-sky-500/[0.06] border border-sky-500/[0.12] px-3 py-2">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-sky-600 mb-0.5">
            Active Delivery
          </p>
          <p className="text-[11px] font-mono font-semibold text-sky-400">
            {currentShipment.trackingId}
          </p>
          <p className="text-[10px] text-zinc-600 truncate">
            → {currentShipment.delivery.city}
          </p>
        </div>
      ) : driver.status === "idle" ? (
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
          <p className="text-[10px] text-zinc-600">This month</p>
          <p className="text-xs font-semibold text-zinc-300">{formatNaira(driver.monthlyEarnings)}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <a
            href={`tel:${driver.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-500 hover:text-white hover:border-white/[0.15] transition-all"
            title="Call driver"
          >
            <Phone className="h-3 w-3" />
          </a>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            <span>+12%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Driver list row ──────────────────────────────────────────────────────────

function DriverRow({ driver }: { driver: (typeof MOCK_DRIVERS)[0] }) {
  const cfg = STATUS_CFG[driver.status];
  const VehicleIcon = VEHICLE_ICONS[driver.vehicleType];
  const currentShipment = driver.currentShipmentId
    ? MOCK_SHIPMENTS.find((s) => s.trackingId === driver.currentShipmentId)
    : null;

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
          {driver.avatar}
        </div>
      </div>

      {/* Name + vehicle */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-zinc-200 truncate">{driver.name}</p>
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

      {/* Status + current delivery */}
      <div className="hidden md:block shrink-0 min-w-[140px]">
        {currentShipment ? (
          <div>
            <p className="text-[10px] font-mono font-semibold text-sky-400">{currentShipment.trackingId}</p>
            <p className="text-[10px] text-zinc-600">→ {currentShipment.delivery.city}</p>
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
        <p className="text-xs font-semibold text-zinc-300 tabular-nums">{formatNaira(driver.monthlyEarnings)}</p>
        <p className="text-[10px] text-zinc-600">this month</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <a
          href={`tel:${driver.phone}`}
          className="flex h-7 items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 text-[10px] font-medium text-zinc-400 hover:text-white hover:border-white/[0.15] transition-all"
        >
          <Phone className="h-3 w-3" />
          Call
        </a>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DriversPage() {
  const [statusFilter, setStatusFilter] = useState<DriverStatus | "all">("all");
  const [search, setSearch]             = useState("");
  const [viewMode, setViewMode]         = useState<"grid" | "list">("grid");

  const filtered = MOCK_DRIVERS.filter((d) => {
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.vehiclePlate.toLowerCase().includes(q) ||
      d.email.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const avgRating = (
    MOCK_DRIVERS.reduce((s, d) => s + d.rating, 0) / MOCK_DRIVERS.length
  ).toFixed(1);
  const totalDeliveries = MOCK_DRIVERS.reduce((s, d) => s + d.totalDeliveries, 0);
  const activeCount = MOCK_DRIVERS.filter((d) => d.status === "active").length;

  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Drivers</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            {activeCount} active &middot; {MOCK_DRIVERS.filter((d) => d.status === "idle").length} idle &middot;{" "}
            {MOCK_DRIVERS.filter((d) => d.status === "offline").length} offline
          </p>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Drivers",    value: String(MOCK_DRIVERS.length),  color: "text-sky-400",     sub: "Fleet size" },
          { label: "Online Now",       value: String(activeCount),           color: "text-emerald-400", sub: "Active drivers" },
          { label: "Avg Rating",       value: avgRating,                     color: "text-amber-400",   sub: "Fleet average" },
          { label: "Total Deliveries", value: String(totalDeliveries),       color: "text-violet-400",  sub: "All time" },
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
      <Podium />

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
          {(["all", "active", "idle", "offline"] as const).map((s) => {
            const count =
              s === "all" ? MOCK_DRIVERS.length : MOCK_DRIVERS.filter((d) => d.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium border capitalize transition-all",
                  statusFilter === s
                    ? "bg-sky-500/[0.12] text-sky-400 border-sky-500/[0.22]"
                    : "text-zinc-600 border-white/[0.06] hover:text-zinc-300 hover:bg-white/[0.04]",
                )}
              >
                {s !== "all" && (
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: STATUS_CFG[s as DriverStatus]?.dot }}
                  />
                )}
                {s}
                <span className="text-[10px] text-zinc-600 bg-white/[0.06] rounded-full px-1.5 py-px">
                  {count}
                </span>
              </button>
            );
          })}

          {/* View toggle */}
          <div className="flex items-center rounded-xl border border-white/[0.06] bg-[#0d0d11] p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                viewMode === "grid"
                  ? "bg-sky-500/[0.15] text-sky-400"
                  : "text-zinc-600 hover:text-zinc-300",
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                viewMode === "list"
                  ? "bg-sky-500/[0.15] text-sky-400"
                  : "text-zinc-600 hover:text-zinc-300",
              )}
            >
              <List className="h-3.5 w-3.5" />
              List
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-white/[0.06] bg-[#0d0d11]">
          <Truck className="h-10 w-10 mb-4 text-zinc-700 opacity-40" />
          <p className="text-sm font-medium text-zinc-600">No drivers match your filters</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((d) => <DriverCard key={d.id} driver={d} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] overflow-hidden">
          {/* List header */}
          <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/[0.05]">
            {["Driver", "Name & Vehicle", "Rating", "Delivery", "Earnings", ""].map((h) => (
              <div key={h} className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                {h}
              </div>
            ))}
          </div>
          {filtered.map((d) => <DriverRow key={d.id} driver={d} />)}
        </div>
      )}
    </div>
  );
}
