"use client";

import { useAsyncResource } from "@/hooks/useAsyncResource";
import { websiteScanService } from "@/lib/services/websiteScanService";
import { ACTIVE_SCAN_ID } from "@/lib/constants/scan";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { AiRecommendationCard } from "@/components/cards/AiRecommendationCard";

const priorityOrder = { high: 0, medium: 1, low: 2 } as const;

export default function AiDoctorPage() {
  const { data: recommendations, isLoading } = useAsyncResource(
    () => websiteScanService.getAiRecommendations(ACTIVE_SCAN_ID),
    [],
    "Unable to load AI recommendations."
  );

  const sorted = recommendations
    ? [...recommendations].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    : null;

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="AI Website Doctor"
        title="Prioritized recommendations"
        description="Every finding explained in plain language, with a suggested fix and the improvement you can expect."
      />
      <div className="space-y-4">
        {isLoading || !sorted
          ? Array.from({ length: 4 }).map((_, index) => <SkeletonLoader key={index} className="h-44 w-full" />)
          : sorted.map((recommendation) => (
              <AiRecommendationCard key={recommendation.id} recommendation={recommendation} />
            ))}
      </div>
    </div>
  );
}
