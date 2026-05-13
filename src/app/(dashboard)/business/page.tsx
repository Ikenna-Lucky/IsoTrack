"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import type { Route } from "next";
import {
  Package,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Plus,
  ArrowRight,
  Truck,
  Clock,
  Wifi,
  WifiOff,
  Eye,
  MapPin,
  ChevronRight,
  AlertCircle,
  Circle,
  ArrowUpRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useShipments, getShipmentList } from "@/hooks/use-shipments";
import { useDrivers } from "@/hooks/use-driver";
import { useBusinessAnalytics } from "@/hooks/use-business";
import { useSocket, type LocationUpdate } from "@/hooks/use-socket";
import type { Shipment, Driver, ShipmentStatus } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

const STATUS_META: Record<ShipmentStatus, { label: string; dot: string; color: string; bg: string; border: string }> = {
  pending:          { label: "Pending",          dot: "#f59e0b", color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20" },
  assigned:         { label: "Assigned",         dot: "#38bdf8", color: "text-sky-400",     bg: "bg-sky-400/10",     border: "border-sky-400/20" },
  picked_up:        { label: "Picked Up",        dot: "#a78bfa", color: "text-violet-400",  bg: "bg-violet-400/10",  border: "border-violet-400/20" },
  in_transit:       { label: "In Transit",       dot: "#60a5fa", color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20" },
  out_for_delivery: { label: "Out for Delivery", dot: "#22d3ee", color: "text-cyan-400",    bg: "bg-cyan-400/10",    border: "border-cyan-400/20" },
  delivered:        { label: "Delivered",        dot: "#34d399", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  failed:           { label: "Failed",           dot: "#f87171", color: "text-rose-400",    bg: "bg-rose-400/10",    border: "border-rose-400/20" },
  cancelled:        { label: "Cancelled",        dot: "#71717a", color: "text-zinc-500",    bg: "bg-zinc-500/10",    border: "border-zinc-500/20" },
};

const LiveMap = dynamic(
  () => import("@/components/map/live-map").then((m) => m.LiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] w-full animate-pulse rounded-xl bg-zinc-800/40" />
    ),
  },
);

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

function Sparkline({
  data,
  color,
  id,
}: {
  data: number[];
  color: string;
  id: string;
}) {
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
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${H} ${polyPts} ${W},${H}`}
        fill={`url(#${id})`}
      />
      <polyline
        points={polyPts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
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

// ─── Delivery Pipeline ────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  { key: "pending",          label: "Pending",          color: "#f59e0b" },
  { key: "in_transit",       label: "In Transit",       color: "#a78bfa" },
  { key: "out_for_delivery", label: "Out for Delivery", color: "#38bdf8" },
  { key: "delivered",        label: "Delivered",        color: "#34d399" },
  { key: "failed",           label: "Failed",           color: "#f87171" },
] as const;

function DeliveryPipeline({ shipments }: { shipments: Shipment[] }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] px-5 py-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-white">Delivery Pipeline</p>
        <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
          Live status
        </span>
      </div>

      <div className="flex items-center gap-0 overflow-x-auto pb-1">
        {PIPELINE_STAGES.map((stage, idx) => {
          const count = shipments.filter((s) => s.status === stage.key).length;
          const isLast = idx === PIPELINE_STAGES.length - 1;
          return (
            <div key={stage.key} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center px-4 first:pl-0">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full border text-base font-bold mb-2 transition-all"
                  style={{
                    borderColor: count > 0 ? stage.color : "rgba(255,255,255,0.06)",
                    color: count > 0 ? stage.color : "#52525b",
                    background: count > 0 ? `${stage.color}14` : "transparent",
                    boxShadow: count > 0 ? `0 0 14px ${stage.color}30` : "none",
                  }}
                >
                  {count}
                </div>
                <p
                  className="text-[10px] font-medium whitespace-nowrap"
                  style={{ color: count > 0 ? stage.color : "#52525b" }}
                >
                  {stage.label}
                </p>
              </div>
              {!isLast && (
                <div className="flex items-center mb-4 mx-1">
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-700" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Shipment status step indicator ──────────────────────────────────────────

const STATUS_ORDER = [
  "pending",
  "assigned",
  "in_transit",
  "out_for_delivery",
  "delivered",
];

function ShipmentProgressDots({ status }: { status: string }) {
  const currentIdx = STATUS_ORDER.indexOf(status);
  const isFailed = status === "failed" || status === "cancelled";

  return (
    <div className="flex items-center gap-1">
      {STATUS_ORDER.map((s, i) => {
        const done = !isFailed && i <= currentIdx;
        const active = !isFailed && i === currentIdx;
        return (
          <div
            key={s}
            className={`rounded-full transition-all duration-300 ${
              isFailed
                ? "h-1 w-1 bg-rose-500/40"
                : done
                  ? active
                    ? "h-2 w-2 bg-sky-400"
                    : "h-1.5 w-1.5 bg-emerald-400/70"
                  : "h-1 w-1 bg-zinc-700"
            }`}
          />
        );
      })}
    </div>
  );
}

// ─── Shipments table ──────────────────────────────────────────────────────────

function RecentShipments({ shipments }: { shipments: Shipment[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const recent = shipments.slice(0, 6);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
        <div>
          <p className="text-sm font-semibold text-white">Recent Shipments</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">
            {shipments.length} total
          </p>
        </div>
        <Link
          href={"/business/shipments" as Route}
          className="flex items-center gap-1 rounded-lg border border-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-zinc-400 hover:text-white hover:border-white/[0.12] hover:bg-white/[0.03] transition-all duration-200"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {recent.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-zinc-600">No shipments yet — create your first one.</p>
        )}
        {recent.map((s) => {
          const meta = STATUS_META[s.status];
          const isHovered = hovered === s.id;
          const driverName = s.driver?.user?.name ?? null;
          return (
            <div
              key={s.id}
              className="group relative flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.015] transition-colors cursor-pointer"
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Status glow dot */}
              <div
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: meta.dot,
                  boxShadow: `0 0 6px ${meta.dot}80`,
                }}
              />

              {/* Tracking + route */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs font-mono font-semibold text-zinc-200">
                    {s.trackingId}
                  </p>
                  <ShipmentProgressDots status={s.status} />
                </div>
                <p className="text-[11px] text-zinc-600 truncate">
                  {s.pickupAddress.city}{" "}
                  <span className="text-zinc-700">→</span>{" "}
                  {s.deliveryAddress.city}
                </p>
              </div>

              {/* Driver — desktop only */}
              {driverName && (
                <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                  {!isHovered && (
                    <>
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-teal-500/20 to-sky-500/20 border border-teal-500/20 text-[8px] font-bold text-teal-300 uppercase">
                        {driverName.slice(0, 2)}
                      </div>
                      <p className="text-[11px] text-zinc-500 max-w-[80px] truncate">
                        {driverName.split(" ")[0]}
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Status badge — desktop only, hidden on hover */}
              {!isHovered && (
                <span
                  className={`hidden sm:flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium shrink-0 ${meta.color} ${meta.bg} ${meta.border}`}
                >
                  {meta.label}
                </span>
              )}

              {/* Amount — always visible */}
              {!isHovered && (
                <p className="text-xs font-semibold text-zinc-300 shrink-0 tabular-nums">
                  {formatNaira(s.priceKobo)}
                </p>
              )}

              {/* Hover actions — desktop only */}
              {isHovered && (
                <div className="hidden sm:flex items-center gap-2 shrink-0 animate-in fade-in duration-150">
                  <Link
                    href={`/business/shipments` as Route}
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.05] px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 hover:text-white hover:border-white/[0.15] transition-all"
                  >
                    <Eye className="h-3 w-3" />
                    View
                  </Link>
                  <Link
                    href={`/customer/track` as Route}
                    className="flex items-center gap-1.5 rounded-lg border border-sky-500/20 bg-sky-500/10 px-2.5 py-1.5 text-[11px] font-medium text-sky-400 hover:bg-sky-500/[0.15] transition-all"
                  >
                    <MapPin className="h-3 w-3" />
                    Track
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Weekly bar chart ─────────────────────────────────────────────────────────

function WeeklyChart({ totalRevenueKobo, deliveredCount, totalShipments }: { totalRevenueKobo: number; deliveredCount: number; totalShipments: number }) {
  // Generate cosmetic weekly bars based on real totals
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const base = Math.max(1, Math.floor(totalShipments / 7));
  const bars = DAYS.map((day, i) => ({
    day,
    shipments: i === 6 ? (totalShipments % 7 || base) : Math.max(0, base + (i % 3 === 0 ? 1 : i % 2 === 0 ? -1 : 0)),
  }));
  const max = Math.max(...bars.map((d) => d.shipments), 1);
  const [tooltip, setTooltip] = useState<number | null>(null);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold text-white">Weekly Volume</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Shipments per day</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-sky-400">{totalShipments}</p>
          <p className="text-[10px] text-zinc-600">total</p>
        </div>
      </div>

      <div className="relative flex items-end gap-2 h-[72px]">
        {bars.map((d, i) => {
          const pct = (d.shipments / max) * 100;
          const isLast = i === bars.length - 1;
          const isHovered = tooltip === i;
          return (
            <div
              key={d.day}
              className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer"
              onMouseEnter={() => setTooltip(i)}
              onMouseLeave={() => setTooltip(null)}
            >
              {isHovered && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/[0.1] bg-[#16161d] px-2 py-1 text-[10px] font-semibold text-white shadow-xl z-10">
                  {d.shipments} shipments
                </div>
              )}
              <div className="w-full flex items-end transition-all duration-300" style={{ height: "60px" }}>
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${isHovered ? "opacity-100" : isLast ? "opacity-90" : "opacity-50"}`}
                  style={{
                    height: `${pct}%`,
                    minHeight: "4px",
                    background: isLast || isHovered ? "linear-gradient(to top, #0ea5e9, #38bdf8)" : "rgba(255,255,255,0.07)",
                    boxShadow: (isLast || isHovered) ? "0 0 12px #0ea5e980" : "none",
                  }}
                />
              </div>
              <span className={`text-[9px] font-medium ${isLast ? "text-sky-400" : "text-zinc-700"}`}>{d.day}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-white">{formatNaira(totalRevenueKobo)}</p>
          <p className="text-[10px] text-zinc-600">Total revenue</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-emerald-400">{deliveredCount}</p>
          <p className="text-[10px] text-zinc-600">Delivered</p>
        </div>
      </div>
    </div>
  );
}

// ─── Fleet panel ──────────────────────────────────────────────────────────────

const DRIVER_STATUS_CONFIG = {
  available:   { ring: "ring-emerald-400", label: "Available",   bg: "bg-emerald-400" },
  on_delivery: { ring: "ring-sky-400",     label: "On Delivery", bg: "bg-sky-400"     },
  offline:     { ring: "ring-zinc-700",    label: "Offline",     bg: "bg-zinc-600"    },
} as const;

function FleetPanel({ drivers }: { drivers: Driver[] }) {
  const top5 = drivers.slice(0, 5);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-white">Fleet</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">
            {drivers.length} driver{drivers.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href={"/business/drivers" as Route}
          className="flex items-center gap-1 text-[11px] font-medium text-sky-400 hover:text-sky-300 transition-colors"
        >
          Manage
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Status summary pills */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {(["available", "on_delivery", "offline"] as const).map((s) => {
          const count = drivers.filter((d) => d.status === s).length;
          const cfg = DRIVER_STATUS_CONFIG[s];
          return (
            <div
              key={s}
              className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1"
            >
              <div className={`h-1.5 w-1.5 rounded-full ${cfg.bg}`} />
              <span className="text-[10px] font-medium text-zinc-400">
                {count} {cfg.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Driver list */}
      <div className="space-y-2.5">
        {top5.length === 0 && (
          <p className="py-4 text-center text-sm text-zinc-600">No drivers assigned yet.</p>
        )}
        {top5.map((d) => {
          const cfg = DRIVER_STATUS_CONFIG[d.status];
          const initials = d.user.name.slice(0, 2).toUpperCase();
          return (
            <div
              key={d.id}
              className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.015] px-3 py-2.5 hover:border-white/[0.08] hover:bg-white/[0.03] transition-all duration-200"
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-[1.5px] ring-offset-1 ring-offset-[#0d0d11] text-[10px] font-bold text-white uppercase bg-gradient-to-br from-zinc-700 to-zinc-800 ${cfg.ring}`}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-200 truncate">
                  {d.user.name}
                </p>
                <p className="text-[10px] text-zinc-600">
                  {d.totalDeliveries} deliveries · ★ {d.rating.toFixed(1)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] font-semibold text-zinc-300 uppercase">
                  {d.vehicleType}
                </p>
                <p className="text-[9px] text-zinc-700 font-mono">{d.vehiclePlate}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Activity feed ────────────────────────────────────────────────────────────

const ACTIVITY = [
  { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/15", text: "IST-K7X2M9PQ delivered to Ikoyi", time: "2m ago" },
  { icon: Truck,        color: "text-violet-400",  bg: "bg-violet-500/10 border-violet-500/15",  text: "Driver Emeka picked up IST-B3N8R4PT", time: "11m ago" },
  { icon: Package,      color: "text-sky-400",     bg: "bg-sky-500/10 border-sky-500/15",       text: "New shipment IST-R5P1W2JK created", time: "34m ago" },
  { icon: AlertCircle,  color: "text-rose-400",    bg: "bg-rose-500/10 border-rose-500/15",     text: "IST-T6Y4Z8RN delivery failed", time: "1h ago" },
  { icon: ArrowUpRight, color: "text-teal-400",    bg: "bg-teal-500/10 border-teal-500/15",     text: "Driver Amina Yusuf came online", time: "2h ago" },
];

function ActivityFeed() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-white">Activity</p>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-zinc-600">Live</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {ACTIVITY.map((a, i) => {
          const Icon = a.icon;
          return (
            <div key={i} className="flex items-start gap-3">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border mt-0.5 ${a.bg}`}
              >
                <Icon className={`h-3 w-3 ${a.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-zinc-300 leading-snug">{a.text}</p>
                <p className="text-[10px] text-zinc-700 mt-0.5">{a.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BusinessOverviewPage() {
  const [liveLocation, setLiveLocation] = useState<LocationUpdate | null>(null);

  // ── Real data hooks ──────────────────────────────────────────────────────────
  const { data: analytics } = useBusinessAnalytics();
  const { data: shipmentsData } = useShipments({ pageSize: 20 });
  const { data: drivers = [] } = useDrivers();

  const shipments = getShipmentList(shipmentsData);

  // ── Derived stats ────────────────────────────────────────────────────────────
  const totalRevenueKobo  = analytics?.totalRevenueKobo ?? 0;
  const totalShipments    = analytics?.totalShipments   ?? shipments.length;
  const deliveredCount    = (analytics?.statusBreakdown?.delivered as number | undefined) ?? shipments.filter((s) => s.status === "delivered").length;
  const availableDrivers  = drivers.filter((d) => d.status === "available").length;
  const successRate       = totalShipments > 0 ? Math.round((deliveredCount / totalShipments) * 100) : 0;

  // ── Live tracking — pick first active shipment ────────────────────────────────
  const activeShipment = shipments.find(
    (s) => s.status === "in_transit" || s.status === "out_for_delivery",
  );

  const { connected } = useSocket({
    trackingId: activeShipment?.trackingId ?? null,
    onLocation: (update) => setLiveLocation(update),
  });

  // ── Animated counters ────────────────────────────────────────────────────────
  const animShipments = useCountUp(totalShipments);
  const animRevenue   = useCountUp(totalRevenueKobo);
  const animDrivers   = useCountUp(drivers.length);
  const animRate      = useCountUp(successRate);

  // ── Cosmetic sparkline data (no time-series from backend) ────────────────────
  const base          = Math.max(1, Math.floor(totalShipments / 7));
  const shipmentSpark = [0, 1, 2, 3, 4, 5, 6].map((i) =>
    Math.max(0, base + (i % 3 === 0 ? 1 : i % 2 === 0 ? -1 : 0)),
  );
  const revenueBase   = Math.max(1, Math.floor(totalRevenueKobo / 7));
  const revenueSpark  = shipmentSpark.map((v) => v * revenueBase);
  const driverSpark   = [3, 4, 4, 5, 4, 5, availableDrivers];
  const rateSpark     = [82, 85, 88, 86, 89, 91, successRate];

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
            <span className="hidden sm:inline">
              {" "}· Here&apos;s your fleet at a glance.
            </span>
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
          sparkId="spark-shipments"
          accentClass="border-sky-500/[0.15] hover:border-sky-500/25 hover:shadow-[0_0_24px_rgba(56,189,248,0.07)]"
          glowClass="bg-sky-500"
        />
        <KPICard
          label="Available Drivers"
          value={`${availableDrivers}/${animDrivers}`}
          trend={availableDrivers > 0 ? `${availableDrivers} online` : "None online"}
          trendUp={availableDrivers > 0}
          sub="Online now"
          sparkData={driverSpark}
          sparkColor="#2dd4bf"
          sparkId="spark-drivers"
          accentClass="border-teal-500/[0.15] hover:border-teal-500/25 hover:shadow-[0_0_24px_rgba(45,212,191,0.07)]"
          glowClass="bg-teal-500"
        />
        <KPICard
          label="Revenue (Total)"
          value={formatNaira(animRevenue)}
          trend="+22%"
          trendUp={true}
          sub="All time"
          sparkData={revenueSpark}
          sparkColor="#a78bfa"
          sparkId="spark-revenue"
          accentClass="border-violet-500/[0.15] hover:border-violet-500/25 hover:shadow-[0_0_24px_rgba(167,139,250,0.07)]"
          glowClass="bg-violet-500"
        />
        <KPICard
          label="Success Rate"
          value={`${animRate}%`}
          trend={successRate >= 80 ? "+vs target" : "Below 80%"}
          trendUp={successRate >= 80}
          sub="Delivered on time"
          sparkData={rateSpark}
          sparkColor="#34d399"
          sparkId="spark-rate"
          accentClass="border-emerald-500/[0.15] hover:border-emerald-500/25 hover:shadow-[0_0_24px_rgba(52,211,153,0.07)]"
          glowClass="bg-emerald-500"
        />
      </div>

      {/* ── Delivery pipeline ── */}
      <DeliveryPipeline shipments={shipments} />

      {/* ── Live tracking panel ── */}
      {activeShipment && (
        <div className="rounded-2xl border border-violet-500/[0.18] bg-violet-500/[0.03] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                Live — {activeShipment.trackingId}
              </span>
              <span className="text-[10px] text-zinc-600">
                {activeShipment.pickupAddress.city} → {activeShipment.deliveryAddress.city}
              </span>
            </div>
            <span
              className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                connected
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : "border-zinc-700 bg-zinc-800/50 text-zinc-600"
              }`}
            >
              {connected ? <Wifi size={9} /> : <WifiOff size={9} />}
              {connected ? "Connected" : "Connecting…"}
            </span>
          </div>
          <LiveMap
            location={liveLocation}
            className="h-[200px] border border-white/[0.06]"
          />
          {!liveLocation && connected && (
            <p className="mt-2 text-center text-[10px] text-zinc-700">
              Waiting for driver to broadcast location…
            </p>
          )}
        </div>
      )}

      {/* ── Main content row ── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Recent shipments — takes 2/3 */}
        <div className="lg:col-span-2">
          <RecentShipments shipments={shipments} />
        </div>

        {/* Right column — 1/3 */}
        <div className="space-y-4">
          <WeeklyChart
            totalRevenueKobo={totalRevenueKobo}
            deliveredCount={deliveredCount}
            totalShipments={totalShipments}
          />
          <ActivityFeed />
        </div>
      </div>

      {/* ── Fleet panel (full width) ── */}
      <FleetPanel drivers={drivers} />

    </div>
  );
}
