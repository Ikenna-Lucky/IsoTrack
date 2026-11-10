"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock,
  LayoutDashboard,
  Loader2,
  Menu,
  MousePointer2,
  Package,
  Plus,
  Search,
  Settings,
  Truck,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DURATIONS = [2000, 1000, 1500, 1500, 1500, 1200, 1000, 3500];
const TARGETS = [
  "pending",
  "pending",
  "shipment",
  "driver",
  "option",
  "assign",
  "assign",
  "shipment",
];
const LINKS = [
  { label: "Overview", Icon: LayoutDashboard },
  { label: "Shipments", Icon: Package },
  { label: "Drivers", Icon: Truck },
  { label: "Analytics", Icon: BarChart3 },
];

function ShipmentWalkthrough() {
  const frame = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const pending = step >= 2 && step < 7;
  const expanded = step >= 3;
  const selected = step >= 5;
  const assigned = step === 7;

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(
      ([entry]) => setRunning(Boolean(entry?.isIntersecting) && !motion.matches),
      { threshold: 0.25 },
    );
    const update = () => {
      setStep(motion.matches ? 7 : 0);
      if (frame.current) {
        observer.unobserve(frame.current);
        observer.observe(frame.current);
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
      () => setStep((value) => (value + 1) % DURATIONS.length),
      DURATIONS[step],
    );
    return () => window.clearTimeout(timer);
  }, [running, step]);

  useLayoutEffect(() => {
    const root = frame.current;
    if (!root) return;
    const measure = () => {
      const target = root.querySelector<HTMLElement>(`[data-cursor="${TARGETS[step]}"]`);
      if (!target) return;
      const bounds = root.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      setPointer({
        x: rect.left - bounds.left + rect.width * 0.65,
        y: rect.top - bounds.top + rect.height * 0.65,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [step]);

  return (
    <figure className="min-w-0">
      <div className="relative mx-auto h-[570px] max-w-[352px] overflow-hidden sm:h-auto sm:max-w-none sm:overflow-visible">
        <div className="relative rounded-t-[42px] border-[2px] border-[#4b514f] bg-[#161b19] p-[7px] pt-9 shadow-2xl shadow-black/40 sm:rounded-t-xl sm:rounded-b-md sm:border sm:p-2 sm:pt-6">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-3 h-1.5 w-14 -translate-x-1/2 rounded-full bg-black sm:top-2 sm:h-1.5 sm:w-1.5 sm:ring-1 sm:ring-white/10"
          />
          <div
            ref={frame}
            aria-hidden="true"
            className="relative overflow-hidden rounded-t-[28px] border border-[var(--landing-border)] bg-[var(--landing-canvas)] sm:rounded-sm"
          >
            <div className="flex h-[600px] sm:h-[470px]">
              <aside className="hidden w-[110px] shrink-0 flex-col border-r border-[var(--landing-border)] bg-[var(--landing-canvas)] p-2 sm:flex xl:w-[132px] xl:p-3">
                <div className="flex items-center gap-2 py-2 text-sm font-bold text-[var(--landing-ink)]">
                  <Image src="/images/isotrack-mark-trimmed.png" alt="" width={20} height={20} />
                  IsoTrack
                </div>
                <div className="mb-5 text-[9px] uppercase tracking-widest text-[var(--landing-warning)]">
                  Business
                </div>
                <div className="mb-5 flex items-center gap-1 rounded bg-amber-300 px-2 py-2 text-[10px] font-bold text-black">
                  <Plus className="size-3" />
                  New shipment
                </div>
                {LINKS.map(({ label, Icon }) => (
                  <div
                    key={label}
                    className={cn(
                      "mb-1 flex items-center gap-2 rounded border border-transparent px-2 py-2.5 text-[10px] text-[var(--landing-muted)]",
                      label === "Shipments" &&
                        "border-teal-400/25 bg-teal-400/10 text-[var(--landing-accent)]",
                    )}
                  >
                    <Icon className="size-3.5" />
                    {label}
                  </div>
                ))}
                <div className="mt-auto flex items-center gap-2 px-2 py-2 text-[10px] text-[var(--landing-muted)]">
                  <Settings className="size-3.5" />
                  Settings
                </div>
              </aside>
              <div className="min-w-0 flex-1">
                <div className="flex h-12 items-center justify-between border-b border-[var(--landing-border)] px-4 text-xs font-semibold text-[var(--landing-ink)]">
                  <span className="flex items-center gap-2">
                    <Menu className="size-4 text-[var(--landing-muted)] sm:hidden" />
                    Shipments
                  </span>
                  <span className="rounded bg-[var(--landing-tint)] px-2 py-1 text-[9px] font-normal text-[var(--landing-muted)]">
                    Sample data
                  </span>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="rounded-md border border-[var(--landing-border)] bg-[var(--landing-panel)] p-3">
                    <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--landing-accent)]">
                      Shipment manifest
                    </p>
                    <p className="mt-1 text-lg font-bold text-[var(--landing-ink)]">Shipments</p>
                    <div className="mt-3 flex items-center gap-2 rounded border border-[var(--landing-border)] bg-[var(--landing-field)] px-2 py-2 text-[10px] text-[var(--landing-muted)]">
                      <Search className="size-3" />
                      Search manifest
                      <Plus className="ml-auto size-4 text-amber-300" />
                    </div>
                  </div>
                  <div className="my-3 flex gap-1">
                    {["All", "Active", "Pending", "Delivered", "Failed"].map((label) => (
                      <div
                        key={label}
                        data-cursor={label === "Pending" ? "pending" : undefined}
                        className={cn(
                          "rounded border border-[var(--landing-border)] px-1.5 py-1.5 text-[9px] text-[var(--landing-muted)]",
                          (pending ? label === "Pending" : label === "All") &&
                            "border-teal-400/30 bg-teal-400/10 text-[var(--landing-accent)]",
                        )}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                  <div className="overflow-hidden rounded-md border border-[var(--landing-border)] bg-[var(--landing-panel)]">
                    <div data-cursor="shipment" className="flex items-center gap-2 px-3 py-3">
                      <div
                        className={cn(
                          "rounded border p-2",
                          assigned
                            ? "border-teal-400/25 bg-teal-400/10 text-[var(--landing-accent)]"
                            : "border-amber-400/25 bg-amber-400/10 text-[var(--landing-warning)]",
                        )}
                      >
                        {assigned ? (
                          <UserCheck className="size-3.5" />
                        ) : (
                          <Clock className="size-3.5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[10px] font-bold text-[var(--landing-ink)]">
                          IST-B3N8R4PT
                        </p>
                        <p className="mt-1 text-[10px] text-[var(--landing-muted)]">
                          Yaba to Ikoyi
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded border px-2 py-1 text-[9px]",
                          assigned
                            ? "border-teal-400/25 bg-teal-400/10 text-[var(--landing-accent)]"
                            : "border-amber-400/25 bg-amber-400/10 text-[var(--landing-warning)]",
                        )}
                      >
                        {assigned ? "Assigned" : "Pending"}
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-3 text-[var(--landing-muted)]",
                          expanded && "rotate-180",
                        )}
                      />
                    </div>
                    {expanded && (
                      <div className="border-t border-[var(--landing-border)] bg-[var(--landing-field)] p-3">
                        <div className="mb-3 flex justify-between text-[10px] text-[var(--landing-muted)]">
                          <span>Package · 2 kg</span>
                          <span className="text-[var(--landing-accent)]">Paid</span>
                        </div>
                        <div className="rounded border border-[var(--landing-border)] bg-[var(--landing-tint)] p-3">
                          <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.15em] text-[var(--landing-muted)]">
                            Dispatch action
                          </p>
                          {assigned ? (
                            <div className="rounded border border-teal-400/20 bg-teal-400/10 p-3">
                              <p className="flex items-center gap-2 text-xs font-bold text-[var(--landing-accent)]">
                                <CheckCircle2 className="size-4" />
                                Tariye Dappa
                              </p>
                              <p className="mt-1 text-[10px] text-[var(--landing-muted)]">
                                Motorcycle · LAG-482-KD
                              </p>
                            </div>
                          ) : (
                            <>
                              <div
                                data-cursor="driver"
                                className="flex items-center justify-between rounded border border-[var(--landing-border)] bg-[var(--landing-field)] px-2 py-2 text-[10px] text-[var(--landing-ink)]"
                              >
                                {selected ? "Tariye Dappa · LAG-482-KD" : "Select available driver"}
                                <ChevronDown className="size-3" />
                              </div>
                              {step === 4 && (
                                <div
                                  data-cursor="option"
                                  className="mt-1 rounded border border-teal-400/25 bg-[var(--landing-selection)] px-2 py-2 text-[10px] text-[var(--landing-accent)]"
                                >
                                  Tariye Dappa · LAG-482-KD
                                </div>
                              )}
                              <div
                                data-cursor="assign"
                                className={cn(
                                  "mt-2 flex items-center justify-center gap-2 rounded bg-amber-300 px-2 py-2 text-[10px] font-bold text-black",
                                  !selected && "opacity-40",
                                )}
                              >
                                {step === 6 ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  <UserCheck className="size-3" />
                                )}
                                {step === 6 ? "Assigning…" : "Assign driver"}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {!pending &&
                    !expanded &&
                    ["In transit", "Failed"].map((status, index) => (
                      <div
                        key={status}
                        className="mt-2 flex items-center gap-2 rounded border border-[var(--landing-border)] bg-[var(--landing-panel)] px-3 py-3"
                      >
                        <Package className="size-4 text-[var(--landing-muted)]" />
                        <span className="flex-1 font-mono text-[10px] text-[var(--landing-ink)]">
                          {index === 0 ? "IST-W9QK7LMN" : "IST-K7X2M9PQ"}
                        </span>
                        <span
                          className={cn(
                            "text-[9px]",
                            index === 0
                              ? "text-[var(--landing-accent)]"
                              : "text-[var(--landing-danger)]",
                          )}
                        >
                          {status}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div
              className={cn(
                "pointer-events-none absolute left-0 top-0 z-10 transition-transform duration-700 ease-in-out motion-reduce:hidden",
                !running && "opacity-0",
              )}
              style={{ transform: `translate(${pointer.x}px, ${pointer.y}px)` }}
            >
              <MousePointer2 className="size-5 fill-white text-[#080b0a] drop-shadow-md" />
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="relative -mx-3 hidden h-4 rounded-b-[50%_65%] border-t border-[#6a716d] bg-linear-to-b from-[#444c47] via-[#242b27] to-[#131815] shadow-xl shadow-black/40 sm:block"
        >
          <div className="mx-auto h-1.5 w-1/5 rounded-b-md bg-[#101512] shadow-[inset_0_1px_2px_#000]" />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-[var(--landing-canvas)] to-transparent sm:hidden"
        />
      </div>
      <figcaption className="mt-4 text-center text-xs leading-5 text-[var(--landing-ink)]0">
        Business workspace · Sample shipment and driver data
        <span className="sr-only">
          . Animated walkthrough: filter pending shipments, expand a shipment, select Tariye Dappa
          and assign the driver. The shipment changes from Pending to Assigned.
        </span>
      </figcaption>
    </figure>
  );
}

export function OperationsWalkthrough() {
  return (
    <section
      id="dispatch-preview"
      aria-labelledby="dispatch-preview-title"
      className="scroll-mt-20 border-t border-[var(--landing-border)] bg-[var(--landing-canvas)] px-7 py-20 min-[600px]:px-12 min-[950px]:px-[55px] min-[1150px]:px-[6vw] lg:py-28"
    >
      <div className="mx-auto grid max-w-[1320px] items-center gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <ShipmentWalkthrough />
        <div className="max-w-lg">
          <h2
            id="dispatch-preview-title"
            className="text-3xl font-semibold leading-[1.12] tracking-tight text-[var(--landing-ink)] sm:text-4xl xl:text-[44px]"
          >
            See what needs attention.
            <br />
            <span className="text-[var(--landing-accent)]">Know what to do next.</span>
          </h2>
          <p className="mt-6 text-base leading-7 text-[var(--landing-muted)]">
            Find a pending shipment, choose an available driver from your fleet and put the delivery
            in motion. The assignment stays with the shipment, so your team can see who is handling
            it.
          </p>
          <p className="mt-6 text-sm leading-6 text-[var(--landing-ink)]">
            Watch one complete assignment, from pending to assigned.
          </p>
          <a
            href="#how-it-works"
            className="mt-8 inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-[var(--landing-accent)] transition hover:text-[var(--landing-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-accent)]"
          >
            Follow the delivery journey
            <ArrowRight className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
