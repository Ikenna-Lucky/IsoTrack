import { z } from "zod";
import type { WorkspaceShipment } from "./shipment-workspace";
import type { ShipmentStatus, User, VehicleType } from "../types/index";
export const customerProfileInput = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?[1-9]\d{6,14})?$/, "Use 7-15 digits, optionally starting with +."),
});
export function customerShipmentCounts(records: { status: ShipmentStatus; isPaid: boolean }[]) {
  return {
    active: records.filter((item) =>
      ["assigned", "picked_up", "in_transit", "out_for_delivery"].includes(item.status),
    ).length,
    delivered: records.filter((item) => item.status === "delivered").length,
    unpaid: records.filter((item) => !item.isPaid).length,
  };
}

export type CustomerShipmentRecord = Omit<WorkspaceShipment, "recipientEmail" | "driver"> & {
  driver: {
    id: string;
    vehicleType: VehicleType;
    vehiclePlate: string;
    user: Pick<User, "id" | "name" | "email" | "phone" | "avatar">;
  } | null;
};
