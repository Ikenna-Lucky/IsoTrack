"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Bike,
  Check,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  Save,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import {
  useDeleteAccount,
  useDriverProfile,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useUpdateVehicle,
} from "@/hooks/use-driver";
import { useChangePassword, useUpdateProfile } from "@/hooks/use-user";
import { useAuthStore } from "@/store/auth";
import { extractErrorMessage } from "@/lib/errors";
import type { NotificationPreferences, VehicleType } from "@/types";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "profile", label: "Profile", icon: User },
  { key: "vehicle", label: "Vehicle", icon: Bike },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Security", icon: Shield },
] as const;

type Tab = (typeof TABS)[number]["key"];

const DEFAULT_NOTIF_PREFS: NotificationPreferences = {
  newDelivery: { push: true, email: true },
  pickupReminder: { push: true, email: false },
  deliveryComplete: { push: true, email: true },
  deliveryFailed: { push: true, email: true },
  customerMessage: { push: true, email: false },
  ratingReceived: { push: true, email: false },
  payoutProcessed: { push: true, email: true },
  weeklyReport: { push: false, email: true },
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-black text-stone-400">{children}</label>;
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
  onChange?: (value: string) => void;
  placeholder?: string | undefined;
  type?: string | undefined;
  icon?: React.ElementType | undefined;
  disabled?: boolean | undefined;
  suffix?: React.ReactNode | undefined;
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
          "w-full rounded-md border border-white/[0.08] bg-black/25 py-3 pr-3 text-sm font-bold text-stone-100 outline-none transition placeholder:text-stone-700 focus:border-teal-400/40 focus:ring-2 focus:ring-teal-400/10",
          Icon ? "pl-10" : "pl-3",
          suffix && "pr-11",
          disabled && "cursor-not-allowed opacity-55",
        )}
      />
      {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
    </div>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border border-white/[0.08] bg-black/25 px-3 py-3 text-sm font-bold text-stone-100 outline-none focus:border-teal-400/40">
      {children}
    </select>
  );
}

function Panel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string | undefined;
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

function SaveButton({ saved, loading, onClick }: { saved: boolean; loading?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={loading} className={cn("flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-black transition disabled:opacity-60", saved ? "border border-emerald-400/25 bg-emerald-400/10 text-emerald-100" : "bg-amber-300 text-black hover:bg-amber-200")}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
      {loading ? "Saving..." : saved ? "Saved" : "Save changes"}
    </button>
  );
}

