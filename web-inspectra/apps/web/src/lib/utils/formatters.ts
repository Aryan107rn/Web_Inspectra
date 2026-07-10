export function formatKilobytes(sizeKb: number): string {
  if (sizeKb >= 1024) return `${(sizeKb / 1024).toFixed(2)} MB`;
  return `${Math.round(sizeKb)} KB`;
}

export function formatMilliseconds(durationMs: number): string {
  if (durationMs >= 1000) return `${(durationMs / 1000).toFixed(2)} s`;
  return `${Math.round(durationMs)} ms`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function truncateUrl(url: string, maxLength = 42): string {
  const cleaned = url.replace(/^https?:\/\//, "");
  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength - 1)}\u2026` : cleaned;
}
