import { z } from "zod";
import type { WorkspaceShipment } from "./shipment-workspace";

export const failureReasons = {
  recipient_unavailable: "Recipient unavailable",
  recipient_refused: "Recipient refused delivery",
  address_incorrect: "Address incorrect",
  recipient_code_unavailable: "Recipient code unavailable",
  package_damaged: "Package damaged",
  vehicle_issue: "Vehicle issue",
  other: "Other",
} as const;
export type ExceptionAction =
  | "fail"
  | "retry"
  | "return_request"
  | "return_start"
  | "return_receive"
  | "cancel_failed";
export const exceptionLabels: Record<ExceptionAction, string> = {
  fail: "Report failed attempt",
  retry: "Authorize another attempt",
  return_request: "Request return",
  return_start: "Start return journey",
  return_receive: "Confirm return receipt",
  cancel_failed: "Cancel before pickup",
};
export const returnLabels = {
  none: "Not requested",
  requested: "Return requested",
  in_transit: "Return in transit",
  received: "Return received",
} as const;
const common = {
  expectedVersion: z.number().int().min(0).max(2147483646),
  note: z.string().trim().max(1000).default(""),
};
export const exceptionInput = z.union([
  z
    .object({
      ...common,
      action: z.literal("fail"),
      reason: z.enum([
        "recipient_unavailable",
        "recipient_refused",
        "address_incorrect",
        "recipient_code_unavailable",
        "package_damaged",
        "vehicle_issue",
        "other",
      ]),
    })
    .strict()
    .refine(
      (input) => input.reason !== "other" || !!input.note,
      "Explain the failure when selecting Other.",
    ),
  z
    .object({
      ...common,
      action: z.enum([
        "retry",
        "return_request",
        "return_start",
        "return_receive",
        "cancel_failed",
      ]),
    })
    .strict(),
]);
export type ExceptionInput = z.infer<typeof exceptionInput>;
export interface ExceptionRecord {
  id: string;
  shipmentId: string;
  actorId: string;
  action: ExceptionAction;
  reason: keyof typeof failureReasons | null;
  note: string;
  version: number;
  attemptNumber: number;
  createdAt: string;
}
export interface ExceptionPage {
  data: ExceptionRecord[];
  pagination: { limit: number; hasMore: boolean; nextBeforeVersion: number | null };
}
export function nextExceptionVersion(page: ExceptionPage) {
  return page.pagination.hasMore ? (page.pagination.nextBeforeVersion ?? undefined) : undefined;
}
type Context = Pick<
  WorkspaceShipment,
  "status" | "actualPickup" | "driverId" | "attemptNumber" | "returnState"
>;
export function exceptionActions(
  shipment: Context,
  role: "business" | "driver",
): ExceptionAction[] {
  if (
    shipment.returnState === "none" &&
    ["assigned", "picked_up", "in_transit", "out_for_delivery"].includes(shipment.status)
  )
    return ["fail"];
  if (shipment.status !== "failed") return [];
  if (role === "driver") return shipment.returnState === "requested" ? ["return_start"] : [];
  if (shipment.returnState === "requested" || shipment.returnState === "in_transit")
    return ["return_receive"];
  if (shipment.returnState !== "none") return [];
  const actions: ExceptionAction[] = [];
  if (shipment.attemptNumber < 3 && (!shipment.actualPickup || shipment.driverId))
    actions.push("retry");
  if (shipment.actualPickup) {
    if (shipment.driverId) actions.push("return_request");
  } else actions.push("cancel_failed");
  return actions;
}
export function exceptionExplanation(action: ExceptionAction, hasPickup: boolean) {
  const messages: Record<ExceptionAction, string> = {
    fail: "This ends the current delivery attempt and invalidates any recipient code. The business will decide on a retry or return.",
    retry: hasPickup
      ? "The assigned driver keeps the package and original pickup record. Another attempt starts from picked up. A fresh recipient code is required at handover."
      : "The assignment will be cleared and the shipment will await a driver for the next attempt.",
    return_request:
      "The assigned driver must return this package to your business. Another delivery attempt will no longer be available.",
    return_start:
      "Confirm that you are starting the return journey with this package. Your business must confirm receipt at handover.",
    return_receive:
      "Confirm only after the package has physically returned to your business. This completes the return; a later delivery needs a new shipment.",
    cancel_failed:
      "Pickup has not been recorded. Cancellation preserves the shipment and history; it does not issue a refund.",
  };
  return messages[action];
}
export function exceptionError(error: unknown) {
  const code = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
  const messages: Record<string, string> = {
    SHIPMENT_VERSION_CONFLICT: "The shipment changed. Reload before making a new decision.",
    INVALID_EXCEPTION_TRANSITION:
      "This action is no longer allowed for the shipment's state, custody or attempt count. Reload its details.",
    INVALID_FAILURE_REASON: "Select a valid failure reason.",
    FORBIDDEN: "Your account cannot perform this action.",
    NOT_FOUND: "The shipment is no longer available to your account.",
    IDEMPOTENCY_EXPIRED:
      "This request has expired. Check the current shipment before starting another action.",
    IDEMPOTENCY_KEY_CONFLICT:
      "This request cannot be changed. Reload before making a new decision.",
  };
  return code && messages[code]
    ? messages[code]
    : "The action could not be confirmed. Retry the same request if the result is uncertain.";
}
