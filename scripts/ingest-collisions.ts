/**
 * One-time (or occasional) fetch from Toronto Open Data → local JSON bundle.
 * Run: npm run data:ingest
 */
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { buildCollisionsResponse } from '../src/lib/toronto-open-data/build-collisions';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'data');
const outFile = join(outDir, 'toronto-ksi-collisions.json');

async function main() {
  console.log('Fetching Toronto KSI data from Open Data (this may take 1–2 minutes)…');
  const data = await buildCollisionsResponse();
  data.source = 'local-bundle';

  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, JSON.stringify(data));

  const mb = (Buffer.byteLength(JSON.stringify(data)) / 1024 / 1024).toFixed(2);
  console.log(`Wrote ${data.totalCollisions.toLocaleString()} collisions (${mb} MB)`);
  console.log(`→ ${outFile}`);
  console.log(`Source: ${data.source} · raw rows: ${data.totalRawRecords.toLocaleString()}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
