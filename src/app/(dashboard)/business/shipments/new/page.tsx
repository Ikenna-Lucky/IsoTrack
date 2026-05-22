"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import {
  MapPin,
  User,
  Package,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
  Check,
  Copy,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { extractErrorMessage } from "@/lib/errors";
import { useCreateShipment } from "@/hooks/use-shipments";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  // Step 1 — Pickup
  pickupAddress: string;
  pickupCity: string;
  pickupContact: string;
  pickupPhone: string;
  // Step 2 — Delivery
  deliveryAddress: string;
  deliveryCity: string;
  deliveryContact: string;
  deliveryPhone: string;
  recipientEmail: string;   // optional — links shipment to customer account
  // Step 3 — Package
  packageType: string;
  weight: string;
  description: string;
  amount: string;
  priority: "standard" | "express";
}

const INITIAL: FormData = {
  pickupAddress: "",
  pickupCity: "",
  pickupContact: "",
  pickupPhone: "",
  deliveryAddress: "",
  deliveryCity: "",
  deliveryContact: "",
  deliveryPhone: "",
  recipientEmail: "",
  packageType: "Parcel",
  weight: "",
  description: "",
  amount: "",
  priority: "standard",
};

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: 1,
    label: "Pickup",
    icon: MapPin,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
  },
  {
    number: 2,
    label: "Delivery",
    icon: User,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
  },
  {
    number: 3,
    label: "Package",
    icon: Package,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    number: 4,
    label: "Confirm",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
];

const PACKAGE_TYPES = [
  "Document",
  "Parcel",
  "Food",
  "Electronics",
  "Clothing",
  "Furniture",
  "Other",
];
const LAGOS_CITIES = [
  "Lekki",
  "Ikeja",
  "Victoria Island",
  "Surulere",
  "Ikoyi",
  "Yaba",
  "Gbagada",
  "Maryland",
  "Ojota",
  "Ketu",
  "Ajah",
  "Berger",
  "Apapa",
  "Oshodi",
];

// ─── Field component ──────────────────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean | undefined;
  error?: string | undefined;
  hint?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-medium text-zinc-400">
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-zinc-600">{hint}</p>
      )}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-400">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string | undefined;
  type?: string | undefined;
  error?: boolean | undefined;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full rounded-xl border bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-zinc-700",
        "focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500/40 transition-all duration-200",
        error
          ? "border-rose-500/40 bg-rose-500/[0.03]"
          : "border-white/[0.07] hover:border-white/[0.12]",
      )}
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500/40 transition-all duration-200 hover:border-white/[0.12]"
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-[#0d0d10]">
          {o}
        </option>
      ))}
    </select>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function Step1({
  data,
  set,
  errors,
}: {
  data: FormData;
  set: (k: keyof FormData, v: string) => void;
  errors: Partial<FormData>;
}) {
  return (
    <div className="space-y-4">
      <Field label="Pickup Address" required error={errors.pickupAddress}>
        <Input
          value={data.pickupAddress}
          onChange={(v) => set("pickupAddress", v)}
          placeholder="e.g. 14 Admiralty Way"
          error={!!errors.pickupAddress}
        />
      </Field>
      <Field label="City" required error={errors.pickupCity}>
        <Select
          value={data.pickupCity || LAGOS_CITIES[0]!}
          onChange={(v) => set("pickupCity", v)}
          options={LAGOS_CITIES}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Contact Name" required error={errors.pickupContact}>
          <Input
            value={data.pickupContact}
            onChange={(v) => set("pickupContact", v)}
            placeholder="Full name"
            error={!!errors.pickupContact}
          />
        </Field>
        <Field label="Phone Number" required error={errors.pickupPhone}>
          <Input
            value={data.pickupPhone}
            onChange={(v) => set("pickupPhone", v)}
            placeholder="+2348012345678"
            error={!!errors.pickupPhone}
          />
        </Field>
      </div>
    </div>
  );
}

