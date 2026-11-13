"use client";
import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";
import type { LocationUpdate } from "@/lib/live-tracking";
export function LiveMap({
  location,
  className = "",
}: {
  location: LocationUpdate;
  className?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const marker = useRef<MapLibreMarker | null>(null);
  const latest = useRef(location);
  const [error, setError] = useState("");
  useEffect(() => {
    latest.current = location;
    marker.current?.setLngLat([location.lng, location.lat]);
    map.current?.jumpTo({ center: [location.lng, location.lat] });
  }, [location]);
  useEffect(() => {
    let disposed = false;
    let ownedMap: MapLibreMap | null = null;
    async function initialize() {
      try {
        const maplibre = (await import("maplibre-gl")).default;
        // @ts-expect-error CSS is bundled by Next.
        await import("maplibre-gl/dist/maplibre-gl.css");
        if (disposed || !container.current) return;
        const center: [number, number] = [latest.current.lng, latest.current.lat];
        const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
        ownedMap = new maplibre.Map({
          container: container.current,
          center,
          zoom: 14,
          style: key
            ? "https://api.maptiler.com/maps/streets-v2/style.json?key=" + encodeURIComponent(key)
            : {
                version: 8,
                sources: {
                  osm: {
                    type: "raster",
                    tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                    tileSize: 256,
                    attribution: "© OpenStreetMap contributors",
                  },
                },
                layers: [{ id: "osm", type: "raster", source: "osm" }],
              },
        });
        map.current = ownedMap;
        marker.current = new maplibre.Marker({ color: "#0d9488" })
          .setLngLat(center)
          .addTo(ownedMap);
        ownedMap.on("error", () => {
          if (!disposed)
            setError(
              "Map tiles could not be loaded. The recorded coordinates remain available above.",
            );
        });
        ownedMap.addControl(new maplibre.NavigationControl(), "top-right");
      } catch {
        if (!disposed)
          setError("Map unavailable. The recorded coordinates remain available above.");
      }
    }
    void initialize();
    return () => {
      disposed = true;
      marker.current?.remove();
      ownedMap?.remove();
      marker.current = null;
      map.current = null;
    };
  }, []);
  return (
    <div className={className}>
      {error && (
        <p role="status" className="mb-3 text-sm text-[var(--landing-warning)]">
          {error}
        </p>
      )}
      <div
        ref={container}
        aria-label="Last reported driver position"
        className="h-80 w-full overflow-hidden rounded-lg"
      />
    </div>
  );
}
