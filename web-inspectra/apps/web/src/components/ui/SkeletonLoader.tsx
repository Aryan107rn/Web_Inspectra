import { cn } from "@/lib/utils/cn";

export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-gradient-to-r from-white/5 via-white/10 to-white/5", className)}
      aria-hidden="true"
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-xl2 border border-line bg-void-panel/70 p-5">
      <SkeletonLoader className="h-3 w-24" />
      <SkeletonLoader className="mt-3 h-8 w-16" />
      <SkeletonLoader className="mt-3 h-3 w-20" />
    </div>
  );
}
