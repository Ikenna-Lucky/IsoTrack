"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  MapPin,
  Package,
  Plus,
  User,
} from "lucide-react";
import { useCreateShipment } from "@/hooks/use-shipments";
import { extractErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";

interface FormData {
  pickupAddress: string;
  pickupCity: string;
  pickupContact: string;
  pickupPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryContact: string;
  deliveryPhone: string;
  recipientEmail: string;
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

const STEPS = [
  { number: 1, label: "Pickup", icon: MapPin },
  { number: 2, label: "Delivery", icon: User },
  { number: 3, label: "Package", icon: Package },
  { number: 4, label: "Confirm", icon: CheckCircle2 },
];

const LAGOS_CITIES = ["Lekki", "Ikeja", "Victoria Island", "Surulere", "Ikoyi", "Yaba", "Ajah", "Maryland"];
const PACKAGE_TYPES = ["Document", "Parcel", "Food", "Electronics", "Clothing", "Furniture", "Other"];

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black text-stone-400">{label}</label>
      {children}
      {error && <p className="mt-1 text-[11px] font-bold text-rose-200">{error}</p>}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string | undefined;
  type?: string | undefined;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-white/[0.08] bg-black/25 px-3 py-3 text-sm font-bold text-stone-100 outline-none transition placeholder:text-stone-700 focus:border-teal-400/40 focus:ring-2 focus:ring-teal-400/10"
    />
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
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-md border border-white/[0.08] bg-black/25 px-3 py-3 text-sm font-bold text-stone-100 outline-none transition focus:border-teal-400/40 focus:ring-2 focus:ring-teal-400/10"
    >
      {children}
    </select>
  );
}

function ReviewCard({ data }: { data: FormData }) {
  const baseAmount = Number(data.amount || 0);
  const expressExtra = data.priority === "express" ? 500 : 0;

  return (
    <aside className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4 lg:sticky lg:top-24">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-600">Shipment preview</p>
      <div className="mt-4 space-y-3">
        <div className="rounded-md border border-teal-400/20 bg-teal-400/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-teal-200">Route</p>
          <p className="mt-1 truncate text-sm font-black text-stone-100">{data.pickupCity || "Pickup city"} to {data.deliveryCity || "Delivery city"}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md border border-white/[0.07] bg-white/[0.03] p-3">
            <p className="text-[10px] text-stone-600">Package</p>
            <p className="mt-1 truncate text-xs font-black text-stone-100">{data.packageType}</p>
          </div>
          <div className="rounded-md border border-white/[0.07] bg-white/[0.03] p-3">
            <p className="text-[10px] text-stone-600">Weight</p>
            <p className="mt-1 text-xs font-black text-stone-100">{data.weight || "0"} kg</p>
          </div>
        </div>
        <div className="rounded-md border border-amber-400/20 bg-amber-400/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-200">Charge</p>
          <p className="mt-1 text-xl font-black text-stone-50">{formatNaira(baseAmount + expressExtra)}</p>
          <p className="mt-1 text-[11px] text-stone-500">{data.priority === "express" ? "Includes express surcharge" : "Standard dispatch"}</p>
        </div>
      </div>
    </aside>
  );
}

function SuccessView({
  trackingId,
  onViewAll,
  onCreateAnother,
}: {
  trackingId: string;
  onViewAll: () => void;
  onCreateAnother: () => void;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="mx-auto max-w-xl rounded-md border border-teal-400/20 bg-[#0d1412] p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-emerald-400/20 bg-emerald-400/10">
        <CheckCircle2 className="h-6 w-6 text-emerald-200" />
      </div>
      <h2 className="mt-4 text-2xl font-black text-stone-50">Shipment created</h2>
      <p className="mt-2 text-sm leading-6 text-stone-500">Share this tracking ID with the recipient so they can follow the delivery.</p>
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(trackingId);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        }}
        className="mt-5 inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 font-mono text-sm font-black text-stone-100"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-200" /> : <Copy className="h-4 w-4 text-teal-200" />}
        {trackingId}
      </button>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <button onClick={onViewAll} className="rounded-md bg-amber-300 px-4 py-2.5 text-sm font-black text-black transition hover:bg-amber-200">
          View shipments
        </button>
        <button onClick={onCreateAnother} className="rounded-md border border-white/[0.08] px-4 py-2.5 text-sm font-black text-stone-200 transition hover:bg-white/[0.06]">
          Create another
        </button>
      </div>
    </div>
  );
}

