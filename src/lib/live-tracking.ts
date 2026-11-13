import { z } from "zod";
export const locationUpdateSchema = z.object({
  trackingId: z.string().min(1).max(64),
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
  timestamp: z.number().int().nonnegative().safe(),
  heading: z.number().finite().min(0).lt(360).optional(),
  speed: z.number().finite().min(0).max(100).optional(),
});
export type LocationUpdate = z.infer<typeof locationUpdateSchema>;
export function acceptedLocation(
  value: unknown,
  trackingId: string,
  previousTimestamp = -1,
  now = Date.now(),
) {
  const result = locationUpdateSchema.safeParse(value);
  if (
    !result.success ||
    result.data.trackingId !== trackingId ||
    result.data.timestamp <= previousTimestamp ||
    result.data.timestamp > now + 5000
  )
    return null;
  return result.data;
}
export function locationIsFresh(timestamp: number, now = Date.now()) {
  return timestamp >= now - 30000 && timestamp <= now + 5000;
}
export function trackingAllowed(status: string, returnState?: string) {
  return (
    ["assigned", "picked_up", "in_transit", "out_for_delivery"].includes(status) ||
    (status === "failed" && returnState === "in_transit")
  );
}
