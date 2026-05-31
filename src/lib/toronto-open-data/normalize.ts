import type { RawKSIRecord, CollisionPoint, InjurySeverity } from '@/types/collision';

/** Greater Toronto Area — filters bad rows and detects swapped lat/lng. */
const TORONTO_LAT = { min: 43.5, max: 43.95 };
const TORONTO_LNG = { min: -79.7, max: -79.0 };

function parseCoordinates(
  latRaw: number | string | null | undefined,
  lngRaw: number | string | null | undefined,
): { lat: number; lng: number } | null {
  let lat = Number(latRaw);
  let lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0 || lng === 0) {
    return null;
  }

  // GeoJSON shapefile exports occasionally store [lng, lat] in latitude/longitude columns.
  if (lat < 0 && lng > 0 && lng >= TORONTO_LAT.min && lng <= TORONTO_LAT.max) {
    [lat, lng] = [lng, lat];
  }

  if (
    lat < TORONTO_LAT.min ||
    lat > TORONTO_LAT.max ||
    lng < TORONTO_LNG.min ||
    lng > TORONTO_LNG.max
  ) {
    return null;
  }

  return { lat, lng };
}

const SEVERITY_RANK: Record<string, number> = {
  Fatal: 5,
  Major: 4,
  Minor: 3,
  Minimal: 2,
  None: 1,
  Unknown: 0,
};

function resolveInjury(raw: string | null | undefined): InjurySeverity {
  if (!raw || raw === 'None') return 'None';
  if (raw in SEVERITY_RANK) return raw as InjurySeverity;
  return 'Unknown';
}

function worstInjury(group: RawKSIRecord[]): InjurySeverity {
  let best: InjurySeverity = 'Unknown';
  let bestRank = -1;
  for (const r of group) {
    const sev = resolveInjury(r.injury);
    const rank = SEVERITY_RANK[sev] ?? 0;
    if (rank > bestRank) { best = sev; bestRank = rank; }
  }
  return best;
}

// Converts 20,519 per-person rows into ~6,400 per-collision CollisionPoints.
// Records sharing a collision_id are grouped; we keep the worst injury and
// collect the distinct set of road-user types.
export function normalizeRecords(records: RawKSIRecord[]): CollisionPoint[] {
  const grouped = new Map<string, RawKSIRecord[]>();

  for (const r of records) {
    if (!r.collision_id) continue;
    const coords = parseCoordinates(r.latitude, r.longitude);
    if (!coords) continue;

    const arr = grouped.get(r.collision_id) ?? [];
    arr.push(r);
    grouped.set(r.collision_id, arr);
  }

  const points: CollisionPoint[] = [];

  grouped.forEach((group, id) => {
    const first = group[0];
    const coords = parseCoordinates(first.latitude, first.longitude);
    if (!coords) return;
    const { lat, lng } = coords;

    const seen = new Set<string>();
    const roadUsers: string[] = [];
    group.forEach((r: RawKSIRecord) => {
      const u = r.road_user;
      if (u && !seen.has(u)) { seen.add(u); roadUsers.push(u); }
    });

    points.push({
      id,
      lat,
      lng,
      date: (first.accdate ?? '').split('T')[0],
      street:
        [first.stname1, first.stname2].filter(Boolean).join(' & ') || 'Unknown location',
      acclass: first.acclass ?? 'Unknown',
      worstInjury: worstInjury(group),
      roadUsers,
      rdsfcond: first.rdsfcond ?? null,
      light: first.light ?? null,
      impactype: first.impactype ?? null,
      isFatal: first.acclass === 'Fatal Injury',
      neighbourhood: first.neighbourhood ?? null,
    });
  });

  return points;
}
