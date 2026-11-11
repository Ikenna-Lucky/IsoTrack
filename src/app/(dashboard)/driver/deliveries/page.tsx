"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, Loader2, MapPin, Package, Radio, Search } from "lucide-react";
import { useDriverDeliveryQueue } from "@/hooks/use-delivery";
import { DeliveryConfirmation } from "@/components/dashboard/delivery-confirmation";
import { useDriverLocation } from "@/hooks/use-driver-location";
import type { Shipment, ShipmentStatus } from "@/types";
import { cn } from "@/lib/utils";

type FilterValue = "all" | "active" | "delivered" | "failed";
const ACTIVE_STATUSES: ShipmentStatus[] = [
  "assigned",
  "picked_up",
  "in_transit",
  "out_for_delivery",
];
const STATUS_TONE: Record<ShipmentStatus, string> = {
  pending: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  assigned: "border-teal-400/25 bg-teal-400/10 text-teal-200",
  picked_up: "border-teal-400/25 bg-teal-400/10 text-teal-200",
  in_transit: "border-teal-400/25 bg-teal-400/10 text-teal-200",
  out_for_delivery: "border-teal-400/25 bg-teal-400/10 text-teal-200",
  delivered: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  failed: "border-rose-400/25 bg-rose-400/10 text-rose-200",
  cancelled: "border-stone-600 bg-white/[0.04] text-stone-400",
};

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(kobo / 100);
}

function DeliveryItem({
  shipment,
  expanded,
  onToggle,
}: {
  shipment: Shipment;
  expanded: boolean;
  onToggle: () => void;
}) {
  const active = ACTIVE_STATUSES.includes(shipment.status);

  return (
    <li
      className={cn(
        "overflow-hidden rounded-md border bg-[#0d1412]",
        active ? "border-teal-400/20" : "border-white/[0.07]",
      )}
    >
      <button
        onClick={onToggle}
        className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-4 text-left transition hover:bg-white/[0.03]"
      >
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-md border",
            STATUS_TONE[shipment.status],
          )}
        >
          {shipment.status === "delivered" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Package className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-xs font-black text-stone-100">{shipment.trackingId}</p>
            <span
              className={cn(
                "rounded border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider",
                STATUS_TONE[shipment.status],
              )}
            >
              {shipment.status.replaceAll("_", " ")}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-stone-600">
            {shipment.pickupAddress.city} to {shipment.deliveryAddress.city}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-stone-600 transition",
            expanded && "rotate-180 text-teal-200",
          )}
        />
      </button>
      {expanded && (
        <div className="space-y-4 border-t border-white/[0.07] bg-black/20 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-teal-400/20 bg-teal-400/10 p-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-teal-200">
                Pickup
              </p>
              <p className="mt-1 truncate text-sm font-black text-stone-100">
                {shipment.pickupAddress.street}
              </p>
              <p className="text-xs text-stone-500">
                {shipment.pickupAddress.city}, {shipment.pickupAddress.state}
              </p>
            </div>
            <div className="rounded-md border border-amber-400/20 bg-amber-400/10 p-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-200">
                Drop-off
              </p>
              <p className="mt-1 truncate text-sm font-black text-stone-100">
                {shipment.deliveryAddress.street}
              </p>
              <p className="text-xs text-stone-500">
                {shipment.deliveryAddress.city}, {shipment.deliveryAddress.state}
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-white/[0.07] bg-white/[0.03] p-3">
              <p className="text-[10px] text-stone-600">Shipment value</p>
              <p className="mt-1 font-black text-stone-100">{formatNaira(shipment.priceKobo)}</p>
            </div>
            <div className="rounded-md border border-white/[0.07] bg-white/[0.03] p-3">
              <p className="text-[10px] text-stone-600">Package</p>
              <p className="mt-1 truncate font-black text-stone-100">{shipment.description}</p>
            </div>
            <div className="rounded-md border border-white/[0.07] bg-white/[0.03] p-3">
              <p className="text-[10px] text-stone-600">Weight</p>
              <p className="mt-1 font-black text-stone-100">{shipment.weightKg} kg</p>
            </div>
          </div>
          <DeliveryConfirmation id={shipment.id} role="driver" />
        </div>
      )}
    </li>
  );
}

