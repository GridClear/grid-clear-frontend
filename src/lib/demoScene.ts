import type { ClearanceEconomics } from "./api";
import type { Incident } from "./incidents";

export const DEMO_INCIDENT_ID = "GC-DEMO-001";
// File is too large for git — host on S3/R2/CDN and set the URL here.
// Locally the file can still live at public/demoAssets/ (it is .gitignored).
export const DEMO_PLY_URL =
  process.env.NEXT_PUBLIC_DEMO_PLY_URL ??
  "/demoAssets/866639ec-4ef2-4db9-a273-06c3ff6777a0.ply";

export const DEMO_CCTV_IMAGE = "/demoAssets/IMG_2965.jpg";

export const DEMO_ROBODOG_IMAGES = [
  "/demoAssets/IMG_2966.jpg",
  "/demoAssets/IMG_2967.jpg",
  "/demoAssets/IMG_2968.jpg",
  "/demoAssets/IMG_2969.jpg",
  "/demoAssets/IMG_2970.jpg",
  "/demoAssets/IMG_2971.jpg",
  "/demoAssets/IMG_2972.jpg",
  "/demoAssets/IMG_2973.jpg",
  "/demoAssets/IMG_2974.jpg",
  "/demoAssets/IMG_2975.jpg",
];

// Internally consistent mock economics for Queen St W & Dufferin — 2 of 4 lanes
// blocked eastbound, 90-minute projected closure, Queen streetcar disruption factored in.
export const DEMO_ECONOMICS: ClearanceEconomics = {
  computed_at: "2026-05-31T09:00:00.000Z",
  cost_per_minute_cad: 225,
  cost_per_hour_cad: 13500,
  incident: {
    location: "Queen Street West & Dufferin Street, Toronto, ON",
    lat: 43.6432,
    lng: -79.4318,
    duration_minutes: 90,
    lanes_blocked: 2,
    total_lanes: 4,
    capacity_loss_pct: 52.5,
  },
  incident_totals: {
    primary_cad: 11138,  // ~55% of 20 250
    detour_cad: 6075,    // ~30%
    spillback_cad: 3038, // ~15%
    total_cad: 20250,
    low_cad: 17213,      // -15%
    high_cad: 23288,     // +15%
  },
};

// Toronto bounding box (matches src/lib/incidents.ts)
const GEO_BOUNDS = {
  latMax: 43.855,
  latMin: 43.58,
  lonMin: -79.64,
  lonMax: -79.115,
};

function latToY(lat: number): number {
  const pct = (GEO_BOUNDS.latMax - lat) / (GEO_BOUNDS.latMax - GEO_BOUNDS.latMin);
  return Math.min(Math.max(pct * 100, 5), 95);
}

function lonToX(lon: number): number {
  const pct = (lon - GEO_BOUNDS.lonMin) / (GEO_BOUNDS.lonMax - GEO_BOUNDS.lonMin);
  return Math.min(Math.max(pct * 100, 5), 95);
}

export function getDemoIncident(): Incident {
  return {
    id: DEMO_INCIDENT_ID,
    intersection: "Queen St W & Dufferin St",
    timestamp: "9:00 AM",
    status: "Ready for Review",
    costPerMinute: DEMO_ECONOMICS.cost_per_minute_cad,
    projectedDuration: `${DEMO_ECONOMICS.incident.duration_minutes} min`,
    x: lonToX(-79.4318),
    y: latToY(43.6432),
    description:
      "Two-vehicle collision blocking eastbound lanes at Queen & Dufferin. Robodog unit K9-04 has completed a full perimeter scan and 3D point-cloud reconstruction is fused. Detour routes active on Dufferin and King. Scene ready for commander clearance sign-off.",
    cctvImage: DEMO_CCTV_IMAGE,
    robodogImages: DEMO_ROBODOG_IMAGES,
    firstSeenAt: "2026-05-31T09:00:00.000Z",
    economics: DEMO_ECONOMICS,
  };
}
