"use client";

// DO NOT statically import maplibre-gl — use dynamic import inside useEffect.
// Static import crashes Next.js SSR even with "use client".
import { useEffect, useRef, useState, useMemo } from "react";
import { aggregateToSquares, squareCellsToGeoJSON } from "@/lib/geo/squares";
import { CollisionTooltip } from "./CollisionTooltip";
import { LayerControls } from "./LayerControls";
import type { CollisionPoint, CollisionsResponse } from "@/types/collision";
import type { HeatmapCell } from "@/types/heatmap";
import { TORONTO_CENTER } from "@/lib/map/basemap";

// Carto Dark Matter — reliable free CDN, no API key, tested with MapLibre.
const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const TORONTO_ZOOM = 11;



function buildDotsGeoJSON(points: CollisionPoint[]) {
  return {
    type: "FeatureCollection" as const,
    features: points.map(p => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
      properties: {
        id: p.id,
        date: p.date,
        street: p.street,
        worstInjury: p.worstInjury,
        roadUsers: p.roadUsers.join(", ") || "—",
        rdsfcond: p.rdsfcond ?? "—",
        light: p.light ?? "—",
        impactype: p.impactype ?? "—",
        neighbourhood: p.neighbourhood ?? "—",
        isFatal: p.isFatal,
      },
    })),
  };
}

