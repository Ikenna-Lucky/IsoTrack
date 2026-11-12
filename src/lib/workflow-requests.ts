/** Pending writes are memory-only and belong to the current signed-in account. */
export function createWorkflowRequests() {
  let account: string | null = null;
  let generation = 0;
  const requests = new Map<string, unknown>();
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());
  const key = (id: string, namespace: string) => JSON.stringify([id, namespace]);
  return {
    generation: () => generation,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setAccount(next: string | null) {
      if (next === account) return;
      account = next;
      generation++;
      requests.clear();
      emit();
    },
    get<T>(owner: string | null, id: string, namespace: string): T | null {
      return owner && owner === account
        ? ((requests.get(key(id, namespace)) as T | undefined) ?? null)
        : null;
    },
    set(
      owner: string | null,
      id: string,
      namespace: string,
      value: unknown,
      expectedGeneration = generation,
      expectedRequest?: unknown,
    ) {
      // Ignore a late response from a component belonging to a previous session.
      if (!owner || owner !== account || expectedGeneration !== generation) return false;
      const slot = key(id, namespace);
      const current = requests.get(slot);
      if (value === null) {
        // An old component must not clear a newer action after navigation/retry.
        if (expectedRequest !== undefined && current !== expectedRequest) return false;
        if (!requests.delete(slot)) return true;
      } else {
        if (current === value) return true;
        // Reserve synchronously: disabled buttons alone cannot prevent two panels
        // from starting different actions before React renders the pending state.
        if ([...requests.keys()].some((value) => JSON.parse(value)[0] === id)) return false;
        requests.set(slot, value);
      }
      emit();
      return true;
    },
    pending(owner: string | null, id?: string) {
      if (!owner || owner !== account) return false;
      return id === undefined
        ? requests.size > 0
        : [...requests.keys()].some((value) => JSON.parse(value)[0] === id);
    },
  };
}
