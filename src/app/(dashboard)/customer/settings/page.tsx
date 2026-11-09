"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  Save,
  Shield,
  Smartphone,
  User,
} from "lucide-react";
import { useChangePassword, useUpdateProfile } from "@/hooks/use-user";
import { AccountDeactivation } from "@/components/auth/account-deactivation";
import { useAuthStore } from "@/store/auth";
import { extractErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "profile", label: "Profile", icon: User },
  { key: "security", label: "Security", icon: Shield },
] as const;

type Tab = (typeof TABS)[number]["key"];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-black text-stone-400">{children}</label>;
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
  disabled,
  suffix,
}: {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ElementType;
  disabled?: boolean;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="relative">
      {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-600" />}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full rounded-md border border-white/[0.08] bg-black/25 py-3 pr-3 text-sm font-bold text-stone-100 outline-none transition placeholder:text-stone-700",
          "focus:border-teal-400/40 focus:ring-2 focus:ring-teal-400/10",
          Icon ? "pl-10" : "pl-3",
          suffix && "pr-11",
          disabled && "cursor-not-allowed opacity-55",
        )}
      />
      {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
    </div>
  );
}

function SaveButton({
  saved,
  loading,
  onClick,
}: {
  saved: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        "flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60",
        saved ? "border border-emerald-400/25 bg-emerald-400/10 text-emerald-100" : "bg-amber-300 text-black hover:bg-amber-200",
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
      {loading ? "Saving..." : saved ? "Saved" : "Save changes"}
    </button>
  );
}

