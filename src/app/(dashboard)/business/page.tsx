"use client";

import Link from "next/link";
import type { Route } from "next";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Plus,
  Truck,
  UserCheck,
  XCircle,
} from "lucide-react";
import { getShipmentList, useShipments } from "@/hooks/use-shipments";
import { useBusinessAnalytics } from "@/hooks/use-business";
import { useDrivers } from "@/hooks/use-driver";
import type { Driver, Shipment, ShipmentStatus } from "@/types";
import { cn } from "@/lib/utils";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

const STATUS_META: Record<
  ShipmentStatus,
  { label: string; tone: string; bar: string; Icon: typeof Package }
> = {
  pending: { label: "Pending", tone: "border-amber-400/25 bg-amber-400/10 text-amber-200", bar: "bg-amber-300", Icon: Clock },
  assigned: { label: "Assigned", tone: "border-teal-400/25 bg-teal-400/10 text-teal-200", bar: "bg-teal-300", Icon: UserCheck },
  picked_up: { label: "Picked up", tone: "border-teal-400/25 bg-teal-400/10 text-teal-200", bar: "bg-teal-300", Icon: Package },
  in_transit: { label: "In transit", tone: "border-teal-400/25 bg-teal-400/10 text-teal-200", bar: "bg-teal-300", Icon: Truck },
  out_for_delivery: { label: "Out for delivery", tone: "border-teal-400/25 bg-teal-400/10 text-teal-200", bar: "bg-teal-300", Icon: MapPin },
  delivered: { label: "Delivered", tone: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200", bar: "bg-emerald-300", Icon: CheckCircle2 },
  failed: { label: "Failed", tone: "border-rose-400/25 bg-rose-400/10 text-rose-200", bar: "bg-rose-300", Icon: XCircle },
  cancelled: { label: "Cancelled", tone: "border-stone-600 bg-white/[0.04] text-stone-400", bar: "bg-stone-500", Icon: XCircle },
};

const ACTIVE_STATUSES: ShipmentStatus[] = ["assigned", "picked_up", "in_transit", "out_for_delivery"];

function StatTile({
  label,
  value,
  sub,
  Icon,
  accent = "teal",
}: {
  label: string;
  value: string;
  sub: string;
  Icon: typeof Package;
  accent?: "teal" | "amber" | "emerald" | "rose";
}) {
  const tone = {
    teal: "border-teal-400/20 bg-teal-400/10 text-teal-200",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    rose: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  }[accent];

  return (
    <div className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-600">{label}</p>
          <p className="mt-3 truncate text-2xl font-black tracking-tight text-stone-50">{value}</p>
          <p className="mt-1 text-xs font-bold text-stone-600">{sub}</p>
        </div>
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md border", tone)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function ShipmentRow({ shipment }: { shipment: Shipment }) {
  const meta = STATUS_META[shipment.status];
  const Icon = meta.Icon;

  return (
    <Link
      href={("/business/shipments" as Route)}
      className="grid grid-cols-[auto,1fr,auto] items-center gap-3 px-4 py-3 transition hover:bg-white/[0.03]"
    >
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-md border", meta.tone)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate font-mono text-xs font-black text-stone-100">{shipment.trackingId}</p>
        <p className="mt-0.5 truncate text-[11px] text-stone-600">
          {shipment.pickupAddress.city} to {shipment.deliveryAddress.city}
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs font-black text-stone-100">{formatNaira(shipment.priceKobo)}</p>
        <p className="mt-0.5 text-[10px] font-bold text-stone-600">{meta.label}</p>
      </div>
    </Link>
  );
}

function StatusBreakdown({
  shipments,
  breakdown,
}: {
  shipments: Shipment[];
  breakdown: Record<string, number>;
}) {
  const total = shipments.length || Object.values(breakdown).reduce((sum, value) => sum + value, 0);

  return (
    <section className="rounded-md border border-white/[0.07] bg-[#0d1412]">
      <div className="border-b border-white/[0.07] px-4 py-4">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-600">Status board</p>
        <h3 className="mt-1 text-base font-black text-stone-50">Shipment mix</h3>
      </div>
      <div className="space-y-3 p-4">
        {Object.entries(STATUS_META).map(([status, meta]) => {
          const count = breakdown[status] ?? shipments.filter((shipment) => shipment.status === status).length;
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={status}>
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="text-[11px] font-black text-stone-300">{meta.label}</span>
                <span className="text-[10px] font-bold text-stone-600">{count} ({percent}%)</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div className={cn("h-full rounded-full transition-all", meta.bar)} style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FleetStrip({ drivers }: { drivers: Driver[] }) {
  if (!drivers.length) {
    return (
      <div className="rounded-md border border-dashed border-white/[0.1] bg-white/[0.02] px-4 py-8 text-center">
        <Truck className="mx-auto h-5 w-5 text-stone-700" />
        <p className="mt-2 text-sm font-black text-stone-300">No drivers registered yet</p>
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto p-4">
      {drivers.slice(0, 8).map((driver) => {
        const initials = driver.user?.name
          ?.split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "DV";
        const online = driver.status === "available" || driver.status === "on_delivery";

        return (
          <div key={driver.id} className="min-w-32 rounded-md border border-white/[0.07] bg-white/[0.03] p-3">
            <div className="flex items-center gap-2">
              <div className="relative flex h-8 w-8 items-center justify-center rounded bg-teal-400/10 text-[11px] font-black text-teal-200 ring-1 ring-teal-400/20">
                {initials}
                <span className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[#0d1412]", online ? "bg-emerald-300" : "bg-stone-600")} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-black text-stone-100">{driver.user?.name ?? "Driver"}</p>
                <p className="text-[10px] font-bold capitalize text-stone-600">{driver.status.replace("_", " ")}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function BusinessOverviewPage() {
  const { data: analytics } = useBusinessAnalytics();
  const { data: shipmentsData, isLoading: shipmentsLoading } = useShipments({ pageSize: 40 });
  const { data: drivers = [], isLoading: driversLoading } = useDrivers();
  const shipments = getShipmentList(shipmentsData);

  const totalShipments = analytics?.totalShipments ?? shipments.length;
  const statusBreakdown = analytics?.statusBreakdown ?? {};
  const deliveredCount = statusBreakdown.delivered ?? shipments.filter((shipment) => shipment.status === "delivered").length;
  const activeShipments = shipments.filter((shipment) => ACTIVE_STATUSES.includes(shipment.status)).length;
  const exceptions = shipments.filter((shipment) => shipment.status === "failed" || shipment.status === "cancelled").length;
  const onlineDrivers = drivers.filter((driver) => driver.status === "available" || driver.status === "on_delivery").length;
  const successRate = totalShipments > 0 ? Math.round((deliveredCount / totalShipments) * 100) : 0;
  const nextShipment = shipments.find((shipment) => ACTIVE_STATUSES.includes(shipment.status)) ?? shipments[0];

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr,auto] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-200">Business control room</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-50 sm:text-3xl">Operations Overview</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
              Monitor shipment flow, driver capacity, payment value, and exceptions from one dispatch board.
            </p>
          </div>
          <Link
            href="/business/shipments/new"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-300 px-4 py-2.5 text-sm font-black text-black transition hover:bg-amber-200"
          >
            <Plus className="h-4 w-4" />
            New shipment
          </Link>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Shipments" value={String(totalShipments)} sub={`${activeShipments} active right now`} Icon={Package} />
        <StatTile label="Revenue" value={formatNaira(analytics?.totalRevenueKobo ?? 0)} sub="Total shipment value" Icon={ArrowRight} accent="amber" />
        <StatTile label="Drivers" value={`${onlineDrivers}/${drivers.length}`} sub="Available or on delivery" Icon={Truck} accent="emerald" />
        <StatTile label="Success rate" value={`${successRate}%`} sub={`${exceptions} exceptions recorded`} Icon={exceptions > 0 ? AlertCircle : CheckCircle2} accent={exceptions > 0 ? "rose" : "teal"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr,360px]">
        <section className="overflow-hidden rounded-md border border-white/[0.07] bg-[#0d1412]">
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-600">Manifest feed</p>
              <h3 className="mt-1 text-base font-black text-stone-50">Recent shipments</h3>
            </div>
            <Link href="/business/shipments" className="text-xs font-black text-teal-200 hover:text-teal-100">
              View all
            </Link>
          </div>

          {shipmentsLoading ? (
            <div className="flex items-center justify-center py-14">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-300 border-t-transparent" />
            </div>
          ) : shipments.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Package className="mx-auto h-6 w-6 text-stone-700" />
              <p className="mt-3 text-sm font-black text-stone-200">No shipments yet</p>
              <Link href="/business/shipments/new" className="mt-2 inline-flex text-xs font-black text-amber-200 hover:text-amber-100">
                Create your first shipment
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {shipments.slice(0, 7).map((shipment) => <ShipmentRow key={shipment.id} shipment={shipment} />)}
            </div>
          )}
        </section>

        <div className="space-y-4">
          {nextShipment && (
            <section className="rounded-md border border-teal-400/20 bg-teal-400/10 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-teal-200">Priority shipment</p>
              <p className="mt-3 font-mono text-sm font-black text-stone-100">{nextShipment.trackingId}</p>
              <p className="mt-2 text-xs leading-5 text-stone-500">
                {nextShipment.pickupAddress.city} to {nextShipment.deliveryAddress.city}
              </p>
              <Link
                href="/business/shipments"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-teal-400/25 bg-black/20 px-3 py-2 text-xs font-black text-teal-100 transition hover:bg-teal-400/[0.16]"
              >
                Open shipment file
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </section>
          )}
          <StatusBreakdown shipments={shipments} breakdown={statusBreakdown} />
        </div>
      </div>

      <section className="overflow-hidden rounded-md border border-white/[0.07] bg-[#0d1412]">
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-600">Fleet board</p>
            <h3 className="mt-1 text-base font-black text-stone-50">Driver availability</h3>
          </div>
          <Link href="/business/drivers" className="text-xs font-black text-teal-200 hover:text-teal-100">
            Manage fleet
          </Link>
        </div>
        {driversLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-300 border-t-transparent" />
          </div>
        ) : (
          <FleetStrip drivers={drivers} />
        )}
      </section>
    </div>
  );
}
