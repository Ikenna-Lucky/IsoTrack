import { PackagePlus, UserCheck, Navigation } from "lucide-react";

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
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-16 sm:py-20 lg:py-32 border-t border-white/[0.06]"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(14,165,233,0.04) 0%, transparent 60%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12 lg:mb-20">
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
          {/* Connector line — desktop only */}
          <div className="hidden lg:block absolute top-14 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {STEPS.map(({ number, icon: Icon, title, description, color, bg, border, glow }) => (
              <div key={number} className="relative flex flex-col">
                {/* Step number badge */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${bg} border ${border}`}
                  >
                    <Icon className={`h-5 w-5 ${color}`} />
                    {/* Number badge */}
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 border border-white/10 text-[9px] font-bold text-zinc-400">
                      {number}
                    </span>
                  </div>
                </div>

                {/* Content card */}
                <div
                  className={`flex-1 rounded-2xl border border-white/[0.06] bg-gradient-to-b ${glow} to-transparent p-6`}
                >
                  <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
