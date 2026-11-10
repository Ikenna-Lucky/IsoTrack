import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaBanner() {
  return (
    <section
      aria-labelledby="closing-title"
      className="border-t border-[var(--landing-border)] bg-[var(--landing-section)] px-7 py-16 min-[600px]:px-12 min-[950px]:px-[55px] min-[1150px]:px-[6vw] lg:py-20"
    >
      <div className="mx-auto grid max-w-[1320px] items-center gap-8 lg:grid-cols-[1fr_auto] lg:gap-16">
        <div>
          <h2
            id="closing-title"
            className="text-3xl font-semibold tracking-tight text-[var(--landing-ink)] sm:text-4xl"
          >
            See ISOTrack in action.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-[var(--landing-muted)]">
            Create a business account to manage your fleet, or explore a sample delivery from the
            customer’s side.
          </p>
          <p className="mt-5 text-xs leading-6 text-[var(--landing-ink)]0">
            Portfolio project. Payments use Stripe test mode.
          </p>
        </div>
        <div>
          <div className="flex flex-col gap-3 min-[480px]:flex-row">
            <Link
              href="/register"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-amber-300 px-5 py-3 text-sm font-semibold text-[#10150f] transition-colors hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
            >
              Create an account
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              href="/track/IST-K7X2M9PQ"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-[var(--landing-border)] px-5 py-3 text-sm font-semibold text-[var(--landing-ink)] transition-colors hover:border-teal-300/50 hover:text-[var(--landing-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-accent)]"
            >
              View sample tracking
            </Link>
          </div>
          <p className="mt-4 text-sm text-[var(--landing-muted)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="ml-1 inline-flex min-h-8 items-center font-medium text-[var(--landing-accent)] underline decoration-teal-200/30 underline-offset-4 hover:text-[var(--landing-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-accent)]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
