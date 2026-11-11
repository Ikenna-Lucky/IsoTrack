import type { ShipmentStatus } from "../types/index";

export const shipmentLabels: Record<ShipmentStatus, string> = {
  pending: "Awaiting assignment",
  assigned: "Assigned",
  picked_up: "Picked up",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  failed: "Unsuccessful",
  cancelled: "Cancelled",
};

/** These totals come from the whole-business aggregate, never a loaded page. */
export function overviewCounts(breakdown: Partial<Record<ShipmentStatus, number>>) {
  return {
    pending: breakdown.pending ?? 0,
    active:
      (breakdown.assigned ?? 0) +
      (breakdown.picked_up ?? 0) +
      (breakdown.in_transit ?? 0) +
      (breakdown.out_for_delivery ?? 0),
    delivered: breakdown.delivered ?? 0,
    failed: breakdown.failed ?? 0,
    cancelled: breakdown.cancelled ?? 0,
  };
}

export interface CursorPage<T> {
  data: T[];
  pagination: { limit: number; hasMore: boolean; nextCursor: string | null };
}

export function nextPageCursor<T>(page: CursorPage<T>) {
  return page.pagination.hasMore ? (page.pagination.nextCursor ?? undefined) : undefined;
}
