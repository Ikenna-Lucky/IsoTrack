"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  MapPin,
  Phone,
  Package,
  CheckCircle2,
  Clock,
  TrendingUp,
  Star,
  Navigation,
  ChevronRight,
  Wifi,
  WifiOff,
  ArrowRight,
  Flame,
  AlertCircle,
} from "lucide-react";
import {
  CURRENT_DRIVER,
  MOCK_DELIVERIES,
  DAILY_EARNINGS,
  STATUS_META,
  formatNaira,
} from "@/lib/mock/driver";
import { useSocket } from "@/hooks/use-socket";
import { cn } from "@/lib/utils";

// ─── Derived data ─────────────────────────────────────────────────────────────

const activeDelivery   = MOCK_DELIVERIES.find((d) => d.status === "out_for_delivery")!;
const recentDeliveries = MOCK_DELIVERIES.filter((d) => d.status === "delivered").slice(0, 4);
const todayStats       = DAILY_EARNINGS[DAILY_EARNINGS.length - 1]!;
const weekEarnings     = DAILY_EARNINGS.reduce((s, d) => s + d.earning, 0);
const maxEarning       = Math.max(...DAILY_EARNINGS.map((d) => d.earning));

const ROUTE_WAYPOINTS = [
  { lat: 6.4355, lng: 3.4197 },
  { lat: 6.4398, lng: 3.4289 },
  { lat: 6.4441, lng: 3.4312 },
  { lat: 6.4478, lng: 3.4389 },
  { lat: 6.4512, lng: 3.4401 },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let cur = 0;
    const inc = target / (duration / 16);
    const t = setInterval(() => {
      cur += inc;
      if (cur >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return count;
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, color, id }: { data: number[]; color: string; id: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 68; const H = 30;
  const pts = data.map((v, i): [number, number] => [
    (i / (data.length - 1)) * W,
    H - ((v - min) / range) * (H - 6) - 3,
  ]);
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
  sparkData, sparkColor, accentClass, glowClass, sparkId,
}: {
  label: string; value: string; trend: string; trendUp: boolean; sub: string;
  sparkData: number[]; sparkColor: string; accentClass: string; glowClass: string; sparkId: string;
}) {
  const TrendIcon = TrendingUp;
  return (
    <div className={cn(
      "group relative rounded-2xl border bg-[#0d0d11] p-3.5 sm:p-5 overflow-hidden",
      "transition-all duration-300 hover:-translate-y-0.5",
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
      <p className="text-xl sm:text-[32px] font-bold tracking-tight text-white leading-none mb-1 sm:mb-1.5 truncate">
        {value}
      </p>
      <p className="text-[10px] text-zinc-600 mb-2 sm:mb-3 truncate">{sub}</p>
      <div className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold max-w-full overflow-hidden",
        trendUp ? "bg-emerald-500/[0.08] text-emerald-400" : "bg-rose-500/[0.08] text-rose-400",
      )}>
        <TrendIcon className="h-2.5 w-2.5 shrink-0" />
        <span className="truncate">{trend}</span>
      </div>
    </div>
  );
}

// ─── Active delivery card ─────────────────────────────────────────────────────

function ActiveDeliveryCard({
  statusOnline,
  connected,
}: {
  statusOnline: boolean;
  connected: boolean;
}) {
  if (!activeDelivery) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-500/[0.22] bg-[#0d0d11]">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-16 left-1/3 h-40 w-72 rounded-full bg-violet-500/[0.08] blur-3xl" />

      {/* Header bar — wraps on mobile */}
      <div className="relative flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-violet-500/[0.1]">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400 shadow-[0_0_8px_#8b5cf6]" />
          <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
            Active Delivery
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={cn(
            "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
            connected
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border-zinc-700 bg-zinc-800/50 text-zinc-600",
          )}>
            {connected ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
            <span className="hidden sm:inline">{connected ? "Broadcasting" : "Connecting…"}</span>
            <span className="sm:hidden">{connected ? "Live" : "…"}</span>
          </span>
          <span className="rounded-full bg-violet-500/15 border border-violet-500/20 px-2.5 py-0.5 font-mono text-[10px] sm:text-[11px] font-semibold text-violet-300">
            {activeDelivery.trackingId}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="relative px-4 sm:px-5 py-4 space-y-4">

        {/* Route */}
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center pt-1 shrink-0">
            <div className="h-3 w-3 rounded-full border-2 border-teal-400 bg-transparent" />
            <div className="my-1.5 h-10 w-px bg-gradient-to-b from-teal-500/40 to-violet-500/40" />
            <MapPin className="h-3.5 w-3.5 text-violet-400" />
          </div>
          <div className="flex-1 space-y-3.5 min-w-0">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-0.5">Pickup</p>
              <p className="text-sm font-medium text-zinc-100 truncate">
                {activeDelivery.pickup.address}, {activeDelivery.pickup.city}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-0.5">Delivering to</p>
              <p className="text-sm font-medium text-zinc-100 truncate">
                {activeDelivery.delivery.address}, {activeDelivery.delivery.city}
              </p>
            </div>
          </div>
        </div>

        {/* Meta strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Customer", value: activeDelivery.customer.name, color: "text-zinc-200" },
            { label: "ETA",      value: activeDelivery.eta ?? "—",    color: "text-teal-400" },
            { label: "Distance", value: activeDelivery.distance,      color: "text-zinc-300" },
            { label: "Earning",  value: formatNaira(activeDelivery.driverEarning), color: "text-emerald-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600 mb-0.5">{label}</p>
              <p className={cn("text-[13px] font-semibold truncate", color)}>{value}</p>
            </div>
          ))}
        </div>

        {/* Actions — stacked on mobile, row on sm+ */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5">
          <a
            href={`tel:${activeDelivery.customer.phone}`}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-teal-500/25 bg-teal-500/10 px-4 py-2.5 text-xs font-semibold text-teal-400 hover:bg-teal-500/[0.18] hover:border-teal-500/40 transition-all"
          >
            <Phone className="h-3.5 w-3.5" />
            Call Customer
          </a>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-500 active:scale-[0.98] transition-all shadow-lg shadow-violet-500/20">
            <CheckCircle2 className="h-4 w-4" />
            Mark as Delivered
          </button>
        </div>

        {statusOnline && (
          <p className="text-center text-[10px] text-zinc-700">
            📍 Your location is being shared with the customer every 4 seconds
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Weekly chart ─────────────────────────────────────────────────────────────

function WeeklyChart() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [touchedIdx, setTouchedIdx]  = useState<number | null>(null);
  const activeIdx = hoveredIdx ?? touchedIdx;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold text-white">Weekly Earnings</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Income per day</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-teal-400">{formatNaira(weekEarnings)}</p>
          <p className="text-[10px] text-zinc-600">this week</p>
        </div>
      </div>

      <div className="flex items-stretch gap-1.5 sm:gap-2 h-28 sm:h-[72px]">
        {DAILY_EARNINGS.map(({ day, earning, deliveries }, i) => {
          const pct      = (earning / maxEarning) * 100;
          const isToday  = i === DAILY_EARNINGS.length - 1;
          const isActive = activeIdx === i;
          return (
            <div
              key={day}
              className="relative flex-1 flex flex-col items-center gap-1.5 cursor-pointer select-none"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              onTouchStart={() => setTouchedIdx(i)}
              onTouchEnd={() => setTimeout(() => setTouchedIdx(null), 1200)}
            >
              {/* Tooltip */}
              {isActive && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-lg border border-white/[0.1] bg-[#16161d] px-2.5 py-1.5 text-center shadow-xl pointer-events-none">
                  <p className="text-[11px] font-bold text-white">{formatNaira(earning)}</p>
                  <p className="text-[9px] text-zinc-500">{deliveries} trips</p>
                </div>
              )}
              {/* Bar area — flex-1 fills remaining height, bars grow from bottom */}
              <div className="flex-1 min-h-0 w-full flex items-end">
                <div
                  className="w-full rounded-t-md transition-all duration-300"
                  style={{
                    height: `${Math.max(pct, 5)}%`,
                    background: isToday || isActive
                      ? "linear-gradient(to top, #0d9488, #2dd4bf)"
                      : "rgba(255,255,255,0.07)",
                    boxShadow: (isToday || isActive) ? "0 0 12px #0d948880" : "none",
                    opacity: isToday ? 1 : isActive ? 0.95 : 0.6,
                  }}
                />
              </div>
              <span className={cn(
                "text-[9px] font-medium",
                isToday ? "text-teal-400" : "text-zinc-700",
              )}>
                {day}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-white">{todayStats.deliveries} trips</p>
          <p className="text-[10px] text-zinc-600">Today</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-emerald-400">{formatNaira(todayStats.earning)}</p>
          <p className="text-[10px] text-zinc-600">Today's earnings</p>
        </div>
      </div>
    </div>
  );
}

// ─── Recent deliveries ────────────────────────────────────────────────────────

function RecentDeliveries() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-white/[0.05]">
        <div>
          <p className="text-sm font-semibold text-white">Recent Deliveries</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">{MOCK_DELIVERIES.length} total assignments</p>
        </div>
        <Link
          href={"/driver/deliveries" as Route}
          className="flex items-center gap-1 rounded-lg border border-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-zinc-400 hover:text-white hover:border-white/[0.12] hover:bg-white/[0.03] transition-all"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {recentDeliveries.map((d) => {
          const meta = STATUS_META[d.status];
          return (
            <div
              key={d.id}
              className="flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-white/[0.015] transition-colors"
            >
              {/* Status dot */}
              <div
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: meta.dot, boxShadow: `0 0 6px ${meta.dot}80` }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-mono text-xs font-semibold text-zinc-200 truncate">{d.trackingId}</p>
                </div>
                <p className="text-[11px] text-zinc-600 truncate">
                  {d.pickup.city} <span className="text-zinc-700">→</span> {d.delivery.city}
                  {" · "}{d.customer.name}
                </p>
              </div>

              {/* Distance — desktop only */}
              <div className="hidden sm:flex items-center gap-1 shrink-0">
                <Navigation className="h-3 w-3 text-zinc-700" />
                <span className="text-[11px] text-zinc-600">{d.distance}</span>
              </div>

              {/* Earning */}
              <p className="text-xs font-bold text-emerald-400 shrink-0 tabular-nums">
                +{formatNaira(d.driverEarning)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Activity feed ────────────────────────────────────────────────────────────

const ACTIVITY = [
  { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/15", text: "IST-T8VL3ZKP delivered to Apapa",           time: "2h ago"    },
  { icon: Star,         color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/15",    text: "Customer rated you ★ 4.9",                  time: "3h ago"    },
  { icon: Package,      color: "text-violet-400",  bg: "bg-violet-500/10 border-violet-500/15",  text: "New delivery: IST-K7X2M9PQ assigned",        time: "4h ago"    },
  { icon: AlertCircle,  color: "text-rose-400",    bg: "bg-rose-500/10 border-rose-500/15",      text: "IST-H4FR7NKP failed — customer unreachable", time: "Yesterday" },
  { icon: Flame,        color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/15",  text: "5-day delivery streak 🔥",                   time: "Yesterday" },
];

function ActivityFeed() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-4 sm:p-5">
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
              <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border mt-0.5", a.bg)}>
                <Icon className={cn("h-3 w-3", a.color)} />
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

export default function DriverOverviewPage() {
  const [statusOnline,  setStatusOnline]  = useState(true);
  const [waypointIndex, setWaypointIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { connected, emitLocation } = useSocket({
    trackingId: activeDelivery?.trackingId ?? null,
  });

  useEffect(() => {
    if (!activeDelivery || !statusOnline) return;
    intervalRef.current = setInterval(() => {
      setWaypointIndex((prev) => {
        const next = (prev + 1) % ROUTE_WAYPOINTS.length;
        const wp   = ROUTE_WAYPOINTS[next]!;
        emitLocation({
          trackingId: activeDelivery.trackingId,
          lat:     wp.lat + (Math.random() - 0.5) * 0.0008,
          lng:     wp.lng + (Math.random() - 0.5) * 0.0008,
          heading: Math.random() * 360,
          speed:   18 + Math.random() * 12,
        });
        return next;
      });
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [statusOnline, emitLocation]);

  // Animated counters
  const animEarnings   = useCountUp(todayStats.earning);
  const animDeliveries = useCountUp(todayStats.deliveries);
  const animTotal      = useCountUp(CURRENT_DRIVER.totalDeliveries);

  // Sparkline data
  const earnSpark  = DAILY_EARNINGS.map((d) => d.earning);
  const tripSpark  = DAILY_EARNINGS.map((d) => d.deliveries);
  const totalSpark = [270, 274, 278, 281, 284, 286, CURRENT_DRIVER.totalDeliveries];
  const rateSpark  = [4.6, 4.7, 4.7, 4.8, 4.8, 4.8, CURRENT_DRIVER.rating * 10];

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
            Good morning, {CURRENT_DRIVER.name.split(" ")[0]} 👋
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5 truncate">
            {new Date().toLocaleDateString("en-NG", {
              weekday: "long", day: "numeric", month: "long",
            })}
            <span className="hidden sm:inline"> · Ready for deliveries?</span>
          </p>
        </div>

        {/* Online toggle */}
        <button
          onClick={() => setStatusOnline((v) => !v)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl border px-3 sm:px-4 py-2 text-[12px] sm:text-[13px] font-semibold transition-all duration-200 active:scale-[0.97]",
            statusOnline
              ? "border-teal-500/30 bg-teal-500/10 text-teal-400 hover:bg-teal-500/[0.15]"
              : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200",
          )}
        >
          <span className={cn(
            "h-2 w-2 rounded-full shrink-0",
            statusOnline ? "animate-pulse bg-teal-400 shadow-[0_0_8px_#2dd4bf]" : "bg-zinc-600",
          )} />
          {statusOnline ? "Online" : "Offline"}
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Today's Earnings"
          value={formatNaira(animEarnings)}
          trend="+₦1,200 vs yesterday"
          trendUp={true}
          sub="Sun, 11 May"
          sparkData={earnSpark}
          sparkColor="#2dd4bf"
          sparkId="drv-spark-earn"
          accentClass="border-teal-500/[0.15] hover:border-teal-500/25 hover:shadow-[0_0_24px_rgba(45,212,191,0.07)]"
          glowClass="bg-teal-500"
        />
        <KPICard
          label="Deliveries Today"
          value={String(animDeliveries)}
          trend="+1 vs yesterday"
          trendUp={true}
          sub="Completed trips"
          sparkData={tripSpark}
          sparkColor="#38bdf8"
          sparkId="drv-spark-trips"
          accentClass="border-sky-500/[0.15] hover:border-sky-500/25 hover:shadow-[0_0_24px_rgba(56,189,248,0.07)]"
          glowClass="bg-sky-500"
        />
        <KPICard
          label="Total Deliveries"
          value={String(animTotal)}
          trend="+3 this week"
          trendUp={true}
          sub="All-time trips"
          sparkData={totalSpark}
          sparkColor="#a78bfa"
          sparkId="drv-spark-total"
          accentClass="border-violet-500/[0.15] hover:border-violet-500/25 hover:shadow-[0_0_24px_rgba(167,139,250,0.07)]"
          glowClass="bg-violet-500"
        />
        <KPICard
          label="Rating"
          value={"★ " + CURRENT_DRIVER.rating}
          trend="Top 5% driver"
          trendUp={true}
          sub="Last 50 deliveries"
          sparkData={rateSpark}
          sparkColor="#fbbf24"
          sparkId="drv-spark-rating"
          accentClass="border-amber-500/[0.15] hover:border-amber-500/25 hover:shadow-[0_0_24px_rgba(251,191,36,0.07)]"
          glowClass="bg-amber-500"
        />
      </div>

      {/* ── Active delivery ── */}
      {activeDelivery && (
        <ActiveDeliveryCard statusOnline={statusOnline} connected={connected} />
      )}

      {/* ── Main content row ── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent deliveries — 2/3 width on desktop, full-width below chart on mobile */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <RecentDeliveries />
        </div>
        {/* Right column — appears first on mobile (quick stats), 1/3 on desktop */}
        <div className="space-y-4 order-1 lg:order-2">
          <WeeklyChart />
          <ActivityFeed />
        </div>
      </div>

    </div>
  );
}
