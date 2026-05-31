"use client";

import { useEffect, useRef, useState } from "react";
import type { Viewer } from "@mkkellogg/gaussian-splats-3d";

type RenderMode = "ply" | "splat";
const RENDER_MODE: RenderMode = "ply";

const SPLAT_URL = "/incident-reconstruction.splat";
const SPLAT_STRIDE = 32;
const DEFAULT_PLY_URL = "/scene.ply";

interface SceneBounds {
  center: [number, number, number];
  radius: number;
}

function estimateSplatBounds(buffer: ArrayBuffer): SceneBounds {
  const view = new DataView(buffer);
  const count = Math.floor(buffer.byteLength / SPLAT_STRIDE);
  const step = Math.max(1, Math.floor(count / 16000));

  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;
  let n = 0;

  const xs: number[] = [];
  const ys: number[] = [];
  const zs: number[] = [];

  for (let i = 0; i < count; i += step) {
    const offset = i * SPLAT_STRIDE;
    const x = view.getFloat32(offset, true);
    const y = view.getFloat32(offset + 4, true);
    const z = view.getFloat32(offset + 8, true);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;
    sumX += x;
    sumY += y;
    sumZ += z;
    xs.push(x);
    ys.push(y);
    zs.push(z);
    n++;
  }

  if (n === 0) return { center: [0, 0, 0], radius: 1 };

  const center: [number, number, number] = [sumX / n, sumY / n, sumZ / n];

  const dists = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - center[0];
    const dy = ys[i] - center[1];
    const dz = zs[i] - center[2];
    dists[i] = Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  dists.sort((a, b) => a - b);
  const radius = dists[Math.min(dists.length - 1, Math.floor(dists.length * 0.6))];

  return { center, radius: Math.max(radius, 0.5) };
}

function estimatePositionBounds(positions: ArrayLike<number>): SceneBounds {
  const total = Math.floor(positions.length / 3);
  if (total === 0) return { center: [0, 0, 0], radius: 1 };
  const step = Math.max(1, Math.floor(total / 16000));

  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;
  let n = 0;
  const sx: number[] = [];
  const sy: number[] = [];
  const sz: number[] = [];

  for (let i = 0; i < total; i += step) {
    const o = i * 3;
    const x = positions[o];
    const y = positions[o + 1];
    const z = positions[o + 2];
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;
    sumX += x;
    sumY += y;
    sumZ += z;
    sx.push(x);
    sy.push(y);
    sz.push(z);
    n++;
  }
  if (n === 0) return { center: [0, 0, 0], radius: 1 };

  const center: [number, number, number] = [sumX / n, sumY / n, sumZ / n];
  const dists = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    const dx = sx[i] - center[0];
    const dy = sy[i] - center[1];
    const dz = sz[i] - center[2];
    dists[i] = Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  dists.sort((a, b) => a - b);
  const radius = dists[Math.min(dists.length - 1, Math.floor(dists.length * 0.6))];

  return { center, radius: Math.max(radius, 0.5) };
}

function computeCameraPlacement(bounds: SceneBounds): {
  position: [number, number, number];
  lookAt: [number, number, number];
} {
  const [cx, cy, cz] = bounds.center;
  const distance = bounds.radius * 0.9;
  return {
    position: [cx + distance * 0.3, cy + distance * 0.15, cz + distance],
    lookAt: [cx, cy, cz],
  };
}

