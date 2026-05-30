"use client";

import { useEffect, useRef, useState, MouseEvent } from "react";

interface Point3D {
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
}

interface Line3D {
  p1: Point3D;
  p2: Point3D;
  color: string;
  width: number;
}

export function ThreeDViewer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Interactive state
  const [yaw, setYaw] = useState<number>(0.6); // Horizontal rotation
  const [pitch, setPitch] = useState<number>(0.4); // Vertical rotation
  const [pointSize, setPointSize] = useState<number>(1.5);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [activeSensor, setActiveSensor] = useState<string>("K9-04_LIDAR");
  const [showWireframe, setShowWireframe] = useState<boolean>(true);

  // Drag-to-rotate state
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragAngleRef = useRef<{ yaw: number; pitch: number }>({ yaw: 0.6, pitch: 0.4 });

  // Generate mock point cloud static data
  const pointsRef = useRef<Point3D[]>([]);
  const linesRef = useRef<Line3D[]>([]);

  useEffect(() => {
    // Generate the 3D scene data once on mount
    const points: Point3D[] = [];
    const lines: Line3D[] = [];

    // 1. Grid Floor (Intersection)
    const gridSize = 160;
    const gridSpacing = 20;
    for (let x = -gridSize; x <= gridSize; x += gridSpacing) {
      // Lane lines along Z
      for (let z = -gridSize; z <= gridSize; z += 5) {
        // Road surface points (dark gray)
        const onCrosswalk = (Math.abs(x) < 40 && Math.abs(z) > 60 && Math.abs(z) < 80);
        const centerLine = (x === 0 || z === 0) && (Math.abs(x + z) % 15 < 8);
        
        let color = "rgba(255,255,255,0.08)";
        let size = 1.0;
        if (onCrosswalk) {
          color = "rgba(255,255,255,0.4)";
          size = 1.2;
        } else if (centerLine) {
          color = "rgba(234,88,12,0.5)"; // Signal orange centers
          size = 1.3;
        }
        points.push({ x, y: 0, z, color, size });
      }
    }

    // Helper to generate a 3D wireframe car box
    const createCar = (cx: number, cy: number, cz: number, length: number, width: number, height: number, color: string, rotationRad: number) => {
      const carPoints: Point3D[] = [];
      const halfL = length / 2;
      const halfW = width / 2;

      // 8 corners of the car body bounding box
      const corners = [
        { x: -halfW, y: 0, z: -halfL },
        { x: halfW, y: 0, z: -halfL },
        { x: halfW, y: 0, z: halfL },
        { x: -halfW, y: 0, z: halfL },
        { x: -halfW, y: height, z: -halfL },
        { x: halfW, y: height, z: -halfL },
        { x: halfW, y: height, z: halfL },
        { x: -halfW, y: height, z: halfL },
      ];

      // Rotate corners and translate
      const cosR = Math.cos(rotationRad);
      const sinR = Math.sin(rotationRad);

      const rotatedCorners = corners.map((c) => {
        const rx = c.x * cosR - c.z * sinR;
        const rz = c.x * sinR + c.z * cosR;
        return {
          x: rx + cx,
          y: c.y + cy,
          z: rz + cz,
          color,
          size: 2.0
        };
      });

      // Add corners to points list
      carPoints.push(...rotatedCorners);

      // Create wireframe outlines
      const connect = (i: number, j: number) => {
        lines.push({ p1: rotatedCorners[i], p2: rotatedCorners[j], color, width: 1.2 });
      };

      // Bottom box
      connect(0, 1); connect(1, 2); connect(2, 3); connect(3, 0);
      // Top box
      connect(4, 5); connect(5, 6); connect(6, 7); connect(7, 4);
      // Vertical pillars
      connect(0, 4); connect(1, 5); connect(2, 6); connect(3, 7);

      // Fill car interior with points (surface scan points)
      for (let i = 0; i < 400; i++) {
        const px = (Math.random() - 0.5) * width;
        const py = Math.random() * height;
        const pz = (Math.random() - 0.5) * length;

        // Rotate and translate
        const rx = px * cosR - pz * sinR;
        const rz = px * sinR + pz * cosR;

        // Add some noise to simulate lidar reflection
        const noise = (Math.random() - 0.5) * 0.4;

        points.push({
          x: rx + cx + noise,
          y: py + cy + noise,
          z: rz + cz + noise,
          color: color.replace("1.0", "0.4").replace("0.8", "0.3"),
          size: 1.2
        });
      }
    };

    // 2. Spawn 2 Crashed Vehicles
    // Car A (Sedan) - positioned diagonally crashed
    createCar(15, 0, 10, 36, 18, 14, "rgba(234,88,12,0.85)", Math.PI / 6); // Glowing orange accent
    // Car B (SUV) - side impact
    createCar(-18, 0, -2, 40, 20, 18, "rgba(59,130,246,0.85)", -Math.PI / 4); // Cyan/blue accent

    // 3. Scattered Debris points around the crash center (glowing small particles)
    for (let i = 0; i < 80; i++) {
      const radius = 25 * Math.sqrt(Math.random());
      const angle = Math.random() * Math.PI * 2;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      const y = Math.random() * 1.5; // low to the ground
      
      points.push({
        x,
        y,
        z,
        color: Math.random() > 0.4 ? "rgba(239,68,68,0.7)" : "rgba(253,224,71,0.7)", // Red/yellow debris
        size: 2.0
      });
    }

    pointsRef.current = points;
    linesRef.current = lines;
  }, []);

  // Frame animation loop
  useEffect(() => {
    let animationFrameId: number;

    const drawScene = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Deep grid space background
      ctx.fillStyle = "#020202";
      ctx.fillRect(0, 0, width, height);

      // 3D parameters
      const centerX = width / 2;
      const centerY = height / 2;
      const distance = 250;
      const scale = 260; // Focal length

      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      // Projection function
      const project = (p: Point3D) => {
        // 1. Rotate Y (Yaw)
        const rx1 = p.x * cosY - p.z * sinY;
        const rz1 = p.x * sinY + p.z * cosY;

        // 2. Rotate X (Pitch)
        const ry2 = p.y * cosP - rz1 * sinP;
        const rz2 = p.y * sinP + rz1 * cosP;

        // 3. Perspective Projection
        const factor = scale / (rz2 + distance);
        const px = centerX + rx1 * factor;
        const py = centerY - ry2 * factor; // negative because screen Y is downward

        return {
          x: px,
          y: py,
          depth: rz2,
          visible: rz2 + distance > 10 // clip points too close
        };
      };

      // Sort points by depth for painters algorithm (back-to-front rendering)
      const projectedPoints = pointsRef.current
        .map((p) => ({ original: p, proj: project(p) }))
        .filter((p) => p.proj.visible);

      projectedPoints.sort((a, b) => b.proj.depth - a.proj.depth);

      // Draw grid floor first
      projectedPoints.forEach(({ original, proj }) => {
        // Only draw grid floor particles if below certain height
        if (original.y === 0) {
          ctx.fillStyle = original.color;
          ctx.fillRect(proj.x - (original.size * pointSize)/2, proj.y - (original.size * pointSize)/2, original.size * pointSize, original.size * pointSize);
        }
      });

      // Draw Wireframe Lines if toggled
      if (showWireframe) {
        linesRef.current.forEach((line) => {
          const p1 = project(line.p1);
          const p2 = project(line.p2);

          if (p1.visible && p2.visible) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = line.color;
            ctx.lineWidth = line.width;
            ctx.stroke();
          }
        });
      }

      // Draw car hull points and debris points on top
      projectedPoints.forEach(({ original, proj }) => {
        if (original.y > 0) {
          ctx.fillStyle = original.color;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, original.size * pointSize * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Drawing Lidar Scan crosshair ring (radar effect overlay)
      ctx.strokeStyle = "rgba(234, 88, 12, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 130, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs HUD
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.beginPath();
      ctx.moveTo(centerX - 160, centerY); ctx.lineTo(centerX - 100, centerY);
      ctx.moveTo(centerX + 100, centerY); ctx.lineTo(centerX + 160, centerY);
      ctx.moveTo(centerX, centerY - 100); ctx.lineTo(centerX, centerY - 60);
      ctx.moveTo(centerX, centerY + 60); ctx.lineTo(centerX, centerY + 100);
      ctx.stroke();
    };

    const animate = () => {
      if (isRotating && !dragStartRef.current) {
        setYaw((prev) => (prev + 0.003) % (Math.PI * 2));
      }
      drawScene();
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [yaw, pitch, pointSize, isRotating, showWireframe]);

  // Mouse Drag interaction
  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    dragAngleRef.current = { yaw, pitch };
    setIsRotating(false); // Stop auto rotate while dragging
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!dragStartRef.current) return;
    
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    
    // Scale motion to angle delta
    const nextYaw = (dragAngleRef.current.yaw - dx * 0.007) % (Math.PI * 2);
    const nextPitch = Math.max(-Math.PI/3, Math.min(Math.PI/3, dragAngleRef.current.pitch + dy * 0.007));
    
    setYaw(nextYaw);
    setPitch(nextPitch);
  };

  const handleMouseUp = () => {
    dragStartRef.current = null;
  };

  return (
    <div className="relative border border-white/10 bg-black/90 p-4 font-mono select-none overflow-hidden rounded-sm">
      {/* 3D HUD Indicators */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 text-[10px] tracking-wider text-white/50">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-gc-accent animate-pulse" />
          <select 
            value={activeSensor} 
            onChange={(e) => setActiveSensor(e.target.value)}
            className="bg-transparent text-white border border-white/10 px-2 py-0.5 rounded-none font-mono text-[9px] focus:outline-none"
          >
            <option value="K9-04_LIDAR" className="bg-black">K9-04_LIDAR (ACTIVE)</option>
            <option value="CCTV_042_CAMERA" className="bg-black">CCTV_042 (SOLVED)</option>
            <option value="ORBIT_OVERLAY" className="bg-black">GRID_ORTHO_RECON</option>
          </select>
        </div>
        <div>POINTS: 24,904 // CONFIDENCE: 99.8%</div>
      </div>

      {/* Main 3D Canvas Viewport */}
      <div className="relative mt-3 cursor-grab active:cursor-grabbing border border-white/5">
        <canvas
          ref={canvasRef}
          width={600}
          height={320}
          className="w-full bg-[#020202] aspect-[1.85/1]"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        
        {/* Help label overlay */}
        <div className="absolute bottom-2 left-2 pointer-events-none text-[8px] text-white/30 uppercase tracking-widest bg-black/75 px-1.5 py-0.5 border border-white/5">
          {"Drag mouse to rotate reconstruction"}
        </div>
      </div>

      {/* Viewport controls panel */}
      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/10 pt-3.5 text-[9px] uppercase tracking-widest text-white/40">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span>POINT DENSITY:</span>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={pointSize}
              onChange={(e) => setPointSize(parseFloat(e.target.value))}
              className="w-24 accent-gc-accent cursor-pointer bg-white/10 rounded-none h-1"
            />
          </div>
          <div className="flex items-center justify-between">
            <span>AUTO-ROTATE:</span>
            <button
              onClick={() => setIsRotating(!isRotating)}
              className={`border border-white/15 px-3 py-1 font-mono text-[9px] transition-colors ${
                isRotating ? "bg-white text-black font-semibold border-white" : "text-white hover:bg-white/5"
              }`}
            >
              {isRotating ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        <div className="space-y-2.5 pl-4 border-l border-white/10">
          <div className="flex items-center justify-between">
            <span>WIREFRAME MODEL:</span>
            <button
              onClick={() => setShowWireframe(!showWireframe)}
              className={`border border-white/15 px-3 py-1 font-mono text-[9px] transition-colors ${
                showWireframe ? "bg-white text-black font-semibold border-white" : "text-white hover:bg-white/5"
              }`}
            >
              {showWireframe ? "SHOW" : "HIDE"}
            </button>
          </div>
          <div className="flex items-center justify-between text-white/30">
            <span>COORD SHIFT:</span>
            <span>[X:0.24 Y:0.00 Z:-0.19]</span>
          </div>
        </div>
      </div>
    </div>
  );
}
