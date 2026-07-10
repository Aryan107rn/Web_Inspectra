import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

const benefits = [
  { audience: "Developers", benefit: "Diagnose regressions fast with a visual waterfall and request graph instead of digging through devtools." },
  { audience: "Students & beginners", benefit: "Learn what actually happens when a browser loads a page, explained without jargon." },
  { audience: "Designers", benefit: "See how design choices — images, fonts, animations — translate into real load cost." },
  { audience: "Educators", benefit: "Use a live, visual example to teach performance and accessibility concepts in class." },
];

export function BenefitsSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading eyebrow="Who it's for" title="Built to be understood, not just used" />
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {benefits.map((item) => (
          <GlassCard key={item.audience} className="p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-scan-violet">{item.audience}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-300">{item.benefit}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
