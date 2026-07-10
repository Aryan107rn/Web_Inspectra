import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

const features = [
  { title: "Performance internals", description: "Core Web Vitals, resource waterfalls, and CPU/memory usage rendered as live visuals instead of raw numbers." },
  { title: "Network flow mapping", description: "Every request, redirect, and third-party call laid out as an interactive graph you can trace end to end." },
  { title: "DOM structure explorer", description: "Walk the rendered DOM tree visually, spotting depth, bloat, and flagged elements at a glance." },
  { title: "Accessibility, in plain language", description: "Issues explained the way a mentor would, with the fix and the reasoning behind it." },
  { title: "Security posture overview", description: "HTTPS, headers, cookies, and CSP summarized without needing a security background." },
  { title: "AI Website Doctor", description: "Prioritized, beginner-friendly recommendations with the expected impact of each fix." },
];

export function FeatureHighlightsSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        eyebrow="What it shows you"
        title="Every layer of your website, made visible"
        description="Instead of a wall of report text, each dashboard module turns raw scan data into something you can actually read."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <GlassCard key={feature.title} hoverable className="p-6">
            <h3 className="font-display text-lg font-semibold text-ink-100">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-400">{feature.description}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
