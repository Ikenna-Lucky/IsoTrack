"use client";
import type { PublicTracking } from "@/lib/tracking-contract";
import { workspaceDateTime } from "@/lib/workspace-format";
import { shipmentLabels } from "@/lib/business-overview";
import { workspacePanel } from "@/components/dashboard/workspace-ui";
export function PublicTrackingResult({ info }: { info: PublicTracking }) {
  return (
    <section className={`${workspacePanel} p-5 sm:p-7`} aria-label="Public tracking result">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <p className="text-xs text-[var(--landing-muted)]">Public shipment status</p>
          <h2 className="mt-2 break-all font-mono text-xl font-semibold">{info.trackingId}</h2>
        </div>
        <p className="text-lg font-medium text-[var(--landing-accent)]">
          {shipmentLabels[info.status]}
        </p>
      </div>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--landing-muted)]">
        This public record contains delivery status and reported times. Sign in to view addresses,
        available driver details and prices for shipments linked to your account.
      </p>
      <dl className="my-6 grid gap-5 border-y border-[var(--landing-border)] py-5 sm:grid-cols-3">
        {[
          ["Scheduled pickup", info.scheduledPickup],
          ["Estimated arrival", info.estimatedDelivery],
          ["Delivered", info.actualDelivery],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-[var(--landing-muted)]">{label}</dt>
            <dd className="mt-2 text-sm">{workspaceDateTime(value)}</dd>
          </div>
        ))}
      </dl>
      <h3 className="font-semibold">Latest recorded events</h3>
      <p className="mt-1 text-xs text-[var(--landing-muted)]">
        Newest first. Only recorded events are shown.
      </p>
      <ol className="mt-4 border-l border-[var(--landing-border)] pl-5">
        {info.events.map((event, index) => (
          <li key={`${event.createdAt}-${index}`} className="relative pb-6">
            <span className="absolute -left-[25px] top-1 size-2 rounded-full bg-[var(--landing-accent)]" />
            <p className="text-sm font-medium">{event.message}</p>
            <p className="mt-1 text-xs text-[var(--landing-muted)]">
              {shipmentLabels[event.status]} / {workspaceDateTime(event.createdAt)}
            </p>
          </li>
        ))}
      </ol>
      {!info.events.length && (
        <p className="mt-3 text-sm text-[var(--landing-muted)]">No events recorded.</p>
      )}
      {info.eventsTruncated && (
        <p className="text-xs text-[var(--landing-muted)]">
          Showing the latest 20 public events. The linked shipment has a separate history.
        </p>
      )}
    </section>
  );
}
