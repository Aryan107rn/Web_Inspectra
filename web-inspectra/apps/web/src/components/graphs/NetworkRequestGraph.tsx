"use client";

import { useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { NetworkGraphData, NetworkRequestNode } from "@/lib/types";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatKilobytes, formatMilliseconds } from "@/lib/utils/formatters";

const categoryColorMap: Record<NetworkRequestNode["category"], string> = {
  document: "#4cd9e0",
  api: "#8b7ff0",
  script: "#f0b84c",
  stylesheet: "#c3cbd1",
  image: "#4ce0a0",
  font: "#8a97a0",
  "third-party": "#f0616b",
};

function buildLayout(graph: NetworkGraphData): { nodes: Node[]; edges: Edge[] } {
  const columns = new Map<string, number>();
  const levelCounts: number[] = [];
  const childrenBySource = new Map<string, string[]>();
  graph.edges.forEach((edge) => {
    childrenBySource.set(edge.sourceId, [...(childrenBySource.get(edge.sourceId) ?? []), edge.targetId]);
  });

  const rootId = graph.nodes[0]?.id;
  const assignLevel = (id: string, level: number) => {
    if (columns.has(id)) return;
    columns.set(id, level);
    levelCounts[level] = (levelCounts[level] ?? 0) + 1;
    (childrenBySource.get(id) ?? []).forEach((childId) => assignLevel(childId, level + 1));
  };
  if (rootId) assignLevel(rootId, 0);

  const seenPerLevel: Record<number, number> = {};
  const nodes: Node[] = graph.nodes.map((requestNode) => {
    const level = columns.get(requestNode.id) ?? 0;
    const indexInLevel = seenPerLevel[level] ?? 0;
    seenPerLevel[level] = indexInLevel + 1;
    const color = categoryColorMap[requestNode.category];

    return {
      id: requestNode.id,
      position: { x: level * 220, y: indexInLevel * 96 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: { label: requestNode.label, requestNode },
      style: {
        background: "#0b1116",
        border: `1.5px solid ${requestNode.isFailed ? "#f0616b" : requestNode.isSlow ? "#f0b84c" : color}`,
        borderRadius: 12,
        color: "#f4f6f7",
        fontSize: 12,
        padding: 10,
        width: 180,
      },
    };
  });

  const edges: Edge[] = graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.sourceId,
    target: edge.targetId,
    animated: true,
    style: { stroke: "rgba(76,217,224,0.4)" },
  }));

  return { nodes, edges };
}

export function NetworkRequestGraph({ graph }: { graph: NetworkGraphData }) {
  const { nodes, edges } = useMemo(() => buildLayout(graph), [graph]);
  const [selectedNode, setSelectedNode] = useState<NetworkRequestNode | null>(null);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <GlassCard className="h-[480px] overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          proOptions={{ hideAttribution: true }}
          onNodeClick={(_, node) => setSelectedNode((node.data as { requestNode: NetworkRequestNode }).requestNode)}
        >
          <Background color="rgba(255,255,255,0.06)" gap={24} />
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable style={{ background: "#0b1116" }} maskColor="rgba(6,9,12,0.6)" />
        </ReactFlow>
      </GlassCard>

      <GlassCard className="h-[480px] overflow-y-auto p-5">
        {selectedNode ? (
          <div className="space-y-3">
            <p className="font-mono text-sm text-ink-100">{selectedNode.label}</p>
            <div className="flex flex-wrap gap-2">
              {selectedNode.isFailed && <StatusBadge tone="fail">Failed</StatusBadge>}
              {selectedNode.isSlow && <StatusBadge tone="warning">Slow</StatusBadge>}
              <StatusBadge tone="neutral">{selectedNode.category}</StatusBadge>
            </div>
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between"><dt className="text-ink-400">Method</dt><dd className="text-ink-100">{selectedNode.method}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-400">Status</dt><dd className="text-ink-100">{selectedNode.statusCode}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-400">Duration</dt><dd className="text-ink-100">{formatMilliseconds(selectedNode.durationMs)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-400">Size</dt><dd className="text-ink-100">{formatKilobytes(selectedNode.sizeKb)}</dd></div>
            </dl>
          </div>
        ) : (
          <p className="text-sm text-ink-400">Select a node to inspect request details.</p>
        )}
      </GlassCard>
    </div>
  );
}
