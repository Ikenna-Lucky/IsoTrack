"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  LifeBuoy,
  Mail,
  MessageSquare,
  Package,
  Search,
  Settings,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { key: "shipments", label: "Shipments", icon: Package },
  { key: "drivers", label: "Drivers", icon: Truck },
  { key: "billing", label: "Billing", icon: BookOpen },
  { key: "account", label: "Account", icon: Settings },
] as const;

const FAQS = [
  {
    category: "shipments",
    q: "How do I create a new shipment?",
    a: "Open New shipment, enter pickup and delivery details, package weight, recipient contact, and the customer charge. After creation, the tracking ID can be shared with the recipient.",
  },
  {
    category: "shipments",
    q: "Can I cancel a shipment?",
    a: "Pending shipments can be cancelled from the Shipments page. Once a shipment is assigned or moving, cancellation depends on the current operational state.",
  },
  {
    category: "drivers",
    q: "How are drivers assigned?",
    a: "Open a pending shipment, choose an available driver, and assign them. The shipment moves from pending into the dispatch flow.",
  },
  {
    category: "drivers",
    q: "Why is a driver unavailable?",
    a: "Drivers can be offline, already on delivery, or not currently accepting jobs. The Drivers page shows each driver status and active assignment.",
  },
  {
    category: "billing",
    q: "Who pays for the shipment?",
    a: "The business sets the customer charge when creating a shipment. Customers can complete payment from their tracking experience.",
  },
  {
    category: "account",
    q: "How do I update business details?",
    a: "Go to Settings, then Profile. You can update business name, address, owner name, and phone details used for dispatch records.",
  },
];

function ContactForm() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSent(true);
    setSubject("");
    setMessage("");
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-md border border-white/[0.07] bg-[#0d1412] p-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-teal-200" />
        <p className="text-sm font-black text-stone-100">Contact support</p>
      </div>
      <input
        value={subject}
        onChange={(event) => setSubject(event.target.value)}
        placeholder="Subject"
        className="w-full rounded-md border border-white/[0.08] bg-black/25 px-3 py-3 text-sm font-bold text-stone-100 outline-none placeholder:text-stone-700 focus:border-teal-400/40"
      />
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Tell us what happened"
        rows={5}
        className="w-full resize-none rounded-md border border-white/[0.08] bg-black/25 px-3 py-3 text-sm font-bold text-stone-100 outline-none placeholder:text-stone-700 focus:border-teal-400/40"
      />
      {sent && <p className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-100">Support note prepared. We will connect this to backend messaging when available.</p>}
      <button className="w-full rounded-md bg-amber-300 px-4 py-2.5 text-sm font-black text-black transition hover:bg-amber-200">
        Send message
      </button>
    </form>
  );
}

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["key"]>("shipments");
  const [open, setOpen] = useState<number | null>(0);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FAQS.filter((item) => {
      const matchesCategory = item.category === category;
      const matchesSearch = !q || item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr,360px] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-200">Support desk</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-50 sm:text-3xl">Help</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
              Find answers for dispatch, drivers, billing, and account operations.
            </p>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-600" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search help"
              className="w-full rounded-md border border-white/[0.08] bg-black/25 py-3 pl-10 pr-3 text-sm font-bold text-stone-100 outline-none transition placeholder:text-stone-700 focus:border-teal-400/40 focus:ring-2 focus:ring-teal-400/10"
            />
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[240px,1fr,320px]">
        <aside className="space-y-2">
          {CATEGORIES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setCategory(key);
                setOpen(0);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left text-sm font-black transition",
                category === key
                  ? "border-teal-400/25 bg-teal-400/10 text-teal-100"
                  : "border-white/[0.07] bg-white/[0.03] text-stone-500 hover:text-stone-200",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}

          <div className="rounded-md border border-amber-400/20 bg-amber-400/10 p-4">
            <AlertCircle className="h-5 w-5 text-amber-200" />
            <p className="mt-3 text-sm font-black text-stone-100">Urgent delivery issue?</p>
            <p className="mt-1 text-xs leading-5 text-stone-500">Use the shipment file first so support can reference the tracking ID.</p>
          </div>
        </aside>

        <section className="rounded-md border border-white/[0.07] bg-[#0d1412]">
          <div className="border-b border-white/[0.07] px-4 py-4">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-600">Knowledge base</p>
            <h3 className="mt-1 text-base font-black text-stone-50">Frequently asked questions</h3>
          </div>
          <div className="divide-y divide-white/[0.07]">
            {filtered.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <LifeBuoy className="mx-auto h-6 w-6 text-stone-700" />
                <p className="mt-3 text-sm font-black text-stone-200">No answers found</p>
              </div>
            ) : (
              filtered.map((item, index) => {
                const active = open === index;
                return (
                  <button key={item.q} onClick={() => setOpen(active ? null : index)} className="w-full px-4 py-4 text-left transition hover:bg-white/[0.03]">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black text-stone-100">{item.q}</p>
                      <ChevronDown className={cn("h-4 w-4 shrink-0 text-stone-600 transition", active && "rotate-180 text-teal-200")} />
                    </div>
                    {active && <p className="mt-3 text-sm leading-6 text-stone-500">{item.a}</p>}
                  </button>
                );
              })
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <ContactForm />
          <div className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-teal-200" />
              <p className="text-sm font-black text-stone-100">Direct channels</p>
            </div>
            <div className="mt-4 space-y-2 text-xs font-bold text-stone-500">
              <p>support@isotrack.local</p>
              <p>Operations desk: weekdays, 8am-6pm</p>
            </div>
            <Link href="/business/settings" className="mt-4 inline-flex text-xs font-black text-teal-200 hover:text-teal-100">
              Update notification settings
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
