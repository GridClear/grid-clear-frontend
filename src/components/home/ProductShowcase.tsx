"use client";

/** Scroll-linked pipeline showcase — Scout through Clearance. */

import { useEffect, useRef, useState } from "react";
import { products, productsSection } from "@/content/home";

const PANEL = "flex-1 overflow-hidden p-4 bg-black/80 border border-white/5 h-[260px] flex flex-col font-mono";

function ActiveProductVisual({ id }: { id: string }) {
  if (id === "scout") {
    return (
      <div className={`${PANEL} justify-end text-[10px] space-y-2`}>
        <div className="text-white/30">{"// ROBODOG TELEMETRY // UNIT K9-04"}</div>
        <div className="text-white/60">[00:00:03] DEPLOY ACK ... PERIMETER LOCKED</div>
        <div className="text-white/60">[00:00:11] CAPTURE 0042 FRAMES ... STREAMING</div>
        <div className="text-white/60">[00:00:19] DEPTH PASS ... 360° COVERAGE</div>
        <div className="text-white/80">[00:00:24] FORENSIC TAGS WRITTEN ... OK</div>
        <div className="text-gc-accent animate-pulse">&gt; SCENE PERIMETER SECURED. 98% COVERAGE _</div>
      </div>
    );
  }
  if (id === "lens") {
    return (
      <div className={`${PANEL} justify-between`}>
        <div className="text-white/30 uppercase text-[8px] tracking-wider select-none">{"// SCENE ANALYSIS // DETECTIONS"}</div>
        <div className="relative flex-1 my-3">
          <div className="absolute left-[10%] top-[28%] h-[44%] w-[36%] border border-gc-accent">
            <span className="absolute -top-4 left-0 text-[8px] text-gc-accent">VEHICLE 0.98</span>
          </div>
          <div className="absolute right-[12%] top-[42%] h-[30%] w-[26%] border border-white/40">
            <span className="absolute -top-4 left-0 text-[8px] text-white/50">VEHICLE 0.91</span>
          </div>
          <div className="absolute right-[34%] bottom-[8%] h-[16%] w-[18%] border border-dashed border-white/25">
            <span className="absolute -top-4 left-0 text-[8px] text-white/40">DEBRIS 0.74</span>
          </div>
        </div>
        <div className="text-white/50 text-[8px]">LANES BLOCKED: NB-1, NB-2 // 3 OBJECTS TRACKED</div>
      </div>
    );
  }
  if (id === "reconstruct") {
    return (
      <div className={`${PANEL} justify-between`}>
        <div className="text-white/30 uppercase text-[8px] tracking-wider select-none">{"// 3D RECONSTRUCTION // POINT CLOUD"}</div>
        <div className="relative flex-1 my-2">
          <svg viewBox="0 0 200 120" className="h-full w-full">
            <rect x="82" y="0" width="36" height="120" fill="rgba(255,255,255,0.04)" />
            <rect x="0" y="46" width="200" height="28" fill="rgba(255,255,255,0.04)" />
            <line x1="100" y1="0" x2="100" y2="120" stroke="rgba(255,255,255,0.16)" strokeWidth="0.5" strokeDasharray="4" />
            <line x1="0" y1="60" x2="200" y2="60" stroke="rgba(255,255,255,0.16)" strokeWidth="0.5" strokeDasharray="4" />
            {[
              [70, 50], [88, 44], [110, 52], [120, 66], [96, 72], [78, 64], [132, 58], [64, 56],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="1.1" fill="rgba(255,255,255,0.45)" />
            ))}
            <rect x="86" y="51" width="18" height="10" fill="none" stroke="var(--accent)" strokeWidth="1.2" transform="rotate(20 95 56)" />
          </svg>
        </div>
        <div className="text-white/50 text-[8px]">IMPACT: SIDE // 12,400 PTS // INTERSECTION_0427</div>
      </div>
    );
  }
  if (id === "ledger") {
    return (
      <div className={`${PANEL} justify-between`}>
        <div className="flex items-center justify-between text-[8px] uppercase tracking-wider text-white/30">
          <span>{"// CLOSURE COST // LIVE"}</span>
          <span className="text-gc-accent">● TICKING</span>
        </div>
        <div className="flex h-16 items-end gap-1">
          {[30, 42, 38, 55, 60, 72, 68, 85, 90].map((h, i) => (
            <div
              key={i}
              className={i === 8 ? "flex-1 bg-gc-accent" : "flex-1 bg-white/15"}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div>
          <div className="text-2xl font-bold text-white">
            $4,820<span className="text-sm text-white/40"> / MIN</span>
          </div>
          <div className="text-[8px] text-white/50">6-HR PROJECTED: $1.7M // DETOUR DELAY 11 MIN</div>
        </div>
      </div>
    );
  }
  if (id === "clearance") {
    return (
      <div className={`${PANEL} justify-between text-[10px]`}>
        <div className="text-white/30 uppercase text-[8px] tracking-wider select-none">{"// CLEARANCE PLAN // DRAFT"}</div>
        <div className="my-2 space-y-2">
          {["SCENE ANALYZED", "FORENSICS AGGREGATED", "COST MODELED", "DETOUR ROUTED"].map((step) => (
            <div key={step} className="flex items-center gap-2 text-white/70">
              <span className="text-gc-accent">✓</span>
              <span>{step}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-white/35">
            <span>▢</span>
            <span>COMMANDER SIGNATURE</span>
          </div>
        </div>
        <div className="text-gc-accent animate-pulse">&gt; READY TO REOPEN. AWAITING SIGN-OFF _</div>
      </div>
    );
  }
  return null;
}

export function ProductShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    rowRefs.current.forEach((row, index) => {
      if (!row) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIndex(index);
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
      );
      observer.observe(row);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <section className="bg-white border-b border-black/5 pb-20 md:pb-28">
      <div className="mx-auto max-w-content border-l border-r border-black/10 px-6 pt-24 md:px-10 md:pt-32">
        <p className="font-mono text-[10px] tracking-[0.25em] text-black/50 uppercase mb-4">
          {"// THE CLEARANCE PIPELINE"}
        </p>
        <h2 className="text-4xl font-extrabold tracking-[-0.035em] text-black md:text-5xl lg:text-6xl font-heading">
          {productsSection.heading}
        </h2>
        <p className="mt-4 max-w-3xl text-lg text-gc-muted leading-relaxed">
          {productsSection.subheading}
        </p>
      </div>

      <div className="mx-auto grid max-w-content gap-0 border-l border-r border-black/10 px-6 md:grid-cols-2 md:px-10 lg:grid-cols-[1fr_1fr] mt-16">
        {/* Sticky preview panel — desktop */}
        <div className="sticky top-28 hidden h-[68vh] self-start md:block pr-10">
          <div className="relative h-full w-full overflow-hidden border border-white/5 bg-black">
            {products.map((product, idx) => (
              <div
                key={product.id}
                className={`absolute inset-0 flex h-full flex-col justify-between bg-gradient-to-br ${product.previewGradient} p-8 transition-opacity duration-700 ease-in-out ${
                  activeIndex === idx ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <div>
                  <p className="font-mono text-[9px] tracking-widest text-white/40 uppercase">{"SYSTEM PREVIEW // "}{product.index}</p>
                  <h3 className="mt-4 text-3xl font-extrabold tracking-[-0.03em] text-white font-heading">{product.name}</h3>
                </div>

                {/* Dynamic visual widget */}
                <div className="my-8 flex-1 flex flex-col justify-center">
                  <ActiveProductVisual id={product.id} />
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[9px] tracking-widest text-white/40 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-gc-accent animate-pulse" />
                  <span>{"CONNECTED // SPARK_NODE // SECURE_SESSION"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrolling product rows */}
        <div className="border-l border-black/10">
          {products.map((product, index) => (
            <div
              key={product.id}
              ref={(el) => {
                rowRefs.current[index] = el;
              }}
              className={`relative border-t border-black/5 py-16 md:py-24 pl-8 md:pl-12 transition-all duration-300 ${
                activeIndex === index
                  ? "border-l-2 border-l-gc-accent bg-gc-light/30"
                  : "border-l-2 border-l-transparent hover:bg-gc-light/10"
              }`}
            >
              <span className="pointer-events-none absolute top-4 right-6 select-none font-mono text-[10px] text-black/25">
                {"// STAGE."}{product.index}
              </span>
              <div className="relative space-y-4">
                <span className={`font-mono text-xs transition-colors ${activeIndex === index ? "text-gc-accent" : "text-black/40"}`}>/ {product.name.toUpperCase()}</span>
                <h4 className="text-3xl font-extrabold tracking-[-0.025em] text-black md:text-4xl font-heading">
                  {product.name}
                </h4>
                <p className="max-w-lg text-lg text-gc-muted leading-relaxed font-normal">
                  {product.tagline}
                </p>
              </div>

              {/* Mobile preview */}
              <div
                className={`mt-8 flex h-60 flex-col justify-between bg-gradient-to-br ${product.previewGradient} p-6 border border-white/5 md:hidden`}
              >
                <div>
                  <p className="font-mono text-[8px] tracking-widest text-white/40 uppercase">{"SYSTEM PREVIEW // "}{product.index}</p>
                  <p className="text-xl font-bold text-white font-heading">{product.name}</p>
                </div>
                <ActiveProductVisual id={product.id} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
