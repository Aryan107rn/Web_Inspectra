import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { 
  ScanReport, 
  DOMNode, 
  DOMData, 
  NetworkRequest, 
  NetworkData, 
  AccessibilityData, 
  A11yIssue,
  TechStackData,
  SecurityData,
  SecurityHeaderCheck,
  AISummary
} from "@web-inspectra/shared-types";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Google Generative AI
const apiKey = process.env.GEMINI_API_KEY || "";
const hasApiKey = !!apiKey;
const genAI = hasApiKey ? new GoogleGenerativeAI(apiKey) : null;

// Helper function to normalize URL
function normalizeUrl(inputUrl: string): string {
  let cleaned = inputUrl.trim();
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = "https://" + cleaned;
  }
  try {
    const parsed = new URL(cleaned);
    return parsed.toString();
  } catch (err) {
    throw new Error("Invalid URL format");
  }
}

// Helper to post-process visual DOM tree for largest subtrees
function findLargestSubtrees(node: DOMNode, parentSelector = ""): { selector: string; nodeCount: number }[] {
  const subtrees: { selector: string; nodeCount: number }[] = [];
  
  function countNodes(n: DOMNode, currentParent: string): number {
    let selector = n.tag;
    if (n.id) {
      selector += `#${n.id}`;
    } else if (n.classes && n.classes.length > 0) {
      selector += `.${n.classes.slice(0, 2).join(".")}`;
    }
    
    const fullSelector = currentParent ? `${currentParent} > ${selector}` : selector;
    let count = 1;
    for (const child of n.children) {
      count += countNodes(child, fullSelector);
    }
    
    if (n.children.length > 0) {
      subtrees.push({ selector: fullSelector, nodeCount: count });
    }
    return count;
  }
  
  countNodes(node, parentSelector);
  return subtrees.sort((a, b) => b.nodeCount - a.nodeCount).slice(0, 5);
}

