export function SiteFooter() {
  return (
    <footer className="border-t border-line px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-ink-600 sm:flex-row">
        <p>© {new Date().getFullYear()} Web Inspectra. Frontend preview build.</p>
        <p>Built with Next.js, React, D3, and React Flow.</p>
      </div>
    </footer>
  );
}
