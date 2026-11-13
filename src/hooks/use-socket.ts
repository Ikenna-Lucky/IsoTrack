"use client";
import { useEffect, useState } from "react";
import { useTrackingConnection } from "./use-tracking-connection";
import { subscribeToShipment } from "@/lib/tracking-subscription";
import type { LocationUpdate } from "@/lib/live-tracking";
export type { LocationUpdate } from "@/lib/live-tracking";
export function useSocket({ trackingId }: { trackingId: string | null }) {
  const connection = useTrackingConnection(!!trackingId);
  const [state, setState] = useState<{
    joined: boolean;
    location: LocationUpdate | null;
    error: string;
  }>({ joined: false, location: null, error: "" });
  useEffect(() => {
    setState({ joined: false, location: null, error: "" });
    if (!connection.socket || !trackingId) return;
    const subscription = subscribeToShipment(connection.socket, trackingId, setState);
    return subscription.dispose;
  }, [connection.socket, trackingId]);
  return {
    connected: connection.connected && state.joined,
    location: state.location,
    error: state.error || connection.error,
    retry: connection.retry,
  };
}
