import type { DomExplorerData } from "@/lib/types";

export const domExplorerMockData: DomExplorerData = {
  totalNodes: 812,
  maxDepth: 6,
  nodes: [
    { id: "d0", tagName: "html", depth: 0, childCount: 2, parentId: null },
    { id: "d1", tagName: "head", depth: 1, childCount: 5, parentId: "d0" },
    { id: "d2", tagName: "body", depth: 1, childCount: 3, parentId: "d0" },
    { id: "d3", tagName: "header", identifier: "site-header", depth: 2, childCount: 2, parentId: "d2" },
    { id: "d4", tagName: "nav", depth: 3, childCount: 6, parentId: "d3" },
    { id: "d5", tagName: "main", identifier: "main-content", depth: 2, childCount: 4, parentId: "d2" },
    { id: "d6", tagName: "section", identifier: "hero", depth: 3, childCount: 3, parentId: "d5" },
    { id: "d7", tagName: "img", identifier: "hero-banner", depth: 4, childCount: 0, parentId: "d6", hasAccessibilityIssue: true },
    { id: "d8", tagName: "section", identifier: "product-grid", depth: 3, childCount: 12, parentId: "d5" },
    { id: "d9", tagName: "div", identifier: "card-1", depth: 4, childCount: 3, parentId: "d8" },
    { id: "d10", tagName: "button", identifier: "add-to-cart", depth: 5, childCount: 0, parentId: "d9", hasAccessibilityIssue: true },
    { id: "d11", tagName: "footer", identifier: "site-footer", depth: 2, childCount: 3, parentId: "d2" },
  ],
};
