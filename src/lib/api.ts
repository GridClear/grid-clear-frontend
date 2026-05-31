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

export interface SceneFindings {
  scene_summary: string;
  briefing?: string;
  overall_confidence: number;
  model_used: string;
  processed_at: string;
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
    const dgxRes = await fetch(`${BASE}/incidents/dgx/recent?limit=${limit}`, { cache: "no-store" });
    if (dgxRes.ok) {
      const dgxData: IncidentReport[] = await dgxRes.json();
      if (dgxData.length > 0) {
        // DGX may ignore the limit param — sort newest first and enforce it here
        dgxData.sort(
          (a, b) => new Date(b.first_seen_at).getTime() - new Date(a.first_seen_at).getTime()
        );
        const result = dgxData.slice(0, limit);
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
  const result: IncidentReport[] = await res.json();
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
