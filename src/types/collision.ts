export type InjurySeverity = 'Fatal' | 'Major' | 'Minor' | 'Minimal' | 'None' | 'Unknown';

// One row from the CKAN datastore — records are per-person-involved, not per-collision.
export interface RawKSIRecord {
  collision_id: string;
  accdate: string | null;
  stname1: string | null;
  stname2: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  acclass: string | null;
  injury: string | null;
  road_user: string | null;
  rdsfcond: string | null;
  light: string | null;
  impactype: string | null;
  fatal_no: number | null;
  neighbourhood: string | null;
  wardname: string | null;
}

// One deduplicated collision event (one entry per unique collision_id).
export interface CollisionPoint {
  id: string;
  lat: number;
  lng: number;
  date: string;
  street: string;
  acclass: string;
  worstInjury: InjurySeverity;
  roadUsers: string[];
  rdsfcond: string | null;
  light: string | null;
  impactype: string | null;
  isFatal: boolean;
  neighbourhood: string | null;
}

export interface CollisionsResponse {
  points: CollisionPoint[];
  fetchedAt: string;
  source: 'local-bundle' | 'ckan-paginated' | 'ckan-dump' | 'ckan-geojson' | 'arcgis';
  totalRawRecords: number;
  totalCollisions: number;
}
