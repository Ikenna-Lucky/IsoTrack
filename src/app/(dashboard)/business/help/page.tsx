"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const topics = [
  { key: "all", label: "All topics" },
  { key: "shipments", label: "Shipments" },
  { key: "fleet", label: "Private fleet" },
  { key: "delivery", label: "Delivery & returns" },
  { key: "records", label: "Payments & analytics" },
  { key: "account", label: "Account & settings" },
] as const;
type Topic = (typeof topics)[number]["key"];
type Guide = {
  id: string;
  topic: Exclude<Topic, "all">;
  title: string;
  paragraphs: string[];
  href:
    | "/business/shipments/new"
    | "/business/shipments"
    | "/business/drivers"
    | "/business/analytics"
    | "/business/settings";
  action: string;
};

const guides: Guide[] = [
  {
    id: "create",
    topic: "shipments",
    title: "Create a shipment and set the charge",
    paragraphs: [
      "Open New shipment. Enter the package description and weight, pickup and delivery street, city and state, then the shipment charge in naira. Review the details before creating the shipment.",
      "The customer account email and recipient confirmation email serve different purposes. Customer access links the shipment to a customer account; the recipient email is used for the delivery code. Check both carefully. After creation, use the tracking ID to identify the shipment.",
    ],
    href: "/business/shipments/new",
    action: "Create a shipment",
  },
  {
    id: "find",
    topic: "shipments",
    title: "Find a shipment and read its history",
    paragraphs: [
      "Open Shipments, search or filter the manifest, then open the shipment to see its current details. Load more records when you need older shipments; the first list is not the complete history.",
      "The shipment detail separates delivery status, payment status, driver assignment, recipient confirmation and exception history. Review these together before deciding what to do next.",
    ],
    href: "/business/shipments",
    action: "Open shipments",
  },
  {
    id: "cancel",
    topic: "shipments",
    title: "Cancel before pickup",
    paragraphs: [
      "Open a pending or assigned shipment and use its cancellation control. Review the confirmation before submitting. For a failed attempt before pickup, use Cancel before pickup in the exception controls when it is available.",
      "Once pickup is recorded, use the failure and return workflow instead. Cancellation keeps the shipment history and does not issue a refund.",
    ],
    href: "/business/shipments",
    action: "Review a shipment",
  },
  {
    id: "uncertain",
    topic: "shipments",
    title: "A request timed out, or the shipment changed",
    paragraphs: [
      "If an action shows an uncertain result, keep the page open and use its same-request retry control. The request may already have succeeded. Starting a new shipment or repeating an action elsewhere can create duplicate work.",
      "If the app says the shipment changed, reload its current details and review the status before making a new decision. Pending request recovery stays in memory; reloading or leaving the app can lose it.",
    ],
    href: "/business/shipments",
    action: "Open shipment workspace",
  },
  {
    id: "invite",
    topic: "fleet",
    title: "Invite a new driver to your private fleet",
    paragraphs: [
      "In Private fleet, create an invitation for the driver's email address. Copy the one-time token while it is displayed and share it privately with that driver, who can use the Join fleet flow to create their account.",
      "The token cannot be retrieved later. If it is lost or the invitation expires, review the invitation list, revoke an unused invitation where appropriate, and create a replacement. Creating an invitation does not automatically send an email.",
    ],
    href: "/business/drivers",
    action: "Manage fleet invitations",
  },
  {
    id: "existing",
    topic: "fleet",
    title: "Enroll a driver who already has an account",
    paragraphs: [
      "Create an invitation in Private fleet for the email on the existing driver account and share its token privately. The driver signs in with that email and uses Join your business fleet on their dashboard to accept the invitation.",
      "A driver can belong to only one business fleet at a time. Review the membership after acceptance; do not create another account to work around an existing membership or an offboarding requirement.",
    ],
    href: "/business/drivers",
    action: "Open private fleet",
  },
  {
    id: "assign",
    topic: "fleet",
    title: "Assign a driver or resolve an empty driver list",
    paragraphs: [
      "Open a pending shipment, choose an eligible driver from its assignment list, and confirm. Assignment is limited to your private fleet. Use Load more when the available-driver list has more results.",
      "If no driver appears, review fleet membership and driver status in Private fleet. The server checks current eligibility when you assign; a driver shown earlier may no longer be available. Refresh the shipment after a conflict.",
    ],
    href: "/business/shipments",
    action: "Assign from a shipment",
  },
  {
    id: "progress",
    topic: "delivery",
    title: "Follow pickup and delivery progress",
    paragraphs: [
      "The assigned driver confirms pickup, marks the shipment in transit and then out for delivery. The business can follow these updates in the shipment detail and history.",
      "A delivery needs recipient code confirmation at handover. An out-for-delivery status alone does not mean the package has been delivered, and a delivered status alone does not mean it has been paid for.",
    ],
    href: "/business/shipments",
    action: "Follow a shipment",
  },
  {
    id: "code",
    topic: "delivery",
    title: "Send a recipient delivery code",
    paragraphs: [
      "When a shipment is out for delivery, open its recipient confirmation controls and check the recipient email before requesting a code. The eight-digit code is sent to that recipient; it is not displayed to the business. The recipient shares it with the assigned driver only after receiving the package.",
      "Codes expire after 20 minutes. Check the email delivery state separately from the request result: an accepted request is not proof that email arrived. Resend is subject to a one-minute wait and rate limits. A fresh code is needed after a failed attempt or when the old challenge is no longer valid.",
    ],
    href: "/business/shipments",
    action: "Open delivery confirmation",
  },
  {
    id: "retry",
    topic: "delivery",
    title: "Handle a failed delivery and authorize a retry",
    paragraphs: [
      "Open the failed shipment and review its reason, private note, attempt number and pickup record. Use Authorize another attempt when offered. The workflow allows at most three delivery attempts in total.",
      "Before pickup, a retry clears the assignment so a driver can be assigned again. After pickup, the assigned driver keeps custody and the next attempt starts from picked up. A return request prevents another retry.",
    ],
    href: "/business/shipments",
    action: "Review failed shipments",
  },
  {
    id: "return",
    topic: "delivery",
    title: "Request a return and confirm physical receipt",
    paragraphs: [
      "For an eligible failed shipment that has been picked up, the business requests a return. The assigned driver starts the return journey. Use Confirm return receipt only after the package has physically arrived back at your business.",
      "The delivery status remains failed while return progress is tracked separately. Confirming receipt completes the return workflow; sending the package again after that requires a new shipment.",
    ],
    href: "/business/shipments",
    action: "Open return controls",
  },
  {
    id: "payments",
    topic: "records",
    title: "Understand shipment charges and payment status",
    paragraphs: [
      "The shipment charge is the price set when the business creates the record. Check the separate paid or unpaid indicator when reviewing a shipment. Delivery completion and payment confirmation are different records.",
      "Payments currently use Stripe test mode. The business dashboard does not provide driver payouts, payroll or a refund control. Cancelling a shipment or receiving a return does not automatically refund a payment.",
    ],
    href: "/business/shipments",
    action: "Check shipment payment status",
  },
  {
    id: "analytics",
    topic: "records",
    title: "Read the analytics totals correctly",
    paragraphs: [
      "Analytics shows all-time shipment counts and status shares, plus the ten most recently created shipments. Shipment value sums recorded prices, including unpaid and cancelled shipments; it is not collected revenue or a payout balance.",
      "Delivered share uses all shipment records as its denominator. Failed counts do not mean every package is still awaiting action: return progress is separate. Use the shipment detail for an individual operational decision.",
    ],
    href: "/business/analytics",
    action: "Open analytics",
  },
  {
    id: "profile",
    topic: "account",
    title: "Update business identity and account contact details",
    paragraphs: [
      "In Settings → Profile, update the business name, dispatch address, account owner name or phone number. Email is read-only. Save and check the result before leaving the page.",
      "Drafts survive switching Settings sections but are not saved until you choose Save changes. Leaving or reloading the page loses unsaved edits. Account contact and business details are separate saves; if only one succeeds, review the error and retry to finish.",
    ],
    href: "/business/settings",
    action: "Open settings",
  },
  {
    id: "preferences",
    topic: "account",
    title: "What do notification and workspace preferences change?",
    paragraphs: [
      "Timezone and date format control Business timestamps; compact view changes workspace spacing. Auto refresh controls polling and refresh on focus or reconnect. Email choices apply to the six supported shipment updates, including queued emails checked before dispatch. In-app updates remain available. SMS, driver-online alerts and weekly reports are unavailable. The interface supports English and NGN payments.",
      "Use the theme control in the top bar to switch the working light/dark appearance. Saving a currency preference does not convert shipment prices.",
    ],
    href: "/business/settings",
    action: "Review saved preferences",
  },
  {
    id: "security",
    topic: "account",
    title: "Change your password or deactivate an account",
    paragraphs: [
      "In Settings → Security, enter your current password and a matching new password. Use 8–72 characters with an uppercase letter and a number, within 72 UTF-8 bytes. A successful password change signs out all devices.",
      "Deactivation requires your current password, preserves shipment, payment and audit history, and blocks future sign-ins. Self-service reactivation is not available. Active deliveries, custody or payment obligations can block it; a business with linked drivers requires assisted fleet offboarding.",
    ],
    href: "/business/settings",
    action: "Open account security",
  },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState<Topic>("all");
  const query = search.trim().toLocaleLowerCase();
  const filtered = useMemo(
    () =>
      guides.filter(
        (guide) =>
          (topic === "all" || guide.topic === topic) &&
          (!query ||
            [guide.title, ...guide.paragraphs].join(" ").toLocaleLowerCase().includes(query)),
      ),
    [query, topic],
  );
  const reset = () => {
    setSearch("");
    setTopic("all");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <header className="max-w-3xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--landing-accent)]">
          Business guide
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Help with your operations</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--landing-muted)]">
          From the first dispatch to a returned package. Find the next step, understand the record,
          and open the right workspace.
        </p>
      </header>

      <section aria-label="Common tasks" className="grid gap-3 sm:grid-cols-3">
        {(
          [
            {
              href: "/business/shipments/new",
              title: "Create a shipment",
              detail: "Package, addresses and charge",
            },
            {
              href: "/business/drivers",
              title: "Manage your fleet",
              detail: "Invitations and driver membership",
            },
            {
              href: "/business/shipments",
              title: "Resolve a delivery",
              detail: "Codes, failed attempts and returns",
            },
          ] as const
        ).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center justify-between gap-3 rounded-md border border-[var(--landing-border)] bg-[var(--landing-panel)] p-4 hover:border-[var(--landing-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-accent)]"
          >
            <span>
              <span className="block text-sm font-semibold">{item.title}</span>
              <span className="mt-1 block text-xs leading-5 text-[var(--landing-muted)]">
                {item.detail}
              </span>
            </span>
            <ArrowRight
              aria-hidden="true"
              className="size-4 shrink-0 text-[var(--landing-accent)]"
            />
          </Link>
        ))}
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[210px_minmax(0,1fr)]">
        <nav
          aria-label="Help topics"
          className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible"
        >
          {topics.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={topic === item.key}
              onClick={() => setTopic(item.key)}
              className={cn(
                "min-h-11 shrink-0 rounded-md border px-3 py-2 text-left text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-accent)]",
                topic === item.key
                  ? "border-[var(--landing-accent)] bg-[var(--landing-tint)] text-[var(--landing-accent)]"
                  : "border-transparent text-[var(--landing-muted)] hover:bg-[var(--landing-section)]",
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <section aria-labelledby="guide-heading" className="min-w-0">
          <label htmlFor="help-search" className="mb-2 block text-sm font-medium">
            Search this guide
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--landing-muted)]"
            />
            <input
              id="help-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Try delivery code, return or invitation"
              className="[&::-webkit-search-cancel-button]:appearance-none h-12 w-full rounded-md border border-[var(--landing-border)] bg-[var(--landing-field)] pl-10 pr-12 text-sm outline-none focus:border-[var(--landing-accent)] focus:ring-2 focus:ring-[var(--landing-tint)]"
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
                className="absolute right-1 top-1 grid size-10 place-items-center rounded text-[var(--landing-muted)] hover:text-[var(--landing-ink)]"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 py-4">
            <h3 id="guide-heading" className="text-sm font-semibold">
              {topics.find((item) => item.key === topic)?.label}
            </h3>
            <p role="status" className="text-xs text-[var(--landing-muted)]">
              {filtered.length} {filtered.length === 1 ? "guide" : "guides"}
              {query ? " found" : " available"}
            </p>
          </div>

          <div className="divide-y divide-[var(--landing-border)] rounded-md border border-[var(--landing-border)] bg-[var(--landing-panel)]">
            {filtered.length ? (
              filtered.map((guide) => (
                <details
                  key={`${guide.id}:${query}`}
                  open={query ? true : undefined}
                  className="group"
                >
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-[var(--landing-accent)] sm:px-5 [&::-webkit-details-marker]:hidden">
                    <span>{guide.title}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className="size-4 shrink-0 text-[var(--landing-muted)] group-open:rotate-180"
                    />
                  </summary>
                  <div className="space-y-3 px-4 pb-5 sm:px-5">
                    {guide.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="max-w-3xl text-sm leading-7 text-[var(--landing-muted)]"
                      >
                        {paragraph}
                      </p>
                    ))}
                    <Link
                      href={guide.href}
                      className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--landing-accent)] underline-offset-4 hover:underline"
                    >
                      {guide.action}
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                  </div>
                </details>
              ))
            ) : (
              <div className="px-5 py-10">
                <BookOpen aria-hidden="true" className="size-6 text-[var(--landing-accent)]" />
                <h4 className="mt-3 font-semibold">No matching guides</h4>
                <p className="mt-2 text-sm leading-6 text-[var(--landing-muted)]">
                  Try a shorter phrase or reset the topic and search to see all guides.
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-3 min-h-11 text-sm font-semibold text-[var(--landing-accent)] underline"
                >
                  Show all guides
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      <aside
        aria-labelledby="issue-heading"
        className="border-t border-[var(--landing-border)] pt-6"
      >
        <h3 id="issue-heading" className="text-base font-semibold">
          A delivery needs attention?
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--landing-muted)]">
          Start with the shipment detail. Note the tracking ID, current status, attempt and return
          progress, then coordinate with your assigned driver through your existing business
          channels. Keep recipient codes, passwords and invitation tokens private.
        </p>
        <p className="mt-3 text-xs leading-6 text-[var(--landing-muted)]">
          This page is a self-service guide. In-app support messaging and a monitored support
          contact are not configured.
        </p>
      </aside>
    </div>
  );
}
