"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { DAILY_STATS, MOCK_SHIPMENTS, MOCK_DRIVERS, formatNaira } from "@/lib/mock/business";

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
  data: typeof DAILY_STATS;
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
  const min = Math.min(...values);
  const range = max - min || 1;

  const pts = data.map((d, i) => ({
    x: PAD.left + (i / (data.length - 1)) * innerW,
    y: PAD.top + innerH - ((d[valueKey] - min) / range) * innerH,
    value: d[valueKey],
    day: d.day,
  }));

  const linePath = smoothPath(pts);
  const areaPath =
    linePath +
    ` L ${pts[pts.length - 1]!.x} ${PAD.top + innerH} L ${pts[0]!.x} ${PAD.top + innerH} Z`;

  const total = values.reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Last 7 days</p>
        </div>
        <div className="text-right">
          <p className="text-base font-bold" style={{ color }}>{formatValue(total)}</p>
          <div className="flex items-center gap-1 justify-end text-[10px] text-emerald-400">
            <TrendingUp className="h-2.5 w-2.5" />
            <span>+18.4%</span>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: "100px" }}
          onMouseLeave={() => setTooltip(null)}
        >
          <defs>
            <linearGradient id={`area-${valueKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fillColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={fillColor} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaPath} fill={`url(#area-${valueKey})`} />

          {/* Line */}
          <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data points */}
          {pts.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="12"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setTooltip(i)}
              />
              {(tooltip === i || i === pts.length - 1) && (
                <>
                  <circle cx={pt.x} cy={pt.y} r="4" fill={color} />
                  <circle cx={pt.x} cy={pt.y} r="7" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
                </>
              )}
              {tooltip === i && (
                <g>
                  <rect
                    x={pt.x - 38}
                    y={pt.y - 28}
                    width="76"
                    height="20"
                    rx="5"
                    fill="#16161d"
                    stroke={color}
                    strokeWidth="0.5"
                    strokeOpacity="0.5"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 14}
                    textAnchor="middle"
                    fill="white"
                    fontSize="9"
                    fontWeight="600"
                    fontFamily="monospace"
                  >
                    {formatValue(pt.value)}
                  </text>
                </g>
              )}
            </g>
          ))}

          {/* Day labels */}
          {pts.map((pt, i) => (
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
          ))}
        </svg>
      </div>
    </div>
  );
}

// ─── Status donut ─────────────────────────────────────────────────────────────

