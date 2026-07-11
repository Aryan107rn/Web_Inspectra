import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ScanReport, AISummary } from "@web-inspectra/shared-types";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Initialize Google Generative AI
const apiKey = process.env.GEMINI_API_KEY || "";
const hasApiKey = !!apiKey;
const genAI = hasApiKey ? new GoogleGenerativeAI(apiKey) : null;

// Mock AI Doctor findings generator for fallback
function generateMockDoctorSummary(report: ScanReport): AISummary {
  const findings = [];
  
  // 1. Analyze Performance
  const perf = report.performance;
  if (perf.lcp > 2500) {
    findings.push({
      title: "Slow Largest Contentful Paint (LCP)",
      explanation: `The largest visible element on your page took ${(perf.lcp / 1000).toFixed(1)}s to load. To fix this, optimize and compress images, eliminate render-blocking CSS/JS, and consider preloading the hero image.`,
      impact: "high" as const,
      category: "performance" as const
    });
  } else {
    findings.push({
      title: "Healthy Contentful Paint",
      explanation: `Your page paints content quickly (FCP: ${(perf.fcp / 1000).toFixed(1)}s). This provides a fast first impression to visitors.`,
      impact: "low" as const,
      category: "performance" as const
    });
  }

  // 2. Analyze DOM
  const dom = report.dom;
  if (dom.nodeCount > 1500) {
    findings.push({
      title: "Bloated DOM Tree Structure",
      explanation: `Your page has a massive DOM tree containing ${dom.nodeCount} total nodes (recommended is < 800). Large DOM trees increase memory usage, cause longer style recalculations, and slow down page scrolls. Optimize by lazy-loading hidden parts of the page.`,
      impact: "medium" as const,
      category: "general" as const
    });
  }
  if (dom.maxDepth > 32) {
    findings.push({
      title: "Extremely Deep DOM Nesting",
      explanation: `Your DOM has an element nesting depth of ${dom.maxDepth} (recommended is < 32). This usually happens due to excessive wrapper divs (div-soup). Try to flatten your HTML structure.`,
      impact: "medium" as const,
      category: "general" as const
    });
  }

  // 3. Analyze Accessibility
  const a11y = report.accessibility;
  if (a11y.violations.length > 0) {
    const criticalViolations = a11y.violations.filter(v => v.impact === "critical" || v.impact === "serious");
    findings.push({
      title: `${criticalViolations.length > 0 ? "Critical" : "Moderate"} Accessibility Violations`,
      explanation: `We found ${a11y.violations.length} accessibility violations (Score: ${a11y.score}/100). The most common issues are missing image alt attributes or poor text contrast. Check the Accessibility tab to see specific elements that need fixing.`,
      impact: criticalViolations.length > 0 ? ("high" as const) : ("medium" as const),
      category: "accessibility" as const
    });
  } else {
    findings.push({
      title: "Perfect Accessibility Audit",
      explanation: "Excellent job! The page passed all automated axe-core accessibility checks, which means screen readers and keyboard users can navigate it easily.",
      impact: "low" as const,
      category: "accessibility" as const
    });
  }

  // 4. Analyze Security Headers
  const sec = report.security;
  const missingHeaders = sec.headers.filter(h => !h.present && h.risk !== "none");
  if (missingHeaders.length > 0) {
    findings.push({
      title: `Missing Security Headers (${missingHeaders.length})`,
      explanation: `The page is missing critical security headers like ${missingHeaders.slice(0, 2).map(h => h.header).join(", ")}. Without these, the site is more vulnerable to Cross-Site Scripting (XSS) and clickjacking. Configure your server to send these headers.`,
      impact: missingHeaders.some(h => h.risk === "high") ? ("high" as const) : ("medium" as const),
      category: "security" as const
    });
  } else {
    findings.push({
      title: "Solid Security Header Configuration",
      explanation: "The site has properly configured security response headers, protecting users against common web vulnerabilities.",
      impact: "low" as const,
      category: "security" as const
    });
  }

  // 5. Analyze Tech Stack / Analytics
  const tech = report.techStack;
  if (tech.analytics.length === 0) {
    findings.push({
      title: "No Analytics Detected",
      explanation: "We couldn't detect any web analytics packages (like Google Analytics). Adding basic analytics can help you track user behavior and make data-driven improvements.",
      impact: "low" as const,
      category: "seo" as const
    });
  }

  return {
    overallHealth: `[DEMO MODE: Gemini API Key Not Configured] Web Inspectra scanned ${report.url}. The site has an accessibility score of ${report.accessibility.score}/100 and a security header compliance score of ${report.security.score}/100. The page loaded in ${(report.performance.totalLoadTime / 1000).toFixed(2)}s with a total of ${report.network.totalRequests} network requests. ${report.accessibility.violations.length > 0 ? "Action is required to address accessibility issues." : "The site has excellent accessibility."} ${missingHeaders.length > 0 ? "You should also add missing security headers to prevent attacks." : ""}`,
    findings
  };
}

