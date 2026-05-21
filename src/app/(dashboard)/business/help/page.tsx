"use client";

import { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Package,
  Truck,
  BarChart3,
  Bell,
  Shield,
  CreditCard,
  ExternalLink,
  MessageSquare,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Zap,
  HelpCircle,
  ArrowRight,
  Send,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  items: FaqItem[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  {
    icon: Package,
    title: "Creating a Shipment",
    description: "Step-by-step guide to booking your first shipment",
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
    href: "#creating-shipments",
  },
  {
    icon: Truck,
    title: "Managing Drivers",
    description: "Add, assign, and monitor your driver fleet",
    color: "text-teal-400",
    bg: "bg-teal-500/10 border-teal-500/20",
    href: "#managing-drivers",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Understand your delivery performance data",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    href: "#analytics",
  },
  {
    icon: Bell,
    title: "Notification Setup",
    description: "Configure email and SMS alerts for your team",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    href: "#notifications",
  },
  {
    icon: Shield,
    title: "Account Security",
    description: "Password, 2FA, and session management",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    href: "#security",
  },
  {
    icon: CreditCard,
    title: "Billing & Payments",
    description: "Understand invoices, pricing, and subscriptions",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    href: "#billing",
  },
];

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    key: "shipments",
    label: "Shipments",
    icon: Package,
    color: "text-sky-400",
    items: [
      {
        q: "How do I create a new shipment?",
        a: 'Click the "New Shipment" button in the top-left sidebar or the header. Fill in the pickup and delivery addresses, select a package type, and confirm. The shipment will appear as "Pending" until a driver is assigned.',
      },
      {
        q: "Can I cancel or edit a shipment after booking?",
        a: "You can cancel a shipment as long as it's still in Pending status. Once a driver has been assigned and picked up the package, the shipment cannot be cancelled. To make address edits, contact support within 30 minutes of booking.",
      },
      {
        q: "How is shipment pricing calculated?",
        a: "Pricing is based on distance, package weight/dimensions, and the selected delivery speed (standard vs. express). You'll see a full cost breakdown before confirming any shipment.",
      },
      {
        q: "What does each shipment status mean?",
        a: "Pending: Awaiting driver assignment. Assigned: Driver confirmed. In Transit: Package picked up and en route. Out for Delivery: Driver is making the final delivery attempt. Delivered: Successfully completed. Failed: Delivery attempt was unsuccessful.",
      },
    ],
  },
  {
    key: "drivers",
    label: "Drivers",
    icon: Truck,
    color: "text-teal-400",
    items: [
      {
        q: "How do I add a new driver to my fleet?",
        a: 'Go to Drivers → click "Add Driver". Enter the driver\'s name, phone number, and vehicle details. They will receive an invitation via SMS with instructions to download the IsoTrack Driver app.',
      },
      {
        q: "Why is a driver showing as Offline?",
        a: "Offline means the driver has not opened the IsoTrack Driver app in the last 15 minutes, or has manually gone offline. Idle means they're logged in but not currently on a delivery.",
      },
      {
        q: "Can I assign a specific driver to a shipment?",
        a: "Yes. When creating a shipment, use the 'Assign driver' option to choose from your available (online) fleet. Otherwise the system will auto-assign the nearest available driver.",
      },
      {
        q: "How do driver ratings work?",
        a: "After each delivery, the recipient can rate the experience from 1–5 stars. Ratings are averaged over the driver's last 50 deliveries and displayed on their profile card.",
      },
    ],
  },
  {
    key: "tracking",
    label: "Tracking",
    icon: Zap,
    color: "text-amber-400",
    items: [
      {
        q: "How does live tracking work?",
        a: "When a driver is actively on a delivery, their GPS location is broadcast to our servers every 5 seconds. The live map on your dashboard and the customer tracking page update in real time over a WebSocket connection.",
      },
      {
        q: "Can customers track their own orders?",
        a: "Yes. Share the shipment's tracking ID with the recipient. They can paste it into isotrack.com/track to see the live map and status updates without needing an account.",
      },
      {
        q: "Why is the map not showing the driver's location?",
        a: "This typically means the driver has their location permissions disabled on their phone, or the app is running in background and the OS has suspended it. Ask the driver to open the app and ensure location is set to 'Always Allow'.",
      },
    ],
  },
  {
    key: "billing",
    label: "Billing",
    icon: CreditCard,
    color: "text-rose-400",
    items: [
      {
        q: "When am I billed for shipments?",
        a: "By default, charges are consolidated daily and billed to your registered payment method at midnight WAT. Enterprise accounts can switch to weekly or monthly billing in Settings → Billing.",
      },
      {
        q: "How do I download an invoice?",
        a: "Go to Settings → Billing → Transaction History. Click the download icon next to any billing cycle to export a PDF invoice suitable for accounting or VAT purposes.",
      },
      {
        q: "What payment methods are accepted?",
        a: "We accept all major Nigerian bank cards (Visa, Mastercard, Verve), bank transfers via Paystack, and USSD payments. International cards are supported on the Business Pro plan.",
      },
    ],
  },
];

