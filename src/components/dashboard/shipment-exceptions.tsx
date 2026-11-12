"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspaceShipment } from "@/hooks/use-shipment-workspace";
import {
  useExceptionHistory,
  usePendingException,
  sendException,
  type ExceptionRequest,
} from "@/hooks/use-shipment-exceptions";
import { useWorkflowPending } from "@/hooks/use-workflow-request";
import {
  exceptionActions,
  exceptionExplanation,
  exceptionInput,
  exceptionLabels,
  exceptionError,
  failureReasons,
  returnLabels,
  type ExceptionInput,
  type ExceptionAction,
} from "@/lib/shipment-exceptions";
import { uncertainShipmentError } from "@/lib/shipment-workspace";
import { shipmentButton, shipmentField, shipmentDate } from "./shipment-ui";
import { driverTheme } from "./delivery-confirmation";

export function ShipmentExceptions({ id, role }: { id: string; role: "business" | "driver" }) {
  const detail = useWorkspaceShipment(id);
  const shipment = detail.data;
  const [historyOpen, setHistoryOpen] = useState(false);
  const history = useExceptionHistory(id, historyOpen);
  const [request, setRequest] = usePendingException(id);
  const workflowPending = useWorkflowPending(id);
  const cache = useQueryClient();
  const [choice, setChoice] = useState<ExceptionAction | null>(null);
  const [review, setReview] = useState<ExceptionInput | null>(null);
  const [busy, setBusy] = useState(false);
  const [needsReload, setNeedsReload] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const actions = shipment ? exceptionActions(shipment, role) : [];
  const selected = choice && actions.includes(choice) ? choice : actions[0];
  const snapshot = request?.body ?? review;
  const blocked = workflowPending || busy || needsReload || detail.isFetching || detail.isError;
  async function reload() {
    const result = await detail.refetch();
    if (!result.isError) {
      setNeedsReload(false);
      setError("");
      setReview(null);
      setChoice(null);
    }
    void cache.invalidateQueries({ queryKey: ["shipments", "business-manifest"] });
    void cache.invalidateQueries({ queryKey: ["shipments", "driver-delivery-cursor"] });
    void cache.invalidateQueries({ queryKey: ["shipments", "exception-history", id] });
  }
  async function execute(command: ExceptionRequest) {
    if (!setRequest(command)) {
      setError("Resolve the pending shipment action before starting another.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await sendException(id, command);
      setRequest(null, command);
      setReview(null);
      setChoice(null);
      setNotice(`${exceptionLabels[command.body.action]}: confirmed.`);
      await cache.invalidateQueries({ queryKey: ["shipments"] });
      void cache.invalidateQueries({ queryKey: ["drivers"] });
      void cache.invalidateQueries({ queryKey: ["business"] });
    } catch (err) {
      setError(exceptionError(err));
      if (!uncertainShipmentError(err)) {
        setRequest(null, command);
        setReview(null);
        setNeedsReload(true);
      }
    } finally {
      setBusy(false);
    }
  }
  if (detail.isPending) return <p role="status">Loading issue and return controls…</p>;
  const held =
    shipment?.status === "failed" && !!shipment.actualPickup && shipment.returnState !== "received";
  return (
    <section
      style={role === "driver" ? driverTheme : undefined}
      className="space-y-4 rounded-lg border border-[var(--landing-border)] bg-[var(--landing-panel)] p-4 text-[var(--landing-ink)] sm:p-5"
      aria-label="Failures and returns"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">Failures & returns</h3>
        <button
          type="button"
          className={shipmentButton}
          disabled={busy || detail.isFetching}
          onClick={() => void reload()}
        >
          Reload issue state
        </button>
      </div>
      {detail.isError && (
        <p role="alert" className="text-sm text-[var(--landing-danger)]">
          Could not load current shipment details. Reload before making a decision.
        </p>
      )}
      {shipment && (
        <div className="space-y-2 text-sm">
          <p className="text-[var(--landing-muted)]">
            Attempt {shipment.attemptNumber} of 3
            {shipment.returnState !== "none" ? ` · ${returnLabels[shipment.returnState]}` : ""}
          </p>
          {shipment.status === "failed" && (
            <p className={held ? "text-[var(--landing-warning)]" : "text-[var(--landing-muted)]"}>
              {shipment.returnState === "received"
                ? "Return completed. Create a new shipment for another delivery."
                : held
                  ? `${role === "driver" ? "The package remains in your custody" : "The package remains with the assigned driver"}. Cancellation is unavailable until custody is resolved.`
                  : shipment.attemptNumber < 3
                    ? "Pickup has not been recorded. Your business can authorize another attempt or cancel this shipment."
                    : "Pickup has not been recorded. The business can cancel this shipment."}
            </p>
          )}
          {shipment.failureReason && (
            <p>
              Failure reason:{" "}
              {failureReasons[shipment.failureReason as keyof typeof failureReasons] ??
                shipment.failureReason.replaceAll("_", " ")}
            </p>
          )}
          {shipment.failedAt && (
            <p className="text-xs text-[var(--landing-muted)]">
              Failed {shipmentDate(shipment.failedAt)}
            </p>
          )}
          {shipment.returnedAt && (
            <p className="text-xs text-[var(--landing-muted)]">
              Return received {shipmentDate(shipment.returnedAt)}
            </p>
          )}
        </div>
      )}
      {actions.length > 0 && shipment && (
        <form
          key={shipment.version}
          hidden={!!snapshot}
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            const form = new FormData(event.currentTarget);
            const action = String(form.get("action"));
            if (!actions.includes(action as ExceptionAction) || blocked) return;
            const parsed = exceptionInput.safeParse({
              action,
              expectedVersion: shipment.version,
              note: String(form.get("note") ?? ""),
              ...(action === "fail" ? { reason: form.get("reason") } : {}),
            });
            if (!parsed.success) {
              setError(parsed.error.issues.map((issue) => issue.message).join(" "));
              return;
            }
            setReview(parsed.data);
          }}
        >
          <label className="block text-sm font-medium">
            Action
            <select
              name="action"
              value={selected}
              onChange={(event) => setChoice(event.target.value as ExceptionAction)}
              disabled={blocked}
              className={`${shipmentField} mt-2`}
            >
              {actions.map((action) => (
                <option key={action} value={action}>
                  {exceptionLabels[action]}
                </option>
              ))}
            </select>
          </label>
          {selected === "fail" && (
            <label className="block text-sm font-medium">
              Failure reason
              <select
                name="reason"
                required
                defaultValue=""
                disabled={blocked}
                className={`${shipmentField} mt-2`}
              >
                <option value="" disabled>
                  Select a reason
                </option>
                {Object.entries(failureReasons).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="block text-sm font-medium">
            Private note{" "}
            <span className="font-normal text-[var(--landing-muted)]">
              (up to 1,000 characters)
            </span>
            <textarea
              name="note"
              maxLength={1000}
              rows={3}
              disabled={blocked}
              className={`${shipmentField} mt-2`}
            />
            <span className="mt-2 block text-xs font-normal leading-5 text-[var(--landing-muted)]">
              Shared with the business and current assigned driver. Required when the failure reason
              is Other.
            </span>
          </label>
          {selected && (
            <p className="text-sm leading-6 text-[var(--landing-muted)]">
              {exceptionExplanation(selected, !!shipment.actualPickup)}
            </p>
          )}
          <button type="submit" disabled={blocked} className={shipmentButton}>
            Review action
          </button>
        </form>
      )}
      {snapshot && (
        <div
          className="space-y-4 rounded-md border border-[var(--landing-border)] p-4"
          aria-label="Review issue action"
        >
          <h4 className="font-semibold">{exceptionLabels[snapshot.action]}</h4>
          <p className="text-sm leading-6">
            {exceptionExplanation(snapshot.action, !!shipment?.actualPickup)}
          </p>
          {snapshot.action === "fail" && (
            <p className="text-sm">Reason: {failureReasons[snapshot.reason]}</p>
          )}
          {snapshot.note && (
            <div className="text-sm">
              <p className="text-[var(--landing-muted)]">Private note</p>
              <p className="mt-1 whitespace-pre-wrap break-words">{snapshot.note}</p>
            </div>
          )}
          {!request && (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (blocked) return;
                void execute({ key: crypto.randomUUID(), body: snapshot });
              }}
            >
              {snapshot.action === "return_receive" && (
                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" required className="mt-1 size-4 shrink-0" />I confirm that
                  the package has physically returned to our business.
                </label>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={blocked}
                  className="rounded-md bg-amber-300 px-4 py-3 text-sm font-semibold text-stone-950 disabled:opacity-50"
                >
                  Confirm{" "}
                  {snapshot.action === "fail"
                    ? "failed attempt"
                    : snapshot.action === "return_receive"
                      ? "receipt"
                      : "action"}
                </button>
                <button
                  type="button"
                  className={shipmentButton}
                  disabled={busy}
                  onClick={() => setReview(null)}
                >
                  Keep current state
                </button>
              </div>
            </form>
          )}
        </div>
      )}
      {shipment?.status === "failed" &&
        shipment.returnState === "none" &&
        shipment.attemptNumber >= 3 && (
          <p className="text-sm text-[var(--landing-warning)]">
            All three delivery attempts have been used.{" "}
            {held
              ? "Arrange a return with your business."
              : "The business can cancel before pickup."}
          </p>
        )}
      {shipment?.status === "failed" &&
        role === "driver" &&
        !actions.length &&
        shipment.returnState !== "received" && (
          <p className="text-sm text-[var(--landing-muted)]">
            {shipment.returnState === "in_transit"
              ? "Return in progress. Hand the package to the business and ask them to confirm receipt."
              : "Wait for your business to authorize the next step."}
          </p>
        )}
      {busy && (
        <p role="status" className="text-sm">
          Confirming action…
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
            The result is uncertain. Keep this tab open and retry the same request to recover its
            result.
          </p>
          <button className={shipmentButton} onClick={() => void execute(request)}>
            Retry same issue action
          </button>
        </div>
      )}
      {needsReload && (
        <p className="text-sm text-[var(--landing-muted)]">
          Reload issue state before making a new decision.
        </p>
      )}
      <details
        onToggle={(event) => setHistoryOpen(event.currentTarget.open)}
        className="border-t border-[var(--landing-border)] pt-4"
      >
        <summary className="cursor-pointer text-sm font-medium">Private issue history</summary>
        <div className="mt-4 space-y-4">
          <p className="text-xs text-[var(--landing-muted)]">
            Newest first · business and current assigned driver only
          </p>
          {history.isPending && (
            <p role="status" className="text-sm">
              Loading private history…
            </p>
          )}
          {history.isError && (
            <p role="alert" className="text-sm">
              Could not load private history.{" "}
              <button className="underline" onClick={() => void history.refetch()}>
                Retry private history
              </button>
            </p>
          )}
          <ol className="max-h-96 space-y-4 overflow-y-auto">
            {history.data?.pages
              .flatMap((page) => page.data)
              .map((item) => (
                <li
                  key={item.id}
                  className="border-l-2 border-[var(--landing-border)] pl-3 text-sm"
                >
                  <p className="font-medium">{exceptionLabels[item.action]}</p>
                  <p className="mt-1 text-xs text-[var(--landing-muted)]">
                    {shipmentDate(item.createdAt)} · Attempt {item.attemptNumber} · Version{" "}
                    {item.version}
                  </p>
                  {item.reason && (
                    <p className="mt-2">{failureReasons[item.reason] ?? item.reason}</p>
                  )}
                  {item.note && <p className="mt-2 whitespace-pre-wrap break-words">{item.note}</p>}
                  <p className="mt-2 break-all text-xs text-[var(--landing-muted)]">
                    Actor account: {item.actorId}
                  </p>
                </li>
              ))}
          </ol>
          {history.data && !history.data.pages[0]?.data.length && (
            <p className="text-sm text-[var(--landing-muted)]">No issue actions recorded.</p>
          )}
          {history.hasNextPage && (
            <button
              className={shipmentButton}
              disabled={history.isFetchingNextPage}
              onClick={() => void history.fetchNextPage()}
            >
              {history.isFetchingNextPage ? "Loading…" : "Load older issue actions"}
            </button>
          )}
        </div>
      </details>
    </section>
  );
}
