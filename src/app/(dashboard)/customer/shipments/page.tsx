"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Star, Phone } from "lucide-react";
import {
  CUSTOMER_SHIPMENTS,
  STATUS_META,
  formatNaira,
  type ShipmentStatus,
} from "@/lib/mock/customer";
import { cn } from "@/lib/utils";

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const FILTERS: { label: string; value: ShipmentStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "out_for_delivery" },
  { label: "Pending", value: "pending" },
  { label: "Delivered", value: "delivered" },
  { label: "Failed", value: "failed" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerShipmentsPage() {
  const [filter, setFilter] = useState<ShipmentStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = CUSTOMER_SHIPMENTS.filter((s) => {
    const matchFilter = filter === "all" || s.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.trackingId.toLowerCase().includes(q) ||
      s.pickup.city.toLowerCase().includes(q) ||
      s.delivery.city.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">My Shipments</h2>
          <p className="text-xs text-zinc-500">{CUSTOMER_SHIPMENTS.length} shipments total</p>
        </div>
        <input
          type="text"
          placeholder="Search by ID or city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-teal-500/40 sm:w-56"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.03] p-1">
        {FILTERS.map(({ label, value }) => {
          const count =
            value === "all"
              ? CUSTOMER_SHIPMENTS.length
              : CUSTOMER_SHIPMENTS.filter((s) => s.status === value).length;
          return (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                filter === value ? "bg-teal-500/15 text-teal-400" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              {label}
              <span className="rounded-full bg-zinc-800 px-1.5 text-[10px] text-zinc-400">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Shipment cards */}
      <ul className="space-y-3">
        {filtered.length === 0 && (
          <li className="py-12 text-center text-sm text-zinc-600">No shipments found.</li>
        )}
        {filtered.map((s) => {
          const meta = STATUS_META[s.status];
          const isOpen = expanded === s.id;
          const isActive = s.status === "out_for_delivery";

          return (
            <li
              key={s.id}
              className={cn(
                "overflow-hidden rounded-xl border transition-all",
                isActive ? "border-violet-500/25 bg-violet-500/[0.04]" : "border-white/[0.06] bg-white/[0.02]",
              )}
            >
              {/* Card header button */}
              <button
                onClick={() => setExpanded(isOpen ? null : s.id)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: meta.dot }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-zinc-300">{s.trackingId}</span>
                    {isActive && (
                      <span className="animate-pulse rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-violet-400">
                        Live
                      </span>
                    )}
                  </div>
                  <p className="truncate text-[10px] text-zinc-500">
                    {s.pickup.city} → {s.delivery.city} · {s.packageType}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-zinc-200">{formatNaira(s.amount)}</p>
                  <p className={cn("text-[10px] font-medium", meta.color)}>{meta.label}</p>
                </div>
                {isOpen ? (
                  <ChevronUp size={14} className="text-zinc-600 shrink-0" />
                ) : (
                  <ChevronDown size={14} className="text-zinc-600 shrink-0" />
                )}
              </button>

              {/* Expanded panel */}
              {isOpen && (
                <div className="border-t border-white/[0.05] px-4 py-4 space-y-4">
                  {/* Route */}
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <div className="h-2 w-2 rounded-full border-2 border-teal-400 bg-transparent" />
                      <div className="my-1 h-8 w-px bg-zinc-700" />
                      <MapPin size={10} className="text-rose-400" />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] text-zinc-600">Pickup</p>
                        <p className="text-xs text-zinc-300">{s.pickup.address}, {s.pickup.city}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-600">Delivery</p>
                        <p className="text-xs text-zinc-300">{s.delivery.address}, {s.delivery.city}</p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                      Tracking Timeline
                    </p>
                    <ol className="relative space-y-2.5 pl-4">
                      <div className="absolute left-[5px] top-1 bottom-1 w-px bg-zinc-800" />
                      {s.timeline.map((ev, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span
                            className={cn(
                              "absolute left-0 mt-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full border text-[7px]",
                              ev.state === "done"
                                ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                                : ev.state === "current"
                                ? "border-violet-500 bg-violet-500/20 text-violet-400"
                                : "border-zinc-700 bg-transparent",
                            )}
                          >
                            {ev.state === "done" ? "✓" : ev.state === "current" ? "·" : ""}
                          </span>
                          <div className="ml-1.5">
                            <p className={cn("text-xs", ev.state === "pending" ? "text-zinc-600" : "text-zinc-300")}>
                              {ev.label}
                            </p>
                            <p className="text-[10px] text-zinc-600">{ev.sub} · {ev.time}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Driver card (if assigned) */}
                  {s.driver && (
                    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/20 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/20 text-xs font-bold text-teal-400">
                        {s.driver.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-200">{s.driver.name}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                          <Star size={9} className="text-amber-400" />
                          {s.driver.rating} · {s.driver.vehicle} · {s.driver.plate}
                        </div>
                      </div>
                      <a
                        href={`tel:${s.driver.phone}`}
                        className="flex items-center gap-1 rounded-lg border border-teal-500/20 bg-teal-500/10 px-2.5 py-1.5 text-xs font-medium text-teal-400"
                      >
                        <Phone size={11} />
                        Call
                      </a>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
