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
  ArrowRight,
  Building2,
  Truck,
  Package,
  Check,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

// ─── Schema ───────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long"),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
  role: z.enum(["business", "driver", "customer"]),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{6,14}$/, "Enter a valid phone number (e.g. +2348012345678)")
    .optional()
    .or(z.literal("")),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── Role → dashboard route map ───────────────────────────────────────────────

const ROLE_ROUTES: Record<UserRole, string> = {
  business: "/business",
  driver: "/driver",
  customer: "/customer",
};

// ─── Role option data ─────────────────────────────────────────────────────────

const ROLES: {
  value: UserRole;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}[] = [
  {
    value: "business",
    label: "Business",
    description: "Manage shipments & logistics",
    icon: Building2,
    color: "sky",
  },
  {
    value: "driver",
    label: "Driver",
    description: "Deliver packages on the road",
    icon: Truck,
    color: "teal",
  },
  {
    value: "customer",
    label: "Customer",
    description: "Send or receive shipments",
    icon: Package,
    color: "violet",
  },
];

// ─── Password strength indicator ──────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["bg-zinc-700", "bg-red-500", "bg-amber-500", "bg-emerald-500"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i < score ? colors[score] : "bg-white/[0.06]",
            )}
          />
        ))}
      </div>
      <div className="flex gap-3 flex-wrap">
        {checks.map(({ label, pass }) => (
          <span
            key={label}
            className={cn(
              "flex items-center gap-1 text-[10px] transition-colors",
              pass ? "text-emerald-500" : "text-zinc-600",
            )}
          >
            <Check className={cn("h-2.5 w-2.5", !pass && "opacity-0")} />
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

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await register_({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        ...(values.phone ? { phone: values.phone } : {}),
      });
      router.push(ROLE_ROUTES[values.role] as Route);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Something went wrong. Please try again.";
      setServerError(message);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-8 sm:p-10 backdrop-blur-sm">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-sm text-zinc-500">
            Join IsoTrack — it&apos;s free
          </p>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-400">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Role selector */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              I am a…
            </label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map(({ value, label, description, icon: Icon }) => {
                    const isSelected = field.value === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => field.onChange(value)}
                        className={cn(
                          "relative flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3.5 text-center transition-all duration-200 cursor-pointer",
                          isSelected
                            ? "border-sky-500/60 bg-sky-500/10 text-white"
                            : "border-white/[0.07] bg-white/[0.02] text-zinc-500 hover:border-white/[0.12] hover:text-zinc-300",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5 transition-colors",
                            isSelected ? "text-sky-400" : "text-zinc-600",
                          )}
                        />
                        <span className="text-xs font-semibold leading-none">
                          {label}
                        </span>
                        <span className="text-[9px] leading-tight opacity-70 hidden sm:block">
                          {description}
                        </span>
                        {isSelected && (
                          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-sky-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>

          {/* Full name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-300 mb-1.5"
            >
              Full name
            </label>
            <input
              {...register("name")}
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Ikenna Okafor"
              className={cn(
                "w-full rounded-xl bg-white/[0.04] border px-4 py-3 text-sm text-white placeholder:text-zinc-600",
                "focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 transition-colors",
                errors.name
                  ? "border-red-500/50"
                  : "border-white/[0.08] hover:border-white/[0.14]",
              )}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="reg-email"
              className="block text-sm font-medium text-zinc-300 mb-1.5"
            >
              Email address
            </label>
            <input
              {...register("email")}
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={cn(
                "w-full rounded-xl bg-white/[0.04] border px-4 py-3 text-sm text-white placeholder:text-zinc-600",
                "focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 transition-colors",
                errors.email
                  ? "border-red-500/50"
                  : "border-white/[0.08] hover:border-white/[0.14]",
              )}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Phone (optional) */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-zinc-300 mb-1.5"
            >
              Phone{" "}
              <span className="text-zinc-600 font-normal">(optional)</span>
            </label>
            <input
              {...register("phone")}
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+2348012345678"
              className={cn(
                "w-full rounded-xl bg-white/[0.04] border px-4 py-3 text-sm text-white placeholder:text-zinc-600",
                "focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 transition-colors",
                errors.phone
                  ? "border-red-500/50"
                  : "border-white/[0.08] hover:border-white/[0.14]",
              )}
            />
            {errors.phone && (
              <p className="mt-1.5 text-xs text-red-400">{errors.phone.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="reg-password"
              className="block text-sm font-medium text-zinc-300 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                {...register("password")}
                id="reg-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a strong password"
                className={cn(
                  "w-full rounded-xl bg-white/[0.04] border px-4 py-3 pr-11 text-sm text-white placeholder:text-zinc-600",
                  "focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 transition-colors",
                  errors.password
                    ? "border-red-500/50"
                    : "border-white/[0.08] hover:border-white/[0.14]",
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <PasswordStrength password={password} />
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold mt-2",
              "bg-sky-500 text-white hover:bg-sky-400 active:scale-[0.98]",
              "focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:ring-offset-2 focus:ring-offset-[#09090b]",
              "transition-all duration-150 disabled:opacity-60 disabled:pointer-events-none",
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account…
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-zinc-700 leading-relaxed">
            By creating an account you agree to our{" "}
            <Link href={"#" as Route} className="underline hover:text-zinc-500 transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href={"#" as Route} className="underline hover:text-zinc-500 transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-xs text-zinc-700">or</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link
            href={"/login" as Route}
            className="text-sky-500 hover:text-sky-400 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
