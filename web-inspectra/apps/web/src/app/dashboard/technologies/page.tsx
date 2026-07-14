"use client";

import { useAsyncResource } from "@/hooks/useAsyncResource";
import { websiteScanService } from "@/lib/services/websiteScanService";
import { ACTIVE_SCAN_ID } from "@/lib/constants/scan";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { TechnologyBadgeCard } from "@/components/cards/TechnologyBadgeCard";

export default function TechnologiesPage() {
  const { data: technologies, isLoading } = useAsyncResource(
    () => websiteScanService.getDetectedTechnologies(ACTIVE_SCAN_ID),
    [],
    "Unable to load detected technologies."
  );

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Technology Detector"
        title="What this site is built with"
        description="Frameworks, libraries, and infrastructure inferred from headers, scripts, and markup signatures."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading || !technologies
          ? Array.from({ length: 6 }).map((_, index) => <GlassCard key={index} className="p-5"><SkeletonLoader className="h-24 w-full" /></GlassCard>)
          : technologies.map((technology) => <TechnologyBadgeCard key={technology.id} technology={technology} />)}
      </div>
    </div>
  );
}
