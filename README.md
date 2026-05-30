# GridClear Frontend

Marketing landing page modeled after [palantir.com](https://www.palantir.com/) — GridClear branding, same layout and visual language. The `/dashboard` route is a placeholder for the incident command center (built next).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). **Get Started** and **Enter Command Center →** link to `/dashboard`.

If the page looks unstyled or returns an error, another app may be stuck on port 3000. Stop other `next dev` processes, then run `npm run dev:clean`.

## Hero video

Hero background: `public/hero.mp4` (scene capture loop). Optional poster: `public/hero-poster.jpg`. To swap the clip, replace `public/hero.mp4` and hard-refresh the browser.

## Structure

- `src/content/home.ts` — all copy and links (edit here to rebrand)
- `src/components/home/` — landing page sections
- `src/components/layout/` — header, footer, nav overlay
- `src/app/dashboard/` — command center stub

## Stack

Next.js 14 · TypeScript · Tailwind CSS · Lucide icons
