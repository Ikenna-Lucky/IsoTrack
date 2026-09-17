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
      <div className="grid gap-2 rounded-md border border-amber-500/30 bg-[#15130e] p-2 shadow-[0_20px_70px_rgb(0_0_0/0.35)] sm:grid-cols-[minmax(0,1fr)_auto]">
        <label className="flex min-w-0 items-center gap-2 rounded border border-stone-800 bg-black/20 px-3">
          <span className="sr-only">Tracking ID</span>
          <Search className="h-4 w-4 shrink-0 text-amber-300" />
          <input
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value.toUpperCase())}
            placeholder="IST-K7X2M9PQ"
            spellCheck={false}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent py-3 font-mono text-sm font-semibold tracking-wider text-stone-100 outline-none placeholder:text-stone-600"
          />
        </label>
        <button
          type="submit"
          disabled={!trackingId}
          className={cn(
            "inline-flex h-11 w-full items-center justify-center gap-2 rounded px-4 text-sm font-bold transition-colors sm:w-auto",
            trackingId
              ? "bg-amber-400 text-stone-950 hover:bg-amber-300"
              : "border border-stone-700 bg-stone-900 text-stone-600",
          )}
        >
          <Navigation className="h-4 w-4" />
          Track
        </button>
      </div>
      <button
        type="button"
        onClick={() => setValue("IST-K7X2M9PQ")}
        className="mt-3 font-mono text-xs font-medium text-stone-500 transition-colors hover:text-amber-300"
      >
        Use demo tracking ID
      </button>
    </form>
  );
}

function Waybill() {
  return (
    <div className="motion-rise relative rounded-md border border-stone-300 bg-[#f7f0df] p-4 text-stone-950 shadow-xl shadow-black/30 lg:p-3.5">
      <div className="absolute -top-3 right-5 rounded border border-emerald-700/30 bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
        Paid
      </div>
      <div className="flex items-start justify-between gap-3 border-b border-dashed border-stone-400 pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-500">
            Waybill
          </p>
          <p className="mt-1 font-mono text-base font-black text-stone-950">IST-K7X2M9PQ</p>
        </div>
        <PackageCheck className="h-6 w-6 text-teal-700" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:gap-2.5">
        {MANIFEST_ROWS.map((row) => (
          <div key={row.label}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {row.label}
            </p>
            <p className="mt-1 truncate text-sm font-bold text-stone-900 lg:text-[13px]">{row.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between rounded bg-stone-950 px-3 py-2">
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-amber-300" />
          <span className="text-xs font-semibold text-stone-100">Out for delivery</span>
        </div>
        <span className="text-xs font-bold text-amber-300">11:25 ETA</span>
      </div>
    </div>
  );
}

function HeroStage() {
  return (
    <div className="motion-rise relative [animation-delay:180ms]">
      <div className="relative overflow-hidden rounded-md border border-stone-700 bg-stone-950 shadow-2xl shadow-black/50">
        <Image
          src="/images/hero-img.jpg"
          alt="Courier handing a package to a customer"
          width={660}
          height={720}
          priority
          className="motion-slow-zoom h-[300px] w-full object-cover object-center sm:h-[410px] lg:h-[470px] xl:h-[490px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080806] via-[#080806]/30 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 rounded-md border border-stone-200/20 bg-[#f7f0df]/95 p-3.5 text-stone-950 shadow-lg backdrop-blur sm:bottom-5 sm:left-5 sm:right-auto sm:w-[330px] sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                Live delivery
              </p>
              <p className="mt-1 text-sm font-black text-stone-950 sm:text-lg">Package handoff in progress</p>
            </div>
            <span className="rounded bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              Verified
            </span>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-stone-300">
            <div className="motion-progress h-full w-[72%] rounded-full bg-teal-600" />
          </div>
        </div>
        <div className="absolute right-5 top-5 hidden w-32 rounded-md border border-amber-300/30 bg-stone-950/85 p-3.5 shadow-lg backdrop-blur sm:block">
          <CreditCard className="mb-3 h-5 w-5 text-emerald-300" />
          <p className="text-2xl font-black text-stone-100">92%</p>
          <p className="mt-1 text-xs font-medium text-stone-400">paid before dispatch</p>
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
    <section className="relative overflow-hidden border-b border-stone-800 bg-[#080806] pt-20">
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,158,11,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.16) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[#080806] via-[#080806] to-transparent" />

      <div className="relative mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:px-8 lg:py-12">
        <div className="relative z-10 max-w-2xl">
          <div className="motion-rise mb-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded border border-stone-700 bg-stone-950/70 px-3 py-1.5 text-xs font-semibold text-stone-300">
              <MapPin className="h-3.5 w-3.5 text-teal-300" />
              Built for local delivery teams
            </span>
            <span className="rounded border border-amber-500/30 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-200">
              Dispatch, tracking, and payment in one flow
            </span>
          </div>

          <p className="motion-rise mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-teal-300 [animation-delay:80ms]">
            Real-time logistics visibility
          </p>
          <h1 className="motion-rise max-w-[640px] text-[2.35rem] font-black leading-[1.05] tracking-tight text-stone-100 min-[380px]:text-[2.65rem] sm:text-5xl lg:text-[4rem] xl:text-[4.35rem] [animation-delay:140ms]">
            Stop asking drivers for updates.
          </h1>
          <p className="motion-rise mt-4 max-w-xl text-[15px] leading-7 text-stone-400 sm:mt-5 sm:text-lg [animation-delay:200ms]">
            IsoTrack gives every shipment a live tracking page with driver updates, delivery proof,
            and payment status, so your team can work without constant phone calls.
          </p>

          <div className="motion-rise mt-6 [animation-delay:260ms]">
            <TrackingSearch />
          </div>

          <div className="motion-rise mt-6 flex flex-col gap-3 sm:flex-row [animation-delay:320ms]">
            <Link
              href={"/register" as Route}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-400 px-5 py-3 text-sm font-bold text-stone-950 shadow-sm transition-colors hover:bg-amber-300"
            >
              Create shipment
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={"/track/IST-K7X2M9PQ" as Route}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-stone-700 bg-stone-950 px-5 py-3 text-sm font-semibold text-stone-200 shadow-sm transition-colors hover:border-amber-500/50 hover:bg-stone-900"
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
