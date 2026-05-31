import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { ConsoleShell } from "@/components/layout/ConsoleShell";

export const metadata: Metadata = {
  title: "KSI Collision Map — GridClear",
  description:
    "Interactive heatmap of Toronto's killed or seriously injured (KSI) motor-vehicle collisions, sourced live from Toronto Open Data.",
};

const CollisionMap = dynamic(
  () => import("@/components/collision-map/CollisionMap"),
  { ssr: false },
);

export default function CollisionMapPage() {
  return (
    <ConsoleShell
      title="// KSI COLLISION MAP // TORONTO"
      status={
        <>
          <span className="hidden lg:inline">Motor vehicle · KSI</span>
          <span className="hidden lg:inline text-white/15">|</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
            Toronto Open Data
          </span>
        </>
      }
    >
      {/*
        relative + flex-1 + min-h-0: gives this div a definite height from the
        flex layout. The absolute inset-0 child then fills it exactly — this is
        what MapLibre needs; h-full alone doesn't resolve in all flex chains.
      */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <div className="absolute inset-0">
          <CollisionMap />
        </div>
      </div>
    </ConsoleShell>
  );
}
