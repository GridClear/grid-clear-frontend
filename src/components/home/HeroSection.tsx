"use client";

/** Full-viewport hero with cinematic background and headline. */

import { ChevronDown } from "lucide-react";
import { hero } from "@/content/home";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#050506]">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 animate-ken-burns bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black/90" />
      </div>

      {/* HUD overlays — Palantir-style data panels */}
      <div className="pointer-events-none absolute right-6 top-1/3 hidden w-64 space-y-3 md:block lg:right-16 lg:w-72">
        <div className="border border-white/10 bg-black/50 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between font-mono text-[9px] tracking-widest text-white/40 uppercase">
            <span>[ METRIC // EVALS ]</span>
            <span className="text-[#10b981] animate-pulse">● LIVE</span>
          </div>
          <div className="mt-3 flex h-14 items-end gap-1">
            {[40, 65, 45, 80, 55, 70, 90, 60].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-white/20 transition-all hover:bg-white/40"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
        <div className="border border-white/10 bg-black/50 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between font-mono text-[9px] tracking-widest text-white/40 uppercase">
            <span>[ INTEL // LIVE_COORD ]</span>
            <span>37.7749° N</span>
          </div>
          <div className="mt-3 h-10 border-b border-white/10 relative">
            <svg viewBox="0 0 200 40" className="h-full w-full">
              <polyline
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1"
                points="0,30 30,25 60,20 90,28 120,15 150,22 180,10 200,18"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Headline */}
      <div className="relative z-10 mx-auto max-w-content px-6 pt-32 text-center md:px-10">
        <h1 className="text-balance text-6xl font-extrabold leading-[0.95] tracking-[-0.04em] text-white md:text-8xl lg:text-[110px] font-heading">
          {hero.headline.map((line) => (
            <span key={line} className="block first:text-white/90">
              {line}
            </span>
          ))}
        </h1>
      </div>

      {/* Scroll indicator */}
      <div className="relative z-10 flex flex-col items-center pb-12 pt-20">
        <ChevronDown size={18} className="animate-bounce text-white/40" />
        <p className="mt-2 font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase">
          [ {hero.scrollLabel} ]
        </p>
      </div>
    </section>
  );
}
