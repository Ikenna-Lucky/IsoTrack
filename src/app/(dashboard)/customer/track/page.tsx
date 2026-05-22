"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  AlertCircle,
  Package,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  Navigation,
  Wifi,
  WifiOff,
  Star,
  Car,
  Truck,
  Bike,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { useTracking, type TrackingInfo } from "@/hooks/use-tracking";
import { useSocket, type LocationUpdate } from "@/hooks/use-socket";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const LiveMap = dynamic(
  () => import("@/components/map/live-map").then((m) => m.LiveMap),
  { ssr: false, loading: () => <div className="h-56 w-full animate-pulse rounded-xl bg-zinc-800/60" /> },
);

const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string; border: string; dot: string; icon: string }
> = {
  pending:          { label: "Pending",          color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   dot: "#f59e0b", icon: "clock" },
  assigned:         { label: "Driver Assigned",  color: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/20",     dot: "#0ea5e9", icon: "person" },
  picked_up:        { label: "Picked Up",        color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20",  dot: "#8b5cf6", icon: "box" },
  in_transit:       { label: "In Transit",       color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20",    dot: "#60a5fa", icon: "truck" },
  out_for_delivery: { label: "Out for Delivery", color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20",  dot: "#8b5cf6", icon: "moto" },
  delivered:        { label: "Delivered",        color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "#10b981", icon: "check" },
  failed:           { label: "Failed",           color: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/20",    dot: "#f43f5e", icon: "x" },
  cancelled:        { label: "Cancelled",        color: "text-zinc-500",    bg: "bg-zinc-500/10",    border: "border-zinc-500/20",    dot: "#71717a", icon: "ban" },
};

const STATUS_ICONS: Record<string, string> = {
  clock: "🕐", person: "👤", box: "📦", truck: "🚚", moto: "🛵", check: "✅", x: "❌", ban: "🚫",
};

const TIMELINE_STEPS = [
  { status: "pending",          label: "Order Placed",      sub: "Shipment registered in system"   },
  { status: "assigned",         label: "Driver Assigned",   sub: "A driver has been assigned"      },
  { status: "picked_up",        label: "Package Picked Up", sub: "Driver collected the package"    },
  { status: "in_transit",       label: "In Transit",        sub: "On the way to destination"       },
  { status: "out_for_delivery", label: "Out for Delivery",  sub: "Driver is nearby"                },
  { status: "delivered",        label: "Delivered",         sub: "Package delivered successfully"  },
];

const STATUS_ORDER = TIMELINE_STEPS.map((s) => s.status);

function deriveTimeline(info: TrackingInfo) {
  const currentIdx = Math.max(STATUS_ORDER.indexOf(info.status), 0);
  const isFailed = info.status === "failed" || info.status === "cancelled";
  return TIMELINE_STEPS.map(({ status, label, sub }, i) => {
    const event = info.events?.find((e) => e.status === status);
    const time = event
      ? new Date(event.createdAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", hour12: true })
      : null;
    const date = event
      ? new Date(event.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })
      : null;
    const message = event?.message ?? sub;
    let state: "done" | "current" | "pending";
    if (isFailed) state = i < currentIdx ? "done" : "pending";
    else if (i < currentIdx) state = "done";
    else if (i === currentIdx) state = "current";
    else state = "pending";
    return { label, message, time, date, state };
  });
}

function VehicleIcon({ type, className }: { type: string; className?: string }) {
  if (type === "truck") return <Truck className={className} />;
  if (type === "bike" || type === "motorcycle") return <Bike className={className} />;
  return <Car className={className} />;
}

function TrackingResult({
  info,
  driverLocation,
  connected,
}: {
  info: TrackingInfo;
  driverLocation: LocationUpdate | null;
  connected: boolean;
}) {
  const meta = STATUS_META[info.status] ?? STATUS_META["pending"]!;
  const icon = STATUS_ICONS[meta.icon] ?? "📦";
  const timeline = deriveTimeline(info);
  const isActive = info.status === "in_transit" || info.status === "out_for_delivery" || info.status === "picked_up";
  const isFailed = info.status === "failed";
  const isCancelled = info.status === "cancelled";

  return (
    <div className="space-y-3">
      <div className={cn("relative overflow-hidden rounded-2xl border bg-[#0d0d11]", isActive ? "border-violet-500/[0.22]" : meta.border)}>
        {isActive && <div className="pointer-events-none absolute -top-10 right-1/3 h-32 w-52 rounded-full bg-violet-500/[0.07] blur-3xl" />}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/[0.05] flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{icon}</span>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600 mb-0.5">Tracking ID</p>
              <span className="font-mono text-sm font-bold text-zinc-200">{info.trackingId}</span>
            </div>
            {isActive && (
              <div className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1">
                {connected ? <Wifi className="h-3 w-3 text-emerald-400" /> : <WifiOff className="h-3 w-3 text-zinc-600" />}
                <span className={cn("text-[10px] font-semibold", connected ? "text-emerald-400" : "text-zinc-600")}>
                  {connected ? "Live" : "Connecting..."}
                </span>
              </div>
            )}
          </div>
          <span className={cn("rounded-full border px-3 py-1 text-[11px] font-semibold", meta.bg, meta.border, meta.color)}>
            {meta.label}
          </span>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center pt-1 shrink-0">
              <div className="h-2.5 w-2.5 rounded-full border-2 border-violet-400" />
              <div className="my-1.5 h-8 w-px bg-gradient-to-b from-violet-500/30 to-rose-500/30" />
              <MapPin className="h-3 w-3 text-rose-400" />
            </div>
            <div className="space-y-3 min-w-0 flex-1">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600 mb-0.5">Pickup</p>
                <p className="text-sm font-medium text-zinc-200 truncate">{info.pickupAddress.street}, {info.pickupAddress.city}</p>
                <p className="text-xs text-zinc-600">{info.pickupAddress.state}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600 mb-0.5">Destination</p>
                <p className="text-sm font-medium text-zinc-200 truncate">{info.deliveryAddress.street}, {info.deliveryAddress.city}</p>
                <p className="text-xs text-zinc-600">{info.deliveryAddress.state}</p>
              </div>
            </div>
          </div>
          {(info.estimatedDelivery || info.actualDelivery) && (
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
              <Clock className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
              <div>
                {info.actualDelivery ? (
                  <>
                    <p className="text-[9px] uppercase tracking-wider text-zinc-600">Delivered</p>
                    <p className="text-xs font-semibold text-emerald-400">
                      {new Date(info.actualDelivery).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[9px] uppercase tracking-wider text-zinc-600">Estimated Delivery</p>
                    <p className="text-xs font-semibold text-zinc-300">
                      {new Date(info.estimatedDelivery!).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" })}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isActive && (
        <div className="overflow-hidden rounded-2xl border border-violet-500/[0.18] bg-[#0d0d11]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
              </span>
              <p className="text-xs font-semibold text-violet-400">Live Driver Location</p>
            </div>
            {driverLocation && (
              <span className="text-[10px] text-zinc-600">
                Updated {new Date(driverLocation.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
          </div>
          <div className="p-3">
            <LiveMap location={driverLocation} className="h-56 rounded-xl border border-white/[0.04]" />
          </div>
        </div>
      )}

      {info.driver && (
        <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-4">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600 mb-3">Your Driver</p>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.07] bg-gradient-to-br from-violet-500/20 to-blue-500/10 text-lg">
              {info.driver.vehicleType === "truck" ? "🚚" : info.driver.vehicleType === "bike" ? "🛵" : "🚗"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-zinc-200 truncate">{info.driver.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs text-zinc-400">{info.driver.rating.toFixed(1)}</span>
                </div>
                <span className="text-zinc-700">·</span>
                <VehicleIcon type={info.driver.vehicleType} className="h-3 w-3 text-zinc-600" />
                <span className="text-xs text-zinc-500 capitalize">{info.driver.vehicleType}</span>
              </div>
            </div>
            <div className="shrink-0 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5 text-center">
              <p className="font-mono text-xs font-bold text-zinc-300">{info.driver.vehiclePlate}</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-4">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600 mb-4">Tracking Timeline</p>
        {(isFailed || isCancelled) && (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/[0.08] px-3 py-2.5">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            <p className="text-xs text-rose-300">
              {isFailed ? "This delivery was unsuccessful. Please contact the sender." : "This shipment has been cancelled."}
            </p>
          </div>
        )}
        <ol className="relative space-y-0">
          {timeline.map(({ label, message, time, date, state }, i) => {
            const isLast = i === timeline.length - 1;
            return (
              <li key={label} className="flex items-start gap-3">
                <div className="flex flex-col items-center shrink-0 w-5">
                  {state === "done" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  ) : state === "current" ? (
                    <div className="h-5 w-5 rounded-full border-2 border-violet-400 bg-violet-400/10 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                    </div>
                  ) : (
                    <Circle className="h-5 w-5 text-zinc-800 shrink-0" />
                  )}
                  {!isLast && (
                    <div className={cn("my-1 w-px flex-1 min-h-[20px]",
                      state === "done" ? "bg-emerald-500/30" : state === "current" ? "bg-gradient-to-b from-violet-500/30 to-zinc-800/30" : "bg-zinc-800/40")} />
                  )}
                </div>
                <div className={cn("pb-4 min-w-0 flex-1", isLast && "pb-0")}>
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm font-semibold",
                      state === "done" ? "text-zinc-200" : state === "current" ? "text-violet-400" : "text-zinc-700")}>
                      {label}
                    </p>
                    {time && (
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-zinc-500">{date}</p>
                        <p className="text-[10px] font-medium text-zinc-500">{time}</p>
                      </div>
                    )}
                  </div>
                  <p className={cn("text-xs mt-0.5", state === "pending" ? "text-zinc-800" : "text-zinc-600")}>
                    {message}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export default function CustomerTrackPage() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState(searchParams.get("id") ?? "");
  const [submittedId, setSubmittedId] = useState<string | null>(searchParams.get("id") ?? null);
  const [driverLocation, setDriverLocation] = useState<LocationUpdate | null>(null);

  const { data: info, isLoading, isError } = useTracking(submittedId);
  const isActive = info?.status === "in_transit" || info?.status === "out_for_delivery" || info?.status === "picked_up";

  useEffect(() => {
    if (info?.driver?.currentLocation) {
      setDriverLocation({ lat: info.driver.currentLocation.lat, lng: info.driver.currentLocation.lng, heading: 0, speed: 0, timestamp: Date.now() });
    }
  }, [info?.driver?.currentLocation]);

  const { connected } = useSocket({
    trackingId: isActive ? (submittedId ?? null) : null,
    onLocation: (update) => setDriverLocation(update),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = input.trim().toUpperCase();
    if (!id) return;
    setDriverLocation(null);
    setSubmittedId(id);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Track a Package</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Enter the tracking ID shared by the sender to see real-time status.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 pointer-events-none" />
          <input
            type="text"
            placeholder="e.g. IST-K7X2M9PQ"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 pl-10 pr-4 font-mono text-sm text-zinc-200 placeholder:text-zinc-700 outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/[0.1] transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim()}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-500 active:scale-[0.98] transition-all shrink-0 shadow-lg shadow-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Navigation className="h-4 w-4" />
          Track
        </button>
      </form>

      {!submittedId && (
        <div className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3.5">
          <Package className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-zinc-300">How to get a tracking ID</p>
            <p className="text-xs text-zinc-600 mt-0.5">
              The business that shipped your package will share a tracking ID that looks like{" "}
              <span className="font-mono font-bold text-zinc-500">IST-XXXXXXXX</span>. Paste it above and tap Track.
            </p>
          </div>
        </div>
      )}

      {isLoading && submittedId && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
          <p className="text-sm text-zinc-600">Looking up {submittedId}...</p>
        </div>
      )}

      {isError && !isLoading && submittedId && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-4 py-3.5">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-rose-300">Shipment not found</p>
            <p className="text-xs text-zinc-600 mt-0.5">
              No shipment matches <span className="font-mono font-bold text-zinc-500">{submittedId}</span>. Double-check the ID and try again.
            </p>
            <button
              onClick={() => { setInput(""); setSubmittedId(null); }}
              className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Clear <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {info && !isLoading && (
        <TrackingResult info={info} driverLocation={driverLocation} connected={connected} />
      )}
    </div>
  );
}
