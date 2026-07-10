import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { AiRecommendation } from "@/lib/types";

const priorityToneMap: Record<AiRecommendation["priority"], "fail" | "warning" | "neutral"> = {
  high: "fail",
  medium: "warning",
  low: "neutral",
};

export function AiRecommendationCard({ recommendation }: { recommendation: AiRecommendation }) {
  return (
    <GlassCard className="border-scan-violet/20 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-base font-semibold text-ink-100">{recommendation.issue}</p>
        <StatusBadge tone={priorityToneMap[recommendation.priority]}>{recommendation.priority} priority</StatusBadge>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-400">{recommendation.plainLanguageExplanation}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-white/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-scan-violet">Suggested Fix</p>
          <p className="mt-1 text-sm text-ink-300">{recommendation.suggestedFix}</p>
        </div>
        <div className="rounded-lg border border-line bg-white/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-scan-green">Expected Improvement</p>
          <p className="mt-1 text-sm text-ink-300">{recommendation.expectedImprovement}</p>
        </div>
      </div>
    </GlassCard>
  );
}
