"use client";

import { useAsyncResource } from "@/hooks/useAsyncResource";
import { websiteScanService } from "@/lib/services/websiteScanService";
import { ACTIVE_SCAN_ID } from "@/lib/constants/scan";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MetricCard } from "@/components/ui/MetricCard";
import { MetricCardSkeleton } from "@/components/ui/SkeletonLoader";
import { WebsiteHealthScoreCard } from "@/components/cards/WebsiteHealthScoreCard";

export default function OverviewPage() {
  const { data: summary, isLoading: isSummaryLoading } = useAsyncResource(
    () => websiteScanService.getScanSummary(ACTIVE_SCAN_ID),
    [],
    "Unable to load the scan summary."
  );
  const { data: quickMetrics, isLoading: isMetricsLoading } = useAsyncResource(
    () => websiteScanService.getQuickMetrics(ACTIVE_SCAN_ID),
    [],
    "Unable to load quick metrics."
  );

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Overview"
        title="Scan summary"
        description="A single-glance read of your website's overall health and headline metrics."
      />

      {summary && <WebsiteHealthScoreCard healthScore={summary.healthScore} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isMetricsLoading || !quickMetrics
          ? Array.from({ length: 4 }).map((_, index) => <MetricCardSkeleton key={index} />)
          : quickMetrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
      </div>

      {!isSummaryLoading && summary && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl2 border border-line bg-void-panel/70 p-5">
            <p className="text-xs uppercase tracking-wider text-ink-400">Technologies detected</p>
            <p className="mt-2 font-display text-2xl font-semibold text-ink-100">{summary.technologiesDetected}</p>
          </div>
          <div className="rounded-xl2 border border-line bg-void-panel/70 p-5">
            <p className="text-xs uppercase tracking-wider text-ink-400">Accessibility issues</p>
            <p className="mt-2 font-display text-2xl font-semibold text-scan-amber">{summary.accessibilityIssues}</p>
          </div>
          <div className="rounded-xl2 border border-line bg-void-panel/70 p-5">
            <p className="text-xs uppercase tracking-wider text-ink-400">Security warnings</p>
            <p className="mt-2 font-display text-2xl font-semibold text-scan-red">{summary.securityWarnings}</p>
          </div>
        </div>
      )}
    </div>
  );
}
