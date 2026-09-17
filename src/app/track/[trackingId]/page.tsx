"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Bike,
  Box,
  Car,
  CheckCircle2,
  Circle,
  Clock3,
  Copy,
  Loader2,
  MapPin,
  Navigation,
  PackageCheck,
  Radio,
  Route,
  Search,
  ShieldCheck,
  Star,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { useSocket, type LocationUpdate } from "@/hooks/use-socket";
import { useTracking, type TrackingInfo } from "@/hooks/use-tracking";
import { cn } from "@/lib/utils";

const STATUS_META: Record<
  string,
  {
    label: string;
    detail: string;
    color: string;
    bg: string;
    dot: string;
    icon: LucideIcon;
  }
> = {
  pending: {
    label: "Queued",
    detail: "Shipment has been created and is waiting for dispatch.",
    color: "text-amber-300",
    bg: "border-amber-400/25 bg-amber-400/10",
    dot: "bg-amber-300",
    icon: Clock3,
  },
  assigned: {
    label: "Driver assigned",
    detail: "A driver is attached and preparing for pickup.",
    color: "text-sky-300",
    bg: "border-sky-400/25 bg-sky-400/10",
    dot: "bg-sky-300",
    icon: ShieldCheck,
  },
  picked_up: {
    label: "Picked up",
    detail: "Your package has left the pickup point.",
    color: "text-teal-300",
    bg: "border-teal-400/25 bg-teal-400/10",
    dot: "bg-teal-300",
    icon: PackageCheck,
  },
  in_transit: {
    label: "In transit",
    detail: "The driver is moving toward the delivery area.",
    color: "text-teal-300",
    bg: "border-teal-400/25 bg-teal-400/10",
    dot: "bg-teal-300",
    icon: Route,
  },
  out_for_delivery: {
    label: "Out for delivery",
    detail: "The driver is nearby and completing the final handoff.",
    color: "text-teal-300",
    bg: "border-teal-400/25 bg-teal-400/10",
    dot: "bg-teal-300",
    icon: Navigation,
  },
  delivered: {
    label: "Delivered",
    detail: "Delivery has been completed and recorded.",
    color: "text-emerald-300",
    bg: "border-emerald-400/25 bg-emerald-400/10",
    dot: "bg-emerald-300",
    icon: CheckCircle2,
  },
  failed: {
    label: "Action needed",
    detail: "This delivery attempt was not successful.",
    color: "text-rose-300",
    bg: "border-rose-400/25 bg-rose-400/10",
    dot: "bg-rose-300",
    icon: AlertTriangle,
  },
  cancelled: {
    label: "Cancelled",
    detail: "This shipment is no longer active.",
    color: "text-stone-400",
    bg: "border-stone-500/25 bg-stone-500/10",
    dot: "bg-stone-400",
    icon: AlertTriangle,
  },
};

const TIMELINE_STEPS = [
  { status: "pending", label: "Order placed", sub: "Shipment registered" },
  { status: "assigned", label: "Driver assigned", sub: "Driver accepted the job" },
  { status: "picked_up", label: "Package picked up", sub: "Collected from origin" },
  { status: "in_transit", label: "In transit", sub: "Moving through route" },
  { status: "out_for_delivery", label: "Out for delivery", sub: "Final handoff in progress" },
  { status: "delivered", label: "Delivered", sub: "Package received" },
];

const STATUS_ORDER = TIMELINE_STEPS.map((step) => step.status);

