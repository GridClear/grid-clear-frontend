import { ClearanceEconomics, IncidentReport, resolveApiUrl } from "./api";

export interface Incident {
  id: string;
  intersection: string;
  timestamp: string;
  status: "Scouting" | "Modeling" | "Ready for Review" | "Cleared";
  costPerMinute: number;
  projectedDuration: string;
  x: number;
  y: number;
  description: string;
  cctvImage: string;
  robodogImages: string[];
  /** ISO timestamp from backend — absent on mock/fallback data */
  firstSeenAt?: string;
  /** Full economics payload when computed by the cost engine */
  economics?: ClearanceEconomics;
}

// Toronto bounding box used by the map ("43.6532° N, 79.3832° W")
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

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const COST_BY_SEVERITY: Record<string, number> = {
  KSI: 6100,
  INJURY: 4820,
  PROPERTY: 3250,
};

export function mapIncidentReportToDashboardIncident(
  report: IncidentReport,
  economics?: ClearanceEconomics
): Incident {
  const overlayUrl = resolveApiUrl(report.overlay_url);
  const fallbackImage = "/cctv_king_bloor.png";

  let status: Incident["status"] = "Scouting";
  if (!report.is_ongoing) {
    status = "Cleared";
  } else if (report.session_id) {
    status = "Modeling";
  }

  const description =
    report.scene_findings?.scene_summary ||
    report.scene_findings?.briefing ||
    "Incident detected. Scene analysis in progress.";

  const cctvImage = overlayUrl ?? fallbackImage;
  const robodogImages = overlayUrl ? [overlayUrl] : [fallbackImage];

  return {
    id: report.incident_id,
    intersection: report.intersection,
    timestamp: formatTime(report.first_seen_at),
    status,
    costPerMinute: economics?.cost_per_minute_cad ?? COST_BY_SEVERITY[report.severity] ?? 3250,
    projectedDuration: economics ? `${economics.incident.duration_minutes} min` : "90 min",
    x: lonToX(report.location.lon),
    y: latToY(report.location.lat),
    description,
    cctvImage,
    robodogImages,
    firstSeenAt: report.first_seen_at,
    economics,
  };
}
