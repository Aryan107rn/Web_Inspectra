import type { NetworkGraphData } from "@/lib/types";

export const networkGraphMockData: NetworkGraphData = {
  nodes: [
    { id: "n0", label: "/ (document)", category: "document", method: "GET", statusCode: 200, durationMs: 220, sizeKb: 18, isFailed: false, isSlow: false },
    { id: "n1", label: "main.css", category: "stylesheet", method: "GET", statusCode: 200, durationMs: 140, sizeKb: 46, isFailed: false, isSlow: false },
    { id: "n2", label: "app.bundle.js", category: "script", method: "GET", statusCode: 200, durationMs: 410, sizeKb: 312, isFailed: false, isSlow: true },
    { id: "n3", label: "/api/products", category: "api", method: "GET", statusCode: 200, durationMs: 320, sizeKb: 21, isFailed: false, isSlow: false },
    { id: "n4", label: "/api/user/session", category: "api", method: "GET", statusCode: 401, durationMs: 90, sizeKb: 2, isFailed: true, isSlow: false },
    { id: "n5", label: "hero-banner.webp", category: "image", method: "GET", statusCode: 200, durationMs: 260, sizeKb: 184, isFailed: false, isSlow: false },
    { id: "n6", label: "Inter-var.woff2", category: "font", method: "GET", statusCode: 200, durationMs: 90, sizeKb: 62, isFailed: false, isSlow: false },
    { id: "n7", label: "googletagmanager.com", category: "third-party", method: "GET", statusCode: 200, durationMs: 610, sizeKb: 44, isFailed: false, isSlow: true },
    { id: "n8", label: "stripe.js", category: "third-party", method: "GET", statusCode: 200, durationMs: 210, sizeKb: 96, isFailed: false, isSlow: false },
  ],
  edges: [
    { id: "e0", sourceId: "n0", targetId: "n1" },
    { id: "e1", sourceId: "n0", targetId: "n2" },
    { id: "e2", sourceId: "n2", targetId: "n3" },
    { id: "e3", sourceId: "n2", targetId: "n4" },
    { id: "e4", sourceId: "n0", targetId: "n5" },
    { id: "e5", sourceId: "n1", targetId: "n6" },
    { id: "e6", sourceId: "n0", targetId: "n7" },
    { id: "e7", sourceId: "n2", targetId: "n8" },
  ],
};
