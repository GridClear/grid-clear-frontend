import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gc-dark text-white">
      <header className="border-b border-white/10 px-6 py-4 md:px-10">
        <Link href="/">
          <Logo variant="light" />
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/40">
          <span className="h-1.5 w-1.5 bg-gc-accent" />
          Command Center
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.03em] md:text-5xl">
          Live incidents, scene analysis, and 3D scene reconstruction.
        </h1>
        <p className="mt-6 max-w-lg text-lg text-white/50">
          This is where investigators will view robodog captures, 3D scene reconstructions,
          and real-time incident detections. The landing page is ready; the dashboard is next.
        </p>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-gc-accent">
          [ Dashboard in progress ]
        </p>
        <Link
          href="/"
          className="mt-10 inline-block bg-white px-8 py-3 text-sm font-medium text-black hover:bg-white/90"
        >
          ← Back to homepage
        </Link>
      </main>
    </div>
  );
}
