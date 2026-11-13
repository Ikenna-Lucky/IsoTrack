"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Package,
  Plus,
  RefreshCw,
  Truck,
} from "lucide-react";
import { useBusinessAnalytics, useBusinessProfile } from "@/hooks/use-business";
import { useOverviewShipments } from "@/hooks/use-business-overview";
import { useBusinessProfileCompletion } from "@/hooks/use-profile-completion";
import { overviewCounts, shipmentLabels } from "@/lib/business-overview";
import { formatKobo, type ShipmentStatus } from "@/types";
import { cn } from "@/lib/utils";

const panel = "rounded-xl border border-[var(--landing-border)] bg-[var(--landing-panel)]";
const muted = "text-[var(--landing-muted)]";

function Notice({ title, onRetry }: { title: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--landing-border)] bg-[var(--landing-tint)] p-4 text-sm"
    >
      <AlertCircle className="size-5 shrink-0 text-[var(--landing-warning)]" />
      <span className="flex-1">{title}</span>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-11 px-3 font-medium text-[var(--landing-accent)] underline underline-offset-4"
      >
        Try again
      </button>
    </div>
  );
}

function Status({ status }: { status: ShipmentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap text-xs",
        status === "failed"
          ? "text-[var(--landing-danger)]"
          : status === "pending"
            ? "text-[var(--landing-warning)]"
            : status === "cancelled"
              ? muted
              : "text-[var(--landing-accent)]",
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current" />
      {shipmentLabels[status]}
    </span>
  );
}

