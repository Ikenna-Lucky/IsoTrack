"use client";

import { useState } from "react";
import {
  Search,
  ChevronDown,
  MapPin,
  Star,
  Phone,
  Package,
  Clock,
  Calendar,
  ArrowRight,
} from "lucide-react";
import {
  CUSTOMER_SHIPMENTS,
  STATUS_META,
  formatNaira,
  type ShipmentStatus,
} from "@/lib/mock/customer";
import { cn } from "@/lib/utils";

const FILTERS: { label: string; value: ShipmentStatus | "all" }[] = [
  { label: "All",       value: "all"              },
  { label: "Active",    value: "out_for_delivery" },
  { label: "Pending",   value: "pending"          },
  { label: "Delivered", value: "delivered"        },
  { label: "Failed",    value: "failed"           },
];

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
          "relative z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full border text-[7px] font-bold",
          state === "done"
            ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
            : state === "current"
            ? "border-violet-500 bg-violet-500/20 text-violet-400 animate-pulse"
            : "border-zinc-800 bg-zinc-900 text-zinc-700",
        )}>
          {state === "done" ? "✓" : state === "current" ? "●" : ""}
        </div>
        {!isLast && (
          <div className={cn("w-px flex-1 mt-1", state === "done" ? "bg-emerald-500/20" : "bg-zinc-800")} style={{ minHeight: 20 }} />
        )}
      </div>
      <div className="pb-3 min-w-0">
        <p className={cn(
          "text-[11px] font-semibold leading-tight",
          state === "done" ? "text-zinc-300" : state === "current" ? "text-violet-300" : "text-zinc-700",
        )}>{label}</p>
        <p className="mt-0.5 text-[10px] text-zinc-600">{sub}</p>
        <p className={cn(
          "mt-0.5 text-[10px] font-medium",
          state === "done" ? "text-emerald-500/60" : state === "current" ? "text-violet-400/70" : "text-zinc-800",
        )}>{time}</p>
      </div>
    </div>
  );
}

export default function CustomerShipmentsPage() {
  const [filter,   setFilter]   = useState<ShipmentStatus | "all">("all");
  const [search,   setSearch]   = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = CUSTOMER_SHIPMENTS.filter((s) => {
    const matchFilter = filter === "all" || s.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.trackingId.toLowerCase().includes(q) ||
      s.pickup.city.toLowerCase().includes(q) ||
      s.delivery.city.toLowerCase().includes(q) ||
      s.packageType.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">My Shipments</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{CUSTOMER_SHIPMENTS.length} shipments total</p>
        </div>
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 pointer-events-none" />
          <input
            type="text"
            placeholder="Search ID, city, type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] pl-9 pr-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/[0.1] transition-all"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-0 border-b border-white/[0.05] overflow-x-auto">
        {FILTERS.map(({ label, value }) => {
          const count = value === "all"
            ? CUSTOMER_SHIPMENTS.length
            : CUSTOMER_SHIPMENTS.filter((s) => s.status === value).length;
          const active = filter === value;
          return (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-medium border-b-2 transition-all whitespace-nowrap shrink-0",
                active
                  ? "border-violet-400 text-violet-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-200 hover:border-white/[0.15]",
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

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <Package className="h-5 w-5 text-zinc-700" />
          </div>
          <p className="text-sm font-medium text-zinc-400">No shipments found</p>
          <p className="text-xs text-zinc-600">
            {search ? "Try a different search term" : "No shipments match this filter"}
          </p>
        </div>
      ) : (
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
                {/* Row */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : s.id)}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-white/[0.015] transition-colors group"
                >
                  <div
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: meta.dot, boxShadow: `0 0 6px ${meta.dot}80` }}
                  />
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.02]">
                    <Package className="h-3.5 w-3.5 text-zinc-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs font-bold text-zinc-200">{s.trackingId}</span>
                      {isLive && (
                        <span className="animate-pulse rounded-full border border-violet-500/20 bg-violet-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-400">
                          Live
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate">
                      {s.pickup.city}<span className="text-zinc-700"> → </span>{s.delivery.city}{" · "}{s.packageType}
                    </p>
                  </div>
                  <div className="shrink-0 text-right mr-1">
                    <p className="text-sm font-bold tabular-nums text-zinc-200">{formatNaira(s.amount)}</p>
                    <span className={cn("text-[10px] font-semibold", meta.color)}>{meta.label}</span>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 shrink-0 text-zinc-700 group-hover:text-zinc-500 transition-all duration-200",
                    isExpanded && "rotate-180",
                  )} />
                </button>

                {/* Expanded panel */}
                {isExpanded && (
                  <div className="border-t border-white/[0.05] bg-white/[0.008] p-4 space-y-4">

                    {/* Route + meta */}
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
                              <p className="text-xs font-medium text-zinc-300 truncate">{s.pickup.address}, {s.pickup.city}</p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase tracking-wider text-zinc-700 mb-0.5">To</p>
                              <p className="text-xs font-medium text-zinc-300 truncate">{s.delivery.address}, {s.delivery.city}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {[
                          { icon: Package,  label: "Package Type", value: s.packageType },
                          { icon: Clock,    label: "Amount",       value: formatNaira(s.amount) },
                          {
                            icon: Calendar,
                            label: s.deliveredAt ? "Delivered" : "Created",
                            value: new Date(s.deliveredAt ?? s.createdAt).toLocaleDateString("en-NG", {
                              day: "numeric", month: "short", year: "numeric",
                            }),
                          },
                        ].map(({ icon: Icon, label, value }) => (
                          <div key={label} className="flex items-center gap-2.5 rounded-xl border border-white/[0.05] bg-black/20 px-3 py-2.5">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03]">
                              <Icon className="h-3 w-3 text-zinc-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] uppercase tracking-wider text-zinc-700">{label}</p>
                              <p className="text-xs font-semibold text-zinc-300 truncate">{value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3.5">
                      <p className="mb-3 text-[9px] font-semibold uppercase tracking-wider text-zinc-600">Delivery Timeline</p>
                      {s.timeline.map((ev, i) => (
                        <TimelineStep key={i} label={ev.label} sub={ev.sub} time={ev.time} state={ev.state}
                          isLast={i === s.timeline.length - 1} />
                      ))}
                    </div>

                    {/* Driver */}
                    {s.driver && (
                      <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/20 p-3.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500/20 to-sky-500/20 border border-teal-500/20 text-[11px] font-bold text-teal-300">
                          {s.driver.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-zinc-200 truncate">{s.driver.name}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-0.5">
                            <Star className="h-2.5 w-2.5 text-amber-400" />
                            {s.driver.rating}
                            <span className="text-zinc-700">·</span>
                            {s.driver.vehicle}
                            <span className="text-zinc-700">·</span>
                            <span className="font-mono">{s.driver.plate}</span>
                          </div>
                        </div>
                        <a
                          href={`tel:${s.driver.phone}`}
                          className="flex items-center gap-1.5 rounded-xl border border-teal-500/20 bg-teal-500/[0.08] px-3 py-2 text-xs font-semibold text-teal-400 hover:bg-teal-500/[0.15] transition-all shrink-0"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          Call
                        </a>
                      </div>
                    )}

                    {/* Live CTA */}
                    {isLive && (
                      <a
                        href="/customer/track"
                        className="flex items-center justify-center gap-2 rounded-xl border border-violet-500/25 bg-violet-500/[0.08] py-2.5 text-sm font-semibold text-violet-400 hover:bg-violet-500/[0.15] transition-all"
                      >
                        <MapPin className="h-4 w-4" />
                        View live map
                        <ArrowRight className="h-3.5 w-3.5" />
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