const DEMO_TRACKING_INFO: TrackingInfo = {
  trackingId: "IST-K7X2M9PQ",
  status: "out_for_delivery",
  description: "Document parcel",
  pickupAddress: {
    street: "14 Admiralty Way",
    city: "Lekki",
    state: "Lagos",
  },
  deliveryAddress: {
    street: "5 Bourdillon Road",
    city: "Ikoyi",
    state: "Lagos",
  },
  currentLocation: { lat: 6.4499, lng: 3.4723 },
  scheduledPickup: "2026-09-17T09:00:00Z",
  estimatedDelivery: "2026-09-17T12:15:00Z",
  actualDelivery: null,
  events: [
    {
      id: "demo-1",
      status: "pending",
      message: "Shipment request received.",
      createdAt: "2026-09-17T09:00:00Z",
    },
    {
      id: "demo-2",
      status: "assigned",
      message: "Babatunde Adeleke accepted the delivery.",
      createdAt: "2026-09-17T09:14:00Z",
    },
    {
      id: "demo-3",
      status: "picked_up",
      message: "Package collected from pickup.",
      createdAt: "2026-09-17T10:02:00Z",
    },
    {
      id: "demo-4",
      status: "in_transit",
      message: "Driver entered the delivery route.",
      createdAt: "2026-09-17T10:31:00Z",
    },
    {
      id: "demo-5",
      status: "out_for_delivery",
      message: "Driver is approaching the recipient area.",
      createdAt: "2026-09-17T10:48:00Z",
    },
  ],
  driver: {
    name: "Babatunde Adeleke",
    vehicleType: "motorcycle",
    vehiclePlate: "LAG-278-AB",
    rating: 4.8,
    currentLocation: { lat: 6.4499, lng: 3.4723 },
  },
};

function getStatusMeta(status: string) {
  return STATUS_META[status] ?? STATUS_META.pending!;
}

function isLiveStatus(status: string | undefined) {
  return status === "picked_up" || status === "in_transit" || status === "out_for_delivery";
}

function formatDateTime(value: string | number | null | undefined) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function deriveTimeline(info: TrackingInfo) {
  const currentIndex = Math.max(STATUS_ORDER.indexOf(info.status), 0);
  const inactive = info.status === "failed" || info.status === "cancelled";

  return TIMELINE_STEPS.map((step, index) => {
    const event = info.events?.find((item) => item.status === step.status);
    const state =
      inactive || index > currentIndex
        ? "pending"
        : index === currentIndex
          ? "current"
          : "done";

    return {
      ...step,
      state,
      message: event?.message ?? step.sub,
      time: event?.createdAt ? formatDateTime(event.createdAt) : null,
    };
  });
}

function VehicleIcon({ type, className }: { type: string; className?: string }) {
  if (type === "truck") return <Truck className={className} />;
  if (type === "bike" || type === "motorcycle") return <Bike className={className} />;
  return <Car className={className} />;
}

