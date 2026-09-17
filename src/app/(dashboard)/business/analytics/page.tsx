"use client";

import { useMemo } from "react";
import { BarChart3, CheckCircle2, Package, TrendingUp, XCircle } from "lucide-react";
import { useBusinessAnalytics } from "@/hooks/use-business";
import { getShipmentList, useShipments } from "@/hooks/use-shipments";
import type { Shipment, ShipmentStatus } from "@/types";
import { cn } from "@/lib/utils";

interface DailyStats {
  day: string;
  shipments: number;
  revenue: number;
  delivered: number;
}

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

function buildDailyStats(shipments: Shipment[]): DailyStats[] {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - index));
    return { day: labels[date.getDay()]!, shipments: 0, revenue: 0, delivered: 0 };
  });

  shipments.forEach((shipment) => {
    const created = new Date(shipment.createdAt);
    const diffDays = Math.floor((now.getTime() - created.getTime()) / 86_400_000);
    if (diffDays < 0 || diffDays > 6) return;
    const item = days[6 - diffDays];
    if (!item) return;
    item.shipments += 1;
    item.revenue += shipment.priceKobo;
    if (shipment.status === "delivered") item.delivered += 1;
  });

  return days;
}

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  pending: "Pending",
  assigned: "Assigned",
  picked_up: "Picked up",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  failed: "Failed",
  cancelled: "Cancelled",
};

const STATUS_BARS: Record<ShipmentStatus, string> = {
  pending: "bg-amber-300",
  assigned: "bg-teal-300",
  picked_up: "bg-teal-300",
  in_transit: "bg-teal-300",
  out_for_delivery: "bg-teal-300",
  delivered: "bg-emerald-300",
  failed: "bg-rose-300",
  cancelled: "bg-stone-500",
};

function Metric({
  label,
  value,
  sub,
  Icon,
  tone = "teal",
}: {
  label: string;
  value: string;
  sub: string;
  Icon: typeof Package;
  tone?: "teal" | "amber" | "emerald" | "rose";
}) {
  const colors = {
    teal: "border-teal-400/20 bg-teal-400/10 text-teal-200",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    rose: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  }[tone];

  return (
    <div className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-600">{label}</p>
          <p className="mt-3 text-2xl font-black tracking-tight text-stone-50">{value}</p>
          <p className="mt-1 text-xs font-bold text-stone-600">{sub}</p>
        </div>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-md border", colors)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function WeeklyBars({ data }: { data: DailyStats[] }) {
  const max = Math.max(...data.map((item) => item.revenue), 1);

  return (
    <section className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-600">Last 7 days</p>
          <h3 className="mt-1 text-base font-black text-stone-50">Revenue rhythm</h3>
        </div>
        <p className="text-xs font-black text-amber-200">{formatNaira(data.reduce((sum, item) => sum + item.revenue, 0))}</p>
      </div>
      <div className="mt-6 grid h-56 grid-cols-7 items-end gap-2">
        {data.map((item) => (
          <div key={item.day} className="flex h-full min-w-0 flex-col justify-end gap-2">
            <div className="flex flex-1 items-end rounded bg-white/[0.03]">
              <div
                className="w-full rounded bg-gradient-to-t from-amber-300 to-teal-200 transition-all"
                style={{ height: `${Math.max(8, (item.revenue / max) * 100)}%` }}
                title={`${item.day}: ${formatNaira(item.revenue)}`}
              />
            </div>
            <p className="truncate text-center text-[10px] font-black text-stone-600">{item.day}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AnalyticsPage() {
  const { data: analytics, isLoading: analyticsLoading } = useBusinessAnalytics();
  const { data: shipmentsData, isLoading: shipmentsLoading } = useShipments({ pageSize: 200 });
  const shipments = getShipmentList(shipmentsData);
  const dailyStats = useMemo(() => buildDailyStats(shipments), [shipments]);
  const loading = analyticsLoading || shipmentsLoading;

  const totalShipments = analytics?.totalShipments ?? shipments.length;
  const totalRevenue = analytics?.totalRevenueKobo ?? shipments.reduce((sum, shipment) => sum + shipment.priceKobo, 0);
  const delivered = analytics?.statusBreakdown?.delivered ?? shipments.filter((shipment) => shipment.status === "delivered").length;
  const failed = (analytics?.statusBreakdown?.failed ?? 0) + (analytics?.statusBreakdown?.cancelled ?? 0);
  const successRate = totalShipments > 0 ? Math.round((delivered / totalShipments) * 100) : 0;
  const weekShipments = dailyStats.reduce((sum, item) => sum + item.shipments, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4 sm:p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-200">Performance board</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-50 sm:text-3xl">Analytics</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
          Read shipment volume, revenue, delivery reliability, and exception patterns across your dispatch operation.
        </p>
      </section>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-md bg-white/[0.04]" />)}
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Revenue" value={formatNaira(totalRevenue)} sub="All recorded shipments" Icon={TrendingUp} tone="amber" />
            <Metric label="Shipments" value={String(totalShipments)} sub={`${weekShipments} created this week`} Icon={Package} />
            <Metric label="Success rate" value={`${successRate}%`} sub={`${delivered} delivered`} Icon={CheckCircle2} tone="emerald" />
            <Metric label="Exceptions" value={String(failed)} sub="Failed or cancelled" Icon={XCircle} tone={failed > 0 ? "rose" : "teal"} />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.35fr,0.65fr]">
            <WeeklyBars data={dailyStats} />
            <section className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-600">Status distribution</p>
              <h3 className="mt-1 text-base font-black text-stone-50">Shipment health</h3>
              <div className="mt-5 space-y-3">
                {(Object.keys(STATUS_LABELS) as ShipmentStatus[]).map((status) => {
                  const count = analytics?.statusBreakdown?.[status] ?? shipments.filter((shipment) => shipment.status === status).length;
                  const percent = totalShipments > 0 ? Math.round((count / totalShipments) * 100) : 0;
                  return (
                    <div key={status}>
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <span className="text-[11px] font-black text-stone-300">{STATUS_LABELS[status]}</span>
                        <span className="text-[10px] font-bold text-stone-600">{count} ({percent}%)</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div className={cn("h-full rounded-full", STATUS_BARS[status])} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <section className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-teal-200" />
              <p className="text-sm font-black text-stone-100">Route intelligence</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              Detailed route ranking can be layered here once the backend returns origin-destination aggregation. Current analytics are computed from available shipment records.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
