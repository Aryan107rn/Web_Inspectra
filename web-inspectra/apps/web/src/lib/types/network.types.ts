export type NetworkRequestCategory =
  | "document"
  | "api"
  | "script"
  | "stylesheet"
  | "image"
  | "font"
  | "third-party";

export interface NetworkRequestNode {
  id: string;
  label: string;
  category: NetworkRequestCategory;
  method: "GET" | "POST" | "PUT" | "DELETE";
  statusCode: number;
  durationMs: number;
  sizeKb: number;
  isFailed: boolean;
  isSlow: boolean;
}

export interface NetworkRequestEdge {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface NetworkGraphData {
  nodes: NetworkRequestNode[];
  edges: NetworkRequestEdge[];
}
