import Image from "next/image";
import { CheckCircle2, Clock3, MapPin, PackageCheck, ShieldCheck, Truck } from "lucide-react";

const ROUTE_STEPS = [
  { label: "Pickup verified", detail: "Ikeja warehouse", time: "09:42", icon: PackageCheck },
  { label: "Driver en route", detail: "Third Mainland", time: "10:08", icon: Truck },
  { label: "Drop-off pending", detail: "Lekki Phase 1", time: "10:31", icon: MapPin },
];

const CHECKPOINTS = [
  { label: "Role-based dashboards", icon: ShieldCheck },
  { label: "Live tracking pages", icon: Clock3 },
  { label: "Delivery proof records", icon: CheckCircle2 },
];

export function BrandPanel() {
  return (
    <aside className="hidden min-w-0 lg:block">
      <div className="overflow-hidden rounded-md border border-stone-800 bg-[#101411] shadow-2xl shadow-black/30">
        <div className="relative h-44 overflow-hidden border-b border-stone-800">
          <Image
            src="/images/auth-img.jpg"
            alt="Logistics team coordinating deliveries"
            width={720}
            height={360}
            priority
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101411] via-[#101411]/45 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">
              Access checkpoint
            </p>
            <h2 className="mt-2 text-2xl font-black leading-tight text-stone-100">
              Get into the right shipment workspace.
            </h2>
          </div>
        </div>

        <div className="p-4">
          <div className="rounded border border-stone-300 bg-[#f6efe0] p-4 text-stone-950">
            <div className="mb-3 flex items-center justify-between border-b border-dashed border-stone-400 pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                  Active record
                </p>
                <p className="mt-1 font-mono text-sm font-black">IST-K7X2M9PQ</p>
              </div>
              <span className="rounded bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                Paid
              </span>
            </div>

            <div className="space-y-2">
              {ROUTE_STEPS.map(({ label, detail, time, icon: Icon }) => (
                <div key={label} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded bg-stone-950 text-amber-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">{label}</span>
                    <span className="block truncate text-xs font-medium text-stone-500">{detail}</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-stone-500">{time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {CHECKPOINTS.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-3 border border-stone-800 bg-[#0b0f0e] px-3 py-2.5"
              >
                <Icon className="h-4 w-4 text-teal-300" />
                <span className="text-sm font-medium text-stone-300">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
