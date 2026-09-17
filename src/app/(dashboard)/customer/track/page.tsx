"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  AlertCircle,
  Bike,
  Car,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  MapPin,
  Navigation,
  Package,
  Search,
  Star,
  Truck,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useTracking, type TrackingInfo } from "@/hooks/use-tracking";
import { useSocket, type LocationUpdate } from "@/hooks/use-socket";
import { cn } from "@/lib/utils";

const LiveMap = dynamic(
  () => import("@/components/map/live-map").then((m) => m.LiveMap),
  { ssr: false, loading: () => <div className="h-64 w-full animate-pulse rounded-md bg-white/[0.04]" /> },
);

const TIMELINE_STEPS = [
  { status: "pending", label: "Order placed", sub: "Shipment registered" },
  { status: "assigned", label: "Driver assigned", sub: "A driver is attached" },
  { status: "picked_up", label: "Picked up", sub: "Package collected" },
  { status: "in_transit", label: "In transit", sub: "Moving toward destination" },
  { status: "out_for_delivery", label: "Out for delivery", sub: "Driver is nearby" },
  { status: "delivered", label: "Delivered", sub: "Package delivered" },
];

const STATUS_ORDER = TIMELINE_STEPS.map((step) => step.status);

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusTone(status: string) {
  if (status === "delivered") return "border-emerald-400/25 bg-emerald-400/10 text-emerald-200";
  if (status === "failed" || status === "cancelled") return "border-rose-400/25 bg-rose-400/10 text-rose-200";
  if (["assigned", "picked_up", "in_transit", "out_for_delivery"].includes(status)) {
    return "border-teal-400/25 bg-teal-400/10 text-teal-200";
  }
  return "border-amber-400/25 bg-amber-400/10 text-amber-200";
}

function deriveTimeline(info: TrackingInfo) {
  const currentIndex = Math.max(STATUS_ORDER.indexOf(info.status), 0);
  const stopped = info.status === "failed" || info.status === "cancelled";

  return TIMELINE_STEPS.map(({ status, label, sub }, index) => {
    const event = info.events?.find((item) => item.status === status);
    let state: "done" | "current" | "pending";

    if (stopped) state = index < currentIndex ? "done" : "pending";
    else if (index < currentIndex) state = "done";
    else if (index === currentIndex) state = "current";
    else state = "pending";

    return {
      label,
      message: event?.message ?? sub,
      state,
      time: event ? formatDateTime(event.createdAt) : null,
    };
  });
}

function VehicleIcon({ type, className }: { type: string; className?: string }) {
  if (type === "truck") return <Truck className={className} />;
  if (type === "bike" || type === "motorcycle") return <Bike className={className} />;
  return <Car className={className} />;
}

function RouteSummary({ info }: { info: TrackingInfo }) {
  return (
    <div className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-600">Shipment route</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr,auto,1fr] sm:items-center">
        <div className="min-w-0 rounded-md border border-teal-400/20 bg-teal-400/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-teal-200">Pickup</p>
          <p className="mt-1 truncate text-sm font-black text-stone-100">{info.pickupAddress.street}</p>
          <p className="text-xs text-stone-500">{info.pickupAddress.city}, {info.pickupAddress.state}</p>
        </div>
        <div className="hidden h-px w-14 bg-gradient-to-r from-teal-300/30 to-amber-300/30 sm:block" />
        <div className="min-w-0 rounded-md border border-amber-400/20 bg-amber-400/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-200">Drop-off</p>
          <p className="mt-1 truncate text-sm font-black text-stone-100">{info.deliveryAddress.street}</p>
          <p className="text-xs text-stone-500">{info.deliveryAddress.city}, {info.deliveryAddress.state}</p>
        </div>
      </div>
    </div>
  );
}

