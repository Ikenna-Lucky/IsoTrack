"use client";

// ─── Tech stack data ──────────────────────────────────────────────────────────

const STACK = [
  { name: "Next.js 15", category: "Frontend" },
  { name: "Hono", category: "API" },
  { name: "TypeScript 5", category: "Language" },
  { name: "PostgreSQL", category: "Database" },
  { name: "Drizzle ORM", category: "ORM" },
  { name: "Socket.io", category: "Real-time" },
  { name: "MapLibre GL", category: "Maps" },
  { name: "BullMQ", category: "Queues" },
  { name: "Upstash Redis", category: "Cache" },
  { name: "Paystack", category: "Payments" },
  { name: "Resend", category: "Email" },
  { name: "Twilio", category: "SMS" },
];

// Duplicate so the loop is perfectly seamless — animate to -50% = one full set
const DOUBLED = [...STACK, ...STACK];

// ─── Component ────────────────────────────────────────────────────────────────

export function StatsStrip() {
  return (
    <section
      className="border-y border-white/[0.05] bg-white/[0.015] overflow-hidden"
      aria-label="Technology stack"
    >
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0);    }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee 34s linear infinite;
          will-change: transform;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="relative py-5 sm:py-6">
        {/* Left fade mask */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-28 z-10"
          style={{ background: "linear-gradient(to right, #09090b 0%, transparent 100%)" }}
        />
        {/* Right fade mask */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-28 z-10"
          style={{ background: "linear-gradient(to left, #09090b 0%, transparent 100%)" }}
        />

        {/* Scrolling track */}
        <div
          className="marquee-track flex items-center"
          style={{ width: "max-content" }}
        >
          {DOUBLED.map(({ name, category }, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-6 sm:px-8 shrink-0"
            >
              <span className="text-sm font-medium text-zinc-400 whitespace-nowrap">
                {name}
              </span>
              <span className="text-[10px] text-zinc-700 whitespace-nowrap">
                {category}
              </span>
              <span className="ml-2 text-zinc-800 text-xs" aria-hidden="true">
                ·
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
