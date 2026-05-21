"use client";

import { useState, useRef, useEffect } from "react";
import {
  User, Bell, Shield, Settings2, Save, Camera, Eye, EyeOff,
  AlertTriangle, Check, Loader2, Mail, Phone, Building2, MapPin,
  Globe, Clock, Trash2, X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useChangePassword, useUpdateProfile } from "@/hooks/use-user";
import {
  useUpdateBusinessProfile, useBusinessProfile,
  useBusinessNotifPrefs, useUpdateBusinessNotifPrefs,
  useBusinessPreferences, useUpdateBusinessPreferences,
  type BusinessNotifPrefs,
} from "@/hooks/use-business";
import { useDeleteAccount } from "@/hooks/use-driver";
import { cn } from "@/lib/utils";
import { extractErrorMessage } from "@/lib/errors";

const TABS = [
  { key: "profile",       label: "Profile",       icon: User      },
  { key: "notifications", label: "Notifications",  icon: Bell      },
  { key: "security",      label: "Security",       icon: Shield    },
  { key: "preferences",   label: "Preferences",    icon: Settings2 },
] as const;
type Tab = (typeof TABS)[number]["key"];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-zinc-400 mb-1.5">{children}</label>;
}

function TextInput({ value, onChange, placeholder, type = "text", icon: Icon, disabled }: {
  value: string; onChange?: (v: string) => void; placeholder?: string | undefined;
  type?: string | undefined; icon?: React.ElementType | undefined; disabled?: boolean | undefined;
}) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 pointer-events-none" />}
      <input
        type={type} value={value} onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        className={cn(
          "w-full rounded-xl border border-white/[0.07] bg-white/[0.03] py-2.5 pr-3 text-sm text-zinc-200",
          "placeholder:text-zinc-700 focus:outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/[0.12] transition-all",
          Icon ? "pl-9" : "pl-3.5",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      />
    </div>
  );
}

function SectionCard({ title, description, children }: { title: string; description?: string | undefined; children: React.ReactNode }) {
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

function SaveButton({ saved, onClick, loading }: { saved: boolean; onClick: () => void; loading?: boolean }) {
  return (
    <button onClick={onClick} disabled={loading} className={cn(
      "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none",
      saved ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
            : "bg-sky-500 text-white hover:bg-sky-400 shadow-lg shadow-sky-500/20 active:scale-[0.98]",
    )}>
      {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
               : saved  ? <><Check className="h-4 w-4" />Saved</>
                        : <><Save className="h-4 w-4" />Save changes</>}
    </button>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} role="switch" aria-checked={value}
      className={cn("relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-all duration-200",
        value ? "bg-sky-500 border-sky-400" : "bg-white/[0.06] border-white/[0.1]")}>
      <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200",
        value ? "translate-x-4" : "translate-x-0.5")} />
    </button>
  );
}

function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-3 py-2.5">
      <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
      <p className="text-xs text-rose-400">{message}</p>
    </div>
  );
}

