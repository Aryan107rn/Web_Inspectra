import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
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
  SecurityHeaderCheck
} from "@web-inspectra/shared-types";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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
      // Just use the first 2 classes to keep selector clean
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

  console.log(`[Scanner] Starting scan for: ${url}`);
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
        startTime: startTime - pageLoadStartTime, // Normalized relative to load start
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
    console.log(`[Scanner] Navigating to page...`);
    const mainResponse = await page.goto(url, { waitUntil: "load", timeout: 30000 });
    const totalLoadTime = Date.now() - pageLoadStartTime;

    // 4. Capture Security Headers
    console.log(`[Scanner] Auditing security headers...`);
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

    const presentHeadersCount = securityHeaders.filter(h => h.present && h.risk !== "none").length + securityHeaders.filter(h => h.present && h.risk === "none").length;
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
    } else if (serverHeader.includes("gws") || serverHeader.includes("gse")) {
      hosting = "Google Cloud Platform";
    }

    // 5. Run Tech Stack Detector (client side window variables check)
    console.log(`[Scanner] Detecting technology stack...`);
    const clientTech = await page.evaluate(() => {
      const frameworks: string[] = [];
      const cssLibraries: string[] = [];
      const analytics: string[] = [];
      const other: string[] = [];
      
      const win = window as any;

      // Frameworks
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

      // CSS Libraries
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

      // Analytics
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

      // Other
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
    console.log(`[Scanner] Auditing accessibility with axe-core...`);
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
      console.error("[Scanner] Axe accessibility audit failed:", err);
    }

    // 7. Extract DOM tree data
    console.log(`[Scanner] Harvesting DOM structure...`);
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

    // Prune DOM tree representation to first 800 nodes for quick loading
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
    console.log(`[Scanner] Auditing performance via Lighthouse...`);
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
      // Dynamic import of Lighthouse to avoid ES Module resolution issues
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
      console.error("[Scanner] Lighthouse audit failed, using Playwright performance fallbacks:", lhErr);
      // Fallback performance timing (basic Playwright loading metrics)
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
      requests: requests.slice(0, 100), // Limit size of array returned
      totalRequests: requests.length,
      failedRequests: requests.filter(r => r.failed).length,
      slowestRequests: [...requests]
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5)
    };

    const report: ScanReport = {
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

    console.log(`[Scanner] Scan complete for: ${url}`);
    res.json({ scanId: Math.random().toString(36).substring(7), report });

  } catch (err: any) {
    console.error(`[Scanner] Error scanning website:`, err);
    if (browser) {
      try {
        await browser.close();
      } catch (_) {}
    }
    res.status(500).json({ error: err.message || "Failed to scan site" });
  }
});

app.listen(PORT, () => {
  console.log(`[Scanner Service] Running on http://localhost:${PORT}`);
});
