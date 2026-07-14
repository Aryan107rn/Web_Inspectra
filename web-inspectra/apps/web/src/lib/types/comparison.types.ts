export interface ComparisonMetric {
  category: "Performance" | "Accessibility" | "Security" | "Technologies" | "Resources" | "Loading Behaviour" | "Network Requests";
  siteAScore: number;
  siteBScore: number;
  unit?: string;
}

export interface ComparisonSite {
  url: string;
  faviconLabel: string;
}

export interface WebsiteComparisonData {
  siteA: ComparisonSite;
  siteB: ComparisonSite;
  metrics: ComparisonMetric[];
}
