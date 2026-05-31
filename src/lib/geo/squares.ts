import type { Feature, FeatureCollection, Polygon } from "geojson";
import type { CollisionPoint } from "@/types/collision";
import type { HeatmapCell } from "@/types/heatmap";

// Cell dimensions that appear visually square in Web Mercator at Toronto's latitude.
// In Mercator a rectangle spans equally on screen when ΔLAT = ΔLNG × cos(lat).
const TORONTO_LAT_RAD = 43.65 * (Math.PI / 180);
const COS_LAT = Math.cos(TORONTO_LAT_RAD);
const CELL_LNG = 800 / (111300 * COS_LAT); // ≈ 0.009934°  (800 m east-west)
const CELL_LAT = CELL_LNG * COS_LAT;       // ≈ 0.007188°  (800 m north-south)

function cellKey(lat: number, lng: number): string {
  return `${Math.floor(lat / CELL_LAT)}:${Math.floor(lng / CELL_LNG)}`;
}

function cellBounds(key: string): [minLng: number, minLat: number, maxLng: number, maxLat: number] {
  const [ri, ci] = key.split(":").map(Number);
  return [ci * CELL_LNG, ri * CELL_LAT, (ci + 1) * CELL_LNG, (ri + 1) * CELL_LAT];
}

export function aggregateToSquares(points: CollisionPoint[]): HeatmapCell[] {
  const counts = new Map<string, number>();
  for (const p of points) {
    const k = cellKey(p.lat, p.lng);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  if (counts.size === 0) return [];

  let maxCount = 0;
  counts.forEach(v => { if (v > maxCount) maxCount = v; });

  const result: HeatmapCell[] = [];
  counts.forEach((count, key) => {
    const score = Math.log1p(count) / Math.log1p(maxCount);
    const [minLng, minLat, maxLng, maxLat] = cellBounds(key);
    const tier: HeatmapCell["tier"] =
      score < 0.25 ? "low" : score < 0.5 ? "medium" : score < 0.75 ? "high" : "critical";
    result.push({
      h3Index: key,
      count,
      score,
      tier,
      centroid: [(minLng + maxLng) / 2, (minLat + maxLat) / 2],
    });
  });
  return result;
}

export function squareCellsToGeoJSON(cells: HeatmapCell[]): FeatureCollection<Polygon> {
  const features: Feature<Polygon>[] = cells.map(cell => {
    const [minLng, minLat, maxLng, maxLat] = cellBounds(cell.h3Index);
    return {
      type: "Feature",
      id: cell.h3Index,
      geometry: {
        type: "Polygon",
        coordinates: [[
          [minLng, minLat],
          [maxLng, minLat],
          [maxLng, maxLat],
          [minLng, maxLat],
          [minLng, minLat],
        ]],
      },
      properties: {
        key:   cell.h3Index,
        count: cell.count,
        score: cell.score,
        tier:  cell.tier,
      },
    };
  });
  return { type: "FeatureCollection", features };
}
