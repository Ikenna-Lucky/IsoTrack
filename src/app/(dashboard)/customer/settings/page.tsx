"use client";

import { useState, useEffect } from "react";
import {
  User,
  Shield,
  Save,
  Eye,
  EyeOff,
  Check,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";
import { useUpdateProfile, useChangePassword } from "@/hooks/use-user";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import { extractErrorMessage } from "@/lib/errors";

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { key: "profile",  label: "Profile",  icon: User   },
  { key: "security", label: "Security", icon: Shield },
] as const;

type Tab = (typeof TABS)[number]["key"];

// ─── Shared primitives ────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
  disabled,
  suffix,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ElementType;
  disabled?: boolean;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 pointer-events-none" />
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full rounded-xl border border-white/[0.07] bg-white/[0.03] py-2.5 pr-3 text-sm text-zinc-200",
          "placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/[0.12]",
          "transition-all duration-200",
          Icon ? "pl-9" : "pl-3.5",
          suffix ? "pr-10" : "",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
      )}
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
        "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
        saved
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          : "bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20",
        loading && "opacity-60 cursor-not-allowed",
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : saved ? (
        <Check className="h-4 w-4" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      {loading ? "Saving…" : saved ? "Saved!" : "Save changes"}
    </button>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.04]">
        <p className="text-sm font-semibold text-zinc-200">{title}</p>
        {description && (
          <p className="text-xs text-zinc-600 mt-0.5">{description}</p>
        )}
      </div>
      <div className="px-5 py-5 space-y-4">{children}</div>
    </div>
  );
}

// ─── Profile tab ─────────────────────────────────────────────────────────────

function ProfileTab() {
  const user = useAuthStore((s) => s.user);
  const { mutateAsync: save, isPending } = useUpdateProfile();

  const [name, setName]   = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Sync if user loads after mount
  useEffect(() => {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
  }, [user?.id]);

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
    <div className="space-y-4">
      <Card
        title="Personal information"
        description="Your name and contact details"
      >
        <div>
          <FieldLabel>Full name</FieldLabel>
          <Input
            value={name}
            onChange={setName}
            placeholder="First and last name"
            icon={User}
          />
          <p className="mt-1 text-[11px] text-zinc-700">
            Used for delivery identification
          </p>
        </div>
        <div>
          <FieldLabel>Email</FieldLabel>
          <Input
            value={user?.email ?? ""}
            disabled
            icon={Mail}
          />
          <p className="mt-1 text-[11px] text-zinc-700">
            Contact support to change your email
          </p>
        </div>
        <div>
          <FieldLabel>Phone number</FieldLabel>
          <Input
            value={phone}
            onChange={setPhone}
            placeholder="+234 800 000 0000"
            icon={Phone}
          />
          <p className="mt-1 text-[11px] text-zinc-700">
            Drivers call this number when they arrive
          </p>
        </div>

        {error && (
          <p className="rounded-lg bg-rose-500/[0.08] border border-rose-500/[0.15] px-3 py-2 text-xs text-rose-400">
            {error}
          </p>
        )}

        <div className="flex justify-end pt-1">
          <SaveButton saved={saved} loading={isPending} onClick={handleSave} />
        </div>
      </Card>
    </div>
  );
}

// ─── Security tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const { mutateAsync: changePw, isPending } = useChangePassword();
  const logout = useAuthStore((s) => s.logout);

  const [current, setCurrent]   = useState("");
  const [next, setNext]         = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext]       = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState("");

  async function handleSave() {
    setError("");
    if (!current || !next) {
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
      await changePw({ currentPassword: current, newPassword: next });
      setSaved(true);
      setCurrent("");
      setNext("");
      setConfirm("");
      setTimeout(() => setSaved(false), 2500);
      // Sign out so the user logs in fresh with the new password
      setTimeout(() => logout(), 1500);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Failed to change password."));
    }
  }

  return (
    <div className="space-y-4">
      <Card
        title="Change password"
        description="You will be signed out after a successful change"
      >
        <div>
          <FieldLabel>Current password</FieldLabel>
          <Input
            type={showCurrent ? "text" : "password"}
            value={current}
            onChange={setCurrent}
            placeholder="Enter current password"
            suffix={
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                {showCurrent ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            }
          />
        </div>
        <div>
          <FieldLabel>New password</FieldLabel>
          <Input
            type={showNext ? "text" : "password"}
            value={next}
            onChange={setNext}
            placeholder="At least 8 characters"
            suffix={
              <button
                type="button"
                onClick={() => setShowNext((v) => !v)}
                className="text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                {showNext ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            }
          />
        </div>
        <div>
          <FieldLabel>Confirm new password</FieldLabel>
          <Input
            type="password"
            value={confirm}
            onChange={setConfirm}
            placeholder="Repeat new password"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-rose-500/[0.08] border border-rose-500/[0.15] px-3 py-2 text-xs text-rose-400">
            {error}
          </p>
        )}

        {saved && (
          <p className="rounded-lg bg-emerald-500/[0.08] border border-emerald-500/[0.15] px-3 py-2 text-xs text-emerald-400">
            Password changed. Signing you out…
          </p>
        )}

        <div className="flex justify-end pt-1">
          <SaveButton saved={saved} loading={isPending} onClick={handleSave} />
        </div>
      </Card>

      <Card title="Two-factor authentication">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-300">
              Authenticator app
            </p>
            <p className="text-xs text-zinc-600 mt-0.5">
              Add an extra layer of security to your account
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/[0.06] px-2.5 py-1 text-[10px] font-semibold text-amber-400/70">
            Coming soon
          </span>
        </div>
      </Card>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerSettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Settings</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Manage your profile and account security
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150",
              tab === key
                ? "bg-violet-500/[0.14] text-violet-400 border border-violet-500/[0.2]"
                : "text-zinc-600 hover:text-zinc-300 border border-transparent",
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "profile"  && <ProfileTab />}
      {tab === "security" && <SecurityTab />}
    </div>
  );
}
