"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  MapPin,
  PhoneCall,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SHIPMENTS = [
  {
    id: "IST-K7X2M9PQ",
    customer: "Adunola Fashola",
    route: "Ikeja -> Lekki Phase 1",
    driver: "Emeka",
    status: "Out for delivery",
    eta: "27 min",
    payment: "Paid",
    tone: "sky",
  },
  {
    id: "IST-B3N8R4PT",
    customer: "Chukwuemeka Obi",
    route: "Yaba -> Ikoyi",
    driver: "Awaiting assignment",
    status: "Pending",
    eta: "Assign driver",
    payment: "Due",
    tone: "amber",
  },
  {
    id: "IST-W9QK7LMN",
    customer: "Blessing Nwosu",
    route: "Surulere -> VI",
    driver: "Tunde",
    status: "In transit",
    eta: "46 min",
    payment: "Paid",
    tone: "emerald",
  },
] as const;

const EXCEPTIONS = [
  { label: "Customer unavailable", count: 3, icon: PhoneCall },
  { label: "Payment pending", count: 5, icon: CreditCard },
  { label: "Driver delayed", count: 2, icon: Clock3 },
] as const;

const STATUS_TONES = {
  sky: "border-sky-200 bg-sky-50 text-sky-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
} as const;

export function OperationsProof() {
  return (
    <section className="border-y border-stone-800 bg-[#0c0b08] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-teal-300">
              Dispatch visibility
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-stone-100 sm:text-4xl">
              Every handoff visible before it becomes a support call.
            </h2>
            <p className="mt-4 leading-7 text-stone-400">
              IsoTrack keeps the awkward parts of delivery operations in view:
              unpaid shipments, driver handoff, ETA updates, and delivery exceptions.
            </p>

            <div className="mt-8 grid gap-3">
              {EXCEPTIONS.map(({ label, count, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between rounded-md border border-stone-800 bg-[#080806] px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded border border-rose-400/20 bg-rose-400/10">
                      <Icon className="h-4 w-4 text-rose-300" />
                    </div>
                    <span className="text-sm font-medium text-stone-300">{label}</span>
                  </div>
                  <span className="rounded bg-stone-800 px-2.5 py-1 text-xs font-semibold text-stone-300">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-stone-800 bg-[#080806] shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-stone-100">Today&apos;s shipment board</p>
                <p className="mt-0.5 text-xs text-stone-500">Lagos Island and Mainland routes</p>
              </div>
              <div className="flex items-center gap-2 rounded border border-amber-500/25 bg-amber-400/10 px-2.5 py-1.5 text-xs font-medium text-amber-200">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-300" />
                10 open actions
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-stone-900 text-xs uppercase tracking-wider text-stone-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Tracking</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Route</th>
                    <th className="px-4 py-3 font-semibold">Driver</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {SHIPMENTS.map((shipment) => (
                    <tr key={shipment.id} className="bg-[#080806]">
                      <td className="px-4 py-4">
                        <span className="font-mono text-xs font-bold text-amber-200">{shipment.id}</span>
                      </td>
                      <td className="px-4 py-4 text-stone-300">{shipment.customer}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-stone-300">
                          <MapPin className="h-3.5 w-3.5 text-stone-500" />
                          {shipment.route}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-stone-300">
                          <Truck className="h-3.5 w-3.5 text-stone-500" />
                          {shipment.driver}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", STATUS_TONES[shipment.tone])}>
                          {shipment.status}
                        </span>
                        <p className="mt-1 text-xs text-stone-500">{shipment.eta}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {shipment.payment === "Paid" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <CreditCard className="h-4 w-4 text-amber-600" />
                          )}
                          <span className="text-sm font-medium text-stone-300">{shipment.payment}</span>
                          <ArrowUpRight className="h-3.5 w-3.5 text-stone-600" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
