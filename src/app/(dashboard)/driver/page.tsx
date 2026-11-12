"use client";
import Link from "next/link";
import { useState } from "react";
import { useDriverProfile, useUpdateDriverStatus } from "@/hooks/use-driver";
import { useDriverProfileCompletion } from "@/hooks/use-profile-completion";
import { useDriverWorkQueue } from "@/hooks/use-delivery";
import { driverWorkSummary } from "@/lib/driver-workspace";
import { extractErrorMessage } from "@/lib/errors";
import { returnLabels } from "@/lib/shipment-exceptions";
import { shipmentLabels } from "@/lib/business-overview";
import { ExistingFleetEnrollment } from "@/components/dashboard/existing-fleet-enrollment";
import {
  DriverHeading,
  DriverReadState,
  DriverRecordScope,
  driverButton,
  driverPanel,
} from "@/components/dashboard/driver-workspace";
import type { DriverStatus } from "@/types";

export default function DriverOverviewPage() {
  const profile = useDriverProfile();
  const completion = useDriverProfileCompletion();
  const work = useDriverWorkQueue();
  const update = useUpdateDriverStatus();
  const [statusError, setStatusError] = useState("");
  const [saved, setSaved] = useState(false);
  const driver = profile.data;
  const records = work.data?.pages.flatMap((page) => page.data) ?? [];
  const summary = driverWorkSummary(records);
  async function setStatus(status: DriverStatus) {
    if (update.isPending) return;
    setStatusError("");
    setSaved(false);
    try {
      await update.mutateAsync(status);
      setSaved(true);
    } catch (error) {
      setStatusError(
        extractErrorMessage(
          error,
          "Could not confirm availability. Refresh your profile before trying again.",
        ),
      );
    }
  }
  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      <DriverHeading
        eyebrow="On the road"
        title="Your current work"
        action={
          <Link
            href="/driver/deliveries"
            className={`${driverButton} bg-amber-300 text-stone-950! hover:bg-amber-200`}
          >
            Open deliveries
          </Link>
        }
      >
        Check assigned work, keep dispatch informed and finish each handover with recipient
        confirmation.
      </DriverHeading>
      {!completion.isLoading && !completion.isComplete && (
        <aside className="mb-6 flex flex-wrap items-center justify-between gap-3 border-l-2 border-[var(--landing-accent)] bg-[var(--landing-selection)] px-5 py-4">
          <div>
            <p className="text-sm font-medium">Finish your driver profile</p>
            <p className="mt-1 text-xs leading-5 text-[var(--landing-muted)]">
              {completion.items
                .filter((item) => !item.done)
                .map((item) => item.label)
                .join(" / ")}
            </p>
          </div>
          <Link
            href="/driver/settings"
            className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--landing-accent)]"
          >
            Update details
          </Link>
        </aside>
      )}

      <DriverReadState
        pending={profile.isPending}
        error={profile.isError}
        retry={() => void profile.refetch()}
      >
        {driver && (
          <section className={`${driverPanel} p-5`} aria-labelledby="availability-heading">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 id="availability-heading" className="font-semibold">
                  Availability
                </h2>
                <p className="mt-1 text-sm text-[var(--landing-muted)]">
                  Current status: <strong>{driver.status.replaceAll("_", " ")}</strong>. This does
                  not change a package status or share GPS.
                </p>
              </div>
              <div role="group" aria-label="Set availability" className="flex flex-wrap gap-2">
                {(["available", "on_delivery", "offline"] as const).map((status) => (
                  <button
                    key={status}
                    aria-pressed={driver.status === status}
                    disabled={
                      update.isPending || (driver.businessId == null && status !== "offline")
                    }
                    onClick={() => void setStatus(status)}
                    className={`${driverButton} capitalize ${driver.status === status ? "border-[var(--landing-accent)]! bg-[var(--landing-selection)]" : ""}`}
                  >
                    {status.replaceAll("_", " ")}
                  </button>
                ))}
              </div>
            </div>
            {driver.businessId == null && (
              <p className="mt-3 text-sm text-[var(--landing-warning)]">
                Join your business fleet before going available or on delivery.
              </p>
            )}
            {statusError && (
              <div role="alert" className="mt-3 text-sm text-[var(--landing-danger)]">
                <p>{statusError}</p>
                <button
                  className={`${driverButton} mt-2`}
                  disabled={profile.isFetching}
                  onClick={() => void profile.refetch()}
                >
                  Refresh availability
                </button>
              </div>
            )}
            {saved && (
              <p role="status" className="mt-3 text-sm text-[var(--landing-accent)]">
                Availability saved.
              </p>
            )}
          </section>
        )}
      </DriverReadState>
      {driver?.businessId === null && <ExistingFleetEnrollment key={driver.id} />}
      <section aria-labelledby="work-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="work-heading" className="text-xl font-semibold">
            Current assignments
          </h2>
          <button
            className={driverButton}
            disabled={work.isFetching}
            onClick={() => void work.refetch()}
          >
            {work.isFetching ? "Refreshing..." : "Refresh work"}
          </button>
        </div>
        <DriverReadState
          pending={work.isPending}
          error={work.isError}
          retry={() => void work.refetch()}
        >
          {work.data && (
            <>
              <DriverRecordScope
                count={records.length}
                more={!!work.hasNextPage}
                updatedAt={work.dataUpdatedAt}
              />
              <dl className="grid grid-cols-2 gap-4 border-y border-[var(--landing-border)] py-5">
                <div>
                  <dt className="text-sm text-[var(--landing-muted)]">Assigned or moving</dt>
                  <dd className="mt-2 text-3xl font-semibold">
                    {summary.moving.length}
                    {work.hasNextPage ? "+" : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-[var(--landing-muted)]">
                    Failed packages still held
                  </dt>
                  <dd className="mt-2 text-3xl font-semibold text-[var(--landing-warning)]">
                    {summary.held.length}
                    {work.hasNextPage ? "+" : ""}
                  </dd>
                </div>
              </dl>
              {!records.length && (
                <div className={`${driverPanel} p-6`}>
                  <h3 className="font-semibold">No current assignments</h3>
                  <p className="mt-2 text-sm text-[var(--landing-muted)]">
                    Refresh after dispatch assigns a package. Completed work is in your delivery
                    record.
                  </p>
                </div>
              )}
              <ul className="divide-y divide-[var(--landing-border)]">
                {records.map((shipment) => (
                  <li key={shipment.id} className="py-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="break-all font-mono text-sm font-semibold">
                        {shipment.trackingId}
                      </p>
                      <p className="text-sm text-[var(--landing-accent)]">
                        {shipmentLabels[shipment.status]}
                      </p>
                    </div>
                    <p className="mt-2 break-words text-sm text-[var(--landing-muted)]">
                      {shipment.pickupAddress.street}, {shipment.pickupAddress.city}{" "}
                      <span className="text-[var(--landing-muted)]">to</span>{" "}
                      {shipment.deliveryAddress.street}, {shipment.deliveryAddress.city}
                    </p>
                    {shipment.returnState !== "none" && (
                      <p className="mt-2 text-sm text-[var(--landing-warning)]">
                        {returnLabels[shipment.returnState]}
                      </p>
                    )}
                    <Link
                      href="/driver/deliveries"
                      className="mt-2 inline-flex min-h-11 items-center text-sm text-[var(--landing-accent)] underline"
                    >
                      Open delivery controls
                    </Link>
                  </li>
                ))}
              </ul>
              {work.hasNextPage && (
                <button
                  className={driverButton}
                  disabled={work.isFetchingNextPage}
                  onClick={() => void work.fetchNextPage()}
                >
                  {work.isFetchingNextPage ? "Loading..." : "Load more assignments"}
                </button>
              )}
            </>
          )}
        </DriverReadState>
      </section>
      <aside className="border-l-2 border-[var(--landing-warning)] pl-4 text-sm leading-6 text-[var(--landing-muted)]">
        A failed delivery can still leave the package in your custody. Keep it safe; your business
        authorizes retries and returns.{" "}
        <Link href="/driver/help" className="text-[var(--landing-accent)] underline">
          Read the handover guide
        </Link>
        .
      </aside>
    </div>
  );
}
