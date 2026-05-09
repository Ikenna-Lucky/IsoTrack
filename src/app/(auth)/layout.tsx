import type { Metadata } from "next";
import { Logo } from "@/components/shared/logo";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "Authentication",
    template: "%s | IsoTrack",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(14,165,233,0.07) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-5 sm:px-8 h-16">
        <Logo href="/" size={30} />
        <nav className="flex items-center gap-1 text-sm text-zinc-500">
          {/* Flipped based on page — handled per-page via children */}
        </nav>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Footer note */}
      <footer className="relative z-10 py-6 text-center text-xs text-zinc-700">
        <Link href="/" className="hover:text-zinc-400 transition-colors">
          ← Back to IsoTrack
        </Link>
      </footer>
    </div>
  );
}
