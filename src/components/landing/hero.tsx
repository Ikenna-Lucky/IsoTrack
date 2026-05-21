"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, Github } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES = ["businesses", "drivers", "customers"];

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

// ─── Constellation data ───────────────────────────────────────────────────────
// viewBox 360 × 460 — Lagos delivery network as glowing nodes

const CNODES = [
  {
    id: "lekki",
    label: "Lekki",
    x: 294,
    y: 72,
    r: 5.5,
    lx: 294,
    ly: 59,
    anchor: "middle",
    hub: false,
  },
  { id: "vi", label: "VI", x: 172, y: 148, r: 8.5, lx: 172, ly: 132, anchor: "middle", hub: true },
  {
    id: "ikoyi",
    label: "Ikoyi",
    x: 244,
    y: 200,
    r: 4.5,
    lx: 254,
    ly: 204,
    anchor: "start",
    hub: false,
  },
  { id: "ikeja", label: "Ikeja", x: 74, y: 90, r: 6, lx: 74, ly: 77, anchor: "middle", hub: false },
  {
    id: "surulere",
    label: "Surulere",
    x: 92,
    y: 238,
    r: 4,
    lx: 80,
    ly: 242,
    anchor: "end",
    hub: false,
  },
  {
    id: "ajah",
    label: "Ajah",
    x: 322,
    y: 162,
    r: 3.5,
    lx: 332,
    ly: 166,
    anchor: "start",
    hub: false,
  },
  {
    id: "ojodu",
    label: "Ojodu",
    x: 50,
    y: 322,
    r: 3.5,
    lx: 38,
    ly: 326,
    anchor: "end",
    hub: false,
  },
  {
    id: "apapa",
    label: "Apapa",
    x: 148,
    y: 355,
    r: 4.5,
    lx: 148,
    ly: 369,
    anchor: "middle",
    hub: false,
  },
  { id: "yaba", label: "", x: 138, y: 174, r: 2.8, lx: 0, ly: 0, anchor: "middle", hub: false },
  {
    id: "gbagada",
    label: "Gbagada",
    x: 204,
    y: 292,
    r: 4,
    lx: 214,
    ly: 296,
    anchor: "start",
    hub: false,
  },
] as const satisfies {
  id: string;
  label: string;
  x: number;
  y: number;
  r: number;
  lx: number;
  ly: number;
  anchor: string;
  hub: boolean;
}[];

const CNODE_MAP: Record<string, { x: number; y: number }> = Object.fromEntries(
  CNODES.map((n) => [n.id, { x: n.x, y: n.y }]),
);

const CLINES: { from: string; to: string; delay: number }[] = [
  { from: "ikeja", to: "yaba", delay: 0 },
  { from: "yaba", to: "vi", delay: 0.4 },
  { from: "yaba", to: "surulere", delay: 0.8 },
  { from: "vi", to: "lekki", delay: 0.2 },
  { from: "vi", to: "ikoyi", delay: 0.6 },
  { from: "vi", to: "gbagada", delay: 1.0 },
  { from: "lekki", to: "ikoyi", delay: 1.2 },
  { from: "lekki", to: "ajah", delay: 1.4 },
  { from: "surulere", to: "ojodu", delay: 1.6 },
  { from: "surulere", to: "apapa", delay: 1.8 },
  { from: "apapa", to: "gbagada", delay: 2.0 },
];

// Very faint background stars for depth
const STARS = [
  { x: 40, y: 38, r: 0.9 },
  { x: 118, y: 22, r: 0.8 },
  { x: 198, y: 28, r: 1.1 },
  { x: 338, y: 48, r: 0.7 },
  { x: 28, y: 182, r: 0.9 },
  { x: 258, y: 138, r: 0.8 },
  { x: 348, y: 238, r: 1.0 },
  { x: 308, y: 342, r: 0.8 },
  { x: 62, y: 402, r: 0.9 },
  { x: 238, y: 382, r: 0.7 },
  { x: 82, y: 142, r: 0.7 },
  { x: 316, y: 98, r: 0.8 },
  { x: 130, y: 336, r: 0.7 },
  { x: 268, y: 252, r: 0.9 },
  { x: 178, y: 418, r: 1.0 },
];