function Step2({
  data,
  set,
  errors,
}: {
  data: FormData;
  set: (k: keyof FormData, v: string) => void;
  errors: Partial<FormData>;
}) {
  return (
    <div className="space-y-4">
      <Field label="Delivery Address" required error={errors.deliveryAddress}>
        <Input
          value={data.deliveryAddress}
          onChange={(v) => set("deliveryAddress", v)}
          placeholder="e.g. 5 Bourdillon Road"
          error={!!errors.deliveryAddress}
        />
      </Field>
      <Field label="City" required error={errors.deliveryCity}>
        <Select
          value={data.deliveryCity || LAGOS_CITIES[0]!}
          onChange={(v) => set("deliveryCity", v)}
          options={LAGOS_CITIES}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Recipient Name" required error={errors.deliveryContact}>
          <Input
            value={data.deliveryContact}
            onChange={(v) => set("deliveryContact", v)}
            placeholder="Full name"
            error={!!errors.deliveryContact}
          />
        </Field>
        <Field label="Recipient Phone" required error={errors.deliveryPhone}>
          <Input
            value={data.deliveryPhone}
            onChange={(v) => set("deliveryPhone", v)}
            placeholder="+2348012345678"
            error={!!errors.deliveryPhone}
          />
        </Field>
      </div>
      <Field
        label="Recipient IsoTrack Email"
        hint="Optional — if the recipient has an IsoTrack account, the shipment will appear on their dashboard automatically."
      >
        <Input
          value={data.recipientEmail}
          onChange={(v) => set("recipientEmail", v)}
          placeholder="customer@email.com"
          type="email"
        />
      </Field>
    </div>
  );
}

