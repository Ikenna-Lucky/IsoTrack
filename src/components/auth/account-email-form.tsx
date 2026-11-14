"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { accountEmailToken } from "@/lib/account-email";
import { passwordProblem } from "@/lib/business-settings";
import { extractErrorMessage } from "@/lib/errors";
import { useAuthStore } from "@/store/auth";
import { workspaceButton, workspaceField } from "@/components/dashboard/workspace-ui";
import { z } from "zod";
export function AccountEmailForm({ purpose }: { purpose: "forgot" | "reset" | "verify" }) {
  const user = useAuthStore((state) => state.user);
  const [email, setEmail] = useState(user?.email ?? "");
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const captured = useRef(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (captured.current) return;
    captured.current = true;
    if (purpose !== "forgot") {
      setToken(accountEmailToken(window.location.hash));
      // Keep the proof in memory and remove it from the current history entry.
      if (window.location.hash)
        window.history.replaceState(
          window.history.state,
          "",
          window.location.pathname + window.location.search,
        );
    }
    if (
      purpose === "verify" &&
      new URLSearchParams(window.location.search).get("requested") === "1"
    )
      setMessage(
        "Verification requested. If eligible, your account will receive an email. Check your inbox and spam folder.",
      );
    setReady(true);
  }, [purpose]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || !ready) return;
    setError("");
    setMessage("");
    const requesting = purpose === "forgot" || (purpose === "verify" && !token);
    if (requesting && !z.string().email().max(254).safeParse(email.trim()).success) {
      setError("Enter a valid email address.");
      return;
    }
    if (purpose === "reset") {
      if (!token) {
        setError("Open a valid password-reset link from your email.");
        return;
      }
      const problem = passwordProblem(password);
      if (problem) {
        setError(problem);
        return;
      }
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }
    }
    setBusy(true);
    try {
      if (requesting) {
        await api.post(
          purpose === "forgot" ? "/auth/forgot-password" : "/auth/verification/request",
          { email: email.trim() },
        );
        setMessage(
          "If the account is eligible, an email will be sent. Check your inbox and spam folder. A request confirmation does not guarantee delivery.",
        );
      } else {
        await api.post(
          purpose === "reset" ? "/auth/reset-password" : "/auth/verification/confirm",
          purpose === "reset" ? { token, newPassword: password } : { token },
        );
        setToken(null);
        setPassword("");
        setConfirm("");
        setDone(true);
        if (purpose === "reset") useAuthStore.getState().clearAuth();
        setMessage(
          purpose === "reset"
            ? "Password reset. Sign in with your new password."
            : "Email verified. Sign in again to load your updated account details.",
        );
      }
    } catch (cause) {
      const code = (cause as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(
        code === "INVALID_OR_EXPIRED_TOKEN"
          ? "This link is invalid, expired or already used. Request a new one."
          : extractErrorMessage(
              cause,
              "The request could not be confirmed. Retry or request a new link if it has expired.",
            ),
      );
    } finally {
      setBusy(false);
    }
  }
  const requesting = purpose === "forgot" || (purpose === "verify" && !token);
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {purpose === "forgot"
            ? "Reset your password."
            : purpose === "reset"
              ? "Choose a new password."
              : "Verify your email."}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--landing-muted)]">
          {purpose === "forgot"
            ? "Request a recovery link for your IsoTrack account."
            : purpose === "reset"
              ? "Recovery links are single-use and expire after 30 minutes."
              : "Confirm that you can receive messages at your account email address. Verification links expire after 24 hours."}
        </p>
      </div>
      {message && (
        <p role="status" className="text-sm leading-6 text-[var(--landing-accent)]">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm leading-6 text-[var(--landing-danger)]">
          {error}
        </p>
      )}
      {ready && !done && (purpose !== "reset" || token) && (
        <form onSubmit={(event) => void submit(event)} noValidate className="space-y-5">
          <fieldset disabled={busy} className="space-y-5">
            {requesting && (
              <label className="block text-sm">
                Email address
                <input
                  className={workspaceField + " mt-2"}
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
            )}
            {purpose === "reset" && (
              <>
                <label className="block text-sm">
                  New password
                  <input
                    className={workspaceField + " mt-2"}
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </label>
                <label className="block text-sm">
                  Confirm new password
                  <input
                    className={workspaceField + " mt-2"}
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                  />
                </label>
                <p className="text-xs leading-5 text-[var(--landing-muted)]">
                  Use 8–72 characters with an uppercase letter and a number, within 72 UTF-8 bytes.
                  A successful reset signs out all devices.
                </p>
              </>
            )}
            <button
              className={workspaceButton + " bg-amber-300 text-stone-950! hover:bg-amber-200"}
            >
              {busy
                ? "Submitting..."
                : requesting
                  ? "Request email"
                  : purpose === "reset"
                    ? "Reset password"
                    : "Confirm email address"}
            </button>
          </fieldset>
        </form>
      )}
      {ready && purpose === "reset" && !token && !done && (
        <p role="status" className="text-sm">
          This page needs a valid recovery link.{" "}
          <Link href="/forgot-password" className="underline">
            Request a new link
          </Link>
          .
        </p>
      )}
      {!done && purpose === "reset" && token && (
        <Link
          href="/forgot-password"
          className="inline-flex min-h-11 items-center text-sm text-[var(--landing-accent)] underline"
        >
          Request a new recovery link
        </Link>
      )}
      {!done && purpose === "verify" && token && (
        <button
          className={workspaceButton}
          disabled={busy}
          onClick={() => {
            setToken(null);
            setError("");
            setMessage("");
          }}
        >
          Request another verification link
        </button>
      )}
      <div className="flex flex-wrap gap-4 text-sm text-[var(--landing-accent)]">
        <Link href="/login" className="inline-flex min-h-11 items-center underline">
          Return to sign in
        </Link>
        {purpose === "verify" && user && (
          <Link
            href={
              user.role === "business"
                ? "/business"
                : user.role === "driver"
                  ? "/driver"
                  : "/customer"
            }
            className="inline-flex min-h-11 items-center underline"
          >
            Continue to workspace
          </Link>
        )}
      </div>
      <p className="text-xs leading-5 text-[var(--landing-muted)]">
        If you reload a confirmation page, open the link from your email again.
      </p>
    </section>
  );
}
