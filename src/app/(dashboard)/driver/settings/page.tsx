"use client";

import { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Bike,
  Save,
  Camera,
  Eye,
  EyeOff,
  AlertTriangle,
  Check,
  Mail,
  Phone,
  UserCheck,
  FileText,
  Trash2,
  MapPin,
} from "lucide-react";
import { CURRENT_DRIVER } from "@/lib/mock/driver";
import { cn } from "@/lib/utils";

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { key: "profile",       label: "Profile",       icon: User      },
  { key: "vehicle",       label: "Vehicle",        icon: Bike      },
  { key: "notifications", label: "Notifications",  icon: Bell      },
  { key: "security",      label: "Security",       icon: Shield    },
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
  value, onChange, placeholder, type = "text", icon: Icon, disabled,
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
          "placeholder:text-zinc-700 focus:outline-none focus:border-teal-500/40 focus:ring-2 focus:ring-teal-500/[0.12]",
          "transition-all duration-200",
          Icon ? "pl-9" : "pl-3.5",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      />
    </div>
  );
}

function SectionCard({
  title, description, children,
}: {
  title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.05]">
        <p className="text-sm font-semibold text-white">{title}</p>
        {description && <p className="text-xs text-zinc-600 mt-0.5">{description}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function SaveButton({ saved, onClick }: { saved: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-4 py-2.5 sm:py-2 text-sm font-semibold transition-all duration-200",
        saved
          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
          : "bg-teal-500 text-white hover:bg-teal-400 shadow-lg shadow-teal-500/20 active:scale-[0.98]",
      )}
    >
      {saved ? (
        <><Check className="h-4 w-4" />Saved</>
      ) : (
        <><Save className="h-4 w-4" />Save changes</>
      )}
    </button>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-all duration-200",
        value ? "bg-teal-500 border-teal-400" : "bg-white/[0.06] border-white/[0.1]",
      )}
      role="switch"
      aria-checked={value}
    >
      <span className={cn(
        "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200",
        value ? "translate-x-4" : "translate-x-0.5",
      )} />
    </button>
  );
}

