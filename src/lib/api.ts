const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface HealthResponse {
  status: string;
  models_reachable: boolean;
  data_loaded: boolean;
  timestamp: string;
}

export async function healthCheck(): Promise<HealthResponse> {
  const res = await fetch(`${BASE}/healthz`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }
  return res.json();
}
