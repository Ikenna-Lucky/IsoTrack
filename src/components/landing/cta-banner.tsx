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
      className="border-t border-stone-800 bg-[#080806] py-16 sm:py-20 lg:py-28"
      ref={ref as unknown as React.RefObject<HTMLElement>}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div
          className="grid gap-8 rounded-md border border-amber-500/25 bg-[#f7f0df] p-6 text-stone-950 shadow-sm sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(18px)",
            transition: `opacity 0.55s ${SPRING}, transform 0.55s ${SPRING}`,
          }}
        >
          <div>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded border border-stone-300 bg-stone-950">
              <PackageSearch className="h-5 w-5 text-amber-300" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">
              Start with one shipment and follow the whole path.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-700 sm:text-base">
              Create a business account, add a delivery, assign a driver, and share the tracking
              link your customer can open without an account.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href={"/register" as Route}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-stone-950 px-5 py-3 text-sm font-bold text-stone-100 transition-colors hover:bg-stone-800"
            >
              Create shipment
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={"/track/IST-K7X2M9PQ" as Route}
              className="inline-flex items-center justify-center rounded-md border border-stone-300 bg-transparent px-5 py-3 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-100"
            >
              View sample tracking
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
