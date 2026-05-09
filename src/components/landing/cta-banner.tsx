import Link from "next/link";
import type { Route } from "next";
import { Github, ArrowRight } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="py-16 sm:py-20 lg:py-32 border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/[0.07] bg-gradient-to-br from-sky-500/[0.07] via-transparent to-teal-500/[0.05] p-8 sm:p-12 lg:p-16 text-center">

          {/* Background glow */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />
            <div className="absolute left-1/2 top-0 -translate-x-1/2 h-72 w-72 rounded-full bg-sky-500/[0.07] blur-3xl" />
          </div>

          {/* Label */}
          <p className="text-xs uppercase tracking-widest text-zinc-600 font-medium mb-5">
            Try it yourself
          </p>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4 sm:mb-5">
            See the whole platform
            <br />
            <span className="gradient-text">in action.</span>
          </h2>

          <p className="mx-auto max-w-lg text-sm sm:text-base text-zinc-400 leading-relaxed mb-8 sm:mb-10">
            Create an account, create a shipment, assign a driver, and watch it move on a live
            map — the full flow, end to end, running on real infrastructure.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={"/register" as Route}
              className="flex items-center gap-2 rounded-xl bg-sky-500 px-8 py-3.5 text-sm font-semibold text-white hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20"
            >
              Try the live demo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
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
