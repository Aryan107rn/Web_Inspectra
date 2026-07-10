import type { CoreWebVital, PerformanceReport, ResourceUsageSample, WaterfallResourceEntry } from "@/lib/types";

const coreWebVitalsMockData: CoreWebVital[] = [
  { id: "lcp", label: "Largest Contentful Paint", value: 2100, unit: "ms", rating: "needs-improvement", benchmarkGood: 2500, benchmarkPoor: 4000 },
  { id: "fcp", label: "First Contentful Paint", value: 980, unit: "ms", rating: "good", benchmarkGood: 1800, benchmarkPoor: 3000 },
  { id: "cls", label: "Cumulative Layout Shift", value: 0.06, unit: "score", rating: "good", benchmarkGood: 0.1, benchmarkPoor: 0.25 },
  { id: "inp", label: "Interaction to Next Paint", value: 180, unit: "ms", rating: "good", benchmarkGood: 200, benchmarkPoor: 500 },
  { id: "tti", label: "Time to Interactive", value: 3200, unit: "ms", rating: "needs-improvement", benchmarkGood: 3800, benchmarkPoor: 7300 },
];

const resourceUsageMockData: ResourceUsageSample[] = Array.from({ length: 24 }, (_, i) => ({
  timestampMs: i * 250,
  cpuPercent: Math.round(18 + Math.sin(i / 2.4) * 14 + (i > 14 ? 20 : 0) + Math.random() * 6),
  memoryMb: Math.round(42 + i * 1.6 + Math.random() * 4),
}));

const waterfallMockData: WaterfallResourceEntry[] = [
  { id: "res-1", name: "/", type: "document", startMs: 0, durationMs: 220, sizeKb: 18 },
  { id: "res-2", name: "main.css", type: "stylesheet", startMs: 90, durationMs: 140, sizeKb: 46 },
  { id: "res-3", name: "app.bundle.js", type: "script", startMs: 130, durationMs: 410, sizeKb: 312, blocked: true },
  { id: "res-4", name: "hero-banner.webp", type: "image", startMs: 260, durationMs: 260, sizeKb: 184 },
  { id: "res-5", name: "Inter-var.woff2", type: "font", startMs: 300, durationMs: 90, sizeKb: 62 },
  { id: "res-6", name: "/api/products", type: "xhr", startMs: 540, durationMs: 320, sizeKb: 21 },
  { id: "res-7", name: "analytics.js", type: "script", startMs: 620, durationMs: 180, sizeKb: 38 },
  { id: "res-8", name: "product-grid.webp", type: "image", startMs: 680, durationMs: 210, sizeKb: 96 },
];

export const performanceReportMockData: PerformanceReport = {
  vitals: coreWebVitalsMockData,
  resourceUsage: resourceUsageMockData,
  waterfall: waterfallMockData,
};
