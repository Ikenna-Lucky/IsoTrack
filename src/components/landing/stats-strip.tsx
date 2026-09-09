"use client";

import { Clock3, PackageCheck, RadioTower, WalletCards } from "lucide-react";

const METRICS = [
  { label: "Average pickup window", value: "18 min", icon: Clock3 },
  { label: "Live shipment events", value: "5 sec", icon: RadioTower },
  { label: "Delivery stages tracked", value: "6", icon: PackageCheck },
  { label: "Payment channels", value: "Card, bank, USSD", icon: WalletCards },
] as const;

export function StatsStrip() {
  return (
    <section className="border-y border-slate-200 bg-white" aria-label="Operational metrics">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-slate-200 px-5 sm:px-6 lg:grid-cols-4 lg:px-8">
        {METRICS.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white py-5 sm:py-6 lg:px-6">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-slate-50">
              <Icon className="h-4 w-4 text-sky-600" />
            </div>
            <p className="text-lg font-bold text-slate-950 sm:text-xl">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