export default function NewShipmentPage() {
  const router = useRouter();
  const createShipment = useCreateShipment();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [createdTrackingId, setCreatedTrackingId] = useState<string | null>(null);

  const set = (key: keyof FormData, value: string) => {
    setData((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  function validate() {
    const nextErrors: Partial<FormData> = {};
    if (step === 1) {
      if (!data.pickupAddress) nextErrors.pickupAddress = "Required";
      if (!data.pickupContact) nextErrors.pickupContact = "Required";
      if (!data.pickupPhone) nextErrors.pickupPhone = "Required";
    }
    if (step === 2) {
      if (!data.deliveryAddress) nextErrors.deliveryAddress = "Required";
      if (!data.deliveryContact) nextErrors.deliveryContact = "Required";
      if (!data.deliveryPhone) nextErrors.deliveryPhone = "Required";
    }
    if (step === 3) {
      if (!data.weight || Number(data.weight) <= 0) nextErrors.weight = "Required";
      if (!data.amount || Number(data.amount) <= 0) nextErrors.amount = "Required";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    setServerError(null);
    const baseAmount = Number(data.amount);
    const totalKobo = (baseAmount + (data.priority === "express" ? 500 : 0)) * 100;
    const description = [data.packageType, data.description].filter(Boolean).join(": ");

    try {
      const shipment = await createShipment.mutateAsync({
        description,
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
        ...(data.recipientEmail.trim() ? { customerEmail: data.recipientEmail.trim().toLowerCase() } : {}),
      });
      setCreatedTrackingId(shipment.trackingId);
    } catch (err: unknown) {
      setServerError(extractErrorMessage(err, "Failed to create shipment. Please try again."));
    }
  }

  if (createdTrackingId) {
    return (
      <SuccessView
        trackingId={createdTrackingId}
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
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4 sm:p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-200">Dispatch intake</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-50 sm:text-3xl">New Shipment</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
          Capture pickup, recipient, package, and payment details before releasing the job to dispatch.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr,320px]">
        <div className="rounded-md border border-white/[0.07] bg-[#0d1412]">
          <div className="border-b border-white/[0.07] p-4">
            <div className="grid grid-cols-4 gap-2">
              {STEPS.map(({ number, label, icon: Icon }) => {
                const active = step === number;
                const done = step > number;
                return (
                  <button
                    key={number}
                    onClick={() => {
                      if (number < step) setStep(number);
                    }}
                    className={cn(
                      "rounded-md border px-2 py-3 text-center transition",
                      active || done ? "border-teal-400/25 bg-teal-400/10 text-teal-100" : "border-white/[0.07] bg-white/[0.03] text-stone-600",
                    )}
                  >
                    {done ? <CheckCircle2 className="mx-auto h-4 w-4" /> : <Icon className="mx-auto h-4 w-4" />}
                    <p className="mt-1 truncate text-[10px] font-black">{label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 p-4 sm:p-5">
            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Pickup address" error={errors.pickupAddress}>
                  <Input value={data.pickupAddress} onChange={(value) => set("pickupAddress", value)} placeholder="Street, building, landmark" />
                </Field>
                <Field label="Pickup city">
                  <Select value={data.pickupCity} onChange={(value) => set("pickupCity", value)}>
                    <option value="">Select city</option>
                    {LAGOS_CITIES.map((city) => <option key={city}>{city}</option>)}
                  </Select>
                </Field>
                <Field label="Pickup contact" error={errors.pickupContact}>
                  <Input value={data.pickupContact} onChange={(value) => set("pickupContact", value)} placeholder="Contact name" />
                </Field>
                <Field label="Pickup phone" error={errors.pickupPhone}>
                  <Input value={data.pickupPhone} onChange={(value) => set("pickupPhone", value)} placeholder="+234..." />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Delivery address" error={errors.deliveryAddress}>
                  <Input value={data.deliveryAddress} onChange={(value) => set("deliveryAddress", value)} placeholder="Street, building, landmark" />
                </Field>
                <Field label="Delivery city">
                  <Select value={data.deliveryCity} onChange={(value) => set("deliveryCity", value)}>
                    <option value="">Select city</option>
                    {LAGOS_CITIES.map((city) => <option key={city}>{city}</option>)}
                  </Select>
                </Field>
                <Field label="Recipient name" error={errors.deliveryContact}>
                  <Input value={data.deliveryContact} onChange={(value) => set("deliveryContact", value)} placeholder="Recipient name" />
                </Field>
                <Field label="Recipient phone" error={errors.deliveryPhone}>
                  <Input value={data.deliveryPhone} onChange={(value) => set("deliveryPhone", value)} placeholder="+234..." />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Recipient email">
                    <Input value={data.recipientEmail} onChange={(value) => set("recipientEmail", value)} placeholder="Optional customer account email" />
                  </Field>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Package type">
                  <Select value={data.packageType} onChange={(value) => set("packageType", value)}>
                    {PACKAGE_TYPES.map((type) => <option key={type}>{type}</option>)}
                  </Select>
                </Field>
                <Field label="Weight" error={errors.weight}>
                  <Input type="number" value={data.weight} onChange={(value) => set("weight", value)} placeholder="kg" />
                </Field>
                <Field label="Customer charge" error={errors.amount}>
                  <Input type="number" value={data.amount} onChange={(value) => set("amount", value)} placeholder="Amount in NGN" />
                </Field>
                <Field label="Priority">
                  <Select value={data.priority} onChange={(value) => set("priority", value as FormData["priority"])}>
                    <option value="standard">Standard</option>
                    <option value="express">Express (+NGN 500)</option>
                  </Select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Description">
                    <Input value={data.description} onChange={(value) => set("description", value)} placeholder="What is being shipped?" />
                  </Field>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3">
                <div className="rounded-md border border-teal-400/20 bg-teal-400/10 p-4">
                  <p className="text-sm font-black text-stone-100">Ready to create this shipment?</p>
                  <p className="mt-1 text-xs leading-5 text-stone-500">
                    The recipient will be able to track it once the shipment record is created.
                  </p>
                </div>
                {serverError && (
                  <div className="flex gap-2 rounded-md border border-rose-400/20 bg-rose-400/10 p-3">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-200" />
                    <p className="text-xs font-bold text-rose-100">{serverError}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
              <button
                onClick={() => setStep((value) => Math.max(1, value - 1))}
                disabled={step === 1}
                className="rounded-md border border-white/[0.08] px-4 py-2.5 text-sm font-black text-stone-300 transition hover:bg-white/[0.06] disabled:opacity-40"
              >
                Back
              </button>
              {step < 4 ? (
                <button
                  onClick={() => {
                    if (validate()) setStep((value) => value + 1);
                  }}
                  className="flex items-center gap-2 rounded-md bg-amber-300 px-4 py-2.5 text-sm font-black text-black transition hover:bg-amber-200"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={createShipment.isPending}
                  className="flex items-center gap-2 rounded-md bg-amber-300 px-4 py-2.5 text-sm font-black text-black transition hover:bg-amber-200 disabled:opacity-50"
                >
                  {createShipment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Create shipment
                </button>
              )}
            </div>
          </div>
        </div>

        <ReviewCard data={data} />
      </div>
    </div>
  );
}
