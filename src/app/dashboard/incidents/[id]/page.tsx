"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef, MouseEvent } from "react";
import { Incident } from "@/lib/incidents";
import { mapIncidentReportToDashboardIncident } from "@/lib/incidents";
import { getIncidentById, getCachedIncident } from "@/lib/api";
import { ThreeDViewer } from "@/components/dashboard/ThreeDViewer";
import { ArrowLeft, Move, RefreshCw } from "lucide-react";

// Position data interface for canvas widgets
interface WidgetPosition {
  x: number;
  y: number;
}

export default function IncidentDetailsPage() {
  const params = useParams();
  const rawId = params.id as string;
  const id = decodeURIComponent(rawId);

  const [incident, setIncident] = useState<Incident | null>(() => {
    const cached = getCachedIncident(id);
    return cached ? mapIncidentReportToDashboardIncident(cached) : null;
  });
  const [fetchDone, setFetchDone] = useState(() => !!getCachedIncident(id));

  // Layout positions for draggable widgets
  const defaultPositions = {
    cctv: { x: 30, y: 100 },
    robodog: { x: 30, y: 440 },
    threed: { x: 570, y: 100 },
    clearance: { x: 1200, y: 100 },
  };

  const [positions, setPositions] = useState<{ [key: string]: WidgetPosition }>(defaultPositions);
  const [activeDragWidget, setActiveDragWidget] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Core Incident Live States
  const [accruedCost, setAccruedCost] = useState<number>(0);
  const [currentStatus, setCurrentStatus] = useState<string>("Scouting");
  const [activeScoutPhotoIndex, setActiveScoutPhotoIndex] = useState<number>(0);
  const [checkedSteps, setCheckedSteps] = useState({
    scout: false,
    fusion: false,
    cost: false,
    detour: false,
    signed: false
  });
  const [isCleared, setIsCleared] = useState<boolean>(false);
  const [showClearanceModal, setShowClearanceModal] = useState<boolean>(false);
  const [clearanceProgress, setClearanceProgress] = useState<number>(0);

  // Drawing Canvas Signature Ref
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawingSig, setIsDrawingSig] = useState<boolean>(false);

  useEffect(() => {
    const cached = getCachedIncident(id);
    if (cached) {
      setIncident(mapIncidentReportToDashboardIncident(cached));
      setFetchDone(true);
      return;
    }

    setFetchDone(false);
    getIncidentById(id)
      .then((report) => {
        setIncident(mapIncidentReportToDashboardIncident(report));
      })
      .catch(() => {
        setIncident(null);
      })
      .finally(() => setFetchDone(true));
  }, [id]);

  useEffect(() => {
    if (!incident) return;
    setCurrentStatus(incident.status);

    if (incident.status === "Modeling") {
      setCheckedSteps({ scout: true, fusion: false, cost: false, detour: false, signed: false });
    } else if (incident.status === "Ready for Review") {
      setCheckedSteps({ scout: true, fusion: true, cost: true, detour: true, signed: false });
    } else if (incident.status === "Cleared") {
      setCheckedSteps({ scout: true, fusion: true, cost: true, detour: true, signed: true });
      setIsCleared(true);
    }

    const elapsedMin = incident.firstSeenAt
      ? Math.max(0, (Date.now() - new Date(incident.firstSeenAt).getTime()) / 60_000)
      : 22;
    setAccruedCost(incident.costPerMinute * elapsedMin);

    const increment = incident.costPerMinute / 60;
    const timer = setInterval(() => {
      if (!isCleared) {
        setAccruedCost((prev) => prev + increment);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [incident, isCleared]);

  if (!fetchDone) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#050506] text-white font-mono p-6">
        <span className="text-[10px] uppercase tracking-widest text-white/40 animate-pulse">Loading incident...</span>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#050506] text-white font-mono p-6">
        <h1 className="text-2xl font-bold text-gc-accent mb-4">INCIDENT FILE NOT FOUND</h1>
        <Link href="/dashboard" className="border border-white/20 bg-white/5 px-6 py-2.5 text-xs hover:bg-white/10 uppercase tracking-widest text-white">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Handle Drag Start
  const handleDragStart = (widgetName: string, e: MouseEvent<HTMLDivElement>) => {
    // Only drag from the header grab bar
    setActiveDragWidget(widgetName);
    const pos = positions[widgetName];
    dragOffsetRef.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    e.preventDefault();
  };

  // Handle Dragging
  const handleDragMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!activeDragWidget) return;
    
    const nextX = Math.max(0, e.clientX - dragOffsetRef.current.x);
    const nextY = Math.max(0, e.clientY - dragOffsetRef.current.y);

    setPositions((prev) => ({
      ...prev,
      [activeDragWidget]: { x: nextX, y: nextY },
    }));
  };

  // Handle Drag End
  const handleDragEnd = () => {
    setActiveDragWidget(null);
  };

  const resetLayout = () => {
    setPositions(defaultPositions);
  };

  // Step checklist toggle
  const toggleStep = (step: keyof typeof checkedSteps) => {
    if (isCleared) return;
    setCheckedSteps((prev) => {
      const updated = { ...prev, [step]: !prev[step] };
      // auto set ready if signature is signed
      return updated;
    });
  };

  // Handle Signature Canvas drawing
  const startDrawing = (e: MouseEvent<HTMLCanvasElement>) => {
    if (isCleared) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = "rgb(59,130,246)"; // Neon blue ink signature
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    setIsDrawingSig(true);
  };

  const draw = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingSig || isCleared) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isCleared) return;
    setIsDrawingSig(false);
    setCheckedSteps((prev) => ({ ...prev, signed: true }));
  };

  const clearSignature = () => {
    if (isCleared) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCheckedSteps((prev) => ({ ...prev, signed: false }));
  };

  // Authorize clearance reopen action
  const handleAuthorizeClearance = () => {
    if (!checkedSteps.signed || isCleared) return;
    setShowClearanceModal(true);
    setClearanceProgress(0);

    // Simulate reopening sequences
    const interval = setInterval(() => {
      setClearanceProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCleared(true);
          setCurrentStatus("Cleared");
          setTimeout(() => setShowClearanceModal(false), 2000);
          return 100;
        }
        return prev + 5;
      });
    }, 120);
  };

  return (
    <div 
      className="flex min-h-screen flex-col bg-[#050506] text-white font-mono antialiased relative selection:bg-gc-accent selection:text-white"
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
    >
      {/* Top Telemetry Header */}
      <header className="flex h-16 items-center justify-between border-b border-white/10 bg-black/40 px-6 md:px-10 z-40 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-[9px] uppercase text-white/70 transition">
            <ArrowLeft size={12} />
            <span>Map</span>
          </Link>
          <span className="h-4 w-[1px] bg-white/15" />
          <h1 className="text-xs tracking-wider uppercase text-white font-bold">
            FILE: {incident.id} <span className="text-white/40 font-normal">({incident.intersection})</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={resetLayout}
            className="flex items-center gap-1.5 border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-[9px] uppercase text-white/50 transition"
            title="Reset Widgets Layout Position"
          >
            <RefreshCw size={11} />
            <span>Reset Grid</span>
          </button>
          
          <div className="hidden sm:flex items-center gap-4 text-[9px] text-white/30 tracking-widest uppercase">
            <span>MOD: RADAR_MESH_COLLISION</span>
            <span>|</span>
            <span className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${isCleared ? "bg-[#10b981]" : "bg-[#f59e0b]"} animate-pulse`} />
              {currentStatus.toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      {/* Draggable Canvas Sandbox Container */}
      <div 
        className="flex-1 w-full relative overflow-y-auto select-none p-6"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1.2px, transparent 1.2px)",
          backgroundSize: "24px 24px"
        }}
      >
        {/* Canvas watermark grid indicator */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.02]">
          <div className="text-[120px] font-extrabold uppercase font-sans tracking-widest select-none">
            GRID_CLEAR_WORKSPACE
          </div>
        </div>

        {/* ============================================================== */}
        {/* WIDGET 1: CCTV FEED CONTAINER */}
        {/* ============================================================== */}
        <div 
          className="absolute z-10 w-[500px] border border-white/10 bg-black/90 rounded-sm shadow-[0_10px_35px_rgba(0,0,0,0.85)]"
          style={{ left: `${positions.cctv.x}px`, top: `${positions.cctv.y}px` }}
        >
          {/* Grab drag header */}
          <div 
            className="flex items-center justify-between border-b border-white/10 px-3 py-2 bg-white/5 cursor-grab active:cursor-grabbing text-[9px] text-white/40 uppercase font-semibold"
            onMouseDown={(e) => handleDragStart("cctv", e)}
          >
            <span className="flex items-center gap-1.5">
              <Move size={11} className="text-white/30" />
              {"// CCTV FEED // RESOLVED_STILL"}
            </span>
            <span className="text-[8px] text-gc-accent">CAM_ID: {incident.id}-04</span>
          </div>

          <div className="p-3">
            <div className="relative aspect-[16/9] w-full border border-white/5 overflow-hidden bg-zinc-950">
              <img
                src={incident.cctvImage}
                alt="Accident CCTV snapshot"
                className="h-full w-full object-cover opacity-80"
                draggable={false}
              />
              {/* Scanlines overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.03] to-transparent bg-[length:100%_4px] pointer-events-none" />
              
              {/* Target viewfinder box */}
              <div className="absolute top-4 left-4 h-6 w-6 border-t-2 border-l-2 border-white/45 pointer-events-none" />
              <div className="absolute top-4 right-4 h-6 w-6 border-t-2 border-r-2 border-white/45 pointer-events-none" />
              <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-white/45 pointer-events-none" />
              <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-white/45 pointer-events-none" />

              <div className="absolute top-3 right-3 text-[7px] text-red-500 font-bold bg-black/75 px-1 tracking-wider uppercase animate-pulse border border-red-500/20">
                ● LIVE FEED
              </div>
            </div>
            
            <div className="mt-2.5 flex items-center justify-between text-[8px] uppercase tracking-wider text-white/40">
              <span>RESOLUTION: 1920x1080 @ 30FPS</span>
              <span>ANGLE: SOUTH-WEST SECTOR</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* WIDGET 2: ROBODOG SCOUT CAPTURES CAROUSEL */}
        {/* ============================================================== */}
        <div 
          className="absolute z-10 w-[500px] border border-white/10 bg-black/90 rounded-sm shadow-[0_10px_35px_rgba(0,0,0,0.85)]"
          style={{ left: `${positions.robodog.x}px`, top: `${positions.robodog.y}px` }}
        >
          {/* Grab drag header */}
          <div 
            className="flex items-center justify-between border-b border-white/10 px-3 py-2 bg-white/5 cursor-grab active:cursor-grabbing text-[9px] text-white/40 uppercase font-semibold"
            onMouseDown={(e) => handleDragStart("robodog", e)}
          >
            <span className="flex items-center gap-1.5">
              <Move size={11} className="text-white/30" />
              {"// ROBODOG FORENSIC LOGS // CAPTURES"}
            </span>
            <span className="text-[8px] text-gc-accent">SCOUT: K9-04</span>
          </div>

          <div className="p-3">
            <div className="relative aspect-[16/9] w-full border border-white/5 overflow-hidden bg-zinc-950">
              <img
                src={incident.robodogImages[activeScoutPhotoIndex]}
                alt={`Robodog scan ${activeScoutPhotoIndex + 1}`}
                className="h-full w-full object-cover opacity-85"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />

              {/* Lidar distance coordinates annotation */}
              <div className="absolute bottom-3 left-3 text-[8px] bg-black/80 border border-white/10 px-2 py-1 text-white/60">
                DIST_TO_IMPACT: <span className="text-gc-accent font-bold">12.4m</span> {"// DEPTH: FUSED"}
              </div>
            </div>

            {/* Thumbnail pagination selector */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {incident.robodogImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveScoutPhotoIndex(idx)}
                  className={`relative aspect-[16/10] border overflow-hidden transition-all ${
                    idx === activeScoutPhotoIndex ? "border-gc-accent scale-[1.02]" : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" draggable={false} />
                  <div className="absolute bottom-1 right-1 text-[7px] bg-black/80 border border-white/5 px-1 font-mono text-white/40">
                    S.0{idx + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* WIDGET 3: 3D POINT CLOUD WORKSPACE */}
        {/* ============================================================== */}
        <div 
          className="absolute z-10 w-[600px] border border-white/10 bg-black/90 rounded-sm shadow-[0_10px_35px_rgba(0,0,0,0.85)]"
          style={{ left: `${positions.threed.x}px`, top: `${positions.threed.y}px` }}
        >
          {/* Grab drag header */}
          <div 
            className="flex items-center justify-between border-b border-white/10 px-3 py-2 bg-white/5 cursor-grab active:cursor-grabbing text-[9px] text-white/40 uppercase font-semibold"
            onMouseDown={(e) => handleDragStart("threed", e)}
          >
            <span className="flex items-center gap-1.5">
              <Move size={11} className="text-white/30" />
              {"// Interactive 3D Collision Reconstruction"}
            </span>
            <span className="text-[8px] text-[#10b981]">MODEL: 3D_POINT_CLOUD</span>
          </div>

          <div className="p-3">
            <ThreeDViewer />
          </div>
        </div>

        {/* ============================================================== */}
        {/* WIDGET 4: CLEARANCE CONTROL CENTER */}
        {/* ============================================================== */}
        <div 
          className="absolute z-10 w-[420px] border border-white/10 bg-black/90 rounded-sm shadow-[0_10px_35px_rgba(0,0,0,0.85)]"
          style={{ left: `${positions.clearance.x}px`, top: `${positions.clearance.y}px` }}
        >
          {/* Grab drag header */}
          <div 
            className="flex items-center justify-between border-b border-white/10 px-3 py-2 bg-white/5 cursor-grab active:cursor-grabbing text-[9px] text-white/40 uppercase font-semibold"
            onMouseDown={(e) => handleDragStart("clearance", e)}
          >
            <span className="flex items-center gap-1.5">
              <Move size={11} className="text-white/30" />
              {"// Incident Clearance Approval Console"}
            </span>
            <span className="text-[8px] text-gc-accent">SECUREAUTH</span>
          </div>

          <div className="p-4 space-y-4">
            {/* Real-time cost ticker */}
            <div className="bg-white/[0.02] border border-white/5 p-3 rounded-none">
              <span className="text-[8px] text-white/30 uppercase tracking-widest block">
                {"// Real-Time Closure Loss"}
              </span>
              <div className={`mt-1.5 text-2xl font-extrabold tracking-tight font-mono tabular-nums ${isCleared ? "text-[#10b981]" : "text-gc-accent"}`}>
                ${accruedCost.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
              <span className="text-[7.5px] text-white/40 block mt-1 uppercase">
                {isCleared ? "STATUS: REOPENED // LOSS TICKER STOPPED" : `ACCUMULATOR: +$${(incident.costPerMinute / 60).toFixed(2)}/SEC`}
              </span>
            </div>

            {/* Steps checklist */}
            <div className="space-y-2.5 text-[9px] uppercase tracking-widest">
              <span className="text-white/30 text-[8px] block">{"// REOPENING CHECKS"}</span>
              
              {[
                { key: "scout", label: "Scout telemetry logs confirmed" },
                { key: "fusion", label: "3D scene reconstruction loaded" },
                { key: "cost", label: "Deterministic closure cost calculated" },
                { key: "detour", label: "Cascading load detour routes active" },
              ].map((step) => (
                <button
                  key={step.key}
                  onClick={() => toggleStep(step.key as keyof typeof checkedSteps)}
                  className={`w-full flex items-center gap-3 border p-2 text-left transition-colors ${
                    checkedSteps[step.key as keyof typeof checkedSteps]
                      ? "border-[#10b981]/30 bg-[#10b981]/5 text-[#10b981]"
                      : "border-white/10 hover:border-white/20 text-white/60"
                  }`}
                  disabled={isCleared}
                >
                  <span className="font-bold text-xs">
                    {checkedSteps[step.key as keyof typeof checkedSteps] ? "✓" : "▢"}
                  </span>
                  <span>{step.label}</span>
                </button>
              ))}
            </div>

            {/* Signature Draw Console */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[8px] text-white/30 uppercase tracking-widest">
                <span>{"// Commander Electronic Sign-off"}</span>
                {checkedSteps.signed && !isCleared && (
                  <button 
                    onClick={clearSignature}
                    className="text-red-400 hover:text-red-300 font-semibold"
                  >
                    [ CLEAR ]
                  </button>
                )}
              </div>

              <div className="relative border border-white/10 bg-black/60 aspect-[3.2/1] overflow-hidden">
                <canvas
                  ref={sigCanvasRef}
                  width={386}
                  height={120}
                  className="w-full h-full cursor-crosshair bg-neutral-950"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                
                {!checkedSteps.signed && (
                  <div className="absolute inset-0 flex items-center justify-center text-[8.5px] uppercase tracking-widest text-white/25 pointer-events-none select-none">
                    Drag mouse to sign here
                  </div>
                )}
                {isCleared && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 border border-[#10b981]/25 text-[#10b981] font-bold text-[9px] uppercase tracking-wider">
                    Signature Certified & Frozen
                  </div>
                )}
              </div>
            </div>

            {/* Reopen Action button */}
            <button
              onClick={handleAuthorizeClearance}
              className={`w-full py-3 font-mono text-[10px] font-extrabold uppercase tracking-widest border transition-all ${
                isCleared
                  ? "bg-[#10b981]/15 text-[#10b981] border-[#10b981] cursor-not-allowed"
                  : checkedSteps.signed && checkedSteps.scout && checkedSteps.fusion && checkedSteps.cost && checkedSteps.detour
                  ? "bg-white text-black border-white hover:bg-transparent hover:text-white"
                  : "bg-transparent text-white/30 border-white/10 cursor-not-allowed"
              }`}
              disabled={isCleared || !(checkedSteps.signed && checkedSteps.scout && checkedSteps.fusion && checkedSteps.cost && checkedSteps.detour)}
            >
              {isCleared ? "ROADWAY REOPENED / COMPLETE" : "AUTHORIZE SCENE REOPENING"}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* CLEARANCE VERIFICATION MODAL POPUP */}
      {/* ============================================================== */}
      {showClearanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md select-none font-mono">
          <div className="w-[450px] border border-white/15 bg-[#0a0a0c] p-6 text-center space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
            <div className="space-y-2">
              <span className="text-[10px] tracking-[0.25em] text-gc-accent uppercase animate-pulse block">
                {"// INITIATING CLEARANCE PROTOCOL"}
              </span>
              <h2 className="text-xl font-extrabold tracking-tight text-white uppercase font-heading">
                Signing Intersection Release
              </h2>
              <p className="text-[10.5px] leading-relaxed text-white/50 max-w-sm mx-auto">
                Fusing signed plan, updating grid routing metrics, and dispatching road clearance crews.
              </p>
            </div>

            {/* Progress loading animation */}
            <div className="space-y-2">
              <div className="relative h-2 w-full bg-white/5 border border-white/10 overflow-hidden">
                <div 
                  className="h-full bg-gc-accent transition-all duration-100" 
                  style={{ width: `${clearanceProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[8px] text-white/30 uppercase tracking-widest">
                <span>Uploading digital signature...</span>
                <span>{clearanceProgress}%</span>
              </div>
            </div>

            {clearanceProgress >= 100 && (
              <div className="border border-[#10b981]/20 bg-[#10b981]/5 p-3 text-[#10b981] font-bold text-[10px] uppercase tracking-wider animate-bounce">
                ✓ RELEASE DECREE RECORDED // SECURE BROADCAST SENT
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
