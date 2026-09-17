"use client";

import { useMemo, useState } from "react";
import { Bike, Car, Grid2X2, List, Loader2, Search, Star, Truck } from "lucide-react";
import { getShipmentList, useShipments } from "@/hooks/use-shipments";
import { useDrivers } from "@/hooks/use-driver";
import type { Driver, DriverStatus, VehicleType } from "@/types";
import { cn } from "@/lib/utils";

type StatusFilter = DriverStatus | "all";

const STATUS_META: Record<DriverStatus, { label: string; tone: string; dot: string }> = {
  available: { label: "Available", tone: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200", dot: "bg-emerald-300" },
  on_delivery: { label: "On delivery", tone: "border-teal-400/25 bg-teal-400/10 text-teal-200", dot: "bg-teal-300" },
  offline: { label: "Offline", tone: "border-stone-600 bg-white/[0.04] text-stone-400", dot: "bg-stone-500" },
};

const VEHICLE_ICONS: Record<VehicleType, typeof Truck> = {
  bike: Bike,
  car: Car,
  van: Truck,
  truck: Truck,
};

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "DV";
}

function DriverCard({
  driver,
  earnings,
  activeTrackingId,
  list,
}: {
  driver: Driver;
  earnings: number;
  activeTrackingId: string | null;
  list?: boolean;
}) {
  const status = STATUS_META[driver.status];
  const VehicleIcon = VEHICLE_ICONS[driver.vehicleType] ?? Truck;

  return (
    <article className={cn("rounded-md border border-white/[0.07] bg-[#0d1412] p-4", list && "grid gap-4 sm:grid-cols-[1fr,auto] sm:items-center")}>
      <div className="flex min-w-0 items-start gap-3">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-teal-400/10 text-sm font-black text-teal-200 ring-1 ring-teal-400/20">
          {initials(driver.user.name)}
          <span className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[#0d1412]", status.dot)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-black text-stone-50">{driver.user.name}</h3>
            <span className={cn("rounded border px-2 py-0.5 text-[10px] font-black", status.tone)}>{status.label}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <VehicleIcon className="h-3.5 w-3.5 text-stone-600" />
              {driver.vehicleType}
            </span>
            <span className="font-mono">{driver.vehiclePlate}</span>
            <span className="flex items-center gap-1 text-amber-200">
              <Star className="h-3.5 w-3.5 fill-amber-200" />
              {driver.rating.toFixed(1)}
            </span>
          </div>
          {activeTrackingId && (
            <p className="mt-3 rounded-md border border-teal-400/20 bg-teal-400/10 px-2.5 py-1.5 font-mono text-[11px] font-black text-teal-100">
              Active: {activeTrackingId}
            </p>
          )}
        </div>
      </div>

      <div className={cn("mt-4 grid grid-cols-2 gap-2", list && "mt-0 min-w-56")}>
        <div className="rounded-md border border-white/[0.07] bg-white/[0.03] p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-stone-600">Deliveries</p>
          <p className="mt-1 text-sm font-black text-stone-100">{driver.totalDeliveries}</p>
        </div>
        <div className="rounded-md border border-white/[0.07] bg-white/[0.03] p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-stone-600">Earnings</p>
          <p className="mt-1 text-sm font-black text-stone-100">{formatNaira(earnings)}</p>
        </div>
      </div>
    </article>
  );
}

export default function DriversPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const { data: drivers = [], isLoading: driversLoading } = useDrivers();
  const { data: shipmentsData, isLoading: shipmentsLoading } = useShipments({ pageSize: 200 });
  const shipments = getShipmentList(shipmentsData);
  const loading = driversLoading || shipmentsLoading;

  const driverStats = useMemo(() => {
    return new Map(
      drivers.map((driver) => {
        const assigned = shipments.filter((shipment) => shipment.driverId === driver.id);
        const active = assigned.find((shipment) => ["assigned", "picked_up", "in_transit", "out_for_delivery"].includes(shipment.status));
        const earnings = assigned
          .filter((shipment) => shipment.status === "delivered")
          .reduce((sum, shipment) => sum + Math.round(shipment.priceKobo * 0.4), 0);
        return [driver.id, { activeTrackingId: active?.trackingId ?? null, earnings }];
      }),
    );
  }, [drivers, shipments]);

  const filtered = drivers.filter((driver) => {
    const q = search.trim().toLowerCase();
    const matchesStatus = statusFilter === "all" || driver.status === statusFilter;
    const matchesSearch =
      !q ||
      driver.user.name.toLowerCase().includes(q) ||
      driver.vehiclePlate.toLowerCase().includes(q) ||
      driver.vehicleType.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const counts = {
    all: drivers.length,
    available: drivers.filter((driver) => driver.status === "available").length,
    on_delivery: drivers.filter((driver) => driver.status === "on_delivery").length,
    offline: drivers.filter((driver) => driver.status === "offline").length,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr,360px] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-200">Fleet roster</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-50 sm:text-3xl">Drivers</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
              See availability, vehicle details, active assignments, and delivery performance for your driver pool.
            </p>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-600" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search driver, plate, vehicle"
              className="w-full rounded-md border border-white/[0.08] bg-black/25 py-3 pl-10 pr-3 text-sm font-bold text-stone-100 outline-none transition placeholder:text-stone-700 focus:border-teal-400/40 focus:ring-2 focus:ring-teal-400/10"
            />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2 overflow-x-auto">
          {([
            ["all", "All"],
            ["available", "Available"],
            ["on_delivery", "On delivery"],
            ["offline", "Offline"],
          ] as Array<[StatusFilter, string]>).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-xs font-black transition",
                statusFilter === value
                  ? "border-teal-400/30 bg-teal-400/10 text-teal-100"
                  : "border-white/[0.07] bg-white/[0.03] text-stone-500 hover:text-stone-200",
              )}
            >
              {label}
              <span className={cn("rounded px-1.5 py-0.5 text-[10px]", statusFilter === value ? "bg-teal-300 text-black" : "bg-white/[0.06] text-stone-500")}>
                {counts[value]}
              </span>
            </button>
          ))}
        </div>
        <div className="flex rounded-md border border-white/[0.07] bg-white/[0.03] p-1">
          <button onClick={() => setView("grid")} className={cn("rounded px-2.5 py-1.5", view === "grid" ? "bg-teal-400/10 text-teal-100" : "text-stone-600")}>
            <Grid2X2 className="h-4 w-4" />
          </button>
          <button onClick={() => setView("list")} className={cn("rounded px-2.5 py-1.5", view === "list" ? "bg-teal-400/10 text-teal-100" : "text-stone-600")}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-md border border-white/[0.07] bg-[#0d1412] py-16">
          <Loader2 className="h-6 w-6 animate-spin text-teal-200" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-md border border-white/[0.07] bg-[#0d1412] px-5 py-14 text-center">
          <Truck className="mx-auto h-6 w-6 text-stone-700" />
          <p className="mt-3 text-sm font-black text-stone-200">No drivers match this view</p>
        </div>
      ) : (
        <div className={cn(view === "grid" ? "grid gap-3 md:grid-cols-2 xl:grid-cols-3" : "space-y-3")}>
          {filtered.map((driver) => {
            const stats = driverStats.get(driver.id);
            return (
              <DriverCard
                key={driver.id}
                driver={driver}
                earnings={stats?.earnings ?? 0}
                activeTrackingId={stats?.activeTrackingId ?? null}
                list={view === "list"}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
