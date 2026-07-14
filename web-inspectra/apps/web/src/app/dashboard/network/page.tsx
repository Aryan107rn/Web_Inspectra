"use client";

import { useAsyncResource } from "@/hooks/useAsyncResource";
import { websiteScanService } from "@/lib/services/websiteScanService";
import { ACTIVE_SCAN_ID } from "@/lib/constants/scan";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { NetworkRequestGraph } from "@/components/graphs/NetworkRequestGraph";

export default function NetworkPage() {
  const { data: graph, isLoading } = useAsyncResource(
    () => websiteScanService.getNetworkGraph(ACTIVE_SCAN_ID),
    [],
    "Unable to load the network graph."
  );

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Network"
        title="Request flow"
        description="Every request the page makes, traced from the document down to third-party scripts. Click a node for details."
      />
      {isLoading || !graph ? <SkeletonLoader className="h-[480px] w-full" /> : <NetworkRequestGraph graph={graph} />}
    </div>
  );
}
