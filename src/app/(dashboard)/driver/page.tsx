"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import {
  MapPin,
  Phone,
  Package,
  CheckCircle2,
  TrendingUp,
  Star,
  Navigation,
  Wifi,
  WifiOff,
  ArrowRight,
  Flame,
  AlertCircle,
  Bell,
} from "lucide-react";
import { formatKobo } from "@/types";
import { useDriverProfile, useUpdateDriverStatus } from "@/hooks/use-driver";
import {
  useActiveDelivery,
  useDriverHistory,
  useUpdateShipmentStatus,
} from "@/hooks/use-shipments";
import { useNotifications } from "@/hooks/use-notifications";
import { useSocket } from "@/hooks/use-socket";
import { cn } from "@/lib/utils";
import type { Shipment, ShipmentStatus, Notification } from "@/types";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency", currency: "NGN", maximumFractionDigits: 0,
  }).format(kobo / 100);
}

// ─── Status meta ──────────────────────────────────────────────────────────────

const STATUS_META: Record<ShipmentStatus, { dot: string }> = {
  pending:          { dot: "#94a3b8" },
  assigned:         { dot: "#818cf8" },
  picked_up:        { dot: "#60a5fa" },
  in_transit:       { dot: "#34d399" },
  out_for_delivery: { dot: "#a78bfa" },
  delivered:        { dot: "#10b981" },
  failed:           { dot: "#f87171" },
  cancelled:        { dot: "#6b7280" },
};

// ─── Route waypoints (for location simulation) ────────────────────────────────


// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Index of today in a Mon–Sun array (Mon = 0 … Sun = 6) */
function todayIdx(): number {
  const d = new Date().getDay(); // 0 = Sunday
  return d === 0 ? 6 : d - 1;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  if (h < 48) return "Yesterday";
  return `${Math.floor(h / 24)}d ago`;
}

