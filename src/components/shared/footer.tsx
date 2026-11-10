import Link from "next/link";
import { Logo } from "@/components/shared/logo";

const PRODUCT_LINKS = [
  { label: "Private fleets", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Customer tracking", href: "#roles" },
  { label: "Common questions", href: "#faq" },
];
const linkStyle =
  "inline-flex min-h-10 items-center text-sm text-stone-400 transition-colors hover:text-teal-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#080b0b] px-7 min-[600px]:px-12 min-[950px]:px-[55px] min-[1150px]:px-[6vw]">
      <div className="mx-auto max-w-[1320px] py-12 sm:py-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-16">
          <div className="col-span-2 lg:col-span-1">
            <Logo href="/" size={40} tone="light" />
            <p className="mt-5 max-w-sm text-sm leading-7 text-stone-400">
              Private fleets, connected deliveries.
              <br />
              From your dispatch team to your customer’s door.
            </p>
          </div>
          <nav aria-label="Footer product navigation">
            <p className="mb-3 text-sm font-semibold text-stone-200">Explore</p>
            <ul>
              {PRODUCT_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <a href={href} className={linkStyle}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Footer account navigation">
            <p className="mb-3 text-sm font-semibold text-stone-200">Get started</p>
            <ul>
              <li>
                <Link href="/register" className={linkStyle}>
                  Create account
                </Link>
              </li>
              <li>
                <Link href="/login" className={linkStyle}>
                  Sign in
                </Link>
              </li>
              <li>
                <a href="#shipment-tracking" className={linkStyle}>
                  Track a shipment
                </a>
              </li>
              <li>
                <Link href="/track/IST-K7X2M9PQ" className={linkStyle}>
                  View sample tracking
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs leading-6 text-stone-500 sm:flex-row sm:items-start sm:justify-between">
          <p>&copy; {new Date().getFullYear()} IsoTrack.</p>
          <p className="max-w-sm sm:text-right">
            Portfolio project. Payments use Stripe test mode.
            <br />
            Landing-page walkthroughs use sample data.
          </p>
        </div>
      </div>
    </footer>
  );
}