export default function CollisionMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  const [allPoints, setAllPoints] = useState<CollisionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ fetchedAt: string; source: string; total: number } | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [showDots, setShowDots] = useState(true);
  const [showHexes, setShowHexes] = useState(true);
  const [yearRange, setYearRange] = useState<[number, number]>([2006, 2026]);
  const [committedRange, setCommittedRange] = useState<[number, number]>([2006, 2026]);
  const [containerWidth, setContainerWidth] = useState(800);

  const [hovered, setHovered] = useState<{
    type: "dot" | "hex";
    properties: Record<string, unknown>;
    x: number;
    y: number;
  } | null>(null);

  const showDotsRef = useRef(true);
  useEffect(() => { showDotsRef.current = showDots; }, [showDots]);

  // Debounce year slider → only update map after 400ms of no drag activity.
  useEffect(() => {
    const id = setTimeout(() => setCommittedRange(yearRange), 400);
    return () => clearTimeout(id);
  }, [yearRange]);

  const filteredPoints = useMemo(
    () => allPoints.filter(p => {
      const y = parseInt(p.date.slice(0, 4), 10);
      return y >= committedRange[0] && y <= committedRange[1];
    }),
    [allPoints, committedRange],
  );

  // ── Step 1: Create the map once on mount. Do NOT wait for collision data. ──
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        // Dynamic import — avoids SSR crash even with "use client".
        const maplibregl = (await import("maplibre-gl")).default;
        if (cancelled || !containerRef.current) return;

        const map = new maplibregl.Map({
          container: containerRef.current,
          style: MAP_STYLE,
          center: TORONTO_CENTER,
          zoom: TORONTO_ZOOM,
          attributionControl: false,
        });

        map.addControl(
          new maplibregl.NavigationControl({ showCompass: false }),
          "bottom-right",
        );

        map.on("error", (e: { error?: Error }) => {
          console.error("[CollisionMap] map error:", e?.error?.message ?? e);
        });

        map.on("load", () => {
          if (cancelled) return;

          // Add sources with empty GeoJSON — data arrives via setData() below.
          map.addSource("hex-risk", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
            maxzoom: 10,
            buffer: 64,
          });
          map.addSource("dots", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
            maxzoom: 14,
            buffer: 64,
          });

          // Square grid fill — color and opacity derived from tier string.
          // Do NOT use ["get", "color"] — the source features have no color property.
          map.addLayer({
            id: "hex-risk-fill",
            type: "fill",
            source: "hex-risk",
            paint: {
              "fill-color": [
                "match", ["get", "tier"],
                "critical", "#cc1100",
                "high",     "#ff4500",
                "medium",   "#ff8c00",
                "low",      "#ffb347",
                "#ffb347",
              ],
              "fill-opacity": [
                "match", ["get", "tier"],
                "critical", 0.65,
                "high",     0.50,
                "medium",   0.36,
                "low",      0.22,
                0.22,
              ],
            },
          });

          // Square grid stroke.
          map.addLayer({
            id: "hex-risk-stroke",
            type: "line",
            source: "hex-risk",
            paint: {
              "line-color": [
                "match", ["get", "tier"],
                "critical", "#cc1100",
                "high",     "#ff4500",
                "medium",   "#ff8c00",
                "low",      "#ffb347",
                "#ffb347",
              ],
              "line-width": [
                "match", ["get", "tier"],
                "critical", 1.2, "high", 1.0, "medium", 0.7, "low", 0.5, 0.5,
              ],
              "line-opacity": [
                "match", ["get", "tier"],
                "critical", 0.9, "high", 0.75, "medium", 0.6, "low", 0.45, 0.45,
              ],
            },
          });

          // Individual collision dots.
          map.addLayer({
            id: "dots-circle",
            type: "circle",
            source: "dots",
            paint: {
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 9, 3, 14, 7],
              "circle-color": [
                "match", ["get", "worstInjury"],
                "Fatal",   "#dc2626",
                "Major",   "#f87171",
                "Minor",   "#fb923c",
                "Minimal", "#fbbf24",
                "#94a3b8",
              ],
              "circle-opacity": 0.85,
              "circle-stroke-width": 1,
              "circle-stroke-color": "rgba(0,0,0,0.3)",
            },
          });

          // Hover: dots.
          map.on("mousemove", "dots-circle", (e: { features?: { properties: unknown }[]; point: { x: number; y: number } }) => {
            if (!e.features?.[0]) return;
            map.getCanvas().style.cursor = "pointer";
            setHovered({
              type: "dot",
              properties: e.features[0].properties as Record<string, unknown>,
              x: e.point.x,
              y: e.point.y,
            });
          });
          map.on("mouseleave", "dots-circle", () => {
            map.getCanvas().style.cursor = "";
            setHovered(null);
          });

          // Hover: hexes (only when dot layer is off).
          map.on("mousemove", "hex-risk-fill", (e: { features?: { properties: unknown }[]; point: { x: number; y: number } }) => {
            if (!e.features?.[0] || showDotsRef.current) return;
            map.getCanvas().style.cursor = "pointer";
            setHovered({
              type: "hex",
              properties: e.features[0].properties as Record<string, unknown>,
              x: e.point.x,
              y: e.point.y,
            });
          });
          map.on("mouseleave", "hex-risk-fill", () => {
            if (!showDotsRef.current) {
              map.getCanvas().style.cursor = "";
              setHovered(null);
            }
          });

          mapRef.current = map;
          setMapReady(true);
          map.resize(); // force redraw if parent settled after mount
        });

        // Track container width for tooltip flip.
        const ro = new ResizeObserver(() => {
          setContainerWidth(containerRef.current?.offsetWidth ?? 800);
          mapRef.current?.resize?.();
        });
        if (containerRef.current) ro.observe(containerRef.current);

        return () => ro.disconnect();
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message ?? "map failed to load");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove?.();
      mapRef.current = null;
    };
  }, []);

  // ── Step 2: Load collision data independently of the map. ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/data/toronto-ksi-collisions.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: CollisionsResponse = await res.json();
        if (!cancelled) {
          setAllPoints(data.points);
          setMeta({ fetchedAt: data.fetchedAt, source: data.source, total: data.totalCollisions });
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "data load failed");
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Step 3: Push updated GeoJSON to sources when data or map readiness changes. ──
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    const squareCells = aggregateToSquares(filteredPoints);
    const hexGeo = squareCellsToGeoJSON(squareCells);
    const dotsGeo = buildDotsGeoJSON(filteredPoints);

    map.getSource("hex-risk")?.setData(hexGeo);
    map.getSource("dots")?.setData(dotsGeo);
  }, [filteredPoints, mapReady]);

  // ── Sync layer visibility. ──
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const vis = (on: boolean) => (on ? "visible" : "none");
    mapRef.current.setLayoutProperty("dots-circle",    "visibility", vis(showDots));
    mapRef.current.setLayoutProperty("hex-risk-fill",  "visibility", vis(showHexes));
    mapRef.current.setLayoutProperty("hex-risk-stroke","visibility", vis(showHexes));
  }, [showDots, showHexes, mapReady]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="absolute inset-0 h-full w-full"
        style={{ background: "#08080a" }}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center space-y-3">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">
              Loading collision dataset…
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <p className="font-mono text-sm text-red-400">Failed: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <LayerControls
          showDots={showDots}
          showHexes={showHexes}
          onToggleDots={() => setShowDots(v => !v)}
          onToggleHexes={() => setShowHexes(v => !v)}
          yearRange={yearRange}
          committedRange={committedRange}
          onYearRangeChange={setYearRange}
          totalCollisions={filteredPoints.length}
          meta={meta}
        />
      )}

      {hovered && (
        <CollisionTooltip
          x={hovered.x}
          y={hovered.y}
          type={hovered.type}
          properties={hovered.properties}
          containerWidth={containerWidth}
        />
      )}
    </div>
  );
}
