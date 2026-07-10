import type { TimelineEvent } from "@/lib/types";

export const timelineEventsMockData: TimelineEvent[] = [
  { id: "tl-1", phase: "html-parsing", label: "HTML document parsed", startMs: 0, durationMs: 180 },
  { id: "tl-2", phase: "css-loading", label: "Stylesheets fetched & applied", startMs: 90, durationMs: 220 },
  { id: "tl-3", phase: "js-execution", label: "Main bundle executed", startMs: 130, durationMs: 410 },
  { id: "tl-4", phase: "api-requests", label: "Initial data fetched", startMs: 540, durationMs: 320 },
  { id: "tl-5", phase: "rendering", label: "First paint to full render", startMs: 300, durationMs: 560 },
  { id: "tl-6", phase: "interactivity", label: "Page becomes interactive", startMs: 860, durationMs: 140 },
];
