"use client";

import {
  Bell,
  CreditCard,
  MapPinned,
  PackagePlus,
  Route,
  UserCheck,
} from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

const FEATURES = [
  {
    icon: PackagePlus,
    title: "Shipment creation in minutes",
    description:
      "Capture pickup, recipient, package weight, delivery area, and customer email. IsoTrack generates a shareable IST tracking code immediately.",
  },
  {
    icon: UserCheck,
    title: "Driver assignment with context",
    description:
      "See available drivers, vehicle details, ratings, and current status before assigning a shipment from the business dashboard.",
  },
  {
    icon: MapPinned,
    title: "Live location customers can trust",
    description:
      "Drivers broadcast location while active. Customers and dispatchers see the same route progress without calling support.",
  },
  {
    icon: Route,
    title: "Milestone timeline",
    description:
      "Pending, assigned, picked up, in transit, out for delivery, delivered, failed, and cancelled all map to clear customer-facing updates.",
  },
  {
    icon: CreditCard,
    title: "Payment status beside every order",
    description:
      "Paystack checkout and verification keep paid and unpaid shipments visible to the teams that need to act on them.",
  },
  {
    icon: Bell,
    title: "Notifications at the right moments",
    description:
      "Status changes can trigger email, SMS, and dashboard notifications so customers hear from the system before they chase the business.",
  },
] as const;

const SPRING = "cubic-bezier(0.22,1,0.36,1)";

export function Features() {
  const { ref, inView } = useInView({ threshold: 0.08, rootMargin: "0px 0px -60px 0px" });

  return (
    <section id="features" className="bg-white py-16 sm:py-20 lg:py-28" ref={ref as unknown as React.RefObject<HTMLElement>}>
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div
          className="mb-10 max-w-2xl lg:mb-14"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(18px)",
            transition: `opacity 0.55s ${SPRING}, transform 0.55s ${SPRING}`,
          }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sky-700">
            Operations
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            The daily delivery loop, covered end to end.
          </h2>
          <p className="mt-4 leading-7 text-slate-600">
            IsoTrack is built around the handoffs that usually create support calls:
            payment, driver assignment, location updates, and delivery exceptions.
          </p>
        </div>

        <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-slate-200 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              className="border-b border-slate-200 bg-white p-5 transition-colors hover:bg-slate-50 sm:[&:nth-child(odd)]:border-r lg:border-r lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(n+4)]:border-b-0"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(18px)",
                transition: `opacity 0.4s ${SPRING} ${index * 55}ms, transform 0.4s ${SPRING} ${index * 55}ms, background-color 0.2s ease`,
              }}
            >
              <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50">
                <Icon className="h-4 w-4 text-sky-700" />
              </div>
              <h3 className="text-base font-semibold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
