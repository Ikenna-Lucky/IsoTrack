"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useUpdateProfile } from "@/hooks/use-user";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";
import { changedSettings, passwordProblem } from "@/lib/business-settings";
import { customerProfileInput } from "@/lib/customer-workspace";
import { extractErrorMessage } from "@/lib/errors";
import { AccountDeactivation } from "@/components/auth/account-deactivation";
import {
  WorkspaceHeading,
  workspaceButton,
  workspaceField,
  workspacePanel,
} from "@/components/dashboard/workspace-ui";
import type { User } from "@/types";
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block min-w-0 text-sm text-[var(--landing-muted)]">
      <span className="mb-2 block">{label}</span>
      {children}
    </label>
  );
}
function Feedback({ error, saved }: { error: string; saved: boolean }) {
  return (
    <>
      {error && (
        <p role="alert" className="text-sm text-[var(--landing-danger)]">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="text-sm text-[var(--landing-accent)]">
          Changes saved.
        </p>
      )}
    </>
  );
}
function ProfileForm({ user }: { user: User }) {
  const update = useUpdateProfile();
  const initial = { name: user.name, phone: user.phone ?? "" };
  const [baseline, setBaseline] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  function edit(key: keyof typeof draft, value: string) {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setSaved(false);
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (update.isPending) return;
    setSaved(false);
    setError("");
    const parsed = customerProfileInput.safeParse(draft);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your contact details.");
      return;
    }
    const changes = changedSettings(baseline, parsed.data);
    if (!Object.keys(changes).length) {
      setError("No changes to save.");
      return;
    }
    try {
      const updated = await update.mutateAsync(changes);
      const next = {
        name: updated.name,
        phone: updated.phone ?? "",
      };
      setBaseline(next);
      setDraft(next);
      setSaved(true);
    } catch (cause) {
      setError(
        extractErrorMessage(
          cause,
          "Could not confirm the save. Review your account details before submitting again.",
        ),
      );
    }
  }
  return (
    <form onSubmit={(event) => void submit(event)} noValidate className={`${workspacePanel} p-5`}>
      <fieldset disabled={update.isPending} className="space-y-5">
        <legend className="text-lg font-semibold">Contact details</legend>
        <p className="text-sm text-[var(--landing-muted)]">
          Keep your delivery contact details current. Empty optional fields clear their saved
          values.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name">
            <input
              className={workspaceField}
              value={draft.name}
              maxLength={100}
              autoComplete="name"
              onChange={(event) => edit("name", event.target.value)}
            />
          </Field>
          <Field label="Email">
            <input className={workspaceField} value={user.email} disabled type="email" />
          </Field>
          <Field label="Phone">
            <input
              className={workspaceField}
              value={draft.phone}
              maxLength={16}
              type="tel"
              autoComplete="tel"
              onChange={(event) => edit("phone", event.target.value)}
            />
          </Field>
        </div>
        <Feedback error={error} saved={saved} />
        <button className={workspaceButton}>
          {update.isPending ? "Saving..." : "Save contact details"}
        </button>
      </fieldset>
    </form>
  );
}
function SecurityPanel() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    setError("");
    if (!current) {
      setError("Enter your current password.");
      return;
    }
    const problem = passwordProblem(next);
    if (problem) {
      setError(problem);
      return;
    }
    if (next !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setPending(true);
    try {
      await api.patch("/auth/password", { currentPassword: current, newPassword: next });
      setCurrent("");
      setNext("");
      setConfirm("");
      useAuthStore.getState().clearAuth();
      router.replace("/login");
    } catch (cause) {
      setError(
        extractErrorMessage(
          cause,
          "Password change could not be confirmed. If the connection was lost, sign in with your new password before trying again.",
        ),
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="space-y-6">
      <form onSubmit={(event) => void submit(event)} className={`${workspacePanel} p-5`} noValidate>
        <fieldset disabled={pending} className="space-y-5">
          <legend className="text-lg font-semibold">Change password</legend>
          <p className="text-sm leading-6 text-[var(--landing-muted)]">
            Use 8-72 characters with an uppercase letter and a number, within 72 UTF-8 bytes. A
            successful change signs out every device.
          </p>
          <Field label="Current password">
            <input
              className={workspaceField}
              type={show ? "text" : "password"}
              value={current}
              autoComplete="current-password"
              onChange={(event) => setCurrent(event.target.value)}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="New password">
              <input
                className={workspaceField}
                type={show ? "text" : "password"}
                value={next}
                autoComplete="new-password"
                onChange={(event) => setNext(event.target.value)}
              />
            </Field>
            <Field label="Confirm new password">
              <input
                className={workspaceField}
                type={show ? "text" : "password"}
                value={confirm}
                autoComplete="new-password"
                onChange={(event) => setConfirm(event.target.value)}
              />
            </Field>
          </div>
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="size-5 accent-teal-300"
              checked={show}
              onChange={(event) => setShow(event.target.checked)}
            />
            Show passwords
          </label>
          <Feedback error={error} saved={false} />
          <button className={workspaceButton}>
            {pending ? "Changing password..." : "Change password"}
          </button>
        </fieldset>
      </form>
      <AccountDeactivation themed />
    </div>
  );
}
export default function CustomerSettingsPage() {
  const [section, setSection] = useState("profile");
  const user = useAuthStore((state) => state.user);
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <WorkspaceHeading eyebrow="Customer account" title="Settings">
        Maintain delivery contact details and manage access to your account. Email changes and
        two-factor authentication are not available in this screen.
      </WorkspaceHeading>
      <nav aria-label="Settings sections" className="flex flex-wrap gap-2">
        {["profile", "security"].map((value) => (
          <button
            key={value}
            aria-current={section === value ? "page" : undefined}
            onClick={() => setSection(value)}
            className={`${workspaceButton} capitalize ${section === value ? "border-[var(--landing-accent)]! text-[var(--landing-accent)]!" : ""}`}
          >
            {value}
          </button>
        ))}
      </nav>
      <div hidden={section !== "profile"}>{user && <ProfileForm key={user.id} user={user} />}</div>
      {section === "security" && <SecurityPanel />}
    </div>
  );
}
