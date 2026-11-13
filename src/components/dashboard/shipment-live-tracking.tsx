"use client";
import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/use-socket";
import { locationIsFresh } from "@/lib/live-tracking";
import { workspaceButton } from "./workspace-ui";
import { LiveMap } from "@/components/map/live-map";
export function ShipmentLiveTracking({ trackingId }: { trackingId: string }) {
  const tracking = useSocket({ trackingId });
  const [now, setNow] = useState(Date.now());
  const [mapOpen, setMapOpen] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const location = tracking.location;
  const fresh = !!location && locationIsFresh(location.timestamp, now);
  return (
    <section
      className="space-y-3 border-t border-[var(--landing-border)] pt-5"
      aria-label="Live shipment location"
    >
      <h3 className="font-semibold">Driver location</h3>
      <p role="status" className="text-sm text-[var(--landing-muted)]">
        {!tracking.connected
          ? "Tracking disconnected. No live position is confirmed."
          : !location
            ? "Connected. Waiting for a fresh driver position."
            : fresh
              ? "Receiving driver location updates."
              : "Position is outdated. Waiting for a new GPS sample."}
      </p>
      {tracking.error && (
        <p role="alert" className="text-sm text-[var(--landing-danger)]">
          {tracking.error}
        </p>
      )}
      {!tracking.connected && (
        <button className={workspaceButton} onClick={tracking.retry}>
          Reconnect tracking
        </button>
      )}
      {location && (
        <div className="space-y-3">
          <p className="font-mono text-sm">
            {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
          </p>
          <p className="text-xs text-[var(--landing-muted)]">
            Measured {new Date(location.timestamp).toLocaleString()} /{" "}
            {Math.max(0, Math.floor((now - location.timestamp) / 1000))} seconds ago. This is the
            last reported position, not a predicted route or arrival time.
          </p>
          <button
            className={workspaceButton}
            aria-expanded={mapOpen}
            onClick={() => setMapOpen((v) => !v)}
          >
            {mapOpen ? "Hide map" : "Show position on map"}
          </button>
          <p className="text-xs text-[var(--landing-muted)]">
            Opening the map loads tiles from{" "}
            {process.env.NEXT_PUBLIC_MAPTILER_KEY ? "MapTiler" : "OpenStreetMap"}.
          </p>
          {mapOpen && <LiveMap location={location} />}
        </div>
      )}
    </section>
  );
}
