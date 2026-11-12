"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, Loader2, MapPin, Package, Radio } from "lucide-react";
import { DriverHeading, driverField } from "@/components/dashboard/driver-workspace";
import { useDriverDeliveryQueue } from "@/hooks/use-delivery";
import { ShipmentExceptions } from "@/components/dashboard/shipment-exceptions";
import { returnLabels } from "@/lib/shipment-exceptions";
import type { WorkspaceShipment } from "@/lib/shipment-workspace";
import { DeliveryConfirmation } from "@/components/dashboard/delivery-confirmation";
import { useDriverLocation } from "@/hooks/use-driver-location";
import type { ShipmentStatus } from "@/types";
import { cn } from "@/lib/utils";

type FilterValue = "all" | "active" | "held" | "delivered" | "failed";
const ACTIVE_STATUSES: ShipmentStatus[] = [
  "assigned",
  "picked_up",
  "in_transit",
  "out_for_delivery",
];
const STATUS_TONE: Record<ShipmentStatus, string> = {
  pending: "border-amber-400/25 bg-amber-400/10 text-[var(--landing-warning)]",
  assigned: "border-teal-400/25 bg-teal-400/10 text-[var(--landing-accent)]",
  picked_up: "border-teal-400/25 bg-teal-400/10 text-[var(--landing-accent)]",
  in_transit: "border-teal-400/25 bg-teal-400/10 text-[var(--landing-accent)]",
  out_for_delivery: "border-teal-400/25 bg-teal-400/10 text-[var(--landing-accent)]",
  delivered: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  failed: "border-rose-400/25 bg-rose-400/10 text-[var(--landing-danger)]",
  cancelled: "border-stone-600 bg-[var(--landing-tint)] text-[var(--landing-muted)]",
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
  shipment: WorkspaceShipment;
  expanded: boolean;
  onToggle: () => void;
}) {
  const active = ACTIVE_STATUSES.includes(shipment.status);

  return (
    <li
      className={cn(
        "overflow-hidden rounded-md border bg-[var(--landing-panel)]",
        active ? "border-teal-400/20" : "border-[var(--landing-border)]",
      )}
    >
      <button
        onClick={onToggle}
        className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-4 text-left transition hover:bg-[var(--landing-tint)]"
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
            <p className="font-mono text-xs font-semibold text-[var(--landing-ink)]">
              {shipment.trackingId}
            </p>
            <span
              className={cn(
                "rounded border px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
                STATUS_TONE[shipment.status],
              )}
            >
              {shipment.status.replaceAll("_", " ")}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-[var(--landing-muted)]">
            {shipment.pickupAddress.city} to {shipment.deliveryAddress.city}
          </p>
          {shipment.returnState !== "none" && (
            <p className="mt-2 text-xs text-[var(--landing-accent)]">
              {returnLabels[shipment.returnState]}
            </p>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[var(--landing-muted)] transition",
            expanded && "rotate-180 text-[var(--landing-accent)]",
          )}
        />
      </button>
      {expanded && (
        <div className="space-y-4 border-t border-[var(--landing-border)] bg-[var(--landing-field)] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-teal-400/20 bg-teal-400/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--landing-accent)]">
                Pickup
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-[var(--landing-ink)]">
                {shipment.pickupAddress.street}
              </p>
              <p className="text-xs text-[var(--landing-muted)]">
                {shipment.pickupAddress.city}, {shipment.pickupAddress.state}
              </p>
            </div>
            <div className="rounded-md border border-amber-400/20 bg-amber-400/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--landing-warning)]">
                Drop-off
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-[var(--landing-ink)]">
                {shipment.deliveryAddress.street}
              </p>
              <p className="text-xs text-[var(--landing-muted)]">
                {shipment.deliveryAddress.city}, {shipment.deliveryAddress.state}
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-[var(--landing-border)] bg-[var(--landing-tint)] p-3">
              <p className="text-xs text-[var(--landing-muted)]">Shipment value</p>
              <p className="mt-1 font-semibold text-[var(--landing-ink)]">
                {formatNaira(shipment.priceKobo)}
              </p>
            </div>
            <div className="rounded-md border border-[var(--landing-border)] bg-[var(--landing-tint)] p-3">
              <p className="text-xs text-[var(--landing-muted)]">Package</p>
              <p className="mt-1 truncate font-semibold text-[var(--landing-ink)]">
                {shipment.description}
              </p>
            </div>
            <div className="rounded-md border border-[var(--landing-border)] bg-[var(--landing-tint)] p-3">
              <p className="text-xs text-[var(--landing-muted)]">Weight</p>
              <p className="mt-1 font-semibold text-[var(--landing-ink)]">{shipment.weightKg} kg</p>
            </div>
          </div>
          <DeliveryConfirmation id={shipment.id} role="driver" />
          <ShipmentExceptions id={shipment.id} role="driver" />
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
    trackingIds: deliveries
      .filter(
        (delivery) =>
          ACTIVE_STATUSES.includes(delivery.status) ||
          (delivery.status === "failed" && delivery.returnState === "in_transit"),
      )
      .map((delivery) => delivery.trackingId),
    enabled: gpsOn,
  });

  const filtered = deliveries.filter((delivery) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && ACTIVE_STATUSES.includes(delivery.status)) ||
      (filter === "held" &&
        delivery.status === "failed" &&
        !!delivery.actualPickup &&
        delivery.returnState !== "received") ||
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
    held: deliveries.filter(
      (delivery) =>
        delivery.status === "failed" &&
        !!delivery.actualPickup &&
        delivery.returnState !== "received",
    ).length,
    failed: deliveries.filter((delivery) => delivery.status === "failed").length,
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      <DriverHeading eyebrow="Driver workspace" title="Deliveries">
        Follow your assigned packages and confirm each handover with the recipient code.
      </DriverHeading>
      <label className="block max-w-xl text-sm text-[var(--landing-muted)]">
        Search loaded deliveries
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tracking ID or city"
          className={`${driverField} mt-2`}
        />
      </label>

      <section className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-panel)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Radio
              className={cn(
                "h-4 w-4",
                broadcasting ? "text-[var(--landing-accent)]" : "text-[var(--landing-muted)]",
              )}
            />
            <div>
              <p className="text-sm font-semibold text-[var(--landing-ink)]">Live GPS broadcast</p>
              <p className="text-xs text-[var(--landing-muted)]">
                {broadcasting
                  ? "Broadcasting location to active tracking pages"
                  : "Turn on during active deliveries"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setGpsOn((value) => !value)}
            className={cn(
              "rounded-md px-4 py-2.5 text-sm font-semibold transition",
              gpsOn
                ? "border border-teal-400/25 bg-teal-400/10 text-[var(--landing-accent)]"
                : "bg-amber-300 text-black hover:bg-amber-200",
            )}
          >
            {gpsOn ? "Stop GPS" : "Start GPS"}
          </button>
        </div>
        {position && (
          <p className="mt-3 text-xs font-medium text-[var(--landing-muted)]">
            Last fix: {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </p>
        )}
        {gpsError && (
          <p className="mt-3 rounded-md border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-medium text-[var(--landing-danger)]">
            {gpsError}
          </p>
        )}
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "active", "held", "delivered", "failed"] as FilterValue[]).map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold capitalize transition",
              filter === value
                ? "border-teal-400/30 bg-teal-400/10 text-[var(--landing-accent)]"
                : "border-[var(--landing-border)] bg-[var(--landing-tint)] text-[var(--landing-muted)] hover:text-[var(--landing-ink)]",
            )}
          >
            {value === "held" ? "Held packages" : value}
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-xs",
                filter === value
                  ? "bg-teal-300 text-black"
                  : "bg-[var(--landing-tint)] text-[var(--landing-muted)]",
              )}
            >
              {counts[value]}
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs text-[var(--landing-muted)]">
        Search and counts cover {deliveries.length} loaded records. Load older deliveries to include
        more history.
      </p>
      {queue.isError && (
        <div
          role="alert"
          className="rounded-md border border-rose-400/20 p-4 text-sm text-[var(--landing-danger)]"
        >
          Could not refresh deliveries.{" "}
          <button onClick={() => void queue.refetch()} className="underline">
            Retry deliveries
          </button>
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-[var(--landing-border)] bg-[var(--landing-panel)] py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--landing-accent)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-panel)] px-5 py-14 text-center">
          <MapPin className="mx-auto h-6 w-6 text-[var(--landing-muted)]" />
          <p className="mt-3 text-sm font-semibold text-[var(--landing-ink)]">
            No deliveries match this view
          </p>
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
          className="rounded-md border border-[var(--landing-border)] px-4 py-3 text-sm text-[var(--landing-ink)] disabled:opacity-50"
        >
          {queue.isFetchingNextPage ? "Loading..." : "Load older deliveries"}
        </button>
      )}
    </div>
  );
}
