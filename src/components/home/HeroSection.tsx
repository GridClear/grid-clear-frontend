"use client";

/** Full-viewport hero — looping background video + headline. */

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { hero } from "@/content/home";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#050506]">
      <div className="absolute inset-0">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-content flex-1 flex-col justify-between border-l border-r border-white/10 px-6 pb-12 pt-[7.5rem] md:px-10 md:pt-36">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-white/55 sm:text-[11px]">
            <span className="h-1.5 w-1.5 bg-gc-accent" aria-hidden />
            Autonomous Scene Clearance
          </div>

          <h1 className="text-balance font-heading text-5xl font-bold leading-[0.92] tracking-[-0.04em] text-white [text-shadow:0_2px_44px_rgba(0,0,0,0.55)] sm:text-6xl md:text-7xl lg:text-[92px]">
            {hero.headline.map((line, i) => (
              <span
                key={line}
                className={`block ${i === 0 ? "text-white/95" : ""} ${i === 1 ? "text-gc-accent" : ""}`}
              >
                {line}
              </span>
            ))}
          </h1>

          <p className="mt-7 max-w-xl text-balance text-base leading-relaxed text-white/70 [text-shadow:0_1px_20px_rgba(0,0,0,0.6)] md:text-lg">
            Autonomous capture and 3D reconstruction that hand incident commanders a
            signable plan to reopen roads.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 border border-white bg-white px-6 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-black transition-colors duration-200 hover:bg-white/90"
            >
              Enter Command Center
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </Link>
            <a
              href="#mission"
              className="border-b border-transparent py-1 font-mono text-[11px] uppercase tracking-widest text-white/70 transition-colors duration-200 hover:border-gc-accent hover:text-white"
            >
              Request a Demo
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center pt-16">
          <ChevronDown size={18} className="animate-bounce text-white/40" aria-hidden />
          <p className="mt-2 font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase">
            [ {hero.scrollLabel} ]
          </p>
        </div>
      </div>
    </section>
  );
}