export function ThreeDViewer({ plyUrl = DEFAULT_PLY_URL }: { plyUrl?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pointCount, setPointCount] = useState<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let blobUrl: string | null = null;
    let viewer: Viewer | null = null;
    let cleanupPly: (() => void) | null = null;

    (async () => {
      try {
        if (RENDER_MODE === "ply") {
          const [THREE, plyMod, orbitMod, res] = await Promise.all([
            import("three"),
            import("three/examples/jsm/loaders/PLYLoader.js"),
            import("three/examples/jsm/controls/OrbitControls.js"),
            fetch(plyUrl),
          ]);
          if (!res.ok) throw new Error(`Failed to fetch ply: ${res.status}`);

          const buffer = await res.arrayBuffer();
          if (disposed) return;

          const loader = new plyMod.PLYLoader();
          const geometry = loader.parse(buffer);
          geometry.computeBoundingSphere();

          const posAttr = geometry.getAttribute("position");
          const bounds = estimatePositionBounds(posAttr.array as Float32Array);
          const placement = computeCameraPlacement(bounds);

          const scene = new THREE.Scene();
          const width = container.clientWidth || 1;
          const height = container.clientHeight || 1;

          const camera = new THREE.PerspectiveCamera(
            60,
            width / height,
            0.01,
            Math.max(bounds.radius * 50, 100)
          );
          camera.position.set(placement.position[0], placement.position[1], placement.position[2]);
          camera.lookAt(placement.lookAt[0], placement.lookAt[1], placement.lookAt[2]);

          const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
          renderer.setPixelRatio(window.devicePixelRatio);
          renderer.setSize(width, height);
          renderer.setClearColor(0x000000, 1);
          container.appendChild(renderer.domElement);

          const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: Math.max(bounds.radius * 0.004, 0.005),
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.95,
            depthWrite: false,
          });
          const points = new THREE.Points(geometry, material);

          const group = new THREE.Group();
          group.add(points);
          group.rotation.y = Math.random() * Math.PI * 2;
          scene.add(group);

          const controls = new orbitMod.OrbitControls(camera, renderer.domElement);
          controls.enablePan = false;
          controls.enableRotate = true;
          controls.enableZoom = true;
          controls.enableDamping = true;
          controls.dampingFactor = 0.05;
          controls.target.set(placement.lookAt[0], placement.lookAt[1], placement.lookAt[2]);
          controls.update();

          const ro = new ResizeObserver(() => {
            const w = container.clientWidth || 1;
            const h = container.clientHeight || 1;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          });
          ro.observe(container);

          let rafId = 0;
          const animate = () => {
            if (disposed) return;
            rafId = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
          };

          cleanupPly = () => {
            cancelAnimationFrame(rafId);
            ro.disconnect();
            controls.dispose();
            geometry.dispose();
            material.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode === container) {
              container.removeChild(renderer.domElement);
            }
          };

          setPointCount(posAttr.count);
          animate();
          setLoading(false);
          return;
        }

        if (RENDER_MODE === "splat") {
          const [GaussianSplats3D, splatRes] = await Promise.all([
            import("@mkkellogg/gaussian-splats-3d"),
            fetch(SPLAT_URL),
          ]);
          if (!splatRes.ok) throw new Error(`Failed to fetch splat: ${splatRes.status}`);

          const splatBuffer = await splatRes.arrayBuffer();
          const bounds = estimateSplatBounds(splatBuffer);
          const placement = computeCameraPlacement(bounds);
          blobUrl = URL.createObjectURL(
            new Blob([splatBuffer], { type: "application/octet-stream" })
          );

          if (disposed) return;

          viewer = new GaussianSplats3D.Viewer({
            rootElement: container,
            useBuiltInControls: true,
            selfDrivenMode: true,
            sharedMemoryForWorkers: false,
            gpuAcceleratedSort: false,
            sceneRevealMode: GaussianSplats3D.SceneRevealMode.Instant,
            logLevel: GaussianSplats3D.LogLevel.None,
            initialCameraPosition: placement.position,
            initialCameraLookAt: placement.lookAt,
          });

          await viewer.addSplatScene(blobUrl, {
            showLoadingUI: false,
            splatAlphaRemovalThreshold: 1,
            format: GaussianSplats3D.SceneFormat.Splat,
          });

          if (disposed) {
            await viewer.dispose();
            return;
          }

          const controls = viewer.controls;
          if (controls) {
            controls.enablePan = false;
            controls.enableRotate = true;
            controls.enableZoom = true;
            controls.enableDamping = true;
            controls.target.set(
              placement.lookAt[0],
              placement.lookAt[1],
              placement.lookAt[2]
            );
            controls.update();
          }

          viewer.camera.position.set(
            placement.position[0],
            placement.position[1],
            placement.position[2]
          );
          viewer.camera.lookAt(
            placement.lookAt[0],
            placement.lookAt[1],
            placement.lookAt[2]
          );
          viewer.camera.updateProjectionMatrix?.();

          setPointCount(viewer.getSplatMesh()?.getSplatCount?.() ?? null);
          viewer.start();
          setLoading(false);
        }
      } catch {
        if (!disposed) {
          setError("Failed to load 3D reconstruction");
          setLoading(false);
        }
      }
    })();

    return () => {
      disposed = true;
      if (cleanupPly) cleanupPly();
      if (viewer) {
        viewer.stop?.();
        void viewer.dispose?.();
      }
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [plyUrl]);

  const pointLabel =
    pointCount !== null ? pointCount.toLocaleString() : "—";
  const formatLabel = RENDER_MODE === "ply" ? "PLY POINT CLOUD" : "GAUSSIAN SPLAT";
  const loadingLabel =
    RENDER_MODE === "ply"
      ? "Loading point cloud reconstruction..."
      : "Loading Gaussian splat reconstruction...";

  return (
    <div className="relative border border-white/10 bg-black/90 p-4 font-mono select-none overflow-hidden rounded-sm">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 text-[10px] tracking-wider text-white/50">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-gc-accent animate-pulse" />
          <span className="bg-transparent text-white border border-white/10 px-2 py-0.5 rounded-none font-mono text-[9px]">
            K9-04_LIDAR (ACTIVE)
          </span>
        </div>
        <div>
          POINTS: {pointLabel}
          {" // CONFIDENCE: 99.8%"}
        </div>
      </div>

      <div className="relative mt-3 border border-white/5 overflow-hidden">
        <div
          ref={containerRef}
          className="w-full bg-[#020202] aspect-[1.85/1] min-h-[200px]"
        />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#020202]/90 pointer-events-none">
            <span className="text-[9px] uppercase tracking-widest text-white/40 animate-pulse">
              {loadingLabel}
            </span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#020202]/95 pointer-events-none">
            <span className="text-[9px] uppercase tracking-widest text-gc-accent">{error}</span>
          </div>
        )}

        <div className="absolute bottom-2 left-2 pointer-events-none text-[8px] text-white/30 uppercase tracking-widest bg-black/75 px-1.5 py-0.5 border border-white/5">
          Drag to look · Scroll to zoom
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/10 pt-3.5 text-[9px] uppercase tracking-widest text-white/40">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span>VIEW MODE:</span>
            <span className="text-white/70">ORBIT</span>
          </div>
          <div className="flex items-center justify-between">
            <span>INTERACTION:</span>
            <span className="text-white/70">MOUSE (LOOK + ZOOM)</span>
          </div>
        </div>

        <div className="space-y-2.5 pl-4 border-l border-white/10">
          <div className="flex items-center justify-between">
            <span>FORMAT:</span>
            <span className="text-white/70">{formatLabel}</span>
          </div>
          <div className="flex items-center justify-between text-white/30">
            <span>CAMERA:</span>
            <span>ORBIT / CENTERED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
