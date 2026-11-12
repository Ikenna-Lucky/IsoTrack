"use client";
import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";
import { useBusinessAnalytics } from "@/hooks/use-business";
import {
  analyticsMoney,
  analyticsPercent,
  analyticsStatuses,
  analyticsSummary,
} from "@/lib/business-analytics";
import { shipmentLabels } from "@/lib/business-overview";
import { shipmentMoney } from "@/lib/shipment-workspace";
import { shipmentButton, shipmentPanel, shipmentDate } from "@/components/dashboard/shipment-ui";
import type { ShipmentStatus } from "@/types";

const muted = "text-[var(--landing-muted)]";
const barColors: Record<ShipmentStatus, string> = {
  pending: "bg-amber-400",
  assigned: "bg-teal-600",
  picked_up: "bg-teal-600",
  in_transit: "bg-teal-600",
  out_for_delivery: "bg-teal-600",
  delivered: "bg-emerald-600",
  failed: "bg-rose-500",
  cancelled: "bg-stone-500",
};
const number = (value: number) => value.toLocaleString("en-NG");
export default function AnalyticsPage() {
  const query = useBusinessAnalytics();
  const data = query.data;
  const summary = data ? analyticsSummary(data) : null;
  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--landing-accent)]">
            Business performance
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Analytics</h1>
          <p className={`mt-2 max-w-xl text-sm leading-6 ${muted}`}>
            Understand your shipment mix and see where delivery work stands across your business.
          </p>
        </div>
        <button
          type="button"
          className={`${shipmentButton} inline-flex items-center gap-2`}
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          <RefreshCw
            className={`size-4 ${query.isFetching ? "animate-spin motion-reduce:animate-none" : ""}`}
          />
          {query.isFetching ? "Refreshing…" : "Refresh analytics"}
        </button>
      </header>
      <div className={`flex flex-wrap items-center justify-between gap-2 text-xs ${muted}`}>
        <p>All time · current shipment statuses</p>
        <p role="status">
          {data && query.dataUpdatedAt
            ? `Last successful refresh: ${new Date(query.dataUpdatedAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
            : query.isPending
              ? "Loading business totals…"
              : "No figures loaded"}
        </p>
      </div>
      {query.isError && (
        <div role="alert" className={`${shipmentPanel} border-[var(--landing-danger)] p-4 text-sm`}>
          <p className="font-medium text-[var(--landing-danger)]">
            {data ? "Analytics could not be refreshed." : "Analytics are unavailable."}
          </p>
          <p className={`mt-1 leading-6 ${muted}`}>
            {data
              ? "Figures below are from the last successful refresh. Use Refresh analytics to try again."
              : "Use Refresh analytics to try again. Shipment totals will appear once they can be loaded."}
          </p>
        </div>
      )}
      {query.isPending && (
        <div
          role="status"
          aria-label="Loading analytics"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className={`${shipmentPanel} h-32 bg-[var(--landing-tint)]`} />
          ))}
        </div>
      )}
      {data && summary && (
        <>
          {data.totalShipments === 0 && (
            <section
              className={`${shipmentPanel} flex flex-wrap items-center justify-between gap-4 p-5`}
              aria-label="No shipments yet"
            >
              <div>
                <h2 className="font-semibold">Start building your delivery picture</h2>
                <p className={`mt-2 text-sm ${muted}`}>
                  Create your first shipment to begin recording dispatch activity.
                </p>
              </div>
              <Link
                href="/business/shipments/new"
                className="rounded-md bg-amber-300 px-4 py-3 text-sm font-semibold text-stone-950"
              >
                Create a shipment
              </Link>
            </section>
          )}
          <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <Metric
              label="All shipments"
              value={number(data.totalShipments)}
              detail="Every shipment in your business"
            />
            <Metric
              label="Awaiting assignment"
              value={number(summary.pending)}
              detail="Pending dispatch"
            />
            <Metric
              label="Active deliveries"
              value={number(summary.active)}
              detail="Assigned through out for delivery"
            />
            <Metric
              label="Delivered share"
              value={
                summary.deliveredShare === null ? "—" : `${summary.deliveredShare.toFixed(1)}%`
              }
              detail={`${number(summary.delivered)} delivered ÷ all shipments`}
            />
          </dl>
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
            <section
              className={`${shipmentPanel} p-5 sm:p-6`}
              aria-labelledby="status-distribution"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 id="status-distribution" className="text-lg font-semibold">
                    Current shipment mix
                  </h2>
                  <p className={`mt-2 text-sm ${muted}`}>
                    Each record is counted once, by its latest status.
                  </p>
                </div>
                <span className={`text-xs ${muted}`}>Count · share of total</span>
              </div>
              <ul className="mt-6 space-y-5">
                {analyticsStatuses.map((status) => {
                  const count = data.statusBreakdown[status] ?? 0;
                  const percent = analyticsPercent(count, data.totalShipments);
                  return (
                    <li key={status}>
                      <div className="flex items-start justify-between gap-4 text-sm">
                        <span>{shipmentLabels[status]}</span>
                        <span className="shrink-0 tabular-nums">
                          {number(count)}{" "}
                          <span className={muted}>
                            · {percent === null ? "—" : `${percent.toFixed(1)}%`}
                          </span>
                        </span>
                      </div>
                      <div
                        aria-hidden="true"
                        className="mt-2 h-2 overflow-hidden rounded-sm bg-[var(--landing-tint)]"
                      >
                        <div
                          className={`h-full ${barColors[status]}`}
                          style={{ width: `${percent ?? 0}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p
                className={`mt-6 border-t border-[var(--landing-border)] pt-4 text-xs leading-5 ${muted}`}
              >
                Delivered share includes pending, active, unsuccessful and cancelled records in its
                denominator. It is not a delivery-attempt success rate.
              </p>
            </section>
            <div className="space-y-5">
              <section className={`${shipmentPanel} p-5 sm:p-6`} aria-labelledby="shipment-value">
                <p className={`text-xs uppercase tracking-[0.12em] ${muted}`}>
                  Value of recorded work
                </p>
                <h2 id="shipment-value" className="mt-2 text-lg font-semibold">
                  Total shipment value
                </h2>
                <p className="mt-5 break-all text-3xl font-semibold tabular-nums tracking-tight text-[var(--landing-accent)]">
                  {analyticsMoney(data.totalRevenueKobo)}
                </p>
                <p className={`mt-4 text-sm leading-6 ${muted}`}>
                  Combined prices of all shipments, including unpaid, unsuccessful and cancelled
                  records. This is not money collected.
                </p>
              </section>
              <section className={`${shipmentPanel} p-5 sm:p-6`} aria-labelledby="outcomes">
                <h2 id="outcomes" className="text-lg font-semibold">
                  Unsuccessful & cancelled
                </h2>
                <dl className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <dt className={`text-sm ${muted}`}>Unsuccessful</dt>
                    <dd className="mt-2 text-2xl font-semibold tabular-nums text-[var(--landing-danger)]">
                      {number(summary.failed)}
                    </dd>
                  </div>
                  <div>
                    <dt className={`text-sm ${muted}`}>Cancelled</dt>
                    <dd className="mt-2 text-2xl font-semibold tabular-nums">
                      {number(summary.cancelled)}
                    </dd>
                  </div>
                </dl>
                <p className={`mt-4 text-xs leading-5 ${muted}`}>
                  Unsuccessful records include return journeys and completed returns. This total
                  does not tell you how many packages a driver still holds.
                </p>
                <Link
                  href="/business/shipments"
                  className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--landing-accent)]"
                >
                  Review shipment records
                  <ArrowRight className="size-4" />
                </Link>
              </section>
            </div>
          </div>
          <section className={shipmentPanel} aria-labelledby="recent-analytics-records">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--landing-border)] p-5 sm:p-6">
              <div>
                <h2 id="recent-analytics-records" className="text-lg font-semibold">
                  Latest shipment records
                </h2>
                <p className={`mt-2 text-sm ${muted}`}>
                  Up to ten most recently created shipments. Business totals above cover every
                  record.
                </p>
              </div>
              <Link
                href="/business/shipments"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--landing-accent)]"
              >
                Open shipment workspace
                <ArrowRight className="size-4" />
              </Link>
            </div>
            {data.recentShipments.length === 0 ? (
              <p className={`p-6 text-sm ${muted}`}>No shipment records yet.</p>
            ) : (
              <ul className="divide-y divide-[var(--landing-border)]">
                {data.recentShipments.map((shipment) => (
                  <li
                    key={shipment.id}
                    className="grid gap-3 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-6"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <p className="break-all font-mono text-sm font-semibold">
                          {shipment.trackingId}
                        </p>
                        <p
                          className={`text-xs ${shipment.status === "failed" ? "text-[var(--landing-danger)]" : "text-[var(--landing-accent)]"}`}
                        >
                          {shipmentLabels[shipment.status]}
                        </p>
                      </div>
                      <p className="mt-2 break-words text-sm">
                        {shipment.pickupAddress.city} → {shipment.deliveryAddress.city}
                      </p>
                      <p className={`mt-1 line-clamp-2 text-xs ${muted}`}>{shipment.description}</p>
                      <p className={`mt-2 text-xs ${muted}`}>
                        Created {shipmentDate(shipment.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 sm:block sm:text-right">
                      <p className="break-all text-sm font-medium tabular-nums">
                        {shipmentMoney(shipment.priceKobo)}
                      </p>
                      <p className={`text-xs sm:mt-2 ${muted}`}>
                        {shipment.isPaid ? "Payment applied" : "Payment not applied"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className={`${shipmentPanel} p-4 sm:p-5`}>
      <dt className={`text-sm ${muted}`}>{label}</dt>
      <dd className="mt-3">
        <span className="block break-all text-3xl font-semibold tabular-nums tracking-tight">
          {value}
        </span>
        <span className={`mt-3 block text-xs leading-5 ${muted}`}>{detail}</span>
      </dd>
    </div>
  );
}
