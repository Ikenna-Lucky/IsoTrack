"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProfileCompletion } from "@/hooks/use-profile-completion";

interface Props {
  completion: ProfileCompletion;
}

export function ProfileCompletionBanner({ completion }: Props) {
  const { items, completedCount, totalCount, percentage, isComplete, settingsPath, isLoading } =
    completion;

  if (isLoading || isComplete) return null;

  const remaining = items.filter((i) => !i.done);
  const done      = items.filter((i) => i.done);

  return (
    <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">

      {/* Progress bar — top accent */}
      <div className="h-0.5 bg-white/[0.04]">
        <div
          className="h-full bg-sky-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="px-4 sm:px-5 py-4">

        {/* ── Header ── */}
        <div className="flex items-center gap-3">
          {/* Icon — hidden on very small screens to save space */}
          <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20">
            <ShieldCheck className="h-4 w-4 text-sky-400" />
          </div>

          {/* Title + subtitle */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {/* Icon on mobile — inline with title */}
              <ShieldCheck className="sm:hidden h-3.5 w-3.5 shrink-0 text-sky-400" />
              <p className="text-sm font-semibold text-white leading-tight">
                Complete your profile
              </p>
              {/* Progress pill — desktop only */}
              <span className="hidden md:inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                {completedCount}/{totalCount}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
              {/* Shorter text on mobile */}
              <span className="sm:hidden">
                {remaining.length} field{remaining.length !== 1 ? "s" : ""} needed for support &amp; tracking
              </span>
              <span className="hidden sm:inline">
                {remaining.length} detail{remaining.length !== 1 ? "s" : ""} still needed — required for support and delivery tracking
              </span>
            </p>
          </div>

          {/* CTA button */}
          <Link
            href={settingsPath}
            className="shrink-0 flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 transition-colors px-3 py-2 text-[12px] font-semibold text-white"
          >
            {/* Label varies by screen size */}
            <span className="sm:hidden">Fix</span>
            <span className="hidden sm:inline">Go to settings</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* ── Checklist ── */}
        <div className="mt-3 space-y-1.5">
          {/* Incomplete items — always show */}
          {remaining.map((item) => (
            <div
              key={item.key}
              className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
            >
              <div className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-amber-500/50 bg-amber-500/10" />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-zinc-300 leading-tight">
                  {item.label}
                </p>
                {/* Description — hide on mobile to keep rows compact */}
                <p className="hidden sm:block text-[10px] text-zinc-600 mt-0.5 leading-snug">
                  {item.description}
                </p>
              </div>
            </div>
          ))}

          {/* Completed items — collapse to a single summary line on mobile */}
          {done.length > 0 && (
            <>
              {/* Mobile: one compact summary row */}
              <div className="sm:hidden flex items-center gap-2 px-1 pt-0.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-500/50 shrink-0" />
                <p className="text-[10px] text-zinc-700">
                  {done.length} field{done.length !== 1 ? "s" : ""} already complete
                </p>
              </div>

              {/* Desktop: individual struck-through rows */}
              <div className="hidden sm:flex flex-wrap gap-x-4 gap-y-1 px-1 pt-0.5">
                {done.map((item) => (
                  <div key={item.key} className="flex items-center gap-1.5 opacity-35">
                    <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />
                    <p className={cn("text-[11px] font-medium text-zinc-500 line-through")}>
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
