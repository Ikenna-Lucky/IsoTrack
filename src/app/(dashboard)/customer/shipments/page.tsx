"use client";

import Link from "next/link";
import type { Route } from "next";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Navigation,
  Package,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { getShipmentList, useShipments } from "@/hooks/use-shipments";
import { usePayment } from "@/hooks/use-payment";
import { useAuthStore } from "@/store/auth";
import type { Shipment, ShipmentStatus } from "@/types";
import { cn } from "@/lib/utils";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_META: Record<
  ShipmentStatus,
  { label: string; tone: string; dot: string; Icon: typeof Package }
> = {
  pending: { label: "Pending", tone: "border-amber-400/25 bg-amber-400/10 text-amber-200", dot: "bg-amber-300", Icon: Clock },
  assigned: { label: "Driver assigned", tone: "border-teal-400/25 bg-teal-400/10 text-teal-200", dot: "bg-teal-300", Icon: CircleDot },
  picked_up: { label: "Picked up", tone: "border-teal-400/25 bg-teal-400/10 text-teal-200", dot: "bg-teal-300", Icon: Package },
  in_transit: { label: "In transit", tone: "border-teal-400/25 bg-teal-400/10 text-teal-200", dot: "bg-teal-300", Icon: Truck },
  out_for_delivery: { label: "Out for delivery", tone: "border-teal-400/25 bg-teal-400/10 text-teal-200", dot: "bg-teal-300", Icon: Truck },
  delivered: { label: "Delivered", tone: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200", dot: "bg-emerald-300", Icon: CheckCircle2 },
  failed: { label: "Failed", tone: "border-rose-400/25 bg-rose-400/10 text-rose-200", dot: "bg-rose-300", Icon: XCircle },
  cancelled: { label: "Cancelled", tone: "border-stone-600 bg-white/[0.04] text-stone-400", dot: "bg-stone-500", Icon: XCircle },
};

type FilterValue = "all" | "active" | "pending" | "delivered" | "attention";

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Delivered", value: "delivered" },
  { label: "Needs attention", value: "attention" },
];

const ACTIVE_STATUSES: ShipmentStatus[] = ["assigned", "picked_up", "in_transit", "out_for_delivery"];

function PaymentSection({ shipment }: { shipment: Shipment }) {
  const user = useAuthStore((s) => s.user);
  const [justPaid, setJustPaid] = useState(false);
  const { pay, isPaying, verifying, error, clearError } = usePayment({
    onSuccess: () => setJustPaid(true),
  });

  const isPaid = shipment.isPaid || justPaid;
  const blocked = shipment.status === "cancelled" || shipment.status === "failed";

  if (blocked) return null;

  if (isPaid) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-3 py-2.5">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-200" />
        <div>
          <p className="text-xs font-black text-emerald-100">Payment received</p>
          <p className="mt-0.5 text-[10px] text-stone-500">This shipment is cleared for delivery.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-rose-400/20 bg-rose-400/10 px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-200" />
          <p className="flex-1 text-[11px] text-rose-100">{error}</p>
          <button onClick={clearError} className="text-[10px] font-bold text-stone-500 hover:text-stone-200">
            Dismiss
          </button>
        </div>
      )}
      <button
        onClick={() => pay({ shipmentId: shipment.id, email: user?.email ?? "" })}
        disabled={isPaying || verifying}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-amber-300 px-4 py-2.5 text-sm font-black text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPaying || verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
        {isPaying ? "Opening payment..." : verifying ? "Verifying..." : `Pay ${formatNaira(shipment.priceKobo)}`}
      </button>
      <p className="text-center text-[10px] text-stone-600">Secured by Paystack. Card, bank transfer and USSD.</p>
    </div>
  );
}

function RoutePill({ shipment }: { shipment: Shipment }) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-[11px] font-bold text-stone-400">
      <span className="truncate">{shipment.pickupAddress.city}</span>
      <span className="h-px w-6 shrink-0 bg-teal-300/30" />
      <MapPin className="h-3 w-3 shrink-0 text-amber-200" />
      <span className="truncate">{shipment.deliveryAddress.city}</span>
    </div>
  );
}

