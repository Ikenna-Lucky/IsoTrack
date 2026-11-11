"use client";
import { useSyncExternalStore } from "react";
import { useAuthStore } from "@/store/auth";

// Shared, account-scoped memory prevents competing actions across shipment panels.
const requests = new Map<string, unknown>();
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
if (typeof window !== "undefined")
  window.addEventListener("beforeunload", (event) => {
    if (requests.size) {
      event.preventDefault();
      event.returnValue = "";
    }
  });
export function useWorkflowRequest<T>(namespace: string, id: string) {
  const accountId = useAuthStore((state) => state.user?.id);
  const key = `${accountId}:${id}:${namespace}`;
  const value = useSyncExternalStore(
    subscribe,
    () => (requests.get(key) as T | undefined) ?? null,
    () => null,
  );
  function update(next: T | null) {
    if (next === null) requests.delete(key);
    else requests.set(key, next);
    listeners.forEach((listener) => listener());
  }
  return [value, update] as const;
}
export function useWorkflowPending(id: string) {
  const accountId = useAuthStore((state) => state.user?.id);
  const prefix = `${accountId}:${id}:`;
  return useSyncExternalStore(
    subscribe,
    () => [...requests.keys()].some((key) => key.startsWith(prefix)),
    () => false,
  );
}