function TrackingTimeline({ info }: { info: TrackingInfo }) {
  const timeline = deriveTimeline(info);
  const stopped = info.status === "failed" || info.status === "cancelled";

  return (
    <div className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-600">Checkpoint log</p>
      {stopped && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-rose-400/20 bg-rose-400/10 px-3 py-2.5">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-200" />
          <p className="text-xs font-bold leading-5 text-rose-100">
            {info.status === "failed" ? "This delivery was unsuccessful. Contact the sender for next steps." : "This shipment has been cancelled."}
          </p>
        </div>
      )}
      <ol className="mt-5 space-y-0">
        {timeline.map((item, index) => {
          const last = index === timeline.length - 1;
          return (
            <li key={item.label} className="flex gap-3">
              <div className="flex w-5 shrink-0 flex-col items-center">
                {item.state === "done" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                ) : item.state === "current" ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-teal-300 bg-teal-400/10">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-200" />
                  </div>
                ) : (
                  <Circle className="h-5 w-5 text-stone-800" />
                )}
                {!last && (
                  <div className={cn("my-1 min-h-8 w-px flex-1", item.state === "done" ? "bg-emerald-300/25" : "bg-stone-800")} />
                )}
              </div>
              <div className={cn("min-w-0 flex-1 pb-5", last && "pb-0")}>
                <div className="flex items-start justify-between gap-3">
                  <p className={cn("text-sm font-black", item.state === "current" ? "text-teal-100" : item.state === "done" ? "text-stone-100" : "text-stone-700")}>
                    {item.label}
                  </p>
                  {item.time && <p className="shrink-0 text-right text-[10px] font-bold text-stone-600">{item.time}</p>}
                </div>
                <p className={cn("mt-0.5 text-xs", item.state === "pending" ? "text-stone-800" : "text-stone-500")}>{item.message}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function DriverPanel({ driver }: { driver: NonNullable<TrackingInfo["driver"]> }) {
  return (
    <div className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-600">Assigned driver</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-teal-400/20 bg-teal-400/10">
          <VehicleIcon type={driver.vehicleType} className="h-5 w-5 text-teal-200" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-stone-100">{driver.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
              {driver.rating.toFixed(1)}
            </span>
            <span className="capitalize">{driver.vehicleType}</span>
          </div>
        </div>
        <div className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5 text-right">
          <p className="font-mono text-xs font-black text-stone-200">{driver.vehiclePlate}</p>
          <p className="text-[9px] text-stone-600">Plate</p>
        </div>
      </div>
    </div>
  );
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
  const active = ["picked_up", "in_transit", "out_for_delivery"].includes(info.status);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr,360px]">
      <div className="space-y-4">
        <section className="rounded-md border border-teal-400/20 bg-[#0d1412] p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-200">Tracking ID</p>
              <h3 className="mt-2 font-mono text-2xl font-black tracking-tight text-stone-50">{info.trackingId}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={cn("rounded-md border px-3 py-1.5 text-xs font-black capitalize", statusTone(info.status))}>
                {formatStatus(info.status)}
              </span>
              {active && (
                <span className="flex items-center gap-1.5 rounded-md border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-xs font-black text-stone-300">
                  {connected ? <Wifi className="h-3.5 w-3.5 text-teal-200" /> : <WifiOff className="h-3.5 w-3.5 text-stone-600" />}
                  {connected ? "Live" : "Connecting"}
                </span>
              )}
            </div>
          </div>
          {info.description && <p className="mt-4 text-sm leading-6 text-stone-500">{info.description}</p>}
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <div className="rounded-md border border-white/[0.07] bg-black/20 p-3">
              <Clock className="h-4 w-4 text-amber-200" />
              <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-stone-600">ETA</p>
              <p className="mt-1 text-xs font-black text-stone-200">{formatDateTime(info.actualDelivery ?? info.estimatedDelivery)}</p>
            </div>
            <div className="rounded-md border border-white/[0.07] bg-black/20 p-3">
              <Package className="h-4 w-4 text-teal-200" />
              <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-stone-600">Checkpoints</p>
              <p className="mt-1 text-xs font-black text-stone-200">{info.events?.length ?? 0} events</p>
            </div>
            <div className="rounded-md border border-white/[0.07] bg-black/20 p-3">
              <MapPin className="h-4 w-4 text-rose-200" />
              <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-stone-600">Destination</p>
              <p className="mt-1 truncate text-xs font-black text-stone-200">{info.deliveryAddress.city}</p>
            </div>
          </div>
        </section>

        <RouteSummary info={info} />

        {active && (
          <section className="overflow-hidden rounded-md border border-teal-400/20 bg-[#0d1412]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-200" />
                </span>
                <p className="text-xs font-black text-teal-100">Live driver location</p>
              </div>
              {driverLocation && (
                <p className="text-[10px] font-bold text-stone-600">
                  Updated {new Date(driverLocation.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </p>
              )}
            </div>
            <div className="p-3">
              <LiveMap location={driverLocation} className="h-64 rounded-md border border-white/[0.07]" />
            </div>
          </section>
        )}
      </div>

      <aside className="space-y-4">
        {info.driver && <DriverPanel driver={info.driver} />}
        <TrackingTimeline info={info} />
      </aside>
    </div>
  );
}

export default function CustomerTrackPage() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState(searchParams.get("id") ?? "");
  const [submittedId, setSubmittedId] = useState<string | null>(searchParams.get("id") ?? null);
  const [driverLocation, setDriverLocation] = useState<LocationUpdate | null>(null);

  const { data: info, isLoading, isError } = useTracking(submittedId);
  const active = info?.status === "in_transit" || info?.status === "out_for_delivery" || info?.status === "picked_up";

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

  const { connected } = useSocket({
    trackingId: active ? (submittedId ?? null) : null,
    onLocation: (update) => setDriverLocation(update),
  });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const id = input.trim().toUpperCase();
    if (!id) return;
    setDriverLocation(null);
    setSubmittedId(id);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr,420px] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-200">Live package desk</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-50 sm:text-3xl">Track Package</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
              Enter a shipment ID to see the route, driver details, live location, and checkpoint history.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-2 sm:grid-cols-[1fr,auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-600" />
              <input
                type="text"
                placeholder="IST-K7X2M9PQ"
                value={input}
                onChange={(event) => setInput(event.target.value.toUpperCase())}
                className="w-full rounded-md border border-white/[0.08] bg-black/25 py-3 pl-10 pr-3 font-mono text-sm font-black text-stone-100 outline-none transition placeholder:text-stone-700 focus:border-teal-400/40 focus:ring-2 focus:ring-teal-400/10"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex items-center justify-center gap-2 rounded-md bg-amber-300 px-5 py-3 text-sm font-black text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Navigation className="h-4 w-4" />
              Track
            </button>
          </form>
        </div>
      </section>

      {!submittedId && (
        <div className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-teal-400/20 bg-teal-400/10">
              <Package className="h-4 w-4 text-teal-200" />
            </div>
            <div>
              <p className="text-sm font-black text-stone-100">Use the tracking ID from your sender</p>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                It usually looks like <span className="font-mono font-black text-stone-300">IST-XXXXXXXX</span>. Paste it above to open the delivery file.
              </p>
            </div>
          </div>
        </div>
      )}

      {isLoading && submittedId && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-white/[0.07] bg-[#0d1412] py-16">
          <Loader2 className="h-6 w-6 animate-spin text-teal-200" />
          <p className="text-sm font-bold text-stone-500">Looking up {submittedId}...</p>
        </div>
      )}

      {isError && !isLoading && submittedId && (
        <div className="rounded-md border border-rose-400/20 bg-rose-400/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-200" />
            <div>
              <p className="text-sm font-black text-rose-100">Shipment not found</p>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                No shipment matches <span className="font-mono font-black text-stone-300">{submittedId}</span>. Check the ID and try again.
              </p>
              <button
                onClick={() => {
                  setInput("");
                  setSubmittedId(null);
                }}
                className="mt-3 text-xs font-black text-rose-100 underline-offset-4 hover:underline"
              >
                Clear search
              </button>
            </div>
          </div>
        </div>
      )}

      {info && !isLoading && <TrackingResult info={info} driverLocation={driverLocation} connected={connected} />}
    </div>
  );
}
