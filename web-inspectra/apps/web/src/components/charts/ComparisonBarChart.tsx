"use client";

import { scaleLinear } from "d3";
import type { ComparisonMetric, ComparisonSite } from "@/lib/types";

export function ComparisonBarChart({
  metrics,
  siteA,
  siteB,
}: {
  metrics: ComparisonMetric[];
  siteA: ComparisonSite;
  siteB: ComparisonSite;
}) {
  const width = 640;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end gap-6 text-xs">
        <span className="flex items-center gap-1.5 text-ink-300"><span className="h-2.5 w-2.5 rounded-sm bg-scan-cyan" />{siteA.url}</span>
        <span className="flex items-center gap-1.5 text-ink-300"><span className="h-2.5 w-2.5 rounded-sm bg-scan-violet" />{siteB.url}</span>
      </div>

      {metrics.map((metric) => {
        const maxValue = Math.max(metric.siteAScore, metric.siteBScore) * 1.1 || 1;
        const xScale = scaleLinear().domain([0, maxValue]).range([0, width]);

        return (
          <div key={metric.category}>
            <p className="mb-2 text-sm font-medium text-ink-100">{metric.category}</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <div className="h-3 rounded-full bg-scan-cyan" style={{ width: xScale(metric.siteAScore) }} />
                <span className="text-xs text-ink-400">
                  {metric.siteAScore}
                  {metric.unit ? ` ${metric.unit}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 rounded-full bg-scan-violet" style={{ width: xScale(metric.siteBScore) }} />
                <span className="text-xs text-ink-400">
                  {metric.siteBScore}
                  {metric.unit ? ` ${metric.unit}` : ""}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
