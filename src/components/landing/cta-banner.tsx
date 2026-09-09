"use client";

import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, PackageSearch } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

const SPRING = "cubic-bezier(0.22,1,0.36,1)";

export function CtaBanner() {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <section
      className="border-t border-slate-200 bg-slate-50 py-16 sm:py-20 lg:py-28"
      ref={ref as unknown as React.RefObject<HTMLElement>}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div
          className="grid gap-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(18px)",
            transition: `opacity 0.55s ${SPRING}, transform 0.55s ${SPRING}`,
          }}
        >
          <div>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-slate-50">
              <PackageSearch className="h-5 w-5 text-sky-700" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Start with one shipment and follow the whole path.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Create a business account, add a delivery, assign a driver, and share the tracking
              link your customer can open without an account.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href={"/register" as Route}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
            >
              Create shipment
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={"/track/IST-K7X2M9PQ" as Route}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              View sample tracking
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
