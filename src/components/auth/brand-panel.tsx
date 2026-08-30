import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, CheckCircle2, Clock3, MapPin, PackageCheck, Truck } from "lucide-react";
import { Logo } from "@/components/shared/logo";

const ROUTE_STEPS = [
  { label: "Pickup verified", place: "Ikeja warehouse", time: "09:42", icon: PackageCheck },
  { label: "Driver en route", place: "Third Mainland", time: "10:08", icon: Truck },
  { label: "Drop-off pending", place: "Lekki Phase 1", time: "10:31", icon: MapPin },
];

const METRICS = [
  { label: "Delivered today", value: "42", icon: CheckCircle2 },
  { label: "Avg update time", value: "18m", icon: Clock3 },
  { label: "Active drivers", value: "12", icon: Truck },
];

export function BrandPanel() {
  return (
    <aside className="relative h-[min(720px,calc(100vh-48px))] min-h-[560px] overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-white shadow-sm">
      <Image
        src="/images/auth-img.jpg"
        alt="Logistics team coordinating deliveries"
        width={760}
        height={720}
        priority
        className="motion-slow-zoom absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-slate-950/68" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-teal-950/75 to-transparent" />

      <div className="relative z-10 flex h-full flex-col p-7 xl:p-9">
        <Logo href="/" size={42} tone="light" />

        <div className="flex flex-1 flex-col justify-center py-7">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-teal-300">
            Delivery operations
          </p>
          <h2 className="max-w-md text-3xl font-black leading-tight tracking-tight xl:text-4xl">
            Your shipment activity, verified in one place.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
            IsoTrack keeps dispatch, driver updates, customer tracking, and payment status tied to
            the same delivery record.
          </p>

          <div className="mt-7 max-w-md rounded-lg border border-white/15 bg-white/[0.11] p-4 shadow-2xl shadow-slate-950/30 backdrop-blur-md">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Active shipment
                </p>
                <p className="mt-1 font-mono text-sm font-bold">IST-K7X2M9PQ</p>
              </div>
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                Paid
              </span>
            </div>

            <div className="space-y-2">
              {ROUTE_STEPS.map(({ label, place, time, icon: Icon }) => (
                <div
                  key={label}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border border-white/10 bg-white/[0.05] px-3 py-2.5"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-950">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-[13px] font-semibold">{label}</span>
                    <span className="block text-xs text-slate-400">{place}</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-400">{time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 grid max-w-md grid-cols-3 gap-2">
            {METRICS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-lg bg-white p-2.5 text-slate-950">
                <Icon className="mb-2 h-4 w-4 text-teal-700" />
                <p className="text-lg font-black">{value}</p>
                <p className="text-[11px] font-medium leading-tight text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"
        >
          Back to landing page
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}
