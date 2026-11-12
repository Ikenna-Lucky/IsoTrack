"use client";

import { useEffect, useState } from "react";
import { AccountDeactivation } from "@/components/auth/account-deactivation";
import {
  Bell,
  Building2,
  Check,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings2,
  Shield,
  User,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useUpdateProfile } from "@/hooks/use-user";
import {
  type BusinessNotifPrefs,
  useBusinessNotifPrefs,
  useBusinessPreferences,
  useBusinessProfile,
  useUpdateBusinessNotifPrefs,
  useUpdateBusinessPreferences,
  useUpdateBusinessProfile,
} from "@/hooks/use-business";
import { extractErrorMessage } from "@/lib/errors";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { changedSettings, passwordProblem } from "@/lib/business-settings";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "profile", label: "Profile", icon: User },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Security", icon: Shield },
  { key: "preferences", label: "Preferences", icon: Settings2 },
] as const;

type Tab = (typeof TABS)[number]["key"];

const NOTIF_DEFAULT: BusinessNotifPrefs = {
  shipmentCreated: { email: true, sms: false },
  driverAssigned: { email: true, sms: true },
  pickedUp: { email: true, sms: false },
  outForDelivery: { email: true, sms: true },
  delivered: { email: true, sms: false },
  failed: { email: true, sms: true },
  driverOnline: { email: false, sms: false },
  weeklyReport: { email: true, sms: false },
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-xs font-semibold text-[var(--landing-muted)]">
      {children}
    </span>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
  disabled,
  suffix,
}: {
  label?: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string | undefined;
  type?: string | undefined;
  icon?: React.ElementType | undefined;
  disabled?: boolean | undefined;
  suffix?: React.ReactNode | undefined;
}) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--landing-muted)]" />
      )}
      <input
        aria-label={label}
        autoComplete={type === "password" ? "off" : undefined}
        type={type}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full rounded-md border border-[var(--landing-border)] bg-[var(--landing-field)] py-3 pr-3 text-sm font-bold text-[var(--landing-ink)] outline-none transition placeholder:text-stone-700 focus:border-teal-400/40 focus:ring-2 focus:ring-teal-400/10",
          Icon ? "pl-10" : "pl-3",
          suffix && "pr-11",
          disabled && "cursor-not-allowed opacity-55",
        )}
      />
      {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
    </div>
  );
}

function Panel({
  eyebrow,
  title,
  description,
  children,
  disabled = false,
}: {
  disabled?: boolean;
  eyebrow: string;
  title: string;
  description?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-[var(--landing-border)] bg-[var(--landing-panel)]">
      <div className="border-b border-[var(--landing-border)] px-4 py-4 sm:px-5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--landing-accent)]">
          {eyebrow}
        </p>
        <h3 className="mt-1 text-base font-semibold text-[var(--landing-ink)]">{title}</h3>
        {description && (
          <p className="mt-1 text-xs leading-5 text-[var(--landing-muted)]">{description}</p>
        )}
      </div>
      <fieldset disabled={disabled} className="space-y-4 p-4 sm:p-5">
        {children}
      </fieldset>
    </section>
  );
}

function SaveButton({
  saved,
  loading,
  onClick,
  label = "Save changes",
}: {
  label?: string;
  saved: boolean;
  loading?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        "flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60",
        saved
          ? "border border-emerald-400/25 bg-emerald-400/10 text-[var(--landing-accent)]"
          : "bg-amber-300 text-black hover:bg-amber-200",
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : saved ? (
        <Check className="h-4 w-4" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      {loading ? "Saving..." : saved ? "Saved" : label}
    </button>
  );
}

function Notice({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-md border px-3 py-2 text-xs font-bold leading-5",
        tone === "error"
          ? "border-rose-400/20 bg-rose-400/10 text-[var(--landing-danger)]"
          : "border-emerald-400/20 bg-emerald-400/10 text-[var(--landing-accent)]",
      )}
    >
      {children}
    </p>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return (
    <input
      type="checkbox"
      checked={value}
      onChange={(event) => onChange(event.target.checked)}
      className="h-5 w-5 accent-teal-600"
    />
  );
}

function LoadState({ error, retry }: { error: boolean; retry: () => void }) {
  return (
    <div
      role={error ? "alert" : "status"}
      className="rounded-md border border-[var(--landing-border)] bg-[var(--landing-panel)] p-6 text-sm"
    >
      {error
        ? "Settings could not be loaded. Your saved values have not been changed."
        : "Loading saved settings…"}
      {error && (
        <button onClick={retry} className="ml-3 underline">
          Try again
        </button>
      )}
    </div>
  );
}

