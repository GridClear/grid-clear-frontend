"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Logo } from "@/components/ui/Logo";
import { incidents, Incident } from "@/content/incidents";
import { InteractiveMap } from "@/components/dashboard/InteractiveMap";
import { healthCheck } from "@/lib/api";

type BackendStatus = "checking" | "ok" | "error";

export default function DashboardPage() {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");
  
  // Real-time ticking cost accumulator state
  const [accruedCost, setAccruedCost] = useState<number>(0);

  useEffect(() => {
    healthCheck()
      .then((health) => {
        setBackendStatus(health.status === "ok" ? "ok" : "error");
      })
      .catch(() => setBackendStatus("error"));
  }, []);

  // Initialize with the first incident on load
  useEffect(() => {
    if (incidents.length > 0) {
      setSelectedIncident(incidents[0]);
    }
  }, []);

  // Update accrued cost when selected incident changes or over time
  useEffect(() => {
    if (!selectedIncident) return;
    
    // Set a base accrued cost based on elapsed time (e.g., 20 mins ago)
    const baseCost = selectedIncident.costPerMinute * 22; // simulated 22 mins elapsed
    setAccruedCost(baseCost);

    // Tick cost up in real-time ($ per second)
    const increment = selectedIncident.costPerMinute / 60; // cost per second
    const timer = setInterval(() => {
      setAccruedCost((prev) => prev + increment);
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedIncident]);

  return (
    <div className="flex min-h-screen flex-col bg-[#050506] text-white font-mono antialiased selection:bg-gc-accent selection:text-white">
      {/* Top Console Header */}
      <header className="flex h-16 items-center justify-between border-b border-white/10 bg-black/40 px-6 md:px-10 z-40 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <Link href="/">
            <Logo variant="light" />
          </Link>
          <span className="hidden md:inline h-4 w-[1px] bg-white/15" />
          <span className="hidden md:inline text-[10px] tracking-[0.2em] text-white/40 uppercase">
            {"// COMMAND CENTER // LIVE_FEED"}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[9px] text-white/30 tracking-widest uppercase">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 bg-[#10b981] rounded-full animate-pulse" />
            SECURE CLIENT
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">
            {backendStatus === "checking" && "GRID_NODE // CONNECTING"}
            {backendStatus === "ok" && "GRID_NODE // STABLE"}
            {backendStatus === "error" && "GRID_NODE // OFFLINE"}
          </span>
        </div>
      </header>

      {/* Main Console Workspace */}
      <main className="flex flex-1 flex-col lg:flex-row overflow-hidden max-w-[1700px] mx-auto w-full p-4 gap-4">
        {/* Left Column: Live Incident Feeds list */}
        <section className="w-full lg:w-[360px] flex flex-col border border-white/10 bg-black/60 rounded-sm overflow-hidden min-h-[300px]">
          <div className="border-b border-white/10 px-4 py-3 bg-white/5 flex items-center justify-between text-[10px] uppercase tracking-wider text-white/40 select-none">
            <span>Live Incident Feeds</span>
            <span>{incidents.length} active</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {incidents.map((incident) => {
              const isSelected = selectedIncident?.id === incident.id;
              
              let statusPill = "bg-gc-accent/10 text-gc-accent border-gc-accent/20";
              let dotColor = "bg-gc-accent";
              if (incident.status === "Cleared") {
                statusPill = "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20";
                dotColor = "bg-[#10b981]";
              } else if (incident.status === "Ready for Review") {
                statusPill = "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20";
                dotColor = "bg-[#f59e0b]";
              }

              return (
                <div
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident)}
                  className={`p-4 cursor-pointer transition-all hover:bg-white/5 ${
                    isSelected ? "bg-white/5 border-l-2 border-gc-accent" : "border-l-2 border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/45">{incident.id}</span>
                    <span className="text-[9px] text-white/30">{incident.timestamp}</span>
                  </div>
                  
                  <h3 className="mt-2 text-sm font-semibold text-white font-heading tracking-tight">
                    {incident.intersection}
                  </h3>
                  
                  <p className="mt-1.5 text-[10px] text-white/50 line-clamp-2 leading-relaxed">
                    {incident.description}
                  </p>

                  <div className="mt-3.5 flex items-center justify-between text-[8px] uppercase tracking-wider">
                    <span className={`inline-flex items-center gap-1.5 border px-2 py-0.5 rounded-none ${statusPill}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${dotColor} animate-pulse`} />
                      {incident.status}
                    </span>
                    <span className="text-white/40">
                      ${incident.costPerMinute.toLocaleString()}/MIN
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Center / Main Column: Map + Quick Preview HUD */}
        <section className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Tactical Interactive Map */}
          <div className="flex-1 min-h-[300px]">
            <InteractiveMap
              incidents={incidents}
              selectedIncident={selectedIncident}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
            />
          </div>

          {/* Quick Preview Telemetry HUD */}
          {selectedIncident && (
            <div className="border border-white/10 bg-black/60 p-4 rounded-sm grid grid-cols-1 md:grid-cols-[1fr_240px] gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-white/5 pb-2 text-[10px] uppercase text-white/45 select-none">
                  <span>Incident Profile</span>
                  <span>|</span>
                  <span className="text-gc-accent">{selectedIncident.id}</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] uppercase tracking-wider">
                  <div>
                    <span className="block text-white/30 text-[9px]">Location:</span>
                    <span className="font-semibold text-white mt-1 block">{selectedIncident.intersection}</span>
                  </div>
                  <div>
                    <span className="block text-white/30 text-[9px]">Status:</span>
                    <span className="font-semibold text-white mt-1 block text-gc-accent">{selectedIncident.status}</span>
                  </div>
                  <div>
                    <span className="block text-white/30 text-[9px]">Projected duration:</span>
                    <span className="font-semibold text-white mt-1 block">{selectedIncident.projectedDuration}</span>
                  </div>
                  <div>
                    <span className="block text-white/30 text-[9px]">CCTV Feeds:</span>
                    <span className="font-semibold text-white mt-1 block">1 ACTIVE FEED</span>
                  </div>
                </div>

                <p className="text-[11px] leading-relaxed text-white/60 font-sans tracking-wide">
                  {selectedIncident.description}
                </p>
              </div>

              {/* Cost Ticker & Detailed Workspace Link */}
              <div className="border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
                <div>
                  <span className="text-[8px] text-white/30 uppercase tracking-widest block select-none">
                    {"// Real-Time Accrued Loss"}
                  </span>
                  <div className="mt-2 text-2xl md:text-3xl font-extrabold text-gc-accent font-mono tracking-tight tabular-nums">
                    ${accruedCost.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                  <span className="text-[8px] text-white/40 block mt-1">
                    CHARGING STATS: +${(selectedIncident.costPerMinute / 60).toFixed(2)}/SEC
                  </span>
                </div>

                <Link
                  href={`/dashboard/incidents/${selectedIncident.id}`}
                  className="mt-4 block text-center border border-white bg-white text-black py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-white transition-colors duration-200"
                >
                  Open 3D Reconstruction Workspace →
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
