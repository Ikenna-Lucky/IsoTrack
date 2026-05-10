"use client";

import { TrendingUp, TrendingDown, Package, CheckCircle2, XCircle, Clock } from "lucide-react";
import { DAILY_STATS, MOCK_SHIPMENTS, STATUS_META, formatNaira } from "@/lib/mock/business";

// ─── Bar chart ────────────────────────────────────────────────────────────────

function BarChart({
  data,
  valueKey,
  color,
  label,
}: {
  data: typeof DAILY_STATS;
  valueKey: "shipments" | "revenue" | "delivered";
  color: string;
  label: string;
}) {
  const max = Math.max(...data.map((d) => d[valueKey]));
  const total = data.reduce((s, d) => s + d[valueKey], 0);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Last 7 days</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-white">
            {valueKey === "revenue" ? formatNaira(total) : total}
          </p>
          <div className="flex items-center gap-1 justify-end text-[11px] text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            <span>+18.4%</span>
          </div>
        </div>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-2 h-28">
        {data.map((d, i) => {
          const pct = (d[valueKey] / max) * 100;
          const isLast = i === data.length - 1;
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex items-end justify-center" style={{ height: "88px" }}>
                <div
                  className="w-full rounded-t-md transition-all duration-700 relative group/bar"
                  style={{
                    height: `${pct}%`,
                    background: isLast
                      ? `linear-gradient(to top, ${color}, ${color}88)`
                      : "rgba(255,255,255,0.07)",
                    minHeight: "4px",
                  }}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/bar:flex">
                    <span className="whitespace-nowrap rounded-lg bg-zinc-800 border border-white/[0.08] px-2 py-1 text-[10px] text-zinc-200 font-medium shadow-lg">
                      {valueKey === "revenue" ? formatNaira(d[valueKey]) : d[valueKey]}
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-[9px] text-zinc-700">{d.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Donut chart (CSS) ────────────────────────────────────────────────────────

function StatusDonut() {
  const counts = {
    delivered: MOCK_SHIPMENTS.filter((s) => s.status === "delivered").length,
    in_transit: MOCK_SHIPMENTS.filter((s) => s.status === "in_transit" || s.status === "out_for_delivery").length,
    pending: MOCK_SHIPMENTS.filter((s) => s.status === "pending").length,
    failed: MOCK_SHIPMENTS.filter((s) => s.status === "failed" || s.status === "cancelled").length,
  };
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const segments = [
    { label: "Delivered", count: counts.delivered, color: "#10b981" },
    { label: "In Transit", count: counts.in_transit, color: "#0ea5e9" },
    { label: "Pending", count: counts.pending, color: "#f59e0b" },
    { label: "Failed / Cancelled", count: counts.failed, color: "#f43f5e" },
  ];

  // Build conic-gradient
  let acc = 0;
  const stops = segments.map(({ count, color }) => {
    const pct = (count / total) * 100;
    const stop = `${color} ${acc}% ${acc + pct}%`;
    acc += pct;
    return stop;
  });

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <p className="text-sm font-semibold text-white mb-5">Status Breakdown</p>
      <div className="flex items-center gap-6">
        {/* Donut */}
        <div className="relative shrink-0">
          <div
            className="h-24 w-24 rounded-full"
            style={{
              background: `conic-gradient(${stops.join(", ")})`,
            }}
          />
          {/* Center hole */}
          <div className="absolute inset-3 rounded-full bg-[#0d0d10] flex items-center justify-center">
            <p className="text-sm font-bold text-white">{total}</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          {segments.map(({ label, count, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[11px] text-zinc-400 flex-1">{label}</span>
              <span className="text-[11px] font-semibold text-zinc-200">{count}</span>
              <span className="text-[10px] text-zinc-600">
                {Math.round((count / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Top routes ───────────────────────────────────────────────────────────────

function TopRoutes() {
  const routes = [
    { from: "Lekki", to: "Ikoyi", count: 28, revenue: 98000 },
    { from: "Ikeja", to: "Victoria Island", count: 21, revenue: 109200 },
    { from: "Surulere", to: "Victoria Island", count: 17, revenue: 74800 },
    { from: "Gbagada", to: "Ikeja", count: 14, revenue: 39200 },
    { from: "Ajah", to: "Victoria Island", count: 11, revenue: 79200 },
  ];
  const maxCount = routes[0]!.count;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <p className="text-sm font-semibold text-white mb-5">Top Routes</p>
      <div className="space-y-3.5">
        {routes.map(({ from, to, count, revenue }) => (
          <div key={`${from}-${to}`}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs text-zinc-300 font-medium">
                {from} <span className="text-zinc-600">→</span> {to}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-zinc-500">{count} trips</span>
                <span className="text-[11px] font-semibold text-zinc-300">{formatNaira(revenue)}</span>
              </div>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-500"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const weekRevenue = DAILY_STATS.reduce((s, d) => s + d.revenue, 0);
  const weekShipments = DAILY_STATS.reduce((s, d) => s + d.shipments, 0);
  const deliveredCount = MOCK_SHIPMENTS.filter((s) => s.status === "delivered").length;
  const failedCount = MOCK_SHIPMENTS.filter((s) => s.status === "failed" || s.status === "cancelled").length;

  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Analytics</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Performance overview · Last 7 days
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Weekly Revenue",
            value: formatNaira(weekRevenue),
            trend: "+22.1%",
            up: true,
            icon: TrendingUp,
            color: "text-emerald-400",
          },
          {
            label: "Weekly Shipments",
            value: String(weekShipments),
            trend: "+18.4%",
            up: true,
            icon: Package,
            color: "text-sky-400",
          },
          {
            label: "Delivered",
            value: String(deliveredCount),
            trend: `${Math.round((deliveredCount / MOCK_SHIPMENTS.length) * 100)}% rate`,
            up: true,
            icon: CheckCircle2,
            color: "text-teal-400",
          },
          {
            label: "Failed / Cancelled",
            value: String(failedCount),
            trend: "-3.2%",
            up: false,
            icon: XCircle,
            color: "text-rose-400",
          },
        ].map(({ label, value, trend, up, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/[0.09] transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <Icon className={`h-4 w-4 ${color}`} />
              <span
                className={`flex items-center gap-1 text-[10px] font-medium ${up ? "text-emerald-400" : "text-rose-400"}`}
              >
                {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {trend}
              </span>
            </div>
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-[11px] text-zinc-600 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4">
        <BarChart
          data={DAILY_STATS}
          valueKey="revenue"
          color="#0ea5e9"
          label="Revenue (₦)"
        />
        <BarChart
          data={DAILY_STATS}
          valueKey="shipments"
          color="#14b8a6"
          label="Shipment Volume"
        />
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-4">
        <StatusDonut />
        <TopRoutes />
      </div>

      {/* Avg delivery time */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-white">Delivery Time Performance</p>
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Last 7 days</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Average", value: "38 min", icon: Clock, color: "text-sky-400", sub: "All deliveries" },
            { label: "Fastest", value: "14 min", icon: TrendingUp, color: "text-emerald-400", sub: "Lekki → Ikoyi" },
            { label: "Slowest", value: "2h 12m", icon: TrendingDown, color: "text-amber-400", sub: "Ajah → Victoria Island" },
          ].map(({ label, value, icon: Icon, color, sub }) => (
            <div key={label} className="text-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06] mx-auto mb-3`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-lg font-bold text-white">{value}</p>
              <p className="text-xs font-medium text-zinc-400">{label}</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
