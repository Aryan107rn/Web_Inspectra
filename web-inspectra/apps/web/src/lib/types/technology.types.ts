export type TechnologyCategory =
  | "framework"
  | "library"
  | "styling"
  | "hosting"
  | "analytics"
  | "cdn"
  | "backend";

export interface DetectedTechnology {
  id: string;
  name: string;
  category: TechnologyCategory;
  confidencePercent: number;
  version?: string;
  description: string;
}
