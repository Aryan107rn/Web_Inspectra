export type ScanStatus = "idle" | "queued" | "scanning" | "completed" | "failed";

export type HealthGrade = "A" | "B" | "C" | "D" | "F";

export interface WebsiteScanRequest {
  url: string;
  requestedAt: string;
}

export interface WebsiteHealthScore {
  overallScore: number; // 0-100
  grade: HealthGrade;
  performanceScore: number;
  accessibilityScore: number;
  securityScore: number;
  bestPracticesScore: number;
}

export interface ScanSummary {
  scanId: string;
  targetUrl: string;
  scannedAt: string;
  status: ScanStatus;
  healthScore: WebsiteHealthScore;
  totalRequests: number;
  totalTransferSizeKb: number;
  totalDomNodes: number;
  technologiesDetected: number;
  accessibilityIssues: number;
  securityWarnings: number;
}

export interface QuickMetric {
  id: string;
  label: string;
  value: string;
  trend?: "up" | "down" | "flat";
  trendLabel?: string;
  tone?: "positive" | "negative" | "neutral";
}
