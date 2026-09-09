"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  MapPin,
  Package,
  Loader2,
  Navigation,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Truck,
  XCircle,
  CircleDot,
} from "lucide-react";
import { useState } from "react";
import { useShipments, getShipmentList } from "@/hooks/use-shipments";
import { usePayment } from "@/hooks/use-payment";
import { useAuthStore } from "@/store/auth";
import type { Route } from "next";
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

const STATUS_META: Record<
  ShipmentStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  pending:          { label: "Pending",          color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   dot: "#f59e0b" },
  assigned:         { label: "Driver Assigned",  color: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/20",     dot: "#0ea5e9" },
  picked_up:        { label: "Picked Up",        color: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/20",     dot: "#0ea5e9" },
  in_transit:       { label: "In Transit",       color: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/20",     dot: "#0ea5e9" },
  out_for_delivery: { label: "Out for Delivery", color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20",  dot: "#8b5cf6" },
  delivered:        { label: "Delivered",        color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "#10b981" },
  failed:           { label: "Failed",           color: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/20",    dot: "#f43f5e" },
  cancelled:        { label: "Cancelled",        color: "text-zinc-400",    bg: "bg-zinc-500/10",    border: "border-zinc-500/20",    dot: "#71717a" },
};

function StatusIcon({ status }: { status: ShipmentStatus }) {
  switch (status) {
    case "delivered":
      return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
    case "cancelled":
      return <XCircle className="h-5 w-5 text-zinc-500" />;
    case "failed":
      return <XCircle className="h-5 w-5 text-rose-400" />;
    case "out_for_delivery":
    case "in_transit":
      return <Truck className="h-5 w-5 text-violet-400" />;
    case "picked_up":
    case "assigned":
      return <CircleDot className="h-5 w-5 text-sky-400" />;
    default:
      return <Clock className="h-5 w-5 text-amber-400" />;
  }
}

type FilterValue = "all" | "pending" | "out_for_delivery" | "delivered" | "failed";

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "All",       value: "all"              },
  { label: "Active",    value: "out_for_delivery" },
  { label: "Pending",   value: "pending"          },
  { label: "Delivered", value: "delivered"        },
  { label: "Failed",    value: "failed"           },
];

// ─── Payment button sub-component ─────────────────────────────────────────────

function PaymentSection({ shipment }: { shipment: Shipment }) {
  const user = useAuthStore((s) => s.user);
  const [justPaid, setJustPaid] = useState(false);

  const { pay, isPaying, verifying, error, clearError } = usePayment({
    onSuccess: () => setJustPaid(true),
  });

  const isPaid = shipment.isPaid || justPaid;
  const isCancelled = shipment.status === "cancelled" || shipment.status === "failed";

  if (isCancelled) return null;

  if (isPaid) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2.5">
        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-emerald-400">Payment received</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Thank you for your payment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
          <p className="text-[11px] text-rose-300 flex-1">{error}</p>
          <button onClick={clearError} className="text-[10px] text-zinc-600 hover:text-zinc-400">Dismiss</button>
        </div>
      )}
      <button
        onClick={() =>
          pay({ shipmentId: shipment.id, email: user?.email ?? "" })
        }
        disabled={isPaying || verifying}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
      >
        {isPaying || verifying ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4" />
        )}
        {isPaying ? "Opening payment..." : verifying ? "Verifying..." : `Pay ${formatNaira(shipment.priceKobo)}`}
      </button>
      <p className="text-center text-[10px] text-zinc-600">
        Secured by Paystack · Card, bank transfer & USSD
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerShipmentsPage() {
  const [filter,   setFilter]   = useState<FilterValue>("all");
  const [search,   setSearch]   = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: shipmentsData, isLoading } = useShipments({ pageSize: 100 });
  const allShipments = getShipmentList(shipmentsData);

  const filtered = allShipments.filter((s) => {
    const matchFilter = filter === "all" || s.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.trackingId.toLowerCase().includes(q) ||
      s.pickupAddress.city.toLowerCase().includes(q) ||
      s.deliveryAddress.city.toLowerCase().includes(q) ||
      (s.description ?? "").toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">My Shipments</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{allShipments.length} shipments total</p>
        </div>
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 pointer-events-none" />
          <input
            type="text"
            placeholder="Search ID, city, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] pl-9 pr-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/[0.1] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-0 border-b border-white/[0.05] overflow-x-auto">
        {FILTERS.map(({ label, value }) => {
          const count = value === "all"
            ? allShipments.length
            : allShipments.filter((s) => s.status === value).length;
          const active = filter === value;
          return (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-medium border-b-2 transition-all whitespace-nowrap shrink-0",
                active ? "border-violet-400 text-violet-400" : "border-transparent text-zinc-500 hover:text-zinc-200 hover:border-white/[0.15]",
              )}
            >
              {label}
              <span className={cn(
                "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold",
                active ? "bg-violet-500/20 text-violet-400" : "bg-white/[0.06] text-zinc-600",
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="motion-shimmer h-2 w-32 rounded-full bg-white/[0.06]" />
          <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
        </div>
      )}

      {!isLoading && allShipments.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Image
            src="/images/empty-img.jpg"
            alt="Prepared packages waiting for shipment"
            width={240}
            height={170}
            className="h-32 w-48 rounded-xl object-cover opacity-85"
          />
          <div className="hidden h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] text-3xl">
            📦
          </div>
          <div className="max-w-xs">
            <p className="text-base font-semibold text-zinc-200">No shipments here yet</p>
            <p className="text-sm text-zinc-500 mt-1.5">
              Shipments sent to you will appear here once a business links your account.
              In the meantime, use your tracking ID to follow your package.
            </p>
          </div>
          <Link
            href="/customer/track"
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/20"
          >
            <Navigation className="h-4 w-4" />
            Track with ID
          </Link>
        </div>
      )}

      {!isLoading && allShipments.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <Package className="h-5 w-5 text-zinc-700" />
          </div>
          <p className="text-sm font-medium text-zinc-400">No shipments found</p>
          <p className="text-xs text-zinc-600">
            {search ? "Try a different search term" : "No shipments match this filter"}
          </p>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <ul className="space-y-2">
          {filtered.map((s) => {
            const meta       = STATUS_META[s.status];
            const isExpanded = expanded === s.id;
            const isLive     = s.status === "out_for_delivery" || s.status === "in_transit";

            return (
              <li
                key={s.id}
                className={cn(
                  "overflow-hidden rounded-2xl border transition-all duration-200",
                  isLive ? "border-violet-500/[0.22] bg-[#0d0d11]" : "border-white/[0.06] bg-[#0d0d11]",
                )}
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : s.id)}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-white/[0.015] transition-colors group"
                >
                  <div
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: meta.dot, boxShadow: `0 0 6px ${meta.dot}80` }}
                  />
                  <div className="shrink-0">
                    <StatusIcon status={s.status} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs font-bold text-zinc-200">{s.trackingId}</span>
                      {isLive && (
                        <span className="animate-pulse rounded-full border border-violet-500/20 bg-violet-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-400">
                          Live
                        </span>
                      )}
                      {!s.isPaid && s.status !== "cancelled" && s.status !== "failed" && (
                        <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-400">
                          Unpaid
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate">
                      {s.pickupAddress.city}<span className="text-zinc-700"> to </span>{s.deliveryAddress.city}
                      {s.description ? "  · " + s.description : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right mr-1">
                    <p className="text-sm font-bold tabular-nums text-zinc-200">{formatNaira(s.priceKobo)}</p>
                    <span className={cn("text-[10px] font-semibold", meta.color)}>{meta.label}</span>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 shrink-0 text-zinc-700 group-hover:text-zinc-500 transition-all duration-200",
                    isExpanded && "rotate-180",
                  )} />
                </button>

                {isExpanded && (
                  <div className="border-t border-white/[0.05] bg-white/[0.008] p-4 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3.5">
                        <p className="mb-3 text-[9px] font-semibold uppercase tracking-wider text-zinc-600">Route</p>
                        <div className="flex items-start gap-2.5">
                          <div className="flex flex-col items-center pt-0.5 shrink-0">
                            <div className="h-2 w-2 rounded-full border-2 border-violet-400" />
                            <div className="my-1 h-7 w-px bg-gradient-to-b from-violet-500/40 to-rose-500/40" />
                            <MapPin className="h-2.5 w-2.5 text-rose-400" />
                          </div>
                          <div className="space-y-2.5 min-w-0 flex-1">
                            <div>
                              <p className="text-[9px] uppercase tracking-wider text-zinc-700 mb-0.5">From</p>
                              <p className="text-xs font-medium text-zinc-300 truncate">
                                {s.pickupAddress.street}, {s.pickupAddress.city}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase tracking-wider text-zinc-700 mb-0.5">To</p>
                              <p className="text-xs font-medium text-zinc-300 truncate">
                                {s.deliveryAddress.street}, {s.deliveryAddress.city}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3.5 space-y-2">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">Details</p>
                        {s.description && <p className="text-xs text-zinc-400">{s.description}</p>}
                        <p className="text-xs text-zinc-600">
                          {new Date(s.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Payment section */}
                    <PaymentSection shipment={s} />

                    <div className="flex justify-end pt-1">
                      <Link
                        href={("/customer/track?id=" + s.trackingId) as Route}
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        <Navigation className="h-3 w-3" />
                        Track live
                      </Link>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
