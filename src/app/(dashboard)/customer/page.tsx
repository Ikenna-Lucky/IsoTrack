"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock3,
  MapPin,
  Navigation,
  PackageCheck,
  PackageSearch,
  ReceiptText,
  Route,
  Search,
  WalletCards,
} from "lucide-react";
import { getShipmentList, useShipments } from "@/hooks/use-shipments";
import { useAuthStore } from "@/store/auth";
import type { Shipment, ShipmentStatus } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_STEPS = [
  { status: "pending", label: "Order placed", sub: "Shipment request received" },
  { status: "assigned", label: "Driver assigned", sub: "A driver accepted the order" },
  { status: "picked_up", label: "Package picked up", sub: "Collected from pickup" },
  { status: "in_transit", label: "In transit", sub: "Moving through route" },
  { status: "out_for_delivery", label: "Out for delivery", sub: "Final handoff in progress" },
  { status: "delivered", label: "Delivered", sub: "Package received" },
] as const;

const ACTIVE_STATUSES: ShipmentStatus[] = [
  "assigned",
  "picked_up",
  "in_transit",
  "out_for_delivery",
];

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function readableStatus(status: ShipmentStatus) {
  return status.replace(/_/g, " ");
}

function statusTone(status: ShipmentStatus) {
  if (status === "delivered") return "text-emerald-300 bg-emerald-400/10 border-emerald-400/20";
  if (status === "failed" || status === "cancelled") return "text-rose-300 bg-rose-400/10 border-rose-400/20";
  if (ACTIVE_STATUSES.includes(status)) return "text-teal-200 bg-teal-400/10 border-teal-400/20";
  return "text-amber-200 bg-amber-400/10 border-amber-400/20";
}

function deriveTimeline(shipment: Shipment) {
  const order = STATUS_STEPS.map((step) => step.status as string);
  const currentIndex = Math.max(order.indexOf(shipment.status), 0);
  const stopped = shipment.status === "failed" || shipment.status === "cancelled";

  return STATUS_STEPS.map((step, index) => {
    const event = shipment.events?.find((item) => item.status === step.status);
    const state =
      stopped || index > currentIndex
        ? "pending"
        : index === currentIndex
          ? "current"
          : "done";

    return {
      ...step,
      state,
      message: event?.message ?? step.sub,
      time: event?.createdAt ? formatDate(event.createdAt) : null,
    };
  });
}

function StatTile({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof PackageCheck;
  tone: "teal" | "amber" | "stone" | "emerald";
}) {
  const toneClass = {
    teal: "border-teal-400/20 bg-teal-400/10 text-teal-200",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    stone: "border-stone-700 bg-white/[0.03] text-stone-300",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  }[tone];

  return (
    <div className="rounded-md border border-stone-800 bg-[#0d1412] p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">
          {label}
        </p>
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md border", toneClass)}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 truncate text-2xl font-black tracking-tight text-stone-100">{value}</p>
      <p className="mt-1 text-xs font-medium text-stone-600">{detail}</p>
    </div>
  );
}

