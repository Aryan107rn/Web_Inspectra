"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { useCountUpValue } from "@/hooks/useCountUpValue";
import type { WebsiteHealthScore } from "@/lib/types";

const gradeSubScores: { key: keyof WebsiteHealthScore; label: string }[] = [
  { key: "performanceScore", label: "Performance" },
  { key: "accessibilityScore", label: "Accessibility" },
  { key: "securityScore", label: "Security" },
  { key: "bestPracticesScore", label: "Best Practices" },
];

export function WebsiteHealthScoreCard({ healthScore }: { healthScore: WebsiteHealthScore }) {
  const animatedScore = useCountUpValue(healthScore.overallScore);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - healthScore.overallScore / 100);

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <svg width={140} height={140} viewBox="0 0 140 140" role="img" aria-label="Overall website health score">
          <circle cx={70} cy={70} r={54} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={10} />
          <circle
            cx={70}
            cy={70}
            r={54}
            fill="none"
            stroke="#4cd9e0"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 70 70)"
          />
          <text x={70} y={66} textAnchor="middle" className="fill-ink-100 font-display" fontSize="30" fontWeight={700}>
            {animatedScore}
          </text>
          <text x={70} y={88} textAnchor="middle" className="fill-ink-400" fontSize="11">
            Grade {healthScore.grade}
          </text>
        </svg>

        <div className="w-full flex-1 space-y-3">
          {gradeSubScores.map(({ key, label }) => {
            const value = healthScore[key] as number;
            return (
              <div key={key}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-ink-400">{label}</span>
                  <span className="text-ink-100">{value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-scan-cyan" style={{ width: `${value}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
