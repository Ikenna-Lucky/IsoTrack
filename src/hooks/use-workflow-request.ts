"use client";
import { useSyncExternalStore } from "react";
import { useAuthStore } from "@/store/auth";
import { createWorkflowRequests } from "@/lib/workflow-requests";

const requests = createWorkflowRequests();
requests.setAccount(useAuthStore.getState().user?.id ?? null);
useAuthStore.subscribe((state) => requests.setAccount(state.user?.id ?? null));
if (typeof window !== "undefined")
  window.addEventListener("beforeunload", (event) => {
    if (requests.pending(useAuthStore.getState().user?.id ?? null)) {
      event.preventDefault();
      event.returnValue = "";
    }
  });
export function useWorkflowRequest<T>(namespace: string, id: string) {
  const accountId = useAuthStore((state) => state.user?.id ?? null);
  const generation = requests.generation();
  const value = useSyncExternalStore(
    requests.subscribe,
    () => requests.get<T>(accountId, id, namespace),
    () => null,
  );
  return [
    value,
    (next: T | null, expectedRequest?: T) =>
      requests.set(accountId, id, namespace, next, generation, expectedRequest),
  ] as const;
}
export function useWorkflowPending(id: string) {
  const accountId = useAuthStore((state) => state.user?.id ?? null);
  return useSyncExternalStore(
    requests.subscribe,
    () => requests.pending(accountId, id),
    () => false,
  );
}
