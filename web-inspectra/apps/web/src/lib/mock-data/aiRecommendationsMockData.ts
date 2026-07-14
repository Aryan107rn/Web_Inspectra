import type { AiRecommendation } from "@/lib/types";

export const aiRecommendationsMockData: AiRecommendation[] = [
  {
    id: "ai-1",
    issue: "Large JavaScript bundle blocks first render",
    plainLanguageExplanation: "Your main script is 312 KB and the browser has to download and run most of it before it can show the page, which delays how quickly visitors see content.",
    priority: "high",
    suggestedFix: "Split the bundle by route and lazy-load non-critical components below the fold.",
    expectedImprovement: "Could cut Largest Contentful Paint by roughly 600-900ms.",
  },
  {
    id: "ai-2",
    issue: "Third-party analytics script runs synchronously",
    plainLanguageExplanation: "The analytics tag loads before your own content, competing for bandwidth and CPU time on a slow connection.",
    priority: "medium",
    suggestedFix: "Load the analytics script with the async or defer attribute, or after the page becomes interactive.",
    expectedImprovement: "Frees up roughly 200ms of main-thread time during load.",
  },
  {
    id: "ai-3",
    issue: "Images are not served in modern formats",
    plainLanguageExplanation: "Several images are still PNG or JPEG, which are larger than formats like WebP or AVIF for the same visual quality.",
    priority: "medium",
    suggestedFix: "Re-encode images to WebP and provide responsive sizes with the srcset attribute.",
    expectedImprovement: "Could reduce total page weight by 30-45%.",
  },
  {
    id: "ai-4",
    issue: "Missing HSTS security header",
    plainLanguageExplanation: "Without this header, a visitor's first request could still be sent over an insecure connection before redirecting to HTTPS.",
    priority: "low",
    suggestedFix: "Add a Strict-Transport-Security header with a max-age of at least one year.",
    expectedImprovement: "Closes a narrow downgrade-attack window on first visit.",
  },
];
