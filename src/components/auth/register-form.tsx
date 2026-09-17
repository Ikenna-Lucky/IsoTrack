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
        <label className="text-sm font-semibold text-stone-800">{label}</label>
        {hint && <span className="text-xs font-medium text-stone-500">{hint}</span>}
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
    <section className="w-full max-w-4xl">
      <div className="motion-rise overflow-hidden rounded-md border border-stone-800 bg-[#101411] shadow-2xl shadow-black/30">
        <div className="border-b border-stone-800 p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">
            Create account
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="max-w-xl text-3xl font-black leading-tight tracking-tight text-stone-100 sm:text-4xl">
                Start with the workspace you need.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-400">
                Choose whether you are tracking a delivery, running deliveries, or managing the dispatch board.
              </p>
            </div>
            <Link href={"/login" as Route} className="text-sm font-semibold text-stone-400 hover:text-amber-300">
              Already have an account?
            </Link>
          </div>
        </div>

        <div className="bg-[#f8f3e8] p-5 text-stone-950 sm:p-7">
          {serverError && (
            <div className="mb-6 flex items-start gap-3 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            <Field label="Account type">
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    {ROLES.map(({ value, label, sublabel, icon: Icon }) => {
                      const active = field.value === value;
                      return (
                        <label
                          key={value}
                          className={cn(
                            "flex min-h-20 cursor-pointer items-center gap-3 rounded border px-4 py-3 transition focus-within:ring-4 focus-within:ring-teal-700/15",
                            active
                              ? "border-teal-700 bg-teal-700/10 text-stone-950"
                              : "border-stone-300 bg-white text-stone-700 hover:border-stone-500",
                          )}
                        >
                          <input
                            type="radio"
                            value={value}
                            checked={active}
                            onChange={() => field.onChange(value)}
                            className="sr-only"
                          />
                          <span
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded",
                              active ? "bg-teal-700 text-stone-50" : "bg-stone-200 text-stone-600",
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-bold">{label}</span>
                            <span className="block text-xs font-medium text-stone-500">{sublabel}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              />
            </Field>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-5">
                <div className="border-b border-stone-300 pb-2">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
                    Identity
                  </p>
                </div>

                <Field label="Full name" error={errors.name?.message}>
                  <input
                    {...register("name")}
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Ikenna Okafor"
                    className={cn(
                      "h-12 w-full rounded border bg-white px-4 text-sm text-stone-950 shadow-sm outline-none transition",
                      "placeholder:text-stone-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-700/15",
                      errors.name ? "border-red-400" : "border-stone-300 hover:border-stone-500",
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
                      "h-12 w-full rounded border bg-white px-4 text-sm text-stone-950 shadow-sm outline-none transition",
                      "placeholder:text-stone-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-700/15",
                      errors.email ? "border-red-400" : "border-stone-300 hover:border-stone-500",
                    )}
                  />
                </Field>

                <Field label="Phone number" hint="optional" error={errors.phone?.message}>
                  <input
                    {...register("phone")}
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+2348012345678"
                    className={cn(
                      "h-12 w-full rounded border bg-white px-4 text-sm text-stone-950 shadow-sm outline-none transition",
                      "placeholder:text-stone-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-700/15",
                      errors.phone ? "border-red-400" : "border-stone-300 hover:border-stone-500",
                    )}
                  />
                </Field>
              </div>

              <div className="space-y-5">
                <div className="border-b border-stone-300 pb-2">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
                    Access details
                  </p>
                </div>

                <Field label="Password" error={errors.password?.message}>
                  <div className="relative">
                    <input
                      {...register("password")}
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      className={cn(
                        "h-12 w-full rounded border bg-white px-4 pr-12 text-sm text-stone-950 shadow-sm outline-none transition",
                        "placeholder:text-stone-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-700/15",
                        errors.password ? "border-red-400" : "border-stone-300 hover:border-stone-500",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-stone-500 transition hover:bg-stone-200 hover:text-stone-900"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>

                {selectedRole === "business" && (
                  <Field label="Business name" error={errors.businessName?.message}>
                    <input
                      {...register("businessName")}
                      id="businessName"
                      type="text"
                      autoComplete="organization"
                      placeholder="SwiftCargo Ltd"
                      className={cn(
                        "h-12 w-full rounded border bg-white px-4 text-sm text-stone-950 shadow-sm outline-none transition",
                        "placeholder:text-stone-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-700/15",
                        errors.businessName ? "border-red-400" : "border-stone-300 hover:border-stone-500",
                      )}
                    />
                  </Field>
                )}

                {selectedRole === "driver" && (
                  <div className="grid gap-5 sm:grid-cols-[1fr_1.15fr] lg:grid-cols-1 xl:grid-cols-[1fr_1.15fr]">
                    <Field label="Vehicle type" error={errors.vehicleType?.message}>
                      <Controller
                        name="vehicleType"
                        control={control}
                        render={({ field }) => (
                          <div className="grid grid-cols-2 gap-2">
                            {VEHICLES.map(({ value, label, icon: Icon }) => {
                              const active = field.value === value;
                              return (
                                <label
                                  key={value}
                                  className={cn(
                                    "flex h-12 cursor-pointer items-center justify-center gap-2 rounded border text-sm font-semibold transition focus-within:ring-4 focus-within:ring-teal-700/15",
                                    active
                                      ? "border-teal-700 bg-teal-700/10 text-teal-800"
                                      : "border-stone-300 bg-white text-stone-700 hover:border-stone-500",
                                  )}
                                >
                                  <input
                                    type="radio"
                                    value={value}
                                    checked={active}
                                    onChange={() => field.onChange(value)}
                                    className="sr-only"
                                  />
                                  <Icon className="h-4 w-4" />
                                  {label}
                                </label>
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
                          "h-12 w-full rounded border bg-white px-4 text-sm uppercase text-stone-950 shadow-sm outline-none transition",
                          "placeholder:text-stone-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-700/15",
                          errors.vehiclePlate ? "border-red-400" : "border-stone-300 hover:border-stone-500",
                        )}
                      />
                    </Field>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-3 border-t border-stone-300 pt-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <p className="text-sm text-stone-600">
                Already have an account?{" "}
                <Link href={"/login" as Route} className="font-bold text-stone-950 hover:text-teal-700">
                  Sign in
                </Link>
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 items-center justify-center gap-2 rounded-md bg-stone-950 px-6 text-sm font-bold text-stone-100 shadow-sm transition hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-950/20 disabled:pointer-events-none disabled:opacity-60"
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
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
