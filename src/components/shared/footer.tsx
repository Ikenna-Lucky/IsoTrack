import Link from "next/link";
import type { Route } from "next";
import { Github } from "lucide-react";
import { Logo } from "@/components/shared/logo";

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "About the project", href: "#about" },
  ],
  Navigate: [
    { label: "Log in", href: "/login" as Route },
    { label: "Create account", href: "/register" as Route },
    { label: "Track a shipment", href: "/track" as Route },
  ],
  Legal: [
    { label: "Privacy policy", href: "#" },
    { label: "Terms of service", href: "#" },
    { label: "MIT License", href: "https://opensource.org/licenses/MIT" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#09090b]">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 gap-8 sm:gap-10 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-4">
              <Logo href="/" size={50} />
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mb-5">
              A full-stack logistics and shipment tracking platform. Personal project. Open source.
            </p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              View on GitHub
            </a>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
                {group}
              </p>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    {href.startsWith("http") || href.startsWith("#") ? (
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors"
                      >
                        {label}
                      </a>
                    ) : (
                      <Link
                        href={href as Route}
                        className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors"
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-700">
            © {new Date().getFullYear()} IsoTrack — Personal project by Official_GLuck.
          </p>
          <p className="text-xs text-zinc-700">Built for Africa &mdash; by an African.</p>
        </div>
      </div>
    </footer>
  );
}
