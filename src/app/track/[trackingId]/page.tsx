"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Package,
  Clock,
  Star,
  Car,
  Truck,
  Navigation,
  CheckCircle2,
  Circle,
  Loader2,
  ArrowRight,
  Search,
  Phone,
  Bike,
  AlertTriangle,
  Radio,
} from "lucide-react";
import { useTracking, type TrackingInfo } from "@/hooks/use-tracking";
import { useSocket, type LocationUpdate } from "@/hooks/use-socket";
import { LiveMap } from "@/components/map/live-map";
import { cn } from "@/lib/utils";

// ─── Status meta ──────────────────────────────────────────────────────────────

const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string; dot: string; icon: string }
> = {
  pending:          { label: "Pending",          color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20",   dot: "#f59e0b", icon: "🕐" },
  assigned:         { label: "Driver Assigned",  color: "text-sky-400",     bg: "bg-sky-500/10 border-sky-500/20",       dot: "#0ea5e9", icon: "👤" },
  picked_up:        { label: "Picked Up",        color: "text-violet-400",  bg: "bg-violet-500/10 border-violet-500/20", dot: "#8b5cf6", icon: "📦" },
  in_transit:       { label: "In Transit",       color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20",     dot: "#60a5fa", icon: "🚚" },
  out_for_delivery: { label: "Out for Delivery", color: "text-violet-400",  bg: "bg-violet-500/10 border-violet-500/20", dot: "#8b5cf6", icon: "🛵" },
  delivered:        { label: "Delivered",        color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", dot: "#10b981", icon: "✅" },
  failed:           { label: "Failed",           color: "text-rose-400",    bg: "bg-rose-500/10 border-rose-500/20",     dot: "#f43f5e", icon: "❌" },
  cancelled:        { label: "Cancelled",        color: "text-zinc-500",    bg: "bg-zinc-500/10 border-zinc-500/20",     dot: "#71717a", icon: "🚫" },
};

// ─── Timeline steps ───────────────────────────────────────────────────────────

const TIMELINE_STEPS = [
  { status: "pending",          label: "Order Placed",      sub: "Shipment registered in system" },
  { status: "assigned",         label: "Driver Assigned",   sub: "A driver has been assigned"    },
  { status: "picked_up",        label: "Package Picked Up", sub: "Driver collected the package"  },
  { status: "in_transit",       label: "In Transit",        sub: "On the way to destination"     },
  { status: "out_for_delivery", label: "Out for Delivery",  sub: "Driver is nearby"              },
  { status: "delivered",        label: "Delivered",         sub: "Package delivered successfully" },
];

const STATUS_ORDER = TIMELINE_STEPS.map((s) => s.status);

function deriveTimeline(info: TrackingInfo) {
  const currentIdx = Math.max(STATUS_ORDER.indexOf(info.status), 0);
  const isFailed = info.status === "failed" || info.status === "cancelled";

  return TIMELINE_STEPS.map(({ status, label, sub }, i) => {
    const event = info.events?.find((e) => e.status === status);
    const time = event
      ? new Date(event.createdAt).toLocaleTimeString("en-NG", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : null;
    const date = event
      ? new Date(event.createdAt).toLocaleDateString("en-NG", {
          day: "numeric",
          month: "short",
        })
      : null;
    const message = event?.message ?? sub;

    let state: "done" | "current" | "pending";
    if (isFailed) {
      state = i < currentIdx ? "done" : "pending";
    } else if (i < currentIdx) {
      state = "done";
    } else if (i === currentIdx) {
      state = "current";
    } else {
      state = "pending";
    }

    return { label, message, time, date, state };
  });
}

// ─── Vehicle icon helper ──────────────────────────────────────────────────────

function VehicleIcon({ type, className }: { type: string; className?: string }) {
  if (type === "truck") return <Truck className={className} />;
  if (type === "bike" || type === "motorcycle") return <Bike className={className} />;
  return <Car className={className} />;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusHero({ info }: { info: TrackingInfo }) {
  const meta = STATUS_META[info.status] ?? STATUS_META.pending;
  const isActive =
    info.status === "in_transit" ||
    info.status === "out_for_delivery" ||
    info.status === "picked_up";

  return (
    <div className="text-center space-y-4">
      {/* Big status icon */}
      <div className="flex justify-center">
        <div
          className={cn(
            "flex h-20 w-20 items-center justify-center rounded-[28px] border-2 text-4xl",
            meta.bg,
          )}
        >
          {meta.icon}
        </div>
      </div>

      {/* Status label */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600 mb-1">
          Shipment Status
        </p>
        <h1 className={cn("text-3xl font-bold tracking-tight", meta.color)}>
          {meta.label}
        </h1>
        {isActive && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-violet-400 uppercase tracking-wide">
              Live tracking active
            </span>
          </div>
        )}
      </div>

      {/* Tracking ID */}
      <div className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2">
        <Package className="h-3.5 w-3.5 text-zinc-600" />
        <span className="font-mono text-sm font-bold text-zinc-300">{info.trackingId}</span>
      </div>

      {/* Description */}
      {info.description && (
        <p className="text-sm text-zinc-500">{info.description}</p>
      )}
    </div>
  );
}

function RouteCard({ info }: { info: TrackingInfo }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-4">
      <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600 mb-3">
        Route
      </p>
      <div className="flex items-start gap-3">
        {/* Visual connector */}
        <div className="flex flex-col items-center pt-1 shrink-0">
          <div className="h-2.5 w-2.5 rounded-full border-2 border-teal-400 bg-transparent" />
          <div className="my-2 h-8 w-px bg-gradient-to-b from-teal-500/40 to-rose-500/40" />
          <MapPin className="h-3 w-3 text-rose-400" />
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          {/* Pickup */}
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600 mb-0.5">
              Pickup
            </p>
            <p className="text-sm text-zinc-200">
              {info.pickupAddress.street},&nbsp;{info.pickupAddress.city}
            </p>
            <p className="text-xs text-zinc-600">{info.pickupAddress.state}</p>
          </div>

          {/* Destination */}
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600 mb-0.5">
              Destination
            </p>
            <p className="text-sm text-zinc-200">
              {info.deliveryAddress.street},&nbsp;{info.deliveryAddress.city}
            </p>
            <p className="text-xs text-zinc-600">{info.deliveryAddress.state}</p>
          </div>
        </div>
      </div>

      {/* ETA strip */}
      {(info.estimatedDelivery || info.actualDelivery) && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2">
          <Clock className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
          <div>
            {info.actualDelivery ? (
              <>
                <p className="text-[9px] uppercase tracking-wider text-zinc-600">Delivered</p>
                <p className="text-xs font-semibold text-emerald-400">
                  {new Date(info.actualDelivery).toLocaleDateString("en-NG", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </>
            ) : (
              <>
                <p className="text-[9px] uppercase tracking-wider text-zinc-600">
                  Estimated Delivery
                </p>
                <p className="text-xs font-semibold text-zinc-300">
                  {new Date(info.estimatedDelivery!).toLocaleDateString("en-NG", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineCard({ info }: { info: TrackingInfo }) {
  const timeline = deriveTimeline(info);
  const isFailed = info.status === "failed";
  const isCancelled = info.status === "cancelled";

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-4">
      <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600 mb-4">
        Tracking Timeline
      </p>

      {(isFailed || isCancelled) && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/[0.08] px-3 py-2.5">
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
          <p className="text-xs text-rose-300">
            {isFailed
              ? "This delivery was unsuccessful. Please contact support."
              : "This shipment has been cancelled."}
          </p>
        </div>
      )}

      <ol className="relative space-y-0">
        {timeline.map(({ label, message, time, date, state }, i) => {
          const isLast = i === timeline.length - 1;
          return (
            <li key={label} className="flex items-start gap-3">
              {/* Dot + line */}
              <div className="flex flex-col items-center shrink-0 w-5">
                {state === "done" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                ) : state === "current" ? (
                  <div className="h-5 w-5 rounded-full border-2 border-teal-400 bg-teal-400/10 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                  </div>
                ) : (
                  <Circle className="h-5 w-5 text-zinc-800 shrink-0" />
                )}
                {!isLast && (
                  <div
                    className={cn(
                      "my-1 w-px flex-1 min-h-[20px]",
                      state === "done"
                        ? "bg-emerald-500/30"
                        : state === "current"
                        ? "bg-gradient-to-b from-teal-500/30 to-zinc-800/30"
                        : "bg-zinc-800/40",
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className={cn("pb-4 min-w-0 flex-1", isLast && "pb-0")}>
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      state === "done"
                        ? "text-zinc-200"
                        : state === "current"
                        ? "text-teal-400"
                        : "text-zinc-700",
                    )}
                  >
                    {label}
                  </p>
                  {time && (
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-zinc-500">{date}</p>
                      <p className="text-[10px] font-medium text-zinc-500">{time}</p>
                    </div>
                  )}
                </div>
                <p
                  className={cn(
                    "text-xs mt-0.5",
                    state === "pending" ? "text-zinc-800" : "text-zinc-600",
                  )}
                >
                  {message}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function DriverCard({ driver }: { driver: NonNullable<TrackingInfo["driver"]> }) {
  const vehicleEmoji =
    driver.vehicleType === "bike" || driver.vehicleType === "motorcycle"
      ? "🛵"
      : driver.vehicleType === "truck"
      ? "🚚"
      : "🚗";

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-4">
      <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600 mb-3">
        Your Driver
      </p>

      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/[0.07] bg-gradient-to-br from-violet-500/20 to-blue-500/10 text-xl">
          {vehicleEmoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-zinc-200 truncate">{driver.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              <span className="text-xs text-zinc-400">{driver.rating.toFixed(1)}</span>
            </div>
            <span className="text-zinc-700">·</span>
            <VehicleIcon
              type={driver.vehicleType}
              className="h-3 w-3 text-zinc-600"
            />
            <span className="text-xs text-zinc-500 capitalize">
              {driver.vehicleType}
            </span>
          </div>
        </div>

        {/* Plate badge */}
        <div className="shrink-0 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5 text-center">
          <p className="font-mono text-xs font-bold text-zinc-300">{driver.vehiclePlate}</p>
        </div>
      </div>
    </div>
  );
}

function LiveMapCard({
  driverLocation,
}: {
  driverLocation: LocationUpdate | null;
}) {
  return (
    <div className="rounded-2xl border border-violet-500/[0.15] bg-[#0d0d11] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
          <p className="text-xs font-semibold text-violet-400">Live Driver Location</p>
        </div>
        {driverLocation && (
          <p className="text-[10px] text-zinc-600">
            Updated{" "}
            {new Date(driverLocation.timestamp).toLocaleTimeString("en-NG", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
        )}
      </div>
      <LiveMap location={driverLocation} className="h-56" />
      {!driverLocation && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0d0d11]/60 rounded-2xl">
          <p className="text-xs text-zinc-600">Waiting for driver location…</p>
        </div>
      )}
    </div>
  );
}

// ─── Search bar ───────────────────────────────────────────────────────────────

function TrackingSearch({ current }: { current: string }) {
  const router = useRouter();
  const [value, setValue] = useState(current);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = value.trim().toUpperCase();
    if (id) router.push(`/track/${id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          placeholder="Enter tracking ID…"
          className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] pl-9 pr-3 py-2.5 text-sm font-mono text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-teal-500/40 focus:ring-2 focus:ring-teal-500/[0.12] transition-all"
        />
      </div>
      <button
        type="submit"
        className="shrink-0 flex items-center gap-1.5 rounded-xl bg-teal-500/10 border border-teal-500/25 px-4 py-2.5 text-sm font-semibold text-teal-400 hover:bg-teal-500/[0.18] hover:border-teal-500/40 transition-all active:scale-[0.98]"
      >
        Track
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicTrackingPage() {
  const params = useParams();
  const trackingId = typeof params.trackingId === "string" ? params.trackingId : "";

  const { data: info, isLoading, isError } = useTracking(trackingId);

  const [driverLocation, setDriverLocation] = useState<LocationUpdate | null>(null);

  const isActive =
    info?.status === "in_transit" ||
    info?.status === "out_for_delivery" ||
    info?.status === "picked_up";

  // Seed map with last known driver location from API
  useEffect(() => {
    if (info?.driver?.currentLocation) {
      setDriverLocation({
        lat: info.driver.currentLocation.lat,
        lng: info.driver.currentLocation.lng,
        heading: 0,
        speed: 0,
        timestamp: Date.now(),
      });
    }
  }, [info?.driver?.currentLocation]);

  // Live socket updates (only when active)
  useSocket({
    trackingId: isActive ? trackingId : null,
    onLocation: (update) => setDriverLocation(update),
  });

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      {/* ── Top bar ── */}
      <header className="border-b border-white/[0.05] bg-[#08080a]/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-teal-600">
              <Navigation className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-white tracking-tight">IsoTrack</span>
          </a>

          {/* Live badge */}
          {isActive && (
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium text-emerald-400">Live</span>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-5">

        {/* ── Search ── */}
        <TrackingSearch current={trackingId} />

        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-zinc-600" />
            <p className="text-sm text-zinc-600">Looking up shipment…</p>
          </div>
        )}

        {/* ── Error / Not found ── */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center py-20 gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/[0.08] text-2xl">
              📦
            </div>
            <div>
              <p className="text-base font-semibold text-zinc-300">Shipment not found</p>
              <p className="text-sm text-zinc-600 mt-1">
                Check your tracking ID and try again.
              </p>
            </div>
          </div>
        )}

        {/* ── Main content ── */}
        {info && !isLoading && (
          <>
            {/* Status hero */}
            <StatusHero info={info} />

            {/* Live map (active shipments only) */}
            {isActive && (
              <div className="relative">
                <LiveMapCard driverLocation={driverLocation} />
              </div>
            )}

            {/* Route */}
            <RouteCard info={info} />

            {/* Driver (if assigned) */}
            {info.driver && <DriverCard driver={info.driver} />}

            {/* Timeline */}
            <TimelineCard info={info} />

            {/* Footer note */}
            <p className="text-center text-xs text-zinc-700 pb-4">
              Powered by{" "}
              <span className="text-zinc-600 font-medium">IsoTrack</span> · Updates
              every 15 seconds when your order is active
            </p>
          </>
        )}
      </main>
    </div>
  );
}
