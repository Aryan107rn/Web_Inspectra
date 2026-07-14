import type { DetectedTechnology } from "@/lib/types";

export const detectedTechnologiesMockData: DetectedTechnology[] = [
  { id: "t1", name: "Next.js", category: "framework", confidencePercent: 98, version: "15.1", description: "React framework used for routing and rendering." },
  { id: "t2", name: "React", category: "library", confidencePercent: 99, version: "19.0", description: "UI library powering the component tree." },
  { id: "t3", name: "Tailwind CSS", category: "styling", confidencePercent: 95, description: "Utility-first CSS framework detected in class signatures." },
  { id: "t4", name: "Vercel", category: "hosting", confidencePercent: 90, description: "Edge hosting platform identified via response headers." },
  { id: "t5", name: "Cloudflare", category: "cdn", confidencePercent: 87, description: "CDN and DNS layer detected via server headers." },
  { id: "t6", name: "Google Analytics", category: "analytics", confidencePercent: 93, version: "GA4", description: "Traffic analytics script detected in page scripts." },
  { id: "t7", name: "Node.js", category: "backend", confidencePercent: 72, description: "Inferred from server response signature." },
  { id: "t8", name: "Stripe", category: "library", confidencePercent: 88, description: "Payment SDK script detected on checkout flow." },
];