type StatusKey = "operational" | "degraded" | "outage";

const SYSTEM_STATUS: { name: string; status: StatusKey; uptime: string }[] = [
  { name: "API & Core Services",      status: "operational", uptime: "99.98%" },
  { name: "Live Tracking (WS)",       status: "operational", uptime: "99.95%" },
  { name: "SMS Notifications",        status: "operational", uptime: "99.91%" },
  { name: "Email Notifications",      status: "operational", uptime: "99.99%" },
  { name: "Payment Processing",       status: "degraded",    uptime: "98.12%" },
  { name: "Driver App (iOS/Android)", status: "operational", uptime: "99.97%" },
];

const STATUS_META: Record<StatusKey, { label: string; dot: string; text: string }> = {
  operational: { label: "Operational",    dot: "bg-emerald-400 shadow-[0_0_6px_#34d399]", text: "text-emerald-400" },
  degraded:    { label: "Degraded",       dot: "bg-amber-400 shadow-[0_0_6px_#fbbf24]",   text: "text-amber-400"  },
  outage:      { label: "Outage",         dot: "bg-rose-400 shadow-[0_0_6px_#f87171]",    text: "text-rose-400"   },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold text-white tracking-tight">{children}</h3>
  );
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            "rounded-xl border transition-all duration-200 overflow-hidden",
            open === i
              ? "border-sky-500/25 bg-sky-500/[0.04]"
              : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]",
          )}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
          >
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 shrink-0 mt-0.5 text-zinc-500 transition-transform duration-200",
                open === i ? "rotate-180 text-sky-400" : "",
              )}
            />
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                open === i ? "text-sky-300" : "text-zinc-200",
              )}
            >
              {item.q}
            </span>
          </button>
          {open === i && (
            <div className="px-4 pb-4 pl-10">
              <p className="text-[13px] leading-relaxed text-zinc-400">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Contact form ─────────────────────────────────────────────────────────────

function ContactForm() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) return;
    setSent(true);
    setSubject("");
    setMessage("");
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
          Subject
        </label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Driver not showing on map"
          className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/[0.12] transition-all"
        />
      </div>
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Describe your issue in detail…"
          className="w-full resize-none rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/[0.12] transition-all"
        />
      </div>

      {sent ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-400 font-medium">
            Message sent! We&apos;ll reply within 2 business hours.
          </p>
        </div>
      ) : (
        <button
          onClick={handleSend}
          disabled={!subject.trim() || !message.trim()}
          className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-400 active:scale-[0.98] transition-all shadow-lg shadow-sky-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-sky-500 disabled:active:scale-100"
        >
          <Send className="h-3.5 w-3.5" />
          Send message
        </button>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("shipments");

  // Filter FAQ by search query
  const filteredCategories = FAQ_CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        !search ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase()),
    ),
  })).filter((cat) => cat.items.length > 0);

  const overallStatus = SYSTEM_STATUS.some((s) => s.status === "outage")
    ? "outage"
    : SYSTEM_STATUS.some((s) => s.status === "degraded")
    ? "degraded"
    : "operational";

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div className="text-center space-y-4 pt-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/[0.07] px-3.5 py-1.5">
          <HelpCircle className="h-3.5 w-3.5 text-sky-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">
            Help Centre
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          How can we help you?
        </h2>
        <p className="text-sm text-zinc-500 max-w-md mx-auto">
          Search the docs, browse FAQs, or get in touch with the IsoTrack support team.
        </p>

        {/* Search */}
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help articles…"
            className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/[0.12] transition-all shadow-inner"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Quick links ── */}
      {!search && (
        <div>
          <SectionHeader>Getting Started</SectionHeader>
          <p className="text-xs text-zinc-600 mt-0.5 mb-4">Popular guides and articles</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.title}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    // scroll to FAQ section matching the topic
                  }}
                  className={cn(
                    "group flex items-start gap-3.5 rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer",
                    link.bg,
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    <Icon className={cn("h-5 w-5", link.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">
                      {link.title}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
                      {link.description}
                    </p>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all",
                      link.color,
                    )}
                  />
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* ── FAQ ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <SectionHeader>
              {search ? `Search results for "${search}"` : "Frequently Asked Questions"}
            </SectionHeader>
            {!search && (
              <p className="text-xs text-zinc-600 mt-0.5">
                {FAQ_CATEGORIES.reduce((n, c) => n + c.items.length, 0)} articles across{" "}
                {FAQ_CATEGORIES.length} categories
              </p>
            )}
          </div>
        </div>

        {search ? (
          /* Search results — flat list across all categories */
          filteredCategories.length > 0 ? (
            <div className="space-y-6">
              {filteredCategories.map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <div key={cat.key}>
                    <div className="flex items-center gap-2 mb-3">
                      <CatIcon className={cn("h-3.5 w-3.5", cat.color)} />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        {cat.label}
                      </span>
                    </div>
                    <FaqAccordion items={cat.items} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                <Search className="h-5 w-5 text-zinc-700" />
              </div>
              <p className="text-sm font-medium text-zinc-400">No articles found</p>
              <p className="text-xs text-zinc-600">
                Try different keywords or{" "}
                <button
                  onClick={() => setSearch("")}
                  className="text-sky-400 hover:text-sky-300 underline underline-offset-2"
                >
                  browse all articles
                </button>
              </p>
            </div>
          )
        ) : (
          /* Tabbed FAQ */
          <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] overflow-hidden">
            {/* Category tabs */}
            <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none border-b border-white/[0.05] px-4 pt-3 pb-0">
              {FAQ_CATEGORIES.map(({ key, label, icon: Icon, color }) => {
                const active = activeCategory === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={cn(
                      "flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-medium border-b-2 whitespace-nowrap transition-all",
                      active
                        ? "border-sky-400 text-sky-400"
                        : "border-transparent text-zinc-600 hover:text-zinc-300",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-3 w-3 transition-colors",
                        active ? "text-sky-400" : color,
                      )}
                    />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Questions */}
            <div className="p-5">
              {FAQ_CATEGORIES.filter((c) => c.key === activeCategory).map((cat) => (
                <FaqAccordion key={cat.key} items={cat.items} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── System status + Contact support ── */}
      <div className="grid sm:grid-cols-2 gap-4">

        {/* System status */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
            <div>
              <SectionHeader>System Status</SectionHeader>
              <p className="text-[10px] text-zinc-600 mt-0.5">Real-time platform health</p>
            </div>
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold",
                overallStatus === "operational"
                  ? "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400"
                  : overallStatus === "degraded"
                  ? "border-amber-500/20 bg-amber-500/[0.08] text-amber-400"
                  : "border-rose-500/20 bg-rose-500/[0.08] text-rose-400",
              )}
            >
              <Wifi className="h-3 w-3" />
              {overallStatus === "operational"
                ? "All Systems Go"
                : overallStatus === "degraded"
                ? "Minor Issues"
                : "Service Outage"}
            </div>
          </div>

          <div className="p-5 space-y-2.5">
            {SYSTEM_STATUS.map((service) => {
              const meta = STATUS_META[service.status];
              return (
                <div
                  key={service.name}
                  className="flex items-center gap-3"
                >
                  <div className={cn("h-2 w-2 rounded-full shrink-0", meta.dot)} />
                  <p className="flex-1 text-[12px] text-zinc-300 truncate">{service.name}</p>
                  <span className={cn("text-[10px] font-semibold shrink-0", meta.text)}>
                    {meta.label}
                  </span>
                  <span className="text-[10px] text-zinc-700 shrink-0 tabular-nums w-12 text-right">
                    {service.uptime}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="px-5 pb-4">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-700">
              <Clock className="h-3 w-3" />
              <span>Updated just now · 30-day uptime shown</span>
            </div>
          </div>
        </div>

        {/* Contact support */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.05]">
            <SectionHeader>Contact Support</SectionHeader>
            <p className="text-[10px] text-zinc-600 mt-0.5">
              Typical response: <span className="text-emerald-400 font-medium">under 2 hours</span>
            </p>
          </div>

          {/* Quick contact options */}
          <div className="px-5 pt-4 pb-3 grid grid-cols-2 gap-2">
            {[
              { icon: Mail,         label: "Email us",   sub: "support@isotrack.ng",  color: "text-sky-400",   bg: "bg-sky-500/[0.07] border-sky-500/15"     },
              { icon: MessageSquare,label: "Live chat",  sub: "Available 8am–6pm",    color: "text-teal-400",  bg: "bg-teal-500/[0.07] border-teal-500/15"   },
              { icon: Phone,        label: "Call us",    sub: "+234 800 ISO TRACK",   color: "text-violet-400",bg: "bg-violet-500/[0.07] border-violet-500/15"},
              { icon: BookOpen,     label: "Docs",       sub: "Full documentation",   color: "text-amber-400", bg: "bg-amber-500/[0.07] border-amber-500/15"  },
            ].map(({ icon: Icon, label, sub, color, bg }) => (
              <button
                key={label}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border p-3 transition-all duration-200 hover:-translate-y-0.5 text-left",
                  bg,
                )}
              >
                <Icon className={cn("h-4 w-4", color)} />
                <p className="text-[12px] font-semibold text-zinc-200">{label}</p>
                <p className="text-[10px] text-zinc-600 leading-tight">{sub}</p>
              </button>
            ))}
          </div>

          {/* Inline form */}
          <div className="px-5 pb-5 pt-2 border-t border-white/[0.04] mt-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-3 mt-2">
              Or send us a message
            </p>
            <ContactForm />
          </div>
        </div>
      </div>

      {/* ── Docs banner ── */}
      <div className="rounded-2xl border border-violet-500/[0.15] bg-gradient-to-r from-violet-500/[0.06] to-sky-500/[0.04] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10">
          <BookOpen className="h-5 w-5 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Full Developer Documentation</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            API references, webhook guides, and integration tutorials for developers and enterprise teams.
          </p>
        </div>
        <a
          href="#"
          className="flex shrink-0 items-center gap-2 rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-300 hover:bg-violet-500/[0.18] hover:border-violet-500/40 transition-all"
        >
          Open Docs
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* ── Incident history ── */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.05]">
          <SectionHeader>Recent Incidents</SectionHeader>
          <p className="text-[10px] text-zinc-600 mt-0.5">Last 30 days</p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {[
            {
              title: "Payment gateway elevated error rate",
              date: "May 9, 2026 · 09:14 WAT",
              duration: "Ongoing",
              status: "investigating" as const,
              detail: "We are investigating increased error rates on payment processing. All other services unaffected.",
            },
            {
              title: "SMS delivery delays — MTN Nigeria",
              date: "May 3, 2026 · 14:30 WAT",
              duration: "Resolved in 47 min",
              status: "resolved" as const,
              detail: "Delayed SMS notifications for MTN subscribers due to carrier-side congestion. All messages were eventually delivered.",
            },
            {
              title: "Live tracking WebSocket disconnects",
              date: "Apr 28, 2026 · 02:15 WAT",
              duration: "Resolved in 18 min",
              status: "resolved" as const,
              detail: "A brief infrastructure issue caused WebSocket connections to drop. Reconnection logic handled recovery for most clients automatically.",
            },
          ].map((incident) => (
            <div key={incident.title} className="px-5 py-4 flex items-start gap-4">
              <div className="shrink-0 mt-0.5">
                {incident.status === "resolved" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <p className="text-sm font-medium text-zinc-200">{incident.title}</p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      incident.status === "resolved"
                        ? "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-400"
                        : "border-amber-500/20 bg-amber-500/[0.07] text-amber-400",
                    )}
                  >
                    {incident.status === "resolved" ? "Resolved" : "Investigating"}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 mt-0.5">{incident.date} · {incident.duration}</p>
                <p className="text-[12px] text-zinc-500 mt-1.5 leading-relaxed">{incident.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-white/[0.04]">
          <button className="flex items-center gap-1.5 text-[11px] font-medium text-sky-400 hover:text-sky-300 transition-colors">
            View full incident history
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

    </div>
  );
}
