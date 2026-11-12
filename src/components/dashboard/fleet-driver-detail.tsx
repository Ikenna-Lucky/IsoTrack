"use client";
import { useWorkspaceDate } from "@/providers/business-preferences-provider";
import { useFleetAssignments } from "@/hooks/use-fleet";
import { driverHasCustody, type FleetDriver } from "@/lib/fleet-contract";
import { shipmentLabels } from "@/lib/business-overview";
import { FleetDialog } from "./fleet-dialog";

export function FleetDriverDetail({
  driver,
  onClose,
}: {
  driver: FleetDriver;
  onClose: () => void;
}) {
  const shipmentDate = useWorkspaceDate();
  const work = useFleetAssignments();
  const loaded = work.data?.pages.flatMap((page) => page.data) ?? [];
  const assignments = loaded.filter(
    (shipment) => shipment.driverId === driver.id && driverHasCustody(shipment),
  );
  const fields = [
    ["Availability", driver.status.replaceAll("_", " ")],
    ["Email", driver.user.email],
    ["Phone", driver.user.phone],
    ["Account", driver.user.isActive === false ? "Inactive" : "Active"],
    ["Vehicle", driver.vehicleType],
    ["Plate", driver.vehiclePlate],
    ["Model", driver.vehicleModel],
    ["Colour", driver.vehicleColor],
    ["Year", driver.vehicleYear],
    ["Insurance", driver.vehicleInsurance],
    ["Profile delivery count", String(driver.totalDeliveries)],
    ["Profile rating", Number.isFinite(driver.rating) ? driver.rating.toFixed(1) : "Not provided"],
    ["Joined", shipmentDate(driver.createdAt)],
  ];
  return (
    <FleetDialog title={driver.user.name} onClose={onClose}>
      <dl className="grid grid-cols-2 gap-x-5 gap-y-5">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-[var(--landing-muted)]">{label}</dt>
            <dd className="mt-1 break-words text-sm">{value || "Not provided"}</dd>
          </div>
        ))}
      </dl>
      {driver.currentLocation && (
        <div className="mt-6 border-t border-[var(--landing-border)] pt-5">
          <h3 className="text-sm font-medium">Last reported profile location</h3>
          <p className="mt-2 font-mono text-xs">
            {driver.currentLocation.lat.toFixed(5)}, {driver.currentLocation.lng.toFixed(5)}
          </p>
          <p className="mt-2 text-xs leading-5 text-[var(--landing-muted)]">
            This profile coordinate is not a live shipment location.
          </p>
        </div>
      )}
      <section className="mt-6 border-t border-[var(--landing-border)] pt-5">
        <h3 className="font-medium">Assigned work</h3>
        <p className="mt-2 text-xs leading-5 text-[var(--landing-muted)]">
          Active deliveries and failed packages still in custody, matched against {loaded.length}{" "}
          loaded shipment records.
        </p>
        {work.isPending && (
          <p role="status" className="mt-4 text-sm">
            Loading assigned work…
          </p>
        )}
        {work.isError && (
          <p role="alert" className="mt-4 text-sm text-[var(--landing-danger)]">
            Shipment records could not be loaded.{" "}
            <button
              type="button"
              className="min-h-11 underline"
              onClick={() => {
                if (work.isFetchNextPageError) void work.fetchNextPage();
                else void work.refetch();
              }}
            >
              Try again
            </button>
          </p>
        )}
        {!work.isPending && !work.isError && !assignments.length && (
          <p className="mt-4 text-sm">
            {work.hasNextPage
              ? "No matching work in these loaded records. Load more to check older records."
              : "No active assigned work found."}
          </p>
        )}
        <ul className="mt-4 divide-y divide-[var(--landing-border)]">
          {assignments.map((shipment) => (
            <li key={shipment.id} className="py-3 text-sm">
              <span className="font-mono">{shipment.trackingId}</span>
              <p className="mt-1 text-xs text-[var(--landing-muted)]">
                {shipment.pickupAddress.city} → {shipment.deliveryAddress.city} ·{" "}
                {shipmentLabels[shipment.status]}
                {shipment.returnState && shipment.returnState !== "none"
                  ? ` · Return ${shipment.returnState.replaceAll("_", " ")}`
                  : ""}
              </p>
            </li>
          ))}
        </ul>
        {work.hasNextPage && (
          <button
            type="button"
            onClick={() => void work.fetchNextPage()}
            disabled={work.isFetchingNextPage}
            className="mt-3 min-h-11 text-sm text-[var(--landing-accent)] disabled:opacity-50"
          >
            {work.isFetchingNextPage ? "Loading…" : "Check more shipment records"}
          </button>
        )}
      </section>
    </FleetDialog>
  );
}
