"use client";

import React, { useState } from "react";
import type { DOMNode } from "@web-inspectra/shared-types";
import { ChevronRight, ChevronDown, Tag, Hash, FileCode } from "lucide-react";

interface DOMTreeViewerProps {
  node: DOMNode;
  depth?: number;
}

export default function DOMTreeViewer({ node, depth = 0 }: DOMTreeViewerProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand top 2 levels
  const hasChildren = node.children && node.children.length > 0;

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Render class string
  const classString = node.classes && node.classes.length > 0
    ? `.${node.classes.join(".")}`
    : "";

  // Render attribute snippets
  const renderAttributes = () => {
    if (!node.attributes || Object.keys(node.attributes).length === 0) return null;
    return (
      <span className="text-zinc-500 text-xs ml-2 select-none">
        {Object.entries(node.attributes).map(([key, val]) => (
          <span key={key} className="mr-1.5">
            <span className="text-zinc-400 font-mono">{key}</span>=
            <span className="text-emerald-400 font-mono">"{val.length > 25 ? val.substring(0, 25) + "..." : val}"</span>
          </span>
        ))}
      </span>
    );
  };

  return (
    <div className="flex flex-col select-none">
      <div 
        onClick={hasChildren ? toggleExpand : undefined}
        className={`flex items-center py-1.5 px-2 rounded-md font-mono text-sm transition-colors group ${
          hasChildren ? "cursor-pointer hover:bg-zinc-800/50" : ""
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {/* Expand / Collapse Icon */}
        <span className="w-5 h-5 flex items-center justify-center mr-1 text-zinc-500">
          {hasChildren ? (
            isExpanded ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
          )}
        </span>

        {/* Tag Icon */}
        <FileCode className={`w-3.5 h-3.5 mr-1.5 ${hasChildren ? "text-purple-400" : "text-zinc-500"}`} />

        {/* Tag Name */}
        <span className="text-purple-400 font-semibold">&lt;{node.tag}</span>

        {/* ID */}
        {node.id && (
          <span className="text-sky-400 flex items-center ml-1 text-xs">
            <Hash className="w-3 h-3 text-sky-500/80 mr-0.5" />
            {node.id}
          </span>
        )}

        {/* Classes */}
        {classString && (
          <span className="text-yellow-400/90 ml-1 text-xs truncate max-w-[200px]" title={classString}>
            {classString}
          </span>
        )}

        {/* Attributes */}
        {renderAttributes()}

        <span className="text-purple-400 font-semibold">&gt;</span>

        {/* Text Content Inline */}
        {node.textContent && !isExpanded && (
          <span className="text-zinc-400 text-xs ml-2 italic max-w-[150px] truncate">
            {node.textContent}
          </span>
        )}

        {/* Children Count Badge */}
        {hasChildren && !isExpanded && (
          <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 font-sans">
            {node.children.length} child{node.children.length !== 1 ? "ren" : ""}
          </span>
        )}
      </div>

      {/* Children Nodes */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col relative border-l border-zinc-800/80 ml-5 pl-1 my-0.5">
          {node.children.map((child, idx) => (
            <DOMTreeViewer key={idx} node={child} depth={depth} />
          ))}
        </div>
      )}

      {/* Closing Tag (if it has children and is expanded) */}
      {hasChildren && isExpanded && (
        <div 
          className="py-1 px-2 font-mono text-sm text-purple-400/50 select-none"
          style={{ paddingLeft: `${depth * 16 + 28}px` }}
        >
          &lt;/{node.tag}&gt;
        </div>
      )}
    </div>
  );
}
