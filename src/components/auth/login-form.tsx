"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, MoveRight, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import { extractErrorMessage } from "@/lib/errors";
import type { UserRole } from "@/types";

// ─── Schema ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Role → dashboard route ───────────────────────────────────────────────────

const ROLE_ROUTES: Record<UserRole, string> = {
  business: "/business",
  driver: "/driver",
  customer: "/customer",
};

// ─── Reusable field wrapper ───────────────────────────────────────────────────

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
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-medium text-zinc-400">{label}</label>
        {action}
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
      const role = useAuthStore.getState().user?.role ?? "customer";
      router.push(ROLE_ROUTES[role] as Route);
    } catch (err: unknown) {
      setServerError(extractErrorMessage(err));
    }
  };

  // Stagger helper
  const slide = (delay: string) => ({
    animation: `authSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) ${delay} both`,
  });

  return (
    <>
      <style>{`
        @keyframes authSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="w-full max-w-[420px]">
        {/* Mobile-only logo */}
        <div className="lg:hidden mb-10 flex justify-center" style={slide("0s")}>
          <Logo size={30} />
        </div>

        {/* Heading */}
        <div className="mb-9" style={slide("0s")}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-500 mb-3">
            Sign in
          </p>
          <h1 className="text-[2.1rem] font-bold leading-tight tracking-tight text-white">
            Back on the map.
          </h1>
          <p className="mt-3 text-[13.5px] text-zinc-500 leading-relaxed">
            Your dashboard is waiting. Enter your credentials to continue.
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

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email */}
          <div style={slide("0.1s")}>
            <Field label="Email address" error={errors.email?.message}>
              <input
                {...register("email")}
                id="email"
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

          {/* Password */}
          <div className="mt-5" style={slide("0.18s")}>
            <Field
              label="Password"
              error={errors.password?.message}
              action={
                <Link
                  href={"#" as Route}
                  className="text-[11px] text-zinc-600 hover:text-sky-400 transition-colors"
                >
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
                    "w-full rounded-xl border bg-white/[0.03] px-4 py-3 pr-12 text-sm text-white placeholder:text-zinc-700",
                    "focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/40",
                    "transition-all duration-200",
                    errors.password
                      ? "border-red-500/40 bg-red-500/[0.02]"
                      : "border-white/[0.07] hover:border-white/[0.12]",
                  )}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-700 hover:text-zinc-400 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
          </div>

          {/* Submit */}
          <div className="mt-7" style={slide("0.26s")}>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "group relative w-full overflow-hidden rounded-xl px-5 py-3.5 text-sm font-semibold text-white",
                "transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
                "focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:ring-offset-2 focus:ring-offset-[#09090b]",
              )}
              style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 60%, #0369a1 100%)",
                boxShadow: "0 0 0 1px rgba(14,165,233,0.25), 0 6px 24px rgba(14,165,233,0.18)",
              }}
            >
              {/* Hover shimmer layer */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 60%, #0284c7 100%)",
                }}
              />
              <span className="relative flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in to IsoTrack
                    <MoveRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </span>
            </button>
          </div>
        </form>

        {/* Switch to register */}
        <div className="mt-8" style={slide("0.34s")}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/[0.05]" />
            <span className="text-[11px] text-zinc-700">New here?</span>
            <div className="flex-1 h-px bg-white/[0.05]" />
          </div>
          <Link
            href={"/register" as Route}
            className={cn(
              "flex items-center justify-center gap-2 w-full rounded-xl border border-white/[0.07] px-5 py-3 text-sm font-medium text-zinc-400",
              "hover:border-white/[0.12] hover:text-white hover:bg-white/[0.03]",
              "transition-all duration-200",
            )}
          >
            Create a free account
            <MoveRight className="h-3.5 w-3.5 opacity-60" />
          </Link>
        </div>

        {/* Legal */}
        <p className="mt-8 text-center text-[11px] text-zinc-700" style={slide("0.4s")}>
          © {new Date().getFullYear()} IsoTrack · Personal portfolio project
        </p>
      </div>
    </>
  );
}
