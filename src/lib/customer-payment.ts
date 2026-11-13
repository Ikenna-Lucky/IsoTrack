import { z } from "zod";
export const paymentReference = z.string().regex(/^IST-PAY-[A-Za-z0-9_-]{24}$/);
export const checkoutSchema = z.object({
  reference: paymentReference,
  authorizationUrl: z.string(),
  sessionId: z.string().min(1),
  amountKobo: z.number().int().nonnegative(),
});
export type Checkout = z.infer<typeof checkoutSchema>;
const checkoutState = z.enum([
  "untracked",
  "creating",
  "open",
  "processing",
  "expired",
  "failed",
  "settled",
  "review",
]);
export const verificationSchema = z.object({
  reference: paymentReference,
  paid: z.boolean(),
  applied: z.boolean(),
  requiresReview: z.boolean(),
  channel: z.literal("stripe_checkout"),
  status: z.enum(["paid", "unpaid", "no_payment_required"]),
  checkoutState: checkoutState.optional(),
});
export const cancellationSchema = z.object({
  reference: paymentReference,
  requiresReview: z.boolean(),
  checkoutState: checkoutState.optional(),
});
export type PaymentVerification = z.infer<typeof verificationSchema>;
export function paymentOutcome(value: PaymentVerification) {
  if (value.requiresReview || value.checkoutState === "review") return "review";
  if (
    value.paid &&
    value.applied &&
    value.status === "paid" &&
    (value.checkoutState === undefined || value.checkoutState === "settled")
  )
    return "settled";
  if (value.paid || value.applied) return "unresolved";
  if (value.checkoutState === "expired" || value.checkoutState === "failed") return "closed";
  return "pending";
}
export const paymentMessages = {
  settled: "Payment confirmed and applied to the shipment.",
  review: "Payment needs review by the business. Do not start another checkout for this shipment.",
  unresolved:
    "Payment was reported but settlement is not confirmed. Check this reference again before paying.",
  closed:
    "This checkout is closed without a confirmed payment. Refresh the shipment before starting a new checkout.",
  pending:
    "Payment is not confirmed. Check this reference again or close the unpaid checkout before starting another.",
};
export function checkoutFailureIsUncertain(error: unknown) {
  const response = (error as { response?: { status?: number; data?: { error?: string } } })
    ?.response;
  return (
    !response ||
    (response.status ?? 500) >= 500 ||
    [408, 409, 429].includes(response.status ?? 0) ||
    response.data?.error === "IDEMPOTENCY_IN_PROGRESS"
  );
}

export interface CheckoutRequest {
  key: string;
  body: { shipmentId: string };
  checkout?: Checkout;
}
export async function initializeCustomerCheckout(
  client: {
    post: (
      path: string,
      body: unknown,
      options: { headers: Record<string, string> },
    ) => Promise<{ data: { data: unknown } }>;
  },
  request: CheckoutRequest,
): Promise<Checkout> {
  return checkoutSchema.parse(
    (
      await client.post("/payments/initialize", request.body, {
        headers: { "Idempotency-Key": request.key },
      })
    ).data.data,
  );
}
