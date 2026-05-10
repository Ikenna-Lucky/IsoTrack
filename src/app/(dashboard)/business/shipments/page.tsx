"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Plus, Search, Filter, ArrowUpDown, Truck, Package } from "lucide-react";
import {
  MOCK_SHIPMENTS,
  STATUS_META,
  formatNaira,
  formatDate,
  type ShipmentStatus,
} from "@/lib/mock/business";
import { cn } from "@/lib/utils";

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const FILTERS: { label: string; value: ShipmentStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "In Transit", value: "in_transit" },
  { label: "Out for Delivery", value: "out_for_delivery" },
  { label: "Delivered", value: "delivered" },
  { label: "Failed", value: "failed" },
];

const PAGE_SIZE = 8;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ShipmentsPage() {
  const [filter, setFilter] = useState<ShipmentStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = MOCK_SHIPMENTS.filter((s) => {
    const matchesFilter = filter === "all" || s.status === filter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      s.trackingId.toLowerCase().includes(q) ||
      s.customer.name.toLowerCase().includes(q) ||
      s.pickup.city.toLowerCase().includes(q) ||
      s.delivery.city.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (v: ShipmentStatus | "all") => {
    setFilter(v);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Shipments</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            {MOCK_SHIPMENTS.length} total · {filtered.length} shown
          </p>
        </div>
        <Link
          href={"/business/shipments/new" as Route}
          className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20 shrink-0"
        >
          <Plus className="h-4 w-4" />
          New
        </Link>
      </div>

      {/* ── Filters + search ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search ID, customer, city…"
            className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] pl-9 pr-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
        </div>

        {/* Status filter tabs — scrollable */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {FILTERS.map(({ label, value }) => {
            const count = value === "all"
              ? MOCK_SHIPMENTS.length
              : MOCK_SHIPMENTS.filter((s) => s.status === value).length;
            return (
              <button
                key={value}
                onClick={() => handleFilterChange(value)}
                className={cn(
                  "flex items-center gap-1.5 shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200",
                  filter === value
                    ? "bg-sky-500/[0.12] text-sky-400 border border-sky-500/[0.2]"
                    : "text-zinc-600 border border-white/[0.06] hover:text-zinc-300 hover:bg-white/[0.04]",
                )}
              >
                {label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-px text-[10px] font-semibold",
                    filter === value ? "bg-sky-500/20 text-sky-400" : "bg-white/[0.06] text-zinc-600",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[1fr_1.2fr_1.4fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/[0.05]">
          {["Tracking ID", "Customer", "Route", "Status", "Amount", "Date"].map((h) => (
            <div key={h} className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              {h}
              <ArrowUpDown className="h-2.5 w-2.5 opacity-40" />
            </div>
          ))}
        </div>

        {/* Rows */}
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
            <Package className="h-8 w-8 mb-3 opacity-30" />
            <p className="text-sm">No shipments match your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {paginated.map((s) => {
              const meta = STATUS_META[s.status];
              return (
                <div
                  key={s.id}
                  className="group grid grid-cols-1 sm:grid-cols-[1fr_1.2fr_1.4fr_auto_auto_auto] gap-2 sm:gap-4 px-5 py-4 hover:bg-white/[0.025] transition-colors cursor-pointer"
                >
                  {/* Tracking ID */}
                  <div className="flex items-center gap-2">
                    <div
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: meta.dot, boxShadow: `0 0 5px ${meta.dot}` }}
                    />
                    <span className="text-xs font-mono font-semibold text-zinc-200 group-hover:text-white transition-colors">
                      {s.trackingId}
                    </span>
                  </div>

                  {/* Customer */}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-300 truncate">{s.customer.name}</p>
                    <p className="text-[10px] text-zinc-600">{s.customer.phone}</p>
                  </div>

                  {/* Route */}
                  <div className="min-w-0">
                    <p className="text-[11px] text-zinc-400 truncate">
                      {s.pickup.address}, <span className="text-zinc-500">{s.pickup.city}</span>
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">
                      → {s.delivery.address}, <span className="text-zinc-600">{s.delivery.city}</span>
                    </p>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center">
                    <span
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium whitespace-nowrap",
                        meta.color, meta.bg, meta.border,
                      )}
                    >
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: meta.dot }} />
                      {meta.label}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center">
                    <span className="text-xs font-semibold text-zinc-200 whitespace-nowrap">
                      {formatNaira(s.amount)}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center">
                    <span className="text-[10px] text-zinc-600 whitespace-nowrap">
                      {new Date(s.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.05]">
            <p className="text-[11px] text-zinc-600">
              Page {page} of {totalPages} · {filtered.length} results
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
                      ? "bg-sky-500/[0.15] text-sky-400 border border-sky-500/[0.2]"
                      : "border border-white/[0.07] text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05]",
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
