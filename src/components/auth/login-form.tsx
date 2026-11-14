"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { extractErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { loginDestination } from "@/lib/auth-routing";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const inputStyle =
  "h-12 w-full rounded-md border bg-[var(--landing-panel)] px-3.5 text-base text-[var(--landing-ink)] outline-none transition-colors placeholder:text-[var(--landing-muted)] focus:border-[var(--landing-accent)] focus:ring-2 focus:ring-teal-500/15 sm:text-sm";

function FieldError({ id, message }: { id: string; message: string | undefined }) {
  return message ? (
    <p
      id={id}
      role="alert"
      className="mt-2 flex items-center gap-1.5 text-xs leading-5 text-[var(--landing-danger)]"
    >
      <AlertCircle aria-hidden="true" className="size-3.5 shrink-0" />
      {message}
    </p>
  ) : null;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await login(values.email, values.password);
      const role = useAuthStore.getState().user?.role ?? "customer";
      router.replace(loginDestination(searchParams.get("next"), role) as Route);
    } catch (err: unknown) {
      setServerError(extractErrorMessage(err));
    }
  };

  return (
    <section aria-labelledby="sign-in-title">
      <h1
        id="sign-in-title"
        className="text-4xl font-semibold leading-tight tracking-tight text-[var(--landing-ink)] sm:text-[44px]"
      >
        Welcome back.
      </h1>
      <p className="mt-4 max-w-sm text-base leading-7 text-[var(--landing-muted)]">
        Sign in to manage your deliveries or follow your shipments.
      </p>
      {searchParams.get("joined") === "fleet" && (
        <p
          role="status"
          className="mt-6 rounded-md border border-teal-500/30 bg-teal-500/10 p-3 text-sm leading-6 text-[var(--landing-accent)]"
        >
          Fleet joined. Sign in with the email and password you just used.
        </p>
      )}
      {serverError && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-2.5 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-3 text-sm leading-6 text-[var(--landing-danger)]"
        >
          <AlertCircle aria-hidden="true" className="mt-1 size-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}
      <noscript>
        <p className="mt-5 text-sm text-[var(--landing-danger)]">
          Enable JavaScript in your browser to sign in.
        </p>
      </noscript>
      <form method="post" onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-[var(--landing-ink)]"
          >
            Email address
          </label>
          <input
            {...register("email")}
            id="email"
            type="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="you@company.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={cn(
              inputStyle,
              errors.email
                ? "border-rose-500"
                : "border-[var(--landing-border)] hover:border-teal-500/40",
            )}
          />
          <FieldError id="email-error" message={errors.email?.message} />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-[var(--landing-ink)]"
          >
            Password
          </label>
          <div className="relative">
            <input
              {...register("password")}
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              className={cn(
                inputStyle,
                "pr-14",
                errors.password
                  ? "border-rose-500"
                  : "border-[var(--landing-border)] hover:border-teal-500/40",
              )}
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
          <FieldError id="password-error" message={errors.password?.message} />
        </div>
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
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight aria-hidden="true" className="size-4" />
            </>
          )}
        </button>
      </form>
      <Link
        href="/forgot-password"
        className="mt-4 inline-flex min-h-11 items-center text-sm text-[var(--landing-accent)] underline"
      >
        Forgot password?
      </Link>
      <Link
        href="/verify-email"
        className="ml-5 inline-flex min-h-11 items-center text-sm text-[var(--landing-accent)] underline"
      >
        Verify email
      </Link>
      <p className="mt-6 text-sm leading-7 text-[var(--landing-muted)]">
        New to IsoTrack?{" "}
        <Link
          href="/register"
          className="inline-flex min-h-8 items-center font-semibold text-[var(--landing-accent)] underline decoration-teal-500/30 underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-accent)]"
        >
          Create an account
        </Link>
      </p>
    </section>
  );
}
