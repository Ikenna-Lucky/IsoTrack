"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  Package,
  DollarSign,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Calendar,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useShipments, getShipmentList } from "@/hooks/use-shipments";
import { useDriverProfile } from "@/hooks/use-driver";
import { formatKobo } from "@/types";
import { cn } from "@/lib/utils";

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
  const [touchedBar, setTouchedBar] = useState<number | null>(null);
  const activeBar = hoveredBar ?? touchedBar;

  const { data: driver } = useDriverProfile();
  const { data: shipmentsData } = useShipments({ pageSize: 200 });
  const shipments = getShipmentList(shipmentsData);

  const delivered = shipments.filter((s) => s.status === "delivered");

  // ── Weekly breakdown (Mon–Sun of current week) ────────────────────────────
  const { weeklyData, totalWeekEarnings, totalWeekDeliveries } = useMemo(() => {
    const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const now  = new Date();
    const dow  = now.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    const data = DAYS.map((day, i) => {
      const dayStart = new Date(monday);
      dayStart.setDate(monday.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayShipments = delivered.filter((s) => {
        const d = new Date(s.actualDelivery ?? s.updatedAt);
        return d >= dayStart && d <= dayEnd;
      });

      const earning    = dayShipments.reduce((sum, s) => sum + Math.round(s.priceKobo * 0.4), 0);
      const deliveries = dayShipments.length;
      return { day, earning, deliveries };
    });

    return {
      weeklyData:          data,
      totalWeekEarnings:   data.reduce((s, d) => s + d.earning, 0),
      totalWeekDeliveries: data.reduce((s, d) => s + d.deliveries, 0),
    };
  }, [delivered]);

  // ── Monthly history (up to last 6 months that have actual earnings) ──────
  const monthlyHistory = useMemo(() => {
    const now = new Date();
    const months: { month: string; deliveries: number; earning: number }[] = [];

    for (let m = 0; m < 6; m++) {
      const date  = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end   = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

      const monthShipments = delivered.filter((s) => {
        const d = new Date(s.actualDelivery ?? s.updatedAt);
        return d >= start && d <= end;
      });

      // Only include months where at least one delivery was made
      if (monthShipments.length > 0) {
        months.push({
          month:      date.toLocaleDateString("en-NG", { month: "short", year: "numeric" }),
          deliveries: monthShipments.length,
          earning:    monthShipments.reduce((sum, s) => sum + Math.round(s.priceKobo * 0.4), 0),
        });
      }
    }
    return months;
  }, [delivered]);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalAllTime   = delivered.reduce((sum, s) => sum + Math.round(s.priceKobo * 0.4), 0);
  const totalTrips     = driver?.totalDeliveries ?? delivered.length;
  const avgPerTrip     = totalTrips > 0 ? Math.round(totalAllTime / totalTrips) : 0;
  const rating         = driver?.rating ?? 0;
  const maxEarning     = Math.max(...weeklyData.map((d) => d.earning), 1);

  // ── Payout helpers ────────────────────────────────────────────────────────
  // Next Friday date (payout day)
  const nextFriday = useMemo(() => {
    const d = new Date();
    const daysUntilFriday = (5 - d.getDay() + 7) % 7 || 7; // 5 = Friday
    d.setDate(d.getDate() + daysUntilFriday);
    return d.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" });
  }, []);

  // Pending balance = this week's earnings (to be paid out on Friday)
  const pendingBalance = totalWeekEarnings;

  // Bank account from driver profile (placeholder if not set)
  const hasBankAccount = false; // extend when bank account endpoint exists

  // Sparklines
  const earnSpark    = weeklyData.map((d) => d.earning);
  const tripSpark    = weeklyData.map((d) => d.deliveries);
  const allTimeSpark = monthlyHistory.map((d) => d.earning).reverse();
  const rateSpark    = [4.5, 4.6, 4.6, 4.7, 4.8, 4.8, rating * 10].filter(Boolean);

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
          value={formatKobo(totalWeekEarnings)}
          sub={`${totalWeekDeliveries} deliveries`}
          trend={totalWeekEarnings > 0 ? "This week" : "No earnings yet"}
          trendUp={totalWeekEarnings > 0}
          icon={TrendingUp}
          iconColor="text-teal-400"
          iconBg="bg-teal-500/10 border-teal-500/20"
          sparkData={earnSpark.length > 1 ? earnSpark : [0, 1]}
          sparkColor="#2dd4bf"
          sparkId="earn-spark-week"
          accentClass="border-teal-500/[0.15] hover:border-teal-500/25"
          glowClass="bg-teal-500"
        />
        <KPICard
          label="All-Time Earnings"
          value={formatKobo(totalAllTime)}
          sub={`${totalTrips} trips total`}
          trend={totalAllTime > 0 ? "Lifetime" : "Getting started"}
          trendUp={totalAllTime > 0}
          icon={DollarSign}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10 border-emerald-500/20"
          sparkData={allTimeSpark.length > 1 ? allTimeSpark : [0, 1]}
          sparkColor="#34d399"
          sparkId="earn-spark-alltime"
          accentClass="border-emerald-500/[0.15] hover:border-emerald-500/25"
          glowClass="bg-emerald-500"
        />
        <KPICard
          label="Avg per Trip"
          value={formatKobo(avgPerTrip)}
          sub="Per delivery"
          trend={avgPerTrip > 0 ? "Per delivery" : "No data yet"}
          trendUp={avgPerTrip > 0}
          icon={Package}
          iconColor="text-sky-400"
          iconBg="bg-sky-500/10 border-sky-500/20"
          sparkData={tripSpark.length > 1 ? tripSpark : [0, 1]}
          sparkColor="#38bdf8"
          sparkId="earn-spark-avg"
          accentClass="border-sky-500/[0.15] hover:border-sky-500/25"
          glowClass="bg-sky-500"
        />
        <KPICard
          label="Rating"
          value={rating > 0 ? `${rating.toFixed(1)} / 5` : "—"}
          sub="Customer score"
          trend={rating >= 4.5 ? "Top driver" : rating > 0 ? "Keep improving" : "No ratings yet"}
          trendUp={rating >= 4.0}
          icon={Star}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10 border-amber-500/20"
          sparkData={rateSpark.length > 1 ? rateSpark : [0, 1]}
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
            <p className="text-sm font-bold text-teal-400">{formatKobo(totalWeekEarnings)}</p>
            <p className="text-[10px] text-zinc-600">weekly total</p>
          </div>
        </div>

        <div className="flex items-stretch gap-1.5 sm:gap-3 h-44 sm:h-36">
          {weeklyData.map(({ day, earning, deliveries }, i) => {
            const pct      = (earning / maxEarning) * 100;
            const isToday  = i === new Date().getDay() - 1;
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
                {isActive && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-xl border border-white/[0.1] bg-[#16161d] px-3 py-2 text-center shadow-xl pointer-events-none">
                    <p className="text-xs font-bold text-white">{formatKobo(earning)}</p>
                    <p className="text-[10px] text-zinc-500">{deliveries} trips</p>
                  </div>
                )}
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
                <span className={cn("text-[10px] font-medium", isToday ? "text-teal-400" : "text-zinc-600")}>
                  {day}
                </span>
                <span className="text-[9px] text-zinc-700">{deliveries}x</span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-2.5">
          <span className="text-xs text-zinc-500">Weekly total</span>
          <span className="text-sm font-bold text-emerald-400">{formatKobo(totalWeekEarnings)}</span>
        </div>
      </div>

      {/* ── Monthly history ── */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.05]">
          <p className="text-sm font-semibold text-white">Monthly History</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">
            {monthlyHistory.length > 0
              ? `${monthlyHistory.length} month${monthlyHistory.length > 1 ? "s" : ""} with earnings`
              : "Earnings will appear here once you complete deliveries"}
          </p>
        </div>

        {monthlyHistory.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <Calendar className="h-5 w-5 text-zinc-700" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-400">No earnings history yet</p>
              <p className="text-xs text-zinc-600 mt-1">
                Complete your first delivery to see monthly stats here
              </p>
            </div>
          </div>
        ) : (
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
                {monthlyHistory.map(({ month, deliveries, earning }, i) => {
                  const prev  = monthlyHistory[i + 1];
                  const delta = prev && prev.earning > 0
                    ? ((earning - prev.earning) / prev.earning) * 100
                    : null;
                  const up = delta !== null && delta >= 0;
                  return (
                    <tr key={month} className="hover:bg-white/[0.015] transition-colors">
                      <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-zinc-700 shrink-0" />
                          <span className="text-sm font-medium text-zinc-200 truncate">{month}</span>
                        </div>
                      </td>
                       <td className="px-3 sm:px-5 py-3 sm:py-3.5 text-sm text-zinc-300 tabular-nums">
                         {deliveries}
                       </td>
                       <td className="px-3 sm:px-5 py-3 sm:py-3.5 text-sm font-semibold text-white tabular-nums">
                         {formatNaira(earning)}
                       </td>
                       <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                         {delta !== null ? (
                           <span className={cn(
                             "inline-flex items-center gap-1 text-xs font-semibold",
                             up ? "text-emerald-400" : "text-rose-400",
                           )}>
                             {up ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
                           </span>
                         ) : (
                           <span className="text-xs text-zinc-700">—</span>
                         )}
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
        )}
      </div>

      {/* Payout and Bank Account */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.05]">
          <p className="text-sm font-semibold text-white">Payout &amp; Bank Account</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">
            Your earnings are paid out weekly every Friday
          </p>
        </div>

        {/* Pending payout summary */}
        <div className="px-5 py-4 border-b border-white/[0.05]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] text-zinc-600 uppercase tracking-wider font-semibold">Pending payout</p>
              <p className="text-2xl font-bold text-white tabular-nums mt-1">{formatKobo(pendingBalance)}</p>
              <p className="text-[11px] text-zinc-600 mt-0.5">
                Estimated release on <span className="text-zinc-400 font-medium">{nextFriday}</span>
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 border border-teal-500/20">
              <CreditCard className="h-5 w-5 text-teal-400" />
            </div>
          </div>
        </div>

        {/* Bank account coming soon */}
        <div className="flex flex-col items-center justify-center py-12 px-5 gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <CreditCard className="h-5 w-5 text-zinc-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400">Bank account setup</p>
            <p className="text-xs text-zinc-600 mt-1">
              Direct bank transfers will be available soon.
              <br />
              For now, payouts are processed manually by the IsoTrack team.
            </p>
          </div>
          <span className="mt-1 inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/[0.06] px-3 py-1 text-[11px] font-semibold text-amber-400/70">
            Coming soon
          </span>
        </div>
      </div>
    </div>
  );
}
