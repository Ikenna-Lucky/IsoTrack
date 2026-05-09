import { Github, Globe, Zap, ShieldCheck, MapPin, Bell, BarChart3, CreditCard } from "lucide-react";

const WHAT_IT_DEMONSTRATES = [
  {
    icon: Zap,
    title: "Real-time architecture",
    description:
      "Socket.io rooms scoped per shipment. Driver location events broadcast live to both business and customer dashboards without polling.",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Multi-role JWT auth",
    description:
      "Three distinct roles (business, driver, customer) with separate access scopes, refresh token rotation, and route-level guards.",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
  },
  {
    icon: MapPin,
    title: "Map-based tracking",
    description:
      "MapLibre GL + OpenStreetMap — fully free, no API key. Live driver marker updates over WebSocket, smooth animation between coordinates.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: Bell,
    title: "Event-driven notifications",
    description:
      "BullMQ job queues trigger Resend emails and Twilio SMS at every shipment milestone — pickup, in transit, out for delivery, delivered.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: CreditCard,
    title: "Paystack integration",
    description:
      "Shipment payments via Paystack checkout with webhook verification. Built for the Nigerian market — card, bank transfer, USSD.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: BarChart3,
    title: "Database design",
    description:
      "PostgreSQL on Neon with Drizzle ORM. Enum isolation pattern to prevent circular deps. Indexed queries, paginated results, full seed data.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
];

export function AboutProject() {
  return (
    <section id="about" className="py-16 sm:py-20 lg:py-32 border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        {/* Header + builder card */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start mb-10 lg:mb-16">
          <div>
            <p className="text-xs uppercase tracking-widest text-sky-400 font-medium mb-3">
              About this project
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-5">
              Built by one developer,
              <br />
              end to end.
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-5">
              IsoTrack is a personal portfolio project — a production-grade logistics platform
              built from scratch to push across the full stack. Every layer, from database
              schema to WebSocket events to payment webhooks, was designed and implemented
              by one person.
            </p>
            <p className="text-zinc-500 leading-relaxed text-sm">
              The goal was to build something that solves a real problem (shipment tracking in
              Nigeria) while demonstrating patterns you&apos;d find in an actual production codebase:
              real-time architecture, event-driven workflows, multi-role access control,
              and third-party integrations.
            </p>
          </div>

          {/* Builder card */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8">
            <div className="flex items-start gap-5 mb-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-teal-500/20 border border-sky-500/20 text-lg font-bold text-sky-300">
                IK
              </div>
              <div>
                <p className="text-base font-semibold text-white mb-0.5">Ikenna</p>
                <p className="text-sm text-zinc-500">Full-stack Developer</p>
                <p className="text-xs text-zinc-600 mt-1">
                  Next.js · Hono · TypeScript · PostgreSQL
                </p>
              </div>
            </div>

            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              I built IsoTrack to go deep on real-time systems and API design using a stack
              that reflects how I&apos;d build a startup product today — Bun, Hono, Drizzle,
              and Next.js 15 with the App Router.
            </p>

            <div className="flex flex-col gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-sm text-zinc-300 hover:text-white hover:border-white/10 hover:bg-white/[0.05] transition-all duration-200"
              >
                <Github className="h-4 w-4 text-zinc-400" />
                <span>View source on GitHub</span>
                <span className="ml-auto text-zinc-600 text-xs">Frontend + Backend</span>
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-sm text-zinc-300 hover:text-white hover:border-white/10 hover:bg-white/[0.05] transition-all duration-200"
              >
                <Globe className="h-4 w-4 text-zinc-400" />
                <span>Live demo</span>
                <span className="ml-auto text-zinc-600 text-xs">isotrack.vercel.app</span>
              </a>
            </div>
          </div>
        </div>

        {/* Demonstrates grid */}
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-600 font-medium mb-6">
            What this demonstrates
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHAT_IT_DEMONSTRATES.map(({ icon: Icon, title, description, color, bg, border }) => (
              <div
                key={title}
                className="group rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 hover:border-white/[0.09] hover:bg-white/[0.035] transition-all duration-300"
              >
                <div
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${bg} border ${border} mb-4`}
                >
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
