"use client";

import Link from "next/link";
import { CheckCircle2, Clock, DollarSign, Package, Star, Truck } from "lucide-react";
import { useDriverProfile, useUpdateDriverStatus } from "@/hooks/use-driver";
import { useActiveDelivery, useDriverHistory } from "@/hooks/use-shipments";
import type { DriverStatus, Shipment } from "@/types";
import { cn } from "@/lib/utils";
import { ExistingFleetEnrollment } from "@/components/dashboard/existing-fleet-enrollment";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

const ACTIVE_STATUSES = ["assigned", "picked_up", "in_transit", "out_for_delivery"];

function StatTile({
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
  tone?: "teal" | "amber" | "emerald";
}) {
  const colors = {
    teal: "border-teal-400/20 bg-teal-400/10 text-teal-200",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
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

function ActiveDeliveryCard({ shipment }: { shipment: Shipment | null }) {
  if (!shipment) {
    return (
      <section className="rounded-md border border-dashed border-white/[0.1] bg-[#0d1412] p-5 text-center">
        <Truck className="mx-auto h-6 w-6 text-stone-700" />
        <p className="mt-3 text-sm font-black text-stone-200">No active delivery right now</p>
        <p className="mt-1 text-xs leading-5 text-stone-600">New assigned deliveries will appear here when dispatch sends them.</p>
      </section>
    );
  }

  return (
    <section className="rounded-md border border-teal-400/20 bg-teal-400/10 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-200">Current job</p>
          <h3 className="mt-2 font-mono text-xl font-black text-stone-50">{shipment.trackingId}</h3>
          <p className="mt-2 text-sm leading-6 text-stone-500">{shipment.description}</p>
        </div>
        <span className="rounded-md border border-teal-400/25 bg-black/20 px-3 py-1.5 text-xs font-black capitalize text-teal-100">
          {shipment.status.replace("_", " ")}
        </span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-teal-400/20 bg-black/20 p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-teal-200">Pickup</p>
          <p className="mt-1 truncate text-sm font-black text-stone-100">{shipment.pickupAddress.street}</p>
          <p className="text-xs text-stone-500">{shipment.pickupAddress.city}</p>
        </div>
        <div className="rounded-md border border-amber-400/20 bg-black/20 p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-200">Drop-off</p>
          <p className="mt-1 truncate text-sm font-black text-stone-100">{shipment.deliveryAddress.street}</p>
          <p className="text-xs text-stone-500">{shipment.deliveryAddress.city}</p>
        </div>
      </div>
      <Link href="/driver/deliveries" className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-amber-300 px-4 py-2.5 text-sm font-black text-black transition hover:bg-amber-200">
        Open delivery controls
      </Link>
    </section>
  );
}

export default function DriverOverviewPage() {
  const { data: driver, isLoading } = useDriverProfile();
  const updateStatus = useUpdateDriverStatus();
  const { data: allShipments = [] } = useDriverHistory({ pageSize: 200 });
  const { activeDelivery } = useActiveDelivery();

  const delivered = allShipments.filter((shipment) => shipment.status === "delivered");
  const today = new Date().toDateString();
  const todayDelivered = delivered.filter((shipment) => shipment.actualDelivery && new Date(shipment.actualDelivery).toDateString() === today);
  const todayEarnings = todayDelivered.reduce((sum, shipment) => sum + Math.round(shipment.priceKobo * 0.4), 0);
  const weeklyEarnings = delivered.reduce((sum, shipment) => {
    const date = new Date(shipment.actualDelivery ?? shipment.updatedAt);
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    start.setHours(0, 0, 0, 0);
    return date >= start ? sum + Math.round(shipment.priceKobo * 0.4) : sum;
  }, 0);
  const activeCount = allShipments.filter((shipment) => ACTIVE_STATUSES.includes(shipment.status)).length;

  async function setStatus(status: DriverStatus) {
    await updateStatus.mutateAsync(status);
  }

  if (isLoading) {
    return <div className="mx-auto max-w-6xl rounded-md border border-white/[0.07] bg-[#0d1412] py-16 text-center text-sm font-bold text-stone-600">Loading driver dashboard...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {driver?.businessId === null && <ExistingFleetEnrollment key={driver.id} />}
      <section className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr,auto] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-200">Driver field console</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-50 sm:text-3xl">Overview</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
              Track today&apos;s route, delivery state, earnings, and availability from one place.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(["available", "on_delivery", "offline"] as DriverStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => void setStatus(status)}
                disabled={updateStatus.isPending}
                className={cn(
                  "rounded-md border px-3 py-2 text-xs font-black capitalize transition disabled:opacity-50",
                  driver?.status === status ? "border-teal-400/30 bg-teal-400/10 text-teal-100" : "border-white/[0.07] bg-white/[0.03] text-stone-500 hover:text-stone-200",
                )}
              >
                {status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Today" value={formatNaira(todayEarnings)} sub={`${todayDelivered.length} completed trips`} Icon={DollarSign} tone="amber" />
        <StatTile label="This week" value={formatNaira(weeklyEarnings)} sub="Pending Friday payout" Icon={Clock} />
        <StatTile label="Active jobs" value={String(activeCount)} sub="Assigned or moving" Icon={Package} />
        <StatTile label="Rating" value={driver?.rating ? driver.rating.toFixed(1) : "New"} sub={`${driver?.totalDeliveries ?? delivered.length} total deliveries`} Icon={Star} tone="emerald" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr,320px]">
        <ActiveDeliveryCard shipment={activeDelivery} />
        <section className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-600">Recent completed</p>
          <div className="mt-4 space-y-2">
            {delivered.slice(0, 5).length === 0 ? (
              <p className="text-sm text-stone-600">Completed deliveries will appear here.</p>
            ) : (
              delivered.slice(0, 5).map((shipment) => (
                <div key={shipment.id} className="rounded-md border border-white/[0.07] bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-xs font-black text-stone-100">{shipment.trackingId}</p>
                    <p className="text-xs font-black text-emerald-200">{formatNaira(Math.round(shipment.priceKobo * 0.4))}</p>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-stone-600">{shipment.pickupAddress.city} to {shipment.deliveryAddress.city}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-teal-200" />
          <p className="text-sm font-black text-stone-100">Field note</p>
        </div>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          Turn on live GPS from the Deliveries page while handling active jobs so customers can follow the handoff.
        </p>
      </section>
    </div>
  );
}
