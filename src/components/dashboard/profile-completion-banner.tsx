"use client";

import Link from "next/link";
import type { Route } from "next";
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
    <div className="mb-6 overflow-hidden rounded-md border border-white/[0.07] bg-[#0d1412]">
      <div className="h-0.5 bg-white/[0.04]">
        <div
          className="h-full bg-teal-300 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md border border-teal-400/20 bg-teal-400/10 sm:flex">
            <ShieldCheck className="h-4 w-4 text-teal-200" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-teal-200 sm:hidden" />
              <p className="text-sm font-black leading-tight text-stone-100">
                Complete your profile
              </p>
              <span className="hidden items-center gap-1 rounded border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] font-black text-stone-500 md:inline-flex">
                {completedCount}/{totalCount}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] leading-snug text-stone-500">
              <span className="sm:hidden">
                {remaining.length} field{remaining.length !== 1 ? "s" : ""} needed for support &amp; tracking
              </span>
              <span className="hidden sm:inline">
                {remaining.length} detail{remaining.length !== 1 ? "s" : ""} still needed for support and delivery tracking
              </span>
            </p>
          </div>

          <Link
            href={settingsPath as Route}
            className="flex shrink-0 items-center gap-1.5 rounded-md bg-amber-400 px-3 py-2 text-[12px] font-black text-stone-950 transition hover:bg-amber-300"
          >
            <span className="sm:hidden">Fix</span>
            <span className="hidden sm:inline">Go to settings</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-3 space-y-1.5">
          {remaining.map((item) => (
            <div
              key={item.key}
              className="flex items-start gap-3 rounded-md border border-white/[0.07] bg-white/[0.03] px-3 py-2.5"
            >
              <div className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-amber-500/50 bg-amber-500/10" />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold leading-tight text-stone-300">
                  {item.label}
                </p>
                <p className="mt-0.5 hidden text-[10px] leading-snug text-stone-600 sm:block">
                  {item.description}
                </p>
              </div>
            </div>
          ))}

          {done.length > 0 && (
            <>
              <div className="flex items-center gap-2 px-1 pt-0.5 sm:hidden">
                <CheckCircle2 className="h-3 w-3 text-emerald-500/50 shrink-0" />
                <p className="text-[10px] text-stone-700">
                  {done.length} field{done.length !== 1 ? "s" : ""} already complete
                </p>
              </div>

              <div className="hidden flex-wrap gap-x-4 gap-y-1 px-1 pt-0.5 sm:flex">
                {done.map((item) => (
                  <div key={item.key} className="flex items-center gap-1.5 opacity-35">
                    <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />
                    <p className={cn("text-[11px] font-bold text-stone-500 line-through")}>
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
