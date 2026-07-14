export type RecommendationPriority = "high" | "medium" | "low";

export interface AiRecommendation {
  id: string;
  issue: string;
  plainLanguageExplanation: string;
  priority: RecommendationPriority;
  suggestedFix: string;
  expectedImprovement: string;
}
