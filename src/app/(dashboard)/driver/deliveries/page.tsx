"use client";

import { useState } from "react";
import {
  Search, MapPin, Package, Clock, Phone, Navigation,
  ChevronDown, Loader2, CheckCircle2, XCircle, ArrowRight,
  Radio, RadioTower,
} from "lucide-react";
import { useShipments, getShipmentList, useUpdateShipmentStatus } from "@/hooks/use-shipments";
import { useDriverLocation } from "@/hooks/use-driver-location";
import { extractErrorMessage } from "@/lib/errors";
import { formatKobo } from "@/types";
import type { Shipment, ShipmentStatus } from "@/types";
import { cn } from "@/lib/utils";

// Status display meta
const STATUS_META: Record<ShipmentStatus, { label: string; color: string; dot: string }> = {
  pending:          { label: "Pending",          color: "text-amber-400",   dot: "#f59e0b" },
  assigned:         { label: "Assigned",         color: "text-sky-400",     dot: "#0ea5e9" },
  picked_up:        { label: "Picked Up",        color: "text-violet-400",  dot: "#8b5cf6" },
  in_transit:       { label: "In Transit",       color: "text-blue-400",    dot: "#60a5fa" },
  out_for_delivery: { label: "Out for Delivery", color: "text-violet-400",  dot: "#8b5cf6" },
  delivered:        { label: "Delivered",        color: "text-emerald-400", dot: "#10b981" },
  failed:           { label: "Failed",           color: "text-rose-400",    dot: "#f43f5e" },
  cancelled:        { label: "Cancelled",        color: "text-zinc-500",    dot: "#71717a" },
};

// Status advance map
const ADVANCE_ACTION: Partial<Record<ShipmentStatus, { label: string; next: ShipmentStatus }>> = {
  assigned:         { label: "Confirm Pickup",    next: "picked_up"        },
  picked_up:        { label: "Mark In Transit",   next: "in_transit"       },
  in_transit:       { label: "Out for Delivery",  next: "out_for_delivery" },
  out_for_delivery: { label: "Mark Delivered",    next: "delivered"        },
};

const ACTIONABLE_STATUSES = new Set<ShipmentStatus>([
  "assigned", "picked_up", "in_transit", "out_for_delivery",
]);

function isActiveStatus(s: ShipmentStatus) {
  return ACTIONABLE_STATUSES.has(s);
}

// Filter config
const FILTER_VALUES = ["all", "active", "delivered", "failed"] as const;
type FilterValue = (typeof FILTER_VALUES)[number];

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "All",       value: "all"       },
  { label: "Active",    value: "active"    },
  { label: "Delivered", value: "delivered" },
  { label: "Failed",    value: "failed"    },
];

