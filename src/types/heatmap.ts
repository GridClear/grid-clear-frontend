export interface HeatmapCell {
  h3Index: string;
  count: number;
  score: number;       // log-normalized 0–1
  tier: 'low' | 'medium' | 'high' | 'critical';
  centroid: [lng: number, lat: number];
}
