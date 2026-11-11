import { z } from "zod";
import type { Shipment } from "../types/index";

export interface WorkspaceShipment extends Shipment {
  version: number;
  recipientEmail: string | null;
  failureReason: string | null;
  failedAt: string | null;
  attemptNumber: number;
  returnState: "none" | "requested" | "in_transit" | "received";
  returnedAt: string | null;
  eventsTruncated?: boolean;
  payment?: {
    id: string;
    amountKobo: number;
    status: string;
    channel: string | null;
    paidAt: string | null;
    createdAt: string;
  } | null;
}
const address = z.object({
  street: z.string().trim().min(1).max(300),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
});
const email = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((value) => value.toLowerCase())
  .optional();
export const newShipmentSchema = z
  .object({
    description: z.string().trim().min(1).max(2000),
    weightKg: z.number().finite().positive().max(1000000),
    pickupAddress: address,
    deliveryAddress: address,
    priceKobo: z.number().int().positive().max(2147483647),
    customerEmail: email,
    recipientEmail: email,
    scheduledPickup: z.string().datetime({ offset: true }).optional(),
  })
  .strict();
export type NewShipment = z.infer<typeof newShipmentSchema>;

export function shipmentMoney(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(kobo / 100);
}

/** Convert decimal naira without silently rounding a fraction of a kobo. */
export function nairaToKobo(value: string): number {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value.trim())) return NaN;
  const [whole, fraction = ""] = value.trim().split(".");
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(amount) ? amount : NaN;
}
export function uncertainShipmentError(error: unknown): boolean {
  const response = (error as { response?: { status?: number; data?: { error?: string } } })
    ?.response;
  return (
    !response ||
    (response.status ?? 500) >= 500 ||
    response.status === 408 ||
    response.status === 429 ||
    response.data?.error === "IDEMPOTENCY_IN_PROGRESS"
  );
}
export function shipmentMatches(shipment: Shipment, query: string, status: string) {
  const active = ["assigned", "picked_up", "in_transit", "out_for_delivery"];
  if (
    status !== "all" &&
    !(status === "active" ? active.includes(shipment.status) : shipment.status === status)
  )
    return false;
  return [
    shipment.trackingId,
    shipment.description,
    shipment.pickupAddress.street,
    shipment.pickupAddress.city,
    shipment.deliveryAddress.street,
    shipment.deliveryAddress.city,
    shipment.customer?.name,
    shipment.customer?.email,
    shipment.driver?.user?.name,
  ].some((value) => value?.toLowerCase().includes(query.trim().toLowerCase()));
}
