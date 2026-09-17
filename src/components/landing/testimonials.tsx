"use client";

import { Building2, Headphones, MapPinned, UserRound } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

const ROLES = [
  {
    icon: Building2,
    title: "Dispatch teams",
    description:
      "Create shipments, monitor open jobs, assign drivers, cancel pending work, and check payment state without moving between spreadsheets and chats.",
    points: ["Shipment table", "Driver assignment", "Business analytics"],
  },
  {
    icon: MapPinned,
    title: "Drivers",
    description:
      "Drivers see active deliveries, update milestones, broadcast location while on a job, and keep earnings visible from the same dashboard.",
    points: ["Active delivery", "Status updates", "Earnings view"],
  },
  {
    icon: UserRound,
    title: "Customers",
    description:
      "Customers can follow a delivery from tracking ID to doorstep, view their shipment history, and pay through a dedicated tracking flow.",
    points: ["Public tracking", "Live map", "Paystack checkout"],
  },
] as const;

const SUPPORT_NOTES = [
  "Where is my driver?",
  "Has this shipment been paid?",
  "Which deliveries failed today?",
  "Who handled this package?",
] as const;

const SPRING = "cubic-bezier(0.22,1,0.36,1)";

export function AboutProject() {
  const { ref, inView } = useInView({ threshold: 0.06 });

  return (
    <section
      id="roles"
      className="bg-[#0c0b08] py-16 sm:py-20 lg:py-28"
      ref={ref as unknown as React.RefObject<HTMLElement>}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div
          className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(18px)",
            transition: `opacity 0.55s ${SPRING}, transform 0.55s ${SPRING}`,
          }}
        >
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-teal-300">
              Role dashboards
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-stone-100 sm:text-4xl">
              Built for the people who touch the delivery.
            </h2>
            <p className="mt-4 leading-7 text-stone-400">
              IsoTrack keeps every shipment visible to the business, the assigned driver,
              and the customer waiting for the package. Each role gets its own dashboard,
              but the shipment record stays shared.
            </p>

            <div className="mt-8 rounded-md border border-stone-800 bg-[#080806] p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded border border-amber-500/25 bg-amber-400/10">
                  <Headphones className="h-4 w-4 text-amber-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-100">Designed to reduce support noise</p>
                  <p className="text-xs text-stone-500">Common questions become visible status.</p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {SUPPORT_NOTES.map((note) => (
                  <div key={note} className="rounded border border-stone-800 bg-[#0c0b08] px-3 py-2 text-xs text-stone-400">
                    {note}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-stone-800">
            {ROLES.map(({ icon: Icon, title, description, points }, index) => (
              <div
                key={title}
                className="border-b border-stone-800 bg-[#080806] p-5 last:border-b-0"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateX(0)" : "translateX(18px)",
                  transition: `opacity 0.4s ${SPRING} ${index * 80}ms, transform 0.4s ${SPRING} ${index * 80}ms`,
                }}
              >
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-teal-400/20 bg-teal-400/10">
                    <Icon className="h-5 w-5 text-teal-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-stone-100">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-400">{description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {points.map((point) => (
                        <span key={point} className="rounded border border-stone-700 bg-stone-900 px-2.5 py-1 text-[11px] text-stone-400">
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