function Step3({ data, set }: { data: FormData; set: (k: keyof FormData, v: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Package Type" required>
          <Select
            value={data.packageType}
            onChange={(v) => set("packageType", v)}
            options={PACKAGE_TYPES}
          />
        </Field>
        <Field label="Weight (kg)" required>
          <Input
            value={data.weight}
            onChange={(v) => set("weight", v)}
            placeholder="e.g. 2.5"
            type="number"
          />
        </Field>
      </div>
      <Field label="Description">
        <textarea
          value={data.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Brief description of contents (optional)"
          rows={3}
          className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500/40 transition-all resize-none"
        />
      </Field>
      <Field label="Delivery Fee (₦)" required>
        <Input
          value={data.amount}
          onChange={(v) => set("amount", v)}
          placeholder="e.g. 3500"
          type="number"
        />
      </Field>
      {/* Priority selector */}
      <Field label="Delivery Priority">
        <div className="grid grid-cols-2 gap-3">
          {(["standard", "express"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => set("priority", p)}
              className={cn(
                "rounded-xl border p-3 text-left transition-all duration-200",
                data.priority === p
                  ? "border-sky-500/30 bg-sky-500/[0.08] text-sky-400"
                  : "border-white/[0.07] text-zinc-500 hover:border-white/[0.12] hover:text-zinc-300",
              )}
            >
              <p className="text-sm font-semibold capitalize">{p}</p>
              <p className="text-[10px] mt-0.5">
                {p === "standard" ? "3–5 hours · no extra fee" : "< 2 hours · +₦500"}
              </p>
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
}

function Step4({ data }: { data: FormData }) {
  const amount = Number(data.amount) + (data.priority === "express" ? 500 : 0);
  return (
    <div className="space-y-4">
      {/* Summary card */}
      {[
        {
          title: "Pickup",
          lines: [
            `${data.pickupAddress}, ${data.pickupCity || LAGOS_CITIES[0]}`,
            `${data.pickupContact} · ${data.pickupPhone}`,
          ],
        },
        {
          title: "Delivery",
          lines: [
            `${data.deliveryAddress}, ${data.deliveryCity || LAGOS_CITIES[0]}`,
            `${data.deliveryContact} · ${data.deliveryPhone}`,
          ],
        },
        {
          title: "Package",
          lines: [
            `${data.packageType} · ${data.weight || "—"} kg`,
            data.description || "No description",
          ],
        },
      ].map(({ title, lines }) => (
        <div
          key={title}
          className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
            {title}
          </p>
          {lines.map((l, i) => (
            <p
              key={i}
              className={cn("text-sm", i === 0 ? "text-zinc-200" : "text-zinc-500 text-xs")}
            >
              {l}
            </p>
          ))}
        </div>
      ))}

      {/* Total */}
      <div className="rounded-xl border border-sky-500/20 bg-sky-500/[0.06] px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-400">Total Delivery Fee</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">
            {data.priority === "express" ? "Includes express surcharge (+₦500)" : "Standard rate"}
          </p>
        </div>
        <p className="text-xl font-bold text-sky-400">{formatNaira(amount)}</p>
      </div>
    </div>
  );
}

// ─── Success view ─────────────────────────────────────────────────────────────

function SuccessView({
  trackingId,
  fromCity,
  toCity,
  packageType,
  onViewAll,
  onCreateAnother,
}: {
  trackingId: string;
  fromCity: string;
  toCity: string;
  packageType: string;
  onViewAll: () => void;
  onCreateAnother: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    void navigator.clipboard.writeText(trackingId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <div className="max-w-md mx-auto pt-6 pb-16 px-4">
      {/* ── Header ── */}
      <div className="mb-7 text-center">
        <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-600 mb-2 font-medium">
          Shipment dispatched
        </p>
        <h2 className="text-2xl font-bold text-white leading-snug">
          Your package is on the board
        </h2>
        <p className="text-[13px] text-zinc-500 mt-1.5">
          A driver will be matched shortly
        </p>
      </div>

      {/* ── Route arc SVG ── */}
      <div className="mb-7 select-none" aria-hidden="true">
        <svg viewBox="0 0 360 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <defs>
            <linearGradient id="sg-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
            <radialGradient id="sg-dot" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#0284c7" />
            </radialGradient>
            <filter id="sg-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <line x1="52" y1="26" x2="308" y2="26"
            stroke="url(#sg-line)" strokeWidth="1.5" strokeDasharray="5 4"
            strokeOpacity="0.25" strokeLinecap="round"
          />
          <circle cx="46" cy="26" r="10" fill="#0ea5e9" fillOpacity="0.12" />
          <circle cx="46" cy="26" r="5.5" fill="url(#sg-dot)" filter="url(#sg-glow)" />
          <circle cx="44.2" cy="24.2" r="1.8" fill="white" fillOpacity="0.55" />
          <circle cx="314" cy="26" r="10" fill="#14b8a6" fillOpacity="0.12" />
          <circle cx="314" cy="26" r="5.5" fill="url(#sg-dot)" filter="url(#sg-glow)" />
          <circle cx="312.2" cy="24.2" r="1.8" fill="white" fillOpacity="0.55" />
          <circle cx={46} cy={26} r={4} fill="white" fillOpacity={0} filter="url(#sg-glow)">
            <animate attributeName="cx" values="46;314;314;46" keyTimes="0;0.7;0.85;1" dur="3.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.95;0.95;0" keyTimes="0;0.05;0.8;1" dur="3.2s" repeatCount="indefinite" />
          </circle>
        </svg>
        {/* City labels as HTML — avoids SVG text parsing issues */}
        <div className="flex justify-between px-[11%] -mt-0.5">
          <span className="text-[10px] text-zinc-600 tracking-wide">{fromCity}</span>
          <span className="text-[10px] text-zinc-600 tracking-wide">{toCity}</span>
        </div>
      </div>

      {/* ── Waybill card ── */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.5), transparent)" }}
        />

        {/* Status bar */}
        <div className="flex items-center gap-2.5 px-5 pt-5 pb-3.5 border-b border-white/[0.05]">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute h-2 w-2 rounded-full bg-emerald-400 opacity-60" />
            <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[12px] text-zinc-400 font-medium">Awaiting driver assignment</span>
          <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-zinc-700 border border-white/[0.06] rounded-md px-2 py-0.5">
            {packageType}
          </span>
        </div>

        {/* Tracking ID — the hero */}
        <div className="px-5 py-4 border-b border-dashed border-white/[0.06]">
          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-600 mb-2.5 font-medium">
            Tracking reference
          </p>
          <button
            onClick={copy}
            className="group flex items-center justify-between w-full text-left rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 hover:border-sky-500/25 hover:bg-sky-500/[0.04] transition-all duration-200"
          >
            <span className="font-mono text-[1.35rem] font-bold tracking-widest text-white group-hover:text-sky-300 transition-colors">
              {trackingId}
            </span>
            <span className={cn(
              "flex items-center gap-1.5 text-[11px] font-semibold rounded-lg px-3 py-1.5 shrink-0 ml-3 transition-all duration-200",
              copied
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                : "bg-white/[0.05] text-zinc-500 border border-white/[0.08] group-hover:text-sky-400 group-hover:border-sky-500/20 group-hover:bg-sky-500/[0.06]",
            )}>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied!" : "Copy"}
            </span>
          </button>
          <p className="text-[11px] text-zinc-700 mt-2 pl-1">
            Share this ID with your recipient so they can track delivery
          </p>
        </div>

        {/* Route row */}
        <div className="px-5 py-4 flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-700 mb-0.5 font-medium">From</p>
            <p className="text-sm font-semibold text-zinc-200 truncate">{fromCity}</p>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-zinc-700 shrink-0 mx-1" />
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-700 mb-0.5 font-medium">To</p>
            <p className="text-sm font-semibold text-zinc-200 truncate">{toCity}</p>
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="mt-4 flex gap-2.5">
        <button
          onClick={onViewAll}
          className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[13px] font-medium text-zinc-400 hover:text-white hover:border-white/[0.14] hover:bg-white/[0.05] transition-all"
        >
          View shipments
        </button>
        <button
          onClick={onCreateAnother}
          className="flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 px-5 py-2.5 text-[13px] font-semibold text-white transition-colors shadow-lg shadow-sky-500/20"
        >
          <Plus className="h-3.5 w-3.5" />
          New shipment
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewShipmentPage() {
  const router = useRouter();
  const createShipment = useCreateShipment();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [createdTrackingId, setCreatedTrackingId] = useState<string | null>(null);

  const set = (k: keyof FormData, v: string) => {
    setData((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const _validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (step === 1) {
      if (!data.pickupAddress) e.pickupAddress = "Required";
      if (!data.pickupContact) e.pickupContact = "Required";
      if (!data.pickupPhone) e.pickupPhone = "Required";
    }
    if (step === 2) {
      if (!data.deliveryAddress) e.deliveryAddress = "Required";
      if (!data.deliveryContact) e.deliveryContact = "Required";
      if (!data.deliveryPhone) e.deliveryPhone = "Required";
    }
    if (step === 3) {
      if (!data.weight || Number(data.weight) <= 0) e.weight = "Required";
      if (!data.amount || Number(data.amount) <= 0) e.amount = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (_validate()) setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setServerError(null);
    const baseAmount = Number(data.amount);
    const expressExtra = data.priority === "express" ? 500 : 0;
    const totalKobo = (baseAmount + expressExtra) * 100;
    const descriptionText = [data.packageType, data.description].filter(Boolean).join(": ");

    try {
      const shipment = await createShipment.mutateAsync({
        description: descriptionText,
        weightKg: Number(data.weight),
        pickupAddress: {
          street: data.pickupAddress,
          city: data.pickupCity || LAGOS_CITIES[0]!,
          state: "Lagos",
        },
        deliveryAddress: {
          street: data.deliveryAddress,
          city: data.deliveryCity || LAGOS_CITIES[0]!,
          state: "Lagos",
        },
        priceKobo: totalKobo,
        ...(data.recipientEmail.trim()
          ? { customerEmail: data.recipientEmail.trim().toLowerCase() }
          : {}),
      });
      setCreatedTrackingId(shipment.trackingId);
    } catch (err: unknown) {
      setServerError(extractErrorMessage(err, "Failed to create shipment. Please try again."));
    }
  };

  if (createdTrackingId) {
    return (
      <SuccessView
        trackingId={createdTrackingId}
        fromCity={data.pickupCity || LAGOS_CITIES[0]!}
        toCity={data.deliveryCity || LAGOS_CITIES[0]!}
        packageType={data.packageType}
        onViewAll={() => router.push("/business/shipments" as Route)}
        onCreateAnother={() => {
          setStep(1);
          setData(INITIAL);
          setCreatedTrackingId(null);
          setServerError(null);
        }}
      />
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress steps */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map(({ number, label, icon: Icon, color, bg, border }, i) => {
          const state = number < step ? "done" : number === step ? "current" : "pending";
          return (
            <div key={number} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300",
                    state === "done"
                      ? "bg-emerald-500/10 border-emerald-500/25"
                      : state === "current"
                        ? `${bg} ${border}`
                        : "bg-white/[0.03] border-white/[0.07]",
                  )}
                >
                  {state === "done" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Icon
                      className={cn("h-4 w-4", state === "current" ? color : "text-zinc-700")}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    state === "current" ? "text-zinc-300" : "text-zinc-700",
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="flex-1 h-px mx-2 mb-4"
                  style={{ background: number < step ? "#10b981" : "rgba(255,255,255,0.07)" }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white">{STEPS[step - 1]!.label} Details</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Step {step} of {STEPS.length}
          </p>
        </div>

        {step === 1 && <Step1 data={data} set={set} errors={errors} />}
        {step === 2 && <Step2 data={data} set={set} errors={errors} />}
        {step === 3 && <Step3 data={data} set={set} />}
        {step === 4 && (
          <>
            <Step4 data={data} />
            {serverError && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-4 py-3">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-rose-400" />
                <p className="text-sm text-rose-400">{serverError}</p>
              </div>
            )}
          </>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={createShipment.isPending}
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white hover:border-white/[0.15] transition-all disabled:opacity-50"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < STEPS.length ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 rounded-xl bg-violet-500 hover:bg-violet-400 px-5 py-2.5 text-sm font-semibold text-white transition-all"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={createShipment.isPending}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
            >
              {createShipment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {createShipment.isPending ? "Creating..." : "Create Shipment"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
