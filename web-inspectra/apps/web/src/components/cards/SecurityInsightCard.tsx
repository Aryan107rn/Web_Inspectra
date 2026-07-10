import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { SecurityInsight } from "@/lib/types";

export function SecurityInsightCard({ insight }: { insight: SecurityInsight }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-base font-semibold text-ink-100">{insight.label}</p>
        <StatusBadge tone={insight.status}>{insight.status}</StatusBadge>
      </div>
      <p className="mt-2 text-sm text-ink-300">{insight.summary}</p>
      <p className="mt-2 text-xs leading-relaxed text-ink-400">{insight.detail}</p>
    </GlassCard>
  );
}
