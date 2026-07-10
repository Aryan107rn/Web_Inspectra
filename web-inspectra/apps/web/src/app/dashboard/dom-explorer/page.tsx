"use client";

import { useAsyncResource } from "@/hooks/useAsyncResource";
import { websiteScanService } from "@/lib/services/websiteScanService";
import { ACTIVE_SCAN_ID } from "@/lib/constants/scan";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { DomHierarchyGraph } from "@/components/graphs/DomHierarchyGraph";

export default function DomExplorerPage() {
  const { data, isLoading } = useAsyncResource(
    () => websiteScanService.getDomExplorerData(ACTIVE_SCAN_ID),
    [],
    "Unable to load the DOM tree."
  );

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="DOM Explorer"
        title="Rendered DOM structure"
        description={data ? `${data.totalNodes} nodes across ${data.maxDepth} levels of nesting.` : "Loading structure\u2026"}
      />
      {isLoading || !data ? <SkeletonLoader className="h-[480px] w-full" /> : <DomHierarchyGraph data={data} />}
    </div>
  );
}