export default function BusinessOverviewPage() {
  const analytics = useBusinessAnalytics();
  const profile = useBusinessProfile();
  const completion = useBusinessProfileCompletion();
  const history = useOverviewShipments();
  const counts = analytics.data ? overviewCounts(analytics.data.statusBreakdown) : null;
  const shipments = history.data?.pages.flatMap((page) => page.data) ?? [];
  const total = analytics.data?.totalShipments;
  const fetching = analytics.isFetching || history.isFetching || profile.isFetching;

  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className={cn("mb-2 text-sm", muted)}>
            {profile.data?.businessName ?? "Your business"}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Delivery overview<span className="text-[var(--landing-accent)]">.</span>
          </h1>
          <p className={cn("mt-3 max-w-xl text-sm leading-6", muted)}>
            A clear view of your shipments, from assignment to handover.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={fetching}
            onClick={() => {
              void analytics.refetch();
              void history.refetch();
              void profile.refetch();
            }}
            aria-label="Refresh overview"
            className="grid size-11 place-items-center rounded-md border border-[var(--landing-border)] hover:bg-[var(--landing-tint)] disabled:opacity-50"
          >
            <RefreshCw
              className={cn("size-4", fetching && "animate-spin motion-reduce:animate-none")}
            />
          </button>
          <Link
            href="/business/shipments/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-amber-300 px-5 text-sm font-semibold text-stone-950 hover:bg-amber-200"
          >
            <Plus className="size-4" />
            New shipment
          </Link>
        </div>
      </div>

      {profile.isError && (
        <Notice
          title="Business details could not be loaded."
          onRetry={() => void profile.refetch()}
        />
      )}
      {profile.data && !completion.isComplete && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-l-2 border-[var(--landing-accent)] bg-[var(--landing-selection)] px-5 py-4">
          <div>
            <p className="text-sm font-medium">Finish your business profile</p>
            <p className={cn("mt-1 text-xs leading-5", muted)}>
              {completion.items
                .filter((item) => !item.done)
                .map((item) => item.label)
                .join(" · ")}
            </p>
          </div>
          <Link
            href="/business/settings"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--landing-accent)]"
          >
            Update details
            <ArrowRight className="size-4" />
          </Link>
        </div>
      )}

      {analytics.isError && (
        <Notice
          title={
            analytics.data
              ? "Summary refresh failed. Showing the last loaded totals."
              : "Shipment totals are unavailable. Please retry."
          }
          onRetry={() => void analytics.refetch()}
        />
      )}
      <section
        aria-label="Shipment summary"
        aria-busy={analytics.isPending}
        className={cn(panel, "grid grid-cols-2 overflow-hidden xl:grid-cols-4")}
      >
        {[
          { label: "All shipments", value: total, Icon: Package, detail: "Across your business" },
          {
            label: "Awaiting assignment",
            value: counts?.pending,
            Icon: Clock3,
            detail: "Ready for dispatch",
          },
          {
            label: "Active deliveries",
            value: counts?.active,
            Icon: Truck,
            detail: "Assigned through out for delivery",
          },
          {
            label: "Delivered",
            value: counts?.delivered,
            Icon: CheckCircle2,
            detail: "Completed handovers",
          },
        ].map(({ label, value, Icon, detail }, index) => (
          <div
            key={label}
            className={cn(
              "min-w-0 border-[var(--landing-border)] p-4 sm:p-7",
              index % 2 === 1 && "border-l",
              index === 2 && "border-t xl:border-l xl:border-t-0",
              index === 3 && "border-t xl:border-t-0",
            )}
          >
            <div
              className={cn(
                "flex min-h-10 items-center justify-between gap-2 text-xs sm:min-h-0 sm:text-sm",
                muted,
              )}
            >
              <span>{label}</span>
              <Icon className="hidden size-4 shrink-0 sm:block" />
            </div>
            <p className="mt-3 text-3xl font-medium tabular-nums tracking-tight sm:mt-5 sm:text-4xl">
              {value === undefined ? (
                <span aria-label={analytics.isPending ? "Loading" : "Unavailable"}>—</span>
              ) : (
                value.toLocaleString("en-NG")
              )}
            </p>
            <p className={cn("mt-2 text-xs leading-5", muted)}>{detail}</p>
          </div>
        ))}
      </section>

      {!!counts?.failed && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-l-2 border-[var(--landing-warning)] pl-4 xl:hidden">
          <p className="text-sm">
            <span className="font-semibold text-[var(--landing-danger)]">
              {counts.failed} unsuccessful deliveries
            </span>
            <span className={cn("mt-1 block text-xs", muted)}>
              Review the next step with your driver.
            </span>
          </p>
          <Link
            href="/business/shipments"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-[var(--landing-accent)]"
          >
            Review
            <ArrowRight className="size-4" />
          </Link>
        </div>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className={panel} aria-labelledby="shipment-heading">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--landing-border)] p-5 sm:px-7">
            <div>
              <h2 id="shipment-heading" className="text-lg font-semibold">
                Recent shipments
              </h2>
              <p className={cn("mt-1 text-xs", muted)}>Newest first · {shipments.length} loaded</p>
            </div>
            <Link
              href="/business/shipments"
              className="inline-flex min-h-11 items-center gap-2 text-sm text-[var(--landing-accent)]"
            >
              Shipment workspace
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
          {history.isPending && (
            <div role="status" className={cn("space-y-4 p-7 text-sm", muted)}>
              <p>Loading shipments…</p>
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-14 rounded-md bg-[var(--landing-tint)]" />
              ))}
            </div>
          )}
          {history.isError && (
            <div className="p-5">
              <Notice
                title={
                  shipments.length
                    ? "Could not load more shipments. Your loaded records are still shown."
                    : "Could not load shipments."
                }
                onRetry={() => {
                  if (history.isFetchNextPageError) void history.fetchNextPage();
                  else void history.refetch();
                }}
              />
            </div>
          )}
          {!history.isPending && !history.isError && !shipments.length && (
            <div className="px-6 py-16 text-center">
              <Package className="mx-auto size-9 text-[var(--landing-accent)]" />
              <h3 className="mt-5 text-lg font-medium">Your first delivery starts here</h3>
              <p className={cn("mx-auto mt-2 max-w-sm text-sm leading-6", muted)}>
                Create a shipment, then assign a driver from your private fleet.
              </p>
              <Link
                href="/business/shipments/new"
                className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--landing-accent)]"
              >
                Create a shipment
                <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
          {shipments.length > 0 && (
            <ul className="divide-y divide-[var(--landing-border)]">
              {shipments.map((shipment) => (
                <li
                  key={shipment.id}
                  className="grid gap-3 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-7"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-medium">{shipment.trackingId}</p>
                    <p
                      className={cn(
                        "mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-5",
                        muted,
                      )}
                    >
                      <span className="inline-flex items-center gap-1">
                        <ArrowUpRight className="size-3" />
                        {shipment.pickupAddress.city}
                      </span>
                      <span aria-hidden="true">→</span>
                      <span>{shipment.deliveryAddress.city}</span>
                    </p>
                    <p className={cn("mt-1 truncate text-xs", muted)}>{shipment.description}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-2">
                    <Status status={shipment.status} />
                    <p className="text-sm tabular-nums">{formatKobo(shipment.priceKobo)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {history.hasNextPage && (
            <div className="border-t border-[var(--landing-border)] p-4 text-center">
              <button
                type="button"
                disabled={history.isFetchingNextPage}
                onClick={() => void history.fetchNextPage()}
                className="min-h-11 rounded-md border border-[var(--landing-border)] px-6 text-sm font-medium hover:bg-[var(--landing-tint)] disabled:opacity-50"
              >
                {history.isFetchingNextPage ? "Loading…" : "Load more shipments"}
              </button>
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className={cn(panel, "p-6")} aria-labelledby="attention-heading">
            <div className="flex items-center justify-between">
              <h2 id="attention-heading" className="text-lg font-semibold">
                Keep in view
              </h2>
              <AlertCircle className="size-5 text-[var(--landing-warning)]" />
            </div>
            <div className="mt-6 flex items-baseline gap-3">
              <p className="text-4xl font-medium tabular-nums">{counts?.failed ?? "—"}</p>
              <p className="text-sm text-[var(--landing-danger)]">unsuccessful deliveries</p>
            </div>
            <p className={cn("mt-4 text-sm leading-6", muted)}>
              Review unsuccessful deliveries before deciding on a retry or return. A package may
              still be with its driver.
            </p>
            <Link
              href="/business/shipments"
              className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--landing-accent)]"
            >
              Review shipments
              <ArrowRight className="size-4" />
            </Link>
            <div
              className={cn(
                "mt-4 flex items-center justify-between border-t border-[var(--landing-border)] pt-4 text-xs",
                muted,
              )}
            >
              <span>Cancelled shipments</span>
              <span className="tabular-nums">{counts?.cancelled ?? "—"}</span>
            </div>
          </section>
          <section className="px-1 py-2" aria-labelledby="value-heading">
            <h2 id="value-heading" className={cn("text-sm", muted)}>
              Total shipment value
            </h2>
            <p className="mt-3 break-words text-3xl font-medium tabular-nums tracking-tight">
              {analytics.data ? formatKobo(analytics.data.totalRevenueKobo) : "—"}
            </p>
            <p className={cn("mt-3 text-xs leading-5", muted)}>
              Combined prices of all shipments, including unpaid and cancelled records. This is not
              money collected.
            </p>
          </section>
          <section className="border-t border-[var(--landing-border)] px-1 pt-5">
            <Truck className="size-5 text-[var(--landing-accent)]" />
            <h2 className="mt-3 text-base font-semibold">Built around your fleet</h2>
            <p className={cn("mt-2 text-sm leading-6", muted)}>
              View your drivers and their availability before assigning the next delivery.
            </p>
            <Link
              href="/business/drivers"
              className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-[var(--landing-accent)]"
            >
              Open private fleet
              <ArrowRight className="size-4" />
            </Link>
          </section>
        </div>
      </div>
      <p className={cn("flex flex-wrap items-center gap-2 text-xs leading-5", muted)}>
        <ArrowDownLeft className="size-3.5" />
        Summary totals cover all shipments. The recent list loads in batches of six.
      </p>
    </div>
  );
}
