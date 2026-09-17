"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Loader2,
  MapPin,
  Package,
  Plus,
  Search,
  Trash2,
  Truck,
  UserCheck,
  XCircle,
} from "lucide-react";
import {
  getPagination,
  getShipmentList,
  useAssignDriver,
  useCancelShipment,
  useShipments,
} from "@/hooks/use-shipments";
import { useDrivers } from "@/hooks/use-driver";
import type { Shipment, ShipmentStatus } from "@/types";
import { extractErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";

type FilterValue = ShipmentStatus | "all" | "active";

const PAGE_SIZE = 20;
const ACTIVE_STATUSES: ShipmentStatus[] = ["assigned", "picked_up", "in_transit", "out_for_delivery"];

const STATUS_META: Record<
  ShipmentStatus,
  { label: string; tone: string; dot: string; Icon: typeof Package }
> = {
  pending: { label: "Pending", tone: "border-amber-400/25 bg-amber-400/10 text-amber-200", dot: "bg-amber-300", Icon: Clock },
  assigned: { label: "Assigned", tone: "border-teal-400/25 bg-teal-400/10 text-teal-200", dot: "bg-teal-300", Icon: UserCheck },
  picked_up: { label: "Picked up", tone: "border-teal-400/25 bg-teal-400/10 text-teal-200", dot: "bg-teal-300", Icon: Package },
  in_transit: { label: "In transit", tone: "border-teal-400/25 bg-teal-400/10 text-teal-200", dot: "bg-teal-300", Icon: Truck },
  out_for_delivery: { label: "Out for delivery", tone: "border-teal-400/25 bg-teal-400/10 text-teal-200", dot: "bg-teal-300", Icon: MapPin },
  delivered: { label: "Delivered", tone: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200", dot: "bg-emerald-300", Icon: CheckCircle2 },
  failed: { label: "Failed", tone: "border-rose-400/25 bg-rose-400/10 text-rose-200", dot: "bg-rose-300", Icon: XCircle },
  cancelled: { label: "Cancelled", tone: "border-stone-600 bg-white/[0.04] text-stone-400", dot: "bg-stone-500", Icon: XCircle },
};

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Delivered", value: "delivered" },
  { label: "Failed", value: "failed" },
];

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function ExpandedShipment({ shipment }: { shipment: Shipment }) {
  const { data: drivers = [] } = useDrivers();
  const assignDriver = useAssignDriver();
  const cancelShipment = useCancelShipment();
  const [driverId, setDriverId] = useState("");
  const [assignError, setAssignError] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const availableDrivers = drivers.filter((driver) => driver.status === "available");
  const canAssign = shipment.status === "pending" && !shipment.driver;

  async function handleAssign() {
    if (!driverId) return;
    setAssignError("");
    try {
      await assignDriver.mutateAsync({ id: shipment.id, driverId });
      setDriverId("");
    } catch (err: unknown) {
      setAssignError(extractErrorMessage(err, "Failed to assign driver."));
    }
  }

  async function handleCancel() {
    setCancelError("");
    try {
      await cancelShipment.mutateAsync(shipment.id);
      setCancelOpen(false);
    } catch (err: unknown) {
      setCancelError(extractErrorMessage(err, "Failed to cancel shipment."));
    }
  }

  return (
    <div className="border-t border-white/[0.07] bg-black/20 p-4">
      <div className="grid gap-3 lg:grid-cols-[1fr,0.85fr,0.85fr]">
        <section className="rounded-md border border-white/[0.07] bg-white/[0.03] p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-600">Route</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-teal-200">Pickup</p>
              <p className="mt-1 truncate text-sm font-black text-stone-100">{shipment.pickupAddress.street}</p>
              <p className="text-xs text-stone-500">{shipment.pickupAddress.city}, {shipment.pickupAddress.state}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-200">Drop-off</p>
              <p className="mt-1 truncate text-sm font-black text-stone-100">{shipment.deliveryAddress.street}</p>
              <p className="text-xs text-stone-500">{shipment.deliveryAddress.city}, {shipment.deliveryAddress.state}</p>
            </div>
          </div>
        </section>

        <section className="rounded-md border border-white/[0.07] bg-white/[0.03] p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-600">Package file</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-stone-600">Weight</p>
              <p className="mt-1 font-black text-stone-100">{shipment.weightKg} kg</p>
            </div>
            <div>
              <p className="text-stone-600">Amount</p>
              <p className="mt-1 font-black text-stone-100">{formatNaira(shipment.priceKobo)}</p>
            </div>
            <div>
              <p className="text-stone-600">Created</p>
              <p className="mt-1 font-black text-stone-100">{formatDate(shipment.createdAt)}</p>
            </div>
            <div>
              <p className="text-stone-600">Payment</p>
              <p className={cn("mt-1 font-black", shipment.isPaid ? "text-emerald-200" : "text-amber-200")}>{shipment.isPaid ? "Paid" : "Unpaid"}</p>
            </div>
          </div>
          {shipment.description && <p className="mt-4 text-xs leading-5 text-stone-500">{shipment.description}</p>}
        </section>

        <section className="rounded-md border border-white/[0.07] bg-white/[0.03] p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-600">Dispatch action</p>
          {canAssign ? (
            <div className="mt-4 space-y-2">
              <select
                value={driverId}
                onChange={(event) => setDriverId(event.target.value)}
                className="w-full rounded-md border border-white/[0.08] bg-black/25 px-3 py-2.5 text-sm font-bold text-stone-100 outline-none focus:border-teal-400/40"
              >
                <option value="">Select available driver</option>
                {availableDrivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.user.name} - {driver.vehiclePlate}
                  </option>
                ))}
              </select>
              {assignError && <p className="text-xs font-bold text-rose-200">{assignError}</p>}
              <button
                onClick={handleAssign}
                disabled={!driverId || assignDriver.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-amber-300 px-3 py-2.5 text-sm font-black text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assignDriver.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                Assign driver
              </button>
            </div>
          ) : (
            <div className="mt-4 rounded-md border border-teal-400/20 bg-teal-400/10 p-3">
              <p className="text-xs font-black text-teal-100">{shipment.driver?.user?.name ?? "No manual action required"}</p>
              <p className="mt-1 text-[11px] text-stone-500">
                {shipment.driver ? `${shipment.driver.vehicleType} ${shipment.driver.vehiclePlate}` : "Shipment cannot be assigned from this state."}
              </p>
            </div>
          )}

          {shipment.status === "pending" && (
            <div className="mt-3">
              {cancelError && <p className="mb-2 text-xs font-bold text-rose-200">{cancelError}</p>}
              {cancelOpen ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={cancelShipment.isPending}
                    className="rounded-md bg-rose-300 px-3 py-2.5 text-xs font-black text-black transition hover:bg-rose-200 disabled:opacity-50"
                  >
                    {cancelShipment.isPending ? "Cancelling..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => setCancelOpen(false)}
                    className="rounded-md border border-white/[0.08] px-3 py-2.5 text-xs font-black text-stone-300 transition hover:bg-white/[0.06]"
                  >
                    Keep
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCancelOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-rose-400/20 bg-rose-400/10 px-3 py-2.5 text-xs font-black text-rose-100 transition hover:bg-rose-400/[0.16]"
                >
                  <Trash2 className="h-4 w-4" />
                  Cancel shipment
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ShipmentItem({
  shipment,
  expanded,
  onToggle,
}: {
  shipment: Shipment;
  expanded: boolean;
  onToggle: () => void;
}) {
  const meta = STATUS_META[shipment.status];
  const Icon = meta.Icon;

  return (
    <li className="overflow-hidden rounded-md border border-white/[0.07] bg-[#0d1412]">
      <button
        onClick={onToggle}
        className="grid w-full grid-cols-[auto,1fr,auto] items-center gap-3 px-4 py-4 text-left transition hover:bg-white/[0.03] lg:grid-cols-[auto,1fr,160px,120px,auto]"
      >
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-md border", meta.tone)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-xs font-black text-stone-100">{shipment.trackingId}</p>
            {!shipment.isPaid && (
              <span className="rounded border border-amber-400/20 bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-200">
                Unpaid
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-xs text-stone-600">
            {shipment.pickupAddress.city} to {shipment.deliveryAddress.city}
          </p>
        </div>
        <div className="hidden text-right lg:block">
          <p className="text-sm font-black text-stone-100">{formatNaira(shipment.priceKobo)}</p>
          <p className="mt-0.5 text-[10px] font-bold text-stone-600">{formatDate(shipment.createdAt)}</p>
        </div>
        <span className={cn("hidden rounded-md border px-2.5 py-1.5 text-center text-[10px] font-black lg:block", meta.tone)}>
          {meta.label}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-stone-600 transition", expanded && "rotate-180 text-teal-200")} />
      </button>
      {expanded && <ExpandedShipment shipment={shipment} />}
    </li>
  );
}

export default function ShipmentsPage() {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data: rawData, isLoading, isError } = useShipments({ page, pageSize: PAGE_SIZE });
  const shipments = getShipmentList(rawData);
  const pagination = getPagination(rawData);

  const filtered = shipments.filter((shipment) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && ACTIVE_STATUSES.includes(shipment.status)) ||
      shipment.status === filter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      shipment.trackingId.toLowerCase().includes(q) ||
      shipment.pickupAddress.city.toLowerCase().includes(q) ||
      shipment.deliveryAddress.city.toLowerCase().includes(q) ||
      shipment.description.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: shipments.length,
    active: shipments.filter((shipment) => ACTIVE_STATUSES.includes(shipment.status)).length,
    pending: shipments.filter((shipment) => shipment.status === "pending").length,
    delivered: shipments.filter((shipment) => shipment.status === "delivered").length,
    failed: shipments.filter((shipment) => shipment.status === "failed").length,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr,360px] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-200">Shipment manifest</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-50 sm:text-3xl">Shipments</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
              Search, assign, monitor, and cancel pending shipment records from one operational manifest.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-600" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search manifest"
                className="w-full rounded-md border border-white/[0.08] bg-black/25 py-3 pl-10 pr-3 text-sm font-bold text-stone-100 outline-none transition placeholder:text-stone-700 focus:border-teal-400/40 focus:ring-2 focus:ring-teal-400/10"
              />
            </div>
            <Link href="/business/shipments/new" className="flex items-center justify-center rounded-md bg-amber-300 px-3 text-black transition hover:bg-amber-200" aria-label="New shipment">
              <Plus className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-xs font-black transition",
              filter === value
                ? "border-teal-400/30 bg-teal-400/10 text-teal-100"
                : "border-white/[0.07] bg-white/[0.03] text-stone-500 hover:text-stone-200",
            )}
          >
            {label}
            <span className={cn("rounded px-1.5 py-0.5 text-[10px]", filter === value ? "bg-teal-300 text-black" : "bg-white/[0.06] text-stone-500")}>
              {counts[value as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center rounded-md border border-white/[0.07] bg-[#0d1412] py-16">
          <Loader2 className="h-6 w-6 animate-spin text-teal-200" />
        </div>
      )}

      {isError && !isLoading && (
        <div className="rounded-md border border-rose-400/20 bg-rose-400/10 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-rose-200" />
            <p className="text-sm font-black text-rose-100">Could not load shipments.</p>
          </div>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="rounded-md border border-white/[0.07] bg-[#0d1412] px-5 py-14 text-center">
          <Package className="mx-auto h-6 w-6 text-stone-700" />
          <p className="mt-3 text-sm font-black text-stone-200">No shipments match this view</p>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <ul className="space-y-2">
          {filtered.map((shipment) => (
            <ShipmentItem
              key={shipment.id}
              shipment={shipment}
              expanded={expandedId === shipment.id}
              onToggle={() => setExpandedId(expandedId === shipment.id ? null : shipment.id)}
            />
          ))}
        </ul>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-md border border-white/[0.07] bg-[#0d1412] px-4 py-3">
          <p className="text-xs font-bold text-stone-600">Page {pagination.page} of {pagination.totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={page <= 1}
              className="rounded-md border border-white/[0.08] px-3 py-2 text-xs font-black text-stone-300 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((value) => Math.min(pagination.totalPages, value + 1))}
              disabled={page >= pagination.totalPages}
              className="rounded-md border border-white/[0.08] px-3 py-2 text-xs font-black text-stone-300 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