// Delivery dot travel path (loops all major nodes)
// Ikeja → Yaba → VI → Lekki → Ajah → Lekki → Ikoyi → VI → Gbagada → Apapa → Surulere → Ojodu → Surulere → Yaba → Ikeja
const DOT_PATH =
  "M74,90 C104,130 122,158 138,174 " +
  "C153,164 163,156 172,148 " +
  "C222,108 258,86 294,72 " +
  "C308,116 316,140 322,162 " +
  "C316,140 308,116 294,72 " +
  "C270,136 257,168 244,200 " +
  "C214,178 193,163 172,148 " +
  "C184,212 194,252 204,292 " +
  "C178,324 163,340 148,355 " +
  "C126,308 109,273 92,238 " +
  "C76,280 63,302 50,322 " +
  "C63,302 76,280 92,238 " +
  "C114,210 126,192 138,174 " +
  "C112,142 94,116 74,90";

// ─── Count-up hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, durationMs: number, delayMs: number): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const outer = setTimeout(() => {
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / durationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delayMs);
    return () => clearTimeout(outer);
  }, [target, durationMs, delayMs]);
  return value;
}

// ─── Constellation line ───────────────────────────────────────────────────────

function CLine({ from, to, delay }: { from: string; to: string; delay: number }) {
  const a = CNODE_MAP[from]!;
  const b = CNODE_MAP[to]!;
  const len = Math.round(Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2));
  const pDur = (2.8 + delay * 0.4).toFixed(1);
  const pBegin = (delay + 1.6).toFixed(1);
  const dBegin = (delay + 0.2).toFixed(1);

  return (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke="url(#cg)"
      strokeWidth="0.85"
      strokeDasharray={`${len} ${len}`}
      strokeDashoffset={len}
      strokeLinecap="round"
      strokeOpacity="0.14"
    >
      <animate
        attributeName="stroke-dashoffset"
        from={len}
        to={0}
        dur="1.1s"
        begin={`${dBegin}s`}
        fill="freeze"
      />
      <animate
        attributeName="stroke-opacity"
        values="0.08;0.26;0.08"
        dur={`${pDur}s`}
        begin={`${pBegin}s`}
        repeatCount="indefinite"
      />
    </line>
  );
}

// ─── Constellation view ───────────────────────────────────────────────────────

