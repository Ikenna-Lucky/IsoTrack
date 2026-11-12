"use client";
import Link from "next/link";
import { useState } from "react";
import { DriverHeading, driverButton, driverField } from "@/components/dashboard/driver-workspace";

const guides = [
  {
    topic: "deliveries",
    title: "How do I complete a handover?",
    answer:
      "Open Deliveries and expand the assigned package. Confirm pickup, transit and out-for-delivery in order. Your business issues the recipient delivery code. Ask the recipient for that code and enter it in Confirm handover. Moving availability to on delivery does not change a shipment. Never hand over a package using an expired or replaced code.",
  },
  {
    topic: "deliveries",
    title: "The recipient has no code, or the code expired",
    answer:
      "Contact your business using your established dispatch channel. Ask them to issue or replace the recipient code for this shipment. A replacement invalidates the previous code. Do not guess codes or mark a handover complete without confirmation.",
  },
  {
    topic: "deliveries",
    title: "A delivery attempt failed. What happens to the package?",
    answer:
      "In the expanded delivery, record the failure reason and any required note. If you have picked up the package, a failed attempt does not remove it from your custody. Keep it safe and ask your business to authorize another attempt or a return. Drivers cannot authorize their own retry.",
  },
  {
    topic: "deliveries",
    title: "How do I return a package?",
    answer:
      "Your business first requests the return. Use the return-in-transit action when you begin returning the package. The business confirms physical receipt. The package remains your responsibility until receipt is recorded; do not treat a failed attempt as a completed return.",
  },
  {
    topic: "deliveries",
    title: "The page timed out after I submitted an action",
    answer:
      "Keep the page open, refresh the record and use the offered recovery action for the original request. Do not start a second handover or failure just because the response was lost. Pending recovery is kept only in this tab's memory; a reload or sign-out can lose it. If that happens, check the latest record before submitting a replacement.",
  },
  {
    topic: "deliveries",
    title: "What if the record changed while I was working?",
    answer:
      "Refresh the delivery and review its latest state. Another actor may have changed the package version, invalidated a code or authorized a return. Resolve any pending original request before taking a different action.",
  },
  {
    topic: "tracking",
    title: "Does going available share my location?",
    answer:
      "No. Availability informs dispatch; it neither assigns a package nor enables GPS. Authenticated live tracking is a separate feature still being updated. Do not rely on the existing GPS control as proof that dispatch or the recipient can see your location.",
  },
  {
    topic: "record",
    title: "Why is there a delivery record instead of earnings?",
    answer:
      "The API supplies assignments and delivery outcomes, not driver commissions, payout balances or payment dates. Confirm your pay arrangements directly with your business.",
  },
  {
    topic: "record",
    title: "Do the counts include all my past work?",
    answer:
      "Counts describe only the records loaded on the page. Use Load older assignments to fetch more. The list contains assignments currently linked to your driver account, newest first; reassigned shipments may no longer be visible. A shipment's created date is not its delivery date.",
  },
  {
    topic: "account",
    title: "How do I join a fleet?",
    answer:
      "If your existing driver account is not linked to a business, your Overview shows an invitation-token form. Use the token privately shared by your business and the email address named in the invitation. A driver can belong to one business at a time.",
  },
  {
    topic: "account",
    title: "How do I update contact or vehicle details?",
    answer:
      "Open Settings, choose Profile or Vehicle, edit the relevant fields and save. Empty optional fields clear their saved values. Email cannot be changed there. An insurance reference is a record, not evidence that insurance has been verified.",
  },
  {
    topic: "account",
    title: "Do saved notification choices send Driver alerts?",
    answer:
      "Driver notification routing is not enabled for these saved choices. They do not activate push/email delivery, customer messages, ratings or payouts. Check Deliveries for assignments. Account recovery and verification emails are separate.",
  },
  {
    topic: "account",
    title: "What happens when I change my password or deactivate?",
    answer:
      "A successful password change ends all existing sessions; sign in again with the new password. Deactivation is a separate confirmed action in Settings. It can be blocked while you have unresolved custody or other obligations. Resolve these with your business first.",
  },
];
const topics = {
  all: "All topics",
  deliveries: "Deliveries",
  tracking: "Tracking",
  record: "Delivery record",
  account: "Account",
};
export default function DriverHelpPage() {
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("all");
  const term = search.trim().toLowerCase();
  const filtered = guides.filter(
    (guide) =>
      (topic === "all" || guide.topic === topic) &&
      `${guide.title} ${guide.answer}`.toLowerCase().includes(term),
  );
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <DriverHeading eyebrow="Field guide" title="Help">
        Practical steps for pickup, recipient confirmation, failed attempts and safe returns.
      </DriverHeading>
      <label className="block max-w-xl text-sm text-[var(--landing-muted)]">
        Search the guide
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className={`${driverField} mt-2`}
          placeholder="Try delivery code or return"
        />
      </label>
      <nav aria-label="Help topics" className="flex flex-wrap gap-2">
        {Object.entries(topics).map(([key, label]) => (
          <button
            key={key}
            aria-pressed={topic === key}
            onClick={() => setTopic(key)}
            className={`${driverButton} ${topic === key ? "border-[var(--landing-accent)]! text-[var(--landing-accent)]!" : ""}`}
          >
            {label}
          </button>
        ))}
      </nav>
      <p role="status" className="text-xs text-[var(--landing-muted)]">
        {filtered.length} answers
      </p>
      <div className="divide-y divide-[var(--landing-border)]">
        {filtered.map((guide) => (
          <details
            key={`${topic}-${term}-${guide.title}`}
            open={term ? true : undefined}
            className="py-2"
          >
            <summary className="cursor-pointer py-4 text-base font-medium text-[var(--landing-ink)]">
              {guide.title}
            </summary>
            <p className="max-w-3xl pb-4 text-sm leading-7 text-[var(--landing-muted)]">
              {guide.answer}
            </p>
          </details>
        ))}
      </div>
      {!filtered.length && (
        <div className="py-6">
          <p className="text-sm text-[var(--landing-muted)]">No answers match this search.</p>
          <button
            onClick={() => {
              setSearch("");
              setTopic("all");
            }}
            className={`${driverButton} mt-3`}
          >
            Clear search and filters
          </button>
        </div>
      )}
      <aside className="space-y-3 border-l-2 border-[var(--landing-warning)] pl-5">
        <h2 className="font-semibold text-[var(--landing-warning)]">Need dispatch help?</h2>
        <p className="max-w-2xl text-sm leading-6 text-[var(--landing-muted)]">
          Contact your business through the channel they provided. Include the tracking ID, current
          package state and what happened. Do not share passwords or recipient codes. An in-app
          support service is not configured; this page does not send messages.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/driver/deliveries" className={driverButton}>
            Open deliveries
          </Link>
          <Link href="/driver/settings" className={driverButton}>
            Account settings
          </Link>
        </div>
      </aside>
    </div>
  );
}