function NotifRow({
  label, description, push, email, onPush, onEmail,
}: {
  label: string; description: string;
  push: boolean; email: boolean;
  onPush: (v: boolean) => void; onEmail: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-white/[0.04] last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        <p className="text-[11px] text-zinc-600 mt-0.5">{description}</p>
      </div>
      <div className="flex items-center gap-6 shrink-0">
        <div className="flex flex-col items-center gap-1">
          <Toggle value={push}  onChange={onPush}  />
          <span className="text-[9px] text-zinc-600">Push</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Toggle value={email} onChange={onEmail} />
          <span className="text-[9px] text-zinc-600">Email</span>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Profile ─────────────────────────────────────────────────────────────

function ProfileTab() {
  const [name,      setName]      = useState(CURRENT_DRIVER.name);
  const [email,     setEmail]     = useState(CURRENT_DRIVER.email);
  const [phone,     setPhone]     = useState(CURRENT_DRIVER.phone);
  const [emergency, setEmergency] = useState("+234 802 555 7890");
  const [city,      setCity]      = useState("Lagos");
  const [saved,     setSaved]     = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="space-y-5">
      {/* Avatar */}
      <SectionCard title="Profile Photo" description="Shown to customers during deliveries">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/25 to-emerald-500/25 border border-teal-500/20 text-xl font-bold text-teal-300 uppercase">
              {CURRENT_DRIVER.avatar}
            </div>
            <button className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.1] bg-[#16161d] text-zinc-400 hover:text-white transition-colors shadow-lg">
              <Camera className="h-3 w-3" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-200">{name}</p>
            <p className="text-xs text-zinc-600 mt-0.5">
              ★ {CURRENT_DRIVER.rating} · {CURRENT_DRIVER.totalDeliveries} total trips
            </p>
            <button className="mt-2 text-[11px] font-medium text-teal-400 hover:text-teal-300 transition-colors">
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
          <div>
            <FieldLabel>Emergency contact</FieldLabel>
            <Input value={emergency} onChange={setEmergency} placeholder="+234 800 000 0000" icon={UserCheck} />
          </div>
          <div>
            <FieldLabel>City of operation</FieldLabel>
            <Input value={city} onChange={setCity} placeholder="City" icon={MapPin} />
          </div>
          <div>
            <FieldLabel>Member since</FieldLabel>
            <Input
              value={new Date(CURRENT_DRIVER.joinedAt).toLocaleDateString("en-NG", {
                day: "numeric", month: "long", year: "numeric",
              })}
              disabled
            />
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end pt-1">
        <SaveButton saved={saved} onClick={handleSave} />
      </div>
    </div>
  );
}

// ─── Tab: Vehicle ─────────────────────────────────────────────────────────────

function VehicleTab() {
  const [vehicleType,  setVehicleType]  = useState(CURRENT_DRIVER.vehicleType);
  const [plate,        setPlate]        = useState(CURRENT_DRIVER.vehiclePlate);
  const [model,        setModel]        = useState("Honda CB300");
  const [color,        setColor]        = useState("Red");
  const [year,         setYear]         = useState("2021");
  const [insurance,    setInsurance]    = useState("NSR-2024-0041-88");
  const [saved,        setSaved]        = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const selectClass = "w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-teal-500/40 focus:ring-2 focus:ring-teal-500/[0.12] transition-all appearance-none cursor-pointer";

  return (
    <div className="space-y-5">
      <SectionCard title="Vehicle Details" description="Keep your vehicle information up to date">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Vehicle type</FieldLabel>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value as typeof CURRENT_DRIVER.vehicleType)}
              className={selectClass}
            >
              <option value="Motorcycle">Motorcycle</option>
              <option value="Bicycle">Bicycle</option>
              <option value="Car">Car</option>
              <option value="Van">Van</option>
            </select>
          </div>
          <div>
            <FieldLabel>Plate number</FieldLabel>
            <Input value={plate} onChange={setPlate} placeholder="LAG-000-AB" icon={Bike} />
          </div>
          <div>
            <FieldLabel>Model</FieldLabel>
            <Input value={model} onChange={setModel} placeholder="e.g. Honda CB300" />
          </div>
          <div>
            <FieldLabel>Color</FieldLabel>
            <Input value={color} onChange={setColor} placeholder="e.g. Red" />
          </div>
          <div>
            <FieldLabel>Year</FieldLabel>
            <Input value={year} onChange={setYear} placeholder="e.g. 2021" />
          </div>
          <div>
            <FieldLabel>Insurance policy no.</FieldLabel>
            <Input value={insurance} onChange={setInsurance} placeholder="Policy number" icon={FileText} />
          </div>
        </div>
      </SectionCard>

      {/* Document upload placeholders */}
      <SectionCard title="Documents" description="Upload your licence, insurance, and road-worthiness certificate">
        <div className="space-y-3">
          {[
            { label: "Driver's Licence",             status: "Verified",   color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
            { label: "Vehicle Insurance Certificate", status: "Verified",   color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
            { label: "Road Worthiness Certificate",   status: "Expires soon", color: "text-amber-400 bg-amber-500/10 border-amber-500/20"    },
          ].map(({ label, status, color }) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-4 w-4 shrink-0 text-zinc-600" />
                <p className="text-sm text-zinc-300 truncate">{label}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", color)}>
                  {status}
                </span>
                <button className="text-[11px] font-medium text-teal-400 hover:text-teal-300 transition-colors">
                  Update
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="flex justify-end pt-1">
        <SaveButton saved={saved} onClick={handleSave} />
      </div>
    </div>
  );
}

// ─── Tab: Notifications ───────────────────────────────────────────────────────

function NotificationsTab() {
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState({
    newDelivery:      { push: true,  email: true  },
    pickupReminder:   { push: true,  email: false },
    deliveryComplete: { push: true,  email: true  },
    deliveryFailed:   { push: true,  email: true  },
    customerMessage:  { push: true,  email: false },
    ratingReceived:   { push: true,  email: false },
    payoutProcessed:  { push: true,  email: true  },
    weeklyReport:     { push: false, email: true  },
  });

  const set = (key: keyof typeof notifs, ch: "push" | "email", val: boolean) =>
    setNotifs((p) => ({ ...p, [key]: { ...p[key], [ch]: val } }));

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const ROWS: { key: keyof typeof notifs; label: string; description: string }[] = [
    { key: "newDelivery",      label: "New delivery assigned",  description: "When a new package is assigned to you"              },
    { key: "pickupReminder",   label: "Pickup reminder",        description: "Reminder 5 minutes before pickup window"            },
    { key: "deliveryComplete", label: "Delivery confirmed",     description: "When a customer confirms receipt"                   },
    { key: "deliveryFailed",   label: "Delivery failed",        description: "When a delivery attempt is marked as failed"        },
    { key: "customerMessage",  label: "Customer message",       description: "When a customer sends you an in-app message"        },
    { key: "ratingReceived",   label: "New rating",             description: "When a customer rates your delivery"                },
    { key: "payoutProcessed",  label: "Payout processed",       description: "When your weekly payout is sent to your account"   },
    { key: "weeklyReport",     label: "Weekly summary",         description: "A weekly digest of your deliveries and earnings"    },
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
            <Bell className="h-3 w-3 text-zinc-600" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Push</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="h-3 w-3 text-zinc-600" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Email</span>
          </div>
        </div>
        {ROWS.map(({ key, label, description }) => (
          <NotifRow
            key={key}
            label={label}
            description={description}
            push={notifs[key].push}
            email={notifs[key].email}
            onPush={(v) => set(key, "push", v)}
            onEmail={(v) => set(key, "email", v)}
          />
        ))}
      </SectionCard>
      <div className="flex justify-end pt-1">
        <SaveButton saved={saved} onClick={handleSave} />
      </div>
    </div>
  );
}

// ─── Tab: Security ────────────────────────────────────────────────────────────

function SecurityTab() {
  const [current,     setCurrent]     = useState("");
  const [newPw,       setNewPw]       = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState("");

  const handleSave = () => {
    if (!current)           { setError("Please enter your current password."); return; }
    if (newPw.length < 8)   { setError("New password must be at least 8 characters."); return; }
    if (newPw !== confirm)  { setError("Passwords do not match."); return; }
    setError(""); setSaved(true);
    setCurrent(""); setNewPw(""); setConfirm("");
    setTimeout(() => setSaved(false), 2500);
  };

  const strength = newPw.length >= 12 ? 4 : newPw.length >= 10 ? 3 : newPw.length >= 8 ? 2 : newPw.length > 0 ? 1 : 0;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength] ?? "";
  const strengthColor = ["", "bg-rose-400", "bg-amber-400", "bg-sky-400", "bg-emerald-400"][strength] ?? "bg-zinc-700";

  const inputClass = "w-full rounded-xl border border-white/[0.07] bg-white/[0.03] pl-3.5 pr-10 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-teal-500/40 focus:ring-2 focus:ring-teal-500/[0.12] transition-all";

  return (
    <div className="space-y-5">
      {/* Change password */}
      <SectionCard title="Change Password" description="Use a strong password of at least 8 characters">
        <div className="space-y-4 max-w-md">
          {/* Current */}
          <div>
            <FieldLabel>Current password</FieldLabel>
            <div className="relative">
              <input type={showCurrent ? "text" : "password"} value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Enter current password" className={inputClass} />
              <button onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors">
                {showCurrent ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          {/* New */}
          <div>
            <FieldLabel>New password</FieldLabel>
            <div className="relative">
              <input type={showNew ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="At least 8 characters" className={inputClass} />
              <button onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors">
                {showNew ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {newPw.length > 0 && (
              <div className="mt-2 flex items-center gap-1.5">
                {[1, 2, 3, 4].map((lvl) => (
                  <div key={lvl} className={cn("flex-1 h-1 rounded-full transition-all", lvl <= strength ? strengthColor : "bg-white/[0.07]")} />
                ))}
                <span className="text-[10px] text-zinc-600 ml-1 whitespace-nowrap">{strengthLabel}</span>
              </div>
            )}
          </div>
          {/* Confirm */}
          <div>
            <FieldLabel>Confirm new password</FieldLabel>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat new password"
              className={cn(
                "w-full rounded-xl border py-2.5 pl-3.5 pr-3 text-sm text-zinc-200 bg-white/[0.03] placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-teal-500/[0.12] transition-all",
                confirm && newPw && confirm !== newPw ? "border-rose-500/40" : "border-white/[0.07] focus:border-teal-500/40",
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
          <SaveButton saved={saved} onClick={handleSave} />
        </div>
      </SectionCard>

      {/* 2FA */}
      <SectionCard title="Two-Factor Authentication" description="Add an extra layer of security to your account">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-200">Authenticator app</p>
            <p className="text-xs text-zinc-600 mt-0.5">Use Google Authenticator or Authy to generate one-time codes.</p>
          </div>
          <button className="shrink-0 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:border-white/[0.15] transition-all">
            Set up
          </button>
        </div>
      </SectionCard>

      {/* Active sessions */}
      <SectionCard title="Active Sessions" description="Devices currently signed into your account">
        {[
          { device: "IsoTrack Driver App · Android", location: "Lagos, Nigeria", current: true,  time: "Active now" },
          { device: "Chrome on macOS",               location: "Lagos, Nigeria", current: false, time: "3h ago"     },
        ].map(({ device, location, current, time }) => (
          <div key={device} className="flex items-center justify-between gap-3 py-3 border-b border-white/[0.04] last:border-b-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn("h-2 w-2 rounded-full shrink-0", current ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : "bg-zinc-600")} />
              <div className="min-w-0">
                <p className="text-xs font-medium text-zinc-200 truncate">{device}</p>
                <p className="text-[10px] text-zinc-600">{location} · {time}</p>
              </div>
            </div>
            {!current && (
              <button className="shrink-0 text-[11px] text-rose-400 hover:text-rose-300 transition-colors font-medium">Revoke</button>
            )}
            {current && (
              <span className="shrink-0 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 rounded-full px-2 py-0.5">This device</span>
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
        <div className="p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-300">Delete account</p>
            <p className="text-xs text-zinc-600 mt-0.5">Permanently delete your driver account and all associated data.</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-xl border border-rose-500/25 bg-rose-500/[0.08] px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/[0.14] hover:border-rose-500/40 transition-all shrink-0">
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DriverSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Settings</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Manage your profile, vehicle, notifications, and account security
        </p>
      </div>

      {/* Tab nav */}
      <div className="flex items-center gap-0 overflow-x-auto scrollbar-none border-b border-white/[0.05]">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 px-3 sm:px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all whitespace-nowrap",
                active
                  ? "border-teal-400 text-teal-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-200 hover:border-white/[0.15]",
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "profile"       && <ProfileTab />}
        {activeTab === "vehicle"       && <VehicleTab />}
        {activeTab === "notifications" && <NotificationsTab />}
        {activeTab === "security"      && <SecurityTab />}
      </div>

    </div>
  );
}
