"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Clock3,
  CreditCard,
  MapPin,
  Navigation,
  PackageCheck,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MANIFEST_ROWS = [
  { label: "Origin", value: "Ikeja" },
  { label: "Drop-off", value: "Lekki Phase 1" },
  { label: "Driver", value: "Emeka Okafor" },
  { label: "ETA", value: "27 min" },
] as const;

function TrackingSearch() {
  const [value, setValue] = useState("");
  const router = useRouter();
  const trackingId = value.trim().toUpperCase();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (trackingId) router.push(`/track/${trackingId}` as Route);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-xl">
      <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white p-2 shadow-[0_18px_50px_rgb(15_23_42/0.08)]">
        <Search className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value.toUpperCase())}
          placeholder="IST-K7X2M9PQ"
          spellCheck={false}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent py-2 font-mono text-sm font-semibold tracking-wider text-slate-950 outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!trackingId}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors",
            trackingId
              ? "bg-slate-950 text-white hover:bg-slate-800"
              : "border border-slate-200 bg-slate-50 text-slate-400",
          )}
        >
          <Navigation className="h-4 w-4" />
          Track
        </button>
      </div>
      <button
        type="button"
        onClick={() => setValue("IST-K7X2M9PQ")}
        className="mt-3 font-mono text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        Use demo tracking ID
      </button>
    </form>
  );
}

function Waybill() {
  return (
    <div className="motion-rise relative rounded-xl border border-slate-300 bg-white p-4 shadow-xl shadow-slate-200/80 lg:p-3.5">
      <div className="absolute -top-3 right-5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
        Paid
      </div>
      <div className="flex items-start justify-between gap-3 border-b border-dashed border-slate-300 pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Waybill
          </p>
          <p className="mt-1 font-mono text-base font-black text-slate-950">IST-K7X2M9PQ</p>
        </div>
        <PackageCheck className="h-6 w-6 text-sky-700" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:gap-2.5">
        {MANIFEST_ROWS.map((row) => (
          <div key={row.label}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {row.label}
            </p>
            <p className="mt-1 truncate text-sm font-bold text-slate-900 lg:text-[13px]">{row.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-amber-600" />
          <span className="text-xs font-semibold text-slate-700">Out for delivery</span>
        </div>
        <span className="text-xs font-bold text-slate-950">11:25 ETA</span>
      </div>
    </div>
  );
}

function HeroStage() {
  return (
    <div className="motion-rise relative [animation-delay:180ms]">
      <div className="relative overflow-hidden rounded-xl border border-slate-300 bg-slate-100 shadow-2xl shadow-slate-200/80">
        <Image
          src="/images/hero-img.jpg"
          alt="Courier handing a package to a customer"
          width={660}
          height={720}
          priority
          className="motion-slow-zoom h-[340px] w-full object-cover object-center sm:h-[410px] lg:h-[470px] xl:h-[490px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/5 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-white/20 bg-white/90 p-4 shadow-lg backdrop-blur sm:right-auto sm:w-[330px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Live delivery
              </p>
              <p className="mt-1 text-base font-black text-slate-950 sm:text-lg">Package handoff in progress</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              Verified
            </span>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div className="motion-progress h-full w-[72%] rounded-full bg-teal-600" />
          </div>
        </div>
        <div className="absolute right-5 top-5 hidden w-32 rounded-lg border border-white/20 bg-white/90 p-3.5 shadow-lg backdrop-blur sm:block">
          <CreditCard className="mb-3 h-5 w-5 text-emerald-700" />
          <p className="text-2xl font-black text-slate-950">92%</p>
          <p className="mt-1 text-xs font-medium text-slate-500">paid before dispatch</p>
        </div>
      </div>
      <div className="absolute -left-3 -top-4 hidden w-[300px] lg:block">
        <Waybill />
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-white pt-20">
      <div
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white via-white to-transparent" />

      <div className="relative mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl gap-10 px-5 py-10 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:px-8 lg:py-12">
        <div className="relative z-10 max-w-2xl">
          <div className="motion-rise mb-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
              <MapPin className="h-3.5 w-3.5 text-teal-700" />
              Built for local delivery teams
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
              Dispatch, tracking, and payment in one flow
            </span>
          </div>

          <p className="motion-rise mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-teal-700 [animation-delay:80ms]">
            Real-time logistics visibility
          </p>
          <h1 className="motion-rise max-w-[640px] text-[2.65rem] font-black leading-[1.06] tracking-tight text-slate-950 sm:text-5xl lg:text-[4rem] xl:text-[4.35rem] [animation-delay:140ms]">
            Stop asking drivers for updates.
          </h1>
          <p className="motion-rise mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg [animation-delay:200ms]">
            IsoTrack gives every shipment a live tracking page with driver updates, delivery proof,
            and payment status, so your team can work without constant phone calls.
          </p>

          <div className="motion-rise mt-6 [animation-delay:260ms]">
            <TrackingSearch />
          </div>

          <div className="motion-rise mt-6 flex flex-col gap-3 sm:flex-row [animation-delay:320ms]">
            <Link
              href={"/register" as Route}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
            >
              Create shipment
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={"/track/IST-K7X2M9PQ" as Route}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
            >
              View live manifest
              <Navigation className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <HeroStage />
      </div>
    </section>
  );
}
