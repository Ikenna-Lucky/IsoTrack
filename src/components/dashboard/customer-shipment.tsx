"use client";
import Link from "next/link";
import { useCustomerShipment, useCustomerHistory } from "@/hooks/use-customer";
import { workspaceDateTime } from "@/lib/workspace-format";
import { shipmentLabels } from "@/lib/business-overview";
import { shipmentMoney } from "@/lib/shipment-workspace";
import { returnLabels } from "@/lib/shipment-exceptions";
import { ShipmentCheckout } from "./customer-payment";
import { WorkspaceReadState, workspaceButton, workspacePanel } from "./workspace-ui";
export function CustomerShipment({
  id,
  paymentBlocked = false,
}: {
  id: string;
  paymentBlocked?: boolean;
}) {
  const query = useCustomerShipment(id);
  const history = useCustomerHistory(id);
  const shipment = query.data;
  return (
    <WorkspaceReadState
      pending={query.isPending}
      error={query.isError}
      retry={() => void query.refetch()}
    >
      {shipment && (
        <section
          className={`${workspacePanel} overflow-hidden`}
          aria-label="Linked shipment detail"
        >
          <header className="flex flex-wrap justify-between gap-4 border-b border-[var(--landing-border)] p-5 sm:p-7">
            <div>
              <p className="text-xs text-[var(--landing-muted)]">
                Linked shipment / Attempt {shipment.attemptNumber}
              </p>
              <h2 className="mt-2 break-all font-mono text-xl font-semibold">
                {shipment.trackingId}
              </h2>
              <p className="mt-2 text-sm text-[var(--landing-accent)]">
                {shipmentLabels[shipment.status]}
              </p>
            </div>
            <button
              className={workspaceButton}
              disabled={query.isFetching}
              onClick={() => {
                void query.refetch();
                void history.refetch();
              }}
            >
              Refresh shipment
            </button>
          </header>
          <div className="grid gap-6 border-b border-[var(--landing-border)] p-5 sm:grid-cols-2 sm:p-7">
            <div>
              <p className="text-xs text-[var(--landing-muted)]">From</p>
              <p className="mt-2 break-words text-sm">{shipment.pickupAddress.street}</p>
              <p className="mt-1 text-sm text-[var(--landing-muted)]">
                {shipment.pickupAddress.city}, {shipment.pickupAddress.state}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--landing-muted)]">To</p>
              <p className="mt-2 break-words text-sm">{shipment.deliveryAddress.street}</p>
              <p className="mt-1 text-sm text-[var(--landing-muted)]">
                {shipment.deliveryAddress.city}, {shipment.deliveryAddress.state}
              </p>
            </div>
          </div>
          <div className="space-y-6 p-5 sm:p-7">
            <p className="break-words text-sm leading-6">{shipment.description}</p>
            <dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[
                ["Shipment charge", shipmentMoney(shipment.priceKobo)],
                ["Payment applied", shipment.isPaid ? "Yes" : "Not recorded"],
                ["Scheduled pickup", workspaceDateTime(shipment.scheduledPickup)],
                ["Picked up", workspaceDateTime(shipment.actualPickup)],
                ["Estimated arrival", workspaceDateTime(shipment.estimatedDelivery)],
                ["Delivered", workspaceDateTime(shipment.actualDelivery)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-[var(--landing-muted)]">{label}</dt>
                  <dd className="mt-2 text-sm">{value}</dd>
                </div>
              ))}
            </dl>
            {shipment.returnState !== "none" && (
              <p className="border-l-2 border-[var(--landing-warning)] pl-4 text-sm">
                {returnLabels[shipment.returnState]}
                {shipment.returnState === "received"
                  ? ` / ${workspaceDateTime(shipment.returnedAt)}`
                  : ""}
              </p>
            )}
            {shipment.status === "failed" && (
              <p className="text-sm leading-6 text-[var(--landing-warning)]">
                The delivery attempt was unsuccessful. Contact the sending business for the next
                step. A failed attempt is not proof that the package was returned or payment
                refunded.
              </p>
            )}
            {shipment.driver && (
              <section className="border-t border-[var(--landing-border)] pt-5">
                <h3 className="font-semibold">Assigned driver</h3>
                <p className="mt-2 text-sm">{shipment.driver.user.name}</p>
                <p className="mt-1 text-sm text-[var(--landing-muted)]">
                  {shipment.driver.vehicleType} / {shipment.driver.vehiclePlate}
                </p>
                {shipment.driver.user.phone && (
                  <p className="mt-1 text-sm">Contact: {shipment.driver.user.phone}</p>
                )}
              </section>
            )}
            <section className="border-t border-[var(--landing-border)] pt-5">
              <ShipmentCheckout
                id={id}
                paid={shipment.isPaid}
                blocked={paymentBlocked}
                cancelled={shipment.status === "cancelled"}
              />
              {shipment.payment && (
                <p className="mt-3 text-xs leading-5 text-[var(--landing-muted)]">
                  Latest payment record: {shipment.payment.status} /{" "}
                  {shipmentMoney(shipment.payment.amountKobo)}. Applied payment is shown separately
                  above.
                </p>
              )}
            </section>
            <section className="border-t border-[var(--landing-border)] pt-5">
              <h3 className="font-semibold">Shipment history</h3>
              <p className="mt-1 text-xs text-[var(--landing-muted)]">
                Recorded events, newest first. Times use your device timezone.
              </p>
              {history.isPending && (
                <p role="status" className="mt-3 text-sm">
                  Loading history...
                </p>
              )}
              {history.isError && (
                <p role="alert" className="mt-3 text-sm text-[var(--landing-danger)]">
                  Could not load history.{" "}
                  <button className="min-h-11 underline" onClick={() => void history.refetch()}>
                    Retry history
                  </button>
                </p>
              )}
              <ol className="mt-5 border-l border-[var(--landing-border)] pl-5">
                {history.data?.pages
                  .flatMap((page) => page.data)
                  .map((event) => (
                    <li key={event.id} className="relative pb-5">
                      <span className="absolute -left-[25px] top-1 size-2 rounded-full bg-[var(--landing-accent)]" />
                      <p className="text-sm font-medium">{event.message}</p>
                      <p className="mt-1 text-xs text-[var(--landing-muted)]">
                        {shipmentLabels[event.status]} / {workspaceDateTime(event.createdAt)}
                      </p>
                    </li>
                  ))}
              </ol>
              {history.data && !history.data.pages.some((page) => page.data.length > 0) && (
                <p className="text-sm text-[var(--landing-muted)]">No events recorded.</p>
              )}
              {history.hasNextPage && (
                <button
                  className={workspaceButton}
                  disabled={history.isFetchingNextPage}
                  onClick={() => void history.fetchNextPage()}
                >
                  Load older events
                </button>
              )}
            </section>
            <aside className="border-l-2 border-[var(--landing-accent)] pl-4 text-sm leading-6 text-[var(--landing-muted)]">
              Only the assigned driver can confirm handover with the recipient code. If you are
              receiving the package, give the code to the driver at physical handover. Contact the
              sending business if the code is unavailable.
              <Link
                href={`/customer/track?id=${encodeURIComponent(shipment.trackingId)}`}
                className="mt-2 block min-h-11 text-[var(--landing-accent)] underline"
              >
                View public tracking record
              </Link>
            </aside>
          </div>
        </section>
      )}
    </WorkspaceReadState>
  );
}
