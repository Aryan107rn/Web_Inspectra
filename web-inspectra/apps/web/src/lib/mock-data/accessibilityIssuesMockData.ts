import type { AccessibilityIssue } from "@/lib/types";

export const accessibilityIssuesMockData: AccessibilityIssue[] = [
  {
    id: "a11y-1",
    severity: "critical",
    issue: "Images missing alt text",
    explanation: "Screen readers cannot describe these images to visually impaired visitors, so the content is effectively invisible to them.",
    recommendation: "Add a concise alt attribute describing each image's purpose, or alt=\"\" for purely decorative images.",
    affectedElements: 4,
    wcagCriterion: "1.1.1 Non-text Content",
  },
  {
    id: "a11y-2",
    severity: "serious",
    issue: "Low color contrast on body text",
    explanation: "Text at this contrast ratio is difficult to read for users with low vision or in bright environments.",
    recommendation: "Increase contrast to at least 4.5:1 between text and background colors.",
    affectedElements: 12,
    wcagCriterion: "1.4.3 Contrast (Minimum)",
  },
  {
    id: "a11y-3",
    severity: "moderate",
    issue: "Buttons without accessible names",
    explanation: "Icon-only buttons with no label leave keyboard and screen reader users unsure what the control does.",
    recommendation: "Add aria-label or visually hidden text describing the button's action.",
    affectedElements: 3,
    wcagCriterion: "4.1.2 Name, Role, Value",
  },
  {
    id: "a11y-4",
    severity: "minor",
    issue: "Redundant link text",
    explanation: "Multiple 'Click here' links make navigation confusing when read out of context by assistive technology.",
    recommendation: "Use descriptive link text that makes sense on its own.",
    affectedElements: 2,
    wcagCriterion: "2.4.4 Link Purpose",
  },
];