function LiveShipmentCard({ shipment }: { shipment: Shipment }) {
  const timeline = deriveTimeline(shipment);

  return (
    <section className="overflow-hidden rounded-md border border-stone-800 bg-[#f2eadb] text-stone-950">
      <div className="border-b border-stone-300/80 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-teal-700">
              Current delivery
            </p>
            <h2 className="mt-2 text-3xl font-black leading-tight">
              {readableStatus(shipment.status)}
            </h2>
            <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-stone-600">
              {shipment.pickupAddress.city} to {shipment.deliveryAddress.city}. Follow the route and
              keep the tracking ID ready for the recipient handoff.
            </p>
          </div>
          <Link
            href="/customer/track"
            className="inline-flex items-center gap-2 rounded-md bg-stone-950 px-4 py-2.5 text-sm font-black text-stone-100 transition hover:bg-stone-800"
          >
            Open tracker
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <ManifestItem label="Tracking ID" value={shipment.trackingId} mono />
          <ManifestItem label="Estimated arrival" value={formatDate(shipment.estimatedDelivery)} />
          <ManifestItem label="Delivery fee" value={formatNaira(shipment.priceKobo)} />
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
        <RouteBlock
          label="Pickup"
          icon={PackageSearch}
          city={`${shipment.pickupAddress.city}, ${shipment.pickupAddress.state}`}
          address={shipment.pickupAddress.street}
        />
        <RouteBlock
          label="Drop-off"
          icon={MapPin}
          city={`${shipment.deliveryAddress.city}, ${shipment.deliveryAddress.state}`}
          address={shipment.deliveryAddress.street}
        />
      </div>

      <div className="border-t border-stone-300/80 p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
          Delivery log
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {timeline.slice(0, 6).map((item) => (
            <div key={item.status} className="flex gap-3">
              <span
                className={cn(
                  "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                  item.state === "done"
                    ? "border-emerald-600 bg-emerald-100 text-emerald-700"
                    : item.state === "current"
                      ? "border-teal-600 bg-teal-100 text-teal-700"
                      : "border-stone-300 bg-white/50 text-stone-400",
                )}
              >
                {item.state === "done" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-black text-stone-950">{item.label}</p>
                <p className="mt-0.5 line-clamp-1 text-xs font-medium text-stone-600">
                  {item.message}
                </p>
                {item.time && <p className="mt-1 text-[11px] font-bold text-stone-500">{item.time}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ManifestItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-md border border-stone-300/80 bg-white/45 px-3 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className={cn("mt-1 truncate text-sm font-black text-stone-950", mono && "font-mono tracking-wider")}>
        {value}
      </p>
    </div>
  );
}

function RouteBlock({
  label,
  icon: Icon,
  city,
  address,
}: {
  label: string;
  icon: typeof PackageSearch;
  city: string;
  address: string;
}) {
  return (
    <div className="border-t border-stone-300/80 p-5 lg:[&+&]:border-l">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-stone-300 bg-white/55">
          <Icon className="h-4 w-4 text-teal-700" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">{label}</p>
          <p className="mt-1 font-black text-stone-950">{city}</p>
          <p className="mt-1 text-sm leading-5 text-stone-600">{address}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <section className="rounded-md border border-stone-800 bg-[#0d1412] p-6 text-center sm:p-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md border border-teal-400/20 bg-teal-400/10">
        <PackageSearch className="h-7 w-7 text-teal-200" />
      </div>
      <h2 className="mt-5 text-2xl font-black text-stone-100">Track your first package</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
        Got a tracking ID from a sender? Paste it into the tracker to watch the delivery status,
        driver assignment, and handoff progress.
      </p>
      <Link
        href="/customer/track"
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-amber-400 px-5 py-3 text-sm font-black text-stone-950 transition hover:bg-amber-300"
      >
        Track a package
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

function RecentShipments({ shipments }: { shipments: Shipment[] }) {
  if (shipments.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-md border border-stone-800 bg-[#0d1412]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <p className="text-sm font-black text-stone-100">Recent shipments</p>
        <Link href="/customer/shipments" className="text-xs font-bold text-teal-200 hover:text-teal-100">
          View all
        </Link>
      </div>
      <div className="divide-y divide-white/[0.06]">
        {shipments.slice(0, 5).map((shipment) => (
          <Link
            key={shipment.id}
            href="/customer/shipments"
            className="grid gap-3 px-4 py-3 transition hover:bg-white/[0.03] sm:grid-cols-[1fr_auto] sm:items-center"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-mono text-sm font-black tracking-wider text-stone-100">
                  {shipment.trackingId}
                </p>
                <span
                  className={cn(
                    "rounded border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em]",
                    statusTone(shipment.status),
                  )}
                >
                  {readableStatus(shipment.status)}
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-stone-500">
                {shipment.pickupAddress.city} to {shipment.deliveryAddress.city}
              </p>
            </div>
            <p className="text-sm font-black text-stone-300">{formatNaira(shipment.priceKobo)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function QuickTrackPanel({ activeCount }: { activeCount: number }) {
  return (
    <aside className="rounded-md border border-stone-800 bg-[#0d1412] p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">Quick track</p>
      <h2 className="mt-3 text-xl font-black text-stone-100">Have a new tracking ID?</h2>
      <p className="mt-2 text-sm leading-6 text-stone-500">
        Open the tracker and paste the ID shared by the sender. Active deliveries refresh while
        they are moving.
      </p>
      <Link
        href="/customer/track"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-amber-400 px-4 py-3 text-sm font-black text-stone-950 transition hover:bg-amber-300"
      >
        <Search className="h-4 w-4" />
        Track package
      </Link>
      <div className="mt-5 rounded-md border border-white/10 bg-black/25 p-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-600">
          Active deliveries
        </p>
        <p className="mt-1 text-2xl font-black text-teal-200">{activeCount}</p>
      </div>
    </aside>
  );
}

export default function CustomerOverviewPage() {
  const user = useAuthStore((state) => state.user);
  const { data: shipmentsData } = useShipments({ pageSize: 50 });
  const shipments = getShipmentList(shipmentsData);

  const activeShipment =
    shipments.find((shipment) => shipment.status === "out_for_delivery") ??
    shipments.find((shipment) => shipment.status === "in_transit") ??
    shipments.find((shipment) => ACTIVE_STATUSES.includes(shipment.status));

  const pendingShipment = shipments.find((shipment) => shipment.status === "pending");
  const totalSpent = shipments.reduce((sum, shipment) => sum + shipment.priceKobo, 0);
  const deliveredCount = shipments.filter((shipment) => shipment.status === "delivered").length;
  const activeCount = shipments.filter((shipment) => ACTIVE_STATUSES.includes(shipment.status)).length;
  const paidCount = shipments.filter((shipment) => shipment.isPaid).length;
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="grid gap-4 rounded-md border border-stone-800 bg-[#0d1412] p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-teal-300">
            Customer dashboard
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-stone-100 sm:text-4xl">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
            Track active deliveries, confirm pickup and drop-off details, and keep your recent
            shipment records in one place.
          </p>
        </div>
        <Link
          href="/customer/track"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-400 px-5 py-3 text-sm font-black text-stone-950 transition hover:bg-amber-300"
        >
          Track package
          <Navigation className="h-4 w-4" />
        </Link>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Total spent" value={formatNaira(totalSpent)} detail="All linked shipments" icon={WalletCards} tone="amber" />
        <StatTile label="Active" value={String(activeCount)} detail="Currently moving" icon={Route} tone="teal" />
        <StatTile label="Delivered" value={String(deliveredCount)} detail="Received packages" icon={PackageCheck} tone="emerald" />
        <StatTile label="Paid" value={`${paidCount}/${shipments.length || 0}`} detail="Payment visibility" icon={ReceiptText} tone="stone" />
      </div>

      {pendingShipment && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-amber-400/20 bg-amber-400/10 px-4 py-3">
          <Clock3 className="h-4 w-4 text-amber-300" />
          <p className="min-w-0 flex-1 text-sm font-semibold text-stone-200">
            {pendingShipment.trackingId} is waiting for driver assignment.
          </p>
          <span className="rounded border border-amber-400/20 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-200">
            Pending
          </span>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          {activeShipment ? <LiveShipmentCard shipment={activeShipment} /> : <EmptyState />}
          <RecentShipments shipments={shipments} />
        </div>
        <QuickTrackPanel activeCount={activeCount} />
      </div>
    </div>
  );
}
