"use client";

import { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Package,
  DollarSign,
  Smartphone,
  CreditCard,
  ExternalLink,
  MessageSquare,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  HelpCircle,
  ArrowRight,
  Send,
  Wifi,
  Star,
  Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FaqItem   { q: string; a: string }
interface FaqCategory {
  key: string; label: string; icon: React.ElementType; color: string; items: FaqItem[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  { icon: Package,    title: "Your First Delivery",    description: "Step-by-step walkthrough of accepting and completing a delivery",   color: "text-teal-400",   bg: "bg-teal-500/10   border-teal-500/20"   },
  { icon: Navigation, title: "Navigation & Tracking",  description: "How live GPS tracking works and what customers can see",            color: "text-sky-400",    bg: "bg-sky-500/10    border-sky-500/20"    },
  { icon: DollarSign, title: "Earnings & Payouts",     description: "Understand how your earnings are calculated and when you're paid",  color: "text-emerald-400",bg: "bg-emerald-500/10 border-emerald-500/20"},
  { icon: Star,       title: "Ratings & Reviews",      description: "How the rating system works and how to maintain a high score",      color: "text-amber-400",  bg: "bg-amber-500/10  border-amber-500/20"  },
  { icon: Smartphone, title: "App Troubleshooting",    description: "Fix common issues with location, notifications, and connectivity",  color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  { icon: CreditCard, title: "Payout Setup",           description: "Link your bank account and set your payout preferences",           color: "text-rose-400",   bg: "bg-rose-500/10   border-rose-500/20"   },
];

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    key: "deliveries", label: "Deliveries", icon: Package, color: "text-teal-400",
    items: [
      { q: "How do I accept a new delivery?",
        a: "When a new delivery is assigned to you, you will receive a push notification. Open the app, review the pickup and delivery details, then tap 'Accept'. You have 60 seconds to accept before the job is offered to another driver." },
      { q: "What do I do if the customer is not home?",
        a: "Attempt to call the customer using the in-app call button. If there is no answer after 3 attempts within 10 minutes, take a photo of the delivery location and mark the delivery as 'Attempted — Customer Unavailable'. The system will notify the business and arrange a redelivery." },
      { q: "Can I reject a delivery once accepted?",
        a: "Yes, but doing so after pickup will negatively affect your acceptance rate. You can cancel before pickup by tapping 'Cancel delivery' and selecting a reason. Repeated cancellations after acceptance may result in temporary account suspension." },
      { q: "What is the 'Out for Delivery' status?",
        a: "Once you pick up the package and confirm collection in the app, the status changes to 'Out for Delivery'. This tells the customer you are on your way and activates live GPS tracking so they can follow you on the map." },
    ],
  },
  {
    key: "earnings", label: "Earnings", icon: DollarSign, color: "text-emerald-400",
    items: [
      { q: "How is my earning per delivery calculated?",
        a: "You earn 40% of the shipment value. For example, a ₦3,500 shipment earns you ₦1,400. Bonuses may apply for deliveries completed during peak hours (6–9am and 5–8pm) or for maintaining a 4.8+ rating." },
      { q: "When do I get paid?",
        a: "Earnings are consolidated daily and paid out every Friday to your registered bank account. If Friday falls on a public holiday, the payout is processed the next business day. You can view your pending balance in the Earnings tab." },
      { q: "Why is my earning showing ₦0 for a delivery?",
        a: "A ₦0 earning usually means the delivery was marked as 'Failed' — either the customer was unavailable or the package was returned. You only earn for successfully completed deliveries." },
      { q: "What happens if a customer disputes a delivery?",
        a: "Our support team will review the case. While it is under review, the earning may be withheld. You can submit evidence (photos, call logs) through the Help section to support your case. Most disputes are resolved within 48 hours." },
    ],
  },
  {
    key: "app", label: "App & Tech", icon: Smartphone, color: "text-violet-400",
    items: [
      { q: "Why is my location not updating on the map?",
        a: "This is usually a location permissions issue. Go to your phone Settings → Apps → IsoTrack Driver → Permissions and ensure Location is set to 'Allow all the time' (not 'Only while using the app'). Also make sure Background App Refresh is enabled." },
      { q: "What does the green 'Online' status mean?",
        a: "Green means you are active and available to receive delivery assignments. When you go offline (either manually or by closing the app for more than 15 minutes), your status changes to Offline and new deliveries will not be assigned to you." },
      { q: "How often is my GPS location sent to customers?",
        a: "When you are on an active delivery, your location is broadcast to our servers every 4–5 seconds. Customers can see your live position on the tracking map. This stops automatically once the delivery is marked as complete." },
      { q: "The app keeps crashing — what should I do?",
        a: "First, try force-closing and reopening the app. If the issue persists, clear the app cache (Settings → Apps → IsoTrack Driver → Clear Cache) and restart your phone. If it still crashes, uninstall and reinstall from the Play Store. Contact support if the issue continues." },
    ],
  },
  {
    key: "payouts", label: "Payouts", icon: CreditCard, color: "text-rose-400",
    items: [
      { q: "How do I add or change my bank account?",
        a: "Go to Settings → Payouts. You can add a new bank account by entering your bank name and account number. For security, account changes require verification via OTP sent to your registered phone number. Changes take effect from the next payout cycle." },
      { q: "My payout is late — what should I do?",
        a: "Payouts are processed every Friday morning and typically arrive within 2–3 business hours. If you have not received your payout by Friday afternoon, check the Earnings page to confirm the payout status. If it shows 'Processing', allow until Monday. Contact support if it has not arrived by then." },
      { q: "Is there a minimum payout amount?",
        a: "Yes, the minimum payout is ₦1,000. If your weekly earnings are below this amount, they will roll over and be added to the following week's earnings until the minimum is reached." },
    ],
  },
];

type StatusKey = "operational" | "degraded" | "outage";

const SYSTEM_STATUS: { name: string; status: StatusKey; uptime: string }[] = [
  { name: "Driver App (Android/iOS)",   status: "operational", uptime: "99.97%" },
  { name: "Delivery Assignment Engine", status: "operational", uptime: "99.99%" },
  { name: "Live GPS Tracking",          status: "operational", uptime: "99.95%" },
  { name: "Push Notifications",         status: "operational", uptime: "99.88%" },
  { name: "Payment Processing",         status: "degraded",    uptime: "98.12%" },
  { name: "In-App Messaging",           status: "operational", uptime: "99.93%" },
];
const STATUS_META: Record<StatusKey, { label: string; dot: string; text: string }> = {
  operational: { label: "Operational", dot: "bg-emerald-400 shadow-[0_0_6px_#34d399]", text: "text-emerald-400" },
  degraded:    { label: "Degraded",    dot: "bg-amber-400  shadow-[0_0_6px_#fbbf24]",  text: "text-amber-400"  },
  outage:      { label: "Outage",      dot: "bg-rose-400   shadow-[0_0_6px_#f87171]",  text: "text-rose-400"   },
};

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
              ? "border-teal-500/25 bg-teal-500/[0.04]"
              : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]",
          )}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
          >
            <ChevronDown className={cn(
              "h-3.5 w-3.5 shrink-0 mt-0.5 text-zinc-500 transition-transform duration-200",
              open === i && "rotate-180 text-teal-400",
            )} />
            <span className={cn(
              "text-sm font-medium transition-colors",
              open === i ? "text-teal-300" : "text-zinc-200",
            )}>
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
  const [sent,    setSent]    = useState(false);

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) return;
    setSent(true); setSubject(""); setMessage("");
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Subject</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. My payout hasn&apos;t arrived"
          className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-teal-500/40 focus:ring-2 focus:ring-teal-500/[0.12] transition-all"
        />
      </div>
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Describe your issue in detail…"
          className="w-full resize-none rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-teal-500/40 focus:ring-2 focus:ring-teal-500/[0.12] transition-all"
        />
      </div>
      {sent ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-400 font-medium">Message sent! We&apos;ll reply within 2 business hours.</p>
        </div>
      ) : (
        <button
          onClick={handleSend}
          disabled={!subject.trim() || !message.trim()}
          className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-400 active:scale-[0.98] transition-all shadow-lg shadow-teal-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-teal-500 disabled:active:scale-100"
        >
          <Send className="h-3.5 w-3.5" />
          Send message
        </button>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DriverHelpPage() {
  const [search,          setSearch]          = useState("");
  const [activeCategory,  setActiveCategory]  = useState("deliveries");

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
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/[0.07] px-3.5 py-1.5">
          <HelpCircle className="h-3.5 w-3.5 text-teal-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-400">Driver Help Centre</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">How can we help you?</h2>
        <p className="text-sm text-zinc-500 max-w-md mx-auto">
          Search the docs, browse FAQs, or get in touch with the IsoTrack driver support team.
        </p>

        {/* Search */}
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help articles…"
            className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-teal-500/40 focus:ring-2 focus:ring-teal-500/[0.12] transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-600 hover:text-zinc-300 transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Quick links ── */}
      {!search && (
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Getting Started</h3>
          <p className="text-xs text-zinc-600 mt-0.5 mb-4">Popular guides for drivers</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <div
                  key={link.title}
                  className={cn(
                    "group flex items-start gap-3.5 rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer",
                    link.bg,
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    <Icon className={cn("h-5 w-5", link.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">{link.title}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">{link.description}</p>
                  </div>
                  <ChevronRight className={cn("h-4 w-4 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all", link.color)} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── FAQ ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              {search ? `Search results for "${search}"` : "Frequently Asked Questions"}
            </h3>
            {!search && (
              <p className="text-xs text-zinc-600 mt-0.5">
                {FAQ_CATEGORIES.reduce((n, c) => n + c.items.length, 0)} articles across {FAQ_CATEGORIES.length} categories
              </p>
            )}
          </div>
        </div>

        {search ? (
          filteredCategories.length > 0 ? (
            <div className="space-y-6">
              {filteredCategories.map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <div key={cat.key}>
                    <div className="flex items-center gap-2 mb-3">
                      <CatIcon className={cn("h-3.5 w-3.5", cat.color)} />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{cat.label}</span>
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
                <button onClick={() => setSearch("")} className="text-teal-400 hover:text-teal-300 underline underline-offset-2">
                  browse all articles
                </button>
              </p>
            </div>
          )
        ) : (
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
                      "flex shrink-0 items-center gap-1.5 px-3.5 py-2 text-[12px] font-medium border-b-2 whitespace-nowrap transition-all",
                      active
                        ? "border-teal-400 text-teal-400"
                        : "border-transparent text-zinc-600 hover:text-zinc-300",
                    )}
                  >
                    <Icon className={cn("h-3 w-3 transition-colors", active ? "text-teal-400" : color)} />
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="p-5">
              {FAQ_CATEGORIES.filter((c) => c.key === activeCategory).map((cat) => (
                <FaqAccordion key={cat.key} items={cat.items} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── System status + Contact ── */}
      <div className="grid sm:grid-cols-2 gap-4">

        {/* System status */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">System Status</h3>
              <p className="text-[10px] text-zinc-600 mt-0.5">Real-time platform health</p>
            </div>
            <div className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold",
              overallStatus === "operational"
                ? "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400"
                : "border-amber-500/20 bg-amber-500/[0.08] text-amber-400",
            )}>
              <Wifi className="h-3 w-3" />
              {overallStatus === "operational" ? "All Systems Go" : "Minor Issues"}
            </div>
          </div>
          <div className="p-5 space-y-2.5">
            {SYSTEM_STATUS.map((service) => {
              const meta = STATUS_META[service.status];
              return (
                <div key={service.name} className="flex items-center gap-3">
                  <div className={cn("h-2 w-2 rounded-full shrink-0", meta.dot)} />
                  <p className="flex-1 text-[12px] text-zinc-300 truncate">{service.name}</p>
                  <span className={cn("text-[10px] font-semibold shrink-0", meta.text)}>{meta.label}</span>
                  <span className="text-[10px] text-zinc-700 shrink-0 tabular-nums w-12 text-right">{service.uptime}</span>
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
            <h3 className="text-sm font-bold text-white">Contact Support</h3>
            <p className="text-[10px] text-zinc-600 mt-0.5">
              Typical response: <span className="text-emerald-400 font-medium">under 2 hours</span>
            </p>
          </div>
          <div className="px-5 pt-4 pb-3 grid grid-cols-2 gap-2">
            {[
              { icon: Mail,          label: "Email us",   sub: "support@isotrack.ng",  color: "text-teal-400",   bg: "bg-teal-500/[0.07]   border-teal-500/15"   },
              { icon: MessageSquare, label: "Live chat",  sub: "Available 8am–6pm",    color: "text-sky-400",    bg: "bg-sky-500/[0.07]    border-sky-500/15"    },
              { icon: Phone,         label: "Call us",    sub: "+234 800 ISO TRACK",   color: "text-violet-400", bg: "bg-violet-500/[0.07] border-violet-500/15" },
              { icon: BookOpen,      label: "Docs",       sub: "Full documentation",   color: "text-amber-400",  bg: "bg-amber-500/[0.07]  border-amber-500/15"  },
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
          <div className="px-5 pb-5 pt-2 border-t border-white/[0.04] mt-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-3 mt-2">Or send us a message</p>
            <ContactForm />
          </div>
        </div>
      </div>

      {/* ── Docs banner ── */}
      <div className="rounded-2xl border border-teal-500/[0.15] bg-gradient-to-r from-teal-500/[0.06] to-emerald-500/[0.04] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10">
          <BookOpen className="h-5 w-5 text-teal-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Driver Handbook & Policy Guide</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            Complete guide to IsoTrack driver policies, earnings structure, and best practices for top performance.
          </p>
        </div>
        <a
          href="#"
          className="flex shrink-0 items-center gap-2 rounded-xl border border-teal-500/25 bg-teal-500/10 px-4 py-2.5 text-sm font-semibold text-teal-300 hover:bg-teal-500/[0.18] hover:border-teal-500/40 transition-all"
        >
          Open Handbook
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* ── Incident history ── */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d11] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.05]">
          <h3 className="text-sm font-bold text-white">Recent Incidents</h3>
          <p className="text-[10px] text-zinc-600 mt-0.5">Last 30 days</p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {[
            {
              title:    "Payment gateway elevated error rate",
              date:     "May 9, 2026 · 09:14 WAT",
              duration: "Ongoing",
              status:   "investigating" as const,
              detail:   "Payout processing is experiencing delays. Earnings are safe and will be transferred once the issue is resolved. We are working urgently with our payment provider.",
            },
            {
              title:    "Push notification delays — Android",
              date:     "May 4, 2026 · 11:30 WAT",
              duration: "Resolved in 1h 12m",
              status:   "resolved" as const,
              detail:   "Some Android drivers experienced delayed delivery notifications due to a Firebase configuration issue. All affected notifications were eventually delivered.",
            },
            {
              title:    "GPS tracking briefly unavailable",
              date:     "Apr 28, 2026 · 02:15 WAT",
              duration: "Resolved in 18 min",
              status:   "resolved" as const,
              detail:   "A brief infrastructure issue caused live GPS updates to stop broadcasting. Customers were notified and tracking resumed automatically after the fix.",
            },
          ].map((incident) => (
            <div key={incident.title} className="px-5 py-4 flex items-start gap-4">
              <div className="shrink-0 mt-0.5">
                {incident.status === "resolved"
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  : <AlertCircle  className="h-4 w-4 text-amber-400"   />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <p className="text-sm font-medium text-zinc-200">{incident.title}</p>
                  <span className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    incident.status === "resolved"
                      ? "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-400"
                      : "border-amber-500/20  bg-amber-500/[0.07]  text-amber-400",
                  )}>
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
          <button className="flex items-center gap-1.5 text-[11px] font-medium text-teal-400 hover:text-teal-300 transition-colors">
            View full incident history <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

    </div>
  );
}
