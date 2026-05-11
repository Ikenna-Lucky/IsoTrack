"use client";

import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Phone,
  Package,
  CheckCircle2,
  Clock,
  TrendingUp,
  Star,
  Navigation,
  ChevronRight,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  CURRENT_DRIVER,
  MOCK_DELIVERIES,
  DAILY_EARNINGS,
  STATUS_META,
  formatNaira,
} from "@/lib/mock/driver";
import { useSocket } from "@/hooks/use-socket";

const activeDelivery = MOCK_DELIVERIES.find((d) => d.status === "out_for_delivery")!;
const todayDeliveries = MOCK_DELIVERIES.filter((d) => d.status === "delivered").slice(0, 3);
const todayEarnings = DAILY_EARNINGS[DAILY_EARNINGS.length - 1];
const maxEarning = Math.max(...DAILY_EARNINGS.map((d) => d.earning));

const ROUTE_WAYPOINTS = [
  { lat: 6.4355, lng: 3.4197 },
  { lat: 6.4398, lng: 3.4289 },
  { lat: 6.4441, lng: 3.4312 },
  { lat: 6.4478, lng: 3.4389 },
  { lat: 6.4512, lng: 3.4401 },
];

export default function DriverOverviewPage() {
  const [statusOnline, setStatusOnline] = useState(true);
  const [waypointIndex, setWaypointIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { connected, emitLocation } = useSocket({
    trackingId: activeDelivery?.trackingId ?? null,
  });

  useEffect(() => {
    if (!activeDelivery || !statusOnline) return;

    intervalRef.current = setInterval(() => {
      setWaypointIndex((prev) => {
        const next = (prev + 1) % ROUTE_WAYPOINTS.length;
        const wp = ROUTE_WAYPOINTS[next]!;
        emitLocation({
          trackingId: activeDelivery.trackingId,
          lat: wp.lat + (Math.random() - 0.5) * 0.0008,
          lng: wp.lng + (Math.random() - 0.5) * 0.0008,
          heading: Math.random() * 360,
          speed: 18 + Math.random() * 12,
        });
        return next;
      });
    }, 4000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [statusOnline, emitLocation]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">
            Good morning, {CURRENT_DRIVER.name.split(" ")[0]} 👋
          </h2>
          <p className="text-sm text-zinc-500">
            {new Date().toLocaleDateString("en-NG", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <button
          onClick={() => setStatusOnline((v) => !v)}
          className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
            statusOnline
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-zinc-700 bg-zinc-800/50 text-zinc-400"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${statusOnline ? "animate-pulse bg-emerald-400" : "bg-zinc-600"}`} />
          {statusOnline ? "Online" : "Offline"}
        </button>
      </div>

      {activeDelivery && (
        <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] p-5">
          <div className="pointer-events-none absolute -top-10 left-1/4 h-32 w-64 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                Active Delivery
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1 text-[10px] font-medium ${connected ? "text-emerald-400" : "text-zinc-600"}`}>
                {connected ? <Wifi size={10} /> : <WifiOff size={10} />}
                {connected ? "Live" : "Offline"}
              </span>
              <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs font-medium text-violet-300">
                {activeDelivery.trackingId}
              </span>
            </div>
          </div>

          <div className="mb-4 flex items-start gap-3">
            <div className="flex flex-col items-center pt-1">
              <div className="h-2.5 w-2.5 rounded-full border-2 border-teal-400 bg-transparent" />
              <div className="my-1 h-8 w-px bg-zinc-700" />
              <MapPin size={12} className="text-violet-400" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs text-zinc-500">Pickup</p>
                <p className="text-sm font-medium text-zinc-100">
                  {activeDelivery.pickup.address}, {activeDelivery.pickup.city}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Delivery</p>
                <p className="text-sm font-medium text-zinc-100">
                  {activeDelivery.delivery.address}, {activeDelivery.delivery.city}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.06] bg-black/20 p-3">
            <div className="flex-1">
              <p className="text-xs text-zinc-500">Customer</p>
              <p className="text-sm font-medium text-zinc-200">{activeDelivery.customer.name}</p>
            </div>
            <a
              href={`tel:${activeDelivery.customer.phone}`}
              className="flex items-center gap-1.5 rounded-lg border border-teal-500/20 bg-teal-500/10 px-3 py-1.5 text-xs font-medium text-teal-400 transition-colors hover:bg-teal-500/20"
            >
              <Phone size={12} />
              Call
            </a>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Clock size={12} className="text-violet-400" />
              ETA {activeDelivery.eta}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Navigation size={12} className="text-zinc-500" />
              {activeDelivery.distance}
            </div>
          </div>

          {statusOnline && (
            <p className="mt-3 text-center text-[10px] text-zinc-600">
              Broadcasting location every 4s — customers can see you on the map
            </p>
          )}

          <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500">
            <CheckCircle2 size={16} />
            Mark as Delivered
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Today's Earnings", value: formatNaira(todayEarnings?.earning ?? 0), icon: TrendingUp, color: "text-emerald-400" },
          { label: "Deliveries Today", value: String(todayEarnings?.deliveries ?? 0), icon: Package, color: "text-sky-400" },
          { label: "Total Deliveries", value: String(CURRENT_DRIVER.totalDeliveries), icon: CheckCircle2, color: "text-teal-400" },
          { label: "Rating", value: `★ ${CURRENT_DRIVER.rating}`, icon: Star, color: "text-amber-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <Icon size={16} className={`mb-2 ${color}`} />
            <p className="text-lg font-bold text-zinc-100">{value}</p>
            <p className="text-xs text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
          <h3 className="mb-4 text-sm font-semibold text-zinc-200">Weekly Earnings</h3>
          <div className="flex items-end gap-2 h-28">
            {DAILY_EARNINGS.map(({ day, earning }) => {
              const pct = (earning / maxEarning) * 100;
              const isToday = day === "Sun";
              return (
                <div key={day} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full flex-col justify-end" style={{ height: "88px" }}>
                    <div
                      className={`w-full rounded-t transition-all ${isToday ? "bg-teal-500" : "bg-zinc-700/60"}`}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-600">{day}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
            <span>This week</span>
            <span className="font-semibold text-emerald-400">
              {formatNaira(DAILY_EARNINGS.reduce((s, d) => s + d.earning, 0))}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200">Recent Deliveries</h3>
            <a href="/driver/deliveries" className="flex items-center gap-0.5 text-xs text-teal-400 hover:text-teal-300">
              View all <ChevronRight size={12} />
            </a>
          </div>
          <ul className="space-y-3">
            {todayDeliveries.map((d) => {
              const meta = STATUS_META[d.status];
              return (
                <li key={d.id} className="flex items-center gap-3">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: meta.dot }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-zinc-300">{d.trackingId}</p>
                    <p className="truncate text-[10px] text-zinc-600">{d.customer.name}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-emerald-400">
                    +{formatNaira(d.driverEarning)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