function Notice({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  return <p className={cn("rounded-md border px-3 py-2 text-xs font-bold leading-5", tone === "error" ? "border-rose-400/20 bg-rose-400/10 text-rose-100" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-100")}>{children}</p>;
}

function Toggle({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className={cn("relative h-6 w-11 rounded-full border transition", value ? "border-teal-400/30 bg-teal-400/30" : "border-white/[0.08] bg-white/[0.04]")} aria-pressed={value}>
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-stone-100 transition", value ? "left-5" : "left-0.5")} />
    </button>
  );
}

function ProfileTab() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useUpdateProfile();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [emergency, setEmergency] = useState(user?.emergencyContact ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
    setEmergency(user?.emergencyContact ?? "");
  }, [user?.id, user?.name, user?.phone, user?.emergencyContact]);

  async function handleSave() {
    setError("");
    try {
      await updateProfile.mutateAsync({ name: name.trim(), phone: phone.trim(), emergencyContact: emergency.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Failed to save profile."));
    }
  }

  return (
    <Panel eyebrow="Identity" title="Driver profile" description="Keep contact details accurate for dispatch and emergency handling.">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Full name</FieldLabel>
          <Input value={name} onChange={setName} icon={User} />
        </div>
        <div>
          <FieldLabel>Email</FieldLabel>
          <Input value={user?.email ?? ""} disabled icon={Mail} />
        </div>
        <div>
          <FieldLabel>Phone</FieldLabel>
          <Input value={phone} onChange={setPhone} icon={Phone} />
        </div>
        <div>
          <FieldLabel>Emergency contact</FieldLabel>
          <Input value={emergency} onChange={setEmergency} icon={Phone} />
        </div>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex justify-end"><SaveButton saved={saved} loading={updateProfile.isPending} onClick={handleSave} /></div>
    </Panel>
  );
}

function VehicleTab() {
  const { data: driver } = useDriverProfile();
  const updateVehicle = useUpdateVehicle();
  const [vehicleType, setVehicleType] = useState<VehicleType>("bike");
  const [plate, setPlate] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [year, setYear] = useState("");
  const [insurance, setInsurance] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!driver) return;
    setVehicleType(driver.vehicleType);
    setPlate(driver.vehiclePlate ?? "");
    setModel(driver.vehicleModel ?? "");
    setColor(driver.vehicleColor ?? "");
    setYear(driver.vehicleYear ?? "");
    setInsurance(driver.vehicleInsurance ?? "");
  }, [driver]);

  async function handleSave() {
    setError("");
    try {
      await updateVehicle.mutateAsync({
        vehicleType,
        vehiclePlate: plate.trim(),
        vehicleModel: model.trim() || null,
        vehicleColor: color.trim() || null,
        vehicleYear: year.trim() || null,
        vehicleInsurance: insurance.trim() || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Failed to save vehicle."));
    }
  }

  return (
    <Panel eyebrow="Vehicle" title="Vehicle details" description="These details help dispatch match you with suitable deliveries.">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Vehicle type</FieldLabel>
          <Select value={vehicleType} onChange={(value) => setVehicleType(value as VehicleType)}>
            <option value="bike">Bike</option>
            <option value="car">Car</option>
            <option value="van">Van</option>
            <option value="truck">Truck</option>
          </Select>
        </div>
        <div>
          <FieldLabel>Plate number</FieldLabel>
          <Input value={plate} onChange={setPlate} />
        </div>
        <div>
          <FieldLabel>Model</FieldLabel>
          <Input value={model} onChange={setModel} />
        </div>
        <div>
          <FieldLabel>Color</FieldLabel>
          <Input value={color} onChange={setColor} />
        </div>
        <div>
          <FieldLabel>Year</FieldLabel>
          <Input value={year} onChange={setYear} />
        </div>
        <div>
          <FieldLabel>Insurance reference</FieldLabel>
          <Input value={insurance} onChange={setInsurance} icon={FileText} />
        </div>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex justify-end"><SaveButton saved={saved} loading={updateVehicle.isPending} onClick={handleSave} /></div>
    </Panel>
  );
}

function NotificationsTab() {
  const { data: serverPrefs } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIF_PREFS);
  const [saved, setSaved] = useState(false);
  const rows: Array<{ key: keyof NotificationPreferences; label: string }> = [
    { key: "newDelivery", label: "New delivery assigned" },
    { key: "pickupReminder", label: "Pickup reminder" },
    { key: "deliveryComplete", label: "Delivery confirmed" },
    { key: "deliveryFailed", label: "Delivery failed" },
    { key: "customerMessage", label: "Customer message" },
    { key: "ratingReceived", label: "Rating received" },
    { key: "payoutProcessed", label: "Payout processed" },
    { key: "weeklyReport", label: "Weekly report" },
  ];

  useEffect(() => {
    if (serverPrefs) setPrefs((previous) => ({ ...previous, ...serverPrefs }));
  }, [serverPrefs]);

  function setChannel(key: keyof NotificationPreferences, channel: "push" | "email", value: boolean) {
    setPrefs((previous) => ({ ...previous, [key]: { ...previous[key], [channel]: value } }));
  }

  async function handleSave() {
    await updatePrefs.mutateAsync(prefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <Panel eyebrow="Signals" title="Notification preferences" description="Choose how IsoTrack should alert you while you are on route.">
      <div className="divide-y divide-white/[0.07]">
        {rows.map(({ key, label }) => (
          <div key={key} className="grid gap-3 py-3 sm:grid-cols-[1fr,auto,auto] sm:items-center">
            <div>
              <p className="text-sm font-black text-stone-100">{label}</p>
              <p className="mt-0.5 text-xs text-stone-600">Driver event alert</p>
            </div>
            <label className="flex items-center gap-2 text-xs font-black text-stone-400">Push <Toggle value={prefs[key].push} onChange={(value) => setChannel(key, "push", value)} /></label>
            <label className="flex items-center gap-2 text-xs font-black text-stone-400">Email <Toggle value={prefs[key].email} onChange={(value) => setChannel(key, "email", value)} /></label>
          </div>
        ))}
      </div>
      <div className="flex justify-end"><SaveButton saved={saved} loading={updatePrefs.isPending} onClick={handleSave} /></div>
    </Panel>
  );
}

function PasswordButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="text-stone-600 transition hover:text-stone-200" aria-label={active ? "Hide password" : "Show password"}>{active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>;
}

function SecurityTab() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const changePassword = useChangePassword();
  const deleteAccount = useDeleteAccount();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handlePassword() {
    setError("");
    if (!current || !next || !confirm) return setError("Please fill in all password fields.");
    if (next.length < 8) return setError("New password must be at least 8 characters.");
    if (next !== confirm) return setError("Passwords do not match.");
    try {
      await changePassword.mutateAsync({ currentPassword: current, newPassword: next });
      setSaved(true);
      setTimeout(() => logout(), 1500);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Failed to change password."));
    }
  }

  async function handleDelete() {
    setDeleteError("");
    try {
      await deleteAccount.mutateAsync();
      await logout();
      router.push("/login");
    } catch (err: unknown) {
      setDeleteError(extractErrorMessage(err, "Failed to delete account."));
    }
  }

  return (
    <div className="space-y-4">
      <Panel eyebrow="Access" title="Change password" description="After a successful password change you will be signed out.">
        <div>
          <FieldLabel>Current password</FieldLabel>
          <Input type={showCurrent ? "text" : "password"} value={current} onChange={setCurrent} icon={LockKeyhole} suffix={<PasswordButton active={showCurrent} onClick={() => setShowCurrent((value) => !value)} />} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>New password</FieldLabel>
            <Input type={showNext ? "text" : "password"} value={next} onChange={setNext} icon={Shield} suffix={<PasswordButton active={showNext} onClick={() => setShowNext((value) => !value)} />} />
          </div>
          <div>
            <FieldLabel>Confirm password</FieldLabel>
            <Input type="password" value={confirm} onChange={setConfirm} icon={Shield} />
          </div>
        </div>
        {error && <Notice tone="error">{error}</Notice>}
        {saved && <Notice tone="success">Password changed. Signing you out...</Notice>}
        <div className="flex justify-end"><SaveButton saved={saved} loading={changePassword.isPending} onClick={handlePassword} /></div>
      </Panel>

      <Panel eyebrow="Danger zone" title="Delete account" description="This permanently removes your driver account and associated data.">
        {deleteOpen ? (
          <div className="space-y-3 rounded-md border border-rose-400/20 bg-rose-400/10 p-4">
            <p className="text-sm font-black text-rose-100">Confirm permanent deletion?</p>
            {deleteError && <Notice tone="error">{deleteError}</Notice>}
            <div className="grid gap-2 sm:grid-cols-2">
              <button onClick={handleDelete} disabled={deleteAccount.isPending} className="rounded-md bg-rose-300 px-4 py-2.5 text-sm font-black text-black transition hover:bg-rose-200 disabled:opacity-60">{deleteAccount.isPending ? "Deleting..." : "Delete account"}</button>
              <button onClick={() => setDeleteOpen(false)} className="rounded-md border border-white/[0.08] px-4 py-2.5 text-sm font-black text-stone-200 transition hover:bg-white/[0.06]">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setDeleteOpen(true)} className="inline-flex items-center gap-2 rounded-md border border-rose-400/20 bg-rose-400/10 px-4 py-2.5 text-sm font-black text-rose-100 transition hover:bg-rose-400/[0.16]">
            <Trash2 className="h-4 w-4" />
            Delete account
          </button>
        )}
      </Panel>
    </div>
  );
}

export default function DriverSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4 sm:p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-200">Driver control</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-50 sm:text-3xl">Settings</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">Manage personal details, vehicle records, route alerts, and account security.</p>
      </section>

      <div className="grid gap-2 rounded-md border border-white/[0.07] bg-white/[0.03] p-1 sm:grid-cols-4">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)} className={cn("flex items-center justify-center gap-2 rounded px-3 py-2.5 text-xs font-black transition", activeTab === key ? "bg-teal-400/10 text-teal-100 ring-1 ring-teal-400/25" : "text-stone-500 hover:text-stone-200")}>
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && <ProfileTab />}
      {activeTab === "vehicle" && <VehicleTab />}
      {activeTab === "notifications" && <NotificationsTab />}
      {activeTab === "security" && <SecurityTab />}
    </div>
  );
}
