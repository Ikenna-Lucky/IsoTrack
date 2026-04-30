import { Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "Before IsoTrack, we were manually calling customers to give delivery updates. Now they track it themselves and our CS tickets dropped by 60%. The live map alone is worth it.",
    name: "Emeka Okonkwo",
    role: "Operations Lead, Jumia Logistics NG",
    initials: "EO",
    color: "bg-sky-500/20 text-sky-300",
  },
  {
    quote:
      "As a driver, I love that I know exactly where to go and can update my status with one tap. Customers stop calling me when they can see where I am on the map.",
    name: "Babatunde Adeleke",
    role: "Delivery Driver, Lagos",
    initials: "BA",
    color: "bg-teal-500/20 text-teal-300",
  },
  {
    quote:
      "I ordered a fragile medical device from Abuja. Being able to watch it move in real time gave me so much peace of mind. The SMS updates were a nice touch too.",
    name: "Ngozi Adaeze",
    role: "Customer, Ikoyi",
    initials: "NA",
    color: "bg-violet-500/20 text-violet-300",
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-24 lg:py-32 border-t border-white/[0.06]"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-xl mb-16">
          <p className="text-xs uppercase tracking-widest text-sky-400 font-medium mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Trusted by teams across Nigeria
          </h2>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ quote, name, role, initials, color }) => (
            <div
              key={name}
              className="flex flex-col justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300"
            >
              <div>
                <Quote className="h-6 w-6 text-white/10 mb-4" />
                <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                  &ldquo;{quote}&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${color}`}
                >
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{name}</p>
                  <p className="text-xs text-zinc-500">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
