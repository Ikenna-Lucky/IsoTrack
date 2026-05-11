"use client";

import { useEffect, useRef } from "react";
import type { LocationUpdate } from "@/hooks/use-socket";

interface LiveMapProps {
  location: LocationUpdate | null;
  className?: string;
}

const DEFAULT_CENTER: [number, number] = [3.3792, 6.5244];
const DEFAULT_ZOOM = 13;

export function LiveMap({ location, className = "" }: LiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return;

    let map: {
      remove: () => void;
      easeTo: (opts: { center: [number, number]; zoom: number; duration: number }) => void;
    };
    let marker: {
      setLngLat: (coords: [number, number]) => unknown;
      remove: () => void;
    };

    async function initMap() {
      const maplibregl = (await import("maplibre-gl")).default;
      await import("maplibre-gl/dist/maplibre-gl.css");

      const center: [number, number] = location
        ? [location.lng, location.lat]
        : DEFAULT_CENTER;

      map = new maplibregl.Map({
        container: containerRef.current!,
        style: {
          version: 8,
          sources: {
            "osm-tiles": {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "© OpenStreetMap contributors",
            },
          },
          layers: [{ id: "osm", type: "raster", source: "osm-tiles" }],
          glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
        },
        center,
        zoom: DEFAULT_ZOOM,
        attributionControl: false,
      });

      const el = document.createElement("div");
      el.style.cssText = [
        "width:36px",
        "height:36px",
        "border-radius:50%",
        "background:#8b5cf6",
        "border:3px solid white",
        "box-shadow:0 2px 12px rgba(139,92,246,0.6)",
        "display:flex",
        "align-items:center",
        "justify-content:center",
        "font-size:14px",
        "cursor:pointer",
        "transition:transform 0.3s ease",
      ].join(";");
      el.innerHTML = "🛵";

      marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat(center)
        .addTo(map as Parameters<typeof maplibregl.Marker.prototype.addTo>[0]);

      mapRef.current = map;
      markerRef.current = marker;
      initializedRef.current = true;
    }

    void initMap();

    return () => {
      marker?.remove();
      map?.remove();
      mapRef.current = null;
      markerRef.current = null;
      initializedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!location || !initializedRef.current) return;
    const coords: [number, number] = [location.lng, location.lat];

    const marker = markerRef.current as { setLngLat: (c: [number, number]) => unknown } | null;
    const map = mapRef.current as {
      easeTo: (opts: { center: [number, number]; zoom: number; duration: number }) => void;
    } | null;

    marker?.setLngLat(coords);
    map?.easeTo({ center: coords, zoom: DEFAULT_ZOOM, duration: 800 });
  }, [location]);

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      <div ref={containerRef} className="h-full w-full" />
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
    </div>
  );
}
