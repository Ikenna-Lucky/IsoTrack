"use client";

import Link from "next/link";
import type { Route } from "next";
import { Github, ArrowRight } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

// ─── Easing ───────────────────────────────────────────────────────────────────

const SPRING = "cubic-bezier(0.22,1,0.36,1)";

// ─── Component ────────────────────────────────────────────────────────────────

export function CtaBanner() {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <section
      className="py-16 sm:py-20 lg:py-32 border-t border-white/[0.06]"
      ref={ref as unknown as React.RefObject<HTMLElement>}
    >
      <style>{`
        @keyframes ctaRing {
          0%   { transform: translate(-50%,-50%) scale(0.7); opacity: 0.55; }
          100% { transform: translate(-50%,-50%) scale(2.4); opacity: 0;    }
        }
        @keyframes shimmerSweep {
          from { transform: translateX(-100%); }
          to   { transform: translateX(100%);  }
        }
        .cta-btn-shimmer:hover .cta-shimmer-bar {
          animation: shimmerSweep 0.65s ease forwards;
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/[0.07] bg-gradient-to-br from-sky-500/[0.07] via-transparent to-teal-500/[0.05] p-8 sm:p-12 lg:p-16 text-center"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(26px)",
            transition: `opacity 0.7s ${SPRING}, transform 0.7s ${SPRING}`,
          }}
        >
          {/* ── Background decoration ── */}
          <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
            {/* Top-edge accent line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />

            {/* Pulsing concentric rings */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute rounded-full border border-sky-500/[0.14]"
                style={{
                  width: "300px",
                  height: "300px",
                  left: "50%",
                  top: "50%",
                  animation: inView
                    ? `ctaRing 3.6s ease-out ${i * 1.2}s infinite`
                    : "none",
                }}
              />
            ))}

            {/* Ambient center glow */}
            <div
              className="absolute rounded-full blur-3xl"
              style={{
                width: "360px",
                height: "360px",
                left: "50%",
                top: "50%",
                transform: "translate(-50%,-50%)",
                background: "radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)",
              }}
            />
          </div>

          {/* Label */}
          <p
            className="text-xs uppercase tracking-widest text-zinc-600 font-medium mb-5"
            style={{
              opacity: inView ? 1 : 0,
              transition: `opacity 0.5s ${SPRING} 0.15s`,
            }}
          >
            Try it yourself
          </p>

          {/* Headline */}
          <h2
            className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4 sm:mb-5"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(14px)",
              transition: `opacity 0.6s ${SPRING} 0.2s, transform 0.6s ${SPRING} 0.2s`,
            }}
          >
            See the whole platform
            <br />
            <span className="gradient-text">in action.</span>
          </h2>

          {/* Body */}
          <p
            className="mx-auto max-w-lg text-sm sm:text-base text-zinc-400 leading-relaxed mb-8 sm:mb-10"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(12px)",
              transition: `opacity 0.6s ${SPRING} 0.3s, transform 0.6s ${SPRING} 0.3s`,
            }}
          >
            Create an account, create a shipment, assign a driver, and watch it move on a live
            map — the full flow, end to end, running on real infrastructure.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(10px)",
              transition: `opacity 0.6s ${SPRING} 0.4s, transform 0.6s ${SPRING} 0.4s`,
            }}
          >
            {/* Primary — shimmer button */}
            <Link
              href={"/register" as Route}
              className="cta-btn-shimmer group relative overflow-hidden flex items-center gap-2 rounded-xl bg-sky-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-colors duration-200 hover:bg-sky-400"
            >
              {/* Shimmer bar */}
              <span
                className="cta-shimmer-bar absolute inset-0 -translate-x-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
                }}
                aria-hidden="true"
              />
              <span className="relative flex items-center gap-2">
                Try the live demo
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </Link>

            {/* Secondary */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200"
            >
              <Github className="h-4 w-4" />
              View source on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
