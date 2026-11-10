"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  ChevronRight,
  Copy,
  MapPin,
  Package,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const stages = [
  {
    label: "In transit",
    title: "Your parcel is on the move.",
    detail: "It has been collected and is travelling to the delivery area.",
    time: "11:05 AM",
    next: "The driver will continue to the delivery address.",
  },
  {
    label: "Out for delivery",
    title: "Next stop: your doorstep.",
    detail: "Your parcel is with Tariye and out for delivery in Ikoyi.",
    time: "12:15 PM",
    next: "Keep your phone nearby so the driver can reach you.",
  },
  {
    label: "Delivered",
    title: "Delivered. Journey complete.",
    detail: "The recipient confirmed receipt using their delivery code.",
    time: "12:32 PM",
    next: "The handover has been recorded. No further action is needed.",
  },
  {
    label: "Delivery unsuccessful",
    title: "We couldn’t complete the handover.",
    detail: "The recipient was unavailable at the delivery address.",
    time: "12:32 PM",
    next: "Contact the sending business to arrange the next step.",
  },
] as const;

const history = [
  {
    title: "Shipment created",
    detail: "The sending business registered your parcel.",
    time: "9:00 AM",
  },
  {
    title: "Driver assigned",
    detail: "Tariye Dappa was assigned to this delivery.",
    time: "9:14 AM",
  },
  {
    title: "Parcel collected",
    detail: "Collected from the pickup address in Lekki.",
    time: "10:02 AM",
  },
  { title: "In transit", detail: "Travelling to the delivery area.", time: "11:05 AM" },
];

