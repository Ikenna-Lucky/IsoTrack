import type { Metadata } from "next";
import { BrandPanel } from "@/components/auth/brand-panel";

export const metadata: Metadata = {
  title: {
    default: "IsoTrack",
    template: "%s | IsoTrack",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950">
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white via-white to-transparent" />

      <main className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[0.96fr_1.04fr] lg:px-8">
        <div className="hidden lg:block">
          <BrandPanel />
        </div>

        <div className="flex min-h-[calc(100vh-48px)] items-center justify-center lg:min-h-0">
          {children}
        </div>
      </main>
    </div>
  );
}
