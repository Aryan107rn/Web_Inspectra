"use client";

import { useAsyncResource } from "@/hooks/useAsyncResource";
import { websiteScanService } from "@/lib/services/websiteScanService";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { ComparisonBarChart } from "@/components/charts/ComparisonBarChart";

export default function ComparisonPage() {
  const { data: comparison, isLoading } = useAsyncResource(
    () => websiteScanService.getComparison("scan_8f2a1c", "scan_c930d1"),
    [],
    "Unable to load the comparison."
  );

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Comparison"
        title="Website comparison"
        description="Compare two websites side by side across performance, accessibility, security, and resource usage."
      />
      <GlassCard className="p-6">
        {isLoading || !comparison ? (
          <SkeletonLoader className="h-96 w-full" />
        ) : (
          <ComparisonBarChart metrics={comparison.metrics} siteA={comparison.siteA} siteB={comparison.siteB} />
        )}
      </GlassCard>
    </div>
  );
}
