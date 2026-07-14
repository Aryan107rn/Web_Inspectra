export interface CoreWebVital {
  id: "lcp" | "fcp" | "cls" | "inp" | "tti";
  label: string;
  value: number;
  unit: "ms" | "score" | "s";
  rating: "good" | "needs-improvement" | "poor";
  benchmarkGood: number;
  benchmarkPoor: number;
}

export interface ResourceUsageSample {
  timestampMs: number;
  cpuPercent: number;
  memoryMb: number;
}

export interface WaterfallResourceEntry {
  id: string;
  name: string;
  type: "document" | "script" | "stylesheet" | "image" | "font" | "xhr" | "other";
  startMs: number;
  durationMs: number;
  sizeKb: number;
  blocked?: boolean;
}

export interface PerformanceReport {
  vitals: CoreWebVital[];
  resourceUsage: ResourceUsageSample[];
  waterfall: WaterfallResourceEntry[];
}
