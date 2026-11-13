"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useTracking } from "@/hooks/use-tracking";
import { trackingIdInput } from "@/lib/tracking-contract";
import { PublicTrackingResult } from "./public-tracking-result";
import {
  WorkspaceHeading,
  workspaceButton,
  workspaceField,
} from "@/components/dashboard/workspace-ui";
import "../../app/landing-theme.css";
export default function PublicTrackingPage() {
  const params = useParams();
  const id = typeof params.trackingId === "string" ? params.trackingId : "";
  const query = useTracking(id);
  const [input, setInput] = useState(id);
  useEffect(() => setInput(id), [id]);
  const [error, setError] = useState("");
  const router = useRouter();
  return (
    <div className="landing-page min-h-dvh bg-[var(--landing-canvas)] text-[var(--landing-ink)]">
      <header className="border-b border-[var(--landing-border)] bg-[var(--landing-panel)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 p-5">
          <Logo href="/" />
          <div className="flex gap-3">
            <ThemeToggle />
            <Link href="/customer/shipments" className={workspaceButton}>
              My shipments
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
        <WorkspaceHeading eyebrow="IsoTrack delivery record" title="Track a package">
          Check the latest status using the tracking ID shared by your sender.
        </WorkspaceHeading>
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const parsed = trackingIdInput.safeParse(input);
            if (!parsed.success) {
              setError("Use a tracking ID of up to 64 letters, digits, hyphens or underscores.");
              return;
            }
            setError("");
            router.push(`/track/${encodeURIComponent(parsed.data)}`);
          }}
        >
          <label className="min-w-0 flex-1 text-sm">
            Tracking ID
            <input
              className={`${workspaceField} mt-2 font-mono`}
              value={input}
              maxLength={64}
              onChange={(event) => setInput(event.target.value)}
            />
          </label>
          <button className={workspaceButton}>Track</button>
        </form>
        {error && (
          <p role="alert" className="text-sm text-[var(--landing-danger)]">
            {error}
          </p>
        )}
        {query.isPending && <p role="status">Loading status...</p>}
        {query.isError && (
          <div role="alert">
            <p>
              {(query.error as { response?: { status: number } }).response?.status === 404
                ? "No shipment matches this tracking ID."
                : "Could not load the tracking record. Please retry."}
            </p>
            <button className={`${workspaceButton} mt-3`} onClick={() => void query.refetch()}>
              Try again
            </button>
          </div>
        )}
        {query.data && <PublicTrackingResult info={query.data} />}
      </main>
    </div>
  );
}