export function SampleTrackingPage() {
  const router = useRouter();
  const [stage, setStage] = useState(1);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const state = stages[stage] ?? stages[1];
  const closed = stage >= 2;
  const events = [
    ...history,
    ...(stage >= 1
      ? [
          {
            title: "Out for delivery",
            detail: "Heading to the recipient in Ikoyi.",
            time: "12:15 PM",
          },
        ]
      : []),
    ...(closed ? [{ title: state.label, detail: state.detail, time: state.time }] : []),
  ].reverse();

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = query.trim().toUpperCase();
    if (!/^IST-[A-Z0-9-]{1,60}$/.test(id)) {
      setError("Enter a tracking ID starting with IST-, followed by letters or numbers.");
      return;
    }
    setError("");
    router.push(`/track/${encodeURIComponent(id)}`);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/track/IST-K7X2M9PQ`);
      setCopyStatus("Sample link copied");
    } catch {
      setCopyStatus("Copy the link from your browser’s address bar.");
    }
  }

  return (
    <div className="landing-page min-h-screen bg-[var(--landing-canvas)] text-[var(--landing-ink)]">
      <header className="border-b border-[var(--landing-border)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Logo href="/" size={36} />
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center text-sm hover:text-[var(--landing-accent)]"
            >
              Sign in <ArrowRight className="ml-2 size-4" aria-hidden="true" />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-[var(--landing-muted)] hover:text-[var(--landing-ink)]"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to ISOTrack
        </Link>
        <div className="mb-8 mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-sm text-[var(--landing-muted)]">Shipment tracking</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Every step, accounted for.
            </h1>
          </div>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-md border border-[var(--landing-border)] px-4 text-sm hover:bg-[var(--landing-tint)]"
          >
            <Copy className="size-4" aria-hidden="true" />
            Share sample
          </button>
        </div>
        <p role="status" className="sr-only">
          {copyStatus}
        </p>
        {copyStatus && <p className="mb-4 text-sm text-[var(--landing-accent)]">{copyStatus}</p>}

        <section
          aria-label="Sample controls"
          className="mb-7 border-y border-[var(--landing-border)] py-5"
        >
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="max-w-sm">
              <p className="font-medium">Try the tracking experience</p>
              <p className="mt-1 text-sm leading-6 text-[var(--landing-muted)]">
                Sample shipment. Choose a status to explore how updates appear. No real parcel or
                live location.
              </p>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Sample delivery status">
              {stages.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  aria-pressed={stage === index}
                  onClick={() => setStage(index)}
                  className={`min-h-11 rounded-md border px-3 text-sm transition-colors ${stage === index ? "border-amber-400 bg-amber-400 font-medium text-[#152018]" : "border-[var(--landing-border)] hover:bg-[var(--landing-tint)]"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,1fr)]">
          <div className="min-w-0 space-y-6">
            <section
              aria-label="Shipment status"
              className="overflow-hidden rounded-xl border border-[var(--landing-border)] bg-[var(--landing-panel)]"
            >
              <div className="p-6 sm:p-8" aria-live="polite" aria-atomic="true">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-mono text-sm text-[var(--landing-muted)]">IST-K7X2M9PQ</p>
                  <span
                    className={`inline-flex items-center gap-2 text-sm font-medium ${stage === 3 ? "text-[var(--landing-danger)]" : "text-[var(--landing-accent)]"}`}
                  >
                    {stage === 2 ? (
                      <CheckCheck className="size-4" aria-hidden="true" />
                    ) : (
                      <span className="size-2 rounded-full bg-current" />
                    )}
                    {state.label}
                  </span>
                </div>
                <h2 className="mt-8 max-w-md text-3xl font-semibold leading-tight tracking-tight sm:text-[2.5rem]">
                  {state.title}
                </h2>
                <p className="mt-4 max-w-md text-sm leading-6 text-[var(--landing-muted)]">
                  {state.detail}
                </p>
                <div className="mt-7 flex items-center gap-3 border-t border-[var(--landing-border)] pt-5">
                  <Package
                    className="size-5 shrink-0 text-[var(--landing-accent)]"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium">Document parcel</p>
                    <p className="mt-1 text-xs text-[var(--landing-muted)]">
                      Sample journey · 17 September 2026 · Lagos time
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-[var(--landing-border)] bg-[var(--landing-section)] px-6 py-5 sm:px-8">
                <p className="mb-1 text-xs text-[var(--landing-muted)]">
                  {closed ? "Latest update" : "Estimated arrival · sample"}
                </p>
                <p className="text-xl font-semibold tabular-nums">
                  {closed ? `${state.label} at ${state.time}` : "12:00–1:00 PM"}
                </p>
              </div>
            </section>

            <section
              aria-labelledby="journey-heading"
              className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-panel)] p-6 sm:p-8"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 id="journey-heading" className="font-semibold">
                  From Lekki to Ikoyi
                </h2>
                <span className="text-xs text-[var(--landing-muted)]">Illustrative route</span>
              </div>
              <div className="my-8 flex items-center px-3" aria-hidden="true">
                <span className="size-4 rounded-full border-[5px] border-[var(--landing-accent)]" />
                <div className="h-px flex-1 bg-[var(--landing-border)]" />
                <div className="flex size-12 items-center justify-center rounded-full border border-[var(--landing-border)] bg-[var(--landing-section)] text-[var(--landing-accent)]">
                  {stage === 2 ? <Check className="size-5" /> : <Truck className="size-5" />}
                </div>
                <div className="h-px flex-1 bg-[var(--landing-border)]" />
                <MapPin className="size-5 text-[var(--landing-accent)]" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-[var(--landing-muted)]">Collected from</p>
                  <p className="mt-2 text-sm font-medium">Admiralty Way</p>
                  <p className="mt-1 text-sm text-[var(--landing-muted)]">Lekki, Lagos</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--landing-muted)]">Delivering to</p>
                  <p className="mt-2 text-sm font-medium">Bourdillon Road</p>
                  <p className="mt-1 text-sm text-[var(--landing-muted)]">Ikoyi, Lagos</p>
                </div>
              </div>
              <div className="mt-7 border-t border-[var(--landing-border)] pt-5">
                <p className="text-sm font-medium">
                  {stage === 2
                    ? "Handover confirmed"
                    : stage === 3
                      ? "What happens next?"
                      : "When your parcel arrives"}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--landing-muted)]">
                  {closed
                    ? state.next
                    : "Share your delivery code with the assigned driver only after you receive your parcel. Your code is sent privately; it is never displayed on this public page."}
                </p>
              </div>
            </section>
          </div>

          <aside className="min-w-0 space-y-6">
            <section
              aria-labelledby="driver-heading"
              className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-panel)] p-6"
            >
              <h2 id="driver-heading" className="mb-5 text-sm text-[var(--landing-muted)]">
                {closed ? "Delivery handled by" : "Your assigned driver"}
              </h2>
              <div className="flex items-center gap-4">
                <Image
                  src="/images/demo-driver-tariye.webp"
                  alt="Fictional driver Tariye Dappa"
                  width={52}
                  height={52}
                  className="size-13 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">Tariye Dappa</p>
                  <p className="mt-1 text-sm text-[var(--landing-muted)]">
                    Motorcycle · LAG-278-AB
                  </p>
                </div>
              </div>
              <p className="mt-5 flex items-center gap-2 text-xs text-[var(--landing-muted)]">
                <ShieldCheck className="size-4 text-[var(--landing-accent)]" aria-hidden="true" />
                Assigned by the sending business
              </p>
            </section>

            <section
              aria-labelledby="updates-heading"
              className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-panel)] p-6"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 id="updates-heading" className="font-semibold">
                  Delivery updates
                </h2>
                <span className="text-xs text-[var(--landing-muted)]">Newest first</span>
              </div>
              <ol>
                {events.map((event, index) => (
                  <li key={event.title} className="relative flex gap-4 pb-6 last:pb-0">
                    {index < events.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-0 left-[7px] top-4 w-px bg-[var(--landing-border)]"
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className={`relative mt-1 size-4 shrink-0 rounded-full border-[4px] ${index === 0 ? "border-[var(--landing-accent)]" : "border-[var(--landing-border)]"}`}
                    />
                    <div>
                      <p
                        className={`text-sm font-medium ${index === 0 ? "text-[var(--landing-accent)]" : ""}`}
                      >
                        {event.title}
                      </p>
                      <p className="mt-1 text-xs text-[var(--landing-muted)]">
                        17 Sep · {event.time}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--landing-muted)]">
                        {event.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>

        <section
          aria-labelledby="search-heading"
          className="mt-10 grid gap-6 border-t border-[var(--landing-border)] pt-8 md:grid-cols-2 md:items-start"
        >
          <div>
            <h2 id="search-heading" className="text-xl font-semibold">
              Expecting a different delivery?
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--landing-muted)]">
              Use the tracking ID shared by the sending business.
            </p>
          </div>
          <form onSubmit={search} noValidate>
            <label htmlFor="tracking-search" className="mb-2 block text-sm">
              Tracking ID
            </label>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="absolute left-3 top-3.5 size-4 text-[var(--landing-muted)]"
                  aria-hidden="true"
                />
                <input
                  id="tracking-search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setError("");
                  }}
                  maxLength={64}
                  autoCapitalize="characters"
                  spellCheck={false}
                  autoComplete="off"
                  aria-invalid={!!error}
                  aria-describedby={error ? "tracking-error" : undefined}
                  placeholder="e.g. IST-K7X2M9PQ"
                  className="min-h-11 w-full rounded-md border border-[var(--landing-border)] bg-[var(--landing-field)] pl-10 pr-3 text-sm"
                />
              </div>
              <button
                type="submit"
                aria-label="Track shipment"
                className="flex size-11 shrink-0 items-center justify-center rounded-md bg-amber-400 text-[#152018] hover:bg-amber-300"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            </div>
            {error && (
              <p
                id="tracking-error"
                role="alert"
                className="mt-2 text-sm text-[var(--landing-danger)]"
              >
                {error}
              </p>
            )}
          </form>
        </section>
      </main>
      <footer className="border-t border-[var(--landing-border)] px-5 py-6 text-center text-xs leading-6 text-[var(--landing-muted)]">
        ISOTrack portfolio demo. All shipment details on this page are fictional.
      </footer>
    </div>
  );
}
