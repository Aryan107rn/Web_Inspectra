import { GlassCard } from "./GlassCard";
import { cn } from "@/lib/utils/cn";
import type { QuickMetric } from "@/lib/types";

const toneClassMap: Record<NonNullable<QuickMetric["tone"]>, string> = {
  positive: "text-scan-green",
  negative: "text-scan-red",
  neutral: "text-ink-400",
};

const trendGlyphMap: Record<NonNullable<QuickMetric["trend"]>, string> = {
  up: "\u2191",
  down: "\u2193",
  flat: "\u2192",
};

export function MetricCard({ metric }: { metric: QuickMetric }) {
  return (
    <GlassCard hoverable className="p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-ink-400">{metric.label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink-100">{metric.value}</p>
      {metric.trendLabel && metric.trend && (
        <p className={cn("mt-1.5 text-xs font-medium", toneClassMap[metric.tone ?? "neutral"])}>
          {trendGlyphMap[metric.trend]} {metric.trendLabel}
        </p>
      )}
    </GlassCard>
  );
}
