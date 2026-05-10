"use client";

import { useState } from "react";
import { MapPin, Package, Clock, Phone, Navigation } from "lucide-react";
import {
  MOCK_DELIVERIES,
  STATUS_META,
  formatNaira,
  type DeliveryStatus,
} from "@/lib/mock/driver";
import { cn } from "@/lib/utils";

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const FILTERS: { label: string; value: DeliveryStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "out_for_delivery" },
  { label: "Delivered", value: "delivered" },
  { label: "Failed", value: "failed" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DriverDeliveriesPage() {
  const [filter, setFilter] = useState<DeliveryStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = MOCK_DELIVERIES.filter((d) => {
    const matchFilter = filter === "all" || d.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      d.trackingId.toLowerCase().includes(q) ||
      d.customer.name.toLowerCase().includes(q) ||
      d.pickup.city.toLowerCase().includes(q) ||
      d.delivery.city.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">Deliveries</h2>
          <p className="text-xs text-zinc-500">{MOCK_DELIVERIES.length} total assignments</p>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by ID, customer, city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-teal-500/40 focus:ring-0 sm:w-64"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.03] p-1">
        {FILTERS.map(({ label, value }) => {
          const count =
            value === "all"
              ? MOCK_DELIVERIES.length
              : MOCK_DELIVERIES.filter((d) => d.status === value).length;
          return (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                filter === value
                  ? "bg-teal-500/15 text-teal-400"
                  : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              {label}
              <span className="rounded-full bg-zinc-800 px-1.5 text-[10px] text-zinc-400">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Delivery cards */}
      <ul className="space-y-3">
        {filtered.length === 0 && (
          <li className="py-12 text-center text-sm text-zinc-600">No deliveries found.</li>
        )}
        {filtered.map((d) => {
          const meta = STATUS_META[d.status];
          const isExpanded = expanded === d.id;
          const isActive = d.status === "out_for_delivery";

          return (
            <li
              key={d.id}
              className={cn(
                "overflow-hidden rounded-xl border transition-all",
                isActive
                  ? "border-violet-500/25 bg-violet-500/[0.04]"
                  : "border-white/[0.06] bg-white/[0.02]",
              )}
            >
              {/* Card header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : d.id)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
              >
                {/* Status dot */}
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: meta.dot }}
                />

                {/* Route summary */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-zinc-300">
                      {d.trackingId}
                    </span>
                    {isActive && (
                      <span className="animate-pulse rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-violet-400">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="truncate text-[10px] text-zinc-500">
                    {d.pickup.city} → {d.delivery.city} · {d.customer.name}
                  </p>
                </div>

                {/* Earning + status */}
                <div className="shrink-0 text-right">
                  <p className={cn("text-sm font-semibold", d.driverEarning > 0 ? "text-emerald-400" : "text-zinc-600")}>
                    {d.driverEarning > 0 ? `+${formatNaira(d.driverEarning)}` : "₦0"}
                  </p>
                  <span className={cn("text-[10px] font-medium", meta.color)}>
                    {meta.label}
                  </span>
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-white/[0.05] px-4 py-4 space-y-4">
                  {/* Route details */}
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <div className="h-2 w-2 rounded-full border-2 border-teal-400 bg-transparent" />
                      <div className="my-1 h-6 w-px bg-zinc-700" />
                      <MapPin size={10} className="text-rose-400" />
                    </div>
                    <div className="space-y-2.5">
                      <div>
                        <p className="text-[10px] text-zinc-600">Pickup</p>
                        <p className="text-xs text-zinc-300">{d.pickup.address}, {d.pickup.city}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-600">Delivery</p>
                        <p className="text-xs text-zinc-300">{d.delivery.address}, {d.delivery.city}</p>
                      </div>
                    </div>
                  </div>

                  {/* Meta strip */}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { icon: Package, label: "Type", value: d.packageType },
                      { icon: Navigation, label: "Distance", value: d.distance },
                      { icon: Clock, label: d.completedAt ? "Completed" : "Assigned", value: d.completedAt ? new Date(d.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : new Date(d.assignedAt).toLocaleDateString() },
                      { icon: Navigation, label: "Weight", value: d.weight },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="rounded-lg bg-black/20 px-2.5 py-2">
                        <div className="flex items-center gap-1 mb-0.5">
                          <Icon size={10} className="text-zinc-600" />
                          <p className="text-[9px] uppercase tracking-wider text-zinc-600">{label}</p>
                        </div>
                        <p className="text-xs font-medium text-zinc-300">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {d.notes && (
                    <div className="rounded-lg border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2 text-xs text-rose-300">
                      <span className="font-semibold">Note: </span>{d.notes}
                    </div>
                  )}

                  {/* Call button for active */}
                  {isActive && (
                    <a
                      href={`tel:${d.customer.phone}`}
                      className="flex items-center justify-center gap-2 rounded-lg border border-teal-500/25 bg-teal-500/10 py-2 text-xs font-semibold text-teal-400 transition-colors hover:bg-teal-500/20"
                    >
                      <Phone size={13} />
                      Call {d.customer.name}
                    </a>
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