function Panel({
  title,
  eyebrow,
  description,
  children,
}: {
  title: string;
  eyebrow: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-white/[0.07] bg-[#0d1412]">
      <div className="border-b border-white/[0.07] px-4 py-4 sm:px-5">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-teal-200">{eyebrow}</p>
        <h3 className="mt-1 text-base font-black text-stone-50">{title}</h3>
        {description && <p className="mt-1 text-xs leading-5 text-stone-500">{description}</p>}
      </div>
      <div className="space-y-4 p-4 sm:p-5">{children}</div>
    </section>
  );
}

function Notice({ tone, children }: { tone: "error" | "success" | "info"; children: React.ReactNode }) {
  const styles = {
    error: "border-rose-400/20 bg-rose-400/10 text-rose-100",
    success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
    info: "border-teal-400/20 bg-teal-400/10 text-teal-100",
  };

  return <p className={cn("rounded-md border px-3 py-2 text-xs font-bold leading-5", styles[tone])}>{children}</p>;
}

function ProfileTab() {
  const user = useAuthStore((state) => state.user);
  const { mutateAsync: save, isPending } = useUpdateProfile();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
  }, [user?.id, user?.name, user?.phone]);

  async function handleSave() {
    setError("");
    try {
      await save({ name: name.trim(), phone: phone.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Failed to save profile."));
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr,300px]">
      <Panel
        eyebrow="Identity"
        title="Profile details"
        description="This information helps drivers confirm they are handing the package to the right person."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Full name</FieldLabel>
            <TextInput value={name} onChange={setName} placeholder="First and last name" icon={User} />
          </div>
          <div>
            <FieldLabel>Phone number</FieldLabel>
            <TextInput value={phone} onChange={setPhone} placeholder="+234 800 000 0000" icon={Phone} />
          </div>
        </div>
        <div>
          <FieldLabel>Email address</FieldLabel>
          <TextInput value={user?.email ?? ""} disabled icon={Mail} />
          <p className="mt-1.5 text-[11px] text-stone-600">Contact support if this email needs to change.</p>
        </div>

        {error && <Notice tone="error">{error}</Notice>}
        <div className="flex justify-end pt-1">
          <SaveButton saved={saved} loading={isPending} onClick={handleSave} />
        </div>
      </Panel>

      <aside className="rounded-md border border-teal-400/20 bg-teal-400/10 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-teal-400/25 bg-black/20">
          <Smartphone className="h-5 w-5 text-teal-200" />
        </div>
        <p className="mt-4 text-sm font-black text-stone-100">Delivery contact card</p>
        <p className="mt-2 text-xs leading-5 text-stone-500">
          Keep your phone number current so drivers can reach you at pickup handoff or final delivery.
        </p>
        <div className="mt-4 rounded-md border border-white/[0.07] bg-black/20 p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-stone-600">Current contact</p>
          <p className="mt-1 truncate text-xs font-black text-stone-200">{phone || "No phone added"}</p>
        </div>
      </aside>
    </div>
  );
}

function PasswordVisibilityButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-stone-600 transition hover:text-stone-200" aria-label={active ? "Hide password" : "Show password"}>
      {active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

function SecurityTab() {
  const { mutateAsync: changePassword, isPending } = useChangePassword();
  const logout = useAuthStore((state) => state.logout);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setError("");
    if (!current || !next || !confirm) {
      setError("Please fill in all password fields.");
      return;
    }
    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await changePassword({ currentPassword: current, newPassword: next });
      setSaved(true);
      setCurrent("");
      setNext("");
      setConfirm("");
      setTimeout(() => setSaved(false), 2500);
      setTimeout(() => logout(), 1500);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Failed to change password."));
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr,300px]">
      <Panel
        eyebrow="Access"
        title="Change password"
        description="After a successful change, IsoTrack signs you out so you can log back in with the new password."
      >
        <div>
          <FieldLabel>Current password</FieldLabel>
          <TextInput
            type={showCurrent ? "text" : "password"}
            value={current}
            onChange={setCurrent}
            placeholder="Enter current password"
            icon={LockKeyhole}
            suffix={<PasswordVisibilityButton active={showCurrent} onClick={() => setShowCurrent((value) => !value)} />}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>New password</FieldLabel>
            <TextInput
              type={showNext ? "text" : "password"}
              value={next}
              onChange={setNext}
              placeholder="At least 8 characters"
              icon={Shield}
              suffix={<PasswordVisibilityButton active={showNext} onClick={() => setShowNext((value) => !value)} />}
            />
          </div>
          <div>
            <FieldLabel>Confirm new password</FieldLabel>
            <TextInput type="password" value={confirm} onChange={setConfirm} placeholder="Repeat new password" icon={Shield} />
          </div>
        </div>

        {error && <Notice tone="error">{error}</Notice>}
        {saved && <Notice tone="success">Password changed. Signing you out...</Notice>}

        <div className="flex justify-end pt-1">
          <SaveButton saved={saved} loading={isPending} onClick={handleSave} />
        </div>
      </Panel>

      <aside className="space-y-3">
        <div className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-600">Security status</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-stone-100">Password protected</p>
              <p className="mt-1 text-xs text-stone-500">Update it whenever access changes.</p>
            </div>
            <span className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-black text-emerald-100">
              Active
            </span>
          </div>
        </div>
        <div className="rounded-md border border-amber-400/20 bg-amber-400/10 p-4">
          <p className="text-sm font-black text-stone-100">Two-factor authentication</p>
          <p className="mt-2 text-xs leading-5 text-stone-500">Authenticator app support is planned for a future security release.</p>
          <span className="mt-4 inline-flex rounded-md border border-amber-400/25 bg-black/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-100">
            Coming soon
          </span>
        </div>
        <AccountDeactivation />
      </aside>
    </div>
  );
}

export default function CustomerSettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4 sm:p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-200">Account control</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-50 sm:text-3xl">Settings</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
          Manage the identity and security details that support smooth delivery handoffs.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-2 rounded-md border border-white/[0.07] bg-white/[0.03] p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center justify-center gap-2 rounded px-3 py-2.5 text-xs font-black transition",
              tab === key ? "bg-teal-400/10 text-teal-100 ring-1 ring-teal-400/25" : "text-stone-500 hover:text-stone-200",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {tab === "profile" && <ProfileTab />}
      {tab === "security" && <SecurityTab />}
    </div>
  );
}
