import { locationIsFresh, type LocationUpdate } from "./live-tracking.ts";

export async function publishDriverLocation(
  socket: {
    connected: boolean;
    timeout: (ms: number) => { emitWithAck: (event: string, payload: unknown) => Promise<unknown> };
  },
  trackingIds: string[],
  sample: Omit<LocationUpdate, "trackingId">,
  published: Map<string, number>,
  active: () => boolean,
) {
  let accepted = 0;
  let rejected = 0;
  // Bound a cycle to the server's ten-events/second budget; never buffer GPS offline.
  for (const trackingId of trackingIds.slice(0, 10)) {
    if (!active() || !socket.connected || !locationIsFresh(sample.timestamp)) break;
    if ((published.get(trackingId) ?? -1) >= sample.timestamp) continue;
    try {
      const ack = (await socket
        .timeout(5000)
        .emitWithAck("driver:location", { trackingId, ...sample })) as { ok?: boolean };
      if (!active()) break;
      if (ack?.ok === true) {
        published.set(trackingId, sample.timestamp);
        accepted++;
      } else rejected++;
    } catch {
      if (active()) rejected++;
    }
  }
  return { accepted, rejected };
}
