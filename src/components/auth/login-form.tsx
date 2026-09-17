"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { extractErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import type { UserRole } from "@/types";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const ROLE_ROUTES: Record<UserRole, string> = {
  business: "/business",
  driver: "/driver",
  customer: "/customer",
};

function Field({
  label,
  error,
  action,
  children,
}: {
  label: string;
  error?: string | undefined;
  action?: React.ReactNode | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-stone-800">{label}</label>
        {action}
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

export function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await login(values.email, values.password);
      const role = useAuthStore.getState().user?.role ?? "customer";
      router.push(ROLE_ROUTES[role] as Route);
    } catch (err: unknown) {
      setServerError(extractErrorMessage(err));
    }
  };

  return (
    <section className="w-full max-w-3xl">
      <div className="motion-rise overflow-hidden rounded-md border border-stone-800 bg-[#101411] shadow-2xl shadow-black/30">
        <div className="grid md:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-stone-800 p-5 md:border-b-0 md:border-r md:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">
              Secure access
            </p>
            <h1 className="mt-4 max-w-sm text-3xl font-black leading-tight tracking-tight text-stone-100 sm:text-4xl">
              Welcome back
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-7 text-stone-400">
              Sign in to open the dashboard for your role and continue from the latest shipment state.
            </p>

            <div className="mt-6 border-l-2 border-amber-400 pl-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-300">
                Session route
              </p>
              <p className="mt-2 text-sm text-stone-300">
                Business, driver, and customer accounts are sent to their own workspace after sign in.
              </p>
            </div>
          </div>

          <div className="bg-[#f8f3e8] p-5 text-stone-950 sm:p-7">
            <div className="mb-6 flex items-center justify-between border-b border-stone-300 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">
                  Identity check
                </p>
                <p className="mt-1 text-sm font-semibold text-stone-800">Use your IsoTrack credentials.</p>
              </div>
              <span className="hidden rounded bg-teal-700/10 px-2.5 py-1 text-xs font-bold text-teal-800 sm:inline-flex">
                Encrypted
              </span>
            </div>

            {serverError && (
              <div className="mb-6 flex items-start gap-3 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <Field label="Email address" error={errors.email?.message}>
                <input
                  {...register("email")}
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  className={cn(
                    "h-12 w-full rounded border bg-white px-4 text-sm text-stone-950 outline-none transition",
                    "placeholder:text-stone-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-700/15",
                    errors.email ? "border-red-400" : "border-stone-300 hover:border-stone-500",
                  )}
                />
              </Field>

              <Field
                label="Password"
                error={errors.password?.message}
                action={
                  <Link href={"#" as Route} className="text-sm font-semibold text-teal-700 hover:text-teal-900">
                    Forgot password?
                  </Link>
                }
              >
                <div className="relative">
                  <input
                    {...register("password")}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className={cn(
                      "h-12 w-full rounded border bg-white px-4 pr-12 text-sm text-stone-950 outline-none transition",
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-stone-950 px-5 text-sm font-bold text-stone-100 shadow-sm transition hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-950/20 disabled:pointer-events-none disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-stone-300 pt-5 text-center text-sm text-stone-700">
              New to IsoTrack?{" "}
              <Link href={"/register" as Route} className="font-bold text-stone-950 hover:text-teal-700">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
