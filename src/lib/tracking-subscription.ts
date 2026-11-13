import type { Socket } from "socket.io-client";
import { acceptedLocation, type LocationUpdate } from "./live-tracking.ts";

export function subscribeToShipment(
  socket: Socket,
  trackingId: string,
  report: (state: { joined: boolean; location: LocationUpdate | null; error: string }) => void,
) {
  let disposed = false,
    joining = false,
    permitted = false;
  let location: LocationUpdate | null = null;
  function clear(error = "") {
    permitted = false;
    location = null;
    if (!disposed) report({ joined: false, location, error });
  }
  async function join() {
    if (disposed || joining || !socket.connected) return;
    joining = true;
    try {
      const ack = (await socket.timeout(5000).emitWithAck("shipment:join", trackingId)) as {
        ok?: boolean;
      };
      if (disposed) return;
      if (ack?.ok !== true) {
        clear("Live tracking access was rejected. Refresh the shipment to check access.");
        return;
      }
      permitted = true;
      report({ joined: true, location, error: "" });
    } catch {
      clear("Could not confirm tracking access. Retry the connection.");
    } finally {
      joining = false;
    }
  }
  function receive(value: unknown) {
    if (!permitted || disposed) return;
    const next = acceptedLocation(value, trackingId, location?.timestamp);
    if (next) {
      location = next;
      report({ joined: true, location, error: "" });
    }
  }
  const disconnected = () => clear();
  socket.on("connect", join);
  socket.on("disconnect", disconnected);
  socket.on("driver:location", receive);
  void join();
  const timer = setInterval(() => void join(), 15000);
  return {
    recheck: join,
    dispose() {
      disposed = true;
      permitted = false;
      clearInterval(timer);
      socket.off("connect", join);
      socket.off("disconnect", disconnected);
      socket.off("driver:location", receive);
      if (socket.connected) socket.volatile.emit("shipment:leave", trackingId);
    },
  };
}
