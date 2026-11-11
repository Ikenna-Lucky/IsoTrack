"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import type { ShipmentAction } from "./use-shipment-workspace";

// Survives route changes/collapsing a record, scoped to the signed-in account.
// No addresses or emails are written to browser storage.
const pendingActions = new Map<string, ShipmentAction>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", (event) => {
    if (pendingActions.size) {
      event.preventDefault();
      event.returnValue = "";
    }
  });
}
export function usePendingShipmentAction(slot: string) {
  const accountId = useAuthStore((state) => state.user?.id);
  const key = `${accountId}:${slot}`;
  const [value, setValue] = useState<ShipmentAction | null>(() => pendingActions.get(key) ?? null);
  useEffect(() => {
    setValue(pendingActions.get(key) ?? null);
  }, [key]);
  function update(action: ShipmentAction | null) {
    if (action) pendingActions.set(key, action);
    else pendingActions.delete(key);
    setValue(action);
  }
  return [value, update] as const;
}
