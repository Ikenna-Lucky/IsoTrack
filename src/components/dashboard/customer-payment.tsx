"use client";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCheckout, usePaymentReference } from "@/hooks/use-payment";
import {
  cancellationSchema,
  paymentMessages,
  paymentOutcome,
  paymentReference,
} from "@/lib/customer-payment";
import { extractErrorMessage } from "@/lib/errors";
import { workspaceButton, workspaceField, workspacePanel } from "./workspace-ui";
export function PaymentStatus({
  reference,
  onResolved,
}: {
  reference: string;
  onResolved?: () => void;
}) {
  const query = usePaymentReference(reference);
  const cache = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cancelMessage, setCancelMessage] = useState("");
  const outcome = query.data ? paymentOutcome(query.data) : null;
  async function refresh() {
    const result = await query.refetch();
    if (result.data) {
      await cache.invalidateQueries({ queryKey: ["shipments"] });
    }
  }
  async function finish() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await cache.invalidateQueries({ queryKey: ["shipments"] }, { throwOnError: true });
      onResolved?.();
    } catch {
      setError(
        "The payment state is available, but shipment refresh failed. Retry before starting another checkout.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function cancel() {
    if (busy) return;
    setBusy(true);
    setError("");
    setCancelMessage("");
    try {
      const value = cancellationSchema.parse(
        (await api.post<{ data: unknown }>(`/payments/${encodeURIComponent(reference)}/cancel`))
          .data.data,
      );
      if (value.reference !== reference) throw new Error("Reference mismatch");
      setCancelMessage(
        value.requiresReview
          ? "The checkout needs review; contact your business."
          : "Close request processed. Checking the final payment state; this is not a refund.",
      );
      await refresh();
    } catch (cause) {
      setError(
        extractErrorMessage(
          cause,
          "Could not confirm closure. Check this reference before making another payment.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={`${workspacePanel} space-y-3 p-5`} aria-label="Checkout status">
      <h3 className="font-semibold">Check payment</h3>
      <p className="break-all font-mono text-xs">{reference}</p>
      {query.isFetching && (
        <p role="status" className="text-sm text-[var(--landing-muted)]">
          Checking with the payment service...
        </p>
      )}
      {outcome && (
        <p
          role="status"
          className={`text-sm leading-6 ${outcome === "settled" ? "text-[var(--landing-accent)]" : "text-[var(--landing-warning)]"}`}
        >
          {paymentMessages[outcome]}
        </p>
      )}
      {query.isError && (
        <p role="alert" className="text-sm text-[var(--landing-danger)]">
          {extractErrorMessage(
            query.error,
            "Could not check this payment. Try again; do not assume the redirect confirmed payment.",
          )}
        </p>
      )}
      {cancelMessage && (
        <p role="status" className="text-sm text-[var(--landing-muted)]">
          {cancelMessage}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-[var(--landing-danger)]">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          className={workspaceButton}
          disabled={query.isFetching || busy}
          onClick={() => void refresh()}
        >
          Check status
        </button>
        {outcome === "pending" && !query.data?.paid && !query.data?.applied && (
          <button
            disabled={busy || query.isFetching}
            className={workspaceButton}
            onClick={() => void cancel()}
          >
            {busy ? "Closing..." : "Close unpaid checkout"}
          </button>
        )}
        {(outcome === "closed" || outcome === "settled") && onResolved && (
          <button
            className={workspaceButton}
            disabled={busy || query.isFetching || query.isError}
            onClick={() => void finish()}
          >
            Return to shipment
          </button>
        )}
      </div>
    </section>
  );
}
export function ShipmentCheckout({
  id,
  paid,
  blocked,
  cancelled = false,
}: {
  id: string;
  paid: boolean;
  blocked: boolean;
  cancelled?: boolean;
}) {
  const checkout = useCheckout(id);
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Shipment payment</h3>
      <p className="text-sm leading-6 text-[var(--landing-muted)]">
        {paid
          ? "Payment is recorded against this shipment."
          : "Checkout is available only when the business has enabled sandbox payments and the shipment is payable. This is a test checkout, not a live charge."}
      </p>
      {!paid && !blocked && !cancelled && (
        <button
          disabled={checkout.busy}
          onClick={() => void checkout.open()}
          className={`${workspaceButton} bg-amber-300 text-stone-950! hover:bg-amber-200`}
        >
          {checkout.busy
            ? "Opening checkout..."
            : checkout.request?.checkout
              ? "Resume original checkout"
              : checkout.request
                ? "Retry original checkout request"
                : "Open test checkout"}
        </button>
      )}
      {cancelled && !paid && (
        <p className="text-sm text-[var(--landing-warning)]">
          This shipment is cancelled. Ask the business to review any earlier payment before taking
          further action.
        </p>
      )}
      {blocked && !paid && (
        <p className="text-sm text-[var(--landing-warning)]">
          Resolve the payment reference above before starting another checkout.
        </p>
      )}
      {checkout.error && (
        <p role="alert" className="text-sm text-[var(--landing-danger)]">
          {checkout.error}
        </p>
      )}
      {checkout.request && !checkout.request.checkout && (
        <p className="text-xs leading-5 text-[var(--landing-muted)]">
          An unresolved checkout request remains in this tab. Retry uses the original key and body.
          Reloading or signing out loses it; check payment records before starting a replacement.
        </p>
      )}
      {checkout.request?.checkout && (
        <PaymentStatus
          reference={checkout.request.checkout.reference}
          onResolved={checkout.release}
        />
      )}
    </div>
  );
}
export function PaymentReferenceLookup({
  initialReference = "",
  cancelled = false,
  onPendingChange,
}: {
  initialReference?: string;
  cancelled?: boolean;
  onPendingChange: (pending: boolean) => void;
}) {
  const [input, setInput] = useState(initialReference);
  const [reference, setReference] = useState(
    paymentReference.safeParse(initialReference).success ? initialReference : "",
  );
  const [error, setError] = useState(
    initialReference && !paymentReference.safeParse(initialReference).success
      ? "The return link contains an invalid payment reference. Use the full reference from your payment record."
      : "",
  );
  useEffect(() => {
    const parsed = paymentReference.safeParse(initialReference);
    setInput(initialReference);
    setReference(parsed.success ? parsed.data : "");
    onPendingChange(!!initialReference);
  }, [initialReference, onPendingChange]);
  return (
    <div className="space-y-4">
      {cancelled && (
        <p className="border-l-2 border-[var(--landing-warning)] pl-4 text-sm leading-6">
          You returned from checkout without completing it. This does not confirm closure or a
          refund. Check the original reference before paying again.
        </p>
      )}
      <details open={!!initialReference || cancelled} className={`${workspacePanel} p-5`}>
        <summary className="cursor-pointer font-semibold">
          Recover or check a payment reference
        </summary>
        <p className="mt-3 text-sm leading-6 text-[var(--landing-muted)]">
          Use the reference from your checkout or payment record. A checkout redirect alone is not
          confirmation.
        </p>
        <form
          className="mt-4 flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const value = paymentReference.safeParse(input.trim());
            if (!value.success) {
              setError("Enter the full IST-PAY reference, including its 24-character suffix.");
              return;
            }
            setError("");
            setReference(value.data);
            onPendingChange(true);
            const url = new URL(window.location.href);
            url.searchParams.set("payment_reference", value.data);
            window.history.replaceState(null, "", url.pathname + url.search);
          }}
        >
          <label className="min-w-0 flex-1 text-sm">
            Payment reference
            <input
              className={`${workspaceField} mt-2 font-mono`}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              autoComplete="off"
            />
          </label>
          <button className={workspaceButton}>Check reference</button>
        </form>
        {error && (
          <p role="alert" className="mt-3 text-sm text-[var(--landing-danger)]">
            {error}
          </p>
        )}
        {initialReference && !paymentReference.safeParse(initialReference).success && (
          <button
            className={`${workspaceButton} mt-3`}
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete("payment_reference");
              window.history.replaceState(null, "", url.pathname + url.search);
              onPendingChange(false);
              setError("");
            }}
          >
            Remove invalid return parameter
          </button>
        )}
      </details>
      {reference && (
        <PaymentStatus
          key={reference}
          reference={reference}
          onResolved={() => {
            setReference("");
            onPendingChange(false);
            const url = new URL(window.location.href);
            url.searchParams.delete("payment_reference");
            url.searchParams.delete("payment_cancelled");
            window.history.replaceState(null, "", url.pathname + url.search);
          }}
        />
      )}
    </div>
  );
}
