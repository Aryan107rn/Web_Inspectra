"use client";

import { useAsyncResource } from "@/hooks/useAsyncResource";
import { websiteScanService } from "@/lib/services/websiteScanService";
import { ACTIVE_SCAN_ID } from "@/lib/constants/scan";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { WebsiteTimelineChart } from "@/components/charts/WebsiteTimelineChart";

export default function TimelinePage() {
  const { data: events, isLoading } = useAsyncResource(
    () => websiteScanService.getTimelineEvents(ACTIVE_SCAN_ID),
    [],
    "Unable to load the loading timeline."
  );

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Timeline"
        title="Website loading timeline"
        description="The chronological journey from first byte to full interactivity, phase by phase."
      />
      <GlassCard className="p-6">
        {isLoading || !events ? <SkeletonLoader className="h-64 w-full" /> : <WebsiteTimelineChart events={events} />}
      </GlassCard>
    </div>
  );
}
