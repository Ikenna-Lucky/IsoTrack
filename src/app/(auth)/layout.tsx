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
    <div className="min-h-screen bg-surface-0 flex">
      {/* Left — brand panel — exactly half on lg+ */}
      <div className="hidden lg:flex lg:w-1/2 shrink-0">
        <BrandPanel />
      </div>

      {/* Right — form area — exactly half, independently scrollable */}
      <div className="flex w-full lg:w-1/2 flex-col min-h-screen overflow-y-auto">
        {/* Subtle ambient glow in the top-right corner */}
        <div
          className="pointer-events-none fixed right-0 top-0 w-[50%] h-[55vh]"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 90% 0%, rgba(14,165,233,0.05) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* Form — vertically centered with comfortable padding */}
        <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-14 sm:px-12">
          {children}
        </main>
      </div>
    </div>
  );
}
