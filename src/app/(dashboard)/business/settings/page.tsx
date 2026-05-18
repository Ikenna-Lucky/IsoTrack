"use client";

import { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Settings2,
  Save,
  Camera,
  Eye,
  EyeOff,
  AlertTriangle,
  Check,
  Loader2,
  Mail,
  Phone,
  Building2,
  MapPin,
  Globe,
  Clock,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useChangePassword } from "@/hooks/use-user";
import { useDeleteAccount } from "@/hooks/use-driver";
import { cn } from "@/lib/utils";
import { extractErrorMessage } from "@/lib/errors";

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { key: "profile",       label: "Profile",       icon: User     },
  { key: "notifications", label: "Notifications",  icon: Bell     },
  { key: "security",      label: "Security",       icon: Shield   },
  { key: "preferences",   label: "Preferences",    icon: Settings2 },
] as const;

type Tab = (typeof TABS)[number]["key"];

// ─── Shared form components ───────────────────────────────────────────────────

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
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ElementType;
  disabled?: boolean;
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
          "placeholder:text-zinc-700 focus:outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/[0.12]",
          "transition-all duration-200",
          Icon ? "pl-9" : "pl-3.5",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      />
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.05]">
        <p className="text-sm font-semibold text-white">{title}</p>
        {description && (
          <p className="text-xs text-zinc-600 mt-0.5">{description}</p>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function SaveButton({ saved, onClick, loading }: { saved: boolean; onClick: () => void; loading?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none",
        saved
          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
          : "bg-sky-500 text-white hover:bg-sky-400 shadow-lg shadow-sky-500/20 active:scale-[0.98]",
      )}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving…
        </>
      ) : saved ? (
        <>
          <Check className="h-4 w-4" />
          Saved
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          Save changes
        </>
      )}
    </button>
  );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-all duration-200",
        value
          ? "bg-sky-500 border-sky-400"
          : "bg-white/[0.06] border-white/[0.1]",
      )}
      role="switch"
      aria-checked={value}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200",
          value ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function NotifRow({
  label,
  description,
  email,
  sms,
  onEmail,
  onSms,
}: {
  label: string;
  description: string;
  email: boolean;
  sms: boolean;
  onEmail: (v: boolean) => void;
  onSms: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-white/[0.04] last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        <p className="text-[11px] text-zinc-600 mt-0.5">{description}</p>
      </div>
      <div className="flex items-center gap-6 shrink-0">
        <div className="flex flex-col items-center gap-1">
          <Toggle value={email} onChange={onEmail} />
          <span className="text-[9px] text-zinc-600">Email</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Toggle value={sms} onChange={onSms} />
          <span className="text-[9px] text-zinc-600">SMS</span>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Profile ─────────────────────────────────────────────────────────────

function ProfileTab() {
  const user = useAuthStore((s) => s.user);
  const [name, setName]         = useState(user?.name ?? "");
  const [email, setEmail]       = useState(user?.email ?? "");
  const [phone, setPhone]       = useState("+234 801 234 5678");
  const [bizName, setBizName]   = useState("Acme Logistics Ltd");
  const [address, setAddress]   = useState("14 Admiralty Way, Lekki Phase 1");
  const [city, setCity]         = useState("Lagos");
  const [saved, setSaved]       = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Avatar */}
      <SectionCard title="Profile Photo" description="Used across your dashboard and emails">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/25 to-teal-500/25 border border-sky-500/20 text-xl font-bold text-sky-300 uppercase">
              {name.slice(0, 2) || "BU"}
            </div>
            <button className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.1] bg-[#16161d] text-zinc-400 hover:text-white transition-colors shadow-lg">
              <Camera className="h-3 w-3" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-200">{name || "Business User"}</p>
            <p className="text-xs text-zinc-600 mt-0.5">{email}</p>
            <button className="mt-2 text-[11px] font-medium text-sky-400 hover:text-sky-300 transition-colors">
              Upload new photo
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Personal info */}
      <SectionCard title="Personal Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Full name</FieldLabel>
            <Input value={name} onChange={setName} placeholder="Your full name" icon={User} />
          </div>
          <div>
            <FieldLabel>Email address</FieldLabel>
            <Input value={email} onChange={setEmail} placeholder="you@example.com" icon={Mail} type="email" />
          </div>
          <div>
            <FieldLabel>Phone number</FieldLabel>
            <Input value={phone} onChange={setPhone} placeholder="+234 800 000 0000" icon={Phone} />
          </div>
        </div>
      </SectionCard>

      {/* Business info */}
      <SectionCard title="Business Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <FieldLabel>Business name</FieldLabel>
            <Input value={bizName} onChange={setBizName} placeholder="Your company name" icon={Building2} />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel>Address</FieldLabel>
            <Input value={address} onChange={setAddress} placeholder="Street address" icon={MapPin} />
          </div>
          <div>
            <FieldLabel>City</FieldLabel>
            <Input value={city} onChange={setCity} placeholder="City" />
          </div>
          <div>
            <FieldLabel>Country</FieldLabel>
            <Input value="Nigeria" disabled icon={Globe} />
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton saved={saved} onClick={handleSave} />
      </div>
    </div>
  );
}

