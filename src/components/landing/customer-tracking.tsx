"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bell,
  Check,
  ChevronLeft,
  ExternalLink,
  Mail,
  MousePointer2,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DURATIONS = [2200, 2200, 2200, 2500, 2200, 1700, 4500];
const TARGETS = ["link", "timeline", "timeline", "timeline", "email", "message", "code"];
const CODE = "62819437";

function TrackingPhone() {
  const root = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [running, setRunning] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(
      ([entry]) => setRunning(Boolean(entry?.isIntersecting) && !motion.matches),
      { threshold: 0.3 },
    );
    const update = () => {
      setPhase(motion.matches ? 6 : 0);
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

  useLayoutEffect(() => {
    const frame = root.current;
    if (!frame) return;
    const measure = () => {
      const target = frame.querySelector<HTMLElement>(`[data-tracking="${TARGETS[phase]}"]`);
      if (!target) return;
      const box = frame.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      setPointer({
        x: rect.left - box.left + rect.width * 0.7,
        y: rect.top - box.top + rect.height * 0.65,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [phase]);

  const email = phase >= 5;
  const current = phase >= 3 ? 3 : phase === 2 ? 2 : 1;

  return (
    <figure className="relative mx-auto w-full max-w-[296px]">
      <div
        aria-hidden="true"
        className="relative rounded-[40px] border-2 border-[#56635b] bg-[#171e1a] p-[7px] shadow-2xl shadow-black/50"
      >
        <div ref={root} className="relative h-[535px] overflow-hidden rounded-[31px] bg-[#09110d]">
          <div className="flex h-9 items-center justify-between px-5 text-[9px] font-medium text-stone-400">
            <span>9:41</span>
            <span className="h-3 w-16 rounded-full bg-black" />
            <span className="h-2 w-4 rounded-sm border border-stone-500 bg-stone-400" />
          </div>
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-100">
              {email ? (
                <Mail className="size-4 text-teal-200" />
              ) : (
                <Image src="/images/isotrack-mark-trimmed.png" alt="" width={19} height={19} />
              )}
              {email ? "Recipient email" : "IsoTrack"}
            </div>
            <span className="text-[8px] text-stone-400">Sample data</span>
          </div>
          <div className="p-4">
            {phase === 0 ? (
              <>
                <p className="mt-5 text-lg font-semibold leading-tight text-stone-100">
                  A delivery is
                  <br />
                  on its way to you.
                </p>
                <p className="mt-4 text-xs leading-6 text-stone-400">
                  Your business has shared a tracking link. Open it to follow your shipment.
                </p>
                <div
                  data-tracking="link"
                  className="mt-6 rounded-md border border-teal-300/25 bg-teal-400/10 p-3"
                >
                  <p className="font-mono text-[11px] text-teal-100">IST-B3N8R4PT</p>
                  <p className="mt-3 flex items-center justify-between text-xs font-medium text-teal-200">
                    Track your shipment
                    <ExternalLink className="size-3.5" />
                  </p>
                </div>
                <p className="mt-5 flex items-center gap-2 text-[10px] text-stone-400">
                  <ShieldCheck className="size-3.5 text-teal-200" />
                  No account needed to track.
                </p>
              </>
            ) : email ? (
              <>
                <p className="mb-5 flex items-center gap-1 text-[10px] text-stone-400">
                  <ChevronLeft className="size-3" />
                  Inbox
                </p>
                <div data-tracking="message">
                  <p className="text-base font-semibold leading-6 text-stone-100">
                    Your delivery
                    <br />
                    confirmation code
                  </p>
                  <p className="mt-3 text-[10px] text-stone-400">
                    From IsoTrack · To the recipient
                  </p>
                </div>
                <p className="mt-5 text-xs leading-6 text-stone-300">
                  Your code for shipment <span className="font-mono text-[10px]">IST-B3N8R4PT</span>
                  :
                </p>
                <div
                  data-tracking="code"
                  className="my-4 rounded-md border border-teal-300/25 bg-teal-400/10 px-2 py-4 text-center font-mono text-xl tracking-[0.18em] text-teal-100"
                >
                  {phase === 6 ? CODE : "········"}
                </div>
                <p className="text-xs leading-6 text-stone-300">
                  Share it with the assigned driver only after receiving your package.
                </p>
                <p className="mt-4 text-[10px] leading-5 text-stone-500">
                  Expires 20 minutes after it was requested. Keep this code private.
                </p>
              </>
            ) : (
              <>
                <p className="text-[9px] uppercase tracking-wider text-stone-400">
                  Shipment tracking
                </p>
                <p className="mt-2 font-mono text-sm font-semibold text-stone-100">IST-B3N8R4PT</p>
                <div className="mt-3 flex items-center gap-2 rounded-md border border-teal-400/25 bg-teal-400/10 px-3 py-2 text-[11px] font-medium text-teal-200">
                  <Truck className="size-3.5" />
                  {current === 3 ? "Out for delivery" : current === 2 ? "In transit" : "Picked up"}
                </div>
                <p className="mt-3 text-[11px] leading-5 text-stone-400">
                  {current === 3
                    ? "The driver is completing the final handoff."
                    : "Your package is making its way to you."}
                </p>
                <div data-tracking="timeline" className="mt-5">
                  {["Order placed", "Package picked up", "In transit", "Out for delivery"].map(
                    (label, index) => (
                      <div key={label} className="relative flex gap-3 pb-5 last:pb-0">
                        {index < 3 && (
                          <div
                            className={cn(
                              "absolute left-[7px] top-4 h-6 w-px transition-colors duration-500",
                              current > index ? "bg-teal-300/60" : "bg-stone-700",
                            )}
                          />
                        )}
                        <span
                          className={cn(
                            "relative z-10 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-500",
                            index <= current
                              ? "border-teal-300 bg-teal-300 text-black"
                              : "border-stone-600 bg-[#09110d]",
                          )}
                        >
                          {index <= current && <Check className="size-2.5" />}
                        </span>
                        <span
                          className={cn(
                            "text-[11px]",
                            index <= current ? "text-stone-200" : "text-stone-500",
                          )}
                        >
                          {label}
                        </span>
                      </div>
                    ),
                  )}
                </div>
                <div
                  data-tracking="email"
                  className={cn(
                    "mt-5 rounded-md border px-3 py-3 transition-opacity duration-500",
                    phase === 4
                      ? "border-teal-300/30 bg-[#162c21] opacity-100"
                      : "border-transparent opacity-0",
                  )}
                >
                  <p className="flex items-center gap-2 text-[10px] font-medium text-teal-100">
                    <Mail className="size-3.5" />
                    New email from IsoTrack
                  </p>
                  <p className="mt-1.5 text-[10px] text-stone-300">
                    Your delivery confirmation code
                  </p>
                </div>
              </>
            )}
          </div>
          <div
            className={cn(
              "pointer-events-none absolute left-0 top-0 transition-transform duration-700 ease-in-out motion-reduce:hidden",
              !running && "opacity-0",
            )}
            style={{ transform: `translate(${pointer.x}px, ${pointer.y}px)` }}
          >
            <MousePointer2 className="size-5 fill-white text-[#080b0b] drop-shadow-md" />
          </div>
          <div className="absolute bottom-2 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-stone-600" />
        </div>
      </div>
      <figcaption className="sr-only">
        Sample customer journey: open a shared tracking link, follow pickup and delivery updates,
        then read the private eight-digit confirmation code in a recipient email. The code is not
        shown on the public tracking page.
      </figcaption>
    </figure>
  );
}

export function CustomerTracking() {
  return (
    <section
      id="roles"
      aria-labelledby="customer-tracking-title"
      className="scroll-mt-20 overflow-hidden bg-[#0d211a] px-7 py-20 min-[600px]:px-12 min-[950px]:px-[55px] min-[1150px]:px-[6vw] lg:py-28"
    >
      <div className="mx-auto grid max-w-[1320px] items-center gap-12 lg:grid-cols-[0.85fr_1.3fr] lg:gap-16">
        <div className="max-w-lg">
          <h2
            id="customer-tracking-title"
            className="text-3xl font-semibold leading-[1.12] tracking-tight text-stone-100 sm:text-4xl xl:text-[44px]"
          >
            Your customer stays
            <br className="hidden xl:block" /> in the loop.
          </h2>
          <p className="mt-6 text-base leading-7 text-stone-300">
            Share one tracking link so customers can follow their delivery, from pickup to the final
            handover.
          </p>
          <div className="mt-8 space-y-6">
            <div className="flex gap-3">
              <Bell className="mt-0.5 size-5 shrink-0 text-teal-200" />
              <div>
                <h3 className="text-sm font-semibold text-stone-100">Progress they can follow</h3>
                <p className="mt-2 text-sm leading-6 text-stone-400">
                  Clear delivery milestones show where the shipment stands.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Mail className="mt-0.5 size-5 shrink-0 text-teal-200" />
              <div>
                <h3 className="text-sm font-semibold text-stone-100">
                  A private code for handover
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-400">
                  The recipient receives their confirmation code by email and shares it after
                  receiving the package.
                </p>
              </div>
            </div>
          </div>
          <a
            href="#shipment-tracking"
            className="mt-8 inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-teal-100 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300"
          >
            Track a shipment
            <ArrowRight className="size-4" />
          </a>
        </div>
        <div className="relative min-w-0 sm:pb-12">
          <div className="relative ml-auto hidden h-[550px] w-[76%] overflow-hidden rounded-lg sm:block">
            <Image
              src="/images/customer-handover.webp"
              alt="A customer receiving a parcel from a delivery driver at her doorway"
              fill
              sizes="(min-width: 1024px) 42vw, 70vw"
              className="object-cover object-[65%_center]"
            />
          </div>
          <div className="relative z-10 sm:absolute sm:bottom-0 sm:left-0 sm:w-[296px]">
            <TrackingPhone />
          </div>
        </div>
      </div>
    </section>
  );
}
