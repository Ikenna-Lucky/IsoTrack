"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Loader2,
  MoveRight,
  AlertCircle,
  Building2,
  Truck,
  PackageOpen,
  Check,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

// ─── Schema ───────────────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "At least 8 characters required")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    role: z.enum(["business", "driver", "customer"]),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{6,14}$/, "Enter a valid number (e.g. +2348012345678)")
      .optional()
      .or(z.literal("")),
    // Business-specific
    businessName: z.string().min(2, "Business name must be at least 2 characters").max(100).optional(),
    // Driver-specific
    vehicleType: z.enum(["bike", "car", "van", "truck"]).optional(),
    vehiclePlate: z.string().min(3, "Enter a valid plate number").max(20).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "business" && !data.businessName) {
      ctx.addIssue({ code: "custom", path: ["businessName"], message: "Business name is required" });
    }
    if (data.role === "driver") {
      if (!data.vehicleType) {
        ctx.addIssue({ code: "custom", path: ["vehicleType"], message: "Vehicle type is required" });
      }
      if (!data.vehiclePlate) {
        ctx.addIssue({ code: "custom", path: ["vehiclePlate"], message: "Plate number is required" });
      }
    }
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_ROUTES: Record<UserRole, string> = {
  business: "/business",
  driver: "/driver",
  customer: "/customer",
};

// ─── Role options ─────────────────────────────────────────────────────────────

