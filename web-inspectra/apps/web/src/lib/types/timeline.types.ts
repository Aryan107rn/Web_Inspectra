export type TimelinePhase =
  | "html-parsing"
  | "css-loading"
  | "js-execution"
  | "api-requests"
  | "rendering"
  | "interactivity";

export interface TimelineEvent {
  id: string;
  phase: TimelinePhase;
  label: string;
  startMs: number;
  durationMs: number;
}
