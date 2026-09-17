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
    <section className="border-y border-stone-800 bg-[#0c0b08]" aria-label="Operational metrics">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-px bg-stone-800 lg:grid-cols-4">
          {METRICS.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-[#0c0b08] px-4 py-5 sm:py-6 lg:px-6">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded border border-amber-500/25 bg-amber-400/10">
                <Icon className="h-4 w-4 text-amber-300" />
              </div>
              <p className="text-lg font-bold text-stone-100 sm:text-xl">{value}</p>
              <p className="mt-1 text-xs text-stone-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
