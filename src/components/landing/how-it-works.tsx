"use client";

import { PackagePlus, UserCheck, Navigation } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

// ─── Data ─────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    icon: PackagePlus,
    title: "Create a Shipment",
    description:
      "Your business logs the pickup location, delivery address, package details, and price. A unique IST tracking ID is generated instantly and sent to the customer.",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    glow: "from-sky-500/10",
    ring: "rgba(14,165,233,0.25)",
  },
  {
    number: "02",
    icon: UserCheck,
    title: "Assign a Driver",
    description:
      "Browse available drivers filtered by proximity and vehicle type. Assign with one click. The driver gets notified instantly and their route is mapped automatically.",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    glow: "from-teal-500/10",
    ring: "rgba(20,184,166,0.25)",
  },
  {
    number: "03",
    icon: Navigation,
    title: "Track & Deliver",
    description:
      "Business and customer both watch the delivery live on a map. At every status change — pickup, transit, delivery — emails and SMS fire automatically. Proof of delivery captured on completion.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    glow: "from-violet-500/10",
    ring: "rgba(139,92,246,0.25)",
  },
];

// ─── Easing ───────────────────────────────────────────────────────────────────

const SPRING = "cubic-bezier(0.22,1,0.36,1)";

// ─── Component ────────────────────────────────────────────────────────────────

export function HowItWorks() {
  const { ref, inView } = useInView({ threshold: 0.08, rootMargin: "0px 0px -60px 0px" });

  return (
    <section
      id="how-it-works"
      className="py-16 sm:py-20 lg:py-32 border-t border-white/[0.06]"
      ref={ref as unknown as React.RefObject<HTMLElement>}
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(14,165,233,0.04) 0%, transparent 60%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        {/* Section header */}
        <div
          className="text-center max-w-xl mx-auto mb-12 lg:mb-20"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(22px)",
            transition: `opacity 0.65s ${SPRING}, transform 0.65s ${SPRING}`,
          }}
        >
          <p className="text-xs uppercase tracking-widest text-sky-400 font-medium mb-3">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            From order to doorstep in three steps
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            Designed so your team can go from zero to live tracking in under ten minutes — no
            technical setup, no onboarding calls.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">

          {/* Animated connector line — desktop only */}
          <div
            className="hidden lg:block absolute top-14 left-0 right-0 h-px overflow-hidden"
            aria-hidden="true"
          >
            <div
              className="h-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent origin-left"
              style={{
                transform: inView ? "scaleX(1)" : "scaleX(0)",
                transition: `transform 1.4s ${SPRING} 0.25s`,
              }}
            />
          </div>

          {/* Step cards */}
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {STEPS.map(({ number, icon: Icon, title, description, color, bg, border, glow, ring }, i) => (
              <div
                key={number}
                className="relative flex flex-col group"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0)" : "translateY(32px)",
                  transition: `opacity 0.6s ${SPRING} ${i * 160 + 200}ms, transform 0.6s ${SPRING} ${i * 160 + 200}ms`,
                }}
              >
                {/* Step icon badge */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${bg} border ${border} transition-transform duration-300 group-hover:scale-105`}
                    style={{ boxShadow: inView ? `0 0 0 0px ${ring}` : "none", transition: "box-shadow 0.4s ease, transform 0.3s ease" }}
                  >
                    <Icon className={`h-5 w-5 ${color}`} />
                    {/* Number badge */}
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 border border-white/10 text-[9px] font-bold text-zinc-400">
                      {number}
                    </span>
                    {/* Pulse ring on reveal */}
                    <div
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        animation: inView
                          ? `stepPulse 0.6s ${SPRING} ${i * 160 + 350}ms both`
                          : "none",
                      }}
                    />
                  </div>
                </div>

                {/* Content card */}
                <div
                  className={`flex-1 rounded-2xl border border-white/[0.06] bg-gradient-to-b ${glow} to-transparent p-6 group-hover:border-white/[0.1] transition-colors duration-300`}
                >
                  <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes stepPulse {
          0%   { box-shadow: 0 0 0 0px rgba(14,165,233,0.5); }
          60%  { box-shadow: 0 0 0 10px rgba(14,165,233,0);  }
          100% { box-shadow: 0 0 0 0px rgba(14,165,233,0);   }
        }
      `}</style>
    </section>
  );
}
