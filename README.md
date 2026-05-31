# GridClear Frontend

Marketing site and operational console for GridClear — autonomous collision-scene clearance for first responders.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Route | Description |
|-------|-------------|
| `/` | Marketing homepage |
| `/dashboard` | Live incident command center (static demo incidents) |
| `/collision-map` | Toronto KSI collision heatmap (static bundle in `public/data/`) |

**Optional backend** (separate repo `grid-clear-backend`):

```bash
uvicorn app.main:app --reload --port 8000
```

If port 3000 is in use: `kill $(lsof -ti:3000)` then `npm run dev`, or use `npm run dev:clean` after stopping other Next.js processes.

Production build:

```bash
npm run build
npm start
```

## Collision map data

Collision points are **bundled locally** (not fetched live on each page load). To refresh from [Toronto Open Data](https://open.toronto.ca/dataset/ksi-motor-vehicle-collisions/):

```bash
npm run data:ingest
```

This writes `public/data/toronto-ksi-collisions.json` (~6k collisions, normalized). Commit that file so teammates and deploys load instantly. The heatmap filters by year range in the browser only.

- Map: MapLibre GL + OpenStreetMap raster basemap
- Layers: H3 hex heatmap + collision dots

## Structure

- `src/app/(console)/` — dashboard + collision map (shared `ConsoleShell` nav)
- `src/components/collision-map/` — MapLibre heatmap
- `src/lib/toronto-open-data/` — CKAN fetch + coordinate normalization
- `src/content/` — static copy and demo incidents

## Stack

Next.js 14 · TypeScript · Tailwind CSS · MapLibre GL · h3-js
