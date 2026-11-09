"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { extractErrorMessage } from "@/lib/errors";
import { useAuthStore } from "@/store/auth";

export function AccountDeactivation() {
  const router = useRouter();
  const passwordId = useId();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function deactivate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      await api.post("/auth/deactivate", { currentPassword: password });
      useAuthStore.getState().clearAuth();
      router.replace("/login");
    } catch (error) {
      setError(extractErrorMessage(error));
    } finally {
      setPending(false);
      setPassword("");
    }
  }
  return (
    <section className="rounded-md border border-rose-400/20 bg-[#0d1412] p-4 sm:p-5">
      <h3 className="text-base font-bold text-stone-100">Deactivate account</h3>
      <p className="mt-2 text-sm leading-6 text-stone-400">
        Deactivation signs you out and prevents future sign-ins. Shipment, payment and audit records
        are preserved. Self-service reactivation is not available.
      </p>
      <p className="mt-2 text-sm leading-6 text-stone-400">
        Resolve active deliveries, packages in your custody and pending payments first. Businesses
        with linked drivers require assisted fleet offboarding.
      </p>
      {open ? (
        <form onSubmit={deactivate} className="mt-4 space-y-3">
          <label htmlFor={passwordId} className="block text-sm font-semibold text-stone-200">
            Confirm your current password
          </label>
          <input
            id={passwordId}
            type="password"
            required
            maxLength={72}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={pending}
            className="h-11 w-full rounded border border-white/15 bg-black/20 px-3 text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          {error && (
            <p role="alert" className="text-sm text-rose-200">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              disabled={pending}
              className="rounded bg-rose-300 px-4 py-2 text-sm font-bold text-black disabled:opacity-60"
            >
              {pending ? "Deactivating…" : "Confirm deactivation"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setOpen(false);
                setPassword("");
                setError("");
              }}
              className="rounded border border-white/20 px-4 py-2 text-sm text-stone-200"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 rounded border border-rose-300/30 px-4 py-2 text-sm font-bold text-rose-200"
        >
          Deactivate account
        </button>
      )}
    </section>
  );
}
