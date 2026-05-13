"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Clock,
  Package,
  ChevronRight,
  Star,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Navigation,
} from "lucide-react";
import { useShipments, getShipmentList } from "@/hooks/use-shipments";
import { useAuthStore } from "@/store/auth";
import type { Shipment, ShipmentStatus } from "@/types";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

const STATUS_META: Record<
  ShipmentStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  pending:          { label: "Pending",          color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   dot: "#f59e0b" },
  assigned:         { label: "Driver Assigned",  color: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/20",     dot: "#0ea5e9" },
  picked_up:        { label: "Picked Up",        color: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/20",     dot: "#0ea5e9" },
  in_transit:       { label: "In Transit",       color: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/20",     dot: "#0ea5e9" },
  out_for_delivery: { label: "Out for Delivery", color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20",  dot: "#8b5cf6" },
  delivered:        { label: "Delivered",        color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "#10b981" },
  failed:           { label: "Failed",           color: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/20",    dot: "#f43f5e" },
  cancelled:        { label: "Cancelled",        color: "text-zinc-400",    bg: "bg-zinc-500/10",    border: "border-zinc-500/20",    dot: "#71717a" },
};

// ─── Timeline derivation ──────────────────────────────────────────────────────

const STATUS_STEPS = [
  { status: "pending",          label: "Order placed",      sub: "Shipment request received"      },
  { status: "assigned",         label: "Driver assigned",   sub: "A driver accepted your order"   },
  { status: "picked_up",        label: "Package picked up", sub: "Driver collected the package"   },
  { status: "out_for_delivery", label: "Out for delivery",  sub: "Driver is near your area"       },
  { status: "delivered",        label: "Delivered",         sub: "Package delivered successfully" },
] as const;

function deriveTimeline(s: Shipment) {
  const ORDER = STATUS_STEPS.map((st) => st.status as string);
  const currentIdx = Math.max(ORDER.indexOf(s.status), 0);
  const isFailed = s.status === "failed" || s.status === "cancelled";

  return STATUS_STEPS.map(({ status, label, sub }, i) => {
    const event = s.events?.find((e) => e.status === status);
    const time = event
      ? new Date(event.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "—";

    let state: "done" | "current" | "pending";
    if (isFailed)          state = i < currentIdx ? "done" : "pending";
    else if (i < currentIdx) state = "done";
    else if (i === currentIdx) state = "current";
    else                   state = "pending";

    return { label, sub: event?.message ?? sub, time, state };
  });
}

// ─── Animated counter ─────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return value;
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, color, id }: { data: number[]; color: string; id: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 68; const H = 30;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 6) - 3;
    return [x, y] as [number, number];
  });
  const polyPts = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const last = pts[pts.length - 1]!;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${polyPts} ${W},${H}`} fill={`url(#${id})`} />
      <polyline points={polyPts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({
  label, value, trend, trendUp, sub,
  sparkData, sparkColor, sparkId,
  accentClass, glowClass,
}: {
  label: string; value: string;
  trend?: string; trendUp?: boolean; sub: string;
  sparkData: number[]; sparkColor: string; sparkId: string;
  accentClass: string; glowClass: string;
}) {
  return (
    <div className={cn(
      "group relative rounded-2xl border bg-[#0d0d11] p-3.5 sm:p-5 overflow-hidden transition-all duration-300 hover:-translate-y-0.5",
      accentClass,
    )}>
      <div className={cn("pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full blur-3xl opacity-[0.15]", glowClass)} />
      <div className="flex items-start justify-between mb-2.5 sm:mb-3.5">
        <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.1em] sm:tracking-[0.15em] text-zinc-500 leading-tight pr-1">
          {label}
        </p>
        <div className="hidden sm:block shrink-0">
          <Sparkline data={sparkData} color={sparkColor} id={sparkId} />
        </div>
      </div>
      <p className="text-xl sm:text-[30px] font-bold tracking-tight text-white leading-none mb-1 sm:mb-1.5 truncate">
        {value}
      </p>
      <p className="text-[10px] text-zinc-600 mb-2 sm:mb-3 truncate">{sub}</p>
      {trend !== undefined && (
        <div className={cn(
          "inline-flex items-center gap-1 rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold",
          trendUp ? "bg-emerald-500/[0.08] text-emerald-400" : "bg-rose-500/[0.08] text-rose-400",
        )}>
          {trendUp
            ? <TrendingUp className="h-2.5 w-2.5 shrink-0" />
            : <TrendingDown className="h-2.5 w-2.5 shrink-0" />}
          <span className="whitespace-nowrap">{trend}</span>
        </div>
      )}
    </div>
  );
}

// ─── Timeline step ────────────────────────────────────────────────────────────

function TimelineStep({
  label, sub, time, state, isLast,
}: {
  label: string; sub: string; time: string;
  state: "done" | "current" | "pending"; isLast?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center shrink-0 pt-0.5">
        <div className={cn(
          "relative z-10 flex h-4 w-4 items-center justify-center rounded-full border text-[7px] font-bold",
          state === "done"    ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
          : state === "current" ? "border-violet-500 bg-violet-500/20 text-violet-400 animate-pulse"
          : "border-zinc-800 bg-zinc-900 text-zinc-700",
        )}>
          {state === "done" ? "✓" : state === "current" ? "●" : ""}
        </div>
        {!isLast && (
          <div className={cn("w-px flex-1 mt-1", state === "done" ? "bg-emerald-500/25" : "bg-zinc-800")} style={{ minHeight: 24 }} />
        )}
      </div>
      <div className="pb-3 min-w-0">
        <p className={cn(
          "text-[12px] font-semibold leading-tight",
          state === "done"    ? "text-zinc-200"
          : state === "current" ? "text-violet-300"
          : "text-zinc-700",
        )}>{label}</p>
        <p className="mt-0.5 text-[10px] text-zinc-600 truncate">{sub}</p>
        <p className={cn(
          "mt-0.5 text-[10px] font-medium",
          state === "done"    ? "text-emerald-500/60"
          : state === "current" ? "text-violet-400/70"
          : "text-zinc-800",
        )}>{time}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerOverviewPage() {
  const user = useAuthStore((s) => s.user);
  const { data: shipmentsData } = useShipments({ pageSize: 50 });
  const shipments = getShipmentList(shipmentsData);

  // Derived slices
  const activeDelivery  = shipments.find((s) => s.status === "out_for_delivery" || s.status === "in_transit");
  const pendingShipment = shipments.find((s) => s.status === "pending");
  const recentShipments = shipments.filter((s) => s.status === "delivered" || s.status === "failed").slice(0, 4);

  // Stats
  const totalSpent     = shipments.reduce((sum, s) => sum + s.priceKobo, 0);
  const deliveredCount = shipments.filter((s) => s.status === "delivered").length;
  const activeCount    = shipments.filter((s) =>
    ["out_for_delivery", "in_transit", "assigned", "picked_up"].includes(s.status),
  ).length;
  const totalCount = shipments.length;

  const animatedSpent = useCountUp(totalSpent);

  // Cosmetic sparklines
  const base = Math.max(1, Math.floor(totalCount / 7));
  const totalSpark     = [0,1,2,3,4,5,6].map((i) => Math.max(0, base + (i % 2 === 0 ? 1 : -1)));
  const deliveredSpark = totalSpark.map((v) => Math.round(v * (deliveredCount / Math.max(totalCount, 1))));
  const spentSpark     = totalSpark.map((v) => v * Math.max(1, Math.floor(totalSpent / Math.max(totalCount, 1))));

  const timeline = activeDelivery ? deriveTimeline(activeDelivery) : [];

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Hi, {user?.name?.split(" ")[0] ?? "there"} 👋
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            {new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" })}
            {" · "}Here&apos;s what&apos;s happening with your deliveries.
          </p>
        </div>
        <Link
          href="/customer/track"
          className="hidden sm:flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/20 shrink-0"
        >
          <Navigation className="h-4 w-4" />
          Track Package
        </Link>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Total Spent" value={formatNaira(animatedSpent)}
          trend={totalCount > 0 ? "+growing" : undefined} trendUp sub="All time"
          sparkData={spentSpark} sparkColor="#a78bfa" sparkId="sp-spent"
          accentClass="border-violet-500/[0.15] hover:border-violet-500/25" glowClass="bg-violet-500"
        />
        <KPICard
          label="Delivered" value={String(deliveredCount)}
          trend={deliveredCount > 0 ? `${deliveredCount} received` : undefined} trendUp sub="Successfully received"
          sparkData={deliveredSpark} sparkColor="#34d399" sparkId="sp-delivered"
          accentClass="border-emerald-500/[0.15] hover:border-emerald-500/25" glowClass="bg-emerald-500"
        />
        <KPICard
          label="Active" value={String(activeCount)} sub="Currently en route"
          sparkData={[0, 0, 1, 0, 1, 1, activeCount]} sparkColor="#38bdf8" sparkId="sp-active"
          accentClass="border-sky-500/[0.15] hover:border-sky-500/25" glowClass="bg-sky-500"
        />
        <KPICard
          label="All Shipments" value={String(totalCount)} sub="Lifetime total"
          sparkData={totalSpark} sparkColor="#71717a" sparkId="sp-total"
          accentClass="border-white/[0.06] hover:border-white/[0.1]" glowClass="bg-zinc-600"
        />
      </div>

      {/* ── Pending alert ── */}
      {pendingShipment && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/[0.18] bg-amber-500/[0.04] px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-zinc-200">Awaiting driver assignment</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              <span className="font-mono">{pendingShipment.trackingId}</span>
              {" · "}{pendingShipment.pickupAddress.city} → {pendingShipment.deliveryAddress.city}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-400">Pending</span>
        </div>
      )}

      {/* ── Active delivery ── */}
      {activeDelivery && (
        <div className="relative overflow-hidden rounded-2xl border border-violet-500/[0.22] bg-[#0d0d11]">
          <div className="pointer-events-none absolute -top-12 right-1/4 h-36 w-64 rounded-full bg-violet-500/[0.07] blur-3xl" />

          <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-3.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400">Live Tracking</span>
              <span className="hidden sm:block text-[10px] text-zinc-600 font-mono">{activeDelivery.trackingId}</span>
            </div>
            <Link
              href="/customer/track"
              className="flex items-center gap-1 rounded-lg border border-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-zinc-400 hover:text-white hover:border-white/[0.12] hover:bg-white/[0.03] transition-all"
            >
              Open map <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2">
            {/* Timeline */}
            <div>
              <p className="mb-3 text-[9px] font-semibold uppercase tracking-widest text-zinc-600">Delivery Progress</p>
              {timeline.map((ev, i) => (
                <TimelineStep key={i} label={ev.label} sub={ev.sub} time={ev.time} state={ev.state}
                  isLast={i === timeline.length - 1} />
              ))}
            </div>

            <div className="space-y-3">
              {/* Route */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                <p className="mb-3 text-[9px] font-semibold uppercase tracking-wider text-zinc-600">Route</p>
                <div className="flex items-start gap-2.5">
                  <div className="flex flex-col items-center pt-1 shrink-0">
                    <div className="h-2 w-2 rounded-full border-2 border-violet-400" />
                    <div className="my-1 h-8 w-px bg-gradient-to-b from-violet-500/40 to-rose-500/40" />
                    <MapPin className="h-2.5 w-2.5 text-rose-400" />
                  </div>
                  <div className="space-y-2.5 min-w-0 flex-1">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-zinc-700 mb-0.5">From</p>
                      <p className="text-[12px] font-medium text-zinc-200 truncate">
                        {activeDelivery.pickupAddress.street}, {activeDelivery.pickupAddress.city}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-zinc-700 mb-0.5">To</p>
                      <p className="text-[12px] font-medium text-zinc-200 truncate">
                        {activeDelivery.deliveryAddress.street}, {activeDelivery.deliveryAddress.city}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Driver */}
              {activeDelivery.driver && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                  <p className="mb-3 text-[9px] font-semibold uppercase tracking-wider text-zinc-600">Your Driver</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500/25 to-sky-500/25 border border-teal-500/20 text-[11px] font-bold text-teal-300">
                      {activeDelivery.driver.user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-200 truncate">{activeDelivery.driver.user.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-zinc-500">
                        <Star className="h-2.5 w-2.5 text-amber-400" />
                        <span>{activeDelivery.driver.rating.toFixed(1)}</span>
                        <span className="text-zinc-700">·</span>
                        <span className="capitalize">{activeDelivery.driver.vehicleType}</span>
                        <span className="text-zinc-700">·</span>
                        <span className="font-mono">{activeDelivery.driver.vehiclePlate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg border border-violet-500/20 bg-violet-500/10 px-2 py-1 text-[10px] font-bold text-violet-400 shrink-0">
                      <Clock className="h-2.5 w-2.5" />
                      En route
                    </div>
                  </div>
                  {activeDelivery.driver.user.phone && (
                    <a
                      href={`tel:${activeDelivery.driver.user.phone}`}
                      className="flex items-center justify-center gap-2 rounded-xl border border-teal-500/20 bg-teal-500/[0.08] py-2 text-xs font-semibold text-teal-400 hover:bg-teal-500/[0.15] transition-all"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Call {activeDelivery.driver.user.name.split(" ")[0]}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Recent shipments ── */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
          <div>
            <p className="text-sm font-semibold text-white">Recent Shipments</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">Your latest completed deliveries</p>
          </div>
          <Link
            href="/customer/shipments"
            className="flex items-center gap-1 rounded-lg border border-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-zinc-400 hover:text-white hover:border-white/[0.12] hover:bg-white/[0.03] transition-all"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentShipments.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <CheckCircle2 className="h-8 w-8 text-zinc-700" />
            <p className="text-sm text-zinc-600">No completed shipments yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {recentShipments.map((s) => {
              const meta = STATUS_META[s.status];
              return (
                <div key={s.id} className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-white/[0.015] transition-colors cursor-pointer">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: meta.dot, boxShadow: `0 0 5px ${meta.dot}80` }} />
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.02]">
                    <Package className="h-3.5 w-3.5 text-zinc-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-bold text-zinc-200">{s.trackingId}</p>
                    <p className="text-[10px] text-zinc-600 truncate mt-0.5">
                      {s.pickupAddress.city}<span className="text-zinc-700"> → </span>{s.deliveryAddress.city}
                      {s.description ? `  · ${s.description}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-bold tabular-nums text-zinc-300">{formatNaira(s.priceKobo)}</p>
                    <p className={cn("text-[10px] font-semibold mt-0.5", meta.color)}>{meta.label}</p>
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
