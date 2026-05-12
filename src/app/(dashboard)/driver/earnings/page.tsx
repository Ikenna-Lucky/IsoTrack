"use client";

import { useState } from "react";
import {
  TrendingUp,
  Package,
  DollarSign,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Calendar,
} from "lucide-react";
import {
  CURRENT_DRIVER,
  DAILY_EARNINGS,
  MOCK_DELIVERIES,
  formatNaira,
} from "@/lib/mock/driver";
import { cn } from "@/lib/utils";

// ─── Computed totals ──────────────────────────────────────────────────────────

const totalWeekEarnings   = DAILY_EARNINGS.reduce((s, d) => s + d.earning, 0);
const totalWeekDeliveries = DAILY_EARNINGS.reduce((s, d) => s + d.deliveries, 0);
const totalAllTime        = MOCK_DELIVERIES.reduce((s, d) => s + d.driverEarning, 0);
const avgPerTrip          = Math.round(totalAllTime / CURRENT_DRIVER.totalDeliveries);
const maxEarning          = Math.max(...DAILY_EARNINGS.map((d) => d.earning));

const MONTHLY = [
  { month: "Jan 2024", deliveries: 42, earning: 65520  },
  { month: "Dec 2023", deliveries: 96, earning: 149760 },
  { month: "Nov 2023", deliveries: 79, earning: 123240 },
  { month: "Oct 2023", deliveries: 88, earning: 137280 },
  { month: "Sep 2023", deliveries: 72, earning: 112320 },
];

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, color, id }: { data: number[]; color: string; id: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 60; const H = 26;
  const pts = data.map((v, i): [number, number] => [
    (i / (data.length - 1)) * W,
    H - ((v - min) / range) * (H - 4) - 2,
  ]);
  const polyPts = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const last = pts[pts.length - 1]!;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${polyPts} ${W},${H}`} fill={`url(#${id})`} />
      <polyline points={polyPts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2" fill={color} />
    </svg>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({
  label, value, sub, trend, trendUp, icon: Icon, iconColor, iconBg,
  sparkData, sparkColor, sparkId, accentClass, glowClass,
}: {
  label: string; value: string; sub: string; trend: string; trendUp: boolean;
  icon: React.ElementType; iconColor: string; iconBg: string;
  sparkData: number[]; sparkColor: string; sparkId: string;
  accentClass: string; glowClass: string;
}) {
  return (
    <div className={cn(
      "relative rounded-2xl border bg-[#0d0d11] p-4 sm:p-5 overflow-hidden transition-all duration-300 hover:-translate-y-0.5",
      accentClass,
    )}>
      <div className={cn("pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full blur-3xl opacity-[0.15]", glowClass)} />

      {/* Icon row — sparkline hidden on mobile to save space */}
      <div className="flex items-start justify-between mb-3">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl border", iconBg)}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
        <div className="hidden sm:block">
          <Sparkline data={sparkData} color={sparkColor} id={sparkId} />
        </div>
      </div>

      <p className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-0.5 truncate">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">{label}</p>
      <p className="text-[10px] text-zinc-600 mb-3 truncate">{sub}</p>

      <div className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold max-w-full overflow-hidden",
        trendUp ? "bg-emerald-500/[0.08] text-emerald-400" : "bg-rose-500/[0.08] text-rose-400",
      )}>
        {trendUp
          ? <ArrowUpRight className="h-3 w-3 shrink-0" />
          : <ArrowDownRight className="h-3 w-3 shrink-0" />}
        <span className="truncate">{trend}</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DriverEarningsPage() {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [touchedBar, setTouchedBar]  = useState<number | null>(null);
  const activeBar = hoveredBar ?? touchedBar;

  const earnSpark    = DAILY_EARNINGS.map((d) => d.earning);
  const tripSpark    = DAILY_EARNINGS.map((d) => d.deliveries);
  const allTimeSpark = [85000, 98000, 120000, 135000, 148000, totalAllTime];
  const rateSpark    = [4.5, 4.6, 4.7, 4.7, 4.8, 4.8, CURRENT_DRIVER.rating * 10];

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Earnings</h2>
        <p className="text-sm text-zinc-500 mt-0.5">Your income overview and payment history</p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPICard
          label="This Week"
          value={formatNaira(totalWeekEarnings)}
          sub={`${totalWeekDeliveries} deliveries`}
          trend="+12% vs last week"
          trendUp={true}
          icon={TrendingUp}
          iconColor="text-teal-400"
          iconBg="bg-teal-500/10 border-teal-500/20"
          sparkData={earnSpark}
          sparkColor="#2dd4bf"
          sparkId="earn-spark-week"
          accentClass="border-teal-500/[0.15] hover:border-teal-500/25"
          glowClass="bg-teal-500"
        />
        <KPICard
          label="All-Time Earnings"
          value={formatNaira(totalAllTime)}
          sub={`${CURRENT_DRIVER.totalDeliveries} trips total`}
          trend="Since Jun 2023"
          trendUp={true}
          icon={DollarSign}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10 border-emerald-500/20"
          sparkData={allTimeSpark}
          sparkColor="#34d399"
          sparkId="earn-spark-alltime"
          accentClass="border-emerald-500/[0.15] hover:border-emerald-500/25"
          glowClass="bg-emerald-500"
        />
        <KPICard
          label="Avg per Trip"
          value={formatNaira(avgPerTrip)}
          sub="Per delivery"
          trend="+₦180 vs last month"
          trendUp={true}
          icon={Package}
          iconColor="text-sky-400"
          iconBg="bg-sky-500/10 border-sky-500/20"
          sparkData={tripSpark}
          sparkColor="#38bdf8"
          sparkId="earn-spark-avg"
          accentClass="border-sky-500/[0.15] hover:border-sky-500/25"
          glowClass="bg-sky-500"
        />
        <KPICard
          label="Rating"
          value={`${CURRENT_DRIVER.rating} / 5`}
          sub="Customer score"
          trend="Top 5% driver"
          trendUp={true}
          icon={Star}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10 border-amber-500/20"
          sparkData={rateSpark}
          sparkColor="#fbbf24"
          sparkId="earn-spark-rating"
          accentClass="border-amber-500/[0.15] hover:border-amber-500/25"
          glowClass="bg-amber-500"
        />
      </div>

      {/* ── Weekly bar chart ── */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-4 sm:p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-semibold text-white">Daily Breakdown — This Week</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">
              <span className="hidden sm:inline">Hover or </span>Tap a bar to see details
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-teal-400">{formatNaira(totalWeekEarnings)}</p>
            <p className="text-[10px] text-zinc-600">weekly total</p>
          </div>
        </div>

        <div className="flex items-stretch gap-1.5 sm:gap-3 h-44 sm:h-36">
          {DAILY_EARNINGS.map(({ day, earning, deliveries }, i) => {
            const pct      = (earning / maxEarning) * 100;
            const isToday  = i === DAILY_EARNINGS.length - 1;
            const isActive = activeBar === i;
            return (
              <div
                key={day}
                className="group relative flex flex-1 flex-col items-center gap-1 cursor-pointer select-none"
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}
                onTouchStart={(e) => { e.preventDefault(); setTouchedBar(i); }}
                onTouchEnd={() => setTimeout(() => setTouchedBar(null), 1500)}
              >
                {/* Tooltip — hover on desktop, tap on mobile */}
                {isActive && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-xl border border-white/[0.1] bg-[#16161d] px-3 py-2 text-center shadow-xl pointer-events-none">
                    <p className="text-xs font-bold text-white">{formatNaira(earning)}</p>
                    <p className="text-[10px] text-zinc-500">{deliveries} trips</p>
                  </div>
                )}
                {/* Bar area — flex-1 fills remaining height, bars grow from bottom */}
                <div className="flex-1 min-h-0 w-full flex items-end">
                  <div
                    className="w-full rounded-t-md transition-all duration-300"
                    style={{
                      height: `${Math.max(pct, 4)}%`,
                      background: isToday || isActive
                        ? "linear-gradient(to top, #0d9488, #2dd4bf)"
                        : "rgba(255,255,255,0.07)",
                      boxShadow: (isToday || isActive) ? "0 0 14px #0d948870" : "none",
                    }}
                  />
                </div>
                <span className={cn(
                  "text-[10px] font-medium",
                  isToday ? "text-teal-400" : "text-zinc-600",
                )}>
                  {day}
                </span>
                <span className="text-[9px] text-zinc-700">{deliveries}x</span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-2.5">
          <span className="text-xs text-zinc-500">Weekly total</span>
          <span className="text-sm font-bold text-emerald-400">{formatNaira(totalWeekEarnings)}</span>
        </div>
      </div>

      {/* ── Monthly history ── */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.05]">
          <p className="text-sm font-semibold text-white">Monthly History</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Last 5 months</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px]">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {[
                  { label: "Month",      mobile: true  },
                  { label: "Deliveries", mobile: true  },
                  { label: "Earnings",   mobile: true  },
                  { label: "Avg / Trip", mobile: false },
                  { label: "vs Prev",    mobile: false },
                ].map(({ label, mobile }) => (
                  <th
                    key={label}
                    className={cn(
                      "px-3 sm:px-5 py-2.5 sm:py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-600",
                      label === "Month" ? "text-left" : "text-right",
                      !mobile && "hidden sm:table-cell",
                    )}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {MONTHLY.map(({ month, deliveries, earning }, i) => {
                const prev  = MONTHLY[i + 1];
                const delta = prev ? ((earning - prev.earning) / prev.earning) * 100 : null;
                const up    = delta !== null && delta >= 0;
                return (
                  <tr key={month} className="hover:bg-white/[0.015] transition-colors">
                    <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-zinc-700 shrink-0" />
                        <span className="text-sm font-medium text-zinc-200 truncate">{month}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-5 py-3 sm:py-3.5 text-right text-sm text-zinc-400 tabular-nums">
                      {deliveries}
                    </td>
                    <td className="px-3 sm:px-5 py-3 sm:py-3.5 text-right text-sm font-bold text-emerald-400 tabular-nums">
                      {formatNaira(earning)}
                    </td>
                    <td className="hidden sm:table-cell px-5 py-3.5 text-right text-xs text-zinc-500 tabular-nums">
                      {formatNaira(Math.round(earning / deliveries))}
                    </td>
                    <td className="hidden sm:table-cell px-5 py-3.5 text-right">
                      {delta !== null ? (
                        <span className={cn(
                          "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                          up
                            ? "bg-emerald-500/[0.08] text-emerald-400"
                            : "bg-rose-500/[0.08] text-rose-400",
                        )}>
                          {up
                            ? <ArrowUpRight className="h-2.5 w-2.5" />
                            : <ArrowDownRight className="h-2.5 w-2.5" />}
                          {Math.abs(delta).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-700">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 sm:px-5 py-3 border-t border-white/[0.05] flex items-center justify-between bg-emerald-500/[0.03]">
          <span className="text-xs font-medium text-zinc-400">All-time earnings</span>
          <span className="text-sm font-bold text-emerald-400">{formatNaira(totalAllTime)}</span>
        </div>
      </div>

      {/* ── Payout details ── */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.05]">
          <p className="text-sm font-semibold text-white">Payout Details</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Your payment method and schedule</p>
        </div>
        <div className="p-4 sm:p-5 grid gap-3 sm:grid-cols-2">
          {[
            {
              icon: CreditCard,
              iconColor: "text-sky-400",
              iconBg: "bg-sky-500/10 border-sky-500/20",
              label: "Bank Account",
              value: "GTBank · ****4521",
              sub: "Linked & verified",
            },
            {
              icon: Calendar,
              iconColor: "text-violet-400",
              iconBg: "bg-violet-500/10 border-violet-500/20",
              label: "Next Payout",
              value: "Friday, 19 Jan 2024",
              sub: "Weekly schedule",
            },
            {
              icon: DollarSign,
              iconColor: "text-amber-400",
              iconBg: "bg-amber-500/10 border-amber-500/20",
              label: "Pending Balance",
              value: formatNaira(totalWeekEarnings),
              sub: "Releases on Friday",
            },
            {
              icon: TrendingUp,
              iconColor: "text-teal-400",
              iconBg: "bg-teal-500/10 border-teal-500/20",
              label: "Commission Rate",
              value: "40% of shipment",
              sub: "Standard driver rate",
            },
          ].map(({ icon: Icon, iconColor, iconBg, label, value, sub }) => (
            <div
              key={label}
              className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.1] hover:bg-white/[0.03] transition-all"
            >
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border", iconBg)}>
                <Icon className={cn("h-4 w-4", iconColor)} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-zinc-200 truncate">{value}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
