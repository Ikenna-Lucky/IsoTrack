"use client";
import Link from "next/link";
import { Package, Truck, CheckCircle2, ArrowRight, RefreshCw } from "lucide-react";
import { useCustomerShipments } from "@/hooks/use-customer";
import { useCustomerProfileCompletion } from "@/hooks/use-profile-completion";
import { useAuthStore } from "@/store/auth";
import { customerShipmentCounts } from "@/lib/customer-workspace";
import { shipmentLabels } from "@/lib/business-overview";
import {
  WorkspaceHeading,
  WorkspaceReadState,
  workspacePanel,
  workspaceButton,
} from "@/components/dashboard/workspace-ui";
export default function CustomerOverview() {
  const query = useCustomerShipments();
  const user = useAuthStore((state) => state.user);
  const completion = useCustomerProfileCompletion();
  const records = query.data?.pages.flatMap((page) => page.data) ?? [];
  const counts = customerShipmentCounts(records);
  const current =
    records.find((item) => item.status === "out_for_delivery") ??
    records.find((item) => ["assigned", "picked_up", "in_transit"].includes(item.status));
  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      <WorkspaceHeading
        eyebrow={user?.name ?? "Customer workspace"}
        title="Your deliveries"
        action={
          <Link
            href="/customer/track"
            className={`${workspaceButton} bg-amber-300 text-stone-950! hover:bg-amber-200`}
          >
            Track a package
            <ArrowRight className="size-4" />
          </Link>
        }
      >
        Follow packages linked to your account, check handover progress and review shipment
        payments.
      </WorkspaceHeading>
      {!completion.isComplete && (
        <aside className="flex flex-wrap items-center justify-between gap-3 border-l-2 border-[var(--landing-accent)] bg-[var(--landing-selection)] p-5">
          <div>
            <p className="text-sm font-medium">Finish your customer profile</p>
            <p className="mt-1 text-xs text-[var(--landing-muted)]">
              {completion.items
                .filter((item) => !item.done)
                .map((item) => item.label)
                .join(" / ")}
            </p>
          </div>
          <Link
            href="/customer/settings"
            className="inline-flex min-h-11 items-center text-sm text-[var(--landing-accent)]"
          >
            Update details
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </aside>
      )}
      <WorkspaceReadState
        pending={query.isPending}
        error={query.isError}
        retry={() => void query.refetch()}
      >
        {query.data && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-[var(--landing-muted)]">
                Summary of {records.length} loaded linked shipments
                {query.hasNextPage ? "; more are available" : ""}. These are not lifetime totals.
              </p>
              <button
                className="grid size-11 place-items-center rounded-md border border-[var(--landing-border)]"
                aria-label="Refresh customer overview"
                disabled={query.isFetching}
                onClick={() => void query.refetch()}
              >
                <RefreshCw className="size-4" />
              </button>
            </div>
            <dl className={`${workspacePanel} grid grid-cols-1 overflow-hidden sm:grid-cols-3`}>
              {[
                ["Active deliveries", counts.active, Truck],
                ["Delivered", counts.delivered, CheckCircle2],
                ["Payment not recorded", counts.unpaid, Package],
              ].map(([label, value, Icon]) => {
                const MetricIcon = Icon as typeof Package;
                return (
                  <div
                    key={String(label)}
                    className="border-[var(--landing-border)] p-5 sm:border-l sm:first:border-l-0 sm:p-7"
                  >
                    <dt className="flex items-center justify-between gap-3 text-sm text-[var(--landing-muted)]">
                      {String(label)}
                      <MetricIcon className="size-4" />
                    </dt>
                    <dd className="mt-5 text-4xl font-medium tabular-nums tracking-tight">
                      {String(value)}
                    </dd>
                    <p className="mt-2 text-xs text-[var(--landing-muted)]">
                      Within loaded records
                    </p>
                  </div>
                );
              })}
            </dl>
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <section className={`${workspacePanel} overflow-hidden`}>
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--landing-border)] p-5 sm:px-7">
                  <h2 className="text-lg font-semibold">Recent shipments</h2>
                  <Link
                    href="/customer/shipments"
                    className="inline-flex min-h-11 items-center gap-2 text-sm text-[var(--landing-accent)]"
                  >
                    View shipments
                    <ArrowRight className="size-4" />
                  </Link>
                </header>
                {!records.length && (
                  <div className="p-7">
                    <h3 className="font-semibold">No shipments linked yet</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--landing-muted)]">
                      Ask the sender to link the shipment to this account. A tracking ID or
                      recipient email alone does not give account access.
                    </p>
                  </div>
                )}
                <ul className="divide-y divide-[var(--landing-border)]">
                  {records.slice(0, 6).map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/customer/shipments?shipment=${encodeURIComponent(item.id)}`}
                        className="flex flex-wrap items-center justify-between gap-3 p-5 hover:bg-[var(--landing-tint)] sm:px-7"
                      >
                        <div className="min-w-0">
                          <p className="break-all font-mono text-sm font-semibold">
                            {item.trackingId}
                          </p>
                          <p className="mt-2 text-xs text-[var(--landing-muted)]">
                            {item.pickupAddress.city} to {item.deliveryAddress.city}
                          </p>
                        </div>
                        <span className="text-xs text-[var(--landing-accent)]">
                          {shipmentLabels[item.status]}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
              <aside className="space-y-5">
                {current && (
                  <section className="border-l-2 border-[var(--landing-accent)] pl-5">
                    <p className="text-xs text-[var(--landing-muted)]">An active delivery</p>
                    <h2 className="mt-2 text-lg font-semibold">{shipmentLabels[current.status]}</h2>
                    <p className="mt-3 break-all font-mono text-sm">{current.trackingId}</p>
                    <p className="mt-2 text-sm text-[var(--landing-muted)]">
                      {current.pickupAddress.city} to {current.deliveryAddress.city}
                    </p>
                    <Link
                      href={`/customer/shipments?shipment=${encodeURIComponent(current.id)}`}
                      className="mt-3 inline-flex min-h-11 items-center text-sm text-[var(--landing-accent)] underline"
                    >
                      Open shipment
                    </Link>
                  </section>
                )}
                <section className={`${workspacePanel} p-5`}>
                  <h2 className="font-semibold">Receiving a package?</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--landing-muted)]">
                    Keep the recipient code private until the driver hands over the package. The
                    sending business can issue or replace the code.
                  </p>
                  <Link
                    href="/customer/track"
                    className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-[var(--landing-accent)]"
                  >
                    Check a tracking ID
                    <ArrowRight className="size-4" />
                  </Link>
                </section>
              </aside>
            </div>
            {query.hasNextPage && (
              <button
                className={workspaceButton}
                disabled={query.isFetchingNextPage}
                onClick={() => void query.fetchNextPage()}
              >
                {query.isFetchingNextPage ? "Loading..." : "Load more linked shipments"}
              </button>
            )}
          </>
        )}
      </WorkspaceReadState>
    </div>
  );
}
