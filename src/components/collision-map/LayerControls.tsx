"use client";

import { useRef } from "react";

interface LayerControlsProps {
  showDots: boolean;
  showHexes: boolean;
  onToggleDots: () => void;
  onToggleHexes: () => void;
  yearRange: [number, number];
  committedRange: [number, number];
  onYearRangeChange: (range: [number, number]) => void;
  totalCollisions: number;
  meta: { fetchedAt: string; source: string; total: number } | null;
}

const MIN_YEAR = 2006;
const MAX_YEAR = 2026;

// ── Dual-handle range slider ──────────────────────────────────────────────────
// Single track, two thumbs. Pointer capture keeps dragging smooth even when
// the cursor leaves the handle. Values float above each thumb.
function DualRangeSlider({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [lo, hi] = value;
  const span = max - min;
  const loPct = ((lo - min) / span) * 100;
  const hiPct = ((hi - min) / span) * 100;

  const yearAt = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(min + ratio * span);
  };

  // Each handle owns its pointer via setPointerCapture so drags stay smooth
  // even when the cursor leaves the element.
  const handleProps = (which: "lo" | "hi") => ({
    onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
      const year = yearAt(e.clientX);
      if (year === null) return;
      if (which === "lo") onChange([Math.min(year, hi - 1), hi]);
      else onChange([lo, Math.max(year, lo + 1)]);
    },
    onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    },
  });

  return (
    // Extra vertical padding gives the floating labels room above the track
    // and the scale labels room below, without overlap.
    <div className="relative pt-6 pb-5 select-none">
      {/* ── Track ── */}
      <div ref={trackRef} className="relative h-px bg-white/15 overflow-visible">
        {/* Active fill between the two handles */}
        <div
          className="absolute top-0 h-full bg-gc-accent"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />

        {/* ── Start handle ── */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5
                     flex items-center justify-center
                     cursor-grab active:cursor-grabbing z-10"
          style={{ left: `${loPct}%` }}
          {...handleProps("lo")}
        >
          {/* Visible dot */}
          <div className="w-2.5 h-2.5 rounded-full bg-gc-accent ring-2 ring-gc-accent/25 pointer-events-none" />
          {/* Floating year label */}
          <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2
                          text-[9px] font-mono text-white pointer-events-none whitespace-nowrap">
            {lo}
          </div>
          {/* "FROM" chip — appears on the left handle only */}
          <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2
                          text-[7px] font-mono text-white/35 pointer-events-none whitespace-nowrap uppercase tracking-wider">
            from
          </div>
        </div>

        {/* ── End handle ── */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5
                     flex items-center justify-center
                     cursor-grab active:cursor-grabbing z-10"
          style={{ left: `${hiPct}%` }}
          {...handleProps("hi")}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-gc-accent ring-2 ring-gc-accent/25 pointer-events-none" />
          <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2
                          text-[9px] font-mono text-white pointer-events-none whitespace-nowrap">
            {hi}
          </div>
          <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2
                          text-[7px] font-mono text-white/35 pointer-events-none whitespace-nowrap uppercase tracking-wider">
            to
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Toggle button ─────────────────────────────────────────────────────────────
function ToggleButton({
  active, label, dot, onClick,
}: {
  active: boolean; label: string; dot: string; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 border text-[8px] font-mono
                  uppercase tracking-widest transition-colors ${
        active
          ? "border-white/30 bg-white/10 text-white"
          : "border-white/10 bg-transparent text-white/30 hover:text-white/50"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${active ? dot : "bg-white/20"}`} />
      {label}
    </button>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────
export function LayerControls({
  showDots,
  showHexes,
  onToggleDots,
  onToggleHexes,
  yearRange,
  committedRange,
  onYearRangeChange,
  totalCollisions,
  meta,
}: LayerControlsProps) {
  const pending =
    yearRange[0] !== committedRange[0] || yearRange[1] !== committedRange[1];

  return (
    <div className="absolute top-3 left-3 z-30 flex flex-col gap-2 pointer-events-none select-none">

      {/* Layer toggles */}
      <div className="bg-[#0a0a0c]/90 border border-white/10 p-3 space-y-2.5 pointer-events-auto">
        <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest mb-2">
          {"// LAYERS"}
        </p>
        <div className="flex gap-2">
          <ToggleButton active={showDots}  label="Collisions" dot="bg-red-500"    onClick={onToggleDots}  />
          <ToggleButton active={showHexes} label="Heatmap"    dot="bg-orange-500" onClick={onToggleHexes} />
        </div>

        {showDots && (
          <div className="space-y-1 pt-1 border-t border-white/5">
            {([
              ["Fatal",   "bg-red-600"],
              ["Major",   "bg-red-400"],
              ["Minor",   "bg-orange-400"],
              ["Minimal", "bg-yellow-400"],
            ] as const).map(([label, color]) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${color}`} />
                <span className="text-[8px] font-mono text-white/50 uppercase tracking-widest">
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Year range */}
      <div className="bg-[#0a0a0c]/90 border border-white/10 px-3 pt-3 pb-1 pointer-events-auto w-[200px]">
        <div className="flex items-center justify-between">
          <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest">
            {"// YEAR RANGE"}
          </p>
          {pending && (
            <span className="text-[7px] font-mono text-white/30 animate-pulse">
              updating…
            </span>
          )}
        </div>

        <DualRangeSlider
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={yearRange}
          onChange={onYearRangeChange}
        />
      </div>

      {/* Stats */}
      <div className="bg-[#0a0a0c]/90 border border-white/10 p-3 pointer-events-none">
        <div className="text-[8px] font-mono text-white/30 uppercase tracking-widest mb-1">
          {"// KSI COLLISIONS"}
        </div>
        <div className="text-xl font-bold font-mono text-white tabular-nums">
          {totalCollisions.toLocaleString()}
        </div>
        {meta && (
          <div className="mt-1 space-y-0.5">
            <div className="text-[7px] font-mono text-white/25 uppercase tracking-widest">
              Source: {meta.source}
            </div>
            <div className="text-[7px] font-mono text-white/25 uppercase tracking-widest">
              Updated: {new Date(meta.fetchedAt).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
