const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const incidentListCache = new Map<string, IncidentReport[]>();
const incidentByIdCache = new Map<string, IncidentReport>();
let healthCache: HealthResponse | null = null;

function listCacheKey(limit: number): string {
  return `limit:${limit}`;
}

export function getCachedIncidents(limit = 5): IncidentReport[] | undefined {
  return incidentListCache.get(listCacheKey(limit));
}

export function getCachedIncident(incidentId: string): IncidentReport | undefined {
  return incidentByIdCache.get(incidentId);
}

function cacheIncidents(reports: IncidentReport[], limit: number): void {
  incidentListCache.set(listCacheKey(limit), reports);
  for (const report of reports) {
    incidentByIdCache.set(report.incident_id, report);
  }
}

function cacheIncident(report: IncidentReport): void {
  incidentByIdCache.set(report.incident_id, report);
}

/** One feed row per camera — keeps the newest snapshot when the API returns repeat detections. */
export function deduplicateIncidentReports(reports: IncidentReport[]): IncidentReport[] {
  const byCamera = new Map<string, IncidentReport>();
  for (const report of reports) {
    const key = report.camera_id || report.intersection;
    const existing = byCamera.get(key);
    if (
      !existing ||
      new Date(report.first_seen_at).getTime() > new Date(existing.first_seen_at).getTime()
    ) {
      byCamera.set(key, report);
    }
  }
  return Array.from(byCamera.values()).sort(
    (a, b) => new Date(b.first_seen_at).getTime() - new Date(a.first_seen_at).getTime()
  );
}

export interface HealthResponse {
  status: string;
  models_reachable: boolean;
  data_loaded: boolean;
  timestamp: string;
}

export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface LanesBlocked {
  direction: string;
  lane_numbers: number[];
  confidence: number;
}

export interface SceneFindings {
  scene_summary: string;
  briefing?: string;
  overall_confidence: number;
  model_used: string;
  processed_at: string;
  lanes_blocked?: LanesBlocked;
}

// ─── Cost Engine ─────────────────────────────────────────────────────────────

export interface ClearanceEconomicsRequest {
  location_lat: number;
  location_lon: number;
  lanes_blocked: LanesBlocked | Record<string, unknown>;
  duration_minutes?: number;
  scene_findings_id?: string;
}

export interface IncidentSummary {
  location: string;
  lat: number;
  lng: number;
  duration_minutes: number;
  lanes_blocked: number;
  total_lanes: number;
  capacity_loss_pct: number;
}

export interface IncidentTotals {
  primary_cad: number;
  detour_cad: number;
  spillback_cad: number;
  total_cad: number;
  low_cad: number;
  high_cad: number;
}

export interface ClearanceEconomics {
  computed_at: string;
  cost_per_minute_cad: number;
  cost_per_hour_cad: number;
  incident: IncidentSummary;
  incident_totals: IncidentTotals;
}

const economicsCache = new Map<string, ClearanceEconomics>();

export function getCachedEconomics(incidentId: string): ClearanceEconomics | undefined {
  return economicsCache.get(incidentId);
}

export async function computeEconomics(
  incidentId: string,
  req: ClearanceEconomicsRequest
): Promise<ClearanceEconomics> {
  const cached = economicsCache.get(incidentId);
  if (cached) return cached;

  const res = await fetch(`${BASE}/economics/compute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Economics compute failed: ${res.status}`);
  }
  const result: ClearanceEconomics = await res.json();
  economicsCache.set(incidentId, result);
  return result;
}

export function buildEconomicsRequest(report: IncidentReport): ClearanceEconomicsRequest {
  const lanesBlocked: LanesBlocked = report.scene_findings?.lanes_blocked ?? {
    direction: "eastbound",
    lane_numbers: [1],
    confidence: 0.5,
  };
  return {
    location_lat: report.location.lat,
    location_lon: report.location.lon,
    lanes_blocked: lanesBlocked,
    duration_minutes: 90,
    scene_findings_id: report.incident_id,
  };
}

export async function enrichReportsWithEconomics(
  reports: IncidentReport[]
): Promise<Map<string, ClearanceEconomics>> {
  const results = await Promise.allSettled(
    reports.map((r) => computeEconomics(r.incident_id, buildEconomicsRequest(r)))
  );
  const map = new Map<string, ClearanceEconomics>();
  results.forEach((outcome, i) => {
    if (outcome.status === "fulfilled") {
      map.set(reports[i].incident_id, outcome.value);
    }
  });
  return map;
}

export interface IncidentReport {
  incident_id: string;
  camera_id: string;
  location: GeoPoint;
  intersection: string;
  first_seen_at: string;
  last_seen_at: string;
  is_ongoing: boolean;
  session_id: string | null;
  severity: string;
  is_accident: boolean;
  confidence: number;
  scene_findings: SceneFindings;
  overlay_path: string | null;
  overlay_url: string | null;
  frame_count: number;
}

export function resolveApiUrl(pathOrUrl: string | null | undefined): string | undefined {
  if (!pathOrUrl) return undefined;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  return `${BASE}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export async function healthCheck(): Promise<HealthResponse> {
  if (healthCache) return healthCache;

  const res = await fetch(`${BASE}/healthz`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }
  const data: HealthResponse = await res.json();
  healthCache = data;
  return data;
}

export async function listIncidents({
  limit = 5,
}: { limit?: number } = {}): Promise<IncidentReport[]> {
  const cached = getCachedIncidents(limit);
  if (cached) return cached;

  // Try the DGX Spark backend first (where real detections live).
  // Fall back to the local incidents store if DGX returns empty or errors.
  try {
    const fetchLimit = Math.max(limit * 10, 50);
    const dgxRes = await fetch(`${BASE}/incidents/dgx/recent?limit=${fetchLimit}`, { cache: "no-store" });
    if (dgxRes.ok) {
      const dgxData: IncidentReport[] = await dgxRes.json();
      if (dgxData.length > 0) {
        dgxData.sort(
          (a, b) => new Date(b.first_seen_at).getTime() - new Date(a.first_seen_at).getTime()
        );
        const result = deduplicateIncidentReports(dgxData).slice(0, limit);
        cacheIncidents(result, limit);
        return result;
      }
    }
  } catch {
    // DGX unreachable — fall through to local store
  }

  const res = await fetch(`${BASE}/incidents?hours=72&limit=${limit}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch incidents: ${res.status}`);
  }
  const data: IncidentReport[] = await res.json();
  data.sort(
    (a, b) => new Date(b.first_seen_at).getTime() - new Date(a.first_seen_at).getTime()
  );
  const result = deduplicateIncidentReports(data).slice(0, limit);
  cacheIncidents(result, limit);
  return result;
}

export async function getIncidentById(incidentId: string): Promise<IncidentReport> {
  const cached = getCachedIncident(incidentId);
  if (cached) return cached;

  // Try local store first
  const res = await fetch(`${BASE}/incidents/${encodeURIComponent(incidentId)}`, { cache: "no-store" });
  if (res.ok) {
    const result: IncidentReport = await res.json();
    cacheIncident(result);
    return result;
  }

  // Local store returned 404/error — search the DGX list instead
  try {
    const dgxRes = await fetch(`${BASE}/incidents/dgx/recent?limit=50`, { cache: "no-store" });
    if (dgxRes.ok) {
      const dgxData: IncidentReport[] = await dgxRes.json();
      const match = dgxData.find((r) => r.incident_id === incidentId);
      if (match) {
        cacheIncident(match);
        return match;
      }
    }
  } catch {
    // DGX unreachable
  }

  throw new Error(`Incident not found: ${incidentId}`);
}