// Status-advance action panel (owns its own mutation instance)
function StatusActions({ shipment }: { shipment: Shipment }) {
  const updateStatus = useUpdateShipmentStatus();
  const [actionError, setActionError] = useState("");

  const advance = ADVANCE_ACTION[shipment.status];
  const canAct  = ACTIONABLE_STATUSES.has(shipment.status);

  if (!canAct) return null;

  async function handleAdvance() {
    if (!advance) return;
    setActionError("");
    try {
      await updateStatus.mutateAsync({ id: shipment.id, status: advance.next });
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  async function handleFail() {
    setActionError("");
    try {
      await updateStatus.mutateAsync({
        id: shipment.id,
        status: "failed",
        note: "Marked failed by driver",
      });
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  const busy = updateStatus.isPending;

  return (
    <div className="space-y-2">
      {actionError && (
        <p className="text-[11px] text-rose-400 bg-rose-500/[0.08] border border-rose-500/20 rounded-lg px-3 py-2">
          {actionError}
        </p>
      )}
      <div className="flex items-center gap-2">
        {advance && (
          <button
            onClick={handleAdvance}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 py-3 text-sm font-semibold text-teal-400 hover:bg-teal-500/[0.18] hover:border-teal-500/50 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowRight className="h-4 w-4" />{advance.label}</>}
          </button>
        )}
        <button
          onClick={handleFail}
          disabled={busy}
          title="Mark as failed"
          className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/[0.08] px-4 py-3 text-sm font-semibold text-rose-400 hover:bg-rose-500/[0.16] hover:border-rose-500/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

// Page
export default function DriverDeliveriesPage() {
  const [filter,    setFilter]    = useState<FilterValue>("all");
  const [search,    setSearch]    = useState("");
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [gpsOn,     setGpsOn]     = useState(false);

  const { data: shipmentsData, isLoading } = useShipments({ pageSize: 100 });
  const deliveries = getShipmentList(shipmentsData);

  const activeDeliveries = deliveries.filter((d) => isActiveStatus(d.status));
  const activeTrackingIds = activeDeliveries.map((d) => d.trackingId);

  const { broadcasting, position, error: gpsError } = useDriverLocation({
    trackingIds: activeTrackingIds,
    enabled:     gpsOn,
  });

  const activeCount = activeDeliveries.length;

  const filtered = deliveries.filter((d) => {
    let matchFilter = true;
    if (filter === "active")   matchFilter = isActiveStatus(d.status);
    else if (filter !== "all") matchFilter = d.status === filter;

    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      d.trackingId.toLowerCase().includes(q) ||
      (d.customer?.name ?? "").toLowerCase().includes(q) ||
      d.pickupAddress.city.toLowerCase().includes(q) ||
      d.deliveryAddress.city.toLowerCase().includes(q);

    return matchFilter && matchSearch;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Deliveries</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{deliveries.length} total assignments</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">

          {/* GPS broadcast toggle */}
          {activeCount > 0 && (
            <button
              onClick={() => setGpsOn((v) => !v)}
              title={gpsOn ? "Stop broadcasting location" : "Broadcast my live location"}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2.5 text-[12px] font-semibold transition-all",
                gpsOn && broadcasting
                  ? "border-teal-500/40 bg-teal-500/10 text-teal-400 shadow-[0_0_12px_theme(colors.teal.500/0.15)]"
                  : gpsOn
                  ? "border-amber-500/30 bg-amber-500/[0.08] text-amber-400"
                  : "border-white/[0.07] bg-white/[0.03] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.12]",
              )}
            >
              {gpsOn && broadcasting ? (
                <><RadioTower className="h-3.5 w-3.5 animate-pulse" />Live</>
              ) : gpsOn ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" />Connecting</>
              ) : (
                <><Radio className="h-3.5 w-3.5" />Broadcast</>
              )}
            </button>
          )}

          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 pointer-events-none" />
            <input
              type="text"
              placeholder="Search ID, customer, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] pl-9 pr-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-teal-500/40 focus:ring-2 focus:ring-teal-500/[0.12] transition-all"
            />
          </div>
        </div>
      </div>

      {/* GPS error banner */}
      {gpsError && (
        <div className="rounded-xl border border-rose-500/25 bg-rose-500/[0.07] px-4 py-3 text-sm text-rose-400">
          {gpsError}
        </div>
      )}

      {/* GPS position readout (shown while broadcasting) */}
      {gpsOn && broadcasting && position && (
        <div className="flex items-center gap-3 rounded-xl border border-teal-500/20 bg-teal-500/[0.06] px-4 py-2.5">
          <RadioTower className="h-3.5 w-3.5 text-teal-400 shrink-0 animate-pulse" />
          <p className="text-[11px] text-teal-400 font-medium">
            Broadcasting to {activeTrackingIds.length} shipment{activeTrackingIds.length !== 1 ? "s" : ""}
            {" "}&middot;{" "}
            {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
            {position.speed > 0 ? ` · ${(position.speed * 3.6).toFixed(0)} km/h` : ""}
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-0 overflow-x-auto scrollbar-none border-b border-white/[0.05] pb-px">
        {FILTERS.map(({ label, value }) => {
          const count =
            value === "all"    ? deliveries.length :
            value === "active" ? activeCount :
            deliveries.filter((d) => d.status === value).length;
          const isActive = filter === value;
          return (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all whitespace-nowrap",
                isActive
                  ? "border-teal-400 text-teal-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-200 hover:border-white/[0.15]",
              )}
            >
              {label}
              <span className={cn(
                "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold transition-all",
                isActive ? "bg-teal-500/20 text-teal-400" : "bg-white/[0.06] text-zinc-500",
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <Package className="h-5 w-5 text-zinc-700" />
          </div>
          <p className="text-sm font-medium text-zinc-400">No deliveries found</p>
          <p className="text-xs text-zinc-600">
            {search ? "Try a different search term" : "No deliveries match this filter"}
          </p>
        </div>
      )}

      {/* Delivery cards */}
      {!isLoading && filtered.length > 0 && (
        <ul className="space-y-2.5">
          {filtered.map((d) => {
            const meta          = STATUS_META[d.status];
            const isExpanded    = expanded === d.id;
            const isActive      = isActiveStatus(d.status);
            const driverEarning = Math.round(d.priceKobo * 0.4);

            return (
              <li
                key={d.id}
                className={cn(
                  "overflow-hidden rounded-2xl border transition-all duration-200",
                  isActive ? "border-violet-500/[0.22] bg-[#0d0d11]" : "border-white/[0.06] bg-[#0d0d11]",
                )}
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : d.id)}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-white/[0.015] transition-colors"
                >
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: meta.dot, boxShadow: `0 0 6px ${meta.dot}80` }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs font-bold text-zinc-200">{d.trackingId}</span>
                      {isActive && (
                        <span className="animate-pulse rounded-full bg-violet-500/20 border border-violet-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-400">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate">
                      {d.pickupAddress.city}
                      <span className="text-zinc-700"> to </span>
                      {d.deliveryAddress.city}
                      {d.customer?.name ? `  · ${d.customer.name}` : ""}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 shrink-0 text-zinc-600">
                    <Navigation className="h-3 w-3" />
                    <span className="text-[11px]">{d.weightKg} kg</span>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={cn(
                      "text-sm font-bold tabular-nums",
                      driverEarning > 0 ? "text-emerald-400" : "text-zinc-600",
                    )}>
                      {driverEarning > 0 ? `+${formatKobo(driverEarning)}` : "N0"}
                    </p>
                    <span className={cn("text-[10px] font-semibold", meta.color)}>{meta.label}</span>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 shrink-0 text-zinc-600 transition-transform duration-200",
                    isExpanded && "rotate-180",
                  )} />
                </button>

                {isExpanded && (
                  <div className="border-t border-white/[0.05] px-4 py-4 space-y-4 bg-white/[0.01]">

                    {/* Route */}
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center pt-1 shrink-0">
                        <div className="h-2.5 w-2.5 rounded-full border-2 border-teal-400 bg-transparent" />
                        <div className="my-1.5 h-7 w-px bg-gradient-to-b from-teal-500/40 to-rose-500/40" />
                        <MapPin className="h-3 w-3 text-rose-400" />
                      </div>
                      <div className="space-y-3 flex-1 min-w-0">
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600 mb-0.5">Pickup</p>
                          <p className="text-xs text-zinc-300">{d.pickupAddress.street}, {d.pickupAddress.city}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600 mb-0.5">Delivery</p>
                          <p className="text-xs text-zinc-300">{d.deliveryAddress.street}, {d.deliveryAddress.city}</p>
                        </div>
                      </div>
                    </div>

                    {/* Meta strip */}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {[
                        { icon: Package,    label: "Description", value: d.description || "No description" },
                        { icon: Navigation, label: "Weight",      value: `${d.weightKg} kg`   },
                        {
                          icon: Clock,
                          label: d.actualDelivery ? "Completed" : "Created",
                          value: new Date(d.actualDelivery ?? d.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric", month: "short",
                          }),
                        },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
                          <div className="flex items-center gap-1 mb-0.5">
                            <Icon className="h-2.5 w-2.5 text-zinc-600" />
                            <p className="text-[9px] uppercase tracking-wider text-zinc-600">{label}</p>
                          </div>
                          <p className="text-xs font-semibold text-zinc-300 truncate">{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Earnings */}
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2.5">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600 mb-0.5">Your Earning</p>
                      <p className="text-sm font-bold text-emerald-400">{formatKobo(driverEarning)}</p>
                    </div>

                    {/* Delivered chip */}
                    {d.status === "delivered" && (
                      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-emerald-400">Delivery Complete</p>
                          {d.actualDelivery && (
                            <p className="text-[10px] text-zinc-500">
                              {new Date(d.actualDelivery).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Status advance buttons */}
                    <StatusActions shipment={d} />

                    {/* Call CTA */}
                    {isActive && d.customer?.phone && (
                      <a
                        href={`tel:${d.customer.phone}`}
                        className="flex items-center justify-center gap-2 rounded-xl border border-teal-500/25 bg-teal-500/10 py-3 text-sm font-semibold text-teal-400 hover:bg-teal-500/[0.18] hover:border-teal-500/40 transition-all active:scale-[0.98]"
                      >
                        <Phone className="h-4 w-4" />
                        Call {d.customer.name}
                      </a>
                    )}
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
