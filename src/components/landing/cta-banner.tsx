import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="py-24 lg:py-32 border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-sky-500/[0.08] via-transparent to-teal-500/[0.06] p-12 lg:p-16 text-center">
          {/* Background glow */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />
            <div className="absolute left-1/2 top-0 -translate-x-1/2 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/[0.07] px-4 py-1.5 mb-6">
            <Zap className="h-3 w-3 text-sky-400" />
            <span className="text-xs font-medium text-sky-300">Free to start. No credit card.</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-5">
            Ready to modernize
            <br />
            <span className="gradient-text">your logistics?</span>
          </h2>

          <p className="mx-auto max-w-lg text-base text-zinc-400 leading-relaxed mb-10">
            Join thousands of Nigerian businesses already using IsoTrack to track shipments in
            real time, reduce customer complaints, and grow with confidence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-xl bg-sky-500 px-8 py-3.5 text-sm font-semibold text-white hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/25"
            >
              Create your free account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Already have an account? Log in →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