export default function DriverDeliveriesPage() {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [gpsOn, setGpsOn] = useState(false);
  const queue = useDriverDeliveryQueue();
  const { isLoading } = queue;
  const deliveries = queue.data?.pages.flatMap((page) => page.data) ?? [];
  const activeDeliveries = deliveries.filter((delivery) =>
    ACTIVE_STATUSES.includes(delivery.status),
  );
  const {
    broadcasting,
    position,
    error: gpsError,
  } = useDriverLocation({
    trackingIds: activeDeliveries.map((delivery) => delivery.trackingId),
    enabled: gpsOn,
  });

  const filtered = deliveries.filter((delivery) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && ACTIVE_STATUSES.includes(delivery.status)) ||
      delivery.status === filter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      delivery.trackingId.toLowerCase().includes(q) ||
      delivery.pickupAddress.city.toLowerCase().includes(q) ||
      delivery.deliveryAddress.city.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: deliveries.length,
    active: activeDeliveries.length,
    delivered: deliveries.filter((delivery) => delivery.status === "delivered").length,
    failed: deliveries.filter((delivery) => delivery.status === "failed").length,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-200">
              Delivery queue
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-50 sm:text-3xl">
              Deliveries
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
              Follow your assigned deliveries and confirm handover using the recipient code.
            </p>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-600" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tracking or city"
              className="w-full rounded-md border border-white/[0.08] bg-black/25 py-3 pl-10 pr-3 text-sm font-bold text-stone-100 outline-none placeholder:text-stone-700 focus:border-teal-400/40"
            />
          </div>
        </div>
      </section>

      <section className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Radio className={cn("h-4 w-4", broadcasting ? "text-teal-200" : "text-stone-600")} />
            <div>
              <p className="text-sm font-black text-stone-100">Live GPS broadcast</p>
              <p className="text-xs text-stone-600">
                {broadcasting
                  ? "Broadcasting location to active tracking pages"
                  : "Turn on during active deliveries"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setGpsOn((value) => !value)}
            className={cn(
              "rounded-md px-4 py-2.5 text-sm font-black transition",
              gpsOn
                ? "border border-teal-400/25 bg-teal-400/10 text-teal-100"
                : "bg-amber-300 text-black hover:bg-amber-200",
            )}
          >
            {gpsOn ? "Stop GPS" : "Start GPS"}
          </button>
        </div>
        {position && (
          <p className="mt-3 text-xs font-bold text-stone-600">
            Last fix: {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </p>
        )}
        {gpsError && (
          <p className="mt-3 rounded-md border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-bold text-rose-100">
            {gpsError}
          </p>
        )}
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "active", "delivered", "failed"] as FilterValue[]).map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-xs font-black capitalize transition",
              filter === value
                ? "border-teal-400/30 bg-teal-400/10 text-teal-100"
                : "border-white/[0.07] bg-white/[0.03] text-stone-500 hover:text-stone-200",
            )}
          >
            {value}
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px]",
                filter === value ? "bg-teal-300 text-black" : "bg-white/[0.06] text-stone-500",
              )}
            >
              {counts[value]}
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs text-stone-400">
        Search and counts cover {deliveries.length} loaded records. Load older deliveries to include
        more history.
      </p>
      {queue.isError && (
        <div
          role="alert"
          className="rounded-md border border-rose-400/20 p-4 text-sm text-rose-200"
        >
          Could not refresh deliveries.{" "}
          <button onClick={() => void queue.refetch()} className="underline">
            Retry deliveries
          </button>
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center rounded-md border border-white/[0.07] bg-[#0d1412] py-16">
          <Loader2 className="h-6 w-6 animate-spin text-teal-200" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-md border border-white/[0.07] bg-[#0d1412] px-5 py-14 text-center">
          <MapPin className="mx-auto h-6 w-6 text-stone-700" />
          <p className="mt-3 text-sm font-black text-stone-200">No deliveries match this view</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((delivery) => (
            <DeliveryItem
              key={delivery.id}
              shipment={delivery}
              expanded={expanded === delivery.id}
              onToggle={() => setExpanded(expanded === delivery.id ? null : delivery.id)}
            />
          ))}
        </ul>
      )}
      {queue.hasNextPage && (
        <button
          onClick={() => void queue.fetchNextPage()}
          disabled={queue.isFetchingNextPage}
          className="rounded-md border border-white/15 px-4 py-3 text-sm text-stone-100 disabled:opacity-50"
        >
          {queue.isFetchingNextPage ? "Loading..." : "Load older deliveries"}
        </button>
      )}
    </div>
  );
}