const ROLES: {
  value: UserRole;
  label: string;
  sublabel: string;
  capability: string;
  icon: React.ElementType;
}[] = [
  {
    value: "business",
    label: "Business",
    sublabel: "I manage logistics",
    capability: "Create shipments, assign drivers, track your fleet.",
    icon: Building2,
  },
  {
    value: "driver",
    label: "Driver",
    sublabel: "I make deliveries",
    capability: "Accept jobs, update status, get paid faster.",
    icon: Truck,
  },
  {
    value: "customer",
    label: "Customer",
    sublabel: "I send or receive",
    capability: "Track packages live, get instant delivery alerts.",
    icon: PackageOpen,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <label className="text-[13px] font-medium text-zinc-400">{label}</label>
        {hint && <span className="text-[11px] text-zinc-700 font-normal">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-[11px] text-red-400">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordStrength({ value }: { value: string }) {
  const rules = [
    { label: "8+ chars", ok: value.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(value) },
    { label: "Number", ok: /[0-9]/.test(value) },
  ];
  const score = rules.filter((r) => r.ok).length;

  if (!value) return null;

  const barColor = score === 3 ? "bg-emerald-500" : score === 2 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "h-0.5 flex-1 rounded-full transition-all duration-300",
              i < score ? barColor : "bg-white/[0.07]",
            )}
          />
        ))}
      </div>
      {/* Rule chips */}
      <div className="flex gap-2 flex-wrap">
        {rules.map(({ label, ok }) => (
          <span
            key={label}
            className={cn(
              "flex items-center gap-1 text-[10px] transition-colors duration-200",
              ok ? "text-emerald-500" : "text-zinc-700",
            )}
          >
            <Check className={cn("h-2.5 w-2.5 transition-opacity", !ok && "opacity-0")} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RegisterForm() {
  const router = useRouter();
  const register_ = useAuthStore((s) => s.register);

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "customer" },
  });

  const password = watch("password") ?? "";
  const selectedRole = watch("role");

  // Stagger helper
  const slide = (delay: string) => ({
    animation: `authSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) ${delay} both`,
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await register_({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        ...(values.phone ? { phone: values.phone } : {}),
        ...(values.role === "business" && values.businessName ? { businessName: values.businessName } : {}),
        ...(values.role === "driver" ? { vehicleType: values.vehicleType, vehiclePlate: values.vehiclePlate } : {}),
      });
      router.push(ROLE_ROUTES[values.role] as Route);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Something went wrong. Please try again.";
      setServerError(message);
    }
  };

  return (
    <>
      <style>{`
      @keyframes authSlideUp {
        from { opacity: 0; transform: translateY(18px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `}</style>

      <div className="w-full max-w-[440px]">
        {/* Mobile-only logo */}
        <div className="lg:hidden mb-10 flex justify-center" style={slide("0s")}>
          <Logo size={30} />
        </div>

        {/* Heading */}
        <div className="mb-8" style={slide("0s")}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-500 mb-3">
            Get started — it&apos;s free
          </p>
          <h1 className="text-[2.1rem] font-bold leading-tight tracking-tight text-white">
            Get on the grid.
          </h1>
          <p className="mt-3 text-[13.5px] text-zinc-500 leading-relaxed">
            One account. Every shipment. Full visibility across the journey.
          </p>
        </div>

        {/* Server error */}
        {serverError && (
          <div
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.05] px-4 py-3.5 text-sm text-red-400"
            style={slide("0.05s")}
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* ── Role selector ────────────────────────────────────────────── */}
          <div className="space-y-2" style={slide("0.1s")}>
            <p className="text-[13px] font-medium text-zinc-400">I am a…</p>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map(({ value, label, sublabel, icon: Icon }) => {
                    const active = field.value === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => field.onChange(value)}
                        className={cn(
                          "relative group flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center",
                          "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40",
                          active
                            ? "border-sky-500/50 bg-sky-500/[0.07]"
                            : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]",
                        )}
                      >
                        {/* Icon container */}
                        <span
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
                            active
                              ? "bg-sky-500/15 text-sky-400"
                              : "bg-white/[0.04] text-zinc-600 group-hover:text-zinc-400",
                          )}
                        >
                          <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                        </span>

                        <span
                          className={cn(
                            "text-[12px] font-semibold leading-none transition-colors",
                            active ? "text-white" : "text-zinc-500",
                          )}
                        >
                          {label}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] leading-tight hidden sm:block transition-colors",
                            active ? "text-zinc-400" : "text-zinc-700",
                          )}
                        >
                          {sublabel}
                        </span>

                        {/* Active indicator dot */}
                        {active && (
                          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-sky-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            />

            {/* Role capability hint */}
            <p className="text-[11px] text-zinc-600 min-h-[16px] transition-all">
              {ROLES.find((r) => r.value === selectedRole)?.capability}
            </p>
          </div>

          {/* ── Full name ────────────────────────────────────────────────── */}
          <div style={slide("0.18s")}>
            <Field label="Full name" error={errors.name?.message}>
              <input
                {...register("name")}
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Ikenna Okafor"
                className={cn(
                  "w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-zinc-700",
                  "focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/40",
                  "transition-all duration-200",
                  errors.name
                    ? "border-red-500/40 bg-red-500/[0.02]"
                    : "border-white/[0.07] hover:border-white/[0.12]",
                )}
              />
            </Field>
          </div>

          {/* ── Email ────────────────────────────────────────────────────── */}
          <div style={slide("0.24s")}>
            <Field label="Email address" error={errors.email?.message}>
              <input
                {...register("email")}
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className={cn(
                  "w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-zinc-700",
                  "focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/40",
                  "transition-all duration-200",
                  errors.email
                    ? "border-red-500/40 bg-red-500/[0.02]"
                    : "border-white/[0.07] hover:border-white/[0.12]",
                )}
              />
            </Field>
          </div>

          {/* ── Phone ────────────────────────────────────────────────────── */}
          <div style={slide("0.3s")}>
            <Field label="Phone number" hint="optional" error={errors.phone?.message}>
              <input
                {...register("phone")}
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+234 801 234 5678"
                className={cn(
                  "w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-zinc-700",
                  "focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/40",
                  "transition-all duration-200",
                  errors.phone
                    ? "border-red-500/40 bg-red-500/[0.02]"
                    : "border-white/[0.07] hover:border-white/[0.12]",
                )}
              />
            </Field>
          </div>

          {/* ── Business name (business role only) ───────────────────────── */}
          {selectedRole === "business" && (
            <div style={slide("0.3s")}>
              <Field label="Business name" error={errors.businessName?.message}>
                <input
                  {...register("businessName")}
                  id="businessName"
                  type="text"
                  autoComplete="organization"
                  placeholder="e.g. SwiftCargo Ltd"
                  className={cn(
                    "w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-zinc-700",
                    "focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/40",
                    "transition-all duration-200",
                    errors.businessName
                      ? "border-red-500/40 bg-red-500/[0.02]"
                      : "border-white/[0.07] hover:border-white/[0.12]",
                  )}
                />
              </Field>
            </div>
          )}

          {/* ── Vehicle fields (driver role only) ────────────────────────── */}
          {selectedRole === "driver" && (
            <div className="space-y-4" style={slide("0.3s")}>
              <Field label="Vehicle type" error={errors.vehicleType?.message}>
                <Controller
                  name="vehicleType"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-4 gap-2">
                      {(["bike", "car", "van", "truck"] as const).map((v) => {
                        const labels = { bike: "🛵 Bike", car: "🚗 Car", van: "🚐 Van", truck: "🚛 Truck" };
                        const active = field.value === v;
                        return (
                          <button
                            key={v}
                            type="button"
                            onClick={() => field.onChange(v)}
                            className={cn(
                              "rounded-xl border px-2 py-3 text-center text-[12px] font-medium transition-all duration-200",
                              active
                                ? "border-sky-500/50 bg-sky-500/[0.07] text-white"
                                : "border-white/[0.06] text-zinc-600 hover:border-white/[0.1] hover:text-zinc-400",
                            )}
                          >
                            {labels[v]}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
              </Field>
              <Field label="Plate number" error={errors.vehiclePlate?.message}>
                <input
                  {...register("vehiclePlate")}
                  id="vehiclePlate"
                  type="text"
                  placeholder="e.g. LND 123 XA"
                  className={cn(
                    "w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-zinc-700 uppercase",
                    "focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/40",
                    "transition-all duration-200",
                    errors.vehiclePlate
                      ? "border-red-500/40 bg-red-500/[0.02]"
                      : "border-white/[0.07] hover:border-white/[0.12]",
                  )}
                />
              </Field>
            </div>
          )}

          {/* ── Password ─────────────────────────────────────────────────── */}
          <div style={slide("0.36s")}>
            <Field label="Password" error={errors.password?.message}>
              <div className="relative">
                <input
                  {...register("password")}
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Choose a strong password"
                  className={cn(
                    "w-full rounded-xl border bg-white/[0.03] pl-4 pr-10 py-3 text-sm text-white placeholder:text-zinc-700",
                    "focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-all",
                    errors.password ? "border-rose-500/50" : "border-white/[0.07] focus:border-sky-500/40",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
          </div>

          {/* ── Submit ── */}
          <div style={slide("0.44s")}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative w-full overflow-hidden rounded-xl bg-sky-500 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account…
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </div>

          {serverError && (
            <p className="text-center text-sm text-rose-400">{serverError}</p>
          )}

          <p className="text-center text-xs text-zinc-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-sky-400 hover:text-sky-300 transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
