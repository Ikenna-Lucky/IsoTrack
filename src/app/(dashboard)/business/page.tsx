"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import type { Route } from "next";
import {
  Package,
  TrendingUp,
  Users,
  CheckCircle2,
  Plus,
  ArrowRight,
  Truck,
  Clock,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useState } from "react";
import {
  MOCK_SHIPMENTS,
  MOCK_DRIVERS,
  DAILY_STATS,
  STATUS_META,
  formatNaira,
  formatDate,
} from "@/lib/mock/business";
import { useSocket, type LocationUpdate } from "@/hooks/use-socket";

const LiveMap = dynamic(
  () => import("@/components/map/live-map").then((m) => m.LiveMap),
  { ssr: false, loading: () => <div className="h-52 w-full animate-pulse rounded-xl bg-zinc-800/60" /> }
);

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  color,
  bg,
  border,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  trend?: string;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/[0.09] hover:bg-white/[0.03] transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} border ${border}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
      <p className="text-xs font-medium text-zinc-400">{label}</p>
      <p className="text-[11px] text-zinc-600 mt-0.5">{sub}</p>
    </div>
  );
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────

function MiniBarChart() {
  const max = Math.max(...DAILY_STATS.map((d) => d.shipments));
  return (
    <div className="flex items-end gap-1.5 h-16">
      {DAILY_STATS.map((d, i) => (
        <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex items-end" style={{ height: "52px" }}>
            <div
              className="w-full rounded-t-sm transition-all duration-700"
              style={{
                height: `${(d.shipments / max) * 100}%`,
                background:
                  i === DAILY_STATS.length - 1
                    ? "linear-gradient(to top, #0ea5e9, #38bdf8)"
                    : "rgba(255,255,255,0.08)",
              }}
            />
          </div>
          <span className="text-[9px] text-zinc-700">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BusinessOverviewPage() {
  const [liveLocation, setLiveLocation] = useState<LocationUpdate | null>(null);

  const activeShipment = MOCK_SHIPMENTS.find(
    (s) => s.status === "in_transit" || s.status === "out_for_delivery",
  );

  const { connected } = useSocket({
    trackingId: activeShipment?.trackingId ?? null,
    onLocation: (update) => setLiveLocation(update),
  });

  const recent = MOCK_SHIPMENTS.slice(0, 5);
  const activeDrivers = MOCK_DRIVERS.filter((d) => d.status === "active").length;
  const totalRevenue = MOCK_SHIPMENTS.reduce((sum, s) => sum + s.amount, 0);
  const deliveredCount = MOCK_SHIPMENTS.filter((s) => s.status === "delivered").length;
  const successRate = Math.round((deliveredCount / MOCK_SHIPMENTS.length) * 100);

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Welcome header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Good morning 👋</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Here&apos;s what&apos;s happening with your deliveries today.
          </p>
        </div>
        <Link
          href={"/business/shipments/new" as Route}
          className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20 shrink-0"
        >
          <Plus className="h-4 w-4" />
          New Shipment
        </Link>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Total Shipments"
          value={String(MOCK_SHIPMENTS.length)}
          sub="All time"
          trend="+18% this week"
          color="text-sky-400"
          bg="bg-sky-500/10"
          border="border-sky-500/20"
        />
        <StatCard
          icon={Truck}
          label="Active Drivers"
          value={`${activeDrivers}/${MOCK_DRIVERS.length}`}
          sub="Online right now"
          color="text-teal-400"
          bg="bg-teal-500/10"
          border="border-teal-500/20"
        />
        <StatCard
          icon={TrendingUp}
          label="Revenue (MTD)"
          value={formatNaira(totalRevenue)}
          sub="Month to date"
          trend="+22%"
          color="text-violet-400"
          bg="bg-violet-500/10"
          border="border-violet-500/20"
        />
        <StatCard
          icon={CheckCircle2}
          label="Success Rate"
          value={`${successRate}%`}
          sub="Delivered on time"
          trend="+1.2%"
          color="text-emerald-400"
          bg="bg-emerald-500/10"
          border="border-emerald-500/20"
        />
      </div>

      {/* ── Live tracking panel ── */}
      {activeShipment && (
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                Live Driver — {activeShipment.trackingId}
              </span>
            </div>
            <span className={`flex items-center gap-1 text-[10px] font-medium ${connected ? "text-emerald-400" : "text-zinc-600"}`}>
              {connected ? <Wifi size={10} /> : <WifiOff size={10} />}
              {connected ? "Connected" : "Connecting…"}
            </span>
          </div>
          <LiveMap location={liveLocation} className="h-52 border border-white/[0.06]" />
          {!liveLocation && connected && (
            <p className="mt-2 text-center text-[10px] text-zinc-600">
              Waiting for driver to broadcast location…
            </p>
          )}
        </div>
      )}

      {/* ── Content row ── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Recent shipments */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
            <p className="text-sm font-semibold text-white">Recent Shipments</p>
            <Link
              href={"/business/shipments" as Route}
              className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors font-medium"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {recent.map((s) => {
              const meta = STATUS_META[s.status];
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Status dot */}
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: meta.dot, boxShadow: `0 0 6px ${meta.dot}` }}
                  />
                  {/* Tracking ID */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono font-semibold text-zinc-200 truncate">
                      {s.trackingId}
                    </p>
                    <p className="text-[11px] text-zinc-600 truncate">
                      {s.pickup.city} → {s.delivery.city}
                    </p>
                  </div>
                  {/* Status badge */}
                  <span
                    className={`hidden sm:flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium shrink-0 ${meta.color} ${meta.bg} ${meta.border}`}
                  >
                    {meta.label}
                  </span>
                  {/* Amount */}
                  <p className="text-xs font-semibold text-zinc-300 shrink-0">
                    {formatNaira(s.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Volume chart */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-white">Weekly Volume</p>
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
                Last 7 days
              </span>
            </div>
            <MiniBarChart />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
              <div>
                <p className="text-lg font-bold text-white">
                  {DAILY_STATS.reduce((s, d) => s + d.shipments, 0)}
                </p>
                <p className="text-[10px] text-zinc-600">Total shipments</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">
                  {formatNaira(DAILY_STATS.reduce((s, d) => s + d.revenue, 0))}
                </p>
                <p className="text-[10px] text-zinc-600">Total revenue</p>
              </div>
            </div>
          </div>

          {/* Driver status */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="text-sm font-semibold text-white mb-4">Driver Status</p>
            <div className="space-y-3">
              {(["active", "idle", "offline"] as const).map((status) => {
                const count = MOCK_DRIVERS.filter((d) => d.status === status).length;
                const pct = Math.round((count / MOCK_DRIVERS.length) * 100);
                const colors = {
                  active: { bar: "#10b981", text: "text-emerald-400", label: "Active" },
                  idle: { bar: "#f59e0b", text: "text-amber-400", label: "Idle" },
                  offline: { bar: "#52526a", text: "text-zinc-500", label: "Offline" },
                };
                const c = colors[status];
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-medium ${c.text}`}>{c.label}</span>
                      <span className="text-xs text-zinc-500">
                        {count} driver{count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: c.bar }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <Link
              href={"/business/drivers" as Route}
              className="mt-4 flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 transition-colors font-medium"
            >
              Manage drivers
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Quick stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            icon: Clock,
            label: "Avg Delivery Time",
            value: "38 min",
            color: "text-sky-400",
          },
          {
            icon: Package,
            label: "Pending Today",
            value: String(MOCK_SHIPMENTS.filter((s) => s.status === "pending").length),
            color: "text-amber-400",
          },
          {
            icon: Truck,
            label: "In Transit",
            value: String(
              MOCK_SHIPMENTS.filter(
                (s) => s.status === "in_transit" || s.status === "out_for_delivery",
              ).length,
            ),
            color: "text-violet-400",
          },
          {
            icon: CheckCircle2,
            label: "Delivered Today",
            value: String(MOCK_SHIPMENTS.filter((s) => s.status === "delivered").length),
            color: "text-emerald-400",
          },
        ].map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-4 flex items-center gap-3"
          >
            <Icon className={`h-4 w-4 shrink-0 ${color}`} />
            <div>
              <p className="text-sm font-bold text-white">{value}</p>
              <p className="text-[10px] text-zinc-600">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
