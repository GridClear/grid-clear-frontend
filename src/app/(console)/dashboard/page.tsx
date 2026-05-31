"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ConsoleShell } from "@/components/layout/ConsoleShell";
import { Incident } from "@/lib/incidents";
import { mapIncidentReportToDashboardIncident } from "@/lib/incidents";
import { InteractiveMap } from "@/components/dashboard/InteractiveMap";
import { healthCheck, listIncidents, getCachedIncidents, getCachedEconomics, enrichReportsWithEconomics, deduplicateIncidentReports } from "@/lib/api";
import { incidents as mockIncidents } from "@/content/incidents";

type BackendStatus = "checking" | "ok" | "error";

const INCIDENT_LIST_LIMIT = 5;

function getInitialIncidents(): { incidents: Incident[]; fromCache: boolean } {
  const cached = getCachedIncidents(INCIDENT_LIST_LIMIT);
  if (cached && cached.length > 0) {
    const deduped = deduplicateIncidentReports(cached);
    const allHaveEconomics = deduped.every((r) => getCachedEconomics(r.incident_id));
    if (allHaveEconomics) {
      return {
        incidents: deduped.map((r) =>
          mapIncidentReportToDashboardIncident(r, getCachedEconomics(r.incident_id))
        ),
        fromCache: true,
      };
    }
  }
  return { incidents: [], fromCache: false };
}

export default function DashboardPage() {
  const initial = getInitialIncidents();
  const [incidents, setIncidents] = useState<Incident[]>(initial.incidents);
  const [incidentsLoading, setIncidentsLoading] = useState(!initial.fromCache);
  const [incidentsError, setIncidentsError] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const durationMinutes = selectedIncident?.economics?.incident.duration_minutes ?? 90;
  const totalClosureCost =
    selectedIncident?.economics?.incident_totals.total_cad ??
    Math.round((selectedIncident?.costPerMinute ?? 0) * durationMinutes);

  useEffect(() => {
    healthCheck()
      .then((health) => {
        setBackendStatus(health.status === "ok" ? "ok" : "error");
      })
      .catch(() => setBackendStatus("error"));
  }, []);

  useEffect(() => {
    listIncidents({ limit: INCIDENT_LIST_LIMIT })
      .then(async (reports) => {
        if (reports.length === 0) {
          setIncidents(mockIncidents as Incident[]);
          if (mockIncidents.length > 0) setSelectedIncident(mockIncidents[0] as Incident);
          return;
        }

        const economicsMap = await enrichReportsWithEconomics(reports);
        const enriched = reports.map((r) =>
          mapIncidentReportToDashboardIncident(r, economicsMap.get(r.incident_id))
        );
        setIncidents(enriched);
        setSelectedIncident((prev) =>
          prev ? (enriched.find((i) => i.id === prev.id) ?? enriched[0]) : enriched[0]
        );
      })
      .catch(() => {
        setIncidents(mockIncidents as Incident[]);
        if (mockIncidents.length > 0) setSelectedIncident(mockIncidents[0] as Incident);
        setIncidentsError(true);
      })
      .finally(() => setIncidentsLoading(false));
  }, []);

  const activeCount = incidents.filter((i) => i.status !== "Cleared").length;

  return (
    <ConsoleShell
      title="// COMMAND CENTER // LIVE_FEED"
      status={
        <>
          <span className="hidden sm:flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 bg-[#10b981] rounded-full animate-pulse" />
            SECURE CLIENT
          </span>
          <span className="hidden sm:inline text-white/15">|</span>
          <span className="hidden sm:inline">
            {backendStatus === "checking" && "GRID_NODE // CONNECTING"}
            {backendStatus === "ok" && "GRID_NODE // STABLE"}
            {backendStatus === "error" && "GRID_NODE // OFFLINE"}
          </span>
        </>
      }
    >
      <main className="flex flex-1 flex-col lg:flex-row overflow-hidden max-w-[1700px] mx-auto w-full p-4 gap-4 min-h-0">
        <section className="w-full lg:w-[360px] flex flex-col border border-white/10 bg-black/60 rounded-sm overflow-hidden min-h-[300px]">
          <div className="border-b border-white/10 px-4 py-3 bg-white/5 flex items-center justify-between text-[10px] uppercase tracking-wider text-white/40 select-none">
            <span>Live Incident Feeds</span>
            <span>{incidentsLoading ? "—" : `${activeCount} active`}</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {incidentsLoading && (
              <div className="p-6 text-center text-[10px] text-white/30 uppercase tracking-widest">
                Loading incidents...
              </div>
            )}

            {incidentsError && !incidentsLoading && (
              <div className="p-6 text-center text-[10px] text-gc-accent uppercase tracking-widest">
                Failed to load incidents
              </div>
            )}

            {!incidentsLoading && !incidentsError && incidents.length === 0 && (
              <div className="p-6 text-center text-[10px] text-white/30 uppercase tracking-widest">
                No active incidents
              </div>
            )}

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

        <section className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0">
          <div className="flex-1 min-h-[300px]">
            <InteractiveMap
              incidents={incidents}
              selectedIncident={selectedIncident}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
            />
          </div>

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

              {/* Estimated Cost & Detailed Workspace Link */}
              <div className="border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
                <div>
                  <span className="text-[8px] text-white/30 uppercase tracking-widest block select-none">
                    {`// Est. Closure Cost (${durationMinutes} min)`}
                  </span>
                  <div className="mt-2 text-2xl md:text-3xl font-extrabold text-gc-accent font-mono tracking-tight tabular-nums">
                    ${Math.round(totalClosureCost).toLocaleString("en-US")}
                  </div>
                  <span className="text-[8px] text-white/40 block mt-1">
                    {`PROJECTED ${durationMinutes}-MIN TOTAL // CAD`}
                  </span>
                </div>

                <Link
                  href={`/dashboard/incidents/${encodeURIComponent(selectedIncident.id)}`}
                  className="mt-4 block text-center border border-white bg-white text-black py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-white transition-colors duration-200"
                >
                  Open 3D Reconstruction Workspace →
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>
    </ConsoleShell>
  );
}
