import Link from "next/link";
import type { Metadata } from "next";
import { BrandPanel } from "@/components/auth/brand-panel";
import { Logo } from "@/components/shared/logo";

export const metadata: Metadata = {
  title: {
    default: "IsoTrack",
    template: "%s | IsoTrack",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0b0f0e] text-stone-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(45,212,191,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.12) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[#0b0f0e] via-[#0b0f0e] to-transparent" />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <Logo href="/" size={42} tone="light" />
          <Link
            href="/"
            className="rounded border border-stone-700 bg-stone-950/70 px-3 py-2 text-sm font-semibold text-stone-300 transition hover:border-amber-500/50 hover:text-amber-300"
          >
            Home
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-10">
          <div className="min-w-0">{children}</div>
          <BrandPanel />
        </div>
      </main>
    </div>
  );
}
