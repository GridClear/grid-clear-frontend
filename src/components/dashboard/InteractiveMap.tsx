"use client";

import { useState } from "react";
import { Incident } from "@/lib/incidents";

interface InteractiveMapProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
}

export function InteractiveMap({
  incidents,
  selectedIncident,
  onSelectIncident
}: InteractiveMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="relative border border-white/10 bg-black/60 p-2 md:p-3 overflow-hidden rounded-sm select-none">
      {/* HUD Telemetry borders */}
      <div className="absolute top-2 left-2 text-[9px] font-mono text-white/30 uppercase tracking-widest pointer-events-none">
        {"// Situational Awareness Map // Sector.04"}
      </div>
      <div className="absolute top-2 right-2 text-[9px] font-mono text-white/30 tracking-widest pointer-events-none">
        {"43.6532° N, 79.3832° W"}
      </div>

      {/* Main Map Container */}
      <div className="relative aspect-[1.8/1] w-full overflow-hidden border border-white/5 bg-[#030303]">
        {/* Toronto Map Raster */}
        <img
          src="/toronto-map.png"
          alt="Toronto Tactical Grid Map"
          className="h-full w-full object-cover opacity-35 filter invert brightness-90 contrast-125"
          draggable={false}
        />

        {/* Tactical Overlay Grid Lines */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03]" 
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />

        {/* Pings & Intersections */}
        {incidents.map((incident) => {
          const isSelected = selectedIncident?.id === incident.id;
          
          let pingColor = "bg-gc-accent";
          let ringColor = "border-gc-accent";
          
          if (incident.status === "Cleared") {
            pingColor = "bg-[#10b981]";
            ringColor = "border-[#10b981]";
          } else if (incident.status === "Ready for Review") {
            pingColor = "bg-[#f59e0b]";
            ringColor = "border-[#f59e0b]";
          }

          return (
            <div
              key={incident.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
              style={{ left: `${incident.x}%`, top: `${incident.y}%` }}
              onClick={() => onSelectIncident(incident)}
              onMouseEnter={() => setHoveredId(incident.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Pulsating Ping Target Ring */}
              <span className={`absolute inline-flex h-8 w-8 -left-3 -top-3 rounded-full border-2 ${ringColor} opacity-75 animate-ping pointer-events-none`} />
              
              {/* Outer selection ring */}
              <span className={`absolute h-6 w-6 -left-2 -top-2 rounded-full border border-white/20 transition-all duration-300 pointer-events-none ${
                isSelected ? "scale-100 opacity-100 rotate-45 border-dashed border-gc-accent" : "scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-55"
              }`} />

              {/* Inner glowing dot */}
              <div className={`relative h-2.5 w-2.5 rounded-full ${pingColor} transition-transform duration-200 group-hover:scale-125 shadow-[0_0_8px_rgba(234,88,12,0.6)]`} />

              {/* Location Tag Tagline / HUD label */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap bg-[#0a0a0c]/90 border border-white/10 px-2 py-1 text-[8px] font-mono tracking-widest text-white/60 pointer-events-none select-none transition-opacity duration-200 opacity-0 group-hover:opacity-100">
                <span className="text-white font-bold">{incident.intersection.toUpperCase()}</span>
                <span className="mx-1.5 font-light text-white/30">|</span>
                <span className="text-gc-accent">{incident.status.toUpperCase()}</span>
              </div>
            </div>
          );
        })}

        {/* Hover details tooltip overlay */}
        {hoveredId && (
          <div 
            className="absolute bottom-4 left-4 bg-black/95 border border-white/10 p-3 font-mono text-[9px] uppercase tracking-wider text-white/70 max-w-[200px] z-30 transition-all pointer-events-none"
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.8)" }}
          >
            {incidents.filter(inc => inc.id === hoveredId).map((inc) => (
              <div key={inc.id} className="space-y-1.5">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="font-bold text-white">{inc.id}</span>
                  <span className="text-[8px] text-white/40">{inc.timestamp}</span>
                </div>
                <div className="text-white text-[10px] font-semibold">{inc.intersection}</div>
                <div>Status: <span className="text-white">{inc.status}</span></div>
                <div>Est. Cost: <span className="text-gc-accent">${inc.costPerMinute.toLocaleString()}/min</span></div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Bottom stats ribbon */}
      <div className="mt-2 flex items-center justify-between font-mono text-[8px] tracking-wider text-white/30 px-1 select-none pointer-events-none">
        <span>ACTIVE COLLISION SCENES: {incidents.filter(i => i.status !== "Cleared").length}</span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 bg-[#10b981] rounded-full animate-pulse" />
          SYSTEM LIVE // DEPLOYED NODES SECURE
        </span>
      </div>
    </div>
  );
}
