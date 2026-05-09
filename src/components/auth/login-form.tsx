"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

// ─── Schema ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Role → dashboard route map ───────────────────────────────────────────────

const ROLE_ROUTES: Record<UserRole, string> = {
  business: "/business",
  driver: "/driver",
  customer: "/customer",
};

// ─── Component ────────────────────────────────────────────────────────────────

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
      // After login the store has the user — redirect based on role
      const role = useAuthStore.getState().user?.role ?? "customer";
      router.push(ROLE_ROUTES[role] as Route);
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
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-sm text-zinc-500">
            Sign in to your IsoTrack account
          </p>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-400">
            {serverError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-300 mb-1.5"
            >
              Email address
            </label>
            <input
              {...register("email")}
              id="email"
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
              <p className="mt-1.5 text-xs text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-300"
              >
                Password
              </label>
              <Link
                href={"#" as Route}
                className="text-xs text-sky-500 hover:text-sky-400 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                {...register("password")}
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
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
              "w-full flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold",
              "bg-sky-500 text-white hover:bg-sky-400 active:scale-[0.98]",
              "focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:ring-offset-2 focus:ring-offset-[#09090b]",
              "transition-all duration-150 disabled:opacity-60 disabled:pointer-events-none",
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-xs text-zinc-700">or</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link
            href={"/register" as Route}
            className="text-sky-500 hover:text-sky-400 font-medium transition-colors"
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
