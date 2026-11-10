import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function SignInLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing-page min-h-dvh bg-[var(--landing-canvas)] text-[var(--landing-ink)]">
      <div className="mx-auto flex min-h-dvh max-w-[1440px] flex-col px-7 min-[600px]:px-12 lg:px-16">
        <header className="flex min-h-24 items-center justify-between gap-4">
          <Logo href="/" size={40} tone="light" />
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              href="/"
              className="hidden min-h-11 items-center gap-2 rounded text-sm text-[var(--landing-muted)] hover:text-[var(--landing-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-accent)] sm:inline-flex"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back to home
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main className="grid flex-1 items-center gap-12 pb-10 pt-8 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:pb-12 lg:pt-4">
          <div className="mx-auto w-full max-w-[420px] py-6 sm:py-12">
            {children}
            <p className="mt-10 border-t border-[var(--landing-border)] pt-5 text-xs leading-6 text-[var(--landing-muted)]">
              Joining as a driver? Use the invitation from your business to set up your account.
            </p>
          </div>
          <aside
            aria-label="About IsoTrack"
            className="relative hidden min-h-[620px] self-stretch overflow-hidden rounded-lg bg-[#14261e] lg:block"
          >
            <Image
              src="/images/dispatch-office.webp"
              alt="A dispatcher coordinating her business fleet from the office"
              fill
              sizes="(min-width: 1024px) 48vw, 0px"
              priority
              className="object-cover object-[65%_center]"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#07140ff2] via-[#07140f18] to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 xl:p-10">
              <p className="max-w-sm text-3xl font-semibold leading-tight tracking-tight text-white xl:text-4xl">
                Your team.
                <br />
                Your deliveries.
                <br />
                Right where you left them.
              </p>
              <p className="mt-5 max-w-sm text-sm leading-7 text-stone-200">
                One place to coordinate your private fleet and keep every delivery moving.
              </p>
            </div>
          </aside>
        </main>
        <footer className="flex flex-wrap justify-between gap-3 pb-6 text-xs leading-6 text-[var(--landing-muted)]">
          <p>&copy; {new Date().getFullYear()} IsoTrack</p>
          <p>Portfolio project · Stripe test mode</p>
        </footer>
      </div>
    </div>
  );
}
