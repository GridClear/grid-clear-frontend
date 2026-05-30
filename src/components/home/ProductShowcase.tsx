"use client";

/** Scroll-linked product showcase — AIP through Apollo. */

import { useEffect, useRef, useState } from "react";
import { products, productsSection } from "@/content/home";

function ActiveProductVisual({ id }: { id: string }) {
  if (id === "aip") {
    return (
      <div className="flex-1 font-mono text-[10px] text-[#10b981] space-y-2 overflow-hidden p-4 bg-black/80 border border-white/5 h-[260px] flex flex-col justify-end">
        <div className="text-white/30">{"// SYSTEM LOG: AIP DECISION ENGINE"}</div>
        <div className="text-white/60">[02:18:41] INITIALIZING DECISION MATRIX...</div>
        <div className="text-white/60">[02:18:42] FUSING SATELLITE RADAR ARRAYS... DONE</div>
        <div className="text-white/60">[02:18:44] ANALYZING TELEMETRY... 94% ACCURACY</div>
        <div className="text-white/60">[02:18:45] DETECTED: LOGISTICAL BOTTLENECK</div>
        <div className="text-white/80">[02:18:46] RESOLVING ROUTATION PATHWAYS... OK</div>
        <div className="text-white animate-pulse">&gt; RESOLUTION SECURED. CONFIDENCE: 98.9% _</div>
      </div>
    );
  }
  if (id === "gotham") {
    return (
      <div className="flex-1 overflow-hidden p-4 bg-black/80 border border-white/5 h-[260px] flex items-center justify-center relative">
        <div className="absolute inset-4 border border-white/5 rounded-full animate-[spin_16s_linear_infinite]" />
        <div className="absolute inset-10 border border-white/5 border-dashed rounded-full animate-[spin_8s_linear_infinite]" />
        <div className="absolute h-full w-[1px] bg-white/5 left-1/2 top-0" />
        <div className="absolute w-full h-[1px] bg-white/5 top-1/2 left-0" />
        <div className="absolute left-[30%] top-[30%] flex flex-col items-center">
          <div className="h-2.5 w-2.5 bg-[#ef4444] rounded-full animate-ping" />
          <div className="h-1.5 w-1.5 bg-[#ef4444] rounded-full absolute" />
          <span className="font-mono text-[8px] text-[#ef4444] tracking-wider mt-1">[ TARGET_01 // ACTIVE ]</span>
        </div>
        <div className="absolute right-[25%] bottom-[35%] flex flex-col items-center">
          <div className="h-2.5 w-2.5 bg-[#10b981] rounded-full animate-ping animate-pulse" />
          <div className="h-1.5 w-1.5 bg-[#10b981] rounded-full absolute" />
          <span className="font-mono text-[8px] text-[#10b981] tracking-wider mt-1">[ NODE_ALPHA // ONLINE ]</span>
        </div>
        <div className="absolute top-2 left-2 font-mono text-[8px] text-white/30 uppercase tracking-widest">
          {"RANGE // SCALE 500KM"}
        </div>
      </div>
    );
  }
  if (id === "foundry") {
    return (
      <div className="flex-1 overflow-hidden p-4 bg-black/80 border border-white/5 h-[260px] flex flex-col justify-between font-mono text-[9px] text-white/60">
        <div className="text-white/30 uppercase text-[8px] tracking-wider select-none">{"// PIPELINE DATA FLOW"}</div>
        <div className="grid grid-cols-3 gap-2 h-full py-4 items-center">
          <div className="space-y-2">
            <div className="border border-white/10 p-1.5 text-[8px] text-white/40 bg-white/5 text-center">ERP_DAT</div>
            <div className="border border-white/10 p-1.5 text-[8px] text-white/40 bg-white/5 text-center">IOT_STR</div>
            <div className="border border-white/10 p-1.5 text-[8px] text-white/40 bg-white/5 text-center">S3_RAW</div>
          </div>
          <div className="flex flex-col justify-center items-center h-full relative">
            <div className="w-full h-[1px] bg-white/10 absolute top-1/3" />
            <div className="w-full h-[1px] bg-white/10 absolute top-2/3" />
            <div className="border border-white/20 p-2 bg-white/10 text-white text-center z-10 font-bold text-[8px]">
              ONTOLOGY
            </div>
          </div>
          <div className="space-y-2">
            <div className="border border-white/10 p-1.5 text-[8px] text-white/40 bg-white/5 text-center">AIP_EXE</div>
            <div className="border border-white/10 p-1.5 text-[8px] text-white/40 bg-white/5 text-center">LOG_DB</div>
            <div className="border border-white/10 p-1.5 text-[8px] text-white/40 bg-white/5 text-center">UI_DASH</div>
          </div>
        </div>
      </div>
    );
  }
  if (id === "ontology") {
    return (
      <div className="flex-1 overflow-hidden p-4 bg-black/80 border border-white/5 h-[260px] flex flex-col justify-between font-mono text-white/60">
        <div className="text-white/30 uppercase text-[8px] tracking-wider select-none">{"// SEMANTIC OBJECT MODEL"}</div>
        <div className="relative flex-1 flex items-center justify-center">
          <div className="border border-white/20 h-16 w-16 rounded-full flex items-center justify-center bg-white/5 relative z-10 text-white font-bold text-[9px] text-center">
            ONTOLOGY
          </div>
          <div className="absolute top-2 left-4 border border-white/10 p-1 bg-white/5 text-[8px] text-white/50">
            [OBJ] Aircraft
          </div>
          <div className="absolute top-8 right-2 border border-white/10 p-1 bg-white/5 text-[8px] text-white/50">
            [OBJ] Airport
          </div>
          <div className="absolute bottom-2 left-6 border border-white/10 p-1 bg-white/5 text-[8px] text-white/50">
            [ACT] DeployUnit
          </div>
          <div className="absolute bottom-6 right-8 border border-white/10 p-1 bg-white/5 text-[8px] text-white/50">
            [OBJ] Sensor
          </div>
          <svg className="absolute inset-0 h-full w-full pointer-events-none">
            <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="2"/>
            <line x1="80%" y1="35%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="2"/>
            <line x1="25%" y1="80%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="2"/>
            <line x1="75%" y1="75%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="2"/>
          </svg>
        </div>
      </div>
    );
  }
  if (id === "apollo") {
    return (
      <div className="flex-1 overflow-hidden p-4 bg-black/80 border border-white/5 h-[260px] flex flex-col justify-between font-mono text-[8px] text-white/60">
        <div className="text-white/30 uppercase tracking-wider select-none">{"// AUTONOMOUS EDGE DELIVERY"}</div>
        <div className="grid grid-cols-4 gap-1.5 py-2">
          {Array.from({ length: 12 }).map((_, i) => {
            const statuses = ["#10b981", "#10b981", "#10b981", "#3b82f6", "#f59e0b", "#10b981"];
            const bgStatus = statuses[i % statuses.length];
            const labels = [
              "aws-us-e1", "gov-il5-a", "edge-n-01", "edge-n-02",
              "gcp-eu-w1", "k8s-prod-1", "aws-ap-n1", "edge-n-03",
              "k8s-stg-2", "azure-us-w", "gov-il5-b", "edge-n-04"
            ];
            return (
              <div key={i} className="border border-white/10 p-1 bg-white/5 flex flex-col justify-between h-[48px]">
                <span className="text-white/40 overflow-hidden text-[7px] select-none">{labels[i]}</span>
                <div className="flex items-center gap-1 mt-1">
                  <span className="h-1 w-1 rounded-full" style={{ backgroundColor: bgStatus }} />
                  <span className="text-white/50 text-[7px]">
                    {bgStatus === "#10b981" ? "HEAL" : bgStatus === "#3b82f6" ? "SYNC" : "WARN"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
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

  const active = products[activeIndex];

  return (
    <section className="bg-white border-b border-black/5 pb-20 md:pb-28">
      <div className="mx-auto max-w-content px-6 pt-24 md:px-10 md:pt-32">
        <p className="font-mono text-[10px] tracking-[0.25em] text-black/50 uppercase mb-4">
          {"// SOFTWARE PORTFOLIO"}
        </p>
        <h2 className="text-4xl font-extrabold tracking-[-0.035em] text-black md:text-5xl lg:text-6xl font-heading">
          {productsSection.heading}
        </h2>
        <p className="mt-4 max-w-3xl text-lg text-gc-muted leading-relaxed">
          {productsSection.subheading}
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-content gap-0 px-6 md:grid-cols-2 md:px-10 lg:grid-cols-[1fr_1fr]">
        {/* Sticky preview panel — desktop */}
        <div className="sticky top-28 hidden h-[68vh] self-start md:block pr-10">
          <div
            className={`flex h-full flex-col justify-between bg-gradient-to-br ${active.previewGradient} p-8 border border-white/5 transition-all duration-500`}
          >
            <div>
              <p className="font-mono text-[9px] tracking-widest text-white/40 uppercase">{"SYSTEM PREVIEW // "}{active.index}</p>
              <h3 className="mt-4 text-3xl font-extrabold tracking-[-0.03em] text-white font-heading">{active.name}</h3>
            </div>

            {/* Dynamic visual widget */}
            <div className="my-8 flex-1 flex flex-col justify-center">
              <ActiveProductVisual id={active.id} />
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[9px] tracking-widest text-white/40 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span>{"CONNECTED // PORT 3001 // SECURE_SESSION"}</span>
            </div>
          </div>
        </div>

        {/* Scrolling product rows */}
        <div className="border-l border-black/5">
          {products.map((product, index) => (
            <div
              key={product.id}
              ref={(el) => {
                rowRefs.current[index] = el;
              }}
              className={`relative border-t border-black/5 py-16 md:py-24 pl-8 md:pl-12 transition-all duration-300 ${
                activeIndex === index 
                  ? "border-l-2 border-l-black bg-gc-light/30" 
                  : "border-l-2 border-l-transparent hover:bg-gc-light/10"
              }`}
            >
              <span className="pointer-events-none absolute top-4 right-6 select-none font-mono text-[10px] text-black/25">
                {"// PLATFORM."}{product.index}
              </span>
              <div className="relative space-y-4">
                <span className="font-mono text-xs text-black/40">/ {product.name.toUpperCase()}</span>
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
