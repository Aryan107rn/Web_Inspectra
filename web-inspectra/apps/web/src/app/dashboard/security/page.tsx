"use client";

import { useAsyncResource } from "@/hooks/useAsyncResource";
import { websiteScanService } from "@/lib/services/websiteScanService";
import { ACTIVE_SCAN_ID } from "@/lib/constants/scan";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { SecurityInsightCard } from "@/components/cards/SecurityInsightCard";

export default function SecurityPage() {
  const { data: insights, isLoading } = useAsyncResource(
    () => websiteScanService.getSecurityInsights(ACTIVE_SCAN_ID),
    [],
    "Unable to load security insights."
  );

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Security"
        title="Security insights"
        description="An educational overview of the site's security posture — HTTPS, headers, cookies, and CSP."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {isLoading || !insights
          ? Array.from({ length: 6 }).map((_, index) => <SkeletonLoader key={index} className="h-32 w-full" />)
          : insights.map((insight) => <SecurityInsightCard key={insight.id} insight={insight} />)}
      </div>
    </div>
  );
}
