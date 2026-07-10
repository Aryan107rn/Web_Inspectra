import { GlassCard } from "@/components/ui/GlassCard";
import type { DetectedTechnology } from "@/lib/types";

export function TechnologyBadgeCard({ technology }: { technology: DetectedTechnology }) {
  return (
    <GlassCard hoverable className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-base font-semibold text-ink-100">{technology.name}</p>
          <p className="text-xs capitalize text-scan-cyan">{technology.category}</p>
        </div>
        {technology.version && (
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-ink-400">v{technology.version}</span>
        )}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-400">{technology.description}</p>
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-[11px] text-ink-400">
          <span>Confidence</span>
          <span>{technology.confidencePercent}%</span>
        </div>
        <div className="h-1 rounded-full bg-white/5">
          <div className="h-full rounded-full bg-scan-cyan" style={{ width: `${technology.confidencePercent}%` }} />
        </div>
      </div>
    </GlassCard>
  );
}
