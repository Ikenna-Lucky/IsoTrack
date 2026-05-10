"use client";

import { MapPin, Bell, BarChart3, Zap, ShieldCheck, Users } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: MapPin,
    title: "Live GPS Tracking",
    description:
      "Watch shipments move in real time on an interactive map. Driver location updates every 5 seconds — no refresh needed.",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    glow: "rgba(14,165,233,0.06)",
  },
  {
    icon: Bell,
    title: "Automated Notifications",
    description:
      "Customers get email and SMS alerts at every milestone — pickup, in transit, out for delivery, and delivered. Zero manual work.",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    glow: "rgba(20,184,166,0.06)",
  },
  {
    icon: Zap,
    title: "Smart Driver Dispatch",
    description:
      "Assign the nearest available driver in seconds. Real-time driver status, vehicle type filters, and delivery history at a glance.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    glow: "rgba(245,158,11,0.06)",
  },
  {
    icon: BarChart3,
    title: "Business Analytics",
    description:
      "Track delivery success rates, average transit times, and revenue trends. The data your operations team needs, surfaced automatically.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    glow: "rgba(139,92,246,0.06)",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description:
      "Integrated Paystack checkout. Businesses pay for shipments directly on the platform — card, bank transfer, or USSD.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "rgba(16,185,129,0.06)",
  },
  {
    icon: Users,
    title: "Multi-Role Access",
    description:
      "Purpose-built dashboards for businesses, drivers, and customers. Each role sees exactly what they need — nothing more.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    glow: "rgba(244,63,94,0.06)",
  },
];

// ─── Easing constant ──────────────────────────────────────────────────────────

const SPRING = "cubic-bezier(0.22,1,0.36,1)";

// ─── Component ────────────────────────────────────────────────────────────────

export function Features() {
  const { ref, inView } = useInView({ threshold: 0.08, rootMargin: "0px 0px -60px 0px" });

  return (
    <section
      id="features"
      className="py-16 sm:py-20 lg:py-32"
      ref={ref as unknown as React.RefObject<HTMLElement>}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        {/* Section header */}
        <div
          className="max-w-xl mb-10 lg:mb-16"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(22px)",
            transition: `opacity 0.65s ${SPRING}, transform 0.65s ${SPRING}`,
          }}
        >
          <p className="text-xs uppercase tracking-widest text-sky-400 font-medium mb-3">
            Platform features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Everything your logistics operation needs
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            Built for the pace of modern African commerce — fast, reliable, and designed around the
            workflows your team already uses.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map(({ icon: Icon, title, description, color, bg, border, glow }, i) => (
            <div
              key={title}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 cursor-default overflow-hidden"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(30px)",
                transition: [
                  `opacity 0.55s ${SPRING} ${i * 85}ms`,
                  `transform 0.55s ${SPRING} ${i * 85}ms`,
                  "border-color 0.3s ease",
                  "background-color 0.3s ease",
                ].join(", "),
              }}
            >
              {/* Hover border highlight */}
              <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-white/[0.1] transition-colors duration-300 pointer-events-none" />

              {/* Icon — springs up on hover */}
              <div
                className={`relative inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg} border ${border} mb-4`}
                style={{
                  transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              >
                <Icon
                  className={`h-5 w-5 ${color} group-hover:scale-110 transition-transform duration-300`}
                />
                {/* Icon glow ring on hover */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ boxShadow: `0 0 12px ${glow.replace("0.06", "0.4")}` }}
                />
              </div>

              <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>

              {/* Radial glow from top — on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 50% 0%, ${glow}, transparent 65%)`,
                }}
              />

              {/* Left-to-right shimmer sweep on hover */}
              <div
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
                  transition: "transform 0.75s ease",
                }}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
