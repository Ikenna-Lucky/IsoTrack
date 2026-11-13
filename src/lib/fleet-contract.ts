import { z } from "zod";
import type { Driver, User, Shipment } from "../types/index";

// The collection intentionally returns a smaller user projection than /drivers/me.
export type FleetDriver = Omit<Driver, "user"> & {
  businessId: string;
  user: Pick<User, "id" | "name" | "email" | "phone" | "avatar" | "isActive">;
};
export interface FleetInvitation {
  id: string;
  email: string;
  expiresAt: string;
  createdAt?: string;
  acceptedAt: string | null;
  revokedAt: string | null;
}
export interface CreatedInvitation {
  id: string;
  email: string;
  expiresAt: string;
  token: string;
}
export type FleetShipment = Shipment & {
  returnState?: "none" | "requested" | "in_transit" | "received";
};
export const invitationEmail = z.string().trim().toLowerCase().email().max(254);
export const invitationToken = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_-]{43}$/);
export function invitationState(invitation: FleetInvitation, now: number) {
  if (invitation.acceptedAt) return "Accepted";
  if (invitation.revokedAt) return "Revoked";
  return Date.parse(invitation.expiresAt) <= now ? "Expired" : "Pending";
}
export function driverHasCustody(shipment: FleetShipment) {
  return (
    ["assigned", "picked_up", "in_transit", "out_for_delivery"].includes(shipment.status) ||
    (shipment.status === "failed" && !!shipment.actualPickup && shipment.returnState !== "received")
  );
}
