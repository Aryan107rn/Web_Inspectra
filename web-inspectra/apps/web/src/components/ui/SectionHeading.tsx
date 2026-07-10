export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-scan-cyan">{eyebrow}</p>
      )}
      <h2 className="font-display text-2xl font-semibold text-ink-100 md:text-3xl">{title}</h2>
      {description && <p className="mt-2 max-w-2xl text-sm text-ink-400 md:text-base">{description}</p>}
    </div>
  );
}
