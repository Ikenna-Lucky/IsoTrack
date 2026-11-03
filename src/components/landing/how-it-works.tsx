"use client";

import { ArrowRight, CreditCard, PackagePlus, Radio, UserCheck } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

const STEPS = [
  {
    icon: PackagePlus,
    label: "Create",
    title: "Log the job once",
    description:
      "A business enters pickup, drop-off, recipient email, package details, and amount. The customer receives one tracking code.",
  },
  {
    icon: UserCheck,
    label: "Assign",
    title: "Put a driver on it",
    description:
      "Dispatch sees driver availability and assigns the delivery. The shipment moves from pending into the active delivery queue.",
  },
  {
    icon: Radio,
    label: "Track",
    title: "Keep everyone in sync",
    description:
      "Driver status and location updates feed the business dashboard, customer dashboard, and public tracking page.",
  },
  {
    icon: CreditCard,
    label: "Settle",
    title: "Verify payment cleanly",
    description:
      "Stripe checkout and backend verification keep payment state attached to the shipment record.",
  },
] as const;

const SPRING = "cubic-bezier(0.22,1,0.36,1)";

export function HowItWorks() {
  const { ref, inView } = useInView({ threshold: 0.08, rootMargin: "0px 0px -60px 0px" });

  return (
    <section
      id="how-it-works"
      className="border-y border-stone-800 bg-[#080806] py-16 sm:py-20 lg:py-28"
      ref={ref as unknown as React.RefObject<HTMLElement>}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div
          className="mb-10 max-w-2xl"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(18px)",
            transition: `opacity 0.55s ${SPRING}, transform 0.55s ${SPRING}`,
          }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-300">
            Workflow
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-stone-100 sm:text-4xl">
            One shipment record from dispatch to delivery.
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, label, title, description }, index) => (
            <div
              key={label}
              className="relative rounded-md border border-stone-800 bg-[#0c0b08] p-5 shadow-sm"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(18px)",
                transition: `opacity 0.4s ${SPRING} ${index * 70}ms, transform 0.4s ${SPRING} ${index * 70}ms`,
              }}
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
                  {label}
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded border border-amber-500/25 bg-amber-400/10">
                  <Icon className="h-4 w-4 text-amber-300" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-stone-100">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-400">{description}</p>
              {index < STEPS.length - 1 && (
                <ArrowRight className="absolute -right-3 top-10 hidden h-5 w-5 text-stone-600 lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
