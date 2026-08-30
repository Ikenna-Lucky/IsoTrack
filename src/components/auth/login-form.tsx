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
import { Logo } from "@/components/shared/logo";

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
        <label className="text-sm font-semibold text-slate-800">{label}</label>
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
    <div className="w-full max-w-[460px]">
      <div className="mb-6 flex items-center justify-between lg:hidden">
        <Logo href="/" size={32} tone="dark" />
        <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-950">
          Home
        </Link>
      </div>

      <div className="motion-rise rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70 sm:p-7">
        <div className="mb-7">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">
            Secure access
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">
            Welcome back
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            Sign in to manage shipments, monitor drivers, and confirm delivery activity.
          </p>
        </div>

        {serverError && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
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
                "h-12 w-full rounded-lg border bg-white px-4 text-sm text-slate-950 outline-none transition",
                "placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100",
                errors.email ? "border-red-300" : "border-slate-300 hover:border-slate-400",
              )}
            />
          </Field>

          <Field
            label="Password"
            error={errors.password?.message}
            action={
              <Link href={"#" as Route} className="text-sm font-semibold text-teal-700 hover:text-teal-800">
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
                  "h-12 w-full rounded-lg border bg-white px-4 pr-12 text-sm text-slate-950 outline-none transition",
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:pointer-events-none disabled:opacity-60"
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

        <div className="mt-7 border-t border-slate-200 pt-6 text-center text-sm text-slate-600">
          New to IsoTrack?{" "}
          <Link href={"/register" as Route} className="font-bold text-slate-950 hover:text-teal-700">
            Create an account
          </Link>
        </div>
      </div>

      <p className="mt-5 text-center text-xs font-medium text-slate-500">
        Protected access for delivery teams and customers.
      </p>
    </div>
  );
}
