import type { WebsiteComparisonData } from "@/lib/types";

export const websiteComparisonMockData: WebsiteComparisonData = {
  siteA: { url: "example.com", faviconLabel: "EX" },
  siteB: { url: "competitor.dev", faviconLabel: "CD" },
  metrics: [
    { category: "Performance", siteAScore: 82, siteBScore: 74 },
    { category: "Accessibility", siteAScore: 91, siteBScore: 88 },
    { category: "Security", siteAScore: 88, siteBScore: 95 },
    { category: "Technologies", siteAScore: 11, siteBScore: 9, unit: "detected" },
    { category: "Resources", siteAScore: 2340, siteBScore: 3120, unit: "KB" },
    { category: "Loading Behaviour", siteAScore: 2100, siteBScore: 2600, unit: "ms" },
    { category: "Network Requests", siteAScore: 64, siteBScore: 81, unit: "requests" },
  ],
};