function TrackingSearch({ current }: { current: string }) {
  const router = useRouter();
  const [value, setValue] = useState(current);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const id = value.trim().toUpperCase();
    if (id) router.push(`/track/${id}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-md border border-stone-800 bg-[#0d1412] p-3 shadow-[0_20px_80px_rgba(0,0,0,0.35)] sm:grid-cols-[1fr_auto]"
    >
      <label className="relative block">
        <span className="sr-only">Tracking ID</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-300" />
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value.toUpperCase())}
          placeholder="IST-K7X2M9PQ"
          className="h-12 w-full rounded-md border border-stone-800 bg-black/40 pl-10 pr-3 font-mono text-sm font-bold tracking-wider text-stone-100 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/15"
        />
      </label>
      <button
        type="submit"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-amber-400 px-5 text-sm font-black text-stone-950 transition hover:bg-amber-300 active:scale-[0.98]"
      >
        Track shipment
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}

function StatusManifest({ info }: { info: TrackingInfo }) {
  const meta = getStatusMeta(info.status);
  const Icon = meta.icon;

  return (
    <section className="rounded-md border border-stone-800 bg-[#f2eadb] text-stone-950 shadow-[0_22px_90px_rgba(0,0,0,0.28)]">
      <div className="border-b border-stone-300/80 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-teal-700">
              Delivery status
            </p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-stone-950 sm:text-5xl">
              {meta.label}
            </h1>
            <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-stone-600">
              {meta.detail}
            </p>
          </div>
          <div className={cn("rounded-md border px-4 py-3", meta.bg)}>
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
              <Icon className={cn("h-5 w-5", meta.color)} />
              <span className={cn("text-xs font-black uppercase tracking-[0.16em]", meta.color)}>
                {isLiveStatus(info.status) ? "Live tracking" : "Recorded"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <ManifestStat label="Tracking ID" value={info.trackingId} mono />
          <ManifestStat
            label={info.actualDelivery ? "Delivered" : "Estimated arrival"}
            value={formatDateTime(info.actualDelivery ?? info.estimatedDelivery)}
          />
          <ManifestStat label="Package" value={info.description || "General shipment"} />
        </div>
      </div>

      <div className="grid gap-0 sm:grid-cols-2">
        <AddressBlock
          icon={Box}
          eyebrow="Pickup"
          title={`${info.pickupAddress.city}, ${info.pickupAddress.state}`}
          body={info.pickupAddress.street}
        />
        <AddressBlock
          icon={MapPin}
          eyebrow="Drop-off"
          title={`${info.deliveryAddress.city}, ${info.deliveryAddress.state}`}
          body={info.deliveryAddress.street}
        />
      </div>
    </section>
  );
}

function ManifestStat({
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
      <p
        className={cn(
          "mt-1 truncate text-sm font-black text-stone-950",
          mono && "font-mono tracking-wider",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function AddressBlock({
  icon: Icon,
  eyebrow,
  title,
  body,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="border-t border-stone-300/80 p-5 sm:p-6 sm:[&+&]:border-l">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-stone-300 bg-white/55">
          <Icon className="h-4 w-4 text-teal-700" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
            {eyebrow}
          </p>
          <p className="mt-1 font-black text-stone-950">{title}</p>
          <p className="mt-1 text-sm leading-5 text-stone-600">{body}</p>
        </div>
      </div>
    </div>
  );
}

function LiveMapPanel({ driverLocation }: { driverLocation: LocationUpdate | null }) {
  return (
    <section className="overflow-hidden rounded-md border border-teal-400/20 bg-[#0c1110]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="motion-live-dot h-2 w-2 rounded-full bg-teal-300 text-teal-300" />
          <Radio className="h-4 w-4 text-teal-300" />
          <p className="text-sm font-black text-stone-100">Live driver position</p>
        </div>
        <p className="text-xs font-semibold text-stone-500">
          {driverLocation ? `Updated ${formatDateTime(driverLocation.timestamp)}` : "Awaiting signal"}
        </p>
      </div>
      <RouteSignalMap driverLocation={driverLocation} />
    </section>
  );
}

function RouteSignalMap({ driverLocation }: { driverLocation: LocationUpdate | null }) {
  return (
    <div className="relative h-[360px] overflow-hidden bg-[#08100f] sm:h-[440px]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.08)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(20,184,166,0.18),transparent_30%),radial-gradient(circle_at_22%_76%,rgba(245,158,11,0.12),transparent_28%)]" />
      <svg
        viewBox="0 0 720 420"
        className="absolute inset-0 h-full w-full"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M72 312C168 252 214 342 306 250C374 182 424 192 489 129C539 81 592 87 650 52"
          stroke="rgba(20,184,166,0.18)"
          strokeWidth="42"
          strokeLinecap="round"
        />
        <path
          d="M72 312C168 252 214 342 306 250C374 182 424 192 489 129C539 81 592 87 650 52"
          stroke="#14b8a6"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray="1 26"
        />
        <path
          d="M72 312C168 252 214 342 306 250C374 182 424 192 489 129C539 81 592 87 650 52"
          stroke="#f59e0b"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="18 24"
          className="motion-progress"
        />
      </svg>

      <MapNode className="left-[9%] top-[68%]" label="Lekki" tone="amber" />
      <MapNode className="left-[42%] top-[50%]" label="Driver" live />
      <MapNode className="right-[8%] top-[13%]" label="Ikoyi" />

      <div className="absolute left-4 top-4 rounded-md border border-white/10 bg-black/35 px-3 py-2 backdrop-blur">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">
          Route signal
        </p>
        <p className="mt-1 text-sm font-black text-stone-100">Lekki to Ikoyi</p>
      </div>

      <div className="absolute bottom-4 right-4 rounded-md border border-white/10 bg-black/35 px-3 py-2 text-right backdrop-blur">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">
          Coordinates
        </p>
        <p className="mt-1 font-mono text-xs font-black text-teal-200">
          {driverLocation
            ? `${driverLocation.lat.toFixed(4)}, ${driverLocation.lng.toFixed(4)}`
            : "Awaiting ping"}
        </p>
      </div>
    </div>
  );
}

function MapNode({
  className,
  label,
  live,
  tone = "teal",
}: {
  className: string;
  label: string;
  live?: boolean;
  tone?: "teal" | "amber";
}) {
  return (
    <div className={cn("absolute -translate-x-1/2 -translate-y-1/2", className)}>
      <div
        className={cn(
          "relative flex h-12 w-12 items-center justify-center rounded-full border bg-[#07100f]",
          tone === "amber" ? "border-amber-300 text-amber-300" : "border-teal-300 text-teal-300",
        )}
      >
        {live && <span className="motion-live-dot absolute inset-0 rounded-full bg-teal-300/25 text-teal-300" />}
        {live ? <Navigation className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
      </div>
      <p className="mt-2 rounded-md border border-white/10 bg-black/45 px-2 py-1 text-center text-xs font-black text-stone-100 backdrop-blur">
        {label}
      </p>
    </div>
  );
}

function DriverPanel({ driver }: { driver: NonNullable<TrackingInfo["driver"]> }) {
  return (
    <section className="rounded-md border border-stone-800 bg-[#0d1412] p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-300">
        Assigned driver
      </p>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-teal-400/20 bg-teal-400/10">
          <VehicleIcon type={driver.vehicleType} className="h-7 w-7 text-teal-200" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-black text-stone-100">{driver.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-stone-500">
            <span className="flex items-center gap-1 text-amber-300">
              <Star className="h-4 w-4 fill-amber-300" />
              {driver.rating.toFixed(1)}
            </span>
            <span className="text-stone-700">/</span>
            <span className="capitalize">{driver.vehicleType}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-md border border-white/10 bg-black/25 px-3 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-600">
          Vehicle plate
        </p>
        <p className="mt-1 font-mono text-sm font-black tracking-wider text-stone-100">
          {driver.vehiclePlate}
        </p>
      </div>
    </section>
  );
}

function TimelinePanel({ info }: { info: TrackingInfo }) {
  const timeline = deriveTimeline(info);
  const stopped = info.status === "failed" || info.status === "cancelled";

  return (
    <section className="rounded-md border border-stone-800 bg-[#0d1412] p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">
        Shipment log
      </p>

      {stopped && (
        <div className="mt-4 rounded-md border border-rose-400/20 bg-rose-400/10 p-3 text-sm font-semibold text-rose-200">
          This shipment is not currently moving. Please contact the sender for the next step.
        </div>
      )}

      <ol className="mt-5 space-y-0">
        {timeline.map((item, index) => {
          const last = index === timeline.length - 1;
          return (
            <li key={item.status} className="grid grid-cols-[24px_1fr] gap-3">
              <div className="flex flex-col items-center">
                {item.state === "done" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                ) : item.state === "current" ? (
                  <span className="motion-live-dot flex h-5 w-5 rounded-full border-2 border-teal-300 bg-teal-300/15 text-teal-300" />
                ) : (
                  <Circle className="h-5 w-5 text-stone-700" />
                )}
                {!last && (
                  <span
                    className={cn(
                      "my-1 h-12 w-px",
                      item.state === "done" ? "bg-emerald-300/35" : "bg-stone-800",
                    )}
                  />
                )}
              </div>
              <div className={cn("pb-5", last && "pb-0")}>
                <div className="flex items-start justify-between gap-3">
                  <p
                    className={cn(
                      "font-black",
                      item.state === "pending" ? "text-stone-600" : "text-stone-100",
                    )}
                  >
                    {item.label}
                  </p>
                  {item.time && (
                    <p className="shrink-0 text-right text-xs font-semibold text-stone-500">
                      {item.time}
                    </p>
                  )}
                </div>
                <p
                  className={cn(
                    "mt-1 text-sm",
                    item.state === "pending" ? "text-stone-700" : "text-stone-500",
                  )}
                >
                  {item.message}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="rounded-md border border-stone-800 bg-[#0d1412] px-6 py-20 text-center">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-300" />
      <p className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-stone-500">
        Checking shipment record
      </p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="rounded-md border border-rose-400/20 bg-rose-400/10 px-6 py-16 text-center">
      <AlertTriangle className="mx-auto h-10 w-10 text-rose-300" />
      <h2 className="mt-4 text-2xl font-black text-stone-100">Shipment not found</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-400">
        Check the tracking ID from the sender and try again. IsoTrack IDs usually look like
        IST-K7X2M9PQ.
      </p>
    </div>
  );
}

export default function PublicTrackingPage() {
  const params = useParams();
  const trackingId = typeof params.trackingId === "string" ? params.trackingId : "";
  const { data: info, isLoading, isError } = useTracking(trackingId);
  const demoInfo =
    trackingId.toUpperCase() === DEMO_TRACKING_INFO.trackingId
      ? DEMO_TRACKING_INFO
      : null;
  const trackingInfo = info ?? demoInfo;
  const [driverLocation, setDriverLocation] = useState<LocationUpdate | null>(null);

  const active = isLiveStatus(trackingInfo?.status);

  useEffect(() => {
    if (trackingInfo?.driver?.currentLocation) {
      setDriverLocation({
        lat: trackingInfo.driver.currentLocation.lat,
        lng: trackingInfo.driver.currentLocation.lng,
        heading: 0,
        speed: 0,
        timestamp: Date.now(),
      });
    }
  }, [trackingInfo?.driver?.currentLocation]);

  useSocket({
    trackingId: active ? trackingId : null,
    onLocation: (update) => setDriverLocation(update),
  });

  return (
    <div className="min-h-screen bg-[#070907] text-stone-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070907]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Logo href="/" size={42} tone="light" />
          <Link
            href="/"
            className="rounded-md border border-white/10 px-3 py-2 text-sm font-bold text-stone-300 transition hover:border-teal-300/40 hover:text-teal-100"
          >
            Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <section className="mb-6 grid gap-5 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-teal-300">
              Public shipment tracking
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight text-stone-100 sm:text-5xl">
              Follow the package from dispatch to doorstep.
            </h1>
          </div>
          <TrackingSearch current={trackingId} />
        </section>

        {isLoading && !trackingInfo && <LoadingState />}
        {isError && !isLoading && !trackingInfo && <ErrorState />}

        {trackingInfo && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
            <div className="space-y-5">
              <StatusManifest info={trackingInfo} />
              {active && <LiveMapPanel driverLocation={driverLocation} />}
            </div>

            <aside className="space-y-5">
              {trackingInfo.driver && <DriverPanel driver={trackingInfo.driver} />}
              <TimelinePanel info={trackingInfo} />
              <div className="rounded-md border border-stone-800 bg-black/25 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-stone-300">
                  <Copy className="h-4 w-4 text-amber-300" />
                  Share this tracking ID
                </div>
                <p className="mt-2 font-mono text-sm font-black tracking-wider text-teal-200">
                  {trackingInfo.trackingId}
                </p>
                <p className="mt-2 text-xs leading-5 text-stone-600">
                  Updates refresh every 15 seconds while the delivery is active.
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
