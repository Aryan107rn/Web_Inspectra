export type IssueSeverity = "critical" | "serious" | "moderate" | "minor";

export interface AccessibilityIssue {
  id: string;
  severity: IssueSeverity;
  issue: string;
  explanation: string;
  recommendation: string;
  affectedElements: number;
  wcagCriterion: string;
}
