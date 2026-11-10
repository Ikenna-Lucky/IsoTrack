"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  MapPin,
  MousePointer2,
  Package,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { title: "Create a shipment", description: "Add the package, recipient and delivery details." },
  {
    title: "Assign your driver",
    description: "Choose an available driver from your business fleet.",
  },
  {
    title: "Follow the delivery",
    description: "See delivery milestones as your driver makes progress.",
  },
  {
    title: "Confirm handover",
    description: "The recipient shares their eight-digit code with the driver at the door.",
  },
];
const DURATIONS = [1400, 1800, 1800, 1600, 1800, 1600, 1700, 1700, 1800, 1800, 1400, 4000];
const TARGETS = [
  "recipient",
  "recipient",
  "address",
  "create",
  "driver",
  "assign",
  "progress",
  "progress",
  "progress",
  "code",
  "confirm",
  "delivered",
];
const CODE = "62819437";
const RECIPIENT = "Nimi Douglas";
const ADDRESS = "18 Bourdillon Road, Ikoyi";

export function HowItWorks() {
  const root = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [typed, setTyped] = useState(0);
  const [running, setRunning] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const activeStep = phase < 4 ? 0 : phase < 6 ? 1 : phase < 9 ? 2 : 3;
  const delivered = phase === 11;

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(
      ([entry]) => setRunning(Boolean(entry?.isIntersecting) && !motion.matches),
      { threshold: 0.12 },
    );
    const update = () => {
      setPhase(motion.matches ? 11 : 0);
      if (root.current) {
        observer.unobserve(root.current);
        observer.observe(root.current);
      }
    };
    update();
    motion.addEventListener("change", update);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(
      () => setPhase((value) => (value + 1) % DURATIONS.length),
      DURATIONS[phase],
    );
    return () => window.clearTimeout(timer);
  }, [phase, running]);

  useEffect(() => {
    setTyped(0);
    if (!running || ![1, 2, 9].includes(phase)) return;
    const length = phase === 1 ? RECIPIENT.length : phase === 2 ? ADDRESS.length : CODE.length;
    const timer = window.setInterval(
      () => setTyped((value) => Math.min(length, value + 1)),
      phase === 9 ? 140 : 55,
    );
    return () => window.clearInterval(timer);
  }, [phase, running]);

  useLayoutEffect(() => {
    const frame = root.current;
    if (!frame) return;
    const measure = () => {
      const target = frame.querySelector<HTMLElement>(`[data-journey="${TARGETS[phase]}"]`);
      if (!target) return;
      const bounds = frame.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      setPointer({
        x: rect.left - bounds.left + rect.width * 0.75,
        y: rect.top - bounds.top + rect.height * 0.7,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [phase]);

  return (
    <section
      id="how-it-works"
      aria-labelledby="journey-title"
      className="scroll-mt-20 border-y border-[var(--landing-border)] bg-[var(--landing-canvas)] px-7 py-20 min-[600px]:px-12 min-[950px]:px-[55px] min-[1150px]:px-[6vw] lg:py-28"
    >
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
          <h2
            id="journey-title"
            className="max-w-3xl text-3xl font-semibold leading-[1.12] tracking-tight text-[var(--landing-ink)] sm:text-4xl xl:text-[44px]"
          >
            From dispatch to
            <br className="hidden sm:block" /> confirmed handover.
          </h2>
          <p className="max-w-xs text-sm leading-6 text-[var(--landing-muted)]">
            One shipment, followed through every handoff.
            <br />
            Animated walkthrough · Sample data
          </p>
        </div>
        <div ref={root} className="relative">
          <ol className="grid gap-x-8 gap-y-10 min-[700px]:grid-cols-2 min-[1200px]:grid-cols-4">
            {STEPS.map(({ title, description }, index) => (
              <li key={title} className="relative min-w-0">
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors duration-500",
                      activeStep >= index
                        ? "border-teal-300/50 bg-teal-300 text-[#07120d]"
                        : "border-[var(--landing-border)] text-[var(--landing-ink)]0",
                    )}
                  >
                    {activeStep > index || delivered ? <Check className="size-4" /> : index + 1}
                  </span>
                  <div className="h-px flex-1 bg-[var(--landing-tint)]">
                    <div
                      className={cn(
                        "h-full origin-left bg-teal-300 transition-transform duration-700 motion-reduce:transition-none",
                        activeStep > index || delivered ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </div>
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-[var(--landing-ink)]">
                  {title}
                </h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-[var(--landing-muted)]">
                  {description}
                </p>
                <div
                  aria-hidden="true"
                  className={cn(
                    "mt-5 h-[265px] overflow-hidden rounded-md border bg-[var(--landing-panel)] p-4 transition-colors duration-500",
                    activeStep === index ? "border-teal-300/40" : "border-[var(--landing-border)]",
                  )}
                >
                  {index === 0 && (
                    <>
                      <p className="mb-4 flex items-center gap-2 text-xs font-semibold text-[var(--landing-ink)]">
                        <Package className="size-4 text-[var(--landing-accent)]" />
                        New shipment
                      </p>
                      <p className="mb-1.5 text-[11px] text-[var(--landing-muted)]">Recipient</p>
                      <div
                        data-journey="recipient"
                        className="h-9 rounded border border-[var(--landing-border)] bg-[var(--landing-field)] px-2 py-2 text-[11px] text-[var(--landing-ink)]"
                      >
                        {phase === 1 ? (
                          RECIPIENT.slice(0, typed)
                        ) : phase > 1 ? (
                          RECIPIENT
                        ) : (
                          <span className="text-[var(--landing-ink)]0">Recipient name</span>
                        )}
                      </div>
                      <p className="mb-1.5 mt-3 text-[11px] text-[var(--landing-muted)]">
                        Delivery address
                      </p>
                      <div
                        data-journey="address"
                        className="h-9 truncate rounded border border-[var(--landing-border)] bg-[var(--landing-field)] px-2 py-2 text-[11px] text-[var(--landing-ink)]"
                      >
                        {phase === 2 ? (
                          ADDRESS.slice(0, typed)
                        ) : phase > 2 ? (
                          ADDRESS
                        ) : (
                          <span className="text-[var(--landing-ink)]0">Street and city</span>
                        )}
                      </div>
                      <div
                        data-journey="create"
                        className={cn(
                          "mt-4 flex h-9 items-center justify-center gap-2 rounded text-[11px] font-semibold",
                          phase >= 3
                            ? "bg-teal-400/10 text-[var(--landing-accent)]"
                            : "bg-amber-300 text-black",
                        )}
                      >
                        {phase >= 3 && <Check className="size-3.5" />}
                        {phase >= 3 ? "Shipment created" : "Create shipment"}
                      </div>
                    </>
                  )}
                  {index === 1 && (
                    <>
                      <p className="mb-4 flex items-center gap-2 text-xs font-semibold text-[var(--landing-ink)]">
                        <UserCheck className="size-4 text-[var(--landing-accent)]" />
                        Assign driver
                      </p>
                      <p className="mb-3 font-mono text-[10px] text-[var(--landing-muted)]">
                        IST-B3N8R4PT
                      </p>
                      <div
                        data-journey="driver"
                        className={cn(
                          "flex min-h-16 items-center gap-2 rounded border p-2",
                          phase >= 4
                            ? "border-teal-300/30 bg-teal-400/[0.06]"
                            : "border-[var(--landing-border)]",
                        )}
                      >
                        <Image
                          src="/images/demo-driver-tariye.webp"
                          width={32}
                          height={32}
                          alt=""
                          className="size-8 shrink-0 rounded object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-[var(--landing-ink)]">
                            Tariye Dappa
                          </p>
                          <p className="mt-1 text-[10px] text-[var(--landing-accent)]">
                            {phase >= 5 ? "Assigned to shipment" : "Available"}
                          </p>
                        </div>
                        {phase >= 4 ? (
                          <Check className="size-3.5 text-[var(--landing-accent)]" />
                        ) : (
                          <ChevronDown className="size-3.5 text-[var(--landing-muted)]" />
                        )}
                      </div>
                      <div
                        data-journey="assign"
                        className={cn(
                          "mt-4 flex h-9 items-center justify-center gap-2 rounded text-[11px] font-semibold",
                          phase >= 5
                            ? "bg-teal-400/10 text-[var(--landing-accent)]"
                            : "bg-amber-300 text-black",
                        )}
                      >
                        {phase >= 5 && <Check className="size-3.5" />}
                        {phase >= 5 ? "Driver assigned" : "Assign driver"}
                      </div>
                    </>
                  )}
                  {index === 2 && (
                    <>
                      <p className="mb-4 flex items-center gap-2 text-xs font-semibold text-[var(--landing-ink)]">
                        <MapPin className="size-4 text-[var(--landing-accent)]" />
                        Shipment progress
                      </p>
                      <p className="mb-4 font-mono text-[10px] text-[var(--landing-muted)]">
                        IST-B3N8R4PT
                      </p>
                      <div data-journey="progress" className="space-y-4">
                        {["Picked up", "In transit", "Out for delivery", "Delivered"].map(
                          (label, statusIndex) => {
                            const complete =
                              statusIndex === 3 ? delivered : phase >= statusIndex + 6;
                            return (
                              <div key={label} className="flex items-center gap-2.5 text-[11px]">
                                <span
                                  className={cn(
                                    "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-500",
                                    complete
                                      ? "border-teal-300 bg-teal-300 text-black"
                                      : "border-stone-600",
                                  )}
                                >
                                  {complete && <Check className="size-2.5" />}
                                </span>
                                <span
                                  className={
                                    complete
                                      ? "text-[var(--landing-ink)]"
                                      : "text-[var(--landing-ink)]0"
                                  }
                                >
                                  {label}
                                </span>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </>
                  )}
                  {index === 3 && (
                    <>
                      <p className="mb-4 flex items-center gap-2 text-xs font-semibold text-[var(--landing-ink)]">
                        <CheckCircle2 className="size-4 text-[var(--landing-accent)]" />
                        Confirm delivery
                      </p>
                      <p className="text-[11px] leading-5 text-[var(--landing-muted)]">
                        Enter the code shared by the recipient.
                      </p>
                      <div data-journey="code" className="my-4 grid grid-cols-8 gap-1">
                        {CODE.split("").map((digit, digitIndex) => (
                          <span
                            key={digitIndex}
                            className={cn(
                              "flex h-8 items-center justify-center rounded border font-mono text-xs",
                              phase >= 9
                                ? "border-teal-300/40 text-[var(--landing-ink)]"
                                : "border-[var(--landing-border)] text-[var(--landing-muted)]",
                            )}
                          >
                            {phase > 9 || (phase === 9 && digitIndex < typed) ? digit : "·"}
                          </span>
                        ))}
                      </div>
                      <div
                        data-journey={delivered ? "delivered" : "confirm"}
                        className={cn(
                          "mt-4 flex min-h-12 items-center justify-center gap-2 rounded px-2 text-[11px] font-semibold",
                          delivered
                            ? "bg-teal-400/10 text-[var(--landing-accent)]"
                            : "bg-amber-300 text-black",
                        )}
                      >
                        {delivered && <CheckCircle2 className="size-4" />}
                        {delivered ? "Delivery confirmed" : "Confirm delivery"}
                      </div>
                      {delivered && (
                        <p className="mt-3 text-center text-[10px] text-[var(--landing-accent)]">
                          Shipment marked Delivered
                        </p>
                      )}
                    </>
                  )}
                </div>
                {index < 3 && (
                  <>
                    <ArrowRight
                      aria-hidden="true"
                      className={cn(
                        "absolute -right-6 top-[245px] hidden size-4 transition-colors duration-500 min-[1200px]:block",
                        activeStep > index
                          ? "text-[var(--landing-accent)]"
                          : "text-[var(--landing-muted)]",
                      )}
                    />
                    <ArrowDown
                      aria-hidden="true"
                      className={cn(
                        "absolute -bottom-7 left-1/2 size-4 -translate-x-1/2 min-[700px]:hidden",
                        activeStep > index
                          ? "text-[var(--landing-accent)]"
                          : "text-[var(--landing-muted)]",
                      )}
                    />
                  </>
                )}
              </li>
            ))}
          </ol>
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute left-0 top-0 z-10 transition-transform duration-700 ease-in-out motion-reduce:hidden",
              !running && "opacity-0",
            )}
            style={{ transform: `translate(${pointer.x}px, ${pointer.y}px)` }}
          >
            <MousePointer2 className="size-5 fill-white text-[#080b0b] drop-shadow-md" />
          </div>
        </div>
      </div>
    </section>
  );
}
