"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowRight,
  Bike,
  Building2,
  Car,
  Eye,
  EyeOff,
  Loader2,
  PackageOpen,
  Truck,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { extractErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import type { UserRole } from "@/types";
import { Logo } from "@/components/shared/logo";

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
      .regex(/^\+?[1-9]\d{6,14}$/, "Enter a valid number, e.g. +2348012345678")
      .optional()
      .or(z.literal("")),
    businessName: z.string().min(2, "Business name must be at least 2 characters").max(100).optional(),
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

const ROLE_ROUTES: Record<UserRole, string> = {
  business: "/business",
  driver: "/driver",
  customer: "/customer",
};

const ROLES: {
  value: UserRole;
  label: string;
  sublabel: string;
  icon: React.ElementType;
}[] = [
  { value: "customer", label: "Customer", sublabel: "Track deliveries", icon: PackageOpen },
  { value: "business", label: "Business", sublabel: "Manage shipments", icon: Building2 },
  { value: "driver", label: "Driver", sublabel: "Run deliveries", icon: Truck },
];

const VEHICLES = [
  { value: "bike", label: "Bike", icon: Bike },
  { value: "car", label: "Car", icon: Car },
  { value: "van", label: "Van", icon: PackageOpen },
  { value: "truck", label: "Truck", icon: Truck },
] as const;

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-slate-800">{label}</label>
        {hint && <span className="text-xs font-medium text-slate-500">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const registerUser = useAuthStore((s) => s.register);

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

  const selectedRole = watch("role");

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        ...(values.phone ? { phone: values.phone } : {}),
        ...(values.role === "business" && values.businessName ? { businessName: values.businessName } : {}),
        ...(values.role === "driver" && values.vehicleType ? { vehicleType: values.vehicleType } : {}),
        ...(values.role === "driver" && values.vehiclePlate ? { vehiclePlate: values.vehiclePlate } : {}),
      });
      router.push(ROLE_ROUTES[values.role] as Route);
    } catch (err: unknown) {
      setServerError(extractErrorMessage(err));
    }
  };

  return (
    <div className="w-full max-w-[600px] py-2">
      <div className="mb-6 flex items-center justify-between lg:hidden">
        <Logo href="/" size={32} tone="dark" />
        <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-950">
          Home
        </Link>
      </div>

      <div className="motion-rise rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70 sm:p-7">
        <div className="mb-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">
            Create account
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">
            Start tracking deliveries
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
            Choose the account type that matches how you use IsoTrack. You can update details later.
          </p>
        </div>

        {serverError && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Field label="Account type">
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {ROLES.map(({ value, label, sublabel, icon: Icon }) => {
                  const active = field.value === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      className={cn(
                        "flex min-h-16 items-center gap-3 rounded-lg border px-4 py-3 text-left transition focus:outline-none focus:ring-4 focus:ring-teal-100",
                        active
                          ? "border-teal-600 bg-teal-50 text-slate-950"
                          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
                          active ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-sm font-bold">{label}</span>
                        <span className="block text-xs font-medium text-slate-500">{sublabel}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" error={errors.name?.message}>
            <input
              {...register("name")}
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Ikenna Okafor"
              className={cn(
                "h-12 w-full rounded-lg border bg-white px-4 text-sm text-slate-950 shadow-sm outline-none transition",
                "placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100",
                errors.name ? "border-red-300" : "border-slate-300 hover:border-slate-400",
              )}
            />
          </Field>

          <Field label="Email address" error={errors.email?.message}>
            <input
              {...register("email")}
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              className={cn(
                "h-12 w-full rounded-lg border bg-white px-4 text-sm text-slate-950 shadow-sm outline-none transition",
                "placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100",
                errors.email ? "border-red-300" : "border-slate-300 hover:border-slate-400",
              )}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Phone number" hint="optional" error={errors.phone?.message}>
            <input
              {...register("phone")}
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+2348012345678"
              className={cn(
                "h-12 w-full rounded-lg border bg-white px-4 text-sm text-slate-950 shadow-sm outline-none transition",
                "placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100",
                errors.phone ? "border-red-300" : "border-slate-300 hover:border-slate-400",
              )}
            />
          </Field>

          <Field label="Password" error={errors.password?.message}>
            <div className="relative">
              <input
                {...register("password")}
                id="reg-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className={cn(
                  "h-12 w-full rounded-lg border bg-white px-4 pr-12 text-sm text-slate-950 shadow-sm outline-none transition",
                  "placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100",
                  errors.password ? "border-red-300" : "border-slate-300 hover:border-slate-400",
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>
        </div>

        {selectedRole === "business" && (
          <Field label="Business name" error={errors.businessName?.message}>
            <input
              {...register("businessName")}
              id="businessName"
              type="text"
              autoComplete="organization"
              placeholder="SwiftCargo Ltd"
              className={cn(
                "h-12 w-full rounded-lg border bg-white px-4 text-sm text-slate-950 shadow-sm outline-none transition",
                "placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100",
                errors.businessName ? "border-red-300" : "border-slate-300 hover:border-slate-400",
              )}
            />
          </Field>
        )}

        {selectedRole === "driver" && (
          <div className="grid gap-5 sm:grid-cols-[1fr_1.15fr]">
            <Field label="Vehicle type" error={errors.vehicleType?.message}>
              <Controller
                name="vehicleType"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2">
                    {VEHICLES.map(({ value, label, icon: Icon }) => {
                      const active = field.value === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => field.onChange(value)}
                          className={cn(
                            "flex h-12 items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-teal-100",
                            active
                              ? "border-teal-600 bg-teal-50 text-teal-800"
                              : "border-slate-300 bg-white text-slate-700 hover:border-slate-400",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {label}
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
                placeholder="LND 123 XA"
                className={cn(
                  "h-12 w-full rounded-lg border bg-white px-4 text-sm uppercase text-slate-950 shadow-sm outline-none transition",
                  "placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100",
                  errors.vehiclePlate ? "border-red-300" : "border-slate-300 hover:border-slate-400",
                )}
              />
            </Field>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:pointer-events-none disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

          <div className="border-t border-slate-200 pt-5 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href={"/login" as Route} className="font-bold text-slate-950 hover:text-teal-700">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
