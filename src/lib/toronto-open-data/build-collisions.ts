import { fetchKSIRecords } from '@/lib/toronto-open-data/ckan';
import { normalizeRecords } from '@/lib/toronto-open-data/normalize';
import type { CollisionsResponse } from '@/types/collision';

export async function buildCollisionsResponse(): Promise<CollisionsResponse> {
  const { records, source, totalRawRecords } = await fetchKSIRecords();
  const points = normalizeRecords(records);

  return {
    points,
    fetchedAt: new Date().toISOString(),
    source,
    totalRawRecords,
    totalCollisions: points.length,
  };
}
