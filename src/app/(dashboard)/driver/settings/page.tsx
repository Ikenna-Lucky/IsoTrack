"use client";
import { DriverProfileLocation } from "@/components/dashboard/driver-profile-location";
import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useIsMutating, useQueryClient } from "@tanstack/react-query";
import {
  useDriverProfile,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useUpdateVehicle,
} from "@/hooks/use-driver";
import { useUpdateProfile } from "@/hooks/use-user";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";
import { changedSettings, passwordProblem } from "@/lib/business-settings";
import { driverProfileInput, driverVehicleInput } from "@/lib/driver-workspace";
import { extractErrorMessage } from "@/lib/errors";
import { AccountDeactivation } from "@/components/auth/account-deactivation";
import {
  DriverHeading,
  DriverReadState,
  driverButton,
  driverField,
  driverPanel,
} from "@/components/dashboard/driver-workspace";
import type { Driver, User, VehicleType, NotificationPreferences } from "@/types";

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
  const cache = useQueryClient();
  const initial = {
    name: user.name,
    phone: user.phone ?? "",
    emergencyContact: user.emergencyContact ?? "",
  };
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
    const parsed = driverProfileInput.safeParse(draft);
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
        emergencyContact: updated.emergencyContact ?? "",
      };
      setBaseline(next);
      setDraft(next);
      setSaved(true);
      void cache.invalidateQueries({ queryKey: ["drivers", "me"] });
    } catch (cause) {
      setError(
        extractErrorMessage(
          cause,
          "Could not confirm the save. Refresh your profile before submitting again.",
        ),
      );
    }
  }
  return (
    <form onSubmit={(event) => void submit(event)} noValidate className={`${driverPanel} p-5`}>
      <fieldset disabled={update.isPending} className="space-y-5">
        <legend className="text-lg font-semibold">Contact details</legend>
        <p className="text-sm text-[var(--landing-muted)]">
          Keep dispatch contact details current. Empty optional fields clear their saved values.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name">
            <input
              className={driverField}
              value={draft.name}
              maxLength={100}
              autoComplete="name"
              onChange={(event) => edit("name", event.target.value)}
            />
          </Field>
          <Field label="Email">
            <input className={driverField} value={user.email} disabled type="email" />
          </Field>
          <Field label="Phone">
            <input
              className={driverField}
              value={draft.phone}
              maxLength={16}
              type="tel"
              autoComplete="tel"
              onChange={(event) => edit("phone", event.target.value)}
            />
          </Field>
          <Field label="Emergency contact">
            <input
              className={driverField}
              value={draft.emergencyContact}
              maxLength={20}
              onChange={(event) => edit("emergencyContact", event.target.value)}
            />
          </Field>
        </div>
        <Feedback error={error} saved={saved} />
        <button className={driverButton}>
          {update.isPending ? "Saving..." : "Save contact details"}
        </button>
      </fieldset>
    </form>
  );
}
function vehicleDraft(driver: Driver) {
  return {
    vehicleType: driver.vehicleType,
    vehiclePlate: driver.vehiclePlate,
    vehicleModel: driver.vehicleModel ?? "",
    vehicleColor: driver.vehicleColor ?? "",
    vehicleYear: driver.vehicleYear ?? "",
    vehicleInsurance: driver.vehicleInsurance ?? "",
  };
}
function VehicleForm({ driver }: { driver: Driver }) {
  const update = useUpdateVehicle();
  const [baseline, setBaseline] = useState(() => vehicleDraft(driver));
  const [draft, setDraft] = useState(baseline);
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
    const parsed = driverVehicleInput.safeParse(draft);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your vehicle details.");
      return;
    }
    const changes = changedSettings(baseline, parsed.data);
    if (!Object.keys(changes).length) {
      setError("No changes to save.");
      return;
    }
    try {
      const updated = await update.mutateAsync(changes);
      const next = vehicleDraft({ ...driver, ...updated });
      setBaseline(next);
      setDraft(next);
      setSaved(true);
    } catch (cause) {
      setError(
        extractErrorMessage(
          cause,
          "Could not confirm the save. Refresh your vehicle record before submitting again.",
        ),
      );
    }
  }
  return (
    <form onSubmit={(event) => void submit(event)} noValidate className={`${driverPanel} p-5`}>
      <fieldset disabled={update.isPending} className="space-y-5">
        <legend className="text-lg font-semibold">Vehicle record</legend>
        <p className="text-sm text-[var(--landing-muted)]">
          These details describe your vehicle. Saving an insurance reference does not verify
          insurance.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Vehicle type">
            <select
              value={draft.vehicleType}
              onChange={(event) => {
                edit("vehicleType", event.target.value as VehicleType);
              }}
              className={driverField}
            >
              {["bike", "car", "van", "truck"].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>
          {(
            [
              ["vehiclePlate", "Plate number", 20],
              ["vehicleModel", "Model", 60],
              ["vehicleColor", "Colour", 30],
              ["vehicleYear", "Year", 4],
              ["vehicleInsurance", "Insurance reference", 60],
            ] as const
          ).map(([key, label, limit]) => (
            <Field key={key} label={label}>
              <input
                value={draft[key]}
                maxLength={limit}
                className={driverField}
                onChange={(event) => edit(key, event.target.value)}
              />
            </Field>
          ))}
        </div>
        <Feedback error={error} saved={saved} />
        <button className={driverButton}>
          {update.isPending ? "Saving..." : "Save vehicle record"}
        </button>
      </fieldset>
    </form>
  );
}
function NotificationsForm({ preferences }: { preferences: NotificationPreferences }) {
  const update = useUpdateNotificationPreferences();
  const [baseline, setBaseline] = useState(preferences);
  const [draft, setDraft] = useState(preferences);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const events = {
    newDelivery: "New assignment",
    deliveryComplete: "Delivery confirmed",
    deliveryFailed: "Failed delivery attempt",
  } as const;
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (update.isPending) return;
    setError("");
    setSaved(false);
    const changes = changedSettings(baseline, draft);
    if (!Object.keys(changes).length) {
      setError("No changes to save.");
      return;
    }
    try {
      const updated = await update.mutateAsync(changes);
      const next = { ...baseline, ...updated };
      setBaseline(next);
      setDraft(next);
      setSaved(true);
    } catch (cause) {
      setError(
        extractErrorMessage(
          cause,
          "Could not confirm the save. Reload saved choices before submitting again.",
        ),
      );
    }
  }
  return (
    <form onSubmit={(event) => void submit(event)} className={`${driverPanel} p-5`}>
      <fieldset disabled={update.isPending} className="space-y-5">
        <legend className="text-lg font-semibold">Shipment notifications</legend>
        <p className="text-sm leading-6 text-[var(--landing-muted)]">
          Choose in-app updates in the notification bell and emails to your account address. In-app
          and email are independent; browser and device push are not enabled. Assignment records
          remain available in Deliveries even when alerts are off.
        </p>
        <div className="divide-y divide-[var(--landing-border)]">
          {Object.entries(events).map(([key, label]) => {
            const event = key as keyof typeof events;
            return (
              <div
                key={key}
                className="grid gap-3 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"
              >
                <p className="text-sm font-medium">{label}</p>
                {(["push", "email"] as const).map((channel) => (
                  <label key={channel} className="flex min-h-11 items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      className="size-5 accent-teal-600"
                      checked={draft[event][channel]}
                      onChange={(change) => {
                        setDraft((previous) => ({
                          ...previous,
                          [event]: { ...previous[event], [channel]: change.target.checked },
                        }));
                        setSaved(false);
                      }}
                    />
                    <span className="sr-only">{label}: </span>
                    {channel === "push" ? "In-app" : "Email"}
                  </label>
                ))}
              </div>
            );
          })}
        </div>
        <p className="text-xs leading-5 text-[var(--landing-muted)]">
          Saved choices are checked before delivery, including queued alerts. Existing inbox updates
          remain; an email already sending cannot be recalled. Recovery, verification and recipient
          delivery-code emails are separate.
        </p>
        <Feedback error={error} saved={saved} />
        <button className={driverButton}>
          {update.isPending ? "Saving..." : "Save notification choices"}
        </button>
        <details className="border-t border-[var(--landing-border)] pt-4">
          <summary className="cursor-pointer py-2 text-sm font-medium">
            Other alerts are not available yet
          </summary>
          <p className="mt-2 text-sm leading-6 text-[var(--landing-muted)]">
            Pickup reminders, customer messages, rating alerts, payouts and weekly reports have no
            delivery service. Older saved choices are retained when you update shipment
            notifications.
          </p>
        </details>
      </fieldset>
    </form>
  );
}
function NotificationsPanel() {
  const query = useNotificationPreferences();
  const [revision, setRevision] = useState(0);
  const mutating = useIsMutating();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          disabled={query.isFetching || mutating > 0}
          className={driverButton}
          onClick={() =>
            void query.refetch().then((result) => {
              if (result.isSuccess) setRevision((value) => value + 1);
            })
          }
        >
          Reload saved choices
        </button>
        <p className="text-xs text-[var(--landing-muted)]">
          Reloading replaces unsaved notification edits.
        </p>
      </div>
      <DriverReadState
        pending={query.isPending}
        error={query.isError}
        retry={() => void query.refetch()}
      >
        {query.data && <NotificationsForm key={revision} preferences={query.data} />}
      </DriverReadState>
    </div>
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
      <form onSubmit={(event) => void submit(event)} className={`${driverPanel} p-5`} noValidate>
        <fieldset disabled={pending} className="space-y-5">
          <legend className="text-lg font-semibold">Change password</legend>
          <p className="text-sm leading-6 text-[var(--landing-muted)]">
            Use 8-72 characters with an uppercase letter and a number, within 72 UTF-8 bytes. A
            successful change signs out every device.
          </p>
          <Field label="Current password">
            <input
              className={driverField}
              type={show ? "text" : "password"}
              value={current}
              autoComplete="current-password"
              onChange={(event) => setCurrent(event.target.value)}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="New password">
              <input
                className={driverField}
                type={show ? "text" : "password"}
                value={next}
                autoComplete="new-password"
                onChange={(event) => setNext(event.target.value)}
              />
            </Field>
            <Field label="Confirm new password">
              <input
                className={driverField}
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
          <button className={driverButton}>
            {pending ? "Changing password..." : "Change password"}
          </button>
        </fieldset>
      </form>
      <AccountDeactivation themed />
    </div>
  );
}
export default function DriverSettingsPage() {
  const [section, setSection] = useState("profile");
  const profile = useDriverProfile();
  const [reload, setReload] = useState(0);
  const mutating = useIsMutating();
  const sections = {
    profile: "Profile",
    vehicle: "Vehicle",
    notifications: "Notifications",
    security: "Security",
  };
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <DriverHeading eyebrow="Driver account" title="Settings">
        Maintain your contact and vehicle records, review notification availability and protect your
        account.
      </DriverHeading>
      <nav aria-label="Settings sections" className="flex flex-wrap gap-2">
        {Object.entries(sections).map(([key, label]) => (
          <button
            key={key}
            aria-current={section === key ? "page" : undefined}
            onClick={() => setSection(key)}
            className={`${driverButton} ${section === key ? "border-[var(--landing-accent)]! text-[var(--landing-accent)]!" : ""}`}
          >
            {label}
          </button>
        ))}
      </nav>
      <div hidden={section !== "profile" && section !== "vehicle"} className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            className={driverButton}
            disabled={profile.isFetching || mutating > 0}
            onClick={() =>
              void profile.refetch().then((result) => {
                if (result.isSuccess) setReload((value) => value + 1);
              })
            }
          >
            Reload saved details
          </button>
          <p className="text-xs text-[var(--landing-muted)]">
            Reloading replaces unsaved Profile and Vehicle edits.
          </p>
        </div>
        <DriverReadState
          pending={profile.isPending}
          error={profile.isError}
          retry={() => void profile.refetch()}
        >
          {profile.data && (
            <>
              <div hidden={section !== "profile"}>
                <ProfileForm key={`${profile.data.user.id}-${reload}`} user={profile.data.user} />
              </div>
              <div hidden={section !== "vehicle"}>
                <VehicleForm key={`${profile.data.id}-${reload}`} driver={profile.data} />
              </div>
            </>
          )}
        </DriverReadState>
      </div>
      <div hidden={section !== "notifications"}>
        <NotificationsPanel />
      </div>
      {section === "profile" && <DriverProfileLocation />}
      {section === "security" && <SecurityPanel />}
    </div>
  );
}