function ProfileTab() {
  const user = useAuthStore((state) => state.user);
  const profile = useBusinessProfile();
  const business = profile.data;
  const [initialized, setInitialized] = useState(false);
  const [baseline, setBaseline] = useState<Record<string, unknown>>({});
  const updateUser = useUpdateProfile();
  const updateBusiness = useUpdateBusinessProfile();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [businessName, setBusinessName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!business || initialized) return;
    setName(business.user?.name ?? user?.name ?? "");
    setPhone(business.user?.phone ?? user?.phone ?? "");
    setBusinessName(business.businessName ?? "");
    setStreet(business.address?.street ?? "");
    setCity(business.address?.city ?? "");
    setStateName(business.address?.state ?? "");
    setBaseline({
      name: business.user?.name ?? user?.name ?? "",
      phone: business.user?.phone ?? user?.phone ?? "",
      businessName: business.businessName ?? "",
      address: business.address ?? null,
    });
    setInitialized(true);
  }, [business, initialized, user]);

  async function handleSave() {
    setError("");
    try {
      if (
        name.trim().length < 2 ||
        name.trim().length > 100 ||
        businessName.trim().length < 2 ||
        businessName.trim().length > 100
      )
        throw new Error("Account and business names must contain 2–100 characters.");
      if (phone.trim() && !/^\+?[1-9]\d{6,14}$/.test(phone.trim()))
        throw new Error("Enter a valid international phone number, for example +2348012345678.");
      const account = changedSettings(
        { name: String(baseline.name ?? ""), phone: String(baseline.phone ?? "") },
        { name: name.trim(), phone: phone.trim() },
      );
      if (Object.keys(account).length) {
        await updateUser.mutateAsync(account);
        setBaseline((previous) => ({ ...previous, name: name.trim(), phone: phone.trim() }));
      }
      const identity: {
        businessName?: string;
        address?: { street: string; city: string; state: string };
      } = {};
      if (businessName.trim() !== baseline.businessName)
        identity.businessName = businessName.trim();
      const address = { street: street.trim(), city: city.trim(), state: stateName.trim() };
      const previousAddress = baseline.address as typeof address | null;
      if (
        Object.entries(address).some(
          ([key, value]) => value !== (previousAddress?.[key as keyof typeof address] ?? ""),
        )
      )
        identity.address = address;
      if (Object.keys(identity).length) await updateBusiness.mutateAsync(identity);
      setBaseline((previous) => ({ ...previous, ...identity }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(
        extractErrorMessage(
          err,
          "Could not complete the save. Account contact changes may already be saved; retry to finish the business details.",
        ),
      );
    }
  }

  if (!initialized)
    return <LoadState error={profile.isError} retry={() => void profile.refetch()} />;

  return (
    <Panel
      disabled={updateUser.isPending || updateBusiness.isPending}
      eyebrow="Identity"
      title="Business profile"
      description="Keep sender identity and dispatch address details accurate."
    >
      <div onChange={() => setSaved(false)} className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Business name</FieldLabel>
          <Input
            label="Business name"
            value={businessName}
            onChange={setBusinessName}
            icon={Building2}
          />
        </div>
        <div>
          <FieldLabel>Account owner</FieldLabel>
          <Input label="Account owner" value={name} onChange={setName} icon={User} />
        </div>
        <div>
          <FieldLabel>Email</FieldLabel>
          <Input label="Email" value={user?.email ?? ""} icon={Mail} disabled />
        </div>
        <div>
          <FieldLabel>Phone</FieldLabel>
          <Input label="Phone" value={phone} onChange={setPhone} icon={Phone} />
        </div>
        <div>
          <FieldLabel>Street address</FieldLabel>
          <Input label="Street address" value={street} onChange={setStreet} icon={MapPin} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>City</FieldLabel>
            <Input label="City" value={city} onChange={setCity} />
          </div>
          <div>
            <FieldLabel>State</FieldLabel>
            <Input label="State" value={stateName} onChange={setStateName} />
          </div>
        </div>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex justify-end">
        <SaveButton
          saved={saved}
          loading={updateUser.isPending || updateBusiness.isPending}
          onClick={handleSave}
        />
      </div>
    </Panel>
  );
}

function NotificationsTab() {
  const query = useBusinessNotifPrefs();
  const remote = query.data;
  const [baseline, setBaseline] = useState<BusinessNotifPrefs | null>(null);
  const update = useUpdateBusinessNotifPrefs();
  const [prefs, setPrefs] = useState<BusinessNotifPrefs>(NOTIF_DEFAULT);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (remote && !baseline) {
      setPrefs(remote);
      setBaseline(remote);
    }
  }, [remote, baseline]);

  async function handleSave() {
    setError("");
    try {
      await update.mutateAsync(changedSettings(baseline!, prefs));
      setBaseline(prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Failed to save notification settings."));
    }
  }

  if (!baseline) return <LoadState error={query.isError} retry={() => void query.refetch()} />;

  return (
    <Panel
      disabled={update.isPending}
      eyebrow="Signals"
      title="Notification routing"
      description="These choices are saved to your business account. The current backend does not use them to control email or SMS delivery."
    >
      <div className="divide-y divide-white/[0.07]">
        {Object.entries(NOTIF_DEFAULT).map(([key]) => {
          const value = prefs[key as keyof BusinessNotifPrefs];
          return (
            <div key={key} className="grid gap-3 py-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
              <div>
                <p className="text-sm font-semibold capitalize text-[var(--landing-ink)]">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </p>
                <p className="mt-0.5 text-xs text-[var(--landing-muted)]">
                  Saved channel preference
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-[var(--landing-muted)]">
                <span className="sr-only">{key.replace(/([A-Z])/g, " $1")} </span>Email
                <Toggle
                  value={value.email}
                  onChange={(next) => {
                    setSaved(false);
                    setPrefs((previous) => ({ ...previous, [key]: { ...value, email: next } }));
                  }}
                />
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-[var(--landing-muted)]">
                <span className="sr-only">{key.replace(/([A-Z])/g, " $1")} </span>SMS
                <Toggle
                  value={value.sms}
                  onChange={(next) => {
                    setSaved(false);
                    setPrefs((previous) => ({ ...previous, [key]: { ...value, sms: next } }));
                  }}
                />
              </label>
            </div>
          );
        })}
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex justify-end">
        <SaveButton saved={saved} loading={update.isPending} onClick={handleSave} />
      </div>
    </Panel>
  );
}

function PasswordButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[var(--landing-muted)] transition hover:text-[var(--landing-ink)]"
      aria-label={active ? "Hide password" : "Show password"}
    >
      {active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

function SecurityTab() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handlePassword() {
    setError("");
    if (!current || !next || !confirm) return setError("Please fill in all password fields.");
    const problem = passwordProblem(next);
    if (problem) return setError(problem);
    if (next !== confirm) return setError("Passwords do not match.");
    if (pending) return;
    setPending(true);
    try {
      await api.patch("/auth/password", { currentPassword: current, newPassword: next });
      setSaved(true);
      setCurrent("");
      setNext("");
      setConfirm("");
      useAuthStore.getState().clearAuth();
      router.replace("/login");
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Failed to change password."));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <fieldset disabled={pending}>
        <Panel
          eyebrow="Access"
          title="Change password"
          description="Use 8–72 characters, including an uppercase letter and a number (maximum 72 UTF-8 bytes). A successful change signs out all devices."
        >
          <div>
            <FieldLabel>Current password</FieldLabel>
            <Input
              label="Current password"
              type={showCurrent ? "text" : "password"}
              value={current}
              onChange={setCurrent}
              icon={LockKeyhole}
              suffix={
                <PasswordButton
                  active={showCurrent}
                  onClick={() => setShowCurrent((value) => !value)}
                />
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>New password</FieldLabel>
              <Input
                label="New password"
                type={showNext ? "text" : "password"}
                value={next}
                onChange={setNext}
                icon={Shield}
                suffix={
                  <PasswordButton
                    active={showNext}
                    onClick={() => setShowNext((value) => !value)}
                  />
                }
              />
            </div>
            <div>
              <FieldLabel>Confirm password</FieldLabel>
              <Input
                label="Confirm password"
                type="password"
                value={confirm}
                onChange={setConfirm}
                icon={Shield}
              />
            </div>
          </div>
          {error && <Notice tone="error">{error}</Notice>}
          {saved && <Notice tone="success">Password changed. Signing you out...</Notice>}
          <div className="flex justify-end">
            <SaveButton
              saved={saved}
              label="Change password"
              loading={pending}
              onClick={handlePassword}
            />
          </div>
        </Panel>
      </fieldset>
      <AccountDeactivation themed />
    </div>
  );
}

function PreferencesTab() {
  const query = useBusinessPreferences();
  const remote = query.data;
  const [baseline, setBaseline] = useState<typeof remote>(undefined);
  const update = useUpdateBusinessPreferences();
  const [timezone, setTimezone] = useState("Africa/Lagos");
  const [currency, setCurrency] = useState("NGN");
  const [language, setLanguage] = useState("en");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [compactView, setCompactView] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!remote || baseline) return;
    setBaseline(remote);
    setTimezone(remote.timezone);
    setCurrency(remote.currency);
    setLanguage(remote.language);
    setDateFormat(remote.dateFormat);
    setCompactView(remote.compactView);
    setAutoRefresh(remote.autoRefresh);
  }, [remote, baseline]);

  async function handleSave() {
    setError("");
    try {
      const values = { timezone, currency, language, dateFormat, compactView, autoRefresh };
      await update.mutateAsync(changedSettings(baseline!, values));
      setBaseline(values);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Failed to save preferences."));
    }
  }

  if (!baseline) return <LoadState error={query.isError} retry={() => void query.refetch()} />;

  return (
    <div onChange={() => setSaved(false)}>
      <Panel
        disabled={update.isPending}
        eyebrow="Workspace"
        title="Saved workspace defaults"
        description="These defaults are stored for your account. They do not currently change dashboard formatting, currency, density or refresh timing. Use the theme control in the top bar to change appearance."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Timezone</FieldLabel>
            <Input label="Timezone" value={timezone} onChange={setTimezone} />
          </div>
          <div>
            <FieldLabel>Currency</FieldLabel>
            <Input label="Currency" value={currency} onChange={setCurrency} />
          </div>
          <div>
            <FieldLabel>Language</FieldLabel>
            <Input label="Language" value={language} onChange={setLanguage} />
          </div>
          <div>
            <FieldLabel>Date format</FieldLabel>
            <Input label="Date format" value={dateFormat} onChange={setDateFormat} />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-md border border-[var(--landing-border)] bg-[var(--landing-section)] p-3">
            <label className="flex w-full items-center justify-between gap-3 text-sm">
              Compact view
              <Toggle value={compactView} onChange={setCompactView} />
            </label>
          </div>
          <div className="flex items-center justify-between rounded-md border border-[var(--landing-border)] bg-[var(--landing-section)] p-3">
            <label className="flex w-full items-center justify-between gap-3 text-sm">
              Auto refresh
              <Toggle value={autoRefresh} onChange={setAutoRefresh} />
            </label>
          </div>
        </div>
        {error && <Notice tone="error">{error}</Notice>}
        <div className="flex justify-end">
          <SaveButton saved={saved} loading={update.isPending} onClick={handleSave} />
        </div>
      </Panel>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [visited, setVisited] = useState<Tab[]>(["profile"]);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--landing-accent)]">
          Business control
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--landing-ink)] sm:text-3xl">
          Settings
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--landing-muted)]">
          Manage business identity, alerts, security, and dashboard preferences.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-2 rounded-md border border-[var(--landing-border)] bg-[var(--landing-section)] p-1 sm:grid-cols-4">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            aria-pressed={activeTab === key}
            onClick={() => {
              setActiveTab(key);
              setVisited((previous) => (previous.includes(key) ? previous : [...previous, key]));
            }}
            className={cn(
              "flex items-center justify-center gap-2 rounded px-3 py-2.5 text-xs font-semibold transition",
              activeTab === key
                ? "bg-teal-400/10 text-[var(--landing-accent)] ring-1 ring-teal-400/25"
                : "text-[var(--landing-muted)] hover:text-[var(--landing-ink)]",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {visited.includes("profile") && (
        <div hidden={activeTab !== "profile"}>
          <ProfileTab />
        </div>
      )}
      {visited.includes("notifications") && (
        <div hidden={activeTab !== "notifications"}>
          <NotificationsTab />
        </div>
      )}
      {activeTab === "security" && <SecurityTab />}
      {visited.includes("preferences") && (
        <div hidden={activeTab !== "preferences"}>
          <PreferencesTab />
        </div>
      )}
    </div>
  );
}
