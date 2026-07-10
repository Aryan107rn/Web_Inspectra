"use client";

import { useMemo } from "react";
import { arc as d3Arc, pie as d3Pie, type PieArcDatum } from "d3";
import type { WaterfallResourceEntry } from "@/lib/types";
import { formatKilobytes } from "@/lib/utils/formatters";

const typeColorMap: Record<WaterfallResourceEntry["type"], string> = {
  document: "#4cd9e0",
  script: "#f0b84c",
  stylesheet: "#8b7ff0",
  image: "#4ce0a0",
  font: "#c3cbd1",
  xhr: "#f0616b",
  other: "#5b6670",
};

interface ResourceGroup {
  type: WaterfallResourceEntry["type"];
  totalKb: number;
}

export function ResourceBreakdownChart({ entries }: { entries: WaterfallResourceEntry[] }) {
  const size = 200;
  const radius = size / 2;

  const groups = useMemo<ResourceGroup[]>(() => {
    const totals = new Map<WaterfallResourceEntry["type"], number>();
    entries.forEach((entry) => totals.set(entry.type, (totals.get(entry.type) ?? 0) + entry.sizeKb));
    return Array.from(totals, ([type, totalKb]) => ({ type, totalKb })).sort((a, b) => b.totalKb - a.totalKb);
  }, [entries]);

  const arcs = useMemo(() => {
    const pieGenerator = d3Pie<ResourceGroup>().value((group) => group.totalKb).sort(null);
    return pieGenerator(groups);
  }, [groups]);

  const arcGenerator = d3Arc<PieArcDatum<ResourceGroup>>().innerRadius(radius * 0.55).outerRadius(radius - 2);

  const totalKb = groups.reduce((sum, group) => sum + group.totalKb, 0);

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Page weight breakdown by resource type">
        <g transform={`translate(${radius}, ${radius})`}>
          {arcs.map((slice) => (
            <path key={slice.data.type} d={arcGenerator(slice) ?? undefined} fill={typeColorMap[slice.data.type]} stroke="#06090c" strokeWidth={1.5} />
          ))}
          <text textAnchor="middle" dy="-0.2em" className="fill-ink-100 font-display" fontSize="18" fontWeight={600}>
            {formatKilobytes(totalKb)}
          </text>
          <text textAnchor="middle" dy="1.2em" className="fill-ink-400" fontSize="10">
            total weight
          </text>
        </g>
      </svg>
      <ul className="space-y-2">
        {groups.map((group) => (
          <li key={group.type} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: typeColorMap[group.type] }} />
            <span className="capitalize text-ink-300">{group.type}</span>
            <span className="text-ink-400">{formatKilobytes(group.totalKb)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
