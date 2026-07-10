"use client";

import { useAsyncResource } from "@/hooks/useAsyncResource";
import { websiteScanService } from "@/lib/services/websiteScanService";
import { ACTIVE_SCAN_ID } from "@/lib/constants/scan";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { CoreWebVitalsGauge } from "@/components/charts/CoreWebVitalsGauge";
import { PerformanceWaterfallChart } from "@/components/charts/PerformanceWaterfallChart";
import { ResourceBreakdownChart } from "@/components/charts/ResourceBreakdownChart";

export default function PerformancePage() {
  const { data: report, isLoading } = useAsyncResource(
    () => websiteScanService.getPerformanceReport(ACTIVE_SCAN_ID),
    [],
    "Unable to load the performance report."
  );

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Performance"
        title="Core Web Vitals & resource loading"
        description="How fast the page loads, renders, and responds — and exactly what's slowing it down."
      />

      <GlassCard className="p-6">
        <div className="flex flex-wrap justify-around gap-6">
          {isLoading || !report
            ? Array.from({ length: 5 }).map((_, index) => <SkeletonLoader key={index} className="h-28 w-28 rounded-full" />)
            : report.vitals.map((vital) => <CoreWebVitalsGauge key={vital.id} vital={vital} />)}
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <GlassCard className="p-6">
          <h3 className="mb-4 font-display text-lg font-semibold text-ink-100">Resource waterfall</h3>
          {isLoading || !report ? <SkeletonLoader className="h-64 w-full" /> : <PerformanceWaterfallChart entries={report.waterfall} />}
        </GlassCard>
        <GlassCard className="p-6">
          <h3 className="mb-4 font-display text-lg font-semibold text-ink-100">Page weight breakdown</h3>
          {isLoading || !report ? <SkeletonLoader className="h-48 w-full" /> : <ResourceBreakdownChart entries={report.waterfall} />}
        </GlassCard>
      </div>
    </div>
  );
}
