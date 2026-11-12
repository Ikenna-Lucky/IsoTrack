"use client";
import { useWorkspaceDate } from "@/providers/business-preferences-provider";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePendingShipmentAction } from "@/hooks/use-pending-shipment-action";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useShipmentAction, type ShipmentAction } from "@/hooks/use-shipment-workspace";
import {
  newShipmentSchema,
  nairaToKobo,
  uncertainShipmentError,
  type NewShipment,
} from "@/lib/shipment-workspace";
import { extractErrorMessage } from "@/lib/errors";
import {
  shipmentButton,
  shipmentField,
  shipmentPanel,
} from "@/components/dashboard/shipment-detail";
import { shipmentMoney } from "@/lib/shipment-workspace";

export default function NewShipmentPage() {
  const shipmentDate = useWorkspaceDate();
  const action = useShipmentAction();
  const [review, setReview] = useState<NewShipment | null>(null);
  const [request, setRequest] = usePendingShipmentAction("create");
  useEffect(() => {
    if (request?.kind === "create") setReview(request.body);
  }, [request]);
  const [error, setError] = useState("");
  const [tracking, setTracking] = useState("");
  const [copied, setCopied] = useState(false);
  function prepare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "").trim();
    const schedule = text("scheduledPickup");
    const date = schedule ? new Date(schedule) : null;
    const parsed = newShipmentSchema.safeParse({
      description: text("description"),
      weightKg: Number(text("weightKg")),
      priceKobo: nairaToKobo(text("amount")),
      pickupAddress: {
        street: text("pickupStreet"),
        city: text("pickupCity"),
        state: text("pickupState"),
      },
      deliveryAddress: {
        street: text("deliveryStreet"),
        city: text("deliveryCity"),
        state: text("deliveryState"),
      },
      ...(text("customerEmail") ? { customerEmail: text("customerEmail") } : {}),
      ...(text("recipientEmail") ? { recipientEmail: text("recipientEmail") } : {}),
      ...(date
        ? { scheduledPickup: Number.isNaN(date.getTime()) ? "invalid" : date.toISOString() }
        : {}),
    });
    if (!parsed.success) {
      setError(
        parsed.error.issues.map((issue) => `${issue.path.join(" ")}: ${issue.message}`).join(". "),
      );
      return;
    }
    setReview(parsed.data);
  }
  async function submit(command: ShipmentAction) {
    if (!setRequest(command)) {
      setError("Recover the pending creation request before starting another shipment.");
      return;
    }
    setError("");
    try {
      const shipment = await action.mutateAsync(command);
      setTracking(shipment.trackingId);
      setRequest(null, command);
    } catch (err) {
      setError(extractErrorMessage(err, "Creation could not be confirmed."));
      if (!uncertainShipmentError(err)) setRequest(null, command);
    }
  }
  if (tracking)
    return (
      <section className={`${shipmentPanel} mx-auto max-w-2xl p-6 sm:p-10`}>
        <CheckCircle2 className="size-9 text-[var(--landing-accent)]" />
        <h1 className="mt-5 text-2xl font-semibold">Shipment created</h1>
        <p className="mt-3 text-sm text-[var(--landing-muted)]">
          Share the tracking ID with your recipient.
        </p>
        <p className="mt-5 break-all font-mono text-xl">{tracking}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className={shipmentButton}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(tracking);
                setCopied(true);
              } catch {
                setError("Copy is unavailable. Select the tracking ID above to copy it manually.");
              }
            }}
          >
            {copied ? "Copied" : "Copy tracking ID"}
          </button>
          <Link href="/business/shipments" className={shipmentButton}>
            View shipments
          </Link>
          <button
            className={shipmentButton}
            onClick={() => {
              setTracking("");
              setReview(null);
              setCopied(false);
              setError("");
            }}
          >
            Create another
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm">
            {error}
          </p>
        )}
      </section>
    );
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/business/shipments"
        className="inline-flex items-center gap-2 text-sm text-[var(--landing-muted)]"
      >
        <ArrowLeft className="size-4" />
        Shipment manifest
      </Link>
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--landing-accent)]">
          Dispatch intake
        </p>
        <h1 className="mt-2 text-3xl font-semibold">New shipment</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--landing-muted)]">
          Record the route and package, then review the charge before creating the shipment.
        </p>
      </header>
      <form onSubmit={prepare} className="space-y-6">
        <fieldset
          disabled={!!review || action.isPending}
          className={`${shipmentPanel} grid gap-6 p-5 disabled:opacity-70 sm:grid-cols-2 sm:p-7`}
        >
          <legend className="sr-only">Route</legend>
          {["pickup", "delivery"].map((kind) => (
            <section key={kind} className="min-w-0 space-y-4">
              <h2 className="text-lg font-semibold">
                {kind === "pickup" ? "01 · Pickup" : "02 · Delivery"}
              </h2>
              <Field label="Street address" name={`${kind}Street`} required maxLength={300} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City" name={`${kind}City`} required maxLength={100} />
                <Field label="State" name={`${kind}State`} required maxLength={100} />
              </div>
            </section>
          ))}
        </fieldset>
        <fieldset
          disabled={!!review || action.isPending}
          className={`${shipmentPanel} space-y-5 p-5 disabled:opacity-70 sm:p-7`}
        >
          <legend className="sr-only">Package and people</legend>
          <h2 className="text-lg font-semibold">03 · Package & people</h2>
          <label className="block text-sm">
            <span className="mb-2 block font-medium">
              Package description <span className="text-[var(--landing-muted)]">(required)</span>
            </span>
            <textarea
              name="description"
              required
              maxLength={2000}
              rows={3}
              className={shipmentField}
              placeholder="Contents and handling instructions"
            />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Weight (kg)"
              name="weightKg"
              type="number"
              required
              min="0.000001"
              max="1000000"
              step="any"
            />
            <Field
              label="Shipment charge (NGN)"
              name="amount"
              type="number"
              required
              min="0.01"
              max="21474836.47"
              step="0.01"
            />
            <Field
              label="Customer account email"
              name="customerEmail"
              type="email"
              maxLength={254}
              hint="Optional. Links an existing customer account for shipment and payment access."
            />
            <Field
              label="Recipient confirmation email"
              name="recipientEmail"
              type="email"
              maxLength={254}
              hint="Optional at creation. Used for delivery confirmation; this does not link a customer account."
            />
            <Field
              label="Scheduled pickup"
              name="scheduledPickup"
              type="datetime-local"
              hint="Optional. Enter the pickup time in your device’s local timezone."
            />
          </div>
        </fieldset>
        {!review && (
          <button
            type="submit"
            className="rounded-md bg-amber-300 px-5 py-3 text-sm font-semibold text-stone-950"
          >
            Review shipment
          </button>
        )}
      </form>
      {review && (
        <section className={`${shipmentPanel} space-y-5 p-5 sm:p-7`} aria-label="Review shipment">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Review before dispatch</h2>
              <p className="mt-2 text-sm text-[var(--landing-muted)]">
                Creating this record does not assign a driver or collect payment.
              </p>
            </div>
            <p className="text-xl font-semibold">{shipmentMoney(review.priceKobo)}</p>
          </div>
          <dl className="grid gap-5 text-sm sm:grid-cols-2">
            <Review
              label="Pickup"
              value={`${review.pickupAddress.street}, ${review.pickupAddress.city}, ${review.pickupAddress.state}`}
            />
            <Review
              label="Delivery"
              value={`${review.deliveryAddress.street}, ${review.deliveryAddress.city}, ${review.deliveryAddress.state}`}
            />
            <Review label="Package" value={`${review.description} · ${review.weightKg} kg`} />
            <Review
              label="Scheduled pickup"
              value={
                review.scheduledPickup
                  ? shipmentDate(review.scheduledPickup)
                  : "Not scheduled"
              }
            />
            <Review label="Customer account email" value={review.customerEmail ?? "Not provided"} />
            <Review
              label="Recipient confirmation email"
              value={review.recipientEmail ?? "Not provided"}
            />
          </dl>
          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-md bg-amber-300 px-5 py-3 text-sm font-semibold text-stone-950 disabled:opacity-50"
              disabled={action.isPending}
              onClick={() =>
                void submit(request ?? { kind: "create", key: crypto.randomUUID(), body: review })
              }
            >
              {action.isPending ? "Creating…" : request ? "Retry same creation" : "Create shipment"}
            </button>
            <button
              className={shipmentButton}
              disabled={!!request || action.isPending}
              onClick={() => {
                setReview(null);
                setError("");
              }}
            >
              Edit details
            </button>
          </div>
          {request && !action.isPending && (
            <p className="text-sm text-[var(--landing-warning)]">
              The result is uncertain. Keep this page open and retry the same creation to recover
              its result without creating a duplicate.
            </p>
          )}
        </section>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-md border border-[var(--landing-border)] p-4 text-sm text-[var(--landing-danger)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
function Field({
  label,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block min-w-0 text-sm">
      <span className="mb-2 block font-medium">
        {label}
        {props.required && <span className="text-[var(--landing-muted)]"> (required)</span>}
      </span>
      <input {...props} className={shipmentField} />
      {hint && (
        <span className="mt-2 block text-xs leading-5 text-[var(--landing-muted)]">{hint}</span>
      )}
    </label>
  );
}
function Review({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[var(--landing-muted)]">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap break-words">{value}</dd>
    </div>
  );
}
