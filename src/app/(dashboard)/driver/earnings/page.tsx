"use client";
import { useState } from "react";
import { useDriverDeliveryQueue } from "@/hooks/use-delivery";
import { driverDate, driverWorkSummary } from "@/lib/driver-workspace";
import { shipmentLabels } from "@/lib/business-overview";
import { returnLabels } from "@/lib/shipment-exceptions";
import {
  DriverHeading,
  DriverReadState,
  DriverRecordScope,
  driverButton,
  driverField,
} from "@/components/dashboard/driver-workspace";

export default function DriverRecordPage() {
  const query = useDriverDeliveryQueue();
  const [filter, setFilter] = useState("all");
  const records = query.data?.pages.flatMap((page) => page.data) ?? [];
  const summary = driverWorkSummary(records);
  const visible = records.filter(
    (item) =>
      filter === "all" ||
      (filter === "returned" ? item.returnState === "received" : item.status === filter),
  );
  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      <DriverHeading
        eyebrow="Your assignments"
        title="Delivery record"
        action={
          <button
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
            className={driverButton}
          >
            {query.isFetching ? "Refreshing..." : "Refresh record"}
          </button>
        }
      >
        Review the assignments currently linked to your driver account, including completed
        deliveries and returns.
      </DriverHeading>
      <aside className="border-l-2 border-[var(--landing-warning)] bg-amber-300/5 p-4 text-sm leading-6 text-[var(--landing-muted)]">
        <h2 className="font-semibold text-[var(--landing-warning)]">About earnings</h2>
        <p className="mt-1">
          IsoTrack does not currently provide driver earnings, commission balances or payout
          schedules. A shipment charge is not driver pay. Confirm payment arrangements directly with
          your business.
        </p>
      </aside>
      <DriverReadState
        pending={query.isPending}
        error={query.isError}
        retry={() => void query.refetch()}
      >
        {query.data && (
          <>
            <DriverRecordScope
              count={records.length}
              more={!!query.hasNextPage}
              updatedAt={query.dataUpdatedAt}
            />
            <dl className="grid grid-cols-3 gap-3 border-y border-[var(--landing-border)] py-5">
              {[
                ["Delivered", summary.delivered.length],
                ["Returns received", summary.returned.length],
                ["Failed, still held", summary.held.length],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-sm text-[var(--landing-muted)]">{label}</dt>
                  <dd className="mt-2 text-2xl font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <label className="block max-w-sm text-sm">
              Show loaded records
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className={`${driverField} mt-2`}
              >
                <option value="all">All assignments</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed attempts</option>
                <option value="returned">Returns received</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
            {!visible.length && (
              <p className="py-6 text-sm text-[var(--landing-muted)]">
                {records.length
                  ? "No matching assignments in the loaded records. Load older assignments to continue looking."
                  : "No assignments recorded yet."}
              </p>
            )}
            <ul className="divide-y divide-[var(--landing-border)]">
              {visible.map((shipment) => (
                <li key={shipment.id} className="py-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="break-all font-mono text-sm font-semibold">
                        {shipment.trackingId}
                      </h2>
                      <p className="mt-2 text-sm text-[var(--landing-muted)]">
                        {shipment.pickupAddress.city} to {shipment.deliveryAddress.city}
                      </p>
                    </div>
                    <p className="text-sm text-[var(--landing-accent)]">
                      {shipmentLabels[shipment.status]}
                    </p>
                  </div>
                  {shipment.status === "delivered" && (
                    <p className="mt-2 text-xs text-[var(--landing-muted)]">
                      Delivered: {driverDate(shipment.actualDelivery)}
                    </p>
                  )}
                  {shipment.status === "failed" && (
                    <p className="mt-2 text-xs text-[var(--landing-muted)]">
                      Failed attempt: {driverDate(shipment.failedAt)}
                    </p>
                  )}
                  {shipment.returnState !== "none" && (
                    <p className="mt-2 text-xs text-[var(--landing-warning)]">
                      {returnLabels[shipment.returnState]}
                      {shipment.returnState === "received"
                        ? `: ${driverDate(shipment.returnedAt)}`
                        : ""}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-[var(--landing-muted)]">
                    Created: {driverDate(shipment.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
            {query.hasNextPage && (
              <button
                className={driverButton}
                disabled={query.isFetchingNextPage}
                onClick={() => void query.fetchNextPage()}
              >
                {query.isFetchingNextPage ? "Loading..." : "Load older assignments"}
              </button>
            )}
          </>
        )}
      </DriverReadState>
    </div>
  );
}
