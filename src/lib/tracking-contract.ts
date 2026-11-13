import { z } from "zod";
export const trackingIdInput = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/)
  .transform((value) => value.toUpperCase());
export const shipmentStatus = z.enum([
  "pending",
  "assigned",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "failed",
  "cancelled",
]);
export const publicTrackingSchema = z.object({
  trackingId: z.string(),
  status: shipmentStatus,
  scheduledPickup: z.string().nullable(),
  estimatedDelivery: z.string().nullable(),
  actualDelivery: z.string().nullable(),
  events: z.array(z.object({ status: shipmentStatus, message: z.string(), createdAt: z.string() })),
  eventsTruncated: z.boolean(),
});
export type PublicTracking = z.infer<typeof publicTrackingSchema>;
