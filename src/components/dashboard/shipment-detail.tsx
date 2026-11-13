"use client";
import { useWorkspaceDate } from "@/providers/business-preferences-provider";
import { useState } from "react";
import { ShipmentLiveTracking } from "./shipment-live-tracking";
import { trackingAllowed } from "@/lib/live-tracking";
import { ShipmentExceptions } from "./shipment-exceptions";
import { useWorkflowPending } from "@/hooks/use-workflow-request";
import { DeliveryConfirmation } from "./delivery-confirmation";
import { useQueryClient } from "@tanstack/react-query";
import { usePendingShipmentAction } from "@/hooks/use-pending-shipment-action";
import {
  useDispatchDrivers,
  useShipmentAction,
  useShipmentHistory,
  useWorkspaceShipment,
  type ShipmentAction,
} from "@/hooks/use-shipment-workspace";
import { uncertainShipmentError } from "@/lib/shipment-workspace";
import { shipmentLabels } from "@/lib/business-overview";
import { extractErrorMessage } from "@/lib/errors";
import { shipmentMoney } from "@/lib/shipment-workspace";

import { shipmentButton, shipmentField } from "./shipment-ui";
export { shipmentButton, shipmentField, shipmentPanel } from "./shipment-ui";

export function ShipmentDetail({ id }: { id: string }) {
  const shipmentDate = useWorkspaceDate();
  const cache = useQueryClient();
  const workflowPending = useWorkflowPending(id);
  const detail = useWorkspaceShipment(id);
  const history = useShipmentHistory(id);
  const shipment = detail.data;
  const drivers = useDispatchDrivers(shipment?.status === "pending");
  const action = useShipmentAction();
  const [driverId, setDriverId] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [pending, setPending] = usePendingShipmentAction(id);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [needsReload, setNeedsReload] = useState(false);
  async function execute(command: ShipmentAction) {
    if (!setPending(command)) {
      setError("Resolve the pending shipment action before starting another.");
      return;
    }
    setError("");
    setNotice("");
    try {
      await action.mutateAsync(command);
      setPending(null, command);
      setCancelOpen(false);
      setDriverId("");
      setNotice(
        command.kind === "assign"
          ? "Assignment confirmed. Reloading the current shipment."
          : "Cancellation confirmed. Reloading the current shipment.",
      );
      await detail.refetch();
    } catch (err) {
      setError(extractErrorMessage(err, "The action could not be confirmed."));
      if (!uncertainShipmentError(err)) {
        setPending(null, command);
        setNeedsReload(true);
      }
    }
  }
  if (detail.isPending) return <p role="status">Loading shipment details…</p>;
  if (!shipment || detail.isError)
    return (
      <div role="alert">
        <p>Could not load current shipment details.</p>
        <button className={shipmentButton} onClick={() => void detail.refetch()}>
          Retry details
        </button>
        {pending && (
          <div className="mt-4 space-y-3">
            <p className="text-sm">
              A {pending.kind} request is still unresolved. You can recover its result without
              loading the current details first.
            </p>
            <button
              className={shipmentButton}
              disabled={action.isPending}
              onClick={() => void execute(pending)}
            >
              {action.isPending ? "Confirming action…" : "Retry same action"}
            </button>
            {error && <p className="text-sm text-[var(--landing-danger)]">{error}</p>}
          </div>
        )}
      </div>
    );
  const available = drivers.data?.pages.flatMap((page) => page.data) ?? [];
  const canAct = !workflowPending && !needsReload && !action.isPending && !detail.isFetching;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--landing-muted)]">
            Current shipment
          </p>
          <h3 className="mt-1 font-mono text-lg font-semibold break-all">{shipment.trackingId}</h3>
        </div>
        <span className="text-sm font-medium text-[var(--landing-accent)]">
          {shipmentLabels[shipment.status]}
        </span>
      </div>
      {trackingAllowed(shipment.status, shipment.returnState) && (
        <ShipmentLiveTracking key={shipment.trackingId} trackingId={shipment.trackingId} />
      )}
      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h4 className="font-semibold">Pickup</h4>
          <p className="mt-2 break-words">{shipment.pickupAddress.street}</p>
          <p className="text-sm text-[var(--landing-muted)]">
            {shipment.pickupAddress.city}, {shipment.pickupAddress.state}
          </p>
        </section>
        <section>
          <h4 className="font-semibold">Delivery</h4>
          <p className="mt-2 break-words">{shipment.deliveryAddress.street}</p>
          <p className="text-sm text-[var(--landing-muted)]">
            {shipment.deliveryAddress.city}, {shipment.deliveryAddress.state}
          </p>
        </section>
      </div>
      <section className="border-t border-[var(--landing-border)] pt-5">
        <h4 className="font-semibold">Package & charge</h4>
        <p className="mt-2 whitespace-pre-wrap break-words text-sm">{shipment.description}</p>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <Fact label="Weight" value={`${shipment.weightKg} kg`} />
          <Fact label="Shipment value" value={shipmentMoney(shipment.priceKobo)} />
          <Fact label="Payment applied" value={shipment.isPaid ? "Yes" : "No"} />
          {shipment.dimensions && (
            <Fact
              label="Dimensions (stored values)"
              value={`${shipment.dimensions.length} × ${shipment.dimensions.width} × ${shipment.dimensions.height}`}
            />
          )}
        </dl>
        {shipment.payment ? (
          <p className="mt-3 text-sm text-[var(--landing-muted)]">
            Latest payment: {shipment.payment.status} · {shipmentMoney(shipment.payment.amountKobo)}
            {shipment.payment.channel ? ` · ${shipment.payment.channel}` : ""} · recorded{" "}
            {shipmentDate(shipment.payment.createdAt)} · paid{" "}
            {shipmentDate(shipment.payment.paidAt)}. Provider status and payment applied are
            separate.
          </p>
        ) : (
          <p className="mt-3 text-sm text-[var(--landing-muted)]">No payment record.</p>
        )}
      </section>
      <section className="border-t border-[var(--landing-border)] pt-5">
        <h4 className="font-semibold">People</h4>
        <dl className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
          <Fact
            label="Customer account"
            value={
              shipment.customer
                ? `${shipment.customer.name} · ${shipment.customer.email}${shipment.customer.phone ? ` · ${shipment.customer.phone}` : ""}`
                : "No linked customer account"
            }
          />
          <Fact
            label="Recipient confirmation email"
            value={shipment.recipientEmail ?? "Not provided"}
          />
          <Fact
            label="Assigned driver"
            value={
              shipment.driver
                ? `${shipment.driver.user.name} · ${shipment.driver.vehicleType} · ${shipment.driver.vehiclePlate}${shipment.driver.user.phone ? ` · ${shipment.driver.user.phone}` : ""} · ${shipment.driver.user.email}`
                : "Unassigned"
            }
          />
        </dl>
      </section>
      <details className="border-t border-[var(--landing-border)] pt-5">
        <summary className="cursor-pointer font-semibold">Dates & delivery context</summary>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          {(
            [
              ["Created", shipment.createdAt],
              ["Updated", shipment.updatedAt],
              ["Scheduled pickup", shipment.scheduledPickup],
              ["Actual pickup", shipment.actualPickup],
              ["Estimated delivery", shipment.estimatedDelivery],
              ["Actual delivery", shipment.actualDelivery],
              ["Failed", shipment.failedAt],
              ["Returned", shipment.returnedAt],
            ] as const
          ).map(([label, value]) => (
            <Fact key={label} label={label} value={shipmentDate(value)} />
          ))}
          <Fact label="Attempt" value={String(shipment.attemptNumber)} />
          <Fact label="Return state" value={shipment.returnState.replaceAll("_", " ")} />
          <Fact
            label="Failure reason"
            value={shipment.failureReason?.replaceAll("_", " ") ?? "None recorded"}
          />
          {shipment.currentLocation && (
            <Fact
              label="Last reported coordinates (not live)"
              value={`${shipment.currentLocation.lat}, ${shipment.currentLocation.lng}`}
            />
          )}
        </dl>
      </details>
      {(["pending", "assigned"].includes(shipment.status) ||
        pending ||
        needsReload ||
        notice ||
        error) && (
        <section className="border-t border-[var(--landing-border)] pt-5">
          <h4 className="font-semibold">Dispatch</h4>
          {shipment.status === "pending" && !shipment.driverId && (
            <div className="mt-3 space-y-3">
              <label className="block text-sm" htmlFor={`dispatch-${id}`}>
                Available private fleet driver
              </label>
              <select
                id={`dispatch-${id}`}
                value={driverId}
                onChange={(event) => setDriverId(event.target.value)}
                disabled={!canAct}
                className={shipmentField}
              >
                <option value="">Select a driver</option>
                {available.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.user.name} · {driver.vehiclePlate}
                  </option>
                ))}
              </select>
              {drivers.isPending && (
                <p role="status" className="text-sm">
                  Loading available drivers…
                </p>
              )}
              {drivers.isError && (
                <div role="alert" className="text-sm">
                  Could not load available drivers.{" "}
                  <button className={shipmentButton} onClick={() => void drivers.refetch()}>
                    Retry drivers
                  </button>
                </div>
              )}
              {!drivers.isPending && !drivers.isError && available.length === 0 && (
                <p className="text-sm text-[var(--landing-muted)]">
                  No available drivers were returned.
                </p>
              )}
              {drivers.hasNextPage && (
                <button
                  className={shipmentButton}
                  disabled={drivers.isFetchingNextPage}
                  onClick={() => void drivers.fetchNextPage()}
                >
                  Load more available drivers
                </button>
              )}
              <button
                className={shipmentButton}
                disabled={!driverId || !canAct}
                onClick={() =>
                  void execute({
                    key: crypto.randomUUID(),
                    kind: "assign",
                    id,
                    body: { driverId, expectedVersion: shipment.version },
                  })
                }
              >
                Assign driver
              </button>
            </div>
          )}
          {(["pending", "assigned"] as string[]).includes(shipment.status) && (
            <div className="mt-4">
              {cancelOpen ? (
                <div className="space-y-3">
                  <p className="text-sm">
                    Cancel this shipment? The record and history will be preserved. The backend
                    checks its current state.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={shipmentButton}
                      disabled={!canAct}
                      onClick={() =>
                        void execute({
                          key: crypto.randomUUID(),
                          kind: "cancel",
                          id,
                          body: { expectedVersion: shipment.version },
                        })
                      }
                    >
                      Confirm cancellation
                    </button>
                    <button
                      className={shipmentButton}
                      disabled={!!pending}
                      onClick={() => setCancelOpen(false)}
                    >
                      Keep shipment
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className={shipmentButton}
                  disabled={!canAct}
                  onClick={() => setCancelOpen(true)}
                >
                  Cancel shipment
                </button>
              )}
            </div>
          )}
          {action.isPending && (
            <p role="status" className="mt-3 text-sm">
              Confirming action…
            </p>
          )}
          {notice && (
            <p role="status" className="mt-3 text-sm text-[var(--landing-accent)]">
              {notice}
            </p>
          )}
          {error && (
            <p role="alert" className="mt-3 text-sm text-[var(--landing-danger)]">
              {error}
            </p>
          )}
          {pending && !action.isPending && (
            <div className="mt-3 space-y-3">
              <p className="text-sm">
                The result is uncertain. Retry the same {pending.kind} request to recover its
                result. Keep this page open until resolved.
              </p>
              <button className={shipmentButton} onClick={() => void execute(pending)}>
                Retry same action
              </button>
            </div>
          )}
          {needsReload && (
            <div className="mt-3">
              <p className="text-sm">Reload the current details before making a new decision.</p>
              <button
                className={shipmentButton}
                disabled={detail.isFetching}
                onClick={async () => {
                  const result = await detail.refetch();
                  if (!result.isError) {
                    setNeedsReload(false);
                    setError("");
                    setDriverId("");
                    setCancelOpen(false);
                    void cache.invalidateQueries({ queryKey: ["shipments", "business-manifest"] });
                    void cache.invalidateQueries({
                      queryKey: ["shipments", "workspace-history", id],
                    });
                  }
                }}
              >
                Reload shipment
              </button>
            </div>
          )}
        </section>
      )}
      <DeliveryConfirmation id={id} role="business" />
      <ShipmentExceptions id={id} role="business" />
      <section className="border-t border-[var(--landing-border)] pt-5">
        <h4 className="font-semibold">Shipment history</h4>
        <p className="mt-1 text-xs text-[var(--landing-muted)]">
          Newest first · loaded in batches of 20
        </p>
        {history.isPending && (
          <p role="status" className="mt-3 text-sm">
            Loading history…
          </p>
        )}
        {history.isError && (
          <div role="alert" className="mt-3 text-sm">
            Could not load history.{" "}
            <button className={shipmentButton} onClick={() => void history.refetch()}>
              Retry history
            </button>
          </div>
        )}
        <ol className="mt-4 space-y-4">
          {history.data?.pages
            .flatMap((page) => page.data)
            .map((event) => (
              <li key={event.id} className="border-l-2 border-[var(--landing-border)] pl-4">
                <p className="text-sm font-medium">
                  {event.message || shipmentLabels[event.status]}
                </p>
                <p className="mt-1 text-xs text-[var(--landing-muted)]">
                  {shipmentLabels[event.status]} · {shipmentDate(event.createdAt)}
                </p>
                {event.location && (
                  <p className="text-xs text-[var(--landing-muted)]">
                    {event.location.lat}, {event.location.lng}
                  </p>
                )}
              </li>
            ))}
        </ol>
        {history.data && !history.data.pages[0]?.data.length && (
          <p className="text-sm text-[var(--landing-muted)]">No history recorded.</p>
        )}
        {history.hasNextPage && (
          <button
            className={`${shipmentButton} mt-4`}
            disabled={history.isFetchingNextPage}
            onClick={() => void history.fetchNextPage()}
          >
            {history.isFetchingNextPage ? "Loading…" : "Load older events"}
          </button>
        )}
      </section>
    </div>
  );
}
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[var(--landing-muted)]">{label}</dt>
      <dd className="mt-1 break-words">{value}</dd>
    </div>
  );
}
