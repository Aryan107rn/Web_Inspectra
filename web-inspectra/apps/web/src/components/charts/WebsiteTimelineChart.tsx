"use client";

import { useMemo } from "react";
import { scaleLinear } from "d3";
import { motion } from "framer-motion";
import type { TimelineEvent } from "@/lib/types";
import { formatMilliseconds } from "@/lib/utils/formatters";

const phaseColorMap: Record<TimelineEvent["phase"], string> = {
  "html-parsing": "#4cd9e0",
  "css-loading": "#8b7ff0",
  "js-execution": "#f0b84c",
  "api-requests": "#f0616b",
  rendering: "#4ce0a0",
  interactivity: "#c3cbd1",
};

export function WebsiteTimelineChart({ events }: { events: TimelineEvent[] }) {
  const width = 720;
  const rowHeight = 44;
  const maxEnd = useMemo(() => Math.max(...events.map((event) => event.startMs + event.durationMs)), [events]);
  const xScale = useMemo(() => scaleLinear().domain([0, maxEnd]).range([0, width]), [maxEnd]);

  return (
    <div className="space-y-3">
      {events.map((event, index) => {
        const barX = xScale(event.startMs);
        const barWidth = Math.max(xScale(event.durationMs), 4);
        return (
          <div key={event.id} className="flex items-center gap-4">
            <div className="w-40 shrink-0 text-right text-xs text-ink-400">{event.label}</div>
            <div className="relative flex-1" style={{ height: rowHeight - 20 }}>
              <div className="absolute inset-0 rounded-full bg-white/5" />
              <motion.div
                className="absolute top-0 h-full rounded-full"
                style={{ backgroundColor: phaseColorMap[event.phase], left: barX }}
                initial={{ width: 0 }}
                animate={{ width: barWidth }}
                transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
              />
            </div>
            <div className="w-16 shrink-0 text-xs text-ink-300">{formatMilliseconds(event.durationMs)}</div>
          </div>
        );
      })}
    </div>
  );
}
