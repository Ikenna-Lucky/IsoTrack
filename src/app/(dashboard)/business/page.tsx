"use client";

import Link from "next/link";
import type { Route } from "next";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Clock,
  UserCheck,
  Package,
  Truck,
  MapPin,
  CheckCircle2,
  XCircle,
  Ban,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useShipments, getShipmentList } from "@/hooks/use-shipments";
import { useDrivers } from "@/hooks/use-driver";
import { useBusinessAnalytics } from "@/hooks/use-business";
import { useSocket } from "@/hooks/use-socket";
import type { ShipmentStatus } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

const STATUS_META: Record<
  ShipmentStatus,
  { label: string; dot: string; color: string; bg: string; border: string; bar: string; Icon: React.ElementType }
> = {
  pending: {
    label: "Pending",
    dot: "#f59e0b",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    bar: "bg-amber-400",
    Icon: Clock,
  },
  assigned: {
    label: "Assigned",
    dot: "#38bdf8",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-sky-400/20",
    bar: "bg-sky-400",
    Icon: UserCheck,
  },
  picked_up: {
    label: "Picked Up",
    dot: "#a78bfa",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
    bar: "bg-violet-400",
    Icon: Package,
  },
  in_transit: {
    label: "In Transit",
    dot: "#60a5fa",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    bar: "bg-blue-400",
    Icon: Truck,
  },
  out_for_delivery: {
    label: "Out for Delivery",
    dot: "#22d3ee",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
    bar: "bg-cyan-400",
    Icon: MapPin,
  },
  delivered: {
    label: "Delivered",
    dot: "#34d399",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    bar: "bg-emerald-400",
    Icon: CheckCircle2,
  },
  failed: {
    label: "Failed",
    dot: "#f87171",
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    border: "border-rose-400/20",
    bar: "bg-rose-400",
    Icon: XCircle,
  },
  cancelled: {
    label: "Cancelled",
    dot: "#71717a",
    color: "text-zinc-500",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/20",
    bar: "bg-zinc-500",
    Icon: Ban,
  },
};