function StatusDonut() {
  const [hovered, setHovered] = useState<number | null>(null);

  const counts = {
    delivered: MOCK_SHIPMENTS.filter((s) => s.status === "delivered").length,
    in_transit: MOCK_SHIPMENTS.filter(
      (s) => s.status === "in_transit" || s.status === "out_for_delivery",
    ).length,
    pending: MOCK_SHIPMENTS.filter((s) => s.status === "pending").length,
    failed: MOCK_SHIPMENTS.filter(
      (s) => s.status === "failed" || s.status === "cancelled",
    ).length,
  };
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const segments = [
    { label: "Delivered",         count: counts.delivered, color: "#10b981", glow: "#10b98140" },
    { label: "In Transit",        count: counts.in_transit,color: "#38bdf8", glow: "#38bdf840" },
    { label: "Pending",           count: counts.pending,   color: "#f59e0b", glow: "#f59e0b40" },
    { label: "Failed/Cancelled",  count: counts.failed,    color: "#f43f5e", glow: "#f43f5e40" },
  ];

  // Build conic gradient with 2deg gaps
  let acc = 0;
  const stops = segments.flatMap(({ count, color }, i) => {
    const pct = (count / total) * 100;
    const gapPct = i === segments.length - 1 ? 0 : 0.8;
    const stop = [`${color} ${acc}%`, `${color} ${acc + pct - gapPct}%`, `transparent ${acc + pct - gapPct}%`, `transparent ${acc + pct}%`];
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
        {/* Donut */}
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

        {/* Legend */}
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
                  style={{
                    backgroundColor: color,
                    boxShadow: hovered === i ? `0 0 6px ${color}` : "none",
                  }}
                />
                <span className="text-[11px] text-zinc-400 flex-1 group-hover:text-zinc-200 transition-colors">
                  {label}
                </span>
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

const TOP_ROUTES = [
  { from: "Lekki",    to: "Ikoyi",           count: 28, revenue: 98000,  growth: "+12%" },
  { from: "Ikeja",    to: "Victoria Island", count: 21, revenue: 109200, growth: "+8%"  },
  { from: "Surulere", to: "Victoria Island", count: 17, revenue: 74800,  growth: "+21%" },
  { from: "Gbagada",  to: "Ikeja",           count: 14, revenue: 39200,  growth: "-3%"  },
  { from: "Ajah",     to: "Victoria Island", count: 11, revenue: 79200,  growth: "+5%"  },
];

function TopRoutes() {
  const maxCount = TOP_ROUTES[0]!.count;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold text-white">Top Routes</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">By shipment volume</p>
        </div>
      </div>

      <div className="space-y-3">
        {TOP_ROUTES.map(({ from, to, count, revenue, growth }, i) => {
          const isUp = growth.startsWith("+");
          return (
            <div
              key={`${from}-${to}`}
              className="group rounded-xl border border-white/[0.04] bg-white/[0.015] px-3 py-2.5 hover:border-white/[0.08] hover:bg-white/[0.025] transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-600 w-3">{i + 1}</span>
                  <p className="text-xs font-medium text-zinc-300">
                    {from}
                    <span className="text-zinc-600 mx-1.5">→</span>
                    {to}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                    {isUp ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                    {growth}
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-200 tabular-nums">
                    {formatNaira(revenue)}
                  </span>
                </div>
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
          );
        })}
      </div>
    </div>
  );
}

// ─── Delivery heatmap ──────────────────────────────────────────────────────────

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOTS = ["Morning", "Afternoon", "Evening", "Night"];

// Mock heatmap data: [day][slot] = shipment count
const HEAT_DATA: number[][] = [
  [8, 14, 6, 2],
  [10, 18, 9, 1],
  [7, 12, 11, 3],
  [9, 16, 8, 2],
  [12, 20, 14, 4],
  [6, 10, 8, 5],
  [3, 7, 5, 2],
];

function DeliveryHeatmap() {
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null);
  const maxVal = Math.max(...HEAT_DATA.flat());

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold text-white">Delivery Heatmap</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Shipments by day &amp; time of day</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-10 rounded-full bg-gradient-to-r from-sky-500/20 to-sky-500" />
          <span className="text-[10px] text-zinc-600">Low → High</span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[400px]">
          {/* Slot labels */}
          <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `48px repeat(${DAYS.length}, 1fr)` }}>
            <div />
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[9px] font-semibold text-zinc-600">
                {d}
              </div>
            ))}
          </div>

          {/* Rows */}
          {SLOTS.map((slot, si) => (
            <div
              key={slot}
              className="grid gap-1 mb-1"
              style={{ gridTemplateColumns: `48px repeat(${DAYS.length}, 1fr)` }}
            >
              <div className="flex items-center">
                <span className="text-[9px] text-zinc-600 font-medium whitespace-nowrap">{slot}</span>
              </div>
              {DAYS.map((_, di) => {
                const val = HEAT_DATA[di]?.[si] ?? 0;
                const intensity = val / maxVal;
                const isHovered =
                  hoveredCell !== null && hoveredCell[0] === di && hoveredCell[1] === si;
                return (
                  <div
                    key={di}
                    className="relative aspect-square rounded-md cursor-pointer transition-all duration-200"
                    style={{
                      backgroundColor: `rgba(14, 165, 233, ${intensity * 0.85 + 0.05})`,
                      boxShadow: isHovered ? `0 0 10px rgba(14,165,233,${intensity * 0.6})` : "none",
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

// ─── Delivery time panel ──────────────────────────────────────────────────────

function DeliveryTimings() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold text-white">Delivery Performance</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Average, fastest, slowest</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            label: "Average",
            value: "38 min",
            sub: "All deliveries",
            color: "text-sky-400",
            bg: "bg-sky-500/10 border-sky-500/20",
            icon: Clock,
          },
          {
            label: "Fastest",
            value: "14 min",
            sub: "Lekki → Ikoyi",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10 border-emerald-500/20",
            icon: TrendingUp,
          },
          {
            label: "Slowest",
            value: "2h 12m",
            sub: "Ajah → VI",
            color: "text-amber-400",
            bg: "bg-amber-500/10 border-amber-500/20",
            icon: TrendingDown,
          },
        ].map(({ label, value, sub, color, bg, icon: Icon }) => (
          <div
            key={label}
            className={`rounded-xl border p-4 ${bg}`}
          >
            <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:gap-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.06] sm:mx-auto sm:mb-3">
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="sm:text-center">
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs font-semibold text-zinc-400 mt-0.5">{label}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">{sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const weekRevenue   = DAILY_STATS.reduce((s, d) => s + d.revenue, 0);
  const weekShipments = DAILY_STATS.reduce((s, d) => s + d.shipments, 0);
  const deliveredCount = MOCK_SHIPMENTS.filter((s) => s.status === "delivered").length;
  const failedCount   = MOCK_SHIPMENTS.filter(
    (s) => s.status === "failed" || s.status === "cancelled",
  ).length;
  const successRate   = Math.round((deliveredCount / MOCK_SHIPMENTS.length) * 100);

  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Analytics</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Performance overview · Last 7 days
        </p>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Revenue / Wk",
            value: formatNaira(weekRevenue),
            trend: "+22.1%",
            up: true,
            color: "text-emerald-400",
            border: "border-emerald-500/[0.12]",
            glow: "bg-emerald-500",
          },
          {
            label: "Shipments / Wk",
            value: String(weekShipments),
            trend: "+18.4%",
            up: true,
            color: "text-sky-400",
            border: "border-sky-500/[0.12]",
            glow: "bg-sky-500",
          },
          {
            label: "Success Rate",
            value: `${successRate}%`,
            trend: "+1.2%",
            up: true,
            color: "text-teal-400",
            border: "border-teal-500/[0.12]",
            glow: "bg-teal-500",
          },
          {
            label: "Failed",
            value: String(failedCount),
            trend: "-3.2%",
            up: false,
            color: "text-rose-400",
            border: "border-rose-500/[0.12]",
            glow: "bg-rose-500",
          },
        ].map(({ label, value, trend, up, color, border, glow }) => (
          <div
            key={label}
            className={`relative rounded-2xl border ${border} bg-[#0d0d11] p-3.5 sm:p-5 overflow-hidden hover:-translate-y-0.5 transition-all duration-300`}
          >
            <div className={`absolute -bottom-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-[0.12] ${glow}`} />
            <p className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.08em] sm:tracking-[0.12em] text-zinc-600 mb-1.5 sm:mb-2 leading-tight`}>
              {label}
            </p>
            <p className={`text-xl sm:text-2xl font-bold ${color} tabular-nums truncate`}>{value}</p>
            <div
              className={`mt-1.5 sm:mt-2 inline-flex items-center gap-0.5 sm:gap-1 rounded-full px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold ${up ? "bg-emerald-500/[0.08] text-emerald-400" : "bg-rose-500/[0.08] text-rose-400"}`}
            >
              {up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
              {trend}
            </div>
          </div>
        ))}
      </div>

      {/* ── Area charts ── */}
      <div className="grid lg:grid-cols-2 gap-4">
        <AreaChart
          data={DAILY_STATS}
          valueKey="revenue"
          color="#0ea5e9"
          fillColor="#0ea5e9"
          label="Revenue (₦)"
          formatValue={(v) => formatNaira(v)}
        />
        <AreaChart
          data={DAILY_STATS}
          valueKey="shipments"
          color="#14b8a6"
          fillColor="#14b8a6"
          label="Shipment Volume"
          formatValue={(v) => String(v)}
        />
      </div>

      {/* ── Donut + routes ── */}
      <div className="grid lg:grid-cols-2 gap-4">
        <StatusDonut />
        <TopRoutes />
      </div>

      {/* ── Heatmap ── */}
      <DeliveryHeatmap />

      {/* ── Timing performance ── */}
      <DeliveryTimings />
    </div>
  );
}
