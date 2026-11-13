"use client";
import { useState } from "react";
import { useAcceptExistingFleet } from "@/hooks/use-fleet";
import { invitationToken } from "@/lib/fleet-contract";
import { extractErrorMessage } from "@/lib/errors";

export function ExistingFleetEnrollment() {
  const accept = useAcceptExistingFleet();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (accept.isPending) return;
    const parsed = invitationToken.safeParse(new FormData(event.currentTarget).get("token"));
    if (!parsed.success) {
      setError("Enter the 43-character invitation token shared by your business.");
      return;
    }
    setError("");
    try {
      await accept.mutateAsync(parsed.data);
      setToken("");
      setJoined(true);
    } catch (cause) {
      setError(
        extractErrorMessage(
          cause,
          "Could not confirm fleet membership. Refresh your profile before retrying.",
        ),
      );
    } finally {
      accept.reset();
    }
  }
  return (
    <section className="rounded-lg border border-[var(--landing-border)] bg-[var(--landing-section)] p-5 text-[var(--landing-ink)]">
      <h2 className="text-lg font-semibold">Join your business fleet</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--landing-muted)]">
        Use the token sent privately by your business. Sign in with the email address named on the
        invitation. Drivers can belong to one business at a time.
      </p>
      {joined ? (
        <p role="status" className="mt-4 text-[var(--landing-accent)]">
          Fleet joined. Your profile is refreshing.
        </p>
      ) : (
        <form onSubmit={(event) => void submit(event)} className="mt-4 space-y-3" noValidate>
          <label htmlFor="existing-fleet-token" className="block text-sm">
            Invitation token
          </label>
          <input
            id="existing-fleet-token"
            name="token"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            maxLength={43}
            required
            aria-invalid={!!error}
            aria-describedby={error ? "existing-fleet-error" : undefined}
            className="min-h-12 w-full rounded-md border border-[var(--landing-border)] bg-[var(--landing-field)] px-3 font-mono text-sm"
          />
          <button
            type="submit"
            disabled={accept.isPending}
            className="min-h-11 rounded-md bg-amber-300 px-5 text-sm font-semibold text-stone-950 disabled:opacity-50"
          >
            {accept.isPending ? "Joining…" : "Accept invitation"}
          </button>
          {error && (
            <p
              id="existing-fleet-error"
              role="alert"
              className="text-sm text-[var(--landing-danger)]"
            >
              {error}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
