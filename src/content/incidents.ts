/** Static incidents data for the GridClear Mission Control Dashboard */

export interface Incident {
  id: string;
  intersection: string;
  timestamp: string;
  status: "Scouting" | "Modeling" | "Ready for Review" | "Cleared";
  costPerMinute: number;
  projectedDuration: string; // e.g. "45 min"
  x: number; // percentage width on map container
  y: number; // percentage height on map container
  description: string;
  cctvImage: string;
  robodogImages: string[];
}

export const incidents: Incident[] = [
  {
    id: "GC-INC-084",
    intersection: "King & Bloor",
    timestamp: "5:39 AM",
    status: "Scouting",
    costPerMinute: 4820,
    projectedDuration: "90 min",
    x: 68,
    y: 35,
    description: "Two-vehicle collision at north-east intersection. Debris scattered across crosswalk. Robodog unit K9-04 active on scene capturing point-cloud perimeter.",
    cctvImage: "/cctv_king_bloor.png",
    robodogImages: [
      "/scout_king_bloor_1.png",
      "/scout_king_bloor_2.png",
      "/scout_king_bloor_3.png"
    ]
  },
  {
    id: "GC-INC-085",
    intersection: "Yonge & Dundas",
    timestamp: "4:12 AM",
    status: "Modeling",
    costPerMinute: 3250,
    projectedDuration: "60 min",
    x: 52,
    y: 55,
    description: "Single vehicle collision with utility pole. Traffic light signal out. Depth scan in progress by Robodog unit K9-02; 3D mesh reconstruction 45% complete.",
    cctvImage: "/cctv_yonge_dundas.png",
    robodogImages: [
      "/scout_yonge_dundas_1.png",
      "/scout_yonge_dundas_2.png"
    ]
  },
  {
    id: "GC-INC-086",
    intersection: "Spadina & Queen",
    timestamp: "3:45 AM",
    status: "Ready for Review",
    costPerMinute: 6100,
    projectedDuration: "45 min",
    x: 34,
    y: 65,
    description: "Multi-vehicle rear-end collision. Major delays on Queen street. Detours active. 3D point cloud fused with live traffic feed. Ready for commander clearance sign-off.",
    cctvImage: "/cctv_spadina_queen.png",
    robodogImages: [
      "/scout_spadina_queen_1.png",
      "/scout_spadina_queen_2.png",
      "/scout_spadina_queen_3.png"
    ]
  }
];