function ShipmentRow({
  shipment,
  expanded,
  onToggle,
}: {
  shipment: Shipment;
  expanded: boolean;
  onToggle: () => void;
}) {
  const meta = STATUS_META[shipment.status];
  const live = ACTIVE_STATUSES.includes(shipment.status);
  const StatusIcon = meta.Icon;

  return (
    <li className={cn("overflow-hidden rounded-md border bg-[#0d1412]", live ? "border-teal-400/25" : "border-white/[0.07]")}>
      <button
        onClick={onToggle}
        className="grid w-full grid-cols-[auto,1fr,auto] items-center gap-3 px-4 py-4 text-left transition hover:bg-white/[0.03] sm:grid-cols-[auto,1fr,130px,auto]"
      >
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-md border", meta.tone)}>
          <StatusIcon className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-xs font-black text-stone-100">{shipment.trackingId}</p>
            {live && (
              <span className="rounded border border-teal-400/20 bg-teal-400/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-teal-200">
                Live
              </span>
            )}
            {!shipment.isPaid && shipment.status !== "cancelled" && shipment.status !== "failed" && (
              <span className="rounded border border-amber-400/20 bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-200">
                Unpaid
              </span>
            )}
          </div>
          <div className="mt-1">
            <RoutePill shipment={shipment} />
          </div>
          {shipment.description && <p className="mt-1 truncate text-xs text-stone-600">{shipment.description}</p>}
        </div>

        <div className="hidden text-right sm:block">
          <p className="text-sm font-black tabular-nums text-stone-100">{formatNaira(shipment.priceKobo)}</p>
          <p className="mt-0.5 text-[10px] font-bold text-stone-600">{formatDate(shipment.createdAt)}</p>
        </div>

        <ChevronDown className={cn("h-4 w-4 text-stone-600 transition", expanded && "rotate-180 text-teal-200")} />
      </button>

      {expanded && (
        <div className="border-t border-white/[0.07] bg-black/20 p-4">
          <div className="grid gap-3 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="rounded-md border border-white/[0.07] bg-white/[0.03] p-4">
              <p className="mb-3 text-[9px] font-black uppercase tracking-[0.18em] text-stone-600">Route detail</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-teal-200">Pickup</p>
                  <p className="mt-1 truncate text-sm font-bold text-stone-200">{shipment.pickupAddress.street}</p>
                  <p className="text-xs text-stone-500">{shipment.pickupAddress.city}, {shipment.pickupAddress.state}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-200">Drop-off</p>
                  <p className="mt-1 truncate text-sm font-bold text-stone-200">{shipment.deliveryAddress.street}</p>
                  <p className="text-xs text-stone-500">{shipment.deliveryAddress.city}, {shipment.deliveryAddress.state}</p>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-white/[0.07] bg-white/[0.03] p-4">
              <p className="mb-3 text-[9px] font-black uppercase tracking-[0.18em] text-stone-600">Shipment file</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-stone-600">Status</p>
                  <p className="mt-1 font-black text-stone-200">{meta.label}</p>
                </div>
                <div>
                  <p className="text-stone-600">Created</p>
                  <p className="mt-1 font-black text-stone-200">{formatDate(shipment.createdAt)}</p>
                </div>
                <div>
                  <p className="text-stone-600">ETA</p>
                  <p className="mt-1 font-black text-stone-200">{formatDate(shipment.estimatedDelivery)}</p>
                </div>
                <div>
                  <p className="text-stone-600">Amount</p>
                  <p className="mt-1 font-black text-stone-200">{formatNaira(shipment.priceKobo)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[1fr,auto] lg:items-end">
            <PaymentSection shipment={shipment} />
            <Link
              href={(`/customer/track?id=${shipment.trackingId}`) as Route}
              className="flex items-center justify-center gap-2 rounded-md border border-teal-400/25 bg-teal-400/10 px-4 py-2.5 text-sm font-black text-teal-100 transition hover:bg-teal-400/[0.16]"
            >
              <Navigation className="h-4 w-4" />
              Track live
            </Link>
          </div>
        </div>
      )}
    </li>
  );
}

export default function CustomerShipmentsPage() {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: shipmentsData, isLoading } = useShipments({ pageSize: 100 });
  const allShipments = getShipmentList(shipmentsData);

  const counts = {
    all: allShipments.length,
    active: allShipments.filter((s) => ACTIVE_STATUSES.includes(s.status)).length,
    pending: allShipments.filter((s) => s.status === "pending").length,
    delivered: allShipments.filter((s) => s.status === "delivered").length,
    attention: allShipments.filter((s) => s.status === "failed" || s.status === "cancelled" || !s.isPaid).length,
  };

  const filtered = allShipments.filter((shipment) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && ACTIVE_STATUSES.includes(shipment.status)) ||
      (filter === "attention" && (shipment.status === "failed" || shipment.status === "cancelled" || !shipment.isPaid)) ||
      shipment.status === filter;

    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      shipment.trackingId.toLowerCase().includes(q) ||
      shipment.pickupAddress.city.toLowerCase().includes(q) ||
      shipment.deliveryAddress.city.toLowerCase().includes(q) ||
      (shipment.description ?? "").toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr,340px] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-200">Customer manifest</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-50 sm:text-3xl">My Shipments</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
              Review packages connected to your account, clear payment, and jump into live tracking when a driver is moving.
            </p>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-600" />
            <input
              type="text"
              placeholder="Search tracking ID, city, description"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-white/[0.08] bg-black/25 py-3 pl-10 pr-3 text-sm font-bold text-stone-100 outline-none transition placeholder:text-stone-700 focus:border-teal-400/40 focus:ring-2 focus:ring-teal-400/10"
            />
          </div>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(({ label, value }) => {
          const active = filter === value;
          return (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-xs font-black transition",
                active
                  ? "border-teal-400/30 bg-teal-400/10 text-teal-100"
                  : "border-white/[0.07] bg-white/[0.03] text-stone-500 hover:text-stone-200",
              )}
            >
              {label}
              <span className={cn("rounded px-1.5 py-0.5 text-[10px]", active ? "bg-teal-300 text-black" : "bg-white/[0.06] text-stone-500")}>
                {counts[value]}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-white/[0.07] bg-[#0d1412] py-16">
          <Loader2 className="h-6 w-6 animate-spin text-teal-200" />
          <p className="text-sm font-bold text-stone-500">Loading your shipment manifest...</p>
        </div>
      )}

      {!isLoading && allShipments.length === 0 && (
        <div className="rounded-md border border-dashed border-white/[0.1] bg-[#0d1412] px-5 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-teal-400/20 bg-teal-400/10">
            <Package className="h-5 w-5 text-teal-200" />
          </div>
          <p className="mt-4 text-base font-black text-stone-100">No shipments yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-stone-500">
            Shipments sent to you will appear here once a business links your account.
          </p>
          <Link
            href="/customer/track"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-amber-300 px-4 py-2.5 text-sm font-black text-black transition hover:bg-amber-200"
          >
            <Navigation className="h-4 w-4" />
            Track with ID
          </Link>
        </div>
      )}

      {!isLoading && allShipments.length > 0 && filtered.length === 0 && (
        <div className="rounded-md border border-white/[0.07] bg-[#0d1412] px-5 py-14 text-center">
          <p className="text-sm font-black text-stone-200">No matching shipments</p>
          <p className="mt-1 text-xs text-stone-600">Try another search term or switch filters.</p>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <ul className="space-y-2">
          {filtered.map((shipment) => (
            <ShipmentRow
              key={shipment.id}
              shipment={shipment}
              expanded={expanded === shipment.id}
              onToggle={() => setExpanded(expanded === shipment.id ? null : shipment.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
