import { z } from "zod";
import type { ShipmentStatus } from "../types/index";

const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
export const analyticsStatuses: ShipmentStatus[] = [
  "pending",
  "assigned",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "failed",
  "cancelled",
];
const statuses = z.enum([
  "pending",
  "assigned",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "failed",
  "cancelled",
]);
const contract = z
  .object({
    totalShipments: count,
    totalRevenueKobo: count,
    statusBreakdown: z.record(statuses, count),
    recentShipments: z
      .array(
        z
          .object({
            id: z.string(),
            trackingId: z.string(),
            status: statuses,
            description: z.string(),
            priceKobo: count,
            isPaid: z.boolean(),
            createdAt: z.string().datetime({ offset: true }),
            pickupAddress: z.object({ city: z.string() }).passthrough(),
            deliveryAddress: z.object({ city: z.string() }).passthrough(),
          })
          .passthrough(),
      )
      .max(10),
  })
  .passthrough()
  .superRefine((value, context) => {
    if (
      Object.values(value.statusBreakdown).reduce((sum, n) => sum + n, 0) !== value.totalShipments
    )
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Status totals do not match shipment total",
      });
    if (value.recentShipments.length > value.totalShipments)
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recent records exceed shipment total",
      });
  });

/** Validate without dropping the other shipment fields used by existing consumers. */
export function validateBusinessAnalytics<T>(value: T): T {
  contract.parse(value);
  return value;
}
export function analyticsSummary(data: {
  totalShipments: number;
  statusBreakdown: Partial<Record<ShipmentStatus, number>>;
}) {
  const get = (status: ShipmentStatus) => data.statusBreakdown[status] ?? 0;
  return {
    pending: get("pending"),
    active: get("assigned") + get("picked_up") + get("in_transit") + get("out_for_delivery"),
    delivered: get("delivered"),
    failed: get("failed"),
    cancelled: get("cancelled"),
    deliveredShare: data.totalShipments > 0 ? (get("delivered") / data.totalShipments) * 100 : null,
  };
}
export function analyticsPercent(count: number, total: number) {
  return total > 0 ? (count / total) * 100 : null;
}

/** Format aggregate kobo without rounding cents near the safe-integer ceiling. */
export function analyticsMoney(kobo: number) {
  const value = BigInt(kobo),
    unit = BigInt(100);
  return `₦${(value / unit).toLocaleString("en-NG")}.${String(value % unit).padStart(2, "0")}`;
}