function ConstellationView() {
  const active = useCountUp(12, 900, 2400);
  const online = useCountUp(8, 700, 2900);
  const revenue = useCountUp(128, 1100, 3200);

  return (
    <div className="relative w-full max-w-105 h-130">
      <style>{`
        @keyframes cStatFloat {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-5px); }
        }
        @keyframes cStatIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* No border, no card — pure SVG in space */}
      <svg
        viewBox="0 0 360 460"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ overflow: "visible" }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
          <radialGradient id="cng" cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#0284c7" />
          </radialGradient>
          <filter id="cglow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="chub" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <path id="c-dp" d={DOT_PATH} />
        </defs>

        {/* Background starfield */}
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="white"
            fillOpacity={0.07 + (i % 3) * 0.02}
          />
        ))}

        {/* Connection lines */}
        {CLINES.map((l) => (
          <CLine key={`${l.from}-${l.to}`} from={l.from} to={l.to} delay={l.delay} />
        ))}

        {/* Nodes */}
        {CNODES.map((node, i) => {
          const enterBegin = `${i * 0.12 + 0.25}s`;
          return (
            <g key={node.id}>
              {/* Outer ring */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.r + 5.5}
                stroke="url(#cg)"
                strokeWidth="0.55"
                strokeOpacity="0"
                fill="none"
              >
                <animate
                  attributeName="stroke-opacity"
                  from={0}
                  to={node.hub ? 0.32 : 0.14}
                  dur="0.5s"
                  begin={enterBegin}
                  fill="freeze"
                />
              </circle>

              {/* Main dot */}
              <circle
                cx={node.x}
                cy={node.y}
                r={0}
                fill="url(#cng)"
                filter={node.hub ? "url(#chub)" : "url(#cglow)"}
              >
                <animate
                  attributeName="r"
                  from={0}
                  to={node.r}
                  dur="0.45s"
                  begin={enterBegin}
                  fill="freeze"
                />
              </circle>

              {/* Inner highlight */}
              <circle
                cx={node.x - node.r * 0.25}
                cy={node.y - node.r * 0.25}
                r={node.r * 0.35}
                fill="white"
                fillOpacity={0}
              >
                <animate
                  attributeName="fill-opacity"
                  from={0}
                  to={0.45}
                  dur="0.45s"
                  begin={enterBegin}
                  fill="freeze"
                />
              </circle>

              {/* Label */}
              {node.label && (
                <text
                  x={node.lx}
                  y={node.ly}
                  textAnchor={node.anchor}
                  fontSize="7.8"
                  fill="white"
                  fillOpacity={0}
                  fontFamily="ui-sans-serif,system-ui,sans-serif"
                  letterSpacing="0.5"
                >
                  {node.label}
                  <animate
                    attributeName="fill-opacity"
                    from={0}
                    to={0.28}
                    dur="0.5s"
                    begin={`${i * 0.12 + 0.6}s`}
                    fill="freeze"
                  />
                </text>
              )}
            </g>
          );
        })}

        {/* VI hub sonar rings */}
        {([0, 1.5] as const).map((offset, i) => (
          <circle
            key={i}
            cx={172}
            cy={148}
            r={14}
            fill="none"
            stroke="url(#cg)"
            strokeWidth={i === 0 ? 0.9 : 0.65}
          >
            <animate
              attributeName="r"
              values="14;46;14"
              dur="3.8s"
              begin={`${offset + 2.2}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-opacity"
              values="0.32;0;0.32"
              dur="3.8s"
              begin={`${offset + 2.2}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* Traveling dot — halo */}
        <circle r={9} fill="rgba(14,165,233,0.13)">
          <animateMotion dur="22s" repeatCount="indefinite">
            <mpath href="#c-dp" />
          </animateMotion>
        </circle>

        {/* Traveling dot */}
        <circle r={4.5} fill="url(#cng)" filter="url(#cglow)">
          <animateMotion dur="22s" repeatCount="indefinite">
            <mpath href="#c-dp" />
          </animateMotion>
        </circle>
      </svg>

      {/* Floating stats — no box, just numbers in space */}
      <div
        className="absolute top-[2%] left-[1%] pointer-events-none"
        style={{
          animation: "cStatIn 0.7s ease-out 2.4s both, cStatFloat 5s ease-in-out 3.1s infinite",
        }}
      >
        <p className="text-[2rem] font-bold leading-none tabular-nums" style={{ color: "#38bdf8" }}>
          {active}
        </p>
        <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-600 mt-0.5">active</p>
      </div>

      <div
        className="absolute top-[50%] right-[2%] text-right pointer-events-none"
        style={{
          animation: "cStatIn 0.7s ease-out 2.9s both, cStatFloat 5.5s ease-in-out 3.7s infinite",
        }}
      >
        <p className="text-[2rem] font-bold leading-none tabular-nums text-teal-400">{online}</p>
        <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-600 mt-0.5">online</p>
      </div>

      <div
        className="absolute bottom-[5%] left-[28%] text-center pointer-events-none"
        style={{
          animation: "cStatIn 0.7s ease-out 3.4s both, cStatFloat 6s ease-in-out 4.2s infinite",
        }}
      >
        <p className="text-[2rem] font-bold leading-none tabular-nums" style={{ color: "#a78bfa" }}>
          &#x20A6;{revenue}K
        </p>
        <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-600 mt-0.5">today</p>
      </div>
    </div>
  );
}

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
      <div className="flex items-center gap-2 mb-2.5">
        <div className="h-px flex-1 bg-white/[0.06]" />
        <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-medium">
          Track any shipment
        </span>
        <div className="h-px flex-1 bg-white/[0.06]" />
      </div>

      <form onSubmit={handleSearch}>
        <div
          className={cn(
            "flex items-center gap-2 sm:gap-3 rounded-2xl border px-3 sm:px-4 py-3 sm:py-3.5 transition-all duration-300",
            focused ? "border-sky-500/40 bg-sky-500/[0.04]" : "border-white/[0.08] bg-white/[0.03]",
          )}
          style={
            focused
              ? { boxShadow: "0 0 0 3px rgba(14,165,233,0.1), 0 0 20px rgba(14,165,233,0.06)" }
              : undefined
          }
        >
          <div
            className={cn(
              "flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
              focused
                ? "bg-sky-500/15 border border-sky-500/25"
                : "bg-white/[0.04] border border-white/[0.07]",
            )}
          >
            <Search
              className={cn(
                "h-3 w-3 sm:h-3.5 sm:w-3.5 transition-colors duration-300",
                focused ? "text-sky-400" : "text-zinc-500",
              )}
            />
          </div>
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
          <button
            type="submit"
            disabled={!hasValue}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 rounded-xl px-3.5 sm:px-5 py-2 text-sm font-semibold shrink-0 transition-all duration-300",
              hasValue
                ? "bg-sky-500 text-white hover:bg-sky-400 shadow-lg shadow-sky-500/20"
                : "bg-white/[0.04] text-zinc-600 border border-white/[0.06] cursor-not-allowed",
            )}
          >
            <ArrowRight className="h-3.5 w-3.5" />
            <span>Track</span>
          </button>
        </div>
      </form>

      <p className="mt-2.5 text-[11px] text-zinc-700 text-center leading-relaxed">
        Try{" "}
        <button
          type="button"
          onClick={() => setValue("IST-K7X2M9PQ")}
          className="font-mono text-zinc-500 hover:text-zinc-400 transition-colors underline underline-offset-2 decoration-zinc-700"
        >
          IST-K7X2M9PQ
        </button>{" "}
        &mdash; demo tracking ID
      </p>
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
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage: "radial-gradient(circle, #52526a 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
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
        <div className="absolute left-[10%] top-[25%] h-[300px] w-[300px] sm:h-[480px] sm:w-[480px] rounded-full bg-sky-500/[0.045] blur-[100px] sm:blur-[110px]" />
        <div className="absolute right-[5%] bottom-[20%] h-[200px] w-[200px] sm:h-[320px] sm:w-[320px] rounded-full bg-teal-500/[0.035] blur-[80px] sm:blur-[90px]" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 w-full py-16 sm:py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
          {/* Left: copy */}
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 sm:px-4 py-1.5 mb-5 sm:mb-7">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shrink-0" />
              <span className="text-xs text-zinc-400">Open-source &middot; Portfolio project</span>
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

            <h1 className="text-[1.75rem] sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight text-white mb-4 sm:mb-5">
              Logistics Intelligence{" "}
              <span className="gradient-text block sm:inline">for Modern Africa</span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-zinc-400 leading-relaxed mb-7 sm:mb-8 max-w-full">
              A full-stack tracking platform built for{" "}
              <span
                className={cn(
                  "font-semibold text-white inline-block transition-all duration-[280ms]",
                  roleFading ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0",
                )}
              >
                {ROLES[roleIdx]}
              </span>{" "}
              &mdash; live GPS, real-time events, automated notifications.
            </p>

            <div className="mb-7 sm:mb-8">
              <TrackingSearch />
            </div>

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

          {/* Right: constellation */}
          <div className="hidden md:flex justify-center lg:justify-end lg:pr-4">
            <ConstellationView />
          </div>
        </div>
      </div>
    </section>
  );
}
