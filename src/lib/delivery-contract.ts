import { z } from "zod";

export const recipientConfirmationEmail = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((value) => value.toLowerCase());
export const recipientDeliveryCode = z
  .string()
  .regex(/^\d{8}$/, "Enter the eight-digit code, including any leading zeros.");
export interface DeliveryChallenge {
  challengeId: string;
  version: number;
  expiresAt: string;
  deliveryState: "pending" | "processing" | "sent" | "skipped" | "dead";
}
export function challengeUsable(
  challenge: DeliveryChallenge | null | undefined,
  version: number,
  now = Date.now(),
) {
  return !!challenge && challenge.version === version && Date.parse(challenge.expiresAt) > now;
}
export const deliveryEmailLabels: Record<DeliveryChallenge["deliveryState"], string> = {
  pending: "Email queued",
  processing: "Email being sent",
  sent: "Email accepted by the mail service",
  skipped: "Email not sent",
  dead: "Email sending failed",
};
export function deliveryErrorMessage(error: unknown) {
  const code = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
  const messages: Record<string, string> = {
    INVALID_DELIVERY_CODE:
      "That code is incorrect. Check it with the recipient. Five incorrect attempts lock the code.",
    DELIVERY_CODE_UNAVAILABLE:
      "This code has expired, been replaced or become locked. Ask the business to send a new code.",
    SHIPMENT_VERSION_CONFLICT: "The shipment changed. Refresh its details before trying again.",
    DELIVERY_RATE_LIMIT:
      "The resend limit has been reached. Wait at least a minute between sends. A shipment allows up to three sends per hour.",
    DELIVERY_UNAVAILABLE:
      "Delivery confirmation is not configured on the server. Contact your business administrator.",
    IDEMPOTENCY_EXPIRED:
      "This request has expired. Refresh the shipment and check its state before starting another action.",
    IDEMPOTENCY_KEY_CONFLICT:
      "This request could not be reused. Refresh the shipment before making a new decision.",
  };
  return code && messages[code]
    ? messages[code]
    : "The action could not be confirmed. Refresh the shipment or retry the same request if its result is uncertain.";
}
