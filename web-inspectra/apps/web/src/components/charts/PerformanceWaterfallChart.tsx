"use client";

import { useMemo } from "react";
import { scaleLinear } from "d3";
import type { WaterfallResourceEntry } from "@/lib/types";
import { formatKilobytes, formatMilliseconds } from "@/lib/utils/formatters";

const typeColorMap: Record<WaterfallResourceEntry["type"], string> = {
  document: "#4cd9e0",
  script: "#f0b84c",
  stylesheet: "#8b7ff0",
  image: "#4ce0a0",
  font: "#c3cbd1",
  xhr: "#f0616b",
  other: "#5b6670",
};

export function PerformanceWaterfallChart({ entries }: { entries: WaterfallResourceEntry[] }) {
  const width = 720;
  const rowHeight = 32;
  const labelWidth = 160;
  const chartWidth = width - labelWidth;
  const height = entries.length * rowHeight;

  const maxEnd = useMemo(
    () => Math.max(...entries.map((entry) => entry.startMs + entry.durationMs)),
    [entries]
  );

  const xScale = useMemo(
    () => scaleLinear().domain([0, maxEnd]).range([0, chartWidth]),
    [maxEnd, chartWidth]
  );

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height + 24} role="img" aria-label="Resource loading waterfall chart">
        {entries.map((entry, index) => {
          const y = index * rowHeight;
          const barX = xScale(entry.startMs);
          const barWidth = Math.max(xScale(entry.startMs + entry.durationMs) - barX, 3);
          return (
            <g key={entry.id} transform={`translate(0, ${y})`}>
              <text x={0} y={rowHeight / 2 + 4} fontSize="11" className="fill-ink-300">
                {entry.name.length > 22 ? `${entry.name.slice(0, 21)}\u2026` : entry.name}
              </text>
              <rect x={labelWidth} y={4} width={chartWidth} height={rowHeight - 12} fill="rgba(255,255,255,0.03)" rx={4} />
              <rect
                x={labelWidth + barX}
                y={4}
                width={barWidth}
                height={rowHeight - 12}
                fill={typeColorMap[entry.type]}
                opacity={entry.blocked ? 1 : 0.85}
                rx={3}
              />
              <text x={labelWidth + barX + barWidth + 8} y={rowHeight / 2 + 4} fontSize="10" className="fill-ink-400">
                {formatMilliseconds(entry.durationMs)} {"\u00b7"} {formatKilobytes(entry.sizeKb)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
