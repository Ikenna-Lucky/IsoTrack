"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  Eye,
  EyeOff,
  Loader2,
  PackageOpen,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { registrationInput, type RegistrationValues } from "@/lib/registration-input";
import { extractErrorMessage } from "@/lib/errors";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import type { UserRole } from "@/types";

const ROLE_ROUTES: Record<UserRole, string> = {
  business: "/business",
  driver: "/driver",
  customer: "/customer",
};
const ROLES = [
  { value: "customer", label: "Customer", detail: "Follow deliveries", Icon: PackageOpen },
  { value: "business", label: "Business", detail: "Manage your fleet", Icon: Building2 },
] as const;
const VEHICLES = [
  { value: "bike", label: "Bike" },
  { value: "car", label: "Car" },
  { value: "van", label: "Van" },
  { value: "truck", label: "Truck" },
] as const;
const inputStyle =
  "h-12 w-full rounded-md border bg-[var(--landing-panel)] px-3.5 text-base text-[var(--landing-ink)] outline-none transition-colors placeholder:text-[var(--landing-muted)] focus:border-[var(--landing-accent)] focus:ring-2 focus:ring-teal-500/15 sm:text-sm";
const linkStyle =
  "font-semibold text-[var(--landing-accent)] underline decoration-teal-500/30 underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-accent)]";

