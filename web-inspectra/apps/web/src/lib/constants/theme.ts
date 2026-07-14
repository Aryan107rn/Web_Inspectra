export const scanThemeColors = {
  void: "#06090c",
  panel: "#0b1116",
  raised: "#111922",
  cyan: "#4cd9e0",
  violet: "#8b7ff0",
  amber: "#f0b84c",
  red: "#f0616b",
  green: "#4ce0a0",
  ink100: "#f4f6f7",
  ink400: "#8a97a0",
  line: "rgba(255,255,255,0.08)",
} as const;

export const severityColorMap = {
  critical: scanThemeColors.red,
  serious: scanThemeColors.amber,
  moderate: scanThemeColors.violet,
  minor: scanThemeColors.ink400,
} as const;

export const statusColorMap = {
  pass: scanThemeColors.green,
  warning: scanThemeColors.amber,
  fail: scanThemeColors.red,
} as const;

export const ratingColorMap = {
  good: scanThemeColors.green,
  "needs-improvement": scanThemeColors.amber,
  poor: scanThemeColors.red,
} as const;