app.post("/analyze", async (req, res) => {
  const { report } = req.body;

  if (!report) {
    res.status(400).json({ error: "Scan report is required" });
    return;
  }

  // If no Gemini API Key is configured, run the fallback mock generator
  if (!hasApiKey || !genAI) {
    console.log("[Analyzer] GEMINI_API_KEY not configured. Running fallback mock analyzer.");
    const summary = generateMockDoctorSummary(report);
    res.json({ aiSummary: summary });
    return;
  }

  console.log(`[Analyzer] Running Gemini AI Website Doctor for: ${report.url}`);

  // Create a lightweight representation of the report to send to Gemini
  const miniReport = {
    url: report.url,
    performance: {
      lcp: report.performance.lcp,
      fcp: report.performance.fcp,
      cls: report.performance.cls,
      inp: report.performance.inp,
      tti: report.performance.tti,
      totalLoadTime: report.performance.totalLoadTime,
      resourceCount: report.performance.resourceCount,
      totalTransferSize: report.performance.totalTransferSize
    },
    dom: {
      nodeCount: report.dom.nodeCount,
      maxDepth: report.dom.maxDepth,
      largestSubtrees: report.dom.largestSubtrees
    },
    network: {
      totalRequests: report.network.totalRequests,
      failedRequests: report.network.failedRequests,
      slowestRequests: report.network.slowestRequests.map(r => ({
        url: r.url.substring(0, 100) + (r.url.length > 100 ? "..." : ""),
        duration: r.duration,
        size: r.size,
        resourceType: r.resourceType
      }))
    },
    accessibility: {
      score: report.accessibility.score,
      passes: report.accessibility.passes,
      violationsCount: report.accessibility.violations.length,
      violations: report.accessibility.violations.slice(0, 10).map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodesSample: v.nodes.slice(0, 3)
      }))
    },
    techStack: report.techStack,
    security: {
      score: report.security.score,
      headers: report.security.headers.map(h => ({
        header: h.header,
        present: h.present,
        risk: h.risk
      }))
    }
  };

  const prompt = `You are a Senior Web Engineer and Performance Specialist acting as the "AI Website Doctor".
Analyze the following technical website scan data and explain the issues in a plain, friendly, and actionable language that non-technical people (like clients or project managers) can understand.

For each finding:
- Explain what the issue is.
- Why it matters (impact on user experience or security).
- How to fix it in plain terms.
Include both critical issues (things that are broken or slow) and praise for things done well. Prioritize findings by impact.

You MUST respond strictly with a JSON object that adheres to the following TypeScript interface:
interface AIFinding {
  title: string; // Concise, readable finding title (e.g., "Compress Hero Image", "Great Page Speed!")
  explanation: string; // Actionable plain language explanation.
  impact: "low" | "medium" | "high";
  category: "performance" | "accessibility" | "security" | "seo" | "general";
}

interface AISummary {
  overallHealth: string; // 1-2 paragraph friendly explanation summarizing the site's design quality, speed, security, and accessibility.
  findings: AIFinding[]; // Prioritized list of actionable findings
}

Here is the scan data:
${JSON.stringify(miniReport, null, 2)}`;

  try {
    // Try using gemini-2.5-flash with JSON mode
    let model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (err) {
      console.warn("[Analyzer] gemini-2.5-flash failed, falling back to gemini-1.5-flash:", err);
      // Fallback to gemini-1.5-flash
      model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json"
        }
      });
      result = await model.generateContent(prompt);
    }

    const textResponse = result.response.text();
    const parsedSummary = JSON.parse(textResponse) as AISummary;

    res.json({ aiSummary: parsedSummary });

  } catch (err: any) {
    console.error("[Analyzer] Error calling Gemini API:", err);
    // Graceful fallback to mock summary if Gemini fails mid-call
    const mockSummary = generateMockDoctorSummary(report);
    mockSummary.overallHealth = `[FAILOVER MODE: Gemini API call failed] ${mockSummary.overallHealth}`;
    res.json({ aiSummary: mockSummary });
  }
});

app.listen(PORT, () => {
  console.log(`[Analyzer Service] Running on http://localhost:${PORT}`);
});
