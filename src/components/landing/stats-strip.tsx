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

export function StatsStrip() {
  return (
    <section className="border-y border-white/[0.05] bg-white/[0.015]">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="relative flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-none pb-1 [mask-image:linear-gradient(to_right,transparent_0,black_16px,black_calc(100%-48px),transparent_100%)] sm:[mask-image:none]">
          <p className="text-[10px] uppercase tracking-widest text-zinc-700 font-medium shrink-0">
            Stack
          </p>
          <div className="h-4 w-px bg-white/[0.07] shrink-0" />
          <div className="flex items-center gap-3 flex-nowrap">
            {STACK.map(({ name, category }, i) => (
              <div key={name} className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-400 whitespace-nowrap">
                    {name}
                  </span>
                  <span className="text-[10px] text-zinc-700 whitespace-nowrap hidden sm:block">
                    {category}
                  </span>
                </div>
                {i < STACK.length - 1 && (
                  <span className="text-zinc-800 text-xs">·</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
