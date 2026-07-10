"use client";

import { ScanSweep } from "@/components/ui/ScanSweep";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { truncateUrl } from "@/lib/utils/formatters";
import type { ScanSummary } from "@/lib/types";

export function DashboardHeader({ scanSummary }: { scanSummary: ScanSummary | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-void/80 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-400">Scanning</p>
          <p className="truncate font-mono text-sm text-ink-100">
            {scanSummary ? truncateUrl(scanSummary.targetUrl) : "awaiting target\u2026"}
          </p>
        </div>
        {scanSummary && (
          <div className="flex shrink-0 items-center gap-3">
            <StatusBadge tone="info">Grade {scanSummary.healthScore.grade}</StatusBadge>
            <div className="flex items-center gap-2 rounded-full border border-line bg-void-raised px-3 py-1.5">
              <span className="text-xs text-ink-400">Health</span>
              <span className="font-display text-sm font-semibold text-scan-cyan">
                {scanSummary.healthScore.overallScore}
              </span>
            </div>
          </div>
        )}
      </div>
      <ScanSweep />
    </header>
  );
}
