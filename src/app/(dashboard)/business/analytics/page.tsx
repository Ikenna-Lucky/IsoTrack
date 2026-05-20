"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Loader2,
} from "lucide-react";
import { useBusinessAnalytics } from "@/hooks/use-business";
import { useShipments, getShipmentList } from "@/hooks/use-shipments";
import type { Shipment } from "@/types";

// ─── Local types ───────────────────────────────────────────────────────────────

interface DailyStats {
  day: string;
  shipments: number;
  revenue: number;
  delivered: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

/** Build per-day stats for the last 7 days from a list of shipments. */
function buildDailyStats(shipments: Shipment[]): DailyStats[] {
  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  const days: DailyStats[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    return { day: DAY_LABELS[d.getDay()]!, shipments: 0, revenue: 0, delivered: 0 };
  });

  for (const s of shipments) {
    const created = new Date(s.createdAt);
    const diffDays = Math.floor((now.getTime() - created.getTime()) / 86_400_000);
    if (diffDays < 0 || diffDays > 6) continue;
    const idx = 6 - diffDays;
    if (!days[idx]) continue;
    days[idx].shipments++;
    days[idx].revenue += s.priceKobo;
    if (s.status === "delivered") days[idx].delivered++;
  }
  return days;
}

/** Top N routes derived from shipments (pickup city → delivery city). */
function buildTopRoutes(shipments: Shipment[], n = 5) {
  const map = new Map<string, { from: string; to: string; count: number; revenue: number }>();
  for (const s of shipments) {
    const from = s.pickupAddress?.city ?? "Unknown";
    const to   = s.deliveryAddress?.city ?? "Unknown";
    const key  = `${from}||${to}`;
    const prev = map.get(key) ?? { from, to, count: 0, revenue: 0 };
    map.set(key, { ...prev, count: prev.count + 1, revenue: prev.revenue + s.priceKobo });
  }
  return [...map.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

/** Build [day][slot] heatmap from shipment createdAt timestamps. */
function buildHeatmap(shipments: Shipment[]): number[][] {
  const grid: number[][] = Array.from({ length: 7 }, () => [0, 0, 0, 0]);
  const now = new Date();
  for (const s of shipments) {
    const d = new Date(s.createdAt);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
    if (diffDays < 0 || diffDays > 6) continue;
    const dayIdx = 6 - diffDays;
    const h = d.getHours();
    const slotIdx = h >= 6 && h < 12 ? 0 : h >= 12 && h < 18 ? 1 : h >= 18 && h < 22 ? 2 : 3;
    if (grid[dayIdx]) grid[dayIdx][slotIdx]++;
  }
  return grid;
}

// ─── SVG area chart ───────────────────────────────────────────────────────────

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0]!.x} ${pts[0]!.y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]!;
    const curr = pts[i]!;
    const dx = (curr.x - prev.x) * 0.45;
    d += ` C ${prev.x + dx} ${prev.y}, ${curr.x - dx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

function AreaChart({
  data,
  valueKey,
  color,
  fillColor,
  label,
  formatValue,
}: {
  data: DailyStats[];
  valueKey: "shipments" | "revenue" | "delivered";
  color: string;
  fillColor: string;
  label: string;
  formatValue: (v: number) => string;
}) {
  const [tooltip, setTooltip] = useState<number | null>(null);
  const W = 600;
  const H = 120;
  const PAD = { top: 12, right: 12, bottom: 20, left: 12 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const values = data.map((d) => d[valueKey]);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const pts = data.map((d, i) => ({
    x: PAD.left + (i / (data.length - 1)) * innerW,
    y: PAD.top + (1 - (d[valueKey] - min) / range) * innerH,
    day: d.day,
    val: d[valueKey],
  }));

  const linePath  = smoothPath(pts);
  const areaPath  = linePath
    ? `${linePath} L ${pts[pts.length - 1]!.x} ${H - PAD.bottom} L ${pts[0]!.x} ${H - PAD.bottom} Z`
    : "";

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs text-zinc-600">Last 7 days</p>
      </div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full overflow-visible"
          style={{ height: 120 }}
          onMouseLeave={() => setTooltip(null)}
        >
          <defs>
            <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={fillColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={fillColor} stopOpacity="0.01" />
            </linearGradient>
          </defs>
          {areaPath && (
            <path d={areaPath} fill={`url(#grad-${label})`} />
          )}
          {linePath && (
            <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {pts.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x} cy={pt.y} r={tooltip === i ? 4 : 2.5}
                fill={tooltip === i ? color : "#0d0d11"}
                stroke={color} strokeWidth="1.5"
                style={{ transition: "r 150ms" }}
                onMouseEnter={() => setTooltip(i)}
              />
              {tooltip === i && (
                <foreignObject x={pt.x - 40} y={pt.y - 36} width={80} height={28}>
                  <div className="rounded-lg border border-white/[0.1] bg-[#16161d] px-2 py-1 text-center text-[10px] font-semibold text-white shadow-xl whitespace-nowrap">
                    {formatValue(pt.val)}
                  </div>
                </foreignObject>
              )}
              <text
                key={`day-${i}`}
                x={pt.x}
                y={H - 4}
                textAnchor="middle"
                fill="#52526a"
                fontSize="8"
                fontFamily="system-ui"
              >
                {pt.day}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ─── Status donut ─────────────────────────────────────────────────────────────

function StatusDonut({ breakdown }: { breakdown: Record<string, number> }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const counts = {
    delivered:  (breakdown.delivered  ?? 0),
    in_transit: (breakdown.in_transit ?? 0) + (breakdown.out_for_delivery ?? 0),
    pending:    (breakdown.pending    ?? 0) + (breakdown.assigned ?? 0),
    failed:     (breakdown.failed     ?? 0) + (breakdown.cancelled ?? 0),
  };
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const segments = [
    { label: "Delivered",        count: counts.delivered,  color: "#10b981", glow: "#10b98140" },
    { label: "In Transit",       count: counts.in_transit, color: "#38bdf8", glow: "#38bdf840" },
    { label: "Pending",          count: counts.pending,    color: "#f59e0b", glow: "#f59e0b40" },
    { label: "Failed/Cancelled", count: counts.failed,     color: "#f43f5e", glow: "#f43f5e40" },
  ];

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-5 flex flex-col items-center justify-center min-h-[180px] gap-2">
        <p className="text-sm font-semibold text-white">Status Breakdown</p>
        <p className="text-xs text-zinc-600">No shipments yet</p>
      </div>
    );
  }

  let acc = 0;
  const stops = segments.flatMap(({ count, color }, i) => {
    const pct = (count / total) * 100;
    const gapPct = i === segments.length - 1 ? 0 : 0.8;
    const stop = [
      `${color} ${acc}%`,
      `${color} ${acc + pct - gapPct}%`,
      `transparent ${acc + pct - gapPct}%`,
      `transparent ${acc + pct}%`,
    ];
    acc += pct;
    return stop;
  });

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold text-white">Status Breakdown</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">All shipments</p>
        </div>
        <span className="text-xs font-bold text-zinc-300">{total} total</span>
      </div>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="relative shrink-0">
          <div
            className="h-28 w-28 rounded-full transition-all duration-300"
            style={{
              background: `conic-gradient(${stops.join(", ")})`,
              filter: hovered !== null ? `drop-shadow(0 0 8px ${segments[hovered]!.glow})` : "none",
            }}
          />
          <div className="absolute inset-[14px] rounded-full bg-[#0d0d11] flex flex-col items-center justify-center">
            <p className="text-lg font-bold text-white leading-none">{total}</p>
            <p className="text-[9px] text-zinc-600">shipments</p>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {segments.map(({ label, count, color }, i) => {
            const pct = Math.round((count / total) * 100);
            return (
              <div
                key={label}
                className="group flex items-center gap-2 cursor-pointer"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <div
                  className="h-2 w-2 rounded-full shrink-0 transition-all"
                  style={{ backgroundColor: color, boxShadow: hovered === i ? `0 0 6px ${color}` : "none" }}
                />
                <span className="text-[11px] text-zinc-400 flex-1 group-hover:text-zinc-200 transition-colors">{label}</span>
                <span className="text-[11px] font-bold text-zinc-200 tabular-nums">{count}</span>
                <div className="w-8 text-right">
                  <span className="text-[10px] text-zinc-600">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Top routes ───────────────────────────────────────────────────────────────

function TopRoutes({ routes }: { routes: { from: string; to: string; count: number; revenue: number }[] }) {
  if (routes.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-5 flex flex-col items-center justify-center min-h-[180px] gap-2">
        <p className="text-sm font-semibold text-white">Top Routes</p>
        <p className="text-xs text-zinc-600">No shipments yet</p>
      </div>
    );
  }

  const maxCount = routes[0]?.count ?? 1;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold text-white">Top Routes</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">By shipment volume</p>
        </div>
      </div>
      <div className="space-y-3">
        {routes.map(({ from, to, count, revenue }, i) => (
          <div
            key={`${from}-${to}`}
            className="group rounded-xl border border-white/[0.04] bg-white/[0.015] px-3 py-2.5 hover:border-white/[0.08] hover:bg-white/[0.025] transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-600 w-3">{i + 1}</span>
                <p className="text-xs font-medium text-zinc-300">
                  {from}
                  <span className="text-zinc-600 mx-1.5">&#8594;</span>
                  {to}
                </p>
              </div>
              <span className="text-[11px] font-semibold text-zinc-200 tabular-nums">
                {formatNaira(revenue)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-500 transition-all duration-700"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-600 shrink-0">{count} trips</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Delivery heatmap ─────────────────────────────────────────────────────────

const DAYS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOTS = ["Morning", "Afternoon", "Evening", "Night"];

function DeliveryHeatmap({ data }: { data: number[][] }) {
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null);
  const maxVal = Math.max(...data.flat(), 1);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold text-white">Delivery Heatmap</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Shipments by day &amp; time of day</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-10 rounded-full bg-gradient-to-r from-sky-500/20 to-sky-500" />
          <span className="text-[9px] text-zinc-600">Low &#8594; High</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[340px]">
          <div className="grid grid-cols-5 gap-1.5 mb-1.5">
            <div />
            {SLOTS.map((s) => (
              <p key={s} className="text-[9px] text-zinc-600 text-center">{s}</p>
            ))}
          </div>
          {data.map((row, di) => (
            <div key={DAYS[di]} className="grid grid-cols-5 gap-1.5 mb-1.5">
              <p className="text-[9px] text-zinc-600 flex items-center">{DAYS[di]}</p>
              {row.map((val, si) => {
                const intensity = maxVal > 0 ? val / maxVal : 0;
                const isHovered = hoveredCell?.[0] === di && hoveredCell?.[1] === si;
                return (
                  <div
                    key={si}
                    className="relative h-7 rounded-md cursor-pointer transition-all duration-150"
                    style={{
                      backgroundColor: `rgba(14,165,233,${0.06 + intensity * 0.7})`,
                      transform: isHovered ? "scale(1.05)" : "scale(1)",
                    }}
                    onMouseEnter={() => setHoveredCell([di, si])}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {isHovered && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-10 whitespace-nowrap rounded-lg border border-white/[0.1] bg-[#16161d] px-2 py-1 text-[10px] font-semibold text-white shadow-xl">
                        {val} shipments
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Delivery timings ─────────────────────────────────────────────────────────

function DeliveryTimings({ shipments }: { shipments: Shipment[] }) {
  const completed = shipments.filter(
    (s) => s.status === "delivered" && s.actualPickup && s.actualDelivery,
  );

  const durations = completed.map((s) => {
    const pickup   = new Date(s.actualPickup!).getTime();
    const delivery = new Date(s.actualDelivery!).getTime();
    return (delivery - pickup) / 60_000; // minutes
  });

  const avg     = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null;
  const fastest = durations.length ? Math.round(Math.min(...durations)) : null;
  const slowest = durations.length ? Math.round(Math.max(...durations)) : null;

  function fmtMin(min: number) {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h ${m}m`;
  }

  const items = [
    { label: "Average",  value: avg     !== null ? fmtMin(avg)     : "—", icon: Clock,       color: "text-sky-400",     bg: "bg-sky-500/10 border-sky-500/20"         },
    { label: "Fastest",  value: fastest !== null ? fmtMin(fastest) : "—", icon: TrendingUp,  color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Slowest",  value: slowest !== null ? fmtMin(slowest) : "—", icon: TrendingDown, color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20"     },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold text-white">Delivery Performance</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">
            {completed.length > 0 ? `Based on ${completed.length} completed deliveries` : "No completed deliveries yet"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className={`rounded-xl border p-4 ${bg}`}>
            <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:gap-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.06] sm:mx-auto sm:mb-3">
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="sm:text-center">
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs font-semibold text-zinc-400 mt-0.5">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-white/[0.04] ${className ?? ""}`} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { data: analytics, isLoading: analyticsLoading } = useBusinessAnalytics();
  const { data: shipmentsData, isLoading: shipmentsLoading } = useShipments({ pageSize: 200 });
  const isLoading = analyticsLoading || shipmentsLoading;

  const allShipments = getShipmentList(shipmentsData);

  const statusBreakdown  = analytics?.statusBreakdown  ?? {};
  const totalShipments   = analytics?.totalShipments   ?? 0;
  const totalRevenueKobo = analytics?.totalRevenueKobo ?? 0;

  const dailyStats = useMemo(() => buildDailyStats(allShipments), [allShipments]);
  const topRoutes  = useMemo(() => buildTopRoutes(allShipments),  [allShipments]);
  const heatmap    = useMemo(() => buildHeatmap(allShipments),    [allShipments]);

  const deliveredCount = statusBreakdown.delivered ?? 0;
  const failedCount    = (statusBreakdown.failed ?? 0) + (statusBreakdown.cancelled ?? 0);
  const successRate    = totalShipments > 0 ? Math.round((deliveredCount / totalShipments) * 100) : 0;

  const weekRevenue   = dailyStats.reduce((s, d) => s + d.revenue,   0);
  const weekShipments = dailyStats.reduce((s, d) => s + d.shipments, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-5">

      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Analytics</h2>
        <p className="text-sm text-zinc-500 mt-0.5">Performance overview</p>
      </div>

      {isLoading ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <Skeleton className="h-52" />
            <Skeleton className="h-52" />
          </div>
          <Skeleton className="h-48" />
          <Skeleton className="h-36" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Revenue (7d)",    value: formatNaira(weekRevenue),   trend: null, up: true,  color: "text-emerald-400", border: "border-emerald-500/[0.12]", glow: "bg-emerald-500" },
              { label: "Shipments (7d)",  value: String(weekShipments),       trend: null, up: true,  color: "text-sky-400",     border: "border-sky-500/[0.12]",     glow: "bg-sky-500"     },
              { label: "Success Rate",    value: `${successRate}%`,           trend: null, up: true,  color: "text-teal-400",    border: "border-teal-500/[0.12]",    glow: "bg-teal-500"    },
              { label: "Failed",          value: String(failedCount),         trend: null, up: false, color: "text-rose-400",    border: "border-rose-500/[0.12]",    glow: "bg-rose-500"    },
            ].map(({ label, value, up, color, border, glow }) => (
              <div
                key={label}
                className={`relative rounded-2xl border ${border} bg-[#0d0d11] p-3.5 sm:p-5 overflow-hidden hover:-translate-y-0.5 transition-all duration-300`}
              >
                <div className={`absolute -bottom-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-[0.12] ${glow}`} />
                <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.08em] sm:tracking-[0.12em] text-zinc-600 mb-1.5 sm:mb-2 leading-tight">
                  {label}
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${color} tabular-nums truncate`}>{value}</p>
                <div className={`mt-1.5 sm:mt-2 inline-flex items-center gap-0.5 sm:gap-1 rounded-full px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold ${up ? "bg-emerald-500/[0.08] text-emerald-400" : "bg-rose-500/[0.08] text-rose-400"}`}>
                  {up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                  {up ? "All time" : "needs attention"}
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <AreaChart
              data={dailyStats}
              valueKey="revenue"
              color="#0ea5e9"
              fillColor="#0ea5e9"
              label="Revenue (NGN)"
              formatValue={(v) => formatNaira(v)}
            />
            <AreaChart
              data={dailyStats}
              valueKey="shipments"
              color="#14b8a6"
              fillColor="#14b8a6"
              label="Shipment Volume"
              formatValue={(v) => String(v)}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <StatusDonut breakdown={statusBreakdown} />
            <TopRoutes routes={topRoutes} />
          </div>

          <DeliveryHeatmap data={heatmap} />

          <DeliveryTimings shipments={allShipments} />
        </>
      )}
    </div>
  );
}
