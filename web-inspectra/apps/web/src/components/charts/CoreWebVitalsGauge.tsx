"use client";

import { useMemo } from "react";
import { arc as d3Arc } from "d3";
import type { CoreWebVital } from "@/lib/types";
import { ratingColorMap } from "@/lib/constants/theme";

export function CoreWebVitalsGauge({ vital }: { vital: CoreWebVital }) {
  const size = 120;
  const strokeWidth = 10;
  const radius = size / 2 - strokeWidth;

  const progress = useMemo(() => {
    const ratio = vital.id === "cls" ? vital.value / 0.25 : vital.value / vital.benchmarkPoor;
    return Math.min(Math.max(ratio, 0.04), 1);
  }, [vital]);

  const arcPath = useMemo(() => {
    const generator = d3Arc<null>()
      .innerRadius(radius)
      .outerRadius(radius)
      .startAngle(-Math.PI * 0.75)
      .endAngle(-Math.PI * 0.75 + Math.PI * 1.5 * progress)
      .cornerRadius(strokeWidth / 2);
    return generator(null) ?? "";
  }, [progress, radius]);

  const trackPath = useMemo(() => {
    const generator = d3Arc<null>()
      .innerRadius(radius)
      .outerRadius(radius)
      .startAngle(-Math.PI * 0.75)
      .endAngle(Math.PI * 0.75)
      .cornerRadius(strokeWidth / 2);
    return generator(null) ?? "";
  }, [radius]);

  const color = ratingColorMap[vital.rating];
  const displayValue = vital.unit === "score" ? vital.value.toFixed(2) : Math.round(vital.value);

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${vital.label} gauge`}>
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          <path d={trackPath} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} />
          <path d={arcPath} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <text textAnchor="middle" dy="0.05em" y="2" className="fill-ink-100 font-display" fontSize="20" fontWeight={600}>
            {displayValue}
          </text>
          <text textAnchor="middle" y="20" className="fill-ink-400" fontSize="10">
            {vital.unit === "ms" ? "ms" : vital.unit === "s" ? "s" : ""}
          </text>
        </g>
      </svg>
      <div className="text-center">
        <p className="text-xs font-medium text-ink-100">{vital.label}</p>
        <p className="mt-0.5 text-[11px] capitalize" style={{ color }}>
          {vital.rating.replace("-", " ")}
        </p>
      </div>
    </div>
  );
}
