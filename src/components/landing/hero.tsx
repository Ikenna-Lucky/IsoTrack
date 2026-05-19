"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Search,
  MapPin,
  CheckCircle2,
  Truck,
  Github,
  Navigation2,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES = ["businesses", "drivers", "customers"];

const CARD_STATUSES = [
  {
    label: "Pending pickup",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
  },
  {
    label: "In transit",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    dot: "bg-sky-400",
  },
  {
    label: "Out for delivery",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    dot: "bg-violet-400",
  },
  {
    label: "Delivered",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
  },
];

const TIMELINE = [
  { label: "Delivered to recipient", time: "2:14 PM", state: "done-final" },
  { label: "Out for delivery", time: "10:30 AM", state: "done" },
  { label: "In transit — Lagos hub", time: "Yesterday", state: "done" },
  { label: "Package picked up", time: "Mon, 9:00 AM", state: "pending" },
];

const TECH_STACK = [
  "Next.js 15",
  "Hono",
  "TypeScript 5",
  "PostgreSQL",
  "Socket.io",
  "MapLibre GL",
  "Drizzle ORM",
  "BullMQ",
  "Paystack",
  "Resend",
];

// ─── Tracking search ──────────────────────────────────────────────────────────

function TrackingSearch() {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = value.trim().toUpperCase();
    if (id) router.push(`/track/${id}` as Route);
  };

  const hasValue = value.trim().length > 0;

  return (
    <div className="w-full">
      {/* Label row */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className="h-px flex-1 bg-white/[0.06]" />
        <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-medium">
          Track any shipment
        </span>
        <div className="h-px flex-1 bg-white/[0.06]" />
      </div>

      {/* Input block */}
      <form onSubmit={handleSearch}>
        <div
          className={cn(
            "flex items-center gap-2 sm:gap-3 rounded-2xl border px-3 sm:px-4 py-3 sm:py-3.5 transition-all duration-300",
            focused
              ? "border-sky-500/40 bg-sky-500/[0.04]"
              : "border-white/[0.08] bg-white/[0.03]"
          )}
          style={
            focused
              ? { boxShadow: "0 0 0 3px rgba(14,165,233,0.1), 0 0 20px rgba(14,165,233,0.06)" }
              : undefined
          }
        >
          {/* Icon */}
          <div
            className={cn(
              "flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
              focused
                ? "bg-sky-500/15 border border-sky-500/25"
                : "bg-white/[0.04] border border-white/[0.07]"
            )}
          >
            <Search
              className={cn(
                "h-3 w-3 sm:h-3.5 sm:w-3.5 transition-colors duration-300",
                focused ? "text-sky-400" : "text-zinc-500"
              )}
            />
          </div>

          {/* Input */}
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value.toUpperCase())}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="IST-XXXXXXXX"
            spellCheck={false}
            autoComplete="off"
            className="flex-1 bg-transparent font-mono text-sm font-medium text-white placeholder-zinc-700 outline-none tracking-wider min-w-0"
          />

          {/* Track button */}
          <button
            type="submit"
            disabled={!hasValue}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 rounded-xl px-3.5 sm:px-5 py-2 text-sm font-semibold shrink-0 transition-all duration-300",
              hasValue
                ? "bg-sky-500 text-white hover:bg-sky-400 shadow-lg shadow-sky-500/20"
                : "bg-white/[0.04] text-zinc-600 border border-white/[0.06] cursor-not-allowed"
            )}
          >
            <ArrowRight className="h-3.5 w-3.5" />
            <span>Track</span>
          </button>
        </div>
      </form>

      {/* Hint */}
      <p className="mt-2.5 text-[11px] text-zinc-700 text-center leading-relaxed">
        Try{" "}
        <button
          type="button"
          onClick={() => setValue("IST-K7X2M9PQ")}
          className="font-mono text-zinc-500 hover:text-zinc-400 transition-colors underline underline-offset-2 decoration-zinc-700"
        >
          IST-K7X2M9PQ
        </button>
        {" "}— demo tracking ID
      </p>
    </div>
  );
}

// ─── Live tracking card ───────────────────────────────────────────────────────

