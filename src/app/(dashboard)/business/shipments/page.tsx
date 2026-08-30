"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import {
  Plus,
  Search,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Phone,
  CheckCircle2,
  Loader2,
  UserCheck,
  ChevronDown as ChevronDownIcon,
  CreditCard,
  Trash2,
} from "lucide-react";
import { useShipments, getShipmentList, getPagination, useAssignDriver, useCancelShipment } from "@/hooks/use-shipments";
import { useDrivers } from "@/hooks/use-driver";
import type { Shipment, ShipmentStatus } from "@/types";
import { extractErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

// ─── Status meta ──────────────────────────────────────────────────────────────

const STATUS_META: Record<ShipmentStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  pending:          { label: "Pending",          color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20",   dot: "#f59e0b" },
  assigned:         { label: "Assigned",         color: "text-sky-400",     bg: "bg-sky-400/10",     border: "border-sky-400/20",     dot: "#38bdf8" },
  picked_up:        { label: "Picked Up",        color: "text-violet-400",  bg: "bg-violet-400/10",  border: "border-violet-400/20",  dot: "#a78bfa" },
  in_transit:       { label: "In Transit",       color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20",    dot: "#60a5fa" },
  out_for_delivery: { label: "Out for Delivery", color: "text-cyan-400",    bg: "bg-cyan-400/10",    border: "border-cyan-400/20",    dot: "#22d3ee" },
  delivered:        { label: "Delivered",        color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", dot: "#34d399" },
  failed:           { label: "Failed",           color: "text-rose-400",    bg: "bg-rose-400/10",    border: "border-rose-400/20",    dot: "#f87171" },
  cancelled:        { label: "Cancelled",        color: "text-zinc-500",    bg: "bg-zinc-500/10",    border: "border-zinc-500/20",    dot: "#71717a" },
};

// ─── Status filter config ──────────────────────────────────────────────────────

const FILTERS: { label: string; value: ShipmentStatus | "all" }[] = [
  { label: "All",             value: "all" },
  { label: "Pending",         value: "pending" },
  { label: "In Transit",      value: "in_transit" },
  { label: "Out for Delivery",value: "out_for_delivery" },
  { label: "Delivered",       value: "delivered" },
  { label: "Failed",          value: "failed" },
];

// ─── Timeline steps ────────────────────────────────────────────────────────────

const TIMELINE = [
  { key: "pending",          label: "Placed" },
  { key: "in_transit",       label: "Picked Up" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered",        label: "Delivered" },
] as const;

function ShipmentTimeline({ status }: { status: ShipmentStatus }) {
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

function ExpandedDetail({ s }: { s: Shipment }) {
  const { data: drivers = [] } = useDrivers();
  const assignDriver = useAssignDriver();
  const cancelShipment = useCancelShipment();
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [assignError, setAssignError] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const availableDrivers = drivers.filter((d) => d.status === "available");
  const canAssign = s.status === "pending" && !s.driver;

  const handleCancel = async () => {
    setCancelError("");
    try {
      await cancelShipment.mutateAsync(s.id);
    } catch (err: unknown) {
      setCancelError(extractErrorMessage(err, "Failed to cancel shipment."));
      setConfirmCancel(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedDriverId) return;
    setAssignError("");
    try {
      await assignDriver.mutateAsync({ id: s.id, driverId: selectedDriverId });
      setSelectedDriverId("");
    } catch (err: unknown) {
      setAssignError(extractErrorMessage(err, "Failed to assign driver."));
    }
  };

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
              { label: "Description", value: s.description },
              { label: "Weight",      value: `${s.weightKg} kg` },
              { label: "Amount",      value: formatNaira(s.priceKobo) },
              { label: "Created",     value: new Date(s.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) },
              ...(s.actualDelivery ? [{ label: "Delivered", value: new Date(s.actualDelivery).toLocaleDateString("en-NG", { day: "numeric", month: "short" }) }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start gap-2">
                <span className="text-[10px] text-zinc-600 w-20 shrink-0 mt-0.5">{label}</span>
                <span className="text-[11px] font-medium text-zinc-300">{value}</span>
              </div>
            ))}
          </div>

          {/* ── Payment status (read-only — customer initiates payment) ── */}
          <div className="mt-4">
            {s.isPaid ? (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <p className="text-[11px] font-semibold text-emerald-400">Payment received</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-amber-500/15 bg-amber-500/[0.05] px-3 py-2.5">
                <CreditCard className="h-3.5 w-3.5 text-amber-500/60 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-amber-500/80">Awaiting payment</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">Customer pays via tracking page</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Cancel shipment (pending only) ── */}
          {s.status === "pending" && (
            <div className="mt-4">
              {cancelError && (
                <p className="text-[10px] text-rose-400 mb-2">{cancelError}</p>
              )}
              {confirmCancel ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={cancelShipment.isPending}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/[0.12] px-3 py-2.5 text-[11px] font-semibold text-rose-400 hover:bg-rose-500/[0.2] transition-all disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {cancelShipment.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    {cancelShipment.isPending ? "Cancelling…" : "Yes, cancel it"}
                  </button>
                  <button
                    onClick={() => setConfirmCancel(false)}
                    disabled={cancelShipment.isPending}
                    className="flex items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[11px] font-medium text-zinc-500 hover:text-zinc-300 hover:border-white/[0.15] transition-all disabled:opacity-40"
                  >
                    Keep
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-500/15 bg-rose-500/[0.04] px-3 py-2.5 text-[11px] font-medium text-rose-500/60 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/[0.1] transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Cancel shipment
                </button>
              )}
            </div>
          )}
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
                  {(s.driver.user?.name ?? "DR").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-200">{s.driver.user?.name ?? "Driver"}</p>
                  <p className="text-[10px] text-amber-400">&#9733; {s.driver.rating.toFixed(1)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600 mb-3">
                Driver
              </p>
              {canAssign ? (
                <div className="space-y-2">
                  <div className="relative">
                    <select
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 pr-8 text-[11px] text-zinc-300 focus:outline-none focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/20 transition-all"
                    >
                      <option value="" className="bg-[#111]">
                        {availableDrivers.length === 0 ? "No available drivers" : "Select a driver..."}
                      </option>
                      {availableDrivers.map((d) => (
                        <option key={d.id} value={d.id} className="bg-[#111]">
                          {d.user?.name ?? "Driver"} · {d.vehicleType} · ★{d.rating.toFixed(1)}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600" />
                  </div>
                  {assignError && <p className="text-[10px] text-rose-400">{assignError}</p>}
                  <button
                    onClick={handleAssign}
                    disabled={!selectedDriverId || assignDriver.isPending || availableDrivers.length === 0}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-500/25 bg-sky-500/10 px-3 py-2.5 text-[11px] font-semibold text-sky-400 hover:bg-sky-500/[0.18] hover:border-sky-500/40 transition-all disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {assignDriver.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <UserCheck className="h-3.5 w-3.5" />
                    )}
                    {assignDriver.isPending ? "Assigning..." : "Assign Driver"}
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-500/[0.12] bg-amber-500/[0.04] px-3 py-2.5">
                  <p className="text-[11px] text-amber-500/70">No driver assigned yet</p>
                </div>
              )}
            </div>
          )}

          {s.customer && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600 mb-2">
                Customer
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-zinc-200">{s.customer.name}</p>
                  {s.customer.phone && (
                    <p className="text-[10px] text-zinc-600">{s.customer.phone}</p>
                  )}
                </div>
                {s.customer.phone && (
                  <a
                    href={`tel:${s.customer.phone}`}
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-[10px] font-medium text-zinc-400 hover:text-white hover:border-white/[0.15] transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone className="h-3 w-3" />
                    Call
                  </a>
                )}
              </div>
            </div>
          )}
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

const PAGE_SIZE = 20;

export default function ShipmentsPage() {
  const [filter, setFilter]         = useState<ShipmentStatus | "all">("all");
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy]         = useState<SortKey>(null);
  const [sortDir, setSortDir]       = useState<"asc" | "desc">("desc");

  const { data: rawData, isLoading, isError } = useShipments({ page, pageSize: PAGE_SIZE });
  const allShipments = getShipmentList(rawData);
  const pagination   = getPagination(rawData);

  const handleSort = (col: SortKey) => {
    if (sortBy === col) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortBy(col); setSortDir("desc"); }
    setPage(1);
  };

  // Client-side filter + search on the fetched page
  let filtered = allShipments.filter((s) => {
    const matchFilter = filter === "all" || s.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.trackingId.toLowerCase().includes(q) ||
      s.customer?.name.toLowerCase().includes(q) ||
      s.pickupAddress.city.toLowerCase().includes(q) ||
      s.deliveryAddress.city.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  if (sortBy === "amount") {
    filtered = [...filtered].sort((a, b) =>
      sortDir === "desc" ? b.priceKobo - a.priceKobo : a.priceKobo - b.priceKobo,
    );
  } else if (sortBy === "date") {
    filtered = [...filtered].sort((a, b) =>
      sortDir === "desc"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }

  const totalPages = pagination?.totalPages ?? 1;

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
            {pagination ? `${pagination.total} total` : "Loading…"}
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
              ? allShipments.length
              : allShipments.filter((s) => s.status === value).length;
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
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search ID, customer, city…"
          className="w-full rounded-xl border border-white/[0.07] bg-[#0d0d11] pl-9 pr-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/[0.15] transition-all"
        />
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] overflow-hidden">

        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[minmax(180px,1.6fr)_minmax(120px,1fr)_minmax(140px,1.2fr)_minmax(120px,1fr)_130px_110px_72px_36px] gap-x-4 px-6 py-3.5 border-b border-white/[0.05]">
          {(["Tracking ID", "Customer", "Route", "Driver", "Status", "Amount", "Date", ""] as const).map((h, i) => {
            const isSortable = h === "Amount" || h === "Date";
            const colKey: SortKey = h === "Amount" ? "amount" : h === "Date" ? "date" : null;
            return (
              <div
                key={h || i}
                className={cn(
                  "flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600",
                  isSortable && "cursor-pointer hover:text-zinc-400 transition-colors select-none",
                  h === "Amount" && "justify-end",
                  h === "Date" && "justify-end",
                )}
                onClick={() => isSortable && handleSort(colKey)}
              >
                {h}
                {isSortable && <SortIcon col={colKey} sortBy={sortBy} sortDir={sortDir} />}
              </div>
            );
          })}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-zinc-600">
            <div className="motion-shimmer h-2 w-32 rounded-full bg-white/[0.06]" />
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading shipments…</span>
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-700">
            <p className="text-sm font-medium text-rose-400">Failed to load shipments</p>
            <p className="text-xs text-zinc-700 mt-1">Check your connection and try again</p>
          </div>
        )}

        {/* Rows */}
        {!isLoading && !isError && (
          filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-700">
              <Image
                src="/images/empty-img.jpg"
                alt="Prepared packages waiting for shipment"
                width={220}
                height={150}
                className="mb-5 h-28 w-44 rounded-lg object-cover opacity-80"
              />
              <p className="text-sm font-medium text-zinc-600">No shipments found</p>
              <p className="text-xs text-zinc-700 mt-1">Try adjusting your filters or create a new shipment</p>
            </div>
          ) : (
            <>
              {/* ── Mobile cards (< sm) ── */}
              <div className="sm:hidden divide-y divide-white/[0.04]">
                {filtered.map((s) => {
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
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: meta.dot, boxShadow: `0 0 5px ${meta.dot}80` }}
                          />
                          <span className="text-xs font-mono font-semibold text-zinc-200 flex-1 truncate">
                            {s.trackingId}
                          </span>
                          <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap", meta.color, meta.bg, meta.border)}>
                            {meta.label}
                          </span>
                          <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-zinc-600 transition-transform duration-200", isExpanded && "rotate-180 text-sky-400")} />
                        </div>
                        <div className="flex items-end justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[11px] font-medium text-zinc-400 truncate">{s.customer?.name ?? "—"}</p>
                            <p className="text-[10px] text-zinc-600 truncate">
                              {s.pickupAddress.city} <span className="text-zinc-700">→</span> {s.deliveryAddress.city}
                            </p>
                          </div>
                          <p className="text-xs font-semibold text-zinc-200 tabular-nums shrink-0">{formatNaira(s.priceKobo)}</p>
                        </div>
                      </div>
                      {isExpanded && <ExpandedDetail s={s} />}
                    </div>
                  );
                })}
              </div>

              {/* ── Desktop table rows (sm+) ── */}
              <div className="hidden sm:block divide-y divide-white/[0.04]">
                {filtered.map((s) => {
                  const meta = STATUS_META[s.status];
                  const isExpanded = expandedId === s.id;
                  return (
                    <div key={s.id}>
                      <div
                        className={cn(
                          "group grid grid-cols-[minmax(180px,1.6fr)_minmax(120px,1fr)_minmax(140px,1.2fr)_minmax(120px,1fr)_130px_110px_72px_36px] gap-x-4 items-center px-6 py-4 cursor-pointer transition-all duration-150",
                          isExpanded ? "bg-white/[0.025]" : "hover:bg-white/[0.015]",
                        )}
                        onClick={() => setExpandedId(isExpanded ? null : s.id)}
                      >
                        {/* Tracking ID */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: meta.dot, boxShadow: `0 0 6px ${meta.dot}90` }}
                          />
                          <span className="text-[11px] font-mono font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">
                            {s.trackingId}
                          </span>
                        </div>

                        {/* Customer */}
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-zinc-300 truncate">{s.customer?.name ?? <span className="text-zinc-700">—</span>}</p>
                          {s.customer?.phone && <p className="text-[10px] text-zinc-600 truncate">{s.customer.phone}</p>}
                        </div>

                        {/* Route */}
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-zinc-300 truncate">{s.pickupAddress.city}</p>
                          <p className="text-[10px] text-zinc-600 truncate flex items-center gap-1 mt-0.5">
                            <span className="text-zinc-700 text-[9px]">&#8594;</span>
                            {s.deliveryAddress.city}
                          </p>
                        </div>

                        {/* Driver */}
                        <div className="flex items-center gap-2 min-w-0">
                          {s.driver ? (
                            <>
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500/15 border border-teal-500/20 text-[9px] font-bold text-teal-300 uppercase">
                                {(s.driver.user?.name ?? "DR").slice(0, 2)}
                              </div>
                              <p className="text-[11px] font-medium text-zinc-400 truncate">
                                {(s.driver.user?.name ?? "Driver").split(" ")[0]}
                              </p>
                            </>
                          ) : (
                            <p className="text-[10px] text-zinc-700 italic">Unassigned</p>
                          )}
                        </div>

                        {/* Status */}
                        <div className="flex items-center">
                          <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap", meta.color, meta.bg, meta.border)}>
                            {meta.label}
                          </span>
                        </div>

                        {/* Amount */}
                        <div className="flex items-center justify-end">
                          <span className="text-[11px] font-semibold text-zinc-200 tabular-nums">
                            {formatNaira(s.priceKobo)}
                          </span>
                        </div>

                        {/* Date */}
                        <div className="flex items-center justify-end">
                          <span className="text-[10px] text-zinc-600 tabular-nums whitespace-nowrap">
                            {new Date(s.createdAt).toLocaleDateString("en-NG", {
                              day: "numeric", month: "short",
                            })}
                          </span>
                        </div>

                        {/* Expand chevron */}
                        <div className="flex items-center justify-center">
                          <ChevronDown className={cn(
                            "h-3.5 w-3.5 text-zinc-700 group-hover:text-zinc-500 transition-all duration-200",
                            isExpanded && "rotate-180 text-sky-400 group-hover:text-sky-400",
                          )} />
                        </div>
                      </div>
                      {isExpanded && <ExpandedDetail s={s} />}
                    </div>
                  );
                })}
              </div>
            </>
          )
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-xs font-medium text-zinc-400 transition-all hover:bg-white/[0.06] hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            &larr; Prev
          </button>
          <span className="text-xs text-zinc-600">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-xs font-medium text-zinc-400 transition-all hover:bg-white/[0.06] hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
