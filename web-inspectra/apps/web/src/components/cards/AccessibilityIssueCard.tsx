import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { AccessibilityIssue } from "@/lib/types";

const severityToneMap: Record<AccessibilityIssue["severity"], "fail" | "warning" | "info" | "neutral"> = {
  critical: "fail",
  serious: "warning",
  moderate: "info",
  minor: "neutral",
};

export function AccessibilityIssueCard({ issue }: { issue: AccessibilityIssue }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-base font-semibold text-ink-100">{issue.issue}</p>
        <StatusBadge tone={severityToneMap[issue.severity]}>{issue.severity}</StatusBadge>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-400">{issue.explanation}</p>
      <div className="mt-4 rounded-lg border border-line bg-white/5 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-scan-cyan">Recommendation</p>
        <p className="mt-1 text-sm text-ink-300">{issue.recommendation}</p>
      </div>
      <div className="mt-3 flex justify-between text-[11px] text-ink-600">
        <span>{issue.wcagCriterion}</span>
        <span>{issue.affectedElements} elements affected</span>
      </div>
    </GlassCard>
  );
}