// ─── useCountUp ───────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1300) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let current = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, color, id }: { data: number[]; color: string; id: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 68;
  const H = 30;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 6) - 3;
    return [x, y] as [number, number];
  });
  const polyPts = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const last = pts[pts.length - 1];

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${polyPts} ${W},${H}`} fill={`url(#${id})`} />
      <polyline
        points={polyPts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {last && <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />}
    </svg>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({
  label,
  value,
  trend,
  trendUp,
  sub,
  sparkData,
  sparkColor,
  accentClass,
  glowClass,
  sparkId,
}: {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  sub: string;
  sparkData: number[];
  sparkColor: string;
  accentClass: string;
  glowClass: string;
  sparkId: string;
}) {
  return (
    <div
      className={`group relative rounded-2xl border bg-[#0d0d11] p-3.5 sm:p-5 overflow-hidden
        transition-all duration-300 hover:-translate-y-0.5 ${accentClass}`}
    >
      {/* Subtle bottom glow */}
      <div
        className={`pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full blur-3xl opacity-[0.15] ${glowClass}`}
      />

      {/* Label row — sparkline hidden on mobile to free up width */}
      <div className="flex items-start justify-between mb-2.5 sm:mb-3.5">
        <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.1em] sm:tracking-[0.15em] text-zinc-500 leading-tight pr-1">
          {label}
        </p>
        <div className="hidden sm:block shrink-0">
          <Sparkline data={sparkData} color={sparkColor} id={sparkId} />
        </div>
      </div>

      {/* Value — smaller on mobile to prevent overflow */}
      <p className="text-xl sm:text-[32px] font-bold tracking-tight text-white leading-none mb-1 sm:mb-1.5 truncate">
        {value}
      </p>

      <p className="text-[10px] text-zinc-600 mb-2 sm:mb-3 truncate">{sub}</p>

      {/* Trend badge */}
      <div
        className={`inline-flex items-center gap-1 rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold
          ${trendUp ? "bg-emerald-500/[0.08] text-emerald-400" : "bg-rose-500/[0.08] text-rose-400"}`}
      >
        {trendUp ? (
          <TrendingUp className="h-2.5 w-2.5 shrink-0" />
        ) : (
          <TrendingDown className="h-2.5 w-2.5 shrink-0" />
        )}
        <span className="whitespace-nowrap">{trend}</span>
      </div>
    </div>
  );
}

// ─── Shipments table ──────────────────────────────────────────────────────────

// ─── Weekly bar chart ─────────────────────────────────────────────────────────

// ─── Fleet panel ──────────────────────────────────────────────────────────────

const DRIVER_STATUS_CONFIG = {
  available: { ring: "ring-emerald-400", label: "Available", bg: "bg-emerald-400" },
  on_delivery: { ring: "ring-sky-400", label: "On Delivery", bg: "bg-sky-400" },
  offline: { ring: "ring-zinc-700", label: "Offline", bg: "bg-zinc-600" },
} as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BusinessOverviewPage() {
  // ── Real data hooks ──────────────────────────────────────────────────────────
  const { data: analytics } = useBusinessAnalytics();
  const { data: shipmentsData, isLoading: shipmentsLoading } = useShipments({ pageSize: 20 });
  const { data: drivers = [], isLoading: driversLoading } = useDrivers();

  const shipments = getShipmentList(shipmentsData);

  // ── Derived stats ────────────────────────────────────────────────────────────
  const statusBreakdown = analytics?.statusBreakdown ?? {};
  const totalRevenueKobo = analytics?.totalRevenueKobo ?? 0;
  const totalShipments = analytics?.totalShipments ?? shipments.length;
  const deliveredCount =
    (analytics?.statusBreakdown?.delivered as number | undefined) ??
    shipments.filter((s) => s.status === "delivered").length;
  const availableDrivers = drivers.filter((d) => d.status === "available").length;
  const successRate = totalShipments > 0 ? Math.round((deliveredCount / totalShipments) * 100) : 0;

  // ── Live tracking — pick first active shipment ────────────────────────────────
  const activeShipment = shipments.find(
    (s) => s.status === "in_transit" || s.status === "out_for_delivery",
  );

  useSocket({
    trackingId: activeShipment?.trackingId ?? null,
  });

  // ── Animated counters ────────────────────────────────────────────────────────
  const animShipments = useCountUp(totalShipments);
  const animRevenue = useCountUp(totalRevenueKobo);
  const animDrivers = useCountUp(drivers.length);
  const animRate = useCountUp(successRate);

  // ── Cosmetic sparkline data (no time-series from backend) ────────────────────
  const base = Math.max(1, Math.floor(totalShipments / 7));
  const shipmentSpark = [0, 1, 2, 3, 4, 5, 6].map((i) =>
    Math.max(0, base + (i % 3 === 0 ? 1 : i % 2 === 0 ? -1 : 0)),
  );
  const revenueBase = Math.max(1, Math.floor(totalRevenueKobo / 7));
  const revenueSpark = shipmentSpark.map((v) => v * revenueBase);
  const driverSpark = [3, 4, 4, 5, 4, 5, availableDrivers];
  const rateSpark = [82, 85, 88, 86, 89, 91, successRate];

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-white tracking-tight whitespace-nowrap">
            Good morning 👋
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5 truncate">
            {new Date().toLocaleDateString("en-NG", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
            <span className="hidden sm:inline"> · Here&apos;s your fleet at a glance.</span>
          </p>
        </div>
        <Link
          href={"/business/shipments/new" as Route}
          className="flex items-center gap-2 rounded-xl bg-sky-500 px-3 sm:px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-400 active:scale-[0.98] transition-all shadow-lg shadow-sky-500/20 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Shipment</span>
        </Link>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Total Shipments"
          value={String(animShipments)}
          trend="+18%"
          trendUp={true}
          sub="All time"
          sparkData={shipmentSpark}
          sparkColor="#38bdf8"
          accentClass="border-sky-500/[0.15] bg-sky-500/[0.04]"
          glowClass="shadow-sky-500/10"
          sparkId="spark-shipments"
        />
        <KPICard
          label="Revenue (MTD)"
          value={formatNaira(animRevenue)}
          trend="+12%"
          trendUp={true}
          sub="This month"
          sparkData={revenueSpark}
          sparkColor="#34d399"
          accentClass="border-emerald-500/[0.15] bg-emerald-500/[0.04]"
          glowClass="shadow-emerald-500/10"
          sparkId="spark-revenue"
        />
        <KPICard
          label="Active Drivers"
          value={String(animDrivers)}
          trend={`${availableDrivers} online`}
          trendUp={availableDrivers > 0}
          sub="Registered"
          sparkData={driverSpark}
          sparkColor="#a78bfa"
          accentClass="border-violet-500/[0.15] bg-violet-500/[0.04]"
          glowClass="shadow-violet-500/10"
          sparkId="spark-drivers"
        />
        <KPICard
          label="Success Rate"
          value={`${animRate}%`}
          trend="+3%"
          trendUp={true}
          sub="Delivered"
          sparkData={rateSpark}
          sparkColor="#fb923c"
          accentClass="border-orange-500/[0.15] bg-orange-500/[0.04]"
          glowClass="shadow-orange-500/10"
          sparkId="spark-rate"
        />
      </div>

      {/* ── Recent Shipments + Status Breakdown ── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Recent Shipments — takes 2/3 width */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-[#0d0d11] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
            <p className="text-sm font-semibold text-white">Recent Shipments</p>
            <Link
              href={"/business/shipments" as Route}
              className="text-[11px] font-medium text-sky-400 hover:text-sky-300 transition-colors"
            >
              View all →
            </Link>
          </div>
          {shipmentsLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
            </div>
          ) : shipments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-sm text-zinc-600">No shipments yet</p>
              <Link href={"/business/shipments/new" as Route} className="text-xs text-sky-400 hover:text-sky-300 transition-colors">
                Create your first shipment →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {shipments.slice(0, 6).map((s) => {
                const meta = STATUS_META[s.status as keyof typeof STATUS_META] ?? STATUS_META.pending;
                return (
                  <div key={s.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.015] transition-colors">
                    <meta.Icon className={`h-4 w-4 shrink-0 ${meta.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-200 font-mono">{s.trackingId}</p>
                      <p className="text-[10px] text-zinc-600 truncate">
                        {s.pickupAddress?.city} → {s.deliveryAddress?.city}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-semibold text-white">{formatNaira(s.priceKobo)}</p>
                      <span className={`text-[9px] font-semibold uppercase tracking-wider ${meta.color}`}>
                        {meta.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status Breakdown — 1/3 width */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.05]">
            <p className="text-sm font-semibold text-white">Status Breakdown</p>
          </div>
          <div className="p-5 space-y-3">
            {Object.entries(STATUS_META).map(([key, meta]) => {
              const count = (statusBreakdown?.[key] as number | undefined) ??
                shipments.filter((s) => s.status === key).length;
              const pct = totalShipments > 0 ? Math.round((count / totalShipments) * 100) : 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-semibold ${meta.color}`}>{meta.label}</span>
                    <span className="text-[10px] text-zinc-500">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${meta.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Drivers strip ── */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
          <p className="text-sm font-semibold text-white">Driver Fleet</p>
          <Link
            href={"/business/drivers" as Route}
            className="text-[11px] font-medium text-sky-400 hover:text-sky-300 transition-colors"
          >
            Manage →
          </Link>
        </div>
        {driversLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          </div>
        ) : drivers.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-zinc-600">No drivers registered yet</p>
          </div>
        ) : (
          <div className="flex gap-0 overflow-x-auto divide-x divide-white/[0.04]">
            {drivers.slice(0, 6).map((d) => {
              const statusCfg = DRIVER_STATUS_CONFIG[d.status as keyof typeof DRIVER_STATUS_CONFIG] ?? DRIVER_STATUS_CONFIG.offline;
              const initials = (d.user?.name ?? "").split(" ").map((p: string) => p[0] ?? "").slice(0, 2).join("").toUpperCase() || "DV";
              return (
                <div key={d.id} className="flex flex-col items-center gap-2 px-5 py-4 shrink-0">
                  <div className="relative">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/25 to-teal-500/25 border border-sky-500/20 text-xs font-bold text-sky-300 uppercase">
                      {initials}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0d0d11] ${statusCfg.bg}`} />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-semibold text-zinc-200 truncate max-w-[64px]">
                      {(d.user?.name ?? "Driver").split(" ")[0]}
                    </p>
                    <p className={`text-[9px] font-medium ${statusCfg.ring.replace("ring-", "text-")}`}>{statusCfg.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
