"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTracking } from "@/hooks/use-tracking";
import { trackingIdInput } from "@/lib/tracking-contract";
import { PublicTrackingResult } from "@/components/tracking/public-tracking-result";
import {
  WorkspaceHeading,
  workspaceButton,
  workspaceField,
} from "@/components/dashboard/workspace-ui";
function CustomerTracker() {
  const params = useSearchParams();
  const initial = trackingIdInput.safeParse(params.get("id") ?? "");
  const [input, setInput] = useState(params.get("id") ?? "");
  const [id, setId] = useState(initial.success ? initial.data : "");
  const [error, setError] = useState("");
  const requestedId = params.get("id") ?? "";
  useEffect(() => {
    const parsed = trackingIdInput.safeParse(requestedId);
    setInput(requestedId);
    setId(parsed.success ? parsed.data : "");
  }, [requestedId]);
  const query = useTracking(id);
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <WorkspaceHeading eyebrow="Delivery lookup" title="Track a package">
        Use the tracking ID shared by your sender for a public status update. Open My shipments for
        addresses, driver details and payment access.
      </WorkspaceHeading>
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const value = trackingIdInput.safeParse(input);
          if (!value.success) {
            setError("Use up to 64 letters, digits, hyphens or underscores.");
            return;
          }
          setError("");
          setId(value.data);
          if (value.data === id) void query.refetch();
        }}
      >
        <label className="min-w-0 flex-1 text-sm">
          Tracking ID
          <input
            className={`${workspaceField} mt-2 font-mono`}
            value={input}
            maxLength={64}
            onChange={(event) => setInput(event.target.value)}
            placeholder="IST-XXXXXXXX"
          />
        </label>
        <button className={`${workspaceButton} bg-amber-300 text-stone-950! hover:bg-amber-200`}>
          Track package
        </button>
      </form>
      {error && (
        <p role="alert" className="text-sm text-[var(--landing-danger)]">
          {error}
        </p>
      )}
      {id && query.isPending && <p role="status">Loading the latest status...</p>}
      {query.isError && (
        <div role="alert" className="text-sm text-[var(--landing-danger)]">
          <p>
            {(query.error as { response?: { status: number } }).response?.status === 404
              ? "No shipment matches that tracking ID."
              : "Tracking could not load. Check your connection and try again."}
          </p>
          <button className={`${workspaceButton} mt-3`} onClick={() => void query.refetch()}>
            Try again
          </button>
        </div>
      )}
      {query.data && <PublicTrackingResult info={query.data} />}
      <aside className="border-l-2 border-[var(--landing-accent)] pl-5 text-sm leading-6 text-[var(--landing-muted)]">
        Being the recipient does not automatically link a shipment to this account. Ask the business
        to link it if you need private shipment access.{" "}
        <Link className="text-[var(--landing-accent)] underline" href="/customer/shipments">
          Open My shipments
        </Link>
        .
      </aside>
    </div>
  );
}
export default function CustomerTrackingPage() {
  return (
    <Suspense fallback={<p role="status">Loading tracking...</p>}>
      <CustomerTracker />
    </Suspense>
  );
}