function Field({
  name,
  label,
  error,
  optional,
  children,
}: {
  name: string;
  label: string;
  error: string | undefined;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 flex items-baseline gap-2 text-sm font-medium text-[var(--landing-ink)]"
      >
        {label}
        {optional && (
          <span className="text-xs font-normal text-[var(--landing-muted)]">Optional</span>
        )}
      </label>
      {children}
      {error && (
        <p
          id={`${name}-error`}
          role="alert"
          className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-[var(--landing-danger)]"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export function RegisterForm({ invitation = false }: { invitation?: boolean }) {
  const router = useRouter();
  const registerUser = useAuthStore((s) => s.register);
  const [showPassword, setShowPassword] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationValues>({
    resolver: zodResolver(registrationInput(invitation)),
    defaultValues: { role: invitation ? "driver" : "customer" },
  });
  const selectedRole = watch("role");
  const selectedVehicle = watch("vehicleType");
  const fieldState = (name: keyof RegistrationValues) => ({
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby":
      name === "password"
        ? `password-hint${errors[name] ? " password-error" : ""}`
        : errors[name]
          ? `${name}-error`
          : undefined,
    className: cn(
      inputStyle,
      errors[name] ? "border-rose-500" : "border-[var(--landing-border)] hover:border-teal-500/40",
    ),
  });

  const onSubmit = async (values: RegistrationValues) => {
    setServerError(null);
    try {
      if (invitation) {
        await api.post("/driver-invitations/accept", {
          token: values.token,
          email: values.email,
          name: values.name,
          password: values.password,
          vehicleType: values.vehicleType,
          vehiclePlate: values.vehiclePlate,
        });
        router.replace("/login?joined=fleet" as Route);
        return;
      }
      if (values.role === "driver") return;
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        ...(values.phone ? { phone: values.phone } : {}),
        ...(values.role === "business" && values.businessName
          ? { businessName: values.businessName }
          : {}),
      });
      router.push(ROLE_ROUTES[values.role] as Route);
    } catch (err: unknown) {
      setServerError(extractErrorMessage(err));
    }
  };

  return (
    <section aria-labelledby="register-title">
      <h1
        id="register-title"
        className="text-3xl font-semibold leading-tight tracking-tight text-[var(--landing-ink)] sm:text-[40px]"
      >
        {invitation ? "Join your business fleet." : "Create your account."}
      </h1>
      <p className="mt-3 text-sm leading-7 text-[var(--landing-muted)]">
        {invitation
          ? "Use the token and email address from your business invitation. After joining, sign in to your driver workspace."
          : "Choose how you’ll use IsoTrack. Your workspace will be ready after you sign up."}
      </p>
      {serverError && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2.5 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-3 text-sm leading-6 text-[var(--landing-danger)]"
        >
          <AlertCircle aria-hidden="true" className="mt-1 size-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}
      <noscript>
        <p className="mt-5 text-sm text-[var(--landing-danger)]">
          Enable JavaScript in your browser to create an account or accept an invitation.
        </p>
      </noscript>
      <form method="post" onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
        {!invitation && (
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-[var(--landing-ink)]">
              Account type
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map(({ value, label, detail, Icon }) => (
                <label
                  key={value}
                  className={cn(
                    "relative flex cursor-pointer flex-col gap-2 rounded-md border p-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--landing-accent)] sm:flex-row sm:items-center sm:gap-3",
                    selectedRole === value
                      ? "border-teal-500/60 bg-teal-500/10"
                      : "border-[var(--landing-border)] bg-[var(--landing-panel)] hover:border-teal-500/40",
                  )}
                >
                  <input {...register("role")} type="radio" value={value} className="sr-only" />
                  <Icon
                    aria-hidden="true"
                    className="size-5 shrink-0 text-[var(--landing-accent)]"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-[var(--landing-ink)]">
                      {label}
                    </span>
                    <span className="mt-1 block text-[11px] text-[var(--landing-muted)]">
                      {detail}
                    </span>
                  </span>
                  {selectedRole === value && (
                    <Check
                      aria-hidden="true"
                      className="absolute right-2 top-2 size-3 text-[var(--landing-accent)]"
                    />
                  )}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {invitation && (
          <Field name="token" label="Invitation token" error={errors.token?.message}>
            <input
              {...register("token")}
              {...fieldState("token")}
              id="token"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="Token from your business"
            />
          </Field>
        )}
        <Field name="name" label="Full name" error={errors.name?.message}>
          <input
            {...register("name")}
            {...fieldState("name")}
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
          />
        </Field>
        <Field name="email" label="Email address" error={errors.email?.message}>
          <input
            {...register("email")}
            {...fieldState("email")}
            id="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={invitation ? "Email on your invitation" : "you@company.com"}
          />
        </Field>
        {selectedRole === "business" && (
          <Field name="businessName" label="Business name" error={errors.businessName?.message}>
            <input
              {...register("businessName")}
              {...fieldState("businessName")}
              id="businessName"
              type="text"
              autoComplete="organization"
              placeholder="Your business name"
            />
          </Field>
        )}
        {!invitation && (
          <Field name="phone" label="Phone number" optional error={errors.phone?.message}>
            <input
              {...register("phone")}
              {...fieldState("phone")}
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+2348012345678"
            />
          </Field>
        )}
        <Field name="password" label="Password" error={errors.password?.message}>
          <div className="relative">
            <input
              {...register("password")}
              {...fieldState("password")}
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a password"
              className={cn(fieldState("password").className, "pr-14")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute right-0.5 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-md text-[var(--landing-muted)] hover:text-[var(--landing-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-accent)]"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="size-4" />
              ) : (
                <Eye aria-hidden="true" className="size-4" />
              )}
            </button>
          </div>
          <p id="password-hint" className="mt-2 text-xs leading-5 text-[var(--landing-muted)]">
            At least 8 characters, including an uppercase letter and a number.
          </p>
        </Field>
        {invitation && (
          <>
            <fieldset aria-describedby={errors.vehicleType ? "vehicleType-error" : undefined}>
              <legend className="mb-2 text-sm font-medium text-[var(--landing-ink)]">
                Vehicle type
              </legend>
              <Controller
                name="vehicleType"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-4 gap-2">
                    {VEHICLES.map(({ value, label }) => (
                      <label
                        key={value}
                        className={cn(
                          "flex min-h-11 cursor-pointer items-center justify-center rounded-md border px-2 text-sm focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--landing-accent)]",
                          selectedVehicle === value
                            ? "border-teal-500/60 bg-teal-500/10 text-[var(--landing-accent)]"
                            : "border-[var(--landing-border)] bg-[var(--landing-panel)] text-[var(--landing-ink)]",
                        )}
                      >
                        <input
                          name={field.name}
                          ref={field.ref}
                          checked={field.value === value}
                          onChange={() => field.onChange(value)}
                          onBlur={field.onBlur}
                          type="radio"
                          value={value}
                          className="sr-only"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                )}
              />
              {errors.vehicleType && (
                <p
                  id="vehicleType-error"
                  role="alert"
                  className="mt-2 text-xs text-[var(--landing-danger)]"
                >
                  {errors.vehicleType.message}
                </p>
              )}
            </fieldset>
            <Field name="vehiclePlate" label="Plate number" error={errors.vehiclePlate?.message}>
              <input
                {...register("vehiclePlate")}
                {...fieldState("vehiclePlate")}
                id="vehiclePlate"
                type="text"
                placeholder="Your vehicle plate"
              />
            </Field>
          </>
        )}
        <button
          type="submit"
          disabled={!ready || isSubmitting}
          className="flex min-h-12 w-full items-center justify-center gap-3 rounded-md bg-amber-400 px-5 text-sm font-semibold text-[#152018] transition-colors hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-accent)] disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2
                aria-hidden="true"
                className="size-4 animate-spin motion-reduce:animate-none"
              />
              {invitation ? "Joining fleet…" : "Creating account…"}
            </>
          ) : (
            <>
              {invitation ? "Accept invitation" : "Create account"}
              <ArrowRight aria-hidden="true" className="size-4" />
            </>
          )}
        </button>
      </form>
      <p className="mt-5 text-sm leading-7 text-[var(--landing-muted)]">
        Already have an account?{" "}
        <Link href="/login" className={linkStyle}>
          Sign in
        </Link>
      </p>
      {!invitation && (
        <p className="mt-6 border-t border-[var(--landing-border)] pt-5 text-xs leading-6 text-[var(--landing-muted)]">
          Joining as a driver?{" "}
          <Link href="/join-fleet" className={linkStyle}>
            Use your business invitation
          </Link>
          .
        </p>
      )}
    </section>
  );
}
