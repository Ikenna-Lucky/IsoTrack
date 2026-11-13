"use client";
import type { ReactNode } from "react";

export const workspacePanel =
  "rounded-xl border border-[var(--landing-border)] bg-[var(--landing-panel)]";
export const workspaceButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--landing-border)] px-4 py-2 text-sm font-semibold text-[var(--landing-ink)] hover:bg-[var(--landing-tint)] disabled:opacity-50";
export const workspaceField =
  "min-h-12 w-full min-w-0 rounded-md border border-[var(--landing-border)] bg-[var(--landing-field)] px-3 py-3 text-sm text-[var(--landing-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-accent)]";
export function WorkspaceHeading({
  eyebrow,
  title,
  children,
  action,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        <p className="mb-2 text-sm text-[var(--landing-muted)]">{eyebrow}</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
          <span className="text-[var(--landing-accent)]">.</span>
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--landing-muted)]">{children}</p>
      </div>
      {action}
    </header>
  );
}
export function WorkspaceReadState({
  pending,
  error,
  retry,
  children,
}: {
  pending: boolean;
  error: boolean;
  retry: () => void;
  children?: ReactNode;
}) {
  if (pending)
    return (
      <p role="status" className="py-8 text-sm text-[var(--landing-muted)]">
        Loading your records...
      </p>
    );
  return (
    <>
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-[var(--landing-danger)] p-4 text-sm text-[var(--landing-danger)]"
        >
          Could not refresh these records.{" "}
          {children ? "Previously loaded records remain below." : "No figures are available yet."}
          <button onClick={retry} className="ml-2 min-h-11 underline">
            Try again
          </button>
        </div>
      )}
      {children}
    </>
  );
}