// Mock AI Doctor findings generator for fallback when API key is missing
function generateMockDoctorSummary(report: Omit<ScanReport, "aiSummary">): AISummary {
  const findings = [];
  
  const perf = report.performance;
  if (perf.lcp > 2500) {
    findings.push({
      title: "Slow Largest Contentful Paint (LCP)",
      explanation: `The largest visible element on your page took ${(perf.lcp / 1000).toFixed(1)}s to load. Optimize and compress images, eliminate render-blocking CSS/JS, and consider preloading the hero image.`,
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

  const dom = report.dom;
  if (dom.nodeCount > 1500) {
    findings.push({
      title: "Bloated DOM Tree Structure",
      explanation: `Your page has a massive DOM tree containing ${dom.nodeCount} total nodes (recommended is < 800). Large DOM trees increase memory usage, cause longer style recalculations, and slow down page scrolls.`,
      impact: "medium" as const,
      category: "general" as const
    });
  }

  const a11y = report.accessibility;
  if (a11y.violations.length > 0) {
    findings.push({
      title: `${a11y.score < 70 ? "Critical" : "Moderate"} Accessibility Violations`,
      explanation: `We found ${a11y.violations.length} accessibility issues (Score: ${a11y.score}/100). The most common issues are missing image alt attributes or poor text contrast. Check the Accessibility tab for selectors.`,
      impact: a11y.score < 70 ? ("high" as const) : ("medium" as const),
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

  const sec = report.security;
  const missingHeaders = sec.headers.filter(h => !h.present && h.risk !== "none");
  if (missingHeaders.length > 0) {
    findings.push({
      title: `Missing Security Headers (${missingHeaders.length})`,
      explanation: `The page is missing critical security headers like ${missingHeaders.slice(0, 2).map(h => h.header).join(", ")}. Without these, the site is more vulnerable to Cross-Site Scripting (XSS) and clickjacking.`,
      impact: missingHeaders.some(h => h.risk === "high") ? ("high" as const) : ("medium" as const),
      category: "security" as const
    });
  }

  return {
    overallHealth: `[DEMO MODE: Gemini API Key Not Configured] Web Inspectra scanned ${report.url}. The site has an accessibility score of ${report.accessibility.score}/100 and a security header compliance score of ${report.security.score}/100. The page loaded in ${(report.performance.totalLoadTime / 1000).toFixed(2)}s with a total of ${report.network.totalRequests} network requests. ${report.accessibility.violations.length > 0 ? "Action is required to address accessibility issues." : "The site has excellent accessibility."}`,
    findings
  };
}

// Unified Scan Endpoint
app.post("/scan", async (req, res) => {
  const { url: targetUrl } = req.body;
  
  if (!targetUrl) {
    res.status(400).json({ error: "URL is required" });
    return;
  }
  
  let url: string;
  try {
    url = normalizeUrl(targetUrl);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
    return;
  }

  console.log(`[Backend] Starting unified analysis scan for: ${url}`);
  let browser;
  
  try {
    // 1. Launch Playwright Chromium with remote debugging port for Lighthouse
    browser = await chromium.launch({
      args: ["--remote-debugging-port=9222", "--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });

    // 2. Track Network Requests
    const requests: NetworkRequest[] = [];
    const requestStartTimes = new Map<string, number>();
    const pageLoadStartTime = Date.now();

    page.on("request", (reqObj) => {
      requestStartTimes.set(reqObj.url(), Date.now());
    });

    page.on("requestfinished", (reqObj) => {
      const reqUrl = reqObj.url();
      const startTime = requestStartTimes.get(reqUrl) || pageLoadStartTime;
      const duration = Date.now() - startTime;
      const response = reqObj.response();
      
      let resourceType: NetworkRequest["resourceType"] = "other";
      const type = reqObj.resourceType();
      if (["document", "script", "stylesheet", "image", "font", "xhr", "fetch"].includes(type)) {
        resourceType = type as NetworkRequest["resourceType"];
      }

      let size = 0;
      if (response) {
        const headers = response.headers();
        if (headers["content-length"]) {
          size = parseInt(headers["content-length"], 10) || 0;
        }
      }

      requests.push({
        url: reqUrl,
        method: reqObj.method(),
        resourceType,
        status: response ? response.status() : 200,
        startTime: startTime - pageLoadStartTime,
        duration,
        size,
        failed: false
      });
    });

    page.on("requestfailed", (reqObj) => {
      const reqUrl = reqObj.url();
      const startTime = requestStartTimes.get(reqUrl) || pageLoadStartTime;
      const duration = Date.now() - startTime;
      
      let resourceType: NetworkRequest["resourceType"] = "other";
      const type = reqObj.resourceType();
      if (["document", "script", "stylesheet", "image", "font", "xhr", "fetch"].includes(type)) {
        resourceType = type as NetworkRequest["resourceType"];
      }

      requests.push({
        url: reqUrl,
        method: reqObj.method(),
        resourceType,
        status: 0,
        startTime: startTime - pageLoadStartTime,
        duration,
        size: 0,
        failed: true
      });
    });

    // 3. Navigate to URL
    console.log(`[Backend] Loading page content...`);
    const mainResponse = await page.goto(url, { waitUntil: "load", timeout: 30000 });
    const totalLoadTime = Date.now() - pageLoadStartTime;

    // 4. Capture Security Headers
    console.log(`[Backend] Auditing security headers...`);
    const responseHeaders = mainResponse ? mainResponse.headers() : {};
    const securityHeaders: SecurityHeaderCheck[] = [
      {
        header: "Content-Security-Policy",
        present: !!responseHeaders["content-security-policy"],
        value: responseHeaders["content-security-policy"],
        description: "Prevents Cross-Site Scripting (XSS) by restricting where resources can be loaded from.",
        risk: responseHeaders["content-security-policy"] ? "none" : "high"
      },
      {
        header: "Strict-Transport-Security",
        present: !!responseHeaders["strict-transport-security"],
        value: responseHeaders["strict-transport-security"],
        description: "Enforces secure HTTPS connections for all requests.",
        risk: responseHeaders["strict-transport-security"] ? "none" : "medium"
      },
      {
        header: "X-Frame-Options",
        present: !!responseHeaders["x-frame-options"],
        value: responseHeaders["x-frame-options"],
        description: "Protects against clickjacking attacks by controlling if the page can be rendered in an iframe.",
        risk: responseHeaders["x-frame-options"] ? "none" : "medium"
      },
      {
        header: "X-Content-Type-Options",
        present: !!responseHeaders["x-content-type-options"],
        value: responseHeaders["x-content-type-options"],
        description: "Prevents MIME-sniffing vulnerability by forcing browsers to respect the declared content-type.",
        risk: responseHeaders["x-content-type-options"] ? "none" : "low"
      },
      {
        header: "Referrer-Policy",
        present: !!responseHeaders["referrer-policy"],
        value: responseHeaders["referrer-policy"],
        description: "Controls how much referrer information is sent along with requests.",
        risk: responseHeaders["referrer-policy"] ? "none" : "low"
      },
      {
        header: "Permissions-Policy",
        present: !!responseHeaders["permissions-policy"],
        value: responseHeaders["permissions-policy"],
        description: "Restricts access to browser features like camera, microphone, and geolocation.",
        risk: responseHeaders["permissions-policy"] ? "none" : "none"
      }
    ];

    const securityScore = Math.round((securityHeaders.filter(h => h.present).length / securityHeaders.length) * 100);
    const security: SecurityData = {
      score: securityScore,
      headers: securityHeaders
    };

    // Detect Hosting
    let hosting = "Unknown";
    const serverHeader = responseHeaders["server"]?.toLowerCase() || "";
    const viaHeader = responseHeaders["via"]?.toLowerCase() || "";
    const powerHeader = responseHeaders["x-powered-by"]?.toLowerCase() || "";

    if (powerHeader.includes("vercel") || viaHeader.includes("vercel")) {
      hosting = "Vercel";
    } else if (serverHeader.includes("cloudflare")) {
      hosting = "Cloudflare";
    } else if (serverHeader.includes("netlify") || responseHeaders["x-nf-request-id"]) {
      hosting = "Netlify";
    } else if (serverHeader.includes("github")) {
      hosting = "GitHub Pages";
    } else if (serverHeader.includes("nginx")) {
      hosting = "Nginx (Self-Hosted)";
    } else if (serverHeader.includes("apache")) {
      hosting = "Apache (Self-Hosted)";
    } else if (responseHeaders["x-amz-cf-id"]) {
      hosting = "Amazon Web Services (CloudFront)";
    }

    // 5. Run Tech Stack Detector (client side window variables check)
    console.log(`[Backend] Detecting technology stack...`);
    const clientTech = await page.evaluate(() => {
      const frameworks: string[] = [];
      const cssLibraries: string[] = [];
      const analytics: string[] = [];
      const other: string[] = [];
      
      const win = window as any;

      if (win.React || document.querySelector("[data-reactroot], [data-react-helmet]")) {
        frameworks.push("React");
      }
      if (win.next?.version || win.__NEXT_DATA__) {
        frameworks.push("Next.js");
      }
      if (win.Vue || win.__VUE__) {
        frameworks.push("Vue");
      }
      if (win.angular || win.ng) {
        frameworks.push("Angular");
      }
      if (win.jQuery) {
        frameworks.push("jQuery");
      }
      if (win.Alpine) {
        frameworks.push("Alpine.js");
      }
      if (win.Svelte || win.__svelte) {
        frameworks.push("Svelte");
      }

      const hasTailwindClasses = Array.from(document.querySelectorAll("*"))
        .slice(0, 100)
        .some(el => Array.from(el.classList).some(c => c.startsWith("tw-") || /^(p|m|bg|text|flex|grid|border|rounded|shadow|hover|focus|w|h|relative|absolute)-\[?\d+/.test(c)));
      if (hasTailwindClasses || document.querySelector("style[id*='tailwind'], link[href*='tailwind']")) {
        cssLibraries.push("Tailwind CSS");
      }
      if (document.querySelector("link[href*='bootstrap'], style[id*='bootstrap']") || win.bootstrap) {
        cssLibraries.push("Bootstrap");
      }
      if (document.querySelector("style[data-emotion], style[data-styled]")) {
        cssLibraries.push("Styled Components");
      }

      if (win.ga || win.gaplugins || win.google_tag_manager || win.dataLayer) {
        analytics.push("Google Analytics");
      }
      if (win.mixpanel) {
        analytics.push("Mixpanel");
      }
      if (win.fathom) {
        analytics.push("Fathom");
      }
      if (win.plausible) {
        analytics.push("Plausible");
      }
      if (win.fbq) {
        analytics.push("Facebook Pixel");
      }

      if (win.webpackChunk || win.webpackJsonp) {
        other.push("Webpack");
      }
      if (win.vite || document.querySelector("script[type='module'][src*='vite']")) {
        other.push("Vite");
      }
      
      const generatorMeta = document.querySelector("meta[name='generator']");
      if (generatorMeta) {
        const val = generatorMeta.getAttribute("content");
        if (val) other.push(`Generator: ${val}`);
      }

      return { frameworks, cssLibraries, analytics, other };
    });

    const techStack: TechStackData = {
      frameworks: clientTech.frameworks,
      cssLibraries: clientTech.cssLibraries,
      hosting,
      analytics: clientTech.analytics,
      other: clientTech.other
    };

    // 6. Run Accessibility (axe-core)
    console.log(`[Backend] Auditing accessibility with axe-core...`);
    let accessibility: AccessibilityData = { score: 100, passes: 0, violations: [] };
    try {
      const axeResults = await new AxeBuilder({ page }).analyze();
      const violations: A11yIssue[] = axeResults.violations.map(v => ({
        id: v.id,
        impact: (v.impact as A11yIssue["impact"]) || "moderate",
        description: v.description,
        helpUrl: v.helpUrl,
        nodes: v.nodes.map(n => n.target.join(" > "))
      }));
      const passesCount = axeResults.passes.length;
      const totalRules = passesCount + violations.length;
      const a11yScore = totalRules > 0 ? Math.round((passesCount / totalRules) * 100) : 100;
      
      accessibility = {
        violations,
        passes: passesCount,
        score: a11yScore
      };
    } catch (err) {
      console.error("[Backend] axe-core accessibility audit failed:", err);
    }

    // 7. Extract DOM tree data
    console.log(`[Backend] Harvesting DOM structure...`);
    const domStats = await page.evaluate(() => {
      const allNodes = document.getElementsByTagName("*");
      const nodeCount = allNodes.length;
      
      let maxDepth = 0;
      const getDepth = (el: Element): number => {
        let depth = 1;
        let parent = el.parentElement;
        while (parent) {
          depth++;
          parent = parent.parentElement;
        }
        return depth;
      };
      
      for (let i = 0; i < allNodes.length; i++) {
        const d = getDepth(allNodes[i]);
        if (d > maxDepth) maxDepth = d;
      }
      
      return { nodeCount, maxDepth };
    });

    const visualTree = await page.evaluate(() => {
      const nodeLimit = 800;
      let count = 0;

      const parseNode = (element: Element): any => {
        if (count >= nodeLimit) return null;
        count++;

        const tag = element.tagName.toLowerCase();
        const id = element.id || undefined;
        const classes = element.className && typeof element.className === "string" 
          ? element.className.split(/\s+/).filter(Boolean) 
          : undefined;
        
        const attributes: Record<string, string> = {};
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          if (attr.name !== "class" && attr.name !== "id") {
            attributes[attr.name] = attr.value;
          }
        }

        let textContent: string | undefined = undefined;
        if (element.children.length === 0) {
          textContent = element.textContent?.trim().substring(0, 100) || undefined;
        }

        const children: any[] = [];
        for (let i = 0; i < element.children.length; i++) {
          const child = element.children[i];
          const childTag = child.tagName.toLowerCase();
          if (["script", "style", "noscript", "svg", "iframe", "link", "path", "meta"].includes(childTag)) {
            continue;
          }
          const parsedChild = parseNode(child);
          if (parsedChild) {
            children.push(parsedChild);
          }
        }

        return {
          tag,
          id,
          classes,
          attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
          textContent,
          children
        };
      };

      return parseNode(document.body || document.documentElement);
    });

    const largestSubtrees = visualTree ? findLargestSubtrees(visualTree) : [];
    
    const dom: DOMData = {
      tree: visualTree || { tag: "body", children: [] },
      nodeCount: domStats.nodeCount,
      maxDepth: domStats.maxDepth,
      largestSubtrees
    };

    // Close Playwright page, but keep browser alive briefly for Lighthouse
    await page.close();

    // 8. Auditing Performance with Lighthouse
    console.log(`[Backend] Auditing performance via Lighthouse...`);
    let performanceData = {
      lcp: 0,
      fcp: 0,
      cls: 0,
      inp: 0,
      tti: 0,
      totalLoadTime,
      resourceCount: requests.length,
      totalTransferSize: requests.reduce((acc, r) => acc + r.size, 0)
    };

    try {
      const { default: lighthouse } = await import("lighthouse");
      const lhResult = await lighthouse(url, {
        port: 9222,
        output: "json",
        onlyCategories: ["performance"]
      });

      if (lhResult && lhResult.lhr) {
        const audits = lhResult.lhr.audits;
        performanceData = {
          lcp: audits["largest-contentful-paint"]?.numericValue || 0,
          fcp: audits["first-contentful-paint"]?.numericValue || 0,
          cls: audits["cumulative-layout-shift"]?.numericValue || 0,
          inp: audits["interaction-to-next-paint"]?.numericValue || audits["experimental-interaction-to-next-paint"]?.numericValue || 0,
          tti: audits["interactive"]?.numericValue || 0,
          totalLoadTime: audits["speed-index"]?.numericValue || totalLoadTime,
          resourceCount: requests.length,
          totalTransferSize: requests.reduce((acc, r) => acc + r.size, 0)
        };
      }
    } catch (lhErr) {
      console.warn("[Backend] Lighthouse audit failed, using Playwright performance fallbacks:", lhErr);
      performanceData = {
        lcp: totalLoadTime * 0.7,
        fcp: totalLoadTime * 0.4,
        cls: 0.05,
        inp: 50,
        tti: totalLoadTime * 0.9,
        totalLoadTime,
        resourceCount: requests.length,
        totalTransferSize: requests.reduce((acc, r) => acc + r.size, 0)
      };
    }

    // Close Playwright browser completely
    await browser.close();
    browser = null;

    // 9. Format Network requests
    const networkData: NetworkData = {
      requests: requests.slice(0, 100),
      totalRequests: requests.length,
      failedRequests: requests.filter(r => r.failed).length,
      slowestRequests: [...requests]
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5)
    };

    const reportWithoutAI: Omit<ScanReport, "aiSummary"> = {
      url,
      scannedAt: new Date().toISOString(),
      status: "complete",
      dom,
      performance: performanceData,
      network: networkData,
      accessibility,
      techStack,
      security
    };

    // 10. AI Doctor Diagnostics (Gemini)
    console.log(`[Backend] Fetching AI diagnosis...`);
    let aiSummary: AISummary;

    if (!hasApiKey || !genAI) {
      console.log("[Backend] GEMINI_API_KEY not configured. Running fallback mock analyzer.");
      aiSummary = generateMockDoctorSummary(reportWithoutAI);
    } else {
      // Lightweight statistics report payload for the LLM
      const miniReport = {
        url: reportWithoutAI.url,
        performance: {
          lcp: reportWithoutAI.performance.lcp,
          fcp: reportWithoutAI.performance.fcp,
          cls: reportWithoutAI.performance.cls,
          inp: reportWithoutAI.performance.inp,
          tti: reportWithoutAI.performance.tti,
          totalLoadTime: reportWithoutAI.performance.totalLoadTime,
          resourceCount: reportWithoutAI.performance.resourceCount,
          totalTransferSize: reportWithoutAI.performance.totalTransferSize
        },
        dom: {
          nodeCount: reportWithoutAI.dom.nodeCount,
          maxDepth: reportWithoutAI.dom.maxDepth,
          largestSubtrees: reportWithoutAI.dom.largestSubtrees
        },
        accessibility: {
          score: reportWithoutAI.accessibility.score,
          passes: reportWithoutAI.accessibility.passes,
          violationsCount: reportWithoutAI.accessibility.violations.length,
          violations: reportWithoutAI.accessibility.violations.slice(0, 10).map(v => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            nodesSample: v.nodes.slice(0, 2)
          }))
        },
        techStack: reportWithoutAI.techStack,
        security: {
          score: reportWithoutAI.security.score,
          headers: reportWithoutAI.security.headers.map(h => ({
            header: h.header,
            present: h.present,
            risk: h.risk
          }))
        }
      };

      const prompt = `You are a Senior Web Engineer and Performance Specialist acting as the "AI Website Doctor".
Analyze the following technical website scan data and explain the findings in plain, friendly, and actionable language that non-technical users can understand.

Include both critical issues (things that are broken, slow, insecure, or inaccessible) and praise for things done well. Prioritize findings by impact.

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
        let model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });

        let result;
        try {
          result = await model.generateContent(prompt);
        } catch (err) {
          console.warn("[Backend] gemini-2.5-flash failed, falling back to gemini-1.5-flash:", err);
          model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
          });
          result = await model.generateContent(prompt);
        }

        const textResponse = result.response.text();
        aiSummary = JSON.parse(textResponse) as AISummary;
      } catch (err: any) {
        console.error("[Backend] Error calling Gemini API, running mock fallback:", err);
        aiSummary = generateMockDoctorSummary(reportWithoutAI);
        aiSummary.overallHealth = `[FAILOVER MODE: Gemini API call failed] ${aiSummary.overallHealth}`;
      }
    }

    const completeReport: ScanReport = {
      ...reportWithoutAI,
      aiSummary
    };

    console.log(`[Backend] Scan and AI diagnosis complete for: ${url}`);
    res.json({ scanId: Math.random().toString(36).substring(7), report: completeReport });

  } catch (err: any) {
    console.error(`[Backend] Error scanning website:`, err);
    if (browser) {
      try {
        await browser.close();
      } catch (_) {}
    }
    res.status(500).json({ error: err.message || "Failed to scan site" });
  }
});

app.listen(PORT, () => {
  console.log(`[Backend Service] Running on http://localhost:${PORT}`);
});
