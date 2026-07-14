"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { websiteScanService } from "@/lib/services/websiteScanService";

export function ScanUrlInput() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!url.trim()) return;
    setIsSubmitting(true);
    await websiteScanService.submitScanRequest(url.trim());
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
      <label htmlFor="scan-url" className="sr-only">
        Website URL to scan
      </label>
      <input
        id="scan-url"
        type="url"
        required
        placeholder="https://your-website.com"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        className="w-full flex-1 rounded-xl border border-line bg-void-panel/80 px-4 py-3.5 font-mono text-sm text-ink-100 placeholder:text-ink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scan-cyan"
      />
      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Starting scan\u2026" : "Scan website"}
      </Button>
    </form>
  );
}
