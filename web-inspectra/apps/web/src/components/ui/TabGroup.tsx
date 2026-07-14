"use client";

import { cn } from "@/lib/utils/cn";

export interface TabOption {
  id: string;
  label: string;
}

interface TabGroupProps {
  options: TabOption[];
  activeId: string;
  onChange: (id: string) => void;
}

export function TabGroup({ options, activeId, onChange }: TabGroupProps) {
  return (
    <div role="tablist" className="inline-flex items-center gap-1 rounded-xl border border-line bg-void-panel/60 p-1">
      {options.map((option) => {
        const isActive = option.id === activeId;
        return (
          <button
            key={option.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scan-cyan",
              isActive ? "bg-scan-cyan/15 text-scan-cyan" : "text-ink-400 hover:text-ink-100"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
