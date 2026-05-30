"use client";

/** Featured topic carousel with arrow navigation. */

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { topics } from "@/content/home";
import { TopicStrip } from "./TopicStrip";

const topicImages: Record<string, string> = {
  "cost-of-closure": "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=1400&q=80",
  "robodog": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1400&q=80",
  "reconstruction": "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=1400&q=80",
  "cost-curve": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=80",
  "clearance-plan": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=80",
  "detours": "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1400&q=80",
  "fusion": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1400&q=80",
  "grid-back": "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=1400&q=80"
};

export function FeaturedCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = topics[activeIndex];

  const goTo = (id: string) => {
    const idx = topics.findIndex((t) => t.id === id);
    if (idx >= 0) setActiveIndex(idx);
  };

  const prev = () => setActiveIndex((i) => (i === 0 ? topics.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === topics.length - 1 ? 0 : i + 1));

  return (
    <section className="bg-white border-b border-black/5">
      <TopicStrip activeId={active.id} onSelect={goTo} />

      <div className="mx-auto max-w-content border-l border-r border-black/10 px-6 py-12 md:px-10 md:py-16">
        <div className="mb-6 flex items-center justify-between">
          <a
            href="#"
            className="font-mono text-[11px] font-bold tracking-widest uppercase text-gc-muted border-b border-transparent hover:border-gc-accent hover:text-gc-accent transition-colors"
          >
            [ SEE ALL ARCHIVES ]
          </a>
          <div className="flex gap-1.5 font-mono">
            <button
              type="button"
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center border border-black/10 text-black hover:bg-black/5 transition-colors"
              aria-label="Previous topic"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={next}
              className="flex h-10 w-10 items-center justify-center border border-black/10 text-black hover:bg-black/5 transition-colors"
              aria-label="Next topic"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-black border border-black/10 min-h-[340px] md:min-h-[440px]">
          {topics.map((topic, idx) => (
            <div
              key={topic.id}
              className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out group-hover:scale-105 ${
                activeIndex === idx ? "opacity-45 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
              style={{
                backgroundImage:
                  "url('" + (topicImages[topic.id] || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1400&q=80") + "')",
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/20 z-20" />

          <div className="relative flex min-h-[340px] flex-col justify-end p-8 md:min-h-[440px] md:p-12 border-l border-white/5 z-30">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-gc-accent" />
              <p className="font-mono text-[10px] tracking-widest text-white/50 uppercase">
                FEATURED REPORT // {active.label}
              </p>
            </div>
            <h3 className="mt-4 max-w-3xl text-3xl font-extrabold leading-[1.05] text-white md:text-5xl tracking-[-0.035em] font-heading">
              {active.title}
            </h3>
            <div className="mt-8 flex gap-1.5 font-mono text-xs opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <button
                type="button"
                onClick={prev}
                className="flex h-10 w-10 items-center justify-center border border-white/20 text-white hover:bg-white/10"
                aria-label="Previous"
              >
                ←
              </button>
              <button
                type="button"
                onClick={next}
                className="flex h-10 w-10 items-center justify-center border border-white/20 text-white hover:bg-white/10"
                aria-label="Next"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
