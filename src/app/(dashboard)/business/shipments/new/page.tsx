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
  children,
}: {
  label: string;
  required?: boolean | undefined;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-medium text-zinc-400">
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
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
      });
      setCreatedTrackingId(shipment.trackingId);
    } catch (err: unknown) {
      setServerError(extractErrorMessage(err, "Failed to create shipment. Please try again."));
    }
  };

  if (createdTrackingId) {
    const trackingId = createdTrackingId;
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-5">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Shipment Created!</h2>
        <p className="text-sm text-zinc-400 mb-2">
          Your shipment has been created and is awaiting driver assignment.
        </p>
        <p className="font-mono text-lg font-bold text-sky-400 mb-8">{trackingId}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push("/business/shipments" as Route)}
            className="rounded-xl bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-400 transition-colors"
          >
            View All Shipments
          </button>
          <button
            onClick={() => {
              setStep(1);
              setData(INITIAL);
              setCreatedTrackingId(null);
              setServerError(null);
            }}
            className="rounded-xl border border-white/[0.07] px-6 py-2.5 text-sm font-medium text-zinc-400 hover:text-white hover:border-white/[0.12] transition-all"
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* ── Progress steps ── */}
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

      {/* ── Form card ── */}
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
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-4 py-3 text-sm text-rose-400">
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
              className="flex items-center gap-2 rounded-xl bg-violet-500 hover:bg-violet-400 px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={createShipment.isPending}
              className="flex items-center gap-2 rounded-xl bg-violet-500 hover:bg-violet-400 px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
            >
              {createShipment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {createShipment.isPending ? "Creating…" : "Create Shipment"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