function LiveTrackingCard() {
  const [statusIdx, setStatusIdx] = useState(1);
  const [statusVisible, setStatusVisible] = useState(true);
  const [locationPulse, setLocationPulse] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusVisible(false);
      setTimeout(() => {
        setStatusIdx((i) => (i + 1) % CARD_STATUSES.length);
        setStatusVisible(true);
      }, 220);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLocationPulse(true);
      setTimeout(() => setLocationPulse(false), 900);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const status = CARD_STATUSES[statusIdx]!;

  return (
    /* On mobile: no negative margins so floating chips don't overflow the viewport.
       On sm+: restore the chip offsets with enough padding to absorb them. */
    <div className="relative w-full max-w-[340px] sm:max-w-[360px] pt-6 pb-8 sm:pt-8 sm:pb-10">

      {/* ── Floating top chip — hidden on mobile ── */}
      <div
        className="animate-fade-in-down hidden sm:flex absolute top-2 -left-3 z-10 items-center gap-2 rounded-xl border border-white/10 bg-[#111116]/95 backdrop-blur-md px-3 py-2 shadow-xl"
        style={{ animationDelay: "700ms" }}
      >
        <div
          className={cn(
            "h-2 w-2 rounded-full transition-all duration-500",
            locationPulse ? "bg-sky-400 scale-[1.4]" : "bg-sky-500/50"
          )}
        />
        <p className="text-[11px] font-medium text-zinc-200">
          {locationPulse ? "Location updated" : "Live tracking active"}
        </p>
        <Wifi className="h-3 w-3 text-sky-400 opacity-70" />
      </div>

      {/* ── Glow halo ── */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-500/15 via-transparent to-teal-500/15 blur-2xl" />

      {/* ── Main card ── */}
      <div className="relative rounded-2xl border border-white/[0.09] bg-[#0d0d10] p-4 sm:p-5 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-0.5">
              Tracking ID
            </p>
            <p className="font-mono text-sm font-semibold text-white tracking-wide">
              IST-K7X2M9PQ
            </p>
          </div>
          <span
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 transition-opacity duration-200",
              status.bg,
              status.border,
              statusVisible ? "opacity-100" : "opacity-0"
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", status.dot)} />
            <span className={cn("text-[11px] font-medium", status.color)}>
              {status.label}
            </span>
          </span>
        </div>

        {/* Route */}
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.05] p-3 mb-4">
          <div className="flex flex-col items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0" />
            <div className="w-px flex-1 min-h-[22px] bg-gradient-to-b from-sky-400/40 to-teal-400/40" />
            <MapPin className="h-3.5 w-3.5 text-teal-400 shrink-0" />
          </div>
          <div className="flex flex-col gap-3 flex-1 min-w-0">
            <div>
              <p className="text-[10px] text-zinc-600 mb-0.5">FROM</p>
              <p className="text-xs font-medium text-zinc-200 truncate">
                14 Admiralty Way, Lekki
              </p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-600 mb-0.5">TO</p>
              <p className="text-xs font-medium text-zinc-200 truncate">
                5 Bourdillon Road, Ikoyi
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          {TIMELINE.map((event, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-3 transition-all duration-500",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              )}
              style={{ transitionDelay: mounted ? `${i * 100}ms` : "0ms" }}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                  event.state === "done-final"
                    ? "bg-emerald-500/15 border border-emerald-500/30"
                    : event.state === "done"
                      ? "bg-sky-500/10 border border-sky-500/20"
                      : "bg-zinc-800 border border-zinc-700/80"
                )}
              >
                {event.state === "done-final" ? (
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                ) : event.state === "done" ? (
                  <div className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-xs font-medium", event.state === "done-final" ? "text-white" : "text-zinc-500")}>
                  {event.label}
                </p>
              </div>
              <p className="text-[10px] text-zinc-700 shrink-0">{event.time}</p>
            </div>
          ))}
        </div>

        {/* Driver strip */}
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500/10 border border-sky-500/20">
            <Truck className="h-4 w-4 text-sky-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white">Babatunde Adeleke</p>
            <p className="text-[10px] text-zinc-600">⭐ 4.8 · 147 deliveries</p>
          </div>
          <div className="ml-auto text-right shrink-0">
            <p className="text-[10px] text-zinc-600">ETA</p>
            <p className="text-xs font-semibold text-teal-400">~4 min</p>
          </div>
        </div>
      </div>

      {/* ── Floating bottom card — hidden on mobile ── */}
      <div
        className="animate-fade-in-up hidden sm:flex absolute bottom-2 -right-3 z-10 items-center gap-2.5 rounded-xl border border-white/10 bg-[#111116]/95 backdrop-blur-md px-3.5 py-2.5 shadow-xl"
        style={{ animationDelay: "1000ms" }}
      >
        <div className="relative flex h-6 w-6 shrink-0 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-sky-500/20 animate-ping" />
          <Navigation2 className="relative h-3.5 w-3.5 text-sky-400" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-white">Driver is 1.2 km away</p>
          <p className="text-[10px] text-zinc-500">Arriving in ~4 minutes</p>
        </div>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export function Hero() {
  const [roleIdx, setRoleIdx] = useState(0);
  const [roleFading, setRoleFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleFading(true);
      setTimeout(() => {
        setRoleIdx((i) => (i + 1) % ROLES.length);
        setRoleFading(false);
      }, 280);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex items-center overflow-x-hidden pt-16 sm:pt-20 min-h-[auto] sm:min-h-screen">

      {/* ── Background ── */}
      <div className="absolute inset-0 -z-10">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage: "radial-gradient(circle, #52526a 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Sonar rings — desktop only, toward the card side */}
        <div className="hidden lg:block absolute left-[65%] top-[45%]">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="animate-sonar absolute rounded-full border border-sky-500/[0.12]"
              style={{
                width: "180px",
                height: "180px",
                left: "-90px",
                top: "-90px",
                animationDelay: `${i * 1.33}s`,
              }}
            />
          ))}
        </div>
        {/* Ambient orbs */}
        <div className="absolute left-[10%] top-[25%] h-[300px] w-[300px] sm:h-[480px] sm:w-[480px] rounded-full bg-sky-500/[0.045] blur-[100px] sm:blur-[110px]" />
        <div className="absolute right-[5%] bottom-[20%] h-[200px] w-[200px] sm:h-[320px] sm:w-[320px] rounded-full bg-teal-500/[0.035] blur-[80px] sm:blur-[90px]" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 w-full py-16 sm:py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">

          {/* ── Left — copy ── */}
          {/* min-w-0 is critical: grid items default to min-width:auto which lets
              children overflow the viewport. min-w-0 allows the column to shrink. */}
          <div className="min-w-0">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 sm:px-4 py-1.5 mb-5 sm:mb-7">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shrink-0" />
              <span className="text-xs text-zinc-400">Open-source · Portfolio project</span>
              <span className="h-3 w-px bg-white/10 hidden sm:block" />
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <Github className="h-3 w-3" />
                GitHub
              </a>
            </div>

            {/* Headline — no <br /> on mobile so long words can wrap naturally */}
            <h1 className="text-[1.75rem] sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight text-white mb-4 sm:mb-5">
              Logistics Intelligence{" "}
              <span className="gradient-text block sm:inline">for Modern Africa</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-zinc-400 leading-relaxed mb-7 sm:mb-8 max-w-full">
              A full-stack tracking platform built for{" "}
              <span
                className={cn(
                  "font-semibold text-white inline-block transition-all duration-[280ms]",
                  roleFading ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0"
                )}
              >
                {ROLES[roleIdx]}
              </span>
              {" "}— live GPS, real-time events, automated notifications.
            </p>

            {/* Tracking search */}
            <div className="mb-7 sm:mb-8">
              <TrackingSearch />
            </div>

            {/* CTAs — stack vertically on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-8 sm:mb-10">
              <Link
                href={"/register" as Route}
                className="flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20 w-full sm:w-auto"
              >
                Explore the platform
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                <Github className="h-4 w-4" />
                View source
              </a>
            </div>

            {/* Tech stack pills */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-700 mb-2.5 sm:mb-3 font-medium">
                Built with
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {TECH_STACK.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 sm:px-2.5 py-1 text-[11px] text-zinc-500 font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right — animated card (hidden on mobile, shown md+) ── */}
          <div className="hidden md:flex justify-center lg:justify-end lg:pr-6">
            <LiveTrackingCard />
          </div>
        </div>
      </div>
    </section>
  );
}
