import Link from "next/link";
import type { Route } from "next";
import { Logo } from "@/components/shared/logo";

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Workflow", href: "#how-it-works" },
    { label: "Dashboards", href: "#roles" },
  ],
  Account: [
    { label: "Log in", href: "/login" as Route },
    { label: "Create account", href: "/register" as Route },
    { label: "Track sample", href: "/track/IST-K7X2M9PQ" as Route },
  ],
  Operations: [
    { label: "Business dashboard", href: "/business" as Route },
    { label: "Driver dashboard", href: "/driver" as Route },
    { label: "Customer dashboard", href: "/customer" as Route },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:gap-10 lg:grid-cols-4">
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-4">
              <Logo href="/" size={46} tone="dark" />
            </div>
            <p className="max-w-xs text-xs leading-6 text-slate-500">
              Shipment tracking, driver dispatch, live location, and payment visibility
              for Lagos delivery operations.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
                {group}
              </p>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    {href.startsWith("#") ? (
                      <a href={href} className="text-sm text-slate-500 transition-colors hover:text-slate-950">
                        {label}
                      </a>
                    ) : (
                      <Link href={href as Route} className="text-sm text-slate-500 transition-colors hover:text-slate-950">
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} IsoTrack.
          </p>
          <p className="text-xs text-slate-400">Built for Nigerian shipment workflows.</p>
        </div>
      </div>
    </footer>
  );
}
