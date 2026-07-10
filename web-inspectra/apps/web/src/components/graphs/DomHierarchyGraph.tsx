"use client";

import { useMemo, useState } from "react";
import { ReactFlow, Background, Controls, type Node, type Edge, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { DomExplorerData, DomTreeNode } from "@/lib/types";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

function buildDomLayout(data: DomExplorerData): { nodes: Node[]; edges: Edge[] } {
  const seenPerDepth: Record<number, number> = {};

  const nodes: Node[] = data.nodes.map((domNode) => {
    const indexAtDepth = seenPerDepth[domNode.depth] ?? 0;
    seenPerDepth[domNode.depth] = indexAtDepth + 1;

    return {
      id: domNode.id,
      position: { x: domNode.depth * 190, y: indexAtDepth * 84 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: { domNode },
      style: {
        background: "#0b1116",
        border: `1.5px solid ${domNode.hasAccessibilityIssue ? "#f0b84c" : "rgba(76,217,224,0.4)"}`,
        borderRadius: 10,
        color: "#f4f6f7",
        fontSize: 12,
        fontFamily: "var(--font-mono)",
        padding: 8,
        width: 168,
      },
    };
  });

  const edges: Edge[] = data.nodes
    .filter((domNode) => domNode.parentId)
    .map((domNode) => ({
      id: `e-${domNode.parentId}-${domNode.id}`,
      source: domNode.parentId as string,
      target: domNode.id,
      style: { stroke: "rgba(139,127,240,0.4)" },
    }));

  return { nodes, edges };
}

export function DomHierarchyGraph({ data }: { data: DomExplorerData }) {
  const { nodes, edges } = useMemo(() => buildDomLayout(data), [data]);
  const [selectedNode, setSelectedNode] = useState<DomTreeNode | null>(null);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
      <GlassCard className="h-[480px] overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          proOptions={{ hideAttribution: true }}
          onNodeClick={(_, node) => setSelectedNode((node.data as { domNode: DomTreeNode }).domNode)}
          nodesDraggable={false}
        >
          <Background color="rgba(255,255,255,0.06)" gap={24} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </GlassCard>

      <GlassCard className="h-[480px] p-5">
        {selectedNode ? (
          <div className="space-y-3">
            <p className="font-mono text-sm text-ink-100">
              &lt;{selectedNode.tagName}
              {selectedNode.identifier ? ` id="${selectedNode.identifier}"` : ""}&gt;
            </p>
            {selectedNode.hasAccessibilityIssue && <StatusBadge tone="warning">Accessibility flag</StatusBadge>}
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between"><dt className="text-ink-400">Depth</dt><dd className="text-ink-100">{selectedNode.depth}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-400">Children</dt><dd className="text-ink-100">{selectedNode.childCount}</dd></div>
            </dl>
          </div>
        ) : (
          <p className="text-sm text-ink-400">Select a node to inspect its details.</p>
        )}
      </GlassCard>
    </div>
  );
}
