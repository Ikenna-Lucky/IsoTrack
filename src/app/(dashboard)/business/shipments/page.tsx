"use client";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Package, Plus, Search } from "lucide-react";
import { useShipmentManifest } from "@/hooks/use-shipment-workspace";
import { shipmentLabels } from "@/lib/business-overview";
import { shipmentMatches } from "@/lib/shipment-workspace";
import {
  ShipmentDetail,
  shipmentButton,
  shipmentField,
  shipmentPanel,
  shipmentDate,
} from "@/components/dashboard/shipment-detail";
import { shipmentMoney } from "@/lib/shipment-workspace";

export default function ShipmentsPage() {
  const manifest = useShipmentManifest();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const records = manifest.data?.pages.flatMap((page) => page.data) ?? [];
  const visible = records.filter((record) => shipmentMatches(record, search, status));
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--landing-accent)]">
            Dispatch desk
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Shipments</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--landing-muted)]">
            Follow each package from intake to handover. Open a record to review the route, people
            and dispatch actions.
          </p>
        </div>
        <Link
          href="/business/shipments/new"
          className="inline-flex items-center gap-2 rounded-md bg-amber-300 px-4 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-200"
        >
          <Plus className="size-4" />
          New shipment
        </Link>
      </header>
      <section aria-label="Search and filter shipments" className={`${shipmentPanel} p-4 sm:p-5`}>
        <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
          <label className="block text-sm">
            <span className="mb-2 block font-medium">Search loaded shipments</span>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 size-4 text-[var(--landing-muted)]" />
              <input
                className={`${shipmentField} pl-10`}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tracking ID, route, package or person"
              />
            </div>
          </label>
          <label className="block text-sm">
            <span className="mb-2 block font-medium">Status</span>
            <select
              className={shipmentField}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="active">Active deliveries</option>
              {Object.entries(shipmentLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-3 text-xs text-[var(--landing-muted)]">
          Search and filters apply to the {records.length} loaded records. Load more to search older
          shipments.
        </p>
      </section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          Shipment manifest{" "}
          <span className="ml-2 text-sm font-normal text-[var(--landing-muted)]">
            {visible.length} shown
          </span>
        </h2>
        <button
          className={shipmentButton}
          disabled={manifest.isFetching}
          onClick={() => void manifest.refetch()}
        >
          {manifest.isFetching ? "Refreshing…" : "Refresh manifest"}
        </button>
      </div>
      {manifest.isPending && (
        <p role="status" className={`${shipmentPanel} p-8`}>
          Loading shipments…
        </p>
      )}
      {manifest.isError && (
        <div role="alert" className={`${shipmentPanel} p-5 text-[var(--landing-danger)]`}>
          Could not refresh shipments.{" "}
          {records.length > 0
            ? "Previously loaded records remain below. Open a record for current details."
            : "Use Refresh manifest to try again."}
        </div>
      )}
      {!manifest.isPending && !manifest.isError && visible.length === 0 && (
        <div className={`${shipmentPanel} py-14 text-center`}>
          <Package className="mx-auto size-7 text-[var(--landing-muted)]" />
          <h3 className="mt-3 font-semibold">
            {records.length
              ? "No matches in the loaded records"
              : "Your manifest is ready for its first shipment"}
          </h3>
          <p className="mt-2 text-sm text-[var(--landing-muted)]">
            {records.length
              ? "Try another search or load older shipments."
              : "Create a shipment to begin dispatching with your private fleet."}
          </p>
        </div>
      )}
      <ul className="space-y-3">
        {visible.map((shipment) => (
          <li key={shipment.id} className={`${shipmentPanel} overflow-hidden`}>
            <button
              aria-expanded={expanded === shipment.id}
              aria-controls={`shipment-${shipment.id}`}
              onClick={() => setExpanded(expanded === shipment.id ? null : shipment.id)}
              className="flex w-full items-start gap-4 p-4 text-left hover:bg-[var(--landing-tint)] sm:p-5"
            >
              <div className="mt-1 hidden size-10 shrink-0 place-items-center rounded-md bg-[var(--landing-selection)] text-[var(--landing-accent)] sm:grid">
                <Package className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="break-all font-mono text-sm font-semibold">
                    {shipment.trackingId}
                  </span>
                  <span
                    className={`text-xs font-medium ${shipment.status === "failed" ? "text-[var(--landing-danger)]" : "text-[var(--landing-accent)]"}`}
                  >
                    {shipmentLabels[shipment.status]}
                  </span>
                </div>
                <p className="mt-2 break-words text-sm">
                  {shipment.pickupAddress.city} → {shipment.deliveryAddress.city}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-[var(--landing-muted)]">
                  {shipment.description}
                </p>
                <p className="mt-2 text-xs text-[var(--landing-muted)]">
                  {shipmentDate(shipment.createdAt)} ·{" "}
                  {shipment.isPaid ? "Payment applied" : "Payment not applied"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden text-sm font-medium sm:block">
                  {shipmentMoney(shipment.priceKobo)}
                </span>
                <ChevronDown className={`size-4 ${expanded === shipment.id ? "rotate-180" : ""}`} />
              </div>
            </button>
            {expanded === shipment.id && (
              <div
                id={`shipment-${shipment.id}`}
                className="border-t border-[var(--landing-border)] p-4 sm:p-6"
              >
                <ShipmentDetail key={shipment.id} id={shipment.id} />
              </div>
            )}
          </li>
        ))}
      </ul>
      {manifest.hasNextPage && (
        <div className="text-center">
          <button
            className={shipmentButton}
            disabled={manifest.isFetchingNextPage}
            onClick={() => void manifest.fetchNextPage()}
          >
            {manifest.isFetchingNextPage ? "Loading older shipments…" : "Load older shipments"}
          </button>
        </div>
      )}
      {manifest.data && !manifest.hasNextPage && records.length > 0 && (
        <p className="text-center text-xs text-[var(--landing-muted)]">
          All available shipments loaded · {records.length} records
        </p>
      )}
    </div>
  );
}
