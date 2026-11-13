"use client";
import { useWorkspaceDate } from "@/providers/business-preferences-provider";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspaceShipment } from "@/hooks/use-shipment-workspace";
import {
  useDeliveryChallenge,
  usePendingDeliveryRequest,
  sendDeliveryRequest,
  type DeliveryRequest,
} from "@/hooks/use-delivery";
import {
  challengeUsable,
  deliveryPanelVisible,
  deliveryEmailLabels,
  deliveryErrorMessage,
  recipientConfirmationEmail,
  recipientDeliveryCode,
} from "@/lib/delivery-contract";
import { useWorkflowPending } from "@/hooks/use-workflow-request";
import { uncertainShipmentError } from "@/lib/shipment-workspace";
import { shipmentButton, shipmentField } from "./shipment-ui";

const nextStatus = {
  assigned: { label: "Confirm pickup", status: "picked_up" },
  picked_up: { label: "Mark in transit", status: "in_transit" },
  in_transit: { label: "Out for delivery", status: "out_for_delivery" },
} as const;
export function DeliveryConfirmation({ id, role }: { id: string; role: "business" | "driver" }) {
  const shipmentDate = useWorkspaceDate();
  const detail = useWorkspaceShipment(id);
  const shipment = detail.data;
  const challenge = useDeliveryChallenge(id, shipment?.status === "out_for_delivery");
  const cache = useQueryClient();
  const [request, setRequest] = usePendingDeliveryRequest(id);
  const workflowPending = useWorkflowPending(id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [code, setCode] = useState("");
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const live = shipment?.status === "out_for_delivery";
  const usable =
    !!shipment && challengeUsable(challenge.data, shipment.version, now) && !challenge.isError;
  const blocked = busy || workflowPending || needsRefresh || detail.isFetching || detail.isError;
  useEffect(() => {
    setCode("");
  }, [challenge.data?.challengeId, challenge.data?.version, usable]);
  async function refresh() {
    const result = await detail.refetch();
    // Once another actor closes or fails the shipment, challenge metadata is no
    // longer required to recover the delivery panel.
    const metadata = result.data?.status === "out_for_delivery" ? await challenge.refetch() : null;
    if (!result.isError && !metadata?.isError) {
      setNeedsRefresh(false);
      setError("");
      setCode("");
    }
    void cache.invalidateQueries({ queryKey: ["shipments", "business-manifest"] });
    void cache.invalidateQueries({ queryKey: ["shipments", "driver-delivery-cursor"] });
  }
  async function execute(command: DeliveryRequest) {
    if (!setRequest(command)) {
      setError("Resolve the pending shipment action before starting another.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await sendDeliveryRequest(id, command);
      setRequest(null, command);
      setCode("");
      setNotice(
        command.kind === "issue"
          ? "Code request accepted. Check the current email state below."
          : command.kind === "confirm"
            ? "Delivery confirmed."
            : "Shipment status updated.",
      );
      await cache.invalidateQueries({ queryKey: ["shipments"] });
      void cache.invalidateQueries({ queryKey: ["business"] });
      void cache.invalidateQueries({ queryKey: ["drivers"] });
    } catch (err) {
      setError(deliveryErrorMessage(err));
      if (!uncertainShipmentError(err)) {
        setRequest(null, command);
        setCode("");
        setNeedsRefresh(true);
      }
    } finally {
      setBusy(false);
    }
  }
  const advance = shipment ? nextStatus[shipment.status as keyof typeof nextStatus] : undefined;
  if (!deliveryPanelVisible(role, shipment?.status, !!request, busy || !!notice || !!error))
    return null;
  if (detail.isPending) return <p role="status">Loading delivery controls…</p>;
  return (
    <section
      className="space-y-4 rounded-lg border border-[var(--landing-border)] bg-[var(--landing-panel)] p-4 text-[var(--landing-ink)] sm:p-5"
      aria-label="Delivery confirmation"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">
          {role === "driver" && advance ? "Next delivery step" : "Recipient confirmation"}
        </h3>
        <button
          className={shipmentButton}
          disabled={busy || detail.isFetching || challenge.isFetching}
          onClick={() => void refresh()}
        >
          Refresh delivery state
        </button>
      </div>
      {detail.isError && (
        <p role="alert" className="text-sm text-[var(--landing-danger)]">
          Could not load current shipment details.
        </p>
      )}
      {role === "driver" && advance && (
        <button
          className="rounded-md bg-amber-300 px-4 py-3 text-sm font-semibold text-stone-950 disabled:opacity-50"
          disabled={blocked}
          onClick={() =>
            void execute({
              kind: "progress",
              key: crypto.randomUUID(),
              body: { expectedVersion: shipment!.version, status: advance.status },
            })
          }
        >
          {advance.label}
        </button>
      )}
      {live && (
        <>
          <p className="text-sm leading-6 text-[var(--landing-muted)]">
            {role === "business"
              ? "Send the recipient a code for this handover. Only the assigned driver can use it to confirm delivery."
              : "Ask the recipient for the code only after handing over the package. Keep any leading zeros."}
          </p>
          {challenge.isPending && (
            <p role="status" className="text-sm">
              Checking the active code…
            </p>
          )}
          {challenge.isError && (
            <p role="alert" className="text-sm text-[var(--landing-danger)]">
              Could not check the active code. Refresh delivery state to try again.
            </p>
          )}
          {!challenge.isPending &&
            !challenge.isError &&
            (usable && challenge.data ? (
              <div className="space-y-1 border-l-2 border-[var(--landing-accent)] pl-3 text-sm">
                <p className="font-medium">{deliveryEmailLabels[challenge.data.deliveryState]}</p>
                <p className="text-[var(--landing-muted)]">
                  Expires {shipmentDate(challenge.data.expiresAt)} ·{" "}
                  {Math.max(0, Math.ceil((Date.parse(challenge.data.expiresAt) - now) / 60000))} min
                  remaining
                </p>
                <p className="text-xs text-[var(--landing-muted)]">
                  Mail-service acceptance does not guarantee inbox delivery.
                </p>
              </div>
            ) : (
              <p className="text-sm text-[var(--landing-warning)]">
                No usable delivery code.{" "}
                {role === "business"
                  ? "Send a new code to the correct recipient."
                  : "Ask your business to send a new code, then refresh."}
              </p>
            ))}
          {role === "business" ? (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                const email = recipientConfirmationEmail.safeParse(
                  new FormData(event.currentTarget).get("recipientEmail"),
                );
                if (!email.success) {
                  setError("Enter a valid recipient email.");
                  return;
                }
                void execute({
                  kind: "issue",
                  key: crypto.randomUUID(),
                  body: { recipientEmail: email.data, expectedVersion: shipment!.version },
                });
              }}
            >
              <label className="block text-sm font-medium">
                Recipient confirmation email
                <input
                  key={shipment?.version}
                  name="recipientEmail"
                  type="email"
                  required
                  maxLength={254}
                  defaultValue={shipment?.recipientEmail ?? ""}
                  disabled={blocked}
                  className={`${shipmentField} mt-2`}
                />
              </label>
              <p className="text-xs leading-5 text-[var(--landing-muted)]">
                A new code replaces the previous one and expires after 20 minutes. Wait at least one
                minute between sends; up to three sends per shipment per hour.
              </p>
              <button
                type="submit"
                disabled={blocked || challenge.isPending || challenge.isError}
                className="rounded-md bg-amber-300 px-4 py-3 text-sm font-semibold text-stone-950 disabled:opacity-50"
              >
                {usable ? "Send replacement code" : "Send delivery code"}
              </button>
            </form>
          ) : (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                const parsed = recipientDeliveryCode.safeParse(
                  new FormData(event.currentTarget).get("deliveryCode"),
                );
                if (!parsed.success) {
                  setError(parsed.error.issues[0]!.message);
                  return;
                }
                if (!usable || !challenge.data) return;
                void execute({
                  kind: "confirm",
                  key: crypto.randomUUID(),
                  body: {
                    expectedVersion: challenge.data.version,
                    challengeId: challenge.data.challengeId,
                    code: parsed.data,
                  },
                });
              }}
            >
              <label className="block text-sm font-medium">
                Recipient’s eight-digit code
                <input
                  name="deliveryCode"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{8}"
                  minLength={8}
                  maxLength={8}
                  autoComplete="off"
                  required
                  disabled={blocked || !usable || challenge.isPending}
                  className={`${shipmentField} mt-2 font-mono tracking-[0.2em]`}
                />
              </label>
              <button
                type="submit"
                disabled={blocked || !usable || challenge.isPending}
                className="rounded-md bg-amber-300 px-4 py-3 text-sm font-semibold text-stone-950 disabled:opacity-50"
              >
                Confirm handover
              </button>
            </form>
          )}
        </>
      )}
      {shipment?.status === "delivered" && (
        <p className="text-sm text-[var(--landing-accent)]">
          Delivery completed · {shipmentDate(shipment.actualDelivery)}
        </p>
      )}
      {busy && (
        <p role="status" className="text-sm">
          Confirming request…
        </p>
      )}
      {notice && (
        <p role="status" className="text-sm text-[var(--landing-accent)]">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-[var(--landing-danger)]">
          {error}
        </p>
      )}
      {request && !busy && (
        <div className="space-y-3">
          <p className="text-sm text-[var(--landing-warning)]">
            The result is uncertain. Retry the same request before starting another action. Keep
            this tab open until resolved.
          </p>
          <button className={shipmentButton} onClick={() => void execute(request)}>
            Retry same request
          </button>
        </div>
      )}
      {needsRefresh && (
        <p className="text-sm text-[var(--landing-muted)]">
          Refresh delivery state before entering a new code or starting another request.
        </p>
      )}
    </section>
  );
}
