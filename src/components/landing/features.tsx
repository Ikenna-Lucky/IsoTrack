import {
  MapPin,
  Bell,
  BarChart3,
  Zap,
  ShieldCheck,
  Users,
} from "lucide-react";

const FEATURES = [
  {
    icon: MapPin,
    title: "Live GPS Tracking",
    description:
      "Watch shipments move in real time on an interactive map. Driver location updates every 5 seconds — no refresh needed.",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
  },
  {
    icon: Bell,
    title: "Automated Notifications",
    description:
      "Customers get email and SMS alerts at every milestone — pickup, in transit, out for delivery, and delivered. Zero manual work.",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
  },
  {
    icon: Zap,
    title: "Smart Driver Dispatch",
    description:
      "Assign the nearest available driver in seconds. Real-time driver status, vehicle type filters, and delivery history at a glance.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: BarChart3,
    title: "Business Analytics",
    description:
      "Track delivery success rates, average transit times, and revenue trends. The data your operations team needs, surfaced automatically.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description:
      "Integrated Paystack checkout. Businesses pay for shipments directly on the platform — card, bank transfer, or USSD.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: Users,
    title: "Multi-Role Access",
    description:
      "Purpose-built dashboards for businesses, drivers, and customers. Each role sees exactly what they need — nothing more.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-xl mb-16">
          <p className="text-xs uppercase tracking-widest text-sky-400 font-medium mb-3">
            Platform features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Everything your logistics operation needs
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            Built for the pace of modern African commerce — fast, reliable, and designed around
            the workflows your team already uses.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, description, color, bg, border }) => (
            <div
              key={title}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300"
            >
              {/* Icon */}
              <div
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg} border ${border} mb-4`}
              >
                <Icon className={`h-5 w-5 ${color}`} />
              </div>

              <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>

              {/* Subtle glow on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "radial-gradient(circle at 50% 0%, rgba(14,165,233,0.04), transparent 70%)" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
