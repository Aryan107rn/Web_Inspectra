import { SectionHeading } from "@/components/ui/SectionHeading";

const steps = [
  { step: "01", title: "Enter a URL", description: "Paste any public website address into the scanner." },
  { step: "02", title: "We scan it", description: "The engine loads the page and inspects performance, network, DOM, technologies, accessibility, and security." },
  { step: "03", title: "Explore the results", description: "Browse an interactive dashboard built from the scan — no PDF, no jargon." },
];

export function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading eyebrow="Process" title="From URL to full diagnosis in three steps" />
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {steps.map((item, index) => (
          <div key={item.step} className="relative">
            <p className="font-display text-4xl font-semibold text-scan-cyan/30">{item.step}</p>
            <h3 className="mt-3 font-display text-lg font-semibold text-ink-100">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-400">{item.description}</p>
            {index < steps.length - 1 && (
              <div className="mt-6 hidden h-px w-full bg-gradient-to-r from-scan-cyan/30 to-transparent md:block" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
