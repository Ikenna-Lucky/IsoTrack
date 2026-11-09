"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Mail,
  MousePointer2,
  Plus,
  Send,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EMAIL = "tariye@example.com";
const DURATIONS = [1800, 1000, 2200, 1400, 2300, 2400, 3500];
const TARGETS = ["invite", "invite", "email", "send", "pending", "accept", "joined"];

function InvitationPreview() {
  const root = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [letters, setLetters] = useState(0);
  const [running, setRunning] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(
      ([entry]) => setRunning(Boolean(entry?.isIntersecting) && !motion.matches),
      { threshold: 0.5 },
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

  useEffect(() => {
    setLetters(0);
    if (phase !== 2 || !running) return;
    const timer = window.setInterval(
      () => setLetters((value) => Math.min(EMAIL.length, value + 1)),
      75,
    );
    return () => window.clearInterval(timer);
  }, [phase, running]);

  useLayoutEffect(() => {
    const frame = root.current;
    if (!frame) return;
    const measure = () => {
      const target = frame.querySelector<HTMLElement>(`[data-target="${TARGETS[phase]}"]`);
      if (!target) return;
      const bounds = frame.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      setPointer({
        x: rect.left - bounds.left + rect.width * 0.7,
        y: rect.top - bounds.top + rect.height * 0.7,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [phase]);

  const formOpen = phase >= 1 && phase <= 3;
  return (
    <div
      ref={root}
      aria-hidden="true"
      className="relative h-[340px] overflow-hidden rounded-lg border border-white/15 bg-[#0d1412] text-stone-100 shadow-2xl shadow-black/40 sm:h-[310px]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
        <div>
          <p className="text-sm font-semibold">Your fleet</p>
          <p className="mt-1 text-[11px] text-stone-400">Invitation walkthrough · Sample data</p>
        </div>
        <div
          data-target="invite"
          className="flex shrink-0 items-center gap-1.5 rounded bg-amber-300 px-2.5 py-2 text-[11px] font-semibold text-black"
        >
          <Plus className="size-3.5" />
          Invite driver
        </div>
      </div>
      <div className="px-4 py-4">
        {formOpen ? (
          <div className="rounded-md border border-white/10 bg-[#111c17] p-4">
            <div className="mb-4 flex items-center justify-between text-xs font-semibold">
              Invite a driver
              <X className="size-3.5 text-stone-400" />
            </div>
            <p className="mb-2 text-[11px] text-stone-300">Driver email</p>
            <div
              data-target="email"
              className={cn(
                "flex h-10 items-center gap-2 rounded border bg-black/25 px-2.5 text-xs",
                phase === 2
                  ? "border-teal-400/60 text-stone-100"
                  : "border-white/15 text-stone-400",
              )}
            >
              <Mail className="size-3.5 shrink-0 text-stone-400" />
              {phase === 1 ? "name@example.com" : phase === 2 ? EMAIL.slice(0, letters) : EMAIL}
              {phase === 2 && <span className="h-3.5 w-px bg-teal-300" />}
            </div>
            <div
              data-target="send"
              className="mt-3 flex items-center justify-center gap-2 rounded bg-amber-300 px-3 py-2.5 text-[11px] font-semibold text-black"
            >
              <Send className="size-3" />
              Send invitation
            </div>
          </div>
        ) : phase === 5 ? (
          <div className="rounded-md border border-teal-400/25 bg-teal-400/[0.06] p-4">
            <p className="flex items-center gap-2 text-xs font-semibold text-teal-200">
              <Mail className="size-4" />
              On the driver’s side
            </p>
            <p className="mt-3 text-sm font-medium">You’ve been invited to join a fleet.</p>
            <p className="mt-2 text-[11px] leading-5 text-stone-400">
              The driver opens their invitation and completes account setup.
            </p>
            <div
              data-target="accept"
              className="mt-3 flex items-center justify-center gap-2 rounded bg-teal-300 px-3 py-2.5 text-[11px] font-semibold text-[#07120d]"
            >
              <UserCheck className="size-3.5" />
              Accept invitation
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-white/[0.07] pb-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-teal-400/10">
                <ShieldCheck className="size-5 text-teal-200" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium">Your business team</p>
                <p className="mt-1 text-[11px] text-stone-400">Only your invited drivers</p>
              </div>
            </div>
            <div
              data-target={phase === 6 ? "joined" : "pending"}
              className="mt-4 flex items-center gap-3"
            >
              <Image
                src="/images/demo-driver-tariye.webp"
                width={40}
                height={40}
                alt=""
                className="size-10 shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="break-all text-xs font-semibold">{phase === 4 ? EMAIL : "Tariye Dappa"}</p>
                <p className="mt-1 text-[11px] text-stone-400">
                  {phase === 6
                    ? "Joined your business fleet"
                    : phase === 4
                      ? "Waiting for driver acceptance"
                      : "Invite a driver to your team"}
                </p>
              </div>
              {phase === 6 ? (
                <span className="flex items-center gap-1 rounded border border-teal-400/20 bg-teal-400/10 px-2 py-1 text-[10px] text-teal-200">
                  <Check className="size-3" />
                  Joined
                </span>
              ) : phase === 4 ? (
                <span className="rounded border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-[10px] text-amber-200">
                  Pending
                </span>
              ) : (
                <Plus className="size-4 text-stone-500" />
              )}
            </div>
            <p className="mt-5 text-[11px] leading-5 text-stone-400">
              {phase === 6
                ? "Fleet membership confirmed. Deliveries can now be assigned within your team."
                : phase === 4
                  ? "Invitation sent. The driver joins only after accepting it."
                  : "Send an invitation. Your driver accepts it to join."}
            </p>
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
    </div>
  );
}

export function PrivateFleet() {
  return (
    <section
      id="features"
      aria-labelledby="private-fleet-title"
      className="scroll-mt-20 bg-[#0c100e] px-7 py-20 min-[600px]:px-12 min-[950px]:px-[55px] min-[1150px]:px-[6vw] lg:py-28"
    >
      <div className="mx-auto grid max-w-[1320px] items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
        <figure className="relative min-w-0 pb-10 sm:pb-14">
          <div className="relative aspect-[5/4] overflow-hidden rounded-lg bg-[#18231c]">
            <Image
              src="/images/private-fleet-driver.webp"
              alt="A delivery driver checking his phone beside a parked van"
              fill
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="relative z-10 -mt-20 ml-auto w-[94%] max-w-[390px] sm:-mt-36 sm:-mr-4">
            <InvitationPreview />
          </div>
          <figcaption className="sr-only">
            Sample invitation flow: a business sends a driver invitation, it remains pending, then
            the driver accepts and joins the private fleet.
          </figcaption>
        </figure>
        <div className="max-w-lg">
          <h2
            id="private-fleet-title"
            className="text-3xl font-semibold leading-[1.12] tracking-tight text-stone-100 sm:text-4xl xl:text-[44px]"
          >
            A fleet that belongs
            <br className="hidden xl:block" /> to your business.
          </h2>
          <p className="mt-6 text-base leading-7 text-stone-400">
            Invite the drivers you work with and keep deliveries within your own team. Each driver
            joins through your invitation and belongs to one business at a time.
          </p>
          <p className="mt-5 text-base leading-7 text-stone-400">
            See who is available, check vehicle details and choose who handles the next shipment.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex min-h-11 items-center gap-3 rounded-md border border-teal-300/40 px-5 py-3 text-sm font-semibold text-teal-100 transition hover:bg-teal-400/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300"
          >
            Build your fleet
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
