"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Plus,
  Search,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Package,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
  Circle,
  Eye,
} from "lucide-react";
import {
  MOCK_SHIPMENTS,
  STATUS_META,
  formatNaira,
  type ShipmentStatus,
} from "@/lib/mock/business";
import { cn } from "@/lib/utils";

// ─── Status filter config ──────────────────────────────────────────────────────

const FILTERS: { label: string; value: ShipmentStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "In Transit", value: "in_transit" },
  { label: "Out for Delivery", value: "out_for_delivery" },
  { label: "Delivered", value: "delivered" },
  { label: "Failed", value: "failed" },
];

// ─── Timeline steps ────────────────────────────────────────────────────────────

const TIMELINE = [
  { key: "pending",          label: "Placed" },
  { key: "in_transit",       label: "Picked Up" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered",        label: "Delivered" },
] as const;

function ShipmentTimeline({ status }: { status: string }) {
  const currentIdx = TIMELINE.findIndex((t) => t.key === status);
  const isFailed = status === "failed" || status === "cancelled";

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600 mb-3">
        Status Timeline
      </p>
      <div className="flex items-start">
        {TIMELINE.map((step, i) => {
          const done = !isFailed && i <= currentIdx;
          const active = !isFailed && i === currentIdx;
          const isLast = i === TIMELINE.length - 1;

          return (
            <div key={step.key} className="flex items-start flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                    isFailed
                      ? "border-rose-500/40 bg-transparent"
                      : done
                        ? active
                          ? "border-sky-400 bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.4)]"
                          : "border-emerald-400 bg-emerald-400"
                        : "border-zinc-700 bg-transparent",
                  )}
                >
                  {done && !active && (
                    <CheckCircle2 className="h-3 w-3 text-[#0d0d11]" />
                  )}
                  {active && <div className="h-1.5 w-1.5 rounded-full bg-[#0d0d11]" />}
                </div>
                <p
                  className={cn(
                    "text-[9px] font-medium mt-1.5 text-center whitespace-nowrap",
                    active ? "text-sky-400" : done ? "text-emerald-400" : "text-zinc-700",
                    isFailed && "text-rose-500/40",
                  )}
                >
                  {step.label}
                </p>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mt-2.5 mx-1 rounded-full transition-all",
                    !isFailed && i < currentIdx
                      ? "bg-emerald-400/60"
                      : "bg-zinc-800",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      {isFailed && (
        <p className="text-[10px] text-rose-400 mt-2">
          Delivery {status === "failed" ? "failed" : "cancelled"}
        </p>
      )}
    </div>
  );
}

// ─── Expanded row detail ───────────────────────────────────────────────────────

function ExpandedDetail({ s }: { s: (typeof MOCK_SHIPMENTS)[0] }) {
  return (
    <div className="border-t border-white/[0.05] bg-[#0b0b0f] px-5 py-5 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

        {/* Timeline */}
        <ShipmentTimeline status={s.status} />

        {/* Package details */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600 mb-3">
            Package Info
          </p>
          <div className="space-y-2">
            {[
              { label: "Type", value: s.packageType },
              { label: "Weight", value: s.weight },
              { label: "Amount", value: formatNaira(s.amount) },
              { label: "Created", value: new Date(s.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) },
              ...(s.deliveredAt ? [{ label: "Delivered", value: new Date(s.deliveredAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" }) }] : []),
              ...(s.notes ? [{ label: "Notes", value: s.notes }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start gap-2">
                <span className="text-[10px] text-zinc-600 w-16 shrink-0 mt-0.5">{label}</span>
                <span className="text-[11px] font-medium text-zinc-300">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Driver + customer */}
        <div className="space-y-3">
          {s.driver ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600 mb-3">
                Assigned Driver
              </p>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500/20 to-sky-500/20 border border-teal-500/20 text-[11px] font-bold text-teal-300 uppercase">
                  {s.driver.name.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-200">{s.driver.name}</p>
                  <p className="text-[10px] text-amber-400">★ {s.driver.rating}</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600 mb-3">
                Driver
              </p>
              <div className="rounded-xl border border-amber-500/[0.12] bg-amber-500/[0.04] px-3 py-2.5">
                <p className="text-[11px] text-amber-500/70">No driver assigned yet</p>
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600 mb-2">
              Customer
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-zinc-200">{s.customer.name}</p>
                <p className="text-[10px] text-zinc-600">{s.customer.phone}</p>
              </div>
              <a
                href={`tel:${s.customer.phone}`}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-[10px] font-medium text-zinc-400 hover:text-white hover:border-white/[0.15] transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <Phone className="h-3 w-3" />
                Call
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sort helper ──────────────────────────────────────────────────────────────

type SortKey = "date" | "amount" | null;

function SortIcon({ col, sortBy, sortDir }: { col: SortKey; sortBy: SortKey; sortDir: "asc" | "desc" }) {
  if (sortBy !== col) return <ArrowUpDown className="h-3 w-3 opacity-30" />;
  return sortDir === "asc"
    ? <ArrowUp className="h-3 w-3 text-sky-400" />
    : <ArrowDown className="h-3 w-3 text-sky-400" />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

export default function ShipmentsPage() {
  const [filter, setFilter]       = useState<ShipmentStatus | "all">("all");
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy]       = useState<SortKey>(null);
  const [sortDir, setSortDir]     = useState<"asc" | "desc">("desc");

  const handleSort = (col: SortKey) => {
    if (sortBy === col) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
    setPage(1);
  };

  let filtered = MOCK_SHIPMENTS.filter((s) => {
    const matchFilter = filter === "all" || s.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.trackingId.toLowerCase().includes(q) ||
      s.customer.name.toLowerCase().includes(q) ||
      s.pickup.city.toLowerCase().includes(q) ||
      s.delivery.city.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  if (sortBy === "amount") {
    filtered = [...filtered].sort((a, b) =>
      sortDir === "desc" ? b.amount - a.amount : a.amount - b.amount,
    );
  } else if (sortBy === "date") {
    filtered = [...filtered].sort((a, b) =>
      sortDir === "desc"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (v: ShipmentStatus | "all") => {
    setFilter(v);
    setPage(1);
    setExpandedId(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Shipments</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            {MOCK_SHIPMENTS.length} total &middot; {filtered.length} shown
          </p>
        </div>
        <Link
          href={"/business/shipments/new" as Route}
          className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-400 active:scale-[0.98] transition-all shadow-lg shadow-sky-500/20 shrink-0"
        >
          <Plus className="h-4 w-4" />
          New Shipment
        </Link>
      </div>

      {/* ── Status summary strip ── */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
        {FILTERS.map(({ label, value }) => {
          const count =
            value === "all"
              ? MOCK_SHIPMENTS.length
              : MOCK_SHIPMENTS.filter((s) => s.status === value).length;
          const meta = value !== "all" ? STATUS_META[value] : null;
          const active = filter === value;
          return (
            <button
              key={value}
              onClick={() => handleFilterChange(value)}
              className={cn(
                "flex items-center gap-2 shrink-0 rounded-xl px-3.5 py-2 text-xs font-medium border transition-all duration-150",
                active
                  ? "bg-sky-500/[0.12] text-sky-400 border-sky-500/[0.22]"
                  : "text-zinc-500 border-white/[0.06] hover:text-zinc-200 hover:bg-white/[0.04]",
              )}
            >
              {meta && (
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: active ? "#38bdf8" : meta.dot }}
                />
              )}
              {label}
              <span
                className={cn(
                  "min-w-5 rounded-full px-1.5 py-px text-center text-[10px] font-bold",
                  active ? "bg-sky-500/20 text-sky-400" : "bg-white/[0.06] text-zinc-600",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Search ── */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search ID, customer, city…"
          className="w-full rounded-xl border border-white/[0.07] bg-[#0d0d11] pl-9 pr-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/[0.15] transition-all"
        />
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] overflow-hidden">

        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[auto_1fr_1.2fr_1.2fr_auto_auto_auto_auto] gap-3 px-5 py-3 border-b border-white/[0.05]">
          {(["Tracking ID", "Customer", "Route", "Driver", "Status", "Amount", "Date", ""] as const).map((h, i) => {
            const isSortable = h === "Amount" || h === "Date";
            const colKey: SortKey = h === "Amount" ? "amount" : h === "Date" ? "date" : null;
            return (
              <div
                key={h || i}
                className={cn(
                  "flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600",
                  isSortable && "cursor-pointer hover:text-zinc-400 transition-colors select-none",
                )}
                onClick={() => isSortable && handleSort(colKey)}
              >
                {h}
                {isSortable && <SortIcon col={colKey} sortBy={sortBy} sortDir={sortDir} />}
              </div>
            );
          })}
        </div>

        {/* Rows */}
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-700">
            <Package className="h-10 w-10 mb-4 opacity-20" />
            <p className="text-sm font-medium text-zinc-600">No shipments found</p>
            <p className="text-xs text-zinc-700 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* ── Mobile cards (< sm) ── */}
            <div className="sm:hidden divide-y divide-white/[0.04]">
              {paginated.map((s) => {
                const meta = STATUS_META[s.status];
                const isExpanded = expandedId === s.id;
                return (
                  <div key={s.id}>
                    <div
                      className={cn(
                        "px-4 py-3.5 cursor-pointer transition-colors",
                        isExpanded ? "bg-white/[0.025]" : "hover:bg-white/[0.015]",
                      )}
                      onClick={() => setExpandedId(isExpanded ? null : s.id)}
                    >
                      {/* Top row: tracking ID + status badge + chevron */}
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: meta.dot, boxShadow: `0 0 5px ${meta.dot}80` }}
                        />
                        <span className="text-xs font-mono font-semibold text-zinc-200 flex-1 truncate">
                          {s.trackingId}
                        </span>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap",
                            meta.color, meta.bg, meta.border,
                          )}
                        >
                          {meta.label}
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 shrink-0 text-zinc-600 transition-transform duration-200",
                            isExpanded && "rotate-180 text-sky-400",
                          )}
                        />
                      </div>
                      {/* Bottom row: customer + route + amount */}
                      <div className="flex items-end justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-zinc-400 truncate">
                            {s.customer.name}
                          </p>
                          <p className="text-[10px] text-zinc-600 truncate">
                            {s.pickup.city} <span className="text-zinc-700">→</span> {s.delivery.city}
                          </p>
                        </div>
                        <p className="text-xs font-semibold text-zinc-200 tabular-nums shrink-0">
                          {formatNaira(s.amount)}
                        </p>
                      </div>
                    </div>
                    {isExpanded && <ExpandedDetail s={s} />}
                  </div>
                );
              })}
            </div>

            {/* ── Desktop table rows (sm+) ── */}
            <div className="hidden sm:block divide-y divide-white/[0.04]">
              {paginated.map((s) => {
                const meta = STATUS_META[s.status];
                const isExpanded = expandedId === s.id;
                return (
                  <div key={s.id}>
                    <div
                      className={cn(
                        "group grid grid-cols-[auto_1fr_1.2fr_1.2fr_auto_auto_auto_auto] gap-3 px-5 py-3.5 cursor-pointer transition-all duration-150",
                        isExpanded ? "bg-white/[0.025]" : "hover:bg-white/[0.015]",
                      )}
                      onClick={() => setExpandedId(isExpanded ? null : s.id)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: meta.dot, boxShadow: `0 0 5px ${meta.dot}80` }}
                        />
                        <span className="text-xs font-mono font-semibold text-zinc-200 group-hover:text-white transition-colors whitespace-nowrap">
                          {s.trackingId}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-zinc-300 truncate">{s.customer.name}</p>
                        <p className="text-[10px] text-zinc-600">{s.customer.phone}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-zinc-400 truncate">{s.pickup.city}</p>
                        <p className="text-[11px] text-zinc-600 truncate flex items-center gap-1">
                          <span className="text-zinc-700">→</span> {s.delivery.city}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        {s.driver ? (
                          <>
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/15 border border-teal-500/20 text-[8px] font-bold text-teal-300 uppercase">
                              {s.driver.name.slice(0, 2)}
                            </div>
                            <p className="text-[11px] text-zinc-500 truncate max-w-[70px]">
                              {s.driver.name.split(" ")[0]}
                            </p>
                          </>
                        ) : (
                          <p className="text-[10px] text-zinc-700 italic">Unassigned</p>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className={cn("flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium whitespace-nowrap", meta.color, meta.bg, meta.border)}>
                          {meta.label}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs font-semibold text-zinc-200 tabular-nums whitespace-nowrap">
                          {formatNaira(s.amount)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-[10px] text-zinc-600 whitespace-nowrap">
                          {new Date(s.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <div className="flex items-center justify-end">
                        <ChevronDown className={cn("h-3.5 w-3.5 text-zinc-600 transition-transform duration-200", isExpanded && "rotate-180 text-sky-400")} />
                      </div>
                    </div>
                    {isExpanded && <ExpandedDetail s={s} />}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.05]">
            <p className="text-[11px] text-zinc-600">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-white/[0.07] px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                    p === page
                      ? "bg-sky-500/[0.15] text-sky-400 border border-sky-500/[0.22]"
                      : "border border-white/[0.07] text-zinc-600 hover:text-zinc-200 hover:bg-white/[0.05]",
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-white/[0.07] px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
