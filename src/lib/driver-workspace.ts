import { z } from "zod";
import type { WorkspaceShipment } from "./shipment-workspace";

export function driverWorkSummary(shipments: WorkspaceShipment[]) {
  return {
    moving: shipments.filter((shipment) =>
      ["assigned", "picked_up", "in_transit", "out_for_delivery"].includes(shipment.status),
    ),
    held: shipments.filter(
      (shipment) =>
        shipment.status === "failed" &&
        !!shipment.actualPickup &&
        shipment.returnState !== "received",
    ),
    delivered: shipments.filter((shipment) => shipment.status === "delivered"),
    returned: shipments.filter((shipment) => shipment.returnState === "received"),
  };
}
export function driverDate(value?: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return "Not recorded";
  return new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
}
export const driverProfileInput = z.object({
  name: z.string().trim().min(2, "Enter at least two characters for your name.").max(100),
  phone: z
    .string()
    .trim()
    .regex(
      /^(\+?[1-9]\d{6,14})?$/,
      "Use a phone number with 7-15 digits, optionally starting with +.",
    ),
  emergencyContact: z
    .string()
    .trim()
    .max(20, "Emergency contact must be no longer than 20 characters."),
});
export const driverVehicleInput = z.object({
  vehicleType: z.enum(["bike", "car", "van", "truck"]),
  vehiclePlate: z.string().trim().min(3, "Enter at least three characters for your plate.").max(20),
  vehicleModel: z.string().trim().max(60),
  vehicleColor: z.string().trim().max(30),
  vehicleYear: z.string().trim().max(4, "Vehicle year must be no longer than four characters."),
  vehicleInsurance: z.string().trim().max(60),
});
