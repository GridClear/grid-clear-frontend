# GridClear Frontend

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

If port 3000 is busy: `npm run dev:clean`.

## Repo layout

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
