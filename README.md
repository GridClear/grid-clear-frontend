# GridClear Frontend

Marketing site and operational console for GridClear — autonomous collision-scene clearance for first responders.
Web UI for **GridClear** — incident command software that helps Toronto first responders reopen roads faster after serious collisions.

Built for the **NVIDIA DGX Spark hackathon** (ASUS GX10). The frontend talks to the Python API on the Spark; vision, cost math, and clearance composition run on the backend and models service, not in this repo.

## What you get

**Landing (`/`)** — Product story: closure cost, robodog forensic capture, scene reconstruction, detour routing, signable clearance plans.

**Mission Control (`/dashboard`)** — Live map of active incidents, backend health, and a running **cost-of-closure** ticker. Incident list is loaded from the API (DGX detections when available; static fallbacks if the API is down).

**Incident workspace (`/dashboard/incidents/[id]`)** — Per-incident board:

- CCTV / scene imagery from backend overlays  
- Robodog capture strip  
- Interactive 3D scene panel (point-cloud viewer; wired for fusion output)  
- Clearance checklist and commander sign-off flow  

## Stack

Next.js 14 · React 18 · TypeScript · Tailwind CSS

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
Open [http://localhost:3000](http://localhost:3000). Command Center: [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

Point the app at your API (default `http://localhost:8000`):

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

On the Spark, use the host/port where `grid-clear-backend` is listening.

```bash
npm run build   # production build
npm run start   # serve build
```

- `src/app/(console)/` — dashboard + collision map (shared `ConsoleShell` nav)
- `src/components/collision-map/` — MapLibre heatmap
- `src/lib/toronto-open-data/` — CKAN fetch + coordinate normalization
- `src/content/` — static copy and demo incidents
If port 3000 is busy: `npm run dev:clean`.

## Repo layout

Next.js 14 · TypeScript · Tailwind CSS · MapLibre GL · h3-js
| Path | Role |
|------|------|
| `src/app/` | Routes: home, dashboard, incident detail |
| `src/content/` | Marketing copy and mock incident fixtures |
| `src/components/home/` | Landing sections |
| `src/components/dashboard/` | Map, 3D viewer, incident widgets |
| `src/lib/api.ts` | Backend client (`/healthz`, `/incidents`, DGX recent) |
| `public/` | Hero video, demo scene images |

## Related repos

- **[grid-clear-backend](https://github.com/GridClear/grid-clear-backend)** — FastAPI pipeline (scene analysis, economics, forensic, clearance, reconstruction)
- **Models service** — Nemotron vision / triage on the DGX (called by the backend)

## License

Private hackathon project — GridClear team.
