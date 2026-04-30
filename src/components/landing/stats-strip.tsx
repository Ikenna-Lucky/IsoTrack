const STATS = [
  { value: "50K+", label: "Shipments tracked" },
  { value: "2.5K+", label: "Businesses onboarded" },
  { value: "15+", label: "Cities covered" },
  { value: "99.8%", label: "Delivery success rate" },
];

export function StatsStrip() {
  return (
    <section className="border-y border-white/[0.06] bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-bold tracking-tight text-white mb-1">{value}</p>
              <p className="text-sm text-zinc-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
