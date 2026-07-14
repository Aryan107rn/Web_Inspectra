import type {
  AccessibilityIssue,
  AiRecommendation,
  DetectedTechnology,
  DomExplorerData,
  NetworkGraphData,
  PerformanceReport,
  QuickMetric,
  ScanSummary,
  SecurityInsight,
  TimelineEvent,
  WebsiteComparisonData,
} from "@/lib/types";
import {
  accessibilityIssuesMockData,
  aiRecommendationsMockData,
  detectedTechnologiesMockData,
  domExplorerMockData,
  networkGraphMockData,
  performanceReportMockData,
  quickMetricsMockData,
  scanSummaryMockData,
  securityInsightsMockData,
  timelineEventsMockData,
  websiteComparisonMockData,
} from "@/lib/mock-data";
import { apiGet, simulateNetworkDelay, USE_MOCK_DATA } from "./apiClient";

/**
 * websiteScanService is the single integration boundary between the UI and
 * the scanning backend (owned by a separate team). Every function currently
 * resolves mock data; swapping `USE_MOCK_DATA` to false routes the same
 * function signatures through `apiGet`, so no consuming component changes.
 */
export const websiteScanService = {
  async getScanSummary(scanId: string): Promise<ScanSummary> {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay();
      return { ...scanSummaryMockData, scanId };
    }
    return apiGet<ScanSummary>(`/scans/${scanId}/summary`);
  },

  async getQuickMetrics(scanId: string): Promise<QuickMetric[]> {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay();
      return quickMetricsMockData;
    }
    return apiGet<QuickMetric[]>(`/scans/${scanId}/quick-metrics`);
  },

  async getPerformanceReport(scanId: string): Promise<PerformanceReport> {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay();
      return performanceReportMockData;
    }
    return apiGet<PerformanceReport>(`/scans/${scanId}/performance`);
  },

  async getNetworkGraph(scanId: string): Promise<NetworkGraphData> {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay();
      return networkGraphMockData;
    }
    return apiGet<NetworkGraphData>(`/scans/${scanId}/network`);
  },

  async getDomExplorerData(scanId: string): Promise<DomExplorerData> {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay();
      return domExplorerMockData;
    }
    return apiGet<DomExplorerData>(`/scans/${scanId}/dom`);
  },

  async getDetectedTechnologies(scanId: string): Promise<DetectedTechnology[]> {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay();
      return detectedTechnologiesMockData;
    }
    return apiGet<DetectedTechnology[]>(`/scans/${scanId}/technologies`);
  },

  async getAccessibilityIssues(scanId: string): Promise<AccessibilityIssue[]> {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay();
      return accessibilityIssuesMockData;
    }
    return apiGet<AccessibilityIssue[]>(`/scans/${scanId}/accessibility`);
  },

  async getSecurityInsights(scanId: string): Promise<SecurityInsight[]> {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay();
      return securityInsightsMockData;
    }
    return apiGet<SecurityInsight[]>(`/scans/${scanId}/security`);
  },

  async getAiRecommendations(scanId: string): Promise<AiRecommendation[]> {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay();
      return aiRecommendationsMockData;
    }
    return apiGet<AiRecommendation[]>(`/scans/${scanId}/ai-doctor`);
  },

  async getTimelineEvents(scanId: string): Promise<TimelineEvent[]> {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay();
      return timelineEventsMockData;
    }
    return apiGet<TimelineEvent[]>(`/scans/${scanId}/timeline`);
  },

  async getComparison(scanIdA: string, scanIdB: string): Promise<WebsiteComparisonData> {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay();
      return websiteComparisonMockData;
    }
    return apiGet<WebsiteComparisonData>(`/comparisons?a=${scanIdA}&b=${scanIdB}`);
  },

  async submitScanRequest(url: string): Promise<{ scanId: string }> {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay(600, 1200);
      return { scanId: scanSummaryMockData.scanId };
    }
    return apiGet<{ scanId: string }>(`/scans?url=${encodeURIComponent(url)}`);
  },
};
