"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Search, MapPin, Phone, Star, Clock, AlertCircle, CheckCircle2, Package, Wifi, WifiOff } from "lucide-react";
import {
  CUSTOMER_SHIPMENTS,
  STATUS_META,
  formatNaira,
} from "@/lib/mock/customer";
import { useSocket, type LocationUpdate } from "@/hooks/use-socket";
import { cn } from "@/lib/utils";

const LiveMap = dynamic(
  () => import("@/components/map/live-map").then((m) => m.LiveMap),
  { ssr: false, loading: () => <div className="h-64 w-full animate-pulse rounded-xl bg-zinc-800/60" /> }
);

export default function CustomerTrackPage() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [liveLocation, setLiveLocation] = useState<LocationUpdate | null>(null);

  const result = CUSTOMER_SHIPMENTS.find(
    (s) => s.trackingId.toLowerCase() === query.trim().toLowerCase(),
  ) ?? null;

  const isActive = result?.status === "out_for_delivery";

  const { connected } = useSocket({
    trackingId: searched && isActive ? result!.trackingId : null,
    onLocation: (update) => setLiveLocation(update),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLiveLocation(null);
    if (query.trim()) setSearched(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">Track a Package</h2>
        <p className="text-xs text-zinc-500">Enter a tracking ID to see live status</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="e.g. IST-K7X2M9PQ"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearched(false); setLiveLocation(null); }}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-9 pr-4 font-mono text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-teal-500/40 focus:ring-0"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-500"
        >
          Track
        </button>
      </form>

      <div>
        <p className="mb-2 text-[10px] uppercase tracking-wider text-zinc-600">Your shipments</p>
        <div className="flex flex-wrap gap-2">
          {CUSTOMER_SHIPMENTS.map((s) => {
            const meta = STATUS_META[s.status];
            return (
              <button
                key={s.id}
                onClick={() => { setQuery(s.trackingId); setSearched(false); setLiveLocation(null); }}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-400 hover:border-teal-500/30 hover:text-zinc-200 transition-all"
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.dot }} />
                <span className="font-mono">{s.trackingId}</span>
              </button>
            );
          })}
        </div>
      </div>

      {searched && !result && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-4 py-3">
          <AlertCircle size={15} className="text-rose-400 shrink-0" />
          <p className="text-sm text-rose-300">
            No shipment found for <span className="font-mono font-semibold">"{query}"</span>. Check the ID and try again.
          </p>
        </div>
      )}

      {searched && result && (
        <div className="space-y-4">
          {(() => {
            const meta = STATUS_META[result.status];
            return (
              <div
                className={cn(
                  "relative overflow-hidden rounded-2xl border p-5",
                  isActive ? "border-violet-500/25 bg-violet-500/[0.04]" : "border-white/[0.08] bg-white/[0.02]",
                )}
              >
                {isActive && (
                  <div className="pointer-events-none absolute -top-8 right-1/3 h-28 w-52 rounded-full bg-violet-500/10 blur-3xl" />
                )}

                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-zinc-200">{result.trackingId}</span>
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <span className={cn("flex items-center gap-1 text-[10px] font-semibold", connected ? "text-emerald-400" : "text-zinc-500")}>
                        {connected ? <Wifi size={10} /> : <WifiOff size={10} />}
                        {connected ? "Live" : "Connecting…"}
                      </span>
                    )}
                    <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", meta.bg, meta.border, meta.color)}>
                      {meta.label}
                    </span>
                  </div>
                </div>

                <div className="mb-4 flex items-start gap-3">
                  <div className="flex flex-col items-center pt-0.5">
                    <div className="h-2.5 w-2.5 rounded-full border-2 border-teal-400 bg-transparent" />
                    <div className="my-1 h-8 w-px bg-zinc-700" />
                    <MapPin size={11} className="text-rose-400" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-zinc-600">From</p>
                      <p className="text-sm font-medium text-zinc-100">{result.pickup.address}, {result.pickup.city}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-600">To</p>
                      <p className="text-sm font-medium text-zinc-100">{result.delivery.address}, {result.delivery.city}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1 rounded-lg bg-black/25 px-2.5 py-1 text-xs text-zinc-400">
                    <Package size={10} /> {result.packageType}
                  </span>
                  <span className="flex items-center gap-1 rounded-lg bg-black/25 px-2.5 py-1 text-xs text-zinc-400">
                    {formatNaira(result.amount)}
                  </span>
                  {result.driver?.eta && (
                    <span className="flex items-center gap-1 rounded-lg bg-violet-500/15 px-2.5 py-1 text-xs font-semibold text-violet-400">
                      <Clock size={10} /> ETA {result.driver.eta}
                    </span>
                  )}
                </div>
              </div>
            );
          })()}

          {isActive && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-zinc-400">Live Driver Location</p>
                {liveLocation && (
                  <span className="text-[10px] text-zinc-600">
                    Updated {new Date(liveLocation.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                )}
              </div>
              <LiveMap location={liveLocation} className="h-64 border border-white/[0.06]" />
              {!liveLocation && connected && (
                <p className="text-center text-[10px] text-zinc-600">Waiting for driver location…</p>
              )}
            </div>
          )}

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
            <h3 className="mb-4 text-sm font-semibold text-zinc-200">Delivery Timeline</h3>
            <ol className="relative space-y-4 pl-5">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-zinc-800" />
              {result.timeline.map((ev, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className={cn(
                      "absolute left-0 mt-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border text-[8px] font-bold",
                      ev.state === "done"
                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                        : ev.state === "current"
                        ? "border-violet-500 bg-violet-500/20 text-violet-400 animate-pulse"
                        : "border-zinc-700 bg-transparent text-zinc-700",
                    )}
                  >
                    {ev.state === "done" ? "✓" : ev.state === "current" ? "•" : "○"}
                  </span>
                  <div className="ml-2">
                    <p className={cn("text-sm font-medium", ev.state === "done" ? "text-zinc-200" : ev.state === "current" ? "text-violet-300" : "text-zinc-600")}>
                      {ev.label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-zinc-600">{ev.sub} · {ev.time}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {result.driver && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
              <h3 className="mb-3 text-sm font-semibold text-zinc-200">Your Driver</h3>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-base font-bold text-teal-400">
                  {result.driver.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-zinc-100">{result.driver.name}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                    <Star size={11} className="text-amber-400" />
                    {result.driver.rating} · {result.driver.vehicle} · {result.driver.plate}
                  </div>
                </div>
                <a
                  href={`tel:${result.driver.phone}`}
                  className="flex items-center gap-1.5 rounded-xl border border-teal-500/25 bg-teal-500/10 px-4 py-2 text-sm font-semibold text-teal-400 hover:bg-teal-500/20 transition-colors"
                >
                  <Phone size={13} />
                  Call Driver
                </a>
              </div>
            </div>
          )}

          {result.status === "delivered" && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] px-4 py-3">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-300">Package Delivered!</p>
                <p className="text-xs text-zinc-500">
                  Delivered on {result.deliveredAt ? new Date(result.deliveredAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "—"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