function compressImage(file: File, maxPx = 300, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.onload = () => {
        const scale  = Math.min(1, maxPx / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas not supported")); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Profile Tab
function ProfileTab() {
  const user   = useAuthStore((s) => s.user);
  const { data: biz, isLoading: bizLoading } = useBusinessProfile();
  const updateProfile  = useUpdateProfile();
  const updateBusiness = useUpdateBusinessProfile();

  const [name,  setName]  = useState(user?.name  ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [bizName, setBizName] = useState("");
  const [street,  setStreet]  = useState("");
  const [city,    setCity]    = useState("");
  const [state,   setState]   = useState("");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar ?? null);
  const [avatarFile,    setAvatarFile]    = useState<string | null>(null);
  const [avatarError,   setAvatarError]   = useState("");
  const [avatarSaving,  setAvatarSaving]  = useState(false);
  const [avatarSaved,   setAvatarSaved]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [personalSaved,  setPersonalSaved]  = useState(false);
  const [personalError,  setPersonalError]  = useState("");
  const [businessSaved,  setBusinessSaved]  = useState(false);
  const [businessError,  setBusinessError]  = useState("");

  useEffect(() => {
    if (!biz) return;
    setBizName(biz.businessName ?? "");
    setStreet(biz.address?.street ?? "");
    setCity(biz.address?.city    ?? "");
    setState(biz.address?.state  ?? "");
  }, [biz]);

  // Keep avatar preview in sync if auth store changes (e.g. another tab)
  useEffect(() => {
    if (!avatarFile) setAvatarPreview(user?.avatar ?? null);
  }, [user?.avatar, avatarFile]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError("");
    if (!file.type.startsWith("image/")) { setAvatarError("Please select an image file (JPG, PNG, WebP)."); return; }
    if (file.size > 10 * 1024 * 1024)   { setAvatarError("Image must be under 10 MB."); return; }
    try {
      const compressed = await compressImage(file);
      setAvatarPreview(compressed);
      setAvatarFile(compressed);
      setAvatarSaved(false);
    } catch { setAvatarError("Failed to process the image. Please try another file."); }
  }

  async function handleSaveAvatar() {
    if (!avatarFile) return;
    setAvatarError(""); setAvatarSaving(true);
    try {
      await updateProfile.mutateAsync({ avatar: avatarFile });
      setAvatarFile(null);
      setAvatarSaved(true);
      setTimeout(() => setAvatarSaved(false), 2500);
    } catch (err) {
      setAvatarError(extractErrorMessage(err, "Failed to save photo."));
    } finally { setAvatarSaving(false); }
  }

  async function handleSavePersonal() {
    setPersonalError("");
    try {
      await updateProfile.mutateAsync({ name: name.trim(), phone: phone.trim() || null });
      setPersonalSaved(true);
      setTimeout(() => setPersonalSaved(false), 2500);
    } catch (err) { setPersonalError(extractErrorMessage(err, "Failed to save personal info.")); }
  }

  async function handleSaveBusiness() {
    setBusinessError("");
    try {
      await updateBusiness.mutateAsync({
        businessName: bizName.trim(),
        ...(street.trim() ? { address: { street: street.trim(), city: city.trim(), state: state.trim() } } : {}),
      });
      setBusinessSaved(true);
      setTimeout(() => setBusinessSaved(false), 2500);
    } catch (err) { setBusinessError(extractErrorMessage(err, "Failed to save business info.")); }
  }

  const initials = (name || user?.name || "BU").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-5">
      <SectionCard title="Profile Photo" description="Shown across your dashboard and shipment communications">
        <div className="flex items-start gap-5">
          <div className="relative shrink-0">
            {avatarPreview
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={avatarPreview} alt="Profile" className="h-16 w-16 rounded-2xl object-cover border border-white/[0.08]" />
              : <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/25 to-teal-500/25 border border-sky-500/20 text-xl font-bold text-sky-300 uppercase select-none">{initials}</div>
            }
            <button onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.12] bg-[#16161d] text-zinc-400 hover:text-white transition-colors shadow-lg">
              <Camera className="h-3 w-3" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-200 truncate">{user?.name || "Business User"}</p>
            <p className="text-xs text-zinc-600 mt-0.5 truncate">{user?.email}</p>
            {avatarError && <p className="mt-2 text-[11px] text-rose-400">{avatarError}</p>}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <button onClick={() => fileInputRef.current?.click()} className="text-[11px] font-medium text-sky-400 hover:text-sky-300 transition-colors">
                {avatarPreview ? "Change photo" : "Upload photo"}
              </button>
              {avatarPreview && (
                <><span className="text-zinc-700 text-[11px]">·</span>
                <button onClick={() => { setAvatarPreview(null); setAvatarFile(null); setAvatarSaved(false); }}
                  className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
                  <X className="h-2.5 w-2.5" />Remove
                </button></>
              )}
              {avatarFile && (
                <><span className="text-zinc-700 text-[11px]">·</span>
                <button onClick={handleSaveAvatar} disabled={avatarSaving}
                  className={cn("flex items-center gap-1 text-[11px] font-semibold transition-colors",
                    avatarSaved ? "text-emerald-400" : "text-teal-400 hover:text-teal-300",
                    avatarSaving && "opacity-60 cursor-not-allowed")}>
                  {avatarSaving ? <><Loader2 className="h-2.5 w-2.5 animate-spin" />Saving...</>
                  : avatarSaved  ? <><Check className="h-2.5 w-2.5" />Saved</>
                                 : <><Save className="h-2.5 w-2.5" />Save photo</>}
                </button></>
              )}
            </div>
            <p className="mt-1.5 text-[10px] text-zinc-700">JPG, PNG or WebP · Max 10 MB · Resized to 300px</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Personal Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><FieldLabel>Full name</FieldLabel><TextInput value={name} onChange={setName} placeholder="Your full name" icon={User} /></div>
          <div><FieldLabel>Email address</FieldLabel><TextInput value={user?.email ?? ""} disabled placeholder="you@example.com" icon={Mail} type="email" /></div>
          <div><FieldLabel>Phone number</FieldLabel><TextInput value={phone} onChange={setPhone} placeholder="+234 800 000 0000" icon={Phone} /></div>
        </div>
        {personalError && <div className="mt-3"><ErrorBanner message={personalError} /></div>}
        <div className="flex justify-end mt-4">
          <SaveButton saved={personalSaved} loading={updateProfile.isPending} onClick={handleSavePersonal} />
        </div>
      </SectionCard>

      <SectionCard title="Business Information">
        {bizLoading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-zinc-600" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><FieldLabel>Business name</FieldLabel><TextInput value={bizName} onChange={setBizName} placeholder="Your company name" icon={Building2} /></div>
              <div className="sm:col-span-2"><FieldLabel>Street address</FieldLabel><TextInput value={street} onChange={setStreet} placeholder="e.g. 14 Admiralty Way" icon={MapPin} /></div>
              <div><FieldLabel>City</FieldLabel><TextInput value={city} onChange={setCity} placeholder="Lagos" /></div>
              <div><FieldLabel>State</FieldLabel><TextInput value={state} onChange={setState} placeholder="Lagos State" /></div>
              <div><FieldLabel>Country</FieldLabel><TextInput value="Nigeria" disabled icon={Globe} /></div>
            </div>
            {businessError && <div className="mt-3"><ErrorBanner message={businessError} /></div>}
            <div className="flex justify-end mt-4">
              <SaveButton saved={businessSaved} loading={updateBusiness.isPending} onClick={handleSaveBusiness} />
            </div>
          </>
        )}
      </SectionCard>
    </div>
  );
}

// Notifications Tab — real API
const NOTIF_DEFAULT: BusinessNotifPrefs = {
  shipmentCreated: { email: true,  sms: false },
  driverAssigned:  { email: true,  sms: true  },
  pickedUp:        { email: false, sms: true  },
  outForDelivery:  { email: true,  sms: true  },
  delivered:       { email: true,  sms: true  },
  failed:          { email: true,  sms: true  },
  driverOnline:    { email: false, sms: false },
  weeklyReport:    { email: true,  sms: false },
};

const NOTIF_ROWS: { key: keyof BusinessNotifPrefs; label: string; description: string }[] = [
  { key: "shipmentCreated", label: "Shipment created",   description: "When a new shipment is created in your account"     },
  { key: "driverAssigned",  label: "Driver assigned",    description: "When a driver accepts or is assigned to a shipment" },
  { key: "pickedUp",        label: "Package picked up",  description: "When the driver picks up the package"               },
  { key: "outForDelivery",  label: "Out for delivery",   description: "When the shipment is out for final delivery"        },
  { key: "delivered",       label: "Delivered",          description: "When a shipment is successfully delivered"          },
  { key: "failed",          label: "Delivery failed",    description: "When a delivery attempt fails or is cancelled"      },
  { key: "driverOnline",    label: "Driver came online", description: "When a driver in your fleet goes active"            },
  { key: "weeklyReport",    label: "Weekly report",      description: "A weekly summary of your fleet performance"         },
];

function NotificationsTab() {
  const { data: remote, isLoading } = useBusinessNotifPrefs();
  const update = useUpdateBusinessNotifPrefs();

  const [prefs, setPrefs] = useState<BusinessNotifPrefs>(NOTIF_DEFAULT);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState("");

  // Populate from server once loaded
  useEffect(() => { if (remote) setPrefs(remote); }, [remote]);

  const setOne = (key: keyof BusinessNotifPrefs, channel: "email" | "sms", val: boolean) =>
    setPrefs((p) => ({ ...p, [key]: { ...p[key], [channel]: val } }));

  async function handleSave() {
    setError("");
    try {
      await update.mutateAsync(prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) { setError(extractErrorMessage(err, "Failed to save notification preferences.")); }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-zinc-600" /></div>
  );

  return (
    <div className="space-y-5">
      <SectionCard title="Notification Preferences" description="Choose how you want to be notified for each event">
        <div className="flex items-center justify-end gap-6 pb-3 border-b border-white/[0.05] mb-1">
          <div className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-zinc-600" /><span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Email</span></div>
          <div className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-zinc-600" /><span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">SMS</span></div>
        </div>
        {NOTIF_ROWS.map(({ key, label, description }) => (
          <div key={key} className="flex items-start justify-between gap-4 py-4 border-b border-white/[0.04] last:border-b-0">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200">{label}</p>
              <p className="text-[11px] text-zinc-600 mt-0.5">{description}</p>
            </div>
            <div className="flex items-center gap-6 shrink-0">
              <div className="flex flex-col items-center gap-1"><Toggle value={prefs[key].email} onChange={(v) => setOne(key, "email", v)} /><span className="text-[9px] text-zinc-600">Email</span></div>
              <div className="flex flex-col items-center gap-1"><Toggle value={prefs[key].sms}   onChange={(v) => setOne(key, "sms",   v)} /><span className="text-[9px] text-zinc-600">SMS</span></div>
            </div>
          </div>
        ))}
      </SectionCard>
      {error && <ErrorBanner message={error} />}
      <div className="flex justify-end">
        <SaveButton saved={saved} loading={update.isPending} onClick={handleSave} />
      </div>
    </div>
  );
}

// Security Tab
function SecurityTab() {
  const router         = useRouter();
  const logout         = useAuthStore((s) => s.logout);
  const changePassword = useChangePassword();
  const deleteAccount  = useDeleteAccount();

  const [current, setCurrent]             = useState("");
  const [newPw,   setNewPw]               = useState("");
  const [confirm, setConfirm]             = useState("");
  const [showCurrent, setShowCurrent]     = useState(false);
  const [showNew,     setShowNew]         = useState(false);
  const [saved,       setSaved]           = useState(false);
  const [error,       setError]           = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError,   setDeleteError]   = useState("");

  const handleSave = async () => {
    if (!current)             { setError("Please enter your current password.");                       return; }
    if (newPw.length < 8)     { setError("New password must be at least 8 characters.");              return; }
    if (!/[A-Z]/.test(newPw)) { setError("New password must contain at least one uppercase letter."); return; }
    if (!/[0-9]/.test(newPw)) { setError("New password must contain at least one number.");           return; }
    if (newPw !== confirm)    { setError("Passwords do not match.");                                   return; }
    setError("");
    try {
      await changePassword.mutateAsync({ currentPassword: current, newPassword: newPw });
      setSaved(true); setCurrent(""); setNewPw(""); setConfirm("");
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) { setError(extractErrorMessage(err, "Failed to change password.")); }
  };

  return (
    <div className="space-y-5">
      <SectionCard title="Change Password" description="Use a strong password of at least 8 characters">
        <div className="space-y-4 max-w-md">
          <div>
            <FieldLabel>Current password</FieldLabel>
            <div className="relative">
              <input type={showCurrent ? "text" : "password"} value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Enter current password"
                className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] pl-3.5 pr-10 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/[0.12] transition-all" />
              <button onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors">
                {showCurrent ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div>
            <FieldLabel>New password</FieldLabel>
            <div className="relative">
              <input type={showNew ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="At least 8 characters"
                className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] pl-3.5 pr-10 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/[0.12] transition-all" />
              <button onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors">
                {showNew ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {newPw.length > 0 && (
              <div className="mt-2 flex items-center gap-1.5">
                {[1,2,3,4].map((lvl) => {
                  const s = newPw.length >= 12 ? 4 : newPw.length >= 10 ? 3 : newPw.length >= 8 ? 2 : 1;
                  return <div key={lvl} className={cn("flex-1 h-1 rounded-full transition-all", lvl <= s ? s >= 4 ? "bg-emerald-400" : s >= 3 ? "bg-sky-400" : s >= 2 ? "bg-amber-400" : "bg-rose-400" : "bg-white/[0.07]")} />;
                })}
                <span className="text-[10px] text-zinc-600 ml-1 whitespace-nowrap">
                  {newPw.length >= 12 ? "Strong" : newPw.length >= 10 ? "Good" : newPw.length >= 8 ? "Fair" : "Weak"}
                </span>
              </div>
            )}
          </div>
          <div>
            <FieldLabel>Confirm new password</FieldLabel>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat new password"
              className={cn("w-full rounded-xl border py-2.5 pl-3.5 pr-3 text-sm text-zinc-200 bg-white/[0.03] placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-sky-500/[0.12] transition-all",
                confirm && newPw && confirm !== newPw ? "border-rose-500/40" : "border-white/[0.07] focus:border-sky-500/40")} />
            {confirm && newPw && confirm !== newPw && <p className="text-[10px] text-rose-400 mt-1">Passwords do not match</p>}
          </div>
          {error && <ErrorBanner message={error} />}
        </div>
        <div className="flex justify-start mt-5">
          <SaveButton saved={saved} onClick={handleSave} loading={changePassword.isPending} />
        </div>
      </SectionCard>

      <SectionCard title="Two-Factor Authentication" description="Add an extra layer of security to your account">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-200">Authenticator app</p>
            <p className="text-xs text-zinc-600 mt-0.5">Use an app like Google Authenticator or Authy to generate one-time codes.</p>
          </div>
          <button className="shrink-0 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:border-white/[0.15] transition-all">
            Set up
          </button>
        </div>
      </SectionCard>

      <div className="rounded-2xl border border-rose-500/[0.15] bg-rose-500/[0.03] overflow-hidden">
        <div className="px-5 py-4 border-b border-rose-500/[0.1]">
          <p className="text-sm font-semibold text-rose-400">Danger Zone</p>
          <p className="text-xs text-zinc-600 mt-0.5">These actions are permanent and cannot be undone</p>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-zinc-300">Delete account</p>
              <p className="text-xs text-zinc-600 mt-0.5">Permanently delete your account, all shipments, drivers, and data.</p>
            </div>
            {!confirmDelete && (
              <button onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/25 bg-rose-500/[0.08] px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/[0.14] hover:border-rose-500/40 transition-all shrink-0">
                <Trash2 className="h-3.5 w-3.5" />Delete
              </button>
            )}
          </div>
          {confirmDelete && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.05] p-3.5 space-y-3">
              <p className="text-xs text-rose-300 font-medium">Are you sure? This will permanently delete your account and all associated data. This cannot be undone.</p>
              {deleteError && <p className="text-xs text-rose-400">{deleteError}</p>}
              <div className="flex gap-2">
                <button onClick={() => { setConfirmDelete(false); setDeleteError(""); }}
                  className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-all">
                  Cancel
                </button>
                <button disabled={deleteAccount.isPending}
                  onClick={async () => {
                    setDeleteError("");
                    try { await deleteAccount.mutateAsync(); await logout(); router.push("/login"); }
                    catch (err: unknown) { setDeleteError(extractErrorMessage(err, "Failed to delete account.")); }
                  }}
                  className="flex-1 rounded-xl border border-rose-500/40 bg-rose-500/[0.12] px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/[0.2] transition-all disabled:opacity-50">
                  {deleteAccount.isPending ? "Deleting..." : "Yes, delete my account"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Preferences Tab — real API
function PreferencesTab() {
  const { data: remote, isLoading } = useBusinessPreferences();
  const update = useUpdateBusinessPreferences();

  const [timezone,    setTimezone]    = useState("Africa/Lagos");
  const [currency,    setCurrency]    = useState("NGN");
  const [language,    setLanguage]    = useState("en");
  const [dateFormat,  setDateFormat]  = useState("DD/MM/YYYY");
  const [compactView, setCompactView] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState("");

  useEffect(() => {
    if (!remote) return;
    setTimezone(remote.timezone     ?? "Africa/Lagos");
    setCurrency(remote.currency     ?? "NGN");
    setLanguage(remote.language     ?? "en");
    setDateFormat(remote.dateFormat ?? "DD/MM/YYYY");
    setCompactView(remote.compactView ?? false);
    setAutoRefresh(remote.autoRefresh ?? true);
  }, [remote]);

  async function handleSave() {
    setError("");
    try {
      await update.mutateAsync({ timezone, currency, language, dateFormat, compactView, autoRefresh });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) { setError(extractErrorMessage(err, "Failed to save preferences.")); }
  }

  const selectClass = "w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/[0.12] transition-all appearance-none cursor-pointer";

  if (isLoading) return (
    <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-zinc-600" /></div>
  );

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
              <option value="NGN">Nigerian Naira (N)</option>
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
        {[
          { label: "Compact table view",     description: "Show more rows with reduced padding in tables", value: compactView, onChange: setCompactView },
          { label: "Auto-refresh dashboard", description: "Automatically refresh data every 30 seconds",   value: autoRefresh, onChange: setAutoRefresh  },
        ].map(({ label, description, value, onChange }) => (
          <div key={label} className="flex items-center justify-between gap-4 py-3.5 border-b border-white/[0.04] last:border-b-0">
            <div><p className="text-sm font-medium text-zinc-200">{label}</p><p className="text-xs text-zinc-600 mt-0.5">{description}</p></div>
            <Toggle value={value} onChange={onChange} />
          </div>
        ))}
      </SectionCard>

      {error && <ErrorBanner message={error} />}
      <div className="flex justify-end">
        <SaveButton saved={saved} loading={update.isPending} onClick={handleSave} />
      </div>
    </div>
  );
}

// Page
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Settings</h2>
        <p className="text-sm text-zinc-500 mt-0.5">Manage your account, notifications, and preferences</p>
      </div>
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-white/[0.05] pb-0 -mb-px">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = activeTab === key;
          return (
            <button key={key} onClick={() => setActiveTab(key)} className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
              active ? "border-sky-400 text-sky-400" : "border-transparent text-zinc-500 hover:text-zinc-200 hover:border-white/[0.15]",
            )}>
              <Icon className="h-3.5 w-3.5" />{label}
            </button>
          );
        })}
      </div>
      <div>
        {activeTab === "profile"       && <ProfileTab />}
        {activeTab === "notifications" && <NotificationsTab />}
        {activeTab === "security"      && <SecurityTab />}
        {activeTab === "preferences"   && <PreferencesTab />}
      </div>
    </div>
  );
}