function notifMeta(n: Notification) {
  const t = (n.title + " " + n.message).toLowerCase();
  if (t.includes("deliver") && (t.includes("complet") || t.includes("success")))
    return { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/15" };
  if (t.includes("rat") || t.includes("review"))
    return { icon: Star, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/15" };
  if (t.includes("assign") || t.includes("package") || t.includes("shipment"))
    return { icon: Package, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/15" };
  if (t.includes("fail") || t.includes("error") || t.includes("issue") || t.includes("cancel"))
    return { icon: AlertCircle, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/15" };
  if (t.includes("streak") || t.includes("milestone") || t.includes("congrat"))
    return { icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/15" };
  return { icon: Bell, color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/15" };
}

// ─── useCountUp ───────────────────────────────────────────────────────────────

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, color, id }: { data: number[]; color: string; id: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 68; const H = 30;
  const n = Math.max(data.length, 2);
  const pts = data.map((v, i): [number, number] => [
    (i / (n - 1)) * W,
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
        <TrendingUp className="h-2.5 w-2.5 shrink-0" />
        <span className="truncate">{trend}</span>
      </div>
    </div>
  );
}

// ─── Active delivery card ─────────────────────────────────────────────────────

function ActiveDeliveryCard({
  delivery,
  isOnline,
  connected,
  onMarkDelivered,
  isMarkingDelivered,
}: {
  delivery: Shipment;
  isOnline: boolean;
  connected: boolean;
  onMarkDelivered: () => void;
  isMarkingDelivered: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-500/[0.22] bg-[#0d0d11]">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-16 left-1/3 h-40 w-72 rounded-full bg-violet-500/[0.08] blur-3xl" />

      {/* Header bar */}
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
            {delivery.trackingId}
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
                {delivery.pickupAddress.street}, {delivery.pickupAddress.city}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-0.5">Delivering to</p>
              <p className="text-sm font-medium text-zinc-100 truncate">
                {delivery.deliveryAddress.street}, {delivery.deliveryAddress.city}
              </p>
            </div>
          </div>
        </div>

        {/* Meta strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {delivery.customer && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600 mb-0.5">Customer</p>
              <p className="text-[13px] font-semibold truncate text-zinc-200">{delivery.customer.name}</p>
            </div>
          )}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600 mb-0.5">Package</p>
            <p className="text-[13px] font-semibold truncate text-zinc-300">{delivery.weightKg} kg</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600 mb-0.5">Earning</p>
            <p className="text-[13px] font-semibold truncate text-emerald-400">
              {formatKobo(Math.round(delivery.priceKobo * 0.4))}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5">
          {delivery.customer?.phone && (
            <a
              href={`tel:${delivery.customer.phone}`}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-teal-500/25 bg-teal-500/10 px-4 py-2.5 text-xs font-semibold text-teal-400 hover:bg-teal-500/[0.18] hover:border-teal-500/40 transition-all"
            >
              <Phone className="h-3.5 w-3.5" />
              Call Customer
            </a>
          )}
          <button
            onClick={onMarkDelivered}
            disabled={isMarkingDelivered}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-500 active:scale-[0.98] transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isMarkingDelivered ? "Marking…" : "Mark as Delivered"}
          </button>
        </div>

        {isOnline && (
          <p className="text-center text-[10px] text-zinc-700">
            📍 Your location is being shared with the customer every 4 seconds
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Weekly chart ─────────────────────────────────────────────────────────────

function WeeklyChart({
  weeklyData,
  todayStats,
  weekEarnings,
  maxEarning,
}: {
  weeklyData: Array<{ day: string; earning: number; deliveries: number }>;
  todayStats: { day: string; earning: number; deliveries: number };
  weekEarnings: number;
  maxEarning: number;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [touchedIdx, setTouchedIdx] = useState<number | null>(null);
  const activeIdx = hoveredIdx ?? touchedIdx;
  const safeMax   = Math.max(maxEarning, 1);
  const todayI    = todayIdx();

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold text-white">Weekly Earnings</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Income per day</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-teal-400">{formatKobo(weekEarnings)}</p>
          <p className="text-[10px] text-zinc-600">this week</p>
        </div>
      </div>

      <div className="flex items-stretch gap-1.5 sm:gap-2 h-28 sm:h-[72px]">
        {weeklyData.map(({ day, earning, deliveries }, i) => {
          const pct      = (earning / safeMax) * 100;
          const isToday  = i === todayI;
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
                  <p className="text-[11px] font-bold text-white">{formatKobo(earning)}</p>
                  <p className="text-[9px] text-zinc-500">{deliveries} trips</p>
                </div>
              )}
              {/* Bar area */}
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
          <p className="text-xs font-bold text-emerald-400">{formatKobo(todayStats.earning)}</p>
          <p className="text-[10px] text-zinc-600">Today&apos;s earnings</p>
        </div>
      </div>
    </div>
  );
}

// ─── Recent deliveries ────────────────────────────────────────────────────────

function RecentDeliveries({ shipments }: { shipments: Shipment[] }) {
  const recent = shipments.filter((s) => s.status === "delivered").slice(0, 4);
  const total  = shipments.length;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-white/[0.05]">
        <div>
          <p className="text-sm font-semibold text-white">Recent Deliveries</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">{total} total assignments</p>
        </div>
        <Link
          href={"/driver/deliveries" as Route}
          className="flex items-center gap-1 rounded-lg border border-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-zinc-400 hover:text-white hover:border-white/[0.12] hover:bg-white/[0.03] transition-all"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
          <Image
            src="/images/empty-img.jpg"
            alt="Prepared packages waiting for delivery"
            width={160}
            height={120}
            className="h-24 w-32 rounded-lg object-cover opacity-80"
          />
          <p className="text-sm font-medium text-zinc-300">No completed deliveries yet</p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {recent.map((d) => {
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
                  <p className="font-mono text-xs font-semibold text-zinc-200 truncate">{d.trackingId}</p>
                  <p className="text-[11px] text-zinc-600 truncate">
                    {d.pickupAddress.city} <span className="text-zinc-700">→</span> {d.deliveryAddress.city}
                    {d.customer && ` · ${d.customer.name}`}
                  </p>
                </div>

                {/* Weight — desktop only */}
                <div className="hidden sm:flex items-center gap-1 shrink-0">
                  <Navigation className="h-3 w-3 text-zinc-700" />
                  <span className="text-[11px] text-zinc-600">{d.weightKg} kg</span>
                </div>

                {/* Earning */}
                <p className="text-xs font-bold text-emerald-400 shrink-0 tabular-nums">
                  +{formatKobo(Math.round(d.priceKobo * 0.4))}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Activity feed ────────────────────────────────────────────────────────────

function ActivityFeed({ notifications }: { notifications: Notification[] }) {
  const items = notifications.slice(0, 5);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-white">Activity</p>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-zinc-600">Live</span>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-600 text-center py-4">No recent activity</p>
      ) : (
        <div className="space-y-2.5">
          {items.map((n) => {
            const { icon: Icon, color, bg } = notifMeta(n);
            return (
              <div key={n.id} className="flex items-start gap-3">
                <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border mt-0.5", bg)}>
                  <Icon className={cn("h-3 w-3", color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-zinc-300 leading-snug">{n.message}</p>
                  <p className="text-[10px] text-zinc-700 mt-0.5">{relativeTime(n.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-pulse">
      <div className="h-14 rounded-xl bg-white/[0.04]" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-[#0d0d11] border border-white/[0.06]" />
        ))}
      </div>
      <div className="h-48 rounded-2xl bg-[#0d0d11] border border-white/[0.06]" />
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-64 rounded-2xl bg-[#0d0d11] border border-white/[0.06]" />
        <div className="space-y-4">
          <div className="h-36 rounded-2xl bg-[#0d0d11] border border-white/[0.06]" />
          <div className="h-52 rounded-2xl bg-[#0d0d11] border border-white/[0.06]" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DriverOverviewPage() {

  // ── Data fetching ──
  const { data: driver, isLoading: driverLoading } = useDriverProfile();
  const { data: allShipments = [] } = useDriverHistory();
  const { activeDelivery } = useActiveDelivery();
  const { notifications }  = useNotifications();

  // ── Mutations ──
  const { mutate: updateDriverStatus } = useUpdateDriverStatus();
  const { mutate: updateShipmentStatus, isPending: isMarkingDelivered } = useUpdateShipmentStatus();

  // ── Derived state ──
  const isOnline = driver?.status !== "offline";

  // ── Socket (location broadcasting) ──
  const { connected } = useSocket({
    trackingId: activeDelivery?.trackingId ?? null,
  });

  // ── Weekly earnings (computed from full history) ──
  const weeklyData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const now   = new Date();
    const dow   = now.getDay(); // 0 = Sun
    const diff  = dow === 0 ? -6 : 1 - dow;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    return days.map((day, i) => {
      const dayStart = new Date(monday);
      dayStart.setDate(monday.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayShipments = allShipments.filter((s) => {
        if (s.status !== "delivered") return false;
        if (!s.actualDelivery) return false;
        const d = new Date(s.actualDelivery);
        return d >= dayStart && d <= dayEnd;
      });

      const earning = dayShipments.reduce((sum, s) => sum + Math.round(s.priceKobo * 0.4), 0);
      return { day, earning, deliveries: dayShipments.length };
    });
  }, [allShipments]);

  const maxEarning = Math.max(...weeklyData.map((d) => d.earning), 1);

  // ── Derived stats ──
  const today = new Date().toDateString();
  const todayDeliveries = allShipments.filter(
    (s) => s.status === "delivered" && s.actualDelivery && new Date(s.actualDelivery).toDateString() === today
  );
  const todayEarnings = todayDeliveries.reduce((sum, s) => sum + Math.round(s.priceKobo * 0.4), 0);
  const todayTrips    = todayDeliveries.length;

  const now2 = new Date();
  const dow2 = (now2.getDay() + 6) % 7; // Mon=0
  const monday2 = new Date(now2);
  monday2.setDate(now2.getDate() - dow2);
  monday2.setHours(0, 0, 0, 0);
  const weekEarnings = allShipments
    .filter((s) => s.status === "delivered" && s.actualDelivery && new Date(s.actualDelivery) >= monday2)
    .reduce((sum, s) => sum + Math.round(s.priceKobo * 0.4), 0);

  const todayIdx = weeklyData.findIndex((d) =>
    d.day === ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][(now2.getDay() + 6) % 7]
  );
  const todayStats = weeklyData[todayIdx] ?? { day: "Today", earning: todayEarnings, deliveries: todayTrips };

  const handleMarkDelivered = () => {
    if (!activeDelivery) return;
    updateShipmentStatus({ id: activeDelivery.id, status: "delivered" });
  };

  if (driverLoading) return <PageSkeleton />;

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ── Header: driver name, rating, status toggle ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-white tracking-tight truncate">
            {driver?.user?.name ?? "Driver Dashboard"}
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            ★ {driver?.rating?.toFixed(1) ?? "—"} · {driver?.totalDeliveries ?? 0} deliveries
          </p>
        </div>
        <button
          onClick={() => updateDriverStatus(isOnline ? "offline" : "available")}
          className={cn(
            "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all shrink-0",
            isOnline
              ? "border-teal-500/30 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20"
              : "border-zinc-700/40 bg-zinc-800/30 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600/40",
          )}
        >
          <span className={cn("h-2 w-2 rounded-full shrink-0", isOnline ? "bg-teal-400 shadow-[0_0_6px_#2dd4bf]" : "bg-zinc-600")} />
          {isOnline ? "Online" : "Go Online"}
        </button>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard label="Today's Earnings" value={formatNaira(todayEarnings)} trend={`${todayTrips} trips`} trendUp={todayTrips > 0} sub="Today" sparkData={weeklyData.map(d => d.earning)} sparkColor="#2dd4bf" accentClass="border-teal-500/[0.15] bg-teal-500/[0.04]" glowClass="shadow-teal-500/10" sparkId="kpi-earnings" />
        <KPICard label="Week Earnings"    value={formatNaira(weekEarnings)} trend="+12%" trendUp={true} sub="This week" sparkData={weeklyData.map(d => d.earning)} sparkColor="#34d399" accentClass="border-emerald-500/[0.15] bg-emerald-500/[0.04]" glowClass="shadow-emerald-500/10" sparkId="kpi-week" />
        <KPICard label="Deliveries"       value={String(driver?.totalDeliveries ?? 0)} trend={`${todayTrips} today`} trendUp={todayTrips > 0} sub="All time" sparkData={weeklyData.map(d => d.deliveries)} sparkColor="#a78bfa" accentClass="border-violet-500/[0.15] bg-violet-500/[0.04]" glowClass="shadow-violet-500/10" sparkId="kpi-trips" />
        <KPICard label="Rating"           value={`★ ${driver?.rating?.toFixed(1) ?? "—"}`} trend="Top 10%" trendUp={true} sub="Average" sparkData={[4,4,5,4,5,5,driver?.rating ?? 5]} sparkColor="#fb923c" accentClass="border-orange-500/[0.15] bg-orange-500/[0.04]" glowClass="shadow-orange-500/10" sparkId="kpi-rating" />
      </div>

      {/* ── Active delivery ── */}
      {activeDelivery && (
        <ActiveDeliveryCard
          delivery={activeDelivery}
          isOnline={isOnline}
          connected={connected}
          onMarkDelivered={handleMarkDelivered}
          isMarkingDelivered={isMarkingDelivered}
        />
      )}

      {/* ── Weekly chart + recent deliveries ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyChart weeklyData={weeklyData} todayStats={todayStats} weekEarnings={weekEarnings} maxEarning={maxEarning} />
        </div>
        <RecentDeliveries shipments={allShipments} />
      </div>

      {/* ── Activity feed ── */}
      <ActivityFeed notifications={notifications} />

    </div>
  );
}
