"use client";
import type { ShipmentAction } from "./use-shipment-workspace";
import { useWorkflowRequest } from "./use-workflow-request";
export function usePendingShipmentAction(slot: string) {
  return useWorkflowRequest<ShipmentAction>("shipment", slot);
}
