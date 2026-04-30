"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Search,
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Mock tracking card shown in hero ─────────────────────────────────────────

const MOCK_EVENTS = [
  { status: "delivered", label: "Delivered", time: "2:14 PM", done: true },
  { status: "out_for_delivery", label: "Out for delivery", time: "10:30 AM", done: true },
  { status: "in_transit", label: "In transit", time: "Yesterday", done: true },
  { status: "picked_up", label: "Package picked up", time: "Mon, 9:00 AM", done: false },
];

function TrackingCard() {
  return (
    <div className="relative w-full max-w-sm mx-auto lg:mx-0">
      {/* Glow behind card */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-sky-500/20 via-transparent to-teal-500/20 blur-xl" />

      <div className="relative rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-2xl">
        {/* Card header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-0.5">Tracking ID</p>
            <p className="font-mono text-sm font-semibold text-white">IST-K7X2M9PQ</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium text-emerald-400">Delivered</span>
          </span>
        </div>

        {/* Route */}
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 mb-4">
          <div className="flex flex-col items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0" />
            <div className="w-px flex-1 min-h-[24px] bg-gradient-to-b from-sky-400/50 to-teal-400/50" />
            <MapPin className="h-3.5 w-3.5 text-teal-400 shrink-0" />
          </div>
          <div className="flex flex-col gap-3 flex-1 min-w-0">
            <div>
              <p className="text-[10px] text-zinc-500">FROM</p>
              <p className="text-xs font-medium text-zinc-200 truncate">14 Admiralty Way, Lekki</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500">TO</p>
              <p className="text-xs font-medium text-zinc-200 truncate">5 Bourdillon Road, Ikoyi</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          {MOCK_EVENTS.map((event, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                  i === 0
                    ? "bg-emerald-500/20 border border-emerald-500/40"
                    : event.done
                      ? "bg-sky-500/10 border border-sky-500/20"
                      : "bg-zinc-800 border border-zinc-700",
                )}
              >
                {i === 0 ? (
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                ) : event.done ? (
                  <div className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-xs font-medium", i === 0 ? "text-white" : "text-zinc-400")}>
                  {event.label}
                </p>
              </div>
              <p className="text-[10px] text-zinc-600 shrink-0">{event.time}</p>
            </div>
          ))}
        </div>

        {/* Driver info */}
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500/10 border border-sky-500/20">
            <Truck className="h-4 w-4 text-sky-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white">Babatunde Adeleke</p>
            <p className="text-[10px] text-zinc-500">⭐ 4.8 · 147 deliveries</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] text-zinc-500">Vehicle</p>
            <p className="text-xs text-zinc-300">LND-421-GH</p>
          </div>
        </div>
      </div>

      {/* Floating notification */}
      <div className="absolute -bottom-4 -right-4 rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-white">Package delivered!</p>
            <p className="text-[10px] text-zinc-500">Signed by Ngozi A. · Just now</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tracking search bar ───────────────────────────────────────────────────────

function TrackingSearch() {
  const [value, setValue] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = value.trim().toUpperCase();
    if (id) router.push(`/track/${id}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-sm focus-within:border-sky-500/50 focus-within:bg-sky-500/[0.03] transition-all"
    >
      <Search className="ml-2 h-4 w-4 shrink-0 text-zinc-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter tracking ID — e.g. IST-K7X2M9PQ"
        className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 outline-none"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-sky-400 transition-colors shrink-0"
      >
        Track
      </button>
    </form>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #3f3f46 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Radial glow */}
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-sky-500/[0.06] blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-teal-500/[0.04] blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/[0.07] px-4 py-1.5 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-xs font-medium text-sky-300">
                Now tracking 50,000+ shipments across Nigeria
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight text-white mb-6">
              Logistics Intelligence
              <br />
              <span className="gradient-text">for Modern Africa</span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-8 max-w-xl">
              IsoTrack gives businesses, drivers, and customers a single source of truth for every
              shipment — with live GPS tracking, automated notifications, and real-time analytics.
              No guesswork. Ever.
            </p>

            {/* Search bar */}
            <div className="mb-8">
              <TrackingSearch />
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20"
              >
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                  ▶
                </span>
                See how it works
              </Link>
            </div>

            {/* Trust icons */}
            <div className="mt-10 flex items-center gap-6 flex-wrap">
              {[
                { icon: Package, label: "50K+ Shipments" },
                { icon: CheckCircle2, label: "99.8% Success rate" },
                { icon: Clock, label: "Real-time updates" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-zinc-600" />
                  <span className="text-xs text-zinc-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — tracking card */}
          <div className="flex justify-center lg:justify-end">
            <TrackingCard />
          </div>
        </div>
      </div>
    </section>
  );
}
