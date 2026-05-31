import type { RawKSIRecord, CollisionsResponse } from '@/types/collision';

const BASE = 'https://ckan0.cf.opendata.inter.prod-toronto.ca';
const DATASTORE_RESOURCE_ID = '9c9a9b60-95c1-4541-ad44-15c4a643aff9';
const GEOJSON_RESOURCE_ID = 'f8faf384-a96d-4dff-af59-db40f777c7d3';

// Only the fields we actually render — keeps each batch response small.
const FETCH_FIELDS =
  'collision_id,accdate,stname1,stname2,latitude,longitude,acclass,injury,road_user,rdsfcond,light,impactype,fatal_no,neighbourhood,wardname';

const BATCH_SIZE = 1000;

type FetchResult = Pick<CollisionsResponse, 'source' | 'totalRawRecords'> & {
  records: RawKSIRecord[];
};

async function fetchBatch(offset: number): Promise<RawKSIRecord[]> {
  const url =
    `${BASE}/api/3/action/datastore_search` +
    `?id=${DATASTORE_RESOURCE_ID}&limit=${BATCH_SIZE}&offset=${offset}&fields=${FETCH_FIELDS}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CKAN batch offset=${offset} → HTTP ${res.status}`);
  const json = await res.json();
  return json.result.records as RawKSIRecord[];
}

// Primary: parallel-batched datastore_search with field projection (~21 requests, ~4 MB total).
async function fetchPaginated(): Promise<FetchResult> {
  const countRes = await fetch(
    `${BASE}/api/3/action/datastore_search?id=${DATASTORE_RESOURCE_ID}&limit=0`,
  );
  if (!countRes.ok) throw new Error(`CKAN count → HTTP ${countRes.status}`);
  const total: number = (await countRes.json()).result.total;

  const offsets = Array.from({ length: Math.ceil(total / BATCH_SIZE) }, (_, i) => i * BATCH_SIZE);
  const batches = await Promise.all(offsets.map(fetchBatch));
  const records = batches.flat();

  return { records, source: 'ckan-paginated', totalRawRecords: records.length };
}

// Fallback 1: full columnar dump — one request but all 50 fields.
async function fetchFromDump(): Promise<FetchResult> {
  const url = `${BASE}/datastore/dump/${DATASTORE_RESOURCE_ID}?format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CKAN dump → HTTP ${res.status}`);

  const data: { fields: { id: string }[]; records: unknown[][] } = await res.json();
  const fieldNames = data.fields.map(f => f.id);

  const records: RawKSIRecord[] = data.records.map(row => {
    const obj: Record<string, unknown> = {};
    fieldNames.forEach((name, i) => { obj[name] = row[i]; });
    return obj as unknown as RawKSIRecord;
  });

  return { records, source: 'ckan-dump', totalRawRecords: records.length };
}

// Fallback 2: direct GeoJSON file download (~27 MB).
async function fetchFromGeoJSON(): Promise<FetchResult> {
  const metaRes = await fetch(`${BASE}/api/3/action/resource_show?id=${GEOJSON_RESOURCE_ID}`);
  if (!metaRes.ok) throw new Error(`GeoJSON resource_show → HTTP ${metaRes.status}`);
  const downloadUrl: string = (await metaRes.json()).result.url;

  const res = await fetch(downloadUrl);
  if (!res.ok) throw new Error(`GeoJSON download → HTTP ${res.status}`);
  const geojson = await res.json();

  // GeoJSON property keys may be uppercase in the shapefile-derived export.
  const records: RawKSIRecord[] = (geojson.features ?? []).map(
    (f: { properties: Record<string, unknown> }) => {
      const p = f.properties;
      return {
        collision_id: p.COLLISION_ID ?? p.collision_id,
        accdate: p.ACCDATE ?? p.accdate,
        stname1: p.STNAME1 ?? p.stname1,
        stname2: p.STNAME2 ?? p.stname2,
        latitude: p.LATITUDE ?? p.latitude,
        longitude: p.LONGITUDE ?? p.longitude,
        acclass: p.ACCLASS ?? p.acclass,
        injury: p.INJURY ?? p.injury,
        road_user: p.ROAD_USER ?? p.road_user,
        rdsfcond: p.RDSFCOND ?? p.rdsfcond,
        light: p.LIGHT ?? p.light,
        impactype: p.IMPACTYPE ?? p.impactype,
        fatal_no: p.FATAL_NO ?? p.fatal_no,
        neighbourhood: p.NEIGHBOURHOOD ?? p.neighbourhood,
        wardname: p.WARDNAME ?? p.wardname,
      } as RawKSIRecord;
    },
  );

  return { records, source: 'ckan-geojson', totalRawRecords: records.length };
}

export async function fetchKSIRecords(): Promise<FetchResult> {
  try {
    return await fetchPaginated();
  } catch (e1) {
    console.warn('[ckan] paginated fetch failed, trying dump:', e1);
    try {
      return await fetchFromDump();
    } catch (e2) {
      console.warn('[ckan] dump failed, trying GeoJSON:', e2);
      return await fetchFromGeoJSON();
    }
  }
}
