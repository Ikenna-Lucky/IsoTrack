import { Plus } from "lucide-react";

const QUESTIONS = [
  {
    question: "Can anyone sign up as a driver?",
    answer:
      "Drivers join through an invitation from a business. Each driver belongs to one business at a time, and businesses assign deliveries within their own fleet.",
  },
  {
    question: "Does a recipient need an account to track a shipment?",
    answer:
      "No. A recipient can open the shared tracking link or enter a tracking ID to follow a shipment without signing in. The delivery confirmation code is kept separate from public tracking.",
  },
  {
    question: "How is delivery confirmed?",
    answer:
      "The recipient receives an eight-digit confirmation code by email. After receiving the package, they share the code with the assigned driver to confirm handover. The code expires 20 minutes after it is requested.",
  },
  {
    question: "Will I be charged real money?",
    answer:
      "This portfolio project uses Stripe sandbox payments. Checkout uses test payment details and does not charge real money. Do not enter your real card details into the demo.",
  },
  {
    question: "Are the shipments on this page real?",
    answer:
      "No. The landing-page animations and sample tracking view use illustrative shipment, driver and recipient data. They show the delivery workflow without creating shipments, sending invitations or making payments.",
  },
];

export function LandingFaq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="scroll-mt-20 bg-[#080b0b] px-7 py-20 min-[600px]:px-12 min-[950px]:px-[55px] min-[1150px]:px-[6vw] lg:py-28"
    >
      <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <h2
            id="faq-title"
            className="text-3xl font-semibold leading-[1.12] tracking-tight text-stone-100 sm:text-4xl"
          >
            Before you get started.
          </h2>
          <p className="mt-5 max-w-sm text-base leading-7 text-stone-400">
            A few details about your fleet, your customers and this portfolio project.
          </p>
        </div>
        <div className="border-t border-white/15">
          {QUESTIONS.map(({ question, answer }) => (
            <details key={question} className="group border-b border-white/15">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-5 text-sm font-medium leading-6 text-stone-200 hover:text-teal-200 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300 sm:text-base [&::-webkit-details-marker]:hidden">
                {question}
                <Plus
                  aria-hidden="true"
                  className="size-4 shrink-0 text-teal-200 group-open:rotate-45"
                />
              </summary>
              <p className="max-w-2xl pb-6 pr-6 text-sm leading-7 text-stone-400">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
