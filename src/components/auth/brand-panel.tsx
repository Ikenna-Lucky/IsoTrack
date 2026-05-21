import Link from "next/link";
import { Logo } from "@/components/shared/logo";

// ─── All keyframes ────────────────────────────────────────────────────────────

const KEYFRAMES = `
  /* Route dashes march forward */
  @keyframes dashMarch {
    to { stroke-dashoffset: -44; }
  }

  /* Sonar rings expand + fade */
  @keyframes sonarExpand {
    0%   { r: 8;  opacity: 0.75; }
    100% { r: 40; opacity: 0;    }
  }

  /* City node breathe */
  @keyframes nodeBreathe {
    0%, 100% { opacity: 0.55; }
    50%       { opacity: 1;    }
  }

  /* Ambient bloom breathe */
  @keyframes bloomBreathe {
    0%, 100% { transform: translate(-50%, -50%) scale(1);    opacity: 0.7; }
    50%       { transform: translate(-50%, -50%) scale(1.18); opacity: 1;   }
  }

  /* Floating particles drift upward */
  @keyframes particleDrift {
    0%   { transform: translateY(0)      scale(1);   opacity: 0; }
    8%   { opacity: 0.55; }
    92%  { opacity: 0.15; }
    100% { transform: translateY(-380px) scale(0.5); opacity: 0; }
  }

  /* Gradient headline shimmer */
  @keyframes gradShimmer {
    0%   { background-position: 0%   50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0%   50%; }
  }

  /* Live badge dot blink */
  @keyframes liveBlink {
    0%, 100% { opacity: 1;   }
    50%       { opacity: 0.2; }
  }

  /* Ticker scroll — vertical */
  @keyframes tickerScroll {
    0%   { transform: translateY(0); }
    100% { transform: translateY(-50%); }
  }

  /* Subtle grid pulse */
  @keyframes gridPulse {
    0%, 100% { opacity: 0.035; }
    50%       { opacity: 0.07;  }
  }
`;

// ─── Floating particles ───────────────────────────────────────────────────────

const PARTICLES = [
  { x: 6, delay: 0, dur: 16 },
  { x: 18, delay: 4, dur: 20 },
  { x: 32, delay: 8, dur: 13 },
  { x: 47, delay: 1.5, dur: 18 },
  { x: 61, delay: 6, dur: 14 },
  { x: 75, delay: 10, dur: 17 },
  { x: 88, delay: 3, dur: 21 },
  { x: 24, delay: 12, dur: 15 },
  { x: 54, delay: 5, dur: 19 },
  { x: 92, delay: 7.5, dur: 12 },
  { x: 42, delay: 9, dur: 22 },
  { x: 70, delay: 2, dur: 16 },
];

// ─── Live event ticker data ───────────────────────────────────────────────────

const TICKER_EVENTS = [
  { id: "IST-884729", status: "Delivered", city: "Kano", time: "just now" },
  { id: "IST-221934", status: "Out for delivery", city: "Abuja", time: "3m ago" },
  { id: "IST-557801", status: "Picked up", city: "Lagos", time: "7m ago" },
  { id: "IST-003847", status: "In transit", city: "Ibadan", time: "11m ago" },
  { id: "IST-119206", status: "Driver assigned", city: "Lagos", time: "18m ago" },
  { id: "IST-449021", status: "Delivered", city: "Kano", time: "24m ago" },
];

const STATUS_COLORS: Record<string, string> = {
  Delivered: "#10b981",
  "Out for delivery": "#0ea5e9",
  "In transit": "#14b8a6",
  "Picked up": "#a78bfa",
  "Driver assigned": "#f59e0b",
};

// ─── Route SVG ────────────────────────────────────────────────────────────────

