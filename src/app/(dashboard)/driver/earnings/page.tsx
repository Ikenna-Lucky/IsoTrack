"use client";

import { TrendingUp, Package, DollarSign, Star } from "lucide-react";
import {
  CURRENT_DRIVER,
  DAILY_EARNINGS,
  MOCK_DELIVERIES,
  formatNaira,
} from "@/lib/mock/driver";

// ─── Computed totals ──────────────────────────────────────────────────────────

const totalWeekEarnings = DAILY_EARNINGS.reduce((s, d) => s + d.earning, 0);
const totalWeekDeliveries = DAILY_EARNINGS.reduce((s, d) => s + d.deliveries, 0);
const totalAllTimeEarnings = MOCK_DELIVERIES.reduce((s, d) => s + d.driverEarning, 0);
const maxEarning = Math.max(...DAILY_EARNINGS.map((d) => d.earning));

// Monthly breakdown mock
const MONTHLY = [
  { month: "Sep 2023", deliveries: 72, earning: 112320 },
  { month: "Oct 2023", deliveries: 88, earning: 137280 },
  { month: "Nov 2023", deliveries: 79, earning: 123240 },
  { month: "Dec 2023", deliveries: 96, earning: 149760 },
  { month: "Jan 2024", deliveries: 42, earning: 65520 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DriverEarningsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">Earnings</h2>
        <p className="text-xs text-zinc-500">Your income overview and payment history</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "This Week", value: formatNaira(totalWeekEarnings), icon: TrendingUp, color: "text-emerald-400", sub: `${totalWeekDeliveries} deliveries` },
          { label: "All-Time Earnings", value: formatNaira(totalAllTimeEarnings), icon: DollarSign, color: "text-teal-400", sub: `${CURRENT_DRIVER.totalDeliveries} trips` },
          { label: "Avg per Trip", value: formatNaira(Math.round(totalAllTimeEarnings / CURRENT_DRIVER.totalDeliveries)), icon: Package, color: "text-sky-400", sub: "per delivery" },
          { label: "Rating", value: `${CURRENT_DRIVER.rating} / 5`, icon: Star, color: "text-amber-400", sub: "customer score" },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <Icon size={15} className={`mb-2 ${color}`} />
            <p className="text-lg font-bold text-zinc-100">{value}</p>
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">{label}</p>
            <p className="text-[10px] text-zinc-600">{sub}</p>
          </div>
        ))}
      </div>

      {/* Weekly bar chart */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
        <h3 className="mb-1 text-sm font-semibold text-zinc-200">Daily Breakdown — This Week</h3>
        <p className="mb-5 text-xs text-zinc-500">Tap a bar to see the day's details</p>

        <div className="flex items-end gap-3 h-36">
          {DAILY_EARNINGS.map(({ day, earning, deliveries }) => {
            const pct = (earning / maxEarning) * 100;
            const isToday = day === "Sun";
            return (
              <div key={day} className="group flex flex-1 flex-col items-center gap-1 cursor-pointer">
                {/* Tooltip */}
                <div className="hidden group-hover:block absolute -mt-16 z-10 rounded-lg border border-white/[0.08] bg-zinc-900 px-2.5 py-1.5 text-center shadow-xl">
                  <p className="text-xs font-semibold text-zinc-100">{formatNaira(earning)}</p>
                  <p className="text-[10px] text-zinc-500">{deliveries} trips</p>
                </div>
                <div className="relative flex w-full flex-col justify-end" style={{ height: "120px" }}>
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      isToday ? "bg-teal-500" : "bg-zinc-700/60 group-hover:bg-zinc-600"
                    }`}
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className={`text-[10px] font-medium ${isToday ? "text-teal-400" : "text-zinc-600"}`}>
                  {day}
                </span>
                <span className="text-[9px] text-zinc-700">{deliveries}x</span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-black/20 px-3 py-2 text-xs">
          <span className="text-zinc-500">Weekly total</span>
          <span className="font-bold text-emerald-400">{formatNaira(totalWeekEarnings)}</span>
        </div>
      </div>

      {/* Monthly history table */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
        <h3 className="mb-4 text-sm font-semibold text-zinc-200">Monthly History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Month</th>
                <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Deliveries</th>
                <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Earnings</th>
                <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Avg/Trip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {[...MONTHLY].reverse().map(({ month, deliveries, earning }) => (
                <tr key={month} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 text-xs font-medium text-zinc-300">{month}</td>
                  <td className="py-2.5 text-right text-xs text-zinc-400">{deliveries}</td>
                  <td className="py-2.5 text-right text-xs font-semibold text-emerald-400">
                    {formatNaira(earning)}
                  </td>
                  <td className="py-2.5 text-right text-xs text-zinc-500">
                    {formatNaira(Math.round(earning / deliveries))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-emerald-500/[0.06] border border-emerald-500/15 px-3 py-2">
          <span className="text-xs text-zinc-400">All-time earnings</span>
          <span className="text-sm font-bold text-emerald-400">{formatNaira(totalAllTimeEarnings)}</span>
        </div>
      </div>

      {/* Payout info */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
        <h3 className="mb-3 text-sm font-semibold text-zinc-200">Payout Details</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-white/[0.05] bg-black/20 p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-600">Bank</p>
            <p className="text-sm font-medium text-zinc-200">GTBank · ****4521</p>
          </div>
          <div className="rounded-lg border border-white/[0.05] bg-black/20 p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-600">Next Payout</p>
            <p className="text-sm font-medium text-zinc-200">Friday, 19 Jan 2024</p>
          </div>
          <div className="rounded-lg border border-white/[0.05] bg-black/20 p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-600">Pending Balance</p>
            <p className="text-sm font-bold text-amber-400">{formatNaira(totalWeekEarnings)}</p>
          </div>
          <div className="rounded-lg border border-white/[0.05] bg-black/20 p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-600">Commission Rate</p>
            <p className="text-sm font-medium text-zinc-200">40% of shipment value</p>
          </div>
        </div>
      </div>
    </div>
  );
}
