"use client";

import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useBusinessAnalytics } from "@/hooks/use-business";
import { useShipments, getShipmentList } from "@/hooks/use-shipments";
import type { Shipment } from "@/types";

// ─── Local types ───
interface DailyStats {
  day: string;
  shipments: number;
  revenue: number;
  delivered: number;
}

// ─── Helpers ──
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

  const linePath = smoothPath(pts);
  const areaPath = linePath
    ? `${linePath} L ${pts[pts.length - 1]!.x} ${H - PAD.bottom} L ${pts[0]!.x} ${H - PAD.bottom} Z`
    : "";

  return (
    <div className="rounded-2xl border border-white/6 bg-[#0d0d11] p-5">
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
              <stop offset="0%" stopColor={fillColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={fillColor} stopOpacity="0.01" />
            </linearGradient>
          </defs>
          {areaPath && <path d={areaPath} fill={`url(#grad-${label})`} />}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {pts.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={tooltip === i ? 4 : 2.5}
                fill={tooltip === i ? color : "#0d0d11"}
                stroke={color}
                strokeWidth="1.5"
                style={{ transition: "r 150ms" }}
                onMouseEnter={() => setTooltip(i)}
              />
              {tooltip === i && (
                <foreignObject x={pt.x - 40} y={pt.y - 36} width={80} height={28}>
                  <div className="rounded-lg border border-white/10 bg-[#16161d] px-2 py-1 text-center text-[10px] font-semibold text-white shadow-xl whitespace-nowrap">
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

// ─── Top routes ───────────────────────────────────────────────────────────────

// ─── Delivery heatmap ─────────────────────────────────────────────────────────


// ─── Delivery timings ─────────────────────────────────────────────────────────

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-white/4 ${className ?? ""}`} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { data: analytics, isLoading: analyticsLoading } = useBusinessAnalytics();
  const { data: shipmentsData, isLoading: shipmentsLoading } = useShipments({ pageSize: 200 });
  const isLoading = analyticsLoading || shipmentsLoading;

  const allShipments = getShipmentList(shipmentsData);

  const statusBreakdown = analytics?.statusBreakdown ?? {};
  const totalShipments = analytics?.totalShipments ?? 0;

  const dailyStats = useMemo(() => buildDailyStats(allShipments), [allShipments]);

  const deliveredCount = statusBreakdown.delivered ?? 0;
  const failedCount = (statusBreakdown.failed ?? 0) + (statusBreakdown.cancelled ?? 0);
  const successRate = totalShipments > 0 ? Math.round((deliveredCount / totalShipments) * 100) : 0;

  const weekRevenue = dailyStats.reduce((s, d) => s + d.revenue, 0);
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
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
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
              {
                label: "Revenue (7d)",
                value: formatNaira(weekRevenue),
                trend: null,
                up: true,
                color: "text-emerald-400",
                border: "border-emerald-500/[0.12]",
                glow: "bg-emerald-500",
              },
              {
                label: "Shipments (7d)",
                value: String(weekShipments),
                trend: null,
                up: true,
                color: "text-sky-400",
                border: "border-sky-500/[0.12]",
                glow: "bg-sky-500",
              },
              {
                label: "Success Rate",
                value: `${successRate}%`,
                trend: null,
                up: true,
                color: "text-teal-400",
                border: "border-teal-500/[0.12]",
                glow: "bg-teal-500",
              },
              {
                label: "Failed",
                value: String(failedCount),
                trend: null,
                up: false,
                color: "text-rose-400",
                border: "border-rose-500/[0.12]",
                glow: "bg-rose-500",
              },
            ].map(({ label, value, up, color, border, glow }) => (
              <div
                key={label}
                className={`relative rounded-2xl border ${border} bg-[#0d0d11] p-3.5 sm:p-5 overflow-hidden hover:-translate-y-0.5 transition-all duration-300`}
              >
                <div
                  className={`absolute -bottom-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-[0.12] ${glow}`}
                />
                <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.08em] sm:tracking-[0.12em] text-zinc-600 mb-1.5 sm:mb-2 leading-tight">
                  {label}
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${color} tabular-nums truncate`}>
                  {value}
                </p>
                <div
                  className={`mt-1.5 sm:mt-2 inline-flex items-center gap-0.5 sm:gap-1 rounded-full px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold ${up ? "bg-emerald-500/8 text-emerald-400" : "bg-rose-500/8 text-rose-400"}`}
                >
                  {up ? (
                    <TrendingUp className="h-2.5 w-2.5" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5" />
                  )}
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
              color="#8b5cf6"
              fillColor="#8b5cf6"
              label="Shipments"
              formatValue={(v) => `${v}`}
            />
          </div>
        </>
      )}
    </div>
  );
}
