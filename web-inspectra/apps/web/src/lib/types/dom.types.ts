export interface DomTreeNode {
  id: string;
  tagName: string;
  identifier?: string;
  depth: number;
  childCount: number;
  parentId: string | null;
  hasAccessibilityIssue?: boolean;
}

export interface DomExplorerData {
  nodes: DomTreeNode[];
  totalNodes: number;
  maxDepth: number;
}
