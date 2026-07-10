import type { QuickMetric, ScanSummary } from "@/lib/types";

export const scanSummaryMockData: ScanSummary = {
  scanId: "scan_8f2a1c",
  targetUrl: "https://example.com",
  scannedAt: new Date().toISOString(),
  status: "completed",
  healthScore: {
    overallScore: 87,
    grade: "B",
    performanceScore: 82,
    accessibilityScore: 91,
    securityScore: 88,
    bestPracticesScore: 86,
  },
  totalRequests: 64,
  totalTransferSizeKb: 2340,
  totalDomNodes: 812,
  technologiesDetected: 11,
  accessibilityIssues: 6,
  securityWarnings: 3,
};

export const quickMetricsMockData: QuickMetric[] = [
  { id: "requests", label: "Total Requests", value: "64", trend: "down", trendLabel: "-8 vs last scan", tone: "positive" },
  { id: "transfer", label: "Page Weight", value: "2.34 MB", trend: "up", trendLabel: "+120 KB", tone: "negative" },
  { id: "dom-nodes", label: "DOM Nodes", value: "812", trend: "flat", trendLabel: "no change", tone: "neutral" },
  { id: "load-time", label: "Full Load Time", value: "2.1 s", trend: "down", trendLabel: "-0.4s faster", tone: "positive" },
];
