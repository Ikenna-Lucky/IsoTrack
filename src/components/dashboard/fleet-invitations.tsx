"use client";
import { useWorkspaceDate } from "@/providers/business-preferences-provider";
import { useEffect, useState } from "react";
import { Check, Copy, MailPlus, X } from "lucide-react";
import {
  useCreateFleetInvitation,
  useFleetInvitations,
  useRevokeFleetInvitation,
} from "@/hooks/use-fleet";
import {
  invitationEmail,
  invitationState,
  type CreatedInvitation,
  type FleetInvitation,
} from "@/lib/fleet-contract";
import { extractErrorMessage } from "@/lib/errors";
import { FleetDialog } from "./fleet-dialog";

export function FleetInvitations() {
  const shipmentDate = useWorkspaceDate();
  const invitations = useFleetInvitations();
  const create = useCreateFleetInvitation();
  const revoke = useRevokeFleetInvitation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [created, setCreated] = useState<CreatedInvitation | null>(null);
  const [confirm, setConfirm] = useState<FleetInvitation | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(timer);
  }, [copied]);
  useEffect(() => {
    if (!created) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [created]);
  async function invite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (create.isPending || created) return;
    setError("");
    const parsed = invitationEmail.safeParse(new FormData(event.currentTarget).get("email"));
    if (!parsed.success) {
      setError("Enter a valid driver email address (up to 254 characters).");
      return;
    }
    try {
      await create.mutateAsync({
        email: parsed.data,
        receive: (result) => {
          setCreated(result);
          setCopied(false);
          setCopyError(false);
        },
      });
      setEmail("");
    } catch (cause) {
      const status = (cause as { response?: { status?: number } })?.response?.status;
      setError(
        extractErrorMessage(
          cause,
          "Invitation creation could not be confirmed. Refresh the list before creating another; its token cannot be recovered.",
        ) +
          (!status || status >= 500
            ? " Creation may have completed. Refresh invitations before creating another; tokens cannot be retrieved again."
            : ""),
      );
    }
  }
  async function copy() {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.token);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <section
      aria-labelledby="invitation-heading"
      className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-panel)]"
    >
      <div className="border-b border-[var(--landing-border)] p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <MailPlus className="size-5 text-[var(--landing-accent)]" />
          <h2 id="invitation-heading" className="text-lg font-semibold">
            Invite a driver
          </h2>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--landing-muted)]">
          Invite someone to your private fleet by their email address. You’ll receive a token to
          share with that person privately; an email is not sent automatically.
        </p>
        <form
          onSubmit={(event) => void invite(event)}
          noValidate
          className="mt-5 flex flex-wrap items-end gap-3"
        >
          <div className="min-w-0 flex-1 basis-64">
            <label htmlFor="fleet-invite-email" className="mb-2 block text-xs font-medium">
              Driver email
            </label>
            <input
              id="fleet-invite-email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              value={email}
              disabled={create.isPending || !!created}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? "fleet-invite-error" : undefined}
              placeholder="driver@example.com"
              className="min-h-12 w-full rounded-md border border-[var(--landing-border)] bg-[var(--landing-field)] px-4 text-sm disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={create.isPending || !!created}
            className="min-h-12 rounded-md bg-amber-300 px-5 text-sm font-semibold text-stone-950 hover:bg-amber-200 disabled:opacity-50"
          >
            {create.isPending ? "Creating…" : "Create invitation"}
          </button>
        </form>
        {error && (
          <p
            id="fleet-invite-error"
            role="alert"
            className="mt-3 text-sm leading-6 text-[var(--landing-danger)]"
          >
            {error}
          </p>
        )}
      </div>
      {created && (
        <div className="m-5 rounded-lg border border-[var(--landing-border)] bg-[var(--landing-selection)] p-5 sm:m-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold">Save this invitation token</h3>
              <p className="mt-2 break-all text-sm">For {created.email}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCreated(null);
                create.reset();
              }}
              aria-label="Dismiss invitation token"
              className="grid size-11 shrink-0 place-items-center"
            >
              <X className="size-4" />
            </button>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--landing-muted)]">
            Shown once. It disappears when you leave or refresh this page. Share it privately with
            the named recipient, along with{" "}
            {typeof window !== "undefined" ? `${window.location.origin}/join-fleet` : "/join-fleet"}
            . Never place the token in a URL.
          </p>
          <label htmlFor="created-fleet-token" className="mt-4 block text-xs">
            Invitation token
          </label>
          <input
            id="created-fleet-token"
            readOnly
            value={created.token}
            onFocus={(event) => event.currentTarget.select()}
            className="mt-2 min-h-12 w-full rounded-md border border-[var(--landing-border)] bg-[var(--landing-field)] px-3 font-mono text-xs"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => void copy()}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--landing-accent)]"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Token copied" : "Copy token"}
            </button>
            <p className="text-xs text-[var(--landing-muted)]">
              Expires {shipmentDate(created.expiresAt)}
            </p>
          </div>
          <p aria-live="polite" className="text-xs">
            {copyError
              ? "Copy failed. Select and copy the token above."
              : copied
                ? "Invitation token copied to clipboard."
                : ""}
          </p>
        </div>
      )}
      <details className="px-5 py-4 sm:px-7">
        <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium">
          View invitation history{" "}
          <span className="ml-2 text-xs font-normal text-[var(--landing-muted)]">
            {invitations.data ? `${invitations.data.length} loaded · latest 50` : "Latest 50"}
          </span>
        </summary>
        <div className="max-h-96 overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-medium">Invitation history</h3>
              <p className="mt-1 text-xs text-[var(--landing-muted)]">
                Latest 50 invitations · expiry is checked by the server
              </p>
            </div>
            <button
              type="button"
              onClick={() => void invitations.refetch()}
              disabled={invitations.isFetching}
              className="min-h-11 text-sm text-[var(--landing-accent)] disabled:opacity-50"
            >
              Refresh invitations
            </button>
          </div>
          {invitations.isPending && (
            <p role="status" className="py-6 text-sm">
              Loading invitations…
            </p>
          )}
          {invitations.isError && (
            <p role="alert" className="py-4 text-sm text-[var(--landing-danger)]">
              Could not refresh invitations.{" "}
              {invitations.data
                ? "Previously loaded invitations are shown."
                : "Use Refresh invitations to try again."}
            </p>
          )}
          {!invitations.isPending && !invitations.isError && !invitations.data?.length && (
            <p className="py-6 text-sm text-[var(--landing-muted)]">
              No invitations yet. Your first invitation will appear here.
            </p>
          )}
          <ul className="mt-3 divide-y divide-[var(--landing-border)]">
            {invitations.data?.map((invitation) => {
              const state = invitationState(invitation, now);
              return (
                <li
                  key={invitation.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4"
                >
                  <div className="min-w-0">
                    <p className="break-all text-sm font-medium">{invitation.email}</p>
                    <p className="mt-1 text-xs text-[var(--landing-muted)]">
                      {state} · Expires {shipmentDate(invitation.expiresAt)}
                    </p>
                    {(invitation.acceptedAt || invitation.revokedAt || invitation.createdAt) && (
                      <p className="mt-1 text-xs text-[var(--landing-muted)]">
                        {invitation.acceptedAt
                          ? `Accepted ${shipmentDate(invitation.acceptedAt)}`
                          : invitation.revokedAt
                            ? `Revoked ${shipmentDate(invitation.revokedAt)}`
                            : `Created ${shipmentDate(invitation.createdAt!)}`}
                      </p>
                    )}
                  </div>
                  {state === "Pending" && (
                    <button
                      type="button"
                      onClick={() => {
                        revoke.reset();
                        setConfirm(invitation);
                      }}
                      className="min-h-11 px-2 text-sm text-[var(--landing-danger)]"
                    >
                      Revoke<span className="sr-only"> invitation for {invitation.email}</span>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </details>
      {confirm && (
        <FleetDialog
          title="Revoke this invitation?"
          onClose={() => {
            if (!revoke.isPending) setConfirm(null);
          }}
        >
          <p className="break-words text-sm leading-6">
            The invitation for {confirm.email} will stop working. This does not remove any enrolled
            driver.
          </p>
          {revoke.isError && (
            <p role="alert" className="mt-4 text-sm text-[var(--landing-danger)]">
              {extractErrorMessage(
                revoke.error,
                "Could not revoke this invitation. Refresh the list to check its state.",
              )}
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              disabled={revoke.isPending}
              onClick={() => setConfirm(null)}
              className="min-h-11 rounded-md border border-[var(--landing-border)] px-4 text-sm"
            >
              Keep invitation
            </button>
            <button
              type="button"
              disabled={revoke.isPending}
              onClick={() => {
                void revoke
                  .mutateAsync(confirm.id)
                  .then(() => {
                    setCreated((value) => (value?.id === confirm.id ? null : value));
                    setConfirm(null);
                  })
                  .catch(() => {});
              }}
              className="min-h-11 rounded-md border border-[var(--landing-danger)] px-4 text-sm text-[var(--landing-danger)] disabled:opacity-50"
            >
              {revoke.isPending ? "Revoking…" : "Revoke invitation"}
            </button>
          </div>
        </FleetDialog>
      )}
    </section>
  );
}