// ─── Tab: Notifications ───────────────────────────────────────────────────────

function NotificationsTab() {
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState({
    shipmentCreated:  { email: true,  sms: false },
    driverAssigned:   { email: true,  sms: true  },
    pickedUp:         { email: false, sms: true  },
    outForDelivery:   { email: true,  sms: true  },
    delivered:        { email: true,  sms: true  },
    failed:           { email: true,  sms: true  },
    driverOnline:     { email: false, sms: false },
    weeklyReport:     { email: true,  sms: false },
  });

  const setNotif = (key: keyof typeof notifs, channel: "email" | "sms", val: boolean) => {
    setNotifs((prev) => ({ ...prev, [key]: { ...prev[key], [channel]: val } }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const ROWS: { key: keyof typeof notifs; label: string; description: string }[] = [
    { key: "shipmentCreated",  label: "Shipment created",   description: "When a new shipment is created in your account"      },
    { key: "driverAssigned",   label: "Driver assigned",    description: "When a driver accepts or is assigned to a shipment"  },
    { key: "pickedUp",         label: "Package picked up",  description: "When the driver picks up the package"                },
    { key: "outForDelivery",   label: "Out for delivery",   description: "When the shipment is out for final delivery"         },
    { key: "delivered",        label: "Delivered",          description: "When a shipment is successfully delivered"           },
    { key: "failed",           label: "Delivery failed",    description: "When a delivery attempt fails or is cancelled"       },
    { key: "driverOnline",     label: "Driver came online", description: "When a driver in your fleet goes active"             },
    { key: "weeklyReport",     label: "Weekly report",      description: "A weekly summary of your fleet performance"          },
  ];

  return (
    <div className="space-y-5">
      <SectionCard
        title="Notification Preferences"
        description="Choose how you want to be notified for each event"
      >
        {/* Channel headers */}
        <div className="flex items-center justify-end gap-6 pb-3 border-b border-white/[0.05] mb-1">
          <div className="flex items-center gap-1.5">
            <Mail className="h-3 w-3 text-zinc-600" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Email</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-zinc-600" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">SMS</span>
          </div>
        </div>
        {ROWS.map(({ key, label, description }) => (
          <NotifRow
            key={key}
            label={label}
            description={description}
            email={notifs[key].email}
            sms={notifs[key].sms}
            onEmail={(v) => setNotif(key, "email", v)}
            onSms={(v) => setNotif(key, "sms", v)}
          />
        ))}
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton saved={saved} onClick={handleSave} />
      </div>
    </div>
  );
}

// ─── Tab: Security ────────────────────────────────────────────────────────────

function SecurityTab() {
  const router        = useRouter();
  const logout        = useAuthStore((s) => s.logout);
  const changePassword = useChangePassword();
  const deleteAccount  = useDeleteAccount();

  const [current, setCurrent]   = useState("");
  const [newPw, setNewPw]       = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]   = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError]     = useState("");

  const handleSave = async () => {
    if (!current) { setError("Please enter your current password."); return; }
    if (newPw.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (!/[A-Z]/.test(newPw)) { setError("New password must contain at least one uppercase letter."); return; }
    if (!/[0-9]/.test(newPw)) { setError("New password must contain at least one number."); return; }
    if (newPw !== confirm) { setError("Passwords do not match."); return; }
    setError("");
    try {
      await changePassword.mutateAsync({ currentPassword: current, newPassword: newPw });
      setSaved(true);
      setCurrent(""); setNewPw(""); setConfirm("");
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Failed to change password. Please try again."));
    }
  };

  return (
    <div className="space-y-5">
      {/* Change password */}
      <SectionCard title="Change Password" description="Use a strong password of at least 8 characters">
        <div className="space-y-4 max-w-md">
          <div>
            <FieldLabel>Current password</FieldLabel>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Enter current password"
                className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] pl-3.5 pr-10 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/[0.12] transition-all"
              />
              <button
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                {showCurrent ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div>
            <FieldLabel>New password</FieldLabel>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] pl-3.5 pr-10 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/[0.12] transition-all"
              />
              <button
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                {showNew ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {/* Strength indicator */}
            {newPw.length > 0 && (
              <div className="mt-2 flex items-center gap-1.5">
                {[1, 2, 3, 4].map((lvl) => {
                  const strength = newPw.length >= 12 ? 4 : newPw.length >= 10 ? 3 : newPw.length >= 8 ? 2 : 1;
                  return (
                    <div
                      key={lvl}
                      className={cn(
                        "flex-1 h-1 rounded-full transition-all",
                        lvl <= strength
                          ? strength >= 4 ? "bg-emerald-400" : strength >= 3 ? "bg-sky-400" : strength >= 2 ? "bg-amber-400" : "bg-rose-400"
                          : "bg-white/[0.07]",
                      )}
                    />
                  );
                })}
                <span className="text-[10px] text-zinc-600 ml-1 whitespace-nowrap">
                  {newPw.length >= 12 ? "Strong" : newPw.length >= 10 ? "Good" : newPw.length >= 8 ? "Fair" : "Weak"}
                </span>
              </div>
            )}
          </div>
          <div>
            <FieldLabel>Confirm new password</FieldLabel>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat new password"
              className={cn(
                "w-full rounded-xl border py-2.5 pl-3.5 pr-3 text-sm text-zinc-200 bg-white/[0.03] placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-sky-500/[0.12] transition-all",
                confirm && newPw && confirm !== newPw
                  ? "border-rose-500/40"
                  : "border-white/[0.07] focus:border-sky-500/40",
              )}
            />
            {confirm && newPw && confirm !== newPw && (
              <p className="text-[10px] text-rose-400 mt-1">Passwords do not match</p>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-3 py-2.5">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-400">{error}</p>
            </div>
          )}
        </div>

        <div className="flex justify-start mt-5">
          <SaveButton saved={saved} onClick={handleSave} loading={changePassword.isPending} />
        </div>
      </SectionCard>

      {/* 2FA */}
      <SectionCard title="Two-Factor Authentication" description="Add an extra layer of security to your account">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-200">Authenticator app</p>
            <p className="text-xs text-zinc-600 mt-0.5">
              Use an app like Google Authenticator or Authy to generate one-time codes.
            </p>
          </div>
          <div className="shrink-0">
            <button className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:border-white/[0.15] transition-all">
              Set up
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Active sessions */}
      <SectionCard title="Active Sessions" description="Devices currently signed into your account">
        {[
          { device: "Chrome on macOS", location: "Lagos, Nigeria", current: true,  time: "Active now"   },
          { device: "Mobile Safari · iPhone", location: "Lagos, Nigeria", current: false, time: "2h ago" },
        ].map(({ device, location, current, time }) => (
          <div key={device} className="flex items-center justify-between gap-3 py-3 border-b border-white/[0.04] last:border-b-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn(
                "h-2 w-2 rounded-full shrink-0",
                current ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : "bg-zinc-600",
              )} />
              <div className="min-w-0">
                <p className="text-xs font-medium text-zinc-200 truncate">{device}</p>
                <p className="text-[10px] text-zinc-600">{location} · {time}</p>
              </div>
            </div>
            {!current && (
              <button className="shrink-0 text-[11px] text-rose-400 hover:text-rose-300 transition-colors font-medium">
                Revoke
              </button>
            )}
            {current && (
              <span className="shrink-0 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 rounded-full px-2 py-0.5">
                This device
              </span>
            )}
          </div>
        ))}
      </SectionCard>

      {/* Danger zone */}
      <div className="rounded-2xl border border-rose-500/[0.15] bg-rose-500/[0.03] overflow-hidden">
        <div className="px-5 py-4 border-b border-rose-500/[0.1]">
          <p className="text-sm font-semibold text-rose-400">Danger Zone</p>
          <p className="text-xs text-zinc-600 mt-0.5">These actions are permanent and cannot be undone</p>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-zinc-300">Delete account</p>
              <p className="text-xs text-zinc-600 mt-0.5">
                Permanently delete your account, all shipments, drivers, and data.
              </p>
            </div>
            {!confirmDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/25 bg-rose-500/[0.08] px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/[0.14] hover:border-rose-500/40 transition-all shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            )}
          </div>
          {confirmDelete && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.05] p-3.5 space-y-3">
              <p className="text-xs text-rose-300 font-medium">
                Are you sure? This will permanently delete your account and all associated data. This cannot be undone.
              </p>
              {deleteError && <p className="text-xs text-rose-400">{deleteError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => { setConfirmDelete(false); setDeleteError(""); }}
                  className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={deleteAccount.isPending}
                  onClick={async () => {
                    setDeleteError("");
                    try {
                      await deleteAccount.mutateAsync();
                      await logout();
                      router.push("/login");
                    } catch (err: unknown) {
                      setDeleteError(extractErrorMessage(err, "Failed to delete account. Please try again."));
                    }
                  }}
                  className="flex-1 rounded-xl border border-rose-500/40 bg-rose-500/[0.12] px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/[0.2] transition-all disabled:opacity-50"
                >
                  {deleteAccount.isPending ? "Deleting…" : "Yes, delete my account"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Preferences ─────────────────────────────────────────────────────────

function PreferencesTab() {
  const [timezone, setTimezone]   = useState("Africa/Lagos");
  const [currency, setCurrency]   = useState("NGN");
  const [language, setLanguage]   = useState("en");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [compactView, setCompactView] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [saved, setSaved]         = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const selectClass = "w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/[0.12] transition-all appearance-none cursor-pointer";

  return (
    <div className="space-y-5">
      <SectionCard title="Regional Settings">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Timezone</FieldLabel>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 pointer-events-none" />
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={selectClass} style={{ paddingLeft: "2.25rem" }}>
                <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
                <option value="Africa/Accra">Africa/Accra (GMT, UTC+0)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="America/New_York">America/New_York (EST/EDT)</option>
              </select>
            </div>
          </div>
          <div>
            <FieldLabel>Currency</FieldLabel>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={selectClass}>
              <option value="NGN">Nigerian Naira (₦)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="GBP">British Pound (£)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>
          <div>
            <FieldLabel>Language</FieldLabel>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 pointer-events-none" />
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className={selectClass} style={{ paddingLeft: "2.25rem" }}>
                <option value="en">English</option>
                <option value="yo">Yoruba</option>
                <option value="ig">Igbo</option>
                <option value="ha">Hausa</option>
              </select>
            </div>
          </div>
          <div>
            <FieldLabel>Date format</FieldLabel>
            <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className={selectClass}>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Display Preferences">
        <div className="space-y-1">
          {[
            {
              label: "Compact table view",
              description: "Show more rows with reduced padding in tables",
              value: compactView,
              onChange: setCompactView,
            },
            {
              label: "Auto-refresh dashboard",
              description: "Automatically refresh data every 30 seconds",
              value: autoRefresh,
              onChange: setAutoRefresh,
            },
          ].map(({ label, description, value, onChange }) => (
            <div key={label} className="flex items-center justify-between gap-4 py-3.5 border-b border-white/[0.04] last:border-b-0">
              <div>
                <p className="text-sm font-medium text-zinc-200">{label}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{description}</p>
              </div>
              <Toggle value={value} onChange={onChange} />
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton saved={saved} onClick={handleSave} />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Settings</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Manage your account, notifications, and preferences
        </p>
      </div>

      {/* ── Tab nav ── */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-white/[0.05] pb-0 -mb-px">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
                active
                  ? "border-sky-400 text-sky-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-200 hover:border-white/[0.15]",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      <div>
        {activeTab === "profile"       && <ProfileTab />}
        {activeTab === "notifications" && <NotificationsTab />}
        {activeTab === "security"      && <SecurityTab />}
        {activeTab === "preferences"   && <PreferencesTab />}
      </div>
    </div>
  );
}