function RouteMap() {
  const routeD = "M 64 72 C 120 95, 172 108, 210 148 S 168 222, 152 252 S 248 278, 308 308";

  const nodes = [
    { cx: 64, cy: 72, label: "LAGOS", anchor: "start" as const, lx: 78 },
    { cx: 210, cy: 148, label: "IBADAN", anchor: "start" as const, lx: 224 },
    { cx: 152, cy: 252, label: "ABUJA", anchor: "end" as const, lx: 138 },
    { cx: 308, cy: 308, label: "KANO", anchor: "end" as const, lx: 294 },
  ];

  const sonarDelays = [0, 0.4, 2.8, 5.2];

  return (
    <div className="relative w-full max-w-[420px] mx-auto select-none" aria-hidden="true">
      <svg viewBox="0 0 380 390" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
        <defs>
          <linearGradient id="rg" x1="0" y1="0" x2="380" y2="390" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>

          <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="nodeGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <path id="rp" d={routeD} />
        </defs>

        {/* Dot grid — pulsing */}
        {Array.from({ length: 9 }).map((_, row) =>
          Array.from({ length: 9 }).map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={col * 44 + 8}
              cy={row * 46 + 8}
              r="1.2"
              fill="white"
              style={{
                animation: `gridPulse ${3 + (row + col) * 0.15}s ease-in-out ${(row * col * 0.05) % 2}s infinite`,
              }}
            />
          )),
        )}

        {/* Route shadow baseline */}
        <path d={routeD} stroke="url(#rg)" strokeWidth="1.5" opacity="0.07" />

        {/* Marching dashes */}
        <path
          d={routeD}
          stroke="url(#rg)"
          strokeWidth="2"
          strokeDasharray="9 7"
          strokeLinecap="round"
          opacity="0.32"
          style={{ animation: "dashMarch 1.6s linear infinite" }}
        />

        {/* City nodes */}
        {nodes.map(({ cx, cy, label, anchor, lx }, i) => {
          const delay = sonarDelays[i] ?? 0;
          return (
          <g key={label}>
            {/* Sonar ring A */}
            <circle cx={cx} cy={cy} r="8" fill="none" stroke="url(#rg)" strokeWidth="1.2">
              <animate
                attributeName="r"
                values="8;42;8"
                dur="4.5s"
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.7;0;0.7"
                dur="4.5s"
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
            </circle>
            {/* Sonar ring B — offset */}
            <circle cx={cx} cy={cy} r="8" fill="none" stroke="url(#rg)" strokeWidth="0.8">
              <animate
                attributeName="r"
                values="8;42;8"
                dur="4.5s"
                begin={`${delay + 1.5}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.4;0;0.4"
                dur="4.5s"
                begin={`${delay + 1.5}s`}
                repeatCount="indefinite"
              />
            </circle>

            {/* Static outer ring */}
            <circle cx={cx} cy={cy} r="11" stroke="url(#rg)" strokeWidth="1" opacity="0.1" />

            {/* Glow dot */}
            <circle
              cx={cx}
              cy={cy}
              r="5.5"
              fill="url(#rg)"
              filter="url(#nodeGlow)"
              style={{
                animation: `nodeBreathe ${2.8 + i * 0.5}s ease-in-out ${i * 0.7}s infinite`,
              }}
            />

            {/* Label */}
            <text
              x={lx}
              y={cy + 4.5}
              fontSize="8.5"
              fill="rgba(255,255,255,0.25)"
              fontFamily="var(--font-geist-sans,ui-sans-serif)"
              textAnchor={anchor}
              letterSpacing="1.2"
            >
              {label}
            </text>
          </g>
          );
        })}

        {/* Moving package — 3-layer glowing ball */}
        <g filter="url(#glow)">
          <circle r="13" fill="#0ea5e9" opacity="0.1">
            <animateMotion dur="10s" repeatCount="indefinite">
              <mpath href="#rp" />
            </animateMotion>
          </circle>
          <circle r="7" fill="#0ea5e9" opacity="0.3">
            <animateMotion dur="10s" repeatCount="indefinite">
              <mpath href="#rp" />
            </animateMotion>
          </circle>
          <circle r="5" fill="#0ea5e9">
            <animateMotion dur="10s" repeatCount="indefinite">
              <mpath href="#rp" />
            </animateMotion>
          </circle>
          <circle r="2.5" fill="white" opacity="0.9">
            <animateMotion dur="10s" repeatCount="indefinite">
              <mpath href="#rp" />
            </animateMotion>
          </circle>
        </g>

        {/* Live badge — top right (108px wide, text centred with dominantBaseline) */}
        <g transform="translate(254, 22)">
          <rect
            width="108"
            height="24"
            rx="12"
            fill="rgba(20,184,166,0.08)"
            stroke="rgba(20,184,166,0.22)"
            strokeWidth="1"
          />
          <circle cx="15" cy="12" r="4" fill="#14b8a6">
            <animate
              attributeName="opacity"
              values="1;0.15;1"
              dur="2.2s"
              repeatCount="indefinite"
            />
          </circle>
          <text
            x="26"
            y="12"
            fontSize="9.5"
            fill="#2dd4bf"
            fontFamily="var(--font-geist-sans,ui-sans-serif)"
            fontWeight="700"
            letterSpacing="0.8"
            dominantBaseline="central"
          >
            LIVE
          </text>
          <text
            x="54"
            y="12"
            fontSize="9.5"
            fill="rgba(45,212,191,0.5)"
            fontFamily="var(--font-geist-sans,ui-sans-serif)"
            dominantBaseline="central"
          >
            TRACKING
          </text>
        </g>
      </svg>
    </div>
  );
}

// ─── Live event ticker ────────────────────────────────────────────────────────

function LiveTicker() {
  // Duplicate events so the loop is seamless
  const all = [...TICKER_EVENTS, ...TICKER_EVENTS];
  const itemH = 36; // px per row

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-white/[0.05] bg-white/[0.02]"
      style={{ height: itemH * 3 }}
    >
      {/* Top + bottom fade masks */}
      <div
        className="absolute inset-x-0 top-0 h-6 z-10"
        style={{ background: "linear-gradient(to bottom, #070a10, transparent)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-6 z-10"
        style={{ background: "linear-gradient(to top, #070a10, transparent)" }}
      />

      <div
        style={{
          animation: `tickerScroll ${TICKER_EVENTS.length * 3.5}s linear infinite`,
          willChange: "transform",
        }}
      >
        {all.map(({ id, status, city, time }, i) => (
          <div key={i} className="flex items-center gap-3 px-4" style={{ height: itemH }}>
            {/* Status dot */}
            <span
              className="shrink-0 h-1.5 w-1.5 rounded-full"
              style={{
                background: STATUS_COLORS[status] ?? "#0ea5e9",
                boxShadow: `0 0 5px ${STATUS_COLORS[status] ?? "#0ea5e9"}`,
              }}
            />
            {/* Shipment ID */}
            <span className="text-[10px] font-mono text-zinc-600 shrink-0">{id}</span>
            {/* Separator */}
            <span className="text-zinc-800 text-[10px]">·</span>
            {/* Status text */}
            <span
              className="text-[11px] font-medium flex-1 truncate"
              style={{ color: STATUS_COLORS[status] ?? "#0ea5e9" }}
            >
              {status}
            </span>
            {/* City */}
            <span className="text-[10px] text-zinc-600 shrink-0">{city}</span>
            {/* Time */}
            <span className="text-[10px] text-zinc-800 shrink-0">{time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function BrandPanel() {
  return (
    <aside className="flex flex-col w-full min-h-screen relative overflow-hidden">
      <style>{KEYFRAMES}</style>

      {/* Background */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(170deg, #090d14 0%, #070a10 50%, #060810 100%)" }}
      />

      {/* Right-edge separator */}
      <div className="absolute inset-y-0 right-0 w-px bg-white/[0.045]" />

      {/* Breathing ambient bloom */}
      <div
        className="absolute left-1/2 top-[42%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(14,165,233,0.06) 0%, rgba(20,184,166,0.025) 45%, transparent 70%)",
          animation: "bloomBreathe 8s ease-in-out infinite",
        }}
        aria-hidden="true"
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {PARTICLES.map(({ x, delay, dur }, i) => (
          <div
            key={i}
            className="absolute bottom-0 rounded-full bg-sky-400"
            style={{
              left: `${x}%`,
              width: i % 4 === 0 ? "2px" : "1.5px",
              height: i % 4 === 0 ? "2px" : "1.5px",
              opacity: 0,
              animation: `particleDrift ${dur}s linear ${delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full px-10 xl:px-16 2xl:px-20 py-10">
        {/* Logo */}
        <Logo href="/" size={32} />

        {/* Centre block */}
        <div className="flex flex-col flex-1 justify-center gap-8">
          {/* Route map */}
          <RouteMap />

          {/* Live event ticker */}
          <LiveTicker />

          {/* Headline — clean, two lines only */}
          <div className="space-y-1.5">
            <h2 className="text-[1.75rem] xl:text-[2rem] font-bold leading-tight tracking-tight text-white">
              Ship smarter.
            </h2>
            <h2
              className="text-[1.75rem] xl:text-[2rem] font-bold leading-tight tracking-tight"
              style={{
                backgroundImage: "linear-gradient(90deg, #0ea5e9, #14b8a6, #38bdf8, #0ea5e9)",
                backgroundSize: "300% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradShimmer 5s linear infinite",
              }}
            >
              Track everything.
            </h2>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-white/[0.04] flex items-center justify-between">
          <p className="text-[11px] text-zinc-700">
            Built for Africa &mdash;{" "}
            <Link
              href="/"
              className="hover:text-zinc-400 transition-colors underline underline-offset-2"
            >
              by an African
            </Link>
          </p>
          <p className="text-[10px] text-zinc-800 uppercase tracking-widest">
            Portfolio
          </p>
        </div>
      </div>
    </aside>
  );
}
