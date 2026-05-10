"use client";

import Link from "next/link";
import {
  MapPin,
  Phone,
  Clock,
  Package,
  Navigation,
  ChevronRight,
  Plus,
  Star,
} from "lucide-react";
import {
  CURRENT_CUSTOMER,
  CUSTOMER_SHIPMENTS,
  STATUS_META,
  formatNaira,
} from "@/lib/mock/customer";
import { cn } from "@/lib/utils";

// ─── Derived data ─────────────────────────────────────────────────────────────

const active = CUSTOMER_SHIPMENTS.find((s) => s.status === "out_for_delivery");
const pending = CUSTOMER_SHIPMENTS.find((s) => s.status === "pending");
const recent = CUSTOMER_SHIPMENTS.filter(
  (s) => s.status === "delivered" || s.status === "failed",
).slice(0, 3);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">
            Hi, {CURRENT_CUSTOMER.name.split(" ")[0]} 👋
          </h2>
          <p className="text-sm text-zinc-500">Here's what's happening with your packages.</p>
        </div>
        <Link
          href="/customer/track"
          className="flex items-center gap-1.5 rounded-lg border border-teal-500/25 bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-400 hover:bg-teal-500/20 transition-colors"
        >
          <Plus size={13} />
          New Shipment
        </Link>
      </div>

      {/* Active tracking card */}
      {active && (
        <div className="relative overflow-hidden rounded-2xl border border-violet-500/25 bg-violet-500/[0.04] p-5">
          <div className="pointer-events-none absolute -top-8 right-1/4 h-28 w-56 rounded-full bg-violet-500/10 blur-3xl" />

          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                Live Tracking
              </span>
            </div>
            <span className="font-mono text-xs text-zinc-500">{active.trackingId}</span>
          </div>

          {/* Timeline */}
          <ol className="relative mb-4 space-y-3 pl-5">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-zinc-800" />
            {active.timeline.map((event, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className={cn(
                    "absolute left-0 mt-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border text-[8px]",
                    event.state === "done"
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                      : event.state === "current"
                      ? "border-violet-500 bg-violet-500/20 text-violet-400 animate-pulse"
                      : "border-zinc-700 bg-transparent text-zinc-700",
                  )}
                >
                  {event.state === "done" ? "✓" : event.state === "current" ? "•" : "○"}
                </span>
                <div className="ml-2">
                  <p
                    className={cn(
                      "text-xs font-medium",
                      event.state === "pending" ? "text-zinc-600" : "text-zinc-200",
                    )}
                  >
                    {event.label}
                  </p>
                  <p className="text-[10px] text-zinc-600">{event.sub} · {event.time}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* Driver info */}
          {active.driver && (
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/20 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/20 text-xs font-bold text-teal-400">
                {active.driver.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-200">{active.driver.name}</p>
                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                  <Star size={9} className="text-amber-400" />
                  {active.driver.rating} · {active.driver.vehicle} · {active.driver.plate}
                </div>
              </div>
              {active.driver.eta && (
                <div className="flex items-center gap-1 text-xs font-semibold text-violet-400">
                  <Clock size={11} />
                  {active.driver.eta}
                </div>
              )}
              <a
                href={`tel:${active.driver.phone}`}
                className="flex items-center gap-1.5 rounded-lg border border-teal-500/20 bg-teal-500/10 px-2.5 py-1.5 text-xs font-medium text-teal-400 hover:bg-teal-500/20 transition-colors"
              >
                <Phone size={11} />
                Call
              </a>
            </div>
          )}
        </div>
      )}

      {/* Pending shipment mini-card */}
      {pending && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] px-4 py-3">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-zinc-200">
              {pending.trackingId} — Awaiting driver
            </p>
            <p className="text-[10px] text-zinc-500">
              {pending.pickup.city} → {pending.delivery.city} · {pending.packageType}
            </p>
          </div>
          <span className="text-xs font-semibold text-amber-400">Pending</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Spent", value: formatNaira(CUSTOMER_SHIPMENTS.reduce((s, sh) => s + sh.amount, 0)), color: "text-teal-400" },
          { label: "Delivered", value: String(CUSTOMER_SHIPMENTS.filter((s) => s.status === "delivered").length), color: "text-emerald-400" },
          { label: "All Shipments", value: String(CUSTOMER_SHIPMENTS.length), color: "text-zinc-200" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-center">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent shipments */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-200">Recent Shipments</h3>
          <Link href="/customer/shipments" className="flex items-center gap-0.5 text-xs text-teal-400 hover:text-teal-300">
            View all <ChevronRight size={12} />
          </Link>
        </div>
        <ul className="divide-y divide-white/[0.04]">
          {recent.map((s) => {
            const meta = STATUS_META[s.status];
            return (
              <li key={s.id} className="flex items-center gap-3 py-2.5">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: meta.dot }} />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-zinc-300">{s.trackingId}</p>
                  <p className="text-[10px] text-zinc-600">
                    {s.pickup.city} → {s.delivery.city} · {s.packageType}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-zinc-300">{formatNaira(s.amount)}</p>
                  <p className={`text-[10px] font-medium ${meta.color}`}>{meta.label}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
