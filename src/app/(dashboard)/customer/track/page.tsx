"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Search,
  MapPin,
  Phone,
  Star,
  AlertCircle,
  CheckCircle2,
  Package,
  Wifi,
  WifiOff,
  Navigation,
  ChevronRight,
} from "lucide-react";
import { useShipments, getShipmentList } from "@/hooks/use-shipments";
import { useSocket, type LocationUpdate } from "@/hooks/use-socket";
import type { Shipment, ShipmentStatus } from "@/types";
import { formatKobo } from "@/types";
import { cn } from "@/lib/utils";

// ─── Dynamic map ──────────────────────────────────────────────────────────────

const LiveMap = dynamic(
  () => import("@/components/map/live-map").then((m) => m.LiveMap),
  {
    ssr: false,
    loading: () => <div className="h-64 w-full animate-pulse rounded-xl bg-zinc-800/60" />,
  },
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Timeline derivation ──────────────────────────────────────────────────────

const STATUS_STEPS = [
  { status: "pending",          label: "Order placed",      sub: "Shipment request received"      },
  { status: "assigned",         label: "Driver assigned",   sub: "A driver accepted the order"    },
  { status: "picked_up",        label: "Package picked up", sub: "Driver collected the package"   },
  { status: "out_for_delivery", label: "Out for delivery",  sub: "Driver near delivery area"       },
  { status: "delivered",        label: "Delivered",         sub: "Package delivered successfully" },
] as const;

function deriveTimeline(s: Shipment) {
  const ORDER = STATUS_STEPS.map((st) => st.status as string);
  const currentIdx = Math.max(ORDER.indexOf(s.status), 0);
  const isFailed = s.status === "failed" || s.status === "cancelled";

  return STATUS_STEPS.map(({ status, label, sub }, i) => {
    const event = s.events?.find((e) => e.status === status);
    const time = event
      ? new Date(event.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "—";

    let state: "done" | "current" | "pending";
    if (isFailed)              state = i < currentIdx ? "done" : "pending";
    else if (i < currentIdx)   state = "done";
    else if (i === currentIdx) state = "current";
    else                       state = "pending";

    return { label, sub: event?.message ?? sub, time, state };
  });
}

// ─── Timeline step ────────────────────────────────────────────────────────────

function TimelineStep({
  label, sub, time, state, isLast,
}: {
  label: string; sub: string; time: string;
  state: "done" | "current" | "pending"; isLast?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center shrink-0 pt-0.5">
        <div className={cn(
          "relative z-10 flex h-4 w-4 items-center justify-center rounded-full border text-[7px] font-bold",
          state === "done"
            ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
            : state === "current"
            ? "border-violet-500 bg-violet-500/20 text-violet-400 animate-pulse"
            : "border-zinc-800 bg-zinc-900 text-zinc-700",
        )}>
          {state === "done" ? "✓" : state === "current" ? "●" : ""}
        </div>
        {!isLast && (
          <div className={cn("w-px flex-1 mt-1", state === "done" ? "bg-emerald-500/25" : "bg-zinc-800")} style={{ minHeight: 26 }} />
        )}
      </div>
      <div className="pb-3.5 min-w-0">
        <p className={cn(
          "text-sm font-semibold leading-tight",
          state === "done" ? "text-zinc-200" : state === "current" ? "text-violet-300" : "text-zinc-600",
        )}>{label}</p>
        <p className="mt-0.5 text-[11px] text-zinc-600">{sub}</p>
        <p className={cn(
          "mt-0.5 text-[10px] font-medium",
          state === "done" ? "text-emerald-500/60" : state === "current" ? "text-violet-400/70" : "text-zinc-800",
        )}>{time}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerTrackPage() {
  const [query,        setQuery]        = useState("");
  const [searched,     setSearched]     = useState(false);
  const [liveLocation, setLiveLocation] = useState<LocationUpdate | null>(null);

  const { data: shipmentsData } = useShipments({ pageSize: 100 });
  const shipments = getShipmentList(shipmentsData);

  const result: Shipment | null = shipments.find(
    (s) => s.trackingId.toLowerCase() === query.trim().toLowerCase(),
  ) ?? null;

  const isActive = result?.status === "out_for_delivery" || result?.status === "in_transit";

  const { connected } = useSocket({
    trackingId: searched && isActive ? result!.trackingId : null,
    onLocation: (update) => setLiveLocation(update),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLiveLocation(null);
    if (query.trim()) setSearched(true);
  };

  const timeline = result ? deriveTimeline(result) : [];

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Track a Package</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Enter a tracking ID to see real-time status</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 pointer-events-none" />
          <input
            type="text"
            placeholder="e.g. IST-K7X2M9PQ"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearched(false); setLiveLocation(null); }}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 pl-10 pr-4 font-mono text-sm text-zinc-200 placeholder:text-zinc-700 outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/[0.1] transition-all"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-500 active:scale-[0.98] transition-all shrink-0 shadow-lg shadow-violet-500/20"
        >
          <Navigation className="h-4 w-4" />
          Track
        </button>
      </form>

      {/* Quick chips — your shipments */}
      {shipments.length > 0 && (
        <div>
          <p className="mb-2.5 text-[9px] font-semibold uppercase tracking-widest text-zinc-600">Your Shipments</p>
          <div className="flex flex-wrap gap-1.5">
            {shipments.slice(0, 8).map((s) => {
              const meta = STATUS_META[s.status];
              const isSelected = query === s.trackingId;
              return (
                <button
                  key={s.id}
                  onClick={() => { setQuery(s.trackingId); setSearched(false); setLiveLocation(null); }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-medium transition-all",
                    isSelected
                      ? "border-violet-500/30 bg-violet-500/10 text-violet-400"
                      : "border-white/[0.07] bg-white/[0.02] text-zinc-500 hover:border-white/[0.12] hover:text-zinc-300",
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: meta.dot }} />
                  <span className="font-mono">{s.trackingId}</span>
                  <span className={cn("text-[9px] font-semibold hidden sm:inline", meta.color)}>{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Not found */}
      {searched && !result && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-4 py-3.5">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-rose-300">Tracking ID not found</p>
            <p className="text-xs text-zinc-600 mt-0.5">
              No shipment matching <span className="font-mono font-bold text-zinc-500">&quot;{query}&quot;</span> — check the ID and try again.
            </p>
          </div>
        </div>
      )}

      {/* Result */}
      {searched && result && (() => {
        const meta = STATUS_META[result.status];
        return (
          <div className="space-y-3">

            {/* Status card */}
            <div className={cn(
              "relative overflow-hidden rounded-2xl border bg-[#0d0d11]",
              isActive ? "border-violet-500/[0.22]" : "border-white/[0.07]",
            )}>
              {isActive && (
                <div className="pointer-events-none absolute -top-10 right-1/3 h-32 w-52 rounded-full bg-violet-500/[0.07] blur-3xl" />
              )}
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/[0.05] flex-wrap">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-bold text-zinc-200">{result.trackingId}</span>
                  {isActive && (
                    <div className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1">
                      {connected
                        ? <Wifi className="h-3 w-3 text-emerald-400" />
                        : <WifiOff className="h-3 w-3 text-zinc-600" />}
                      <span className={cn("text-[10px] font-semibold", connected ? "text-emerald-400" : "text-zinc-600")}>
                        {connected ? "Live" : "Connecting…"}
                      </span>
                    </div>
                  )}
                </div>
                <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold", meta.bg, meta.border, meta.color)}>
                  {meta.label}
                </span>
              </div>

              <div className="p-5 space-y-4">
                {/* Route */}
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center pt-1 shrink-0">
                    <div className="h-2.5 w-2.5 rounded-full border-2 border-violet-400" />
                    <div className="my-1 h-8 w-px bg-gradient-to-b from-violet-500/30 to-rose-500/30" />
                    <MapPin className="h-3 w-3 text-rose-400" />
                  </div>
                  <div className="space-y-3 min-w-0 flex-1">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600 mb-0.5">From</p>
                      <p className="text-sm font-medium text-zinc-200 truncate">
                        {result.pickupAddress.street}, {result.pickupAddress.city}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600 mb-0.5">To</p>
                      <p className="text-sm font-medium text-zinc-200 truncate">
                        {result.deliveryAddress.street}, {result.deliveryAddress.city}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Meta chips */}
                <div className="flex flex-wrap gap-2">
                  {result.description && (
                    <span className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5 text-xs text-zinc-400">
                      <Package className="h-3 w-3" />{result.description}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5 text-xs text-zinc-400">
                    {formatKobo(result.priceKobo)}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5 text-xs text-zinc-400">
                    {result.weightKg} kg
                  </span>
                </div>
              </div>
            </div>

            {/* Live map */}
            {isActive && (
              <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d0d11]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
                    </span>
                    <p className="text-xs font-semibold text-zinc-300">Live Driver Location</p>
                  </div>
                  <span className="text-[10px] text-zinc-600">
                    {liveLocation
                      ? `Updated ${new Date(liveLocation.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                      : connected ? "Waiting for signal…" : ""}
                  </span>
                </div>
                <div className="p-3">
                  <LiveMap location={liveLocation} className="h-64 rounded-xl border border-white/[0.04]" />
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="rounded-2xl border border-white/[0.07] bg-[#0d0d11] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-200">Delivery Timeline</h3>
                <span className="text-[10px] text-zinc-600">
                  {timeline.filter((e) => e.state === "done").length}/{timeline.length} complete
                </span>
              </div>
              {timeline.map((ev, i) => (
                <TimelineStep key={i} label={ev.label} sub={ev.sub} time={ev.time} state={ev.state}
                  isLast={i === timeline.length - 1} />
              ))}
            </div>

            {/* Driver */}
            {result.driver && (
              <div className="rounded-2xl border border-white/[0.07] bg-[#0d0d11] p-5">
                <h3 className="text-sm font-semibold text-zinc-200 mb-4">Driver</h3>
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500/25 to-sky-500/25 border border-teal-500/20 text-sm font-bold text-teal-300 ring-2 ring-teal-500/10 ring-offset-2 ring-offset-[#0d0d11]">
                    {result.driver.user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-zinc-100 truncate">{result.driver.user.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
                      <Star className="h-3 w-3 text-amber-400" />
                      {result.driver.rating.toFixed(1)}
                      <span className="text-zinc-700">·</span>
                      <span className="capitalize">{result.driver.vehicleType}</span>
                      <span className="text-zinc-700">·</span>
                      <span className="font-mono">{result.driver.vehiclePlate}</span>
                    </div>
                  </div>
                  {result.driver.user.phone && (
                    <a
                      href={`tel:${result.driver.user.phone}`}
                      className="flex items-center gap-1.5 rounded-xl border border-teal-500/20 bg-teal-500/[0.08] px-4 py-2 text-sm font-semibold text-teal-400 hover:bg-teal-500/[0.15] transition-all shrink-0"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Call
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Delivered */}
            {result.status === "delivered" && (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] px-4 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-emerald-300">Delivered Successfully</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {result.actualDelivery
                      ? new Date(result.actualDelivery).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })
                      : "Delivery confirmed"}
                  </p>
                </div>
                <Link
                  href="/customer/shipments"
                  className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-emerald-400 transition-colors shrink-0"
                >
                  History <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            )}

            {/* Failed */}
            {result.status === "failed" && (
              <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-4 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-500/10">
                  <AlertCircle className="h-4 w-4 text-rose-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-rose-300">Delivery Failed</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Driver was unable to complete this delivery. Please contact support.</p>
                </div>
              </div>
            )}

          </div>
        );
      })()}

    </div>
  );
}
