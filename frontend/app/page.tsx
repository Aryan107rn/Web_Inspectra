"use client";

import React, { useState, useEffect } from "react";
import type { ScanReport } from "@web-inspectra/shared-types";
import DOMTreeViewer from "@/components/DOMTreeViewer";
import WaterfallChart from "@/components/WaterfallChart";
import ScoreGauge from "@/components/ScoreGauge";
import {
  Activity,
  Cpu,
  HeartPulse,
  Sparkles,
  Network,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  GitCompare,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Clock,
  HardDrive,
  Code
} from "lucide-react";

const SCAN_STEPS = [
  "Initializing Playwright browser context...",
  "Loading page content and monitoring network traffic...",
  "Inspecting HTTP response & security headers...",
  "Extracting page elements and DOM hierarchy...",
  "Analyzing accessibility rules (axe-core)...",
  "Running Lighthouse performance analysis...",
  "Consulting AI Website Doctor (Gemini)...",
  "Assembling final report visual metrics..."
];

export default function Home() {
  const [activeMode, setActiveMode] = useState<"single" | "compare">("single");
  
  // Single scan state
  const [singleUrl, setSingleUrl] = useState("");
  const [scanStatus, setScanStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [scanError, setScanError] = useState("");
  const [activeTab, setActiveTab] = useState<"ai" | "performance" | "dom" | "accessibility" | "security">("ai");

  // Compare scan state
  const [urlA, setUrlA] = useState("");
  const [urlB, setUrlB] = useState("");
  const [compareStatus, setCompareStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [compareStepIdx, setCompareStepIdx] = useState(0);
  const [reportA, setReportA] = useState<ScanReport | null>(null);
  const [reportB, setReportB] = useState<ScanReport | null>(null);
  const [compareError, setCompareError] = useState("");
  const [compareActiveTab, setCompareActiveTab] = useState<"overview" | "ai" | "performance" | "accessibility" | "security">("overview");

  // Automatically cycle through progress steps during scanning
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (scanStatus === "loading") {
      setCurrentStepIdx(0);
      interval = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev < SCAN_STEPS.length - 2) {
            return prev + 1;
          }
          return prev;
        });
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [scanStatus]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (compareStatus === "loading") {
      setCompareStepIdx(0);
      interval = setInterval(() => {
        setCompareStepIdx((prev) => {
          if (prev < SCAN_STEPS.length - 2) {
            return prev + 1;
          }
          return prev;
        });
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [compareStatus]);

  // Single URL Scan trigger
  const handleSingleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleUrl) return;

    setScanStatus("loading");
    setScanError("");
    setReport(null);
    setCurrentStepIdx(0);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: singleUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to scan website");
      }

      setCurrentStepIdx(SCAN_STEPS.length - 1);
      const data = await response.json();
      setReport(data);
      setScanStatus("success");
      setActiveTab("ai");
    } catch (err: any) {
      console.error(err);
      setScanError(err.message || "An unexpected error occurred.");
      setScanStatus("error");
    }
  };

  // Compare URLs Scan trigger
  const handleCompareScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlA || !urlB) return;

    setCompareStatus("loading");
    setCompareError("");
    setReportA(null);
    setReportB(null);
    setCompareStepIdx(0);

    try {
      // Run both scans in parallel
      const [resA, resB] = await Promise.allSettled([
        fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlA }),
        }).then(async (r) => {
          if (!r.ok) {
            const err = await r.json().catch(() => ({}));
            throw new Error(err.error || `Failed to scan ${urlA}`);
          }
          return r.json();
        }),
        fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlB }),
        }).then(async (r) => {
          if (!r.ok) {
            const err = await r.json().catch(() => ({}));
            throw new Error(err.error || `Failed to scan ${urlB}`);
          }
          return r.json();
        })
      ]);

      if (resA.status === "rejected" || resB.status === "rejected") {
        const errMsg = 
          (resA.status === "rejected" ? resA.reason.message : "") +
          (resA.status === "rejected" && resB.status === "rejected" ? " | " : "") +
          (resB.status === "rejected" ? resB.reason.message : "");
        throw new Error(errMsg || "Failed to complete one of the scans.");
      }

      setReportA(resA.value);
      setReportB(resB.value);
      setCompareStatus("success");
      setCompareActiveTab("overview");
    } catch (err: any) {
      console.error(err);
      setCompareError(err.message || "An unexpected error occurred.");
      setCompareStatus("error");
    }
  };

  // Category badge colors for findings
  const getImpactColor = (impact: "low" | "medium" | "high") => {
    switch (impact) {
      case "high": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "medium": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "low": return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    }
  };

  const getImpactIcon = (impact: "low" | "medium" | "high") => {
    switch (impact) {
      case "high": return <AlertOctagon className="w-4 h-4 text-red-400 mr-1.5" />;
      case "medium": return <AlertTriangle className="w-4 h-4 text-amber-400 mr-1.5" />;
      case "low": return <CheckCircle2 className="w-4 h-4 text-sky-400 mr-1.5" />;
    }
  };

  return (
    <div className="flex-1 bg-black text-zinc-100 min-h-screen relative font-sans overflow-x-hidden selection:bg-purple-600/30 selection:text-purple-200">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800c_1px,transparent_1px),linear-gradient(to_bottom,#8080800c_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        
        {/* Header */}
        <header className="flex flex-col items-center justify-center text-center mt-6 mb-12">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/5 text-purple-400 text-xs font-bold uppercase tracking-wider mb-4 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> AI-Powered Site Explorer
          </div>
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent tracking-tight">
            Web Inspectra
          </h1>
          <p className="text-zinc-400 mt-3 text-sm md:text-lg max-w-2xl leading-relaxed">
            Scan and visualize the inner anatomy of any public website. Transform raw code, performance, accessibility, and tech stacks into a clear, interactive visual audit.
          </p>

          {/* Mode Switcher */}
          <div className="flex bg-zinc-900/80 border border-zinc-800 rounded-xl p-1 mt-8 shadow-2xl">
            <button
              onClick={() => {
                setActiveMode("single");
                setScanStatus("idle");
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${
                activeMode === "single"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/15"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Activity className="w-4 h-4" /> Single URL Scan
            </button>
            <button
              onClick={() => {
                setActiveMode("compare");
                setCompareStatus("idle");
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${
                activeMode === "compare"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/15"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <GitCompare className="w-4 h-4" /> Side-by-Side Comparison
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* SINGLE URL SCAN MODULE */}
        {/* ========================================================================= */}
        {activeMode === "single" && (
          <div className="flex flex-col items-center">
            {/* Input Form */}
            {scanStatus !== "loading" && (
              <form onSubmit={handleSingleScan} className="w-full max-w-2xl bg-zinc-900/60 border border-zinc-850 p-1.5 rounded-2xl flex items-center shadow-3xl hover:border-zinc-800 transition-all backdrop-blur-sm">
                <Globe className="w-5 h-5 text-zinc-500 ml-4 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Enter a website URL (e.g. nextjs.org, example.com)..."
                  value={singleUrl}
                  onChange={(e) => setSingleUrl(e.target.value)}
                  className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-zinc-100 placeholder-zinc-500 text-sm md:text-base py-3 px-3"
                  required
                />
                <button
                  type="submit"
                  disabled={!singleUrl}
                  className="bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs md:text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-purple-500/15 disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
                >
                  <Activity className="w-4 h-4" /> Analyze Site
                </button>
              </form>
            )}

            {/* Loading Box */}
            {scanStatus === "loading" && (
              <div className="w-full max-w-lg bg-zinc-900/50 border border-zinc-800/80 p-8 rounded-3xl flex flex-col items-center shadow-3xl text-center backdrop-blur-md">
                <RefreshCw className="w-10 h-10 text-purple-500 animate-spin mb-4" />
                <h3 className="text-lg font-bold text-zinc-200">Examining Website Anatomy</h3>
                <p className="text-zinc-500 text-xs mt-1">This takes about 10-15 seconds for performance diagnostics</p>
                
                {/* Steps Visualizer */}
                <div className="w-full mt-6 bg-zinc-950 border border-zinc-900 rounded-xl p-4 divide-y divide-zinc-900 text-left">
                  {SCAN_STEPS.map((step, idx) => (
                    <div key={idx} className="flex items-center py-2 text-xs transition-opacity duration-300">
                      <span className="w-4 h-4 flex items-center justify-center mr-3">
                        {currentStepIdx > idx ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : currentStepIdx === idx ? (
                          <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                        )}
                      </span>
                      <span className={`${
                        currentStepIdx === idx 
                          ? "text-purple-400 font-semibold" 
                          : currentStepIdx > idx 
                          ? "text-zinc-500" 
                          : "text-zinc-650"
                      }`}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {scanStatus === "error" && (
              <div className="w-full max-w-xl bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-start gap-4 shadow-xl">
                <AlertOctagon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-red-400">Scan Failed</h4>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{scanError}</p>
                  <button
                    onClick={() => setScanStatus("idle")}
                    className="mt-3 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold px-4 py-2 rounded-lg border border-red-500/20 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* SCAN RESULTS DASHBOARD */}
            {scanStatus === "success" && report && (
              <div className="w-full mt-6 flex flex-col gap-6 animate-fade-in">
                {/* Result Title Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <Globe className="w-6 h-6 text-purple-400" />
                    <div>
                      <h2 className="text-xl font-extrabold text-zinc-100 truncate max-w-md">{report.url}</h2>
                      <p className="text-zinc-500 text-xs mt-0.5">Scanned on {new Date(report.scannedAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setScanStatus("idle");
                      setReport(null);
                    }}
                    className="text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 text-zinc-300 font-semibold px-4 py-2.5 rounded-xl transition-all"
                  >
                    Run Another Scan
                  </button>
                </div>

                {/* Main Dashboard Tabs */}
                <div className="flex border-b border-zinc-850 gap-2 overflow-x-auto pb-px">
                  <button
                    onClick={() => setActiveTab("ai")}
                    className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold tracking-wide uppercase border-b-2 transition-all ${
                      activeTab === "ai"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <Sparkles className="w-4 h-4" /> AI Website Doctor
                  </button>
                  <button
                    onClick={() => setActiveTab("performance")}
                    className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold tracking-wide uppercase border-b-2 transition-all ${
                      activeTab === "performance"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <Activity className="w-4 h-4" /> Performance
                  </button>
                  <button
                    onClick={() => setActiveTab("dom")}
                    className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold tracking-wide uppercase border-b-2 transition-all ${
                      activeTab === "dom"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <Code className="w-4 h-4" /> DOM Explorer
                  </button>
                  <button
                    onClick={() => setActiveTab("accessibility")}
                    className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold tracking-wide uppercase border-b-2 transition-all ${
                      activeTab === "accessibility"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <HeartPulse className="w-4 h-4" /> Accessibility
                  </button>
                  <button
                    onClick={() => setActiveTab("security")}
                    className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold tracking-wide uppercase border-b-2 transition-all ${
                      activeTab === "security"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" /> Security & Tech
                  </button>
                </div>

                {/* TAB CONTENTS */}
                <div className="min-h-[400px]">
                  
                  {/* AI WEBSITE DOCTOR TAB */}
                  {activeTab === "ai" && (
                    <div className="flex flex-col gap-6">
                      {/* Overall Health Card */}
                      <div className="bg-gradient-to-r from-zinc-900 to-purple-950/20 border border-purple-900/20 p-6 rounded-2xl shadow-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-5 h-5 text-purple-400" />
                          <h3 className="text-md font-bold uppercase tracking-wider text-purple-300">Doctor's Assessment</h3>
                        </div>
                        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
                          {report.aiSummary?.overallHealth || "AI summary could not be retrieved. Running diagnostics..."}
                        </p>
                      </div>

                      {/* AI Findings List */}
                      <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-zinc-400 text-sm uppercase tracking-wider pl-1">Actionable Diagnostics ({report.aiSummary?.findings.length || 0})</h4>
                        <div className="grid grid-cols-1 gap-4">
                          {report.aiSummary?.findings.map((f, idx) => (
                            <div key={idx} className="bg-zinc-900/40 border border-zinc-850 hover:border-zinc-800 p-5 rounded-2xl transition-all flex flex-col md:flex-row gap-4 items-start">
                              <div className="flex items-center md:items-start flex-shrink-0">
                                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border flex items-center ${getImpactColor(f.impact)}`}>
                                  {getImpactIcon(f.impact)}
                                  {f.impact} Priority
                                </span>
                              </div>
                              <div className="flex-1">
                                <h5 className="font-bold text-zinc-200 text-sm md:text-base flex items-center gap-2">
                                  {f.title}
                                  <span className="text-xs font-semibold text-zinc-500 uppercase px-1.5 py-0.5 rounded bg-zinc-950 tracking-wider">
                                    {f.category}
                                  </span>
                                </h5>
                                <p className="text-zinc-400 text-xs md:text-sm mt-2 leading-relaxed">{f.explanation}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PERFORMANCE TAB */}
                  {activeTab === "performance" && (
                    <div className="flex flex-col gap-8">
                      {/* Metric Gauges */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <ScoreGauge score={100 - Math.min((report.performance.lcp / 50), 100)} label="LCP (Largest Paint)" subtitle={`${(report.performance.lcp / 1000).toFixed(2)}s`} size={110} />
                        <ScoreGauge score={100 - Math.min((report.performance.fcp / 30), 100)} label="FCP (First Paint)" subtitle={`${(report.performance.fcp / 1000).toFixed(2)}s`} size={110} />
                        <ScoreGauge score={report.performance.cls < 0.1 ? 100 : report.performance.cls < 0.25 ? 70 : 30} label="CLS (Layout Shift)" subtitle={`${report.performance.cls.toFixed(3)}`} size={110} />
                        <ScoreGauge score={100 - Math.min((report.performance.tti / 100), 100)} label="TTI (Interactive)" subtitle={`${(report.performance.tti / 1000).toFixed(2)}s`} size={110} />
                        <ScoreGauge score={100 - Math.min((report.performance.totalLoadTime / 150), 100)} label="Speed Index" subtitle={`${(report.performance.totalLoadTime / 1000).toFixed(2)}s`} size={110} />
                      </div>

                      {/* Stats Overview */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4">
                          <Clock className="w-8 h-8 text-cyan-400" />
                          <div>
                            <span className="text-zinc-500 text-xs font-semibold block uppercase">Total Page Load Time</span>
                            <span className="text-xl font-bold text-zinc-200">{(report.performance.totalLoadTime / 1000).toFixed(2)}s</span>
                          </div>
                        </div>
                        <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4">
                          <Network className="w-8 h-8 text-purple-400" />
                          <div>
                            <span className="text-zinc-500 text-xs font-semibold block uppercase">Total Network Requests</span>
                            <span className="text-xl font-bold text-zinc-200">{report.performance.resourceCount} requests</span>
                          </div>
                        </div>
                        <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4">
                          <HardDrive className="w-8 h-8 text-emerald-400" />
                          <div>
                            <span className="text-zinc-500 text-xs font-semibold block uppercase">Total Page weight</span>
                            <span className="text-xl font-bold text-zinc-200">{(report.performance.totalTransferSize / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        </div>
                      </div>

                      {/* Waterfall */}
                      <div className="flex flex-col gap-3">
                        <h4 className="font-bold text-zinc-400 text-sm uppercase tracking-wider pl-1">Network Resource Loading Waterfall</h4>
                        <WaterfallChart requests={report.network.requests} />
                      </div>
                    </div>
                  )}

                  {/* DOM EXPLORER TAB */}
                  {activeTab === "dom" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left: DOM Stats */}
                      <div className="flex flex-col gap-4 lg:col-span-1">
                        <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl">
                          <h4 className="font-bold text-zinc-400 text-xs uppercase tracking-wider mb-4">DOM Hierarchy Summary</h4>
                          <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center py-2 border-b border-zinc-850">
                              <span className="text-zinc-400 text-xs">Total Node Count</span>
                              <span className={`text-sm font-bold ${report.dom.nodeCount > 1500 ? "text-rose-400" : report.dom.nodeCount > 800 ? "text-amber-400" : "text-emerald-400"}`}>
                                {report.dom.nodeCount} nodes
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-zinc-850">
                              <span className="text-zinc-400 text-xs">Maximum Nesting Depth</span>
                              <span className={`text-sm font-bold ${report.dom.maxDepth > 32 ? "text-rose-400" : report.dom.maxDepth > 24 ? "text-amber-400" : "text-emerald-400"}`}>
                                {report.dom.maxDepth} levels
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Largest Subtrees */}
                        <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl">
                          <h4 className="font-bold text-zinc-400 text-xs uppercase tracking-wider mb-4">Heaviest Subtrees (Node Bloat)</h4>
                          <div className="flex flex-col gap-3.5">
                            {report.dom.largestSubtrees?.map((sub, idx) => (
                              <div key={idx} className="flex flex-col gap-1">
                                <span className="text-[10px] text-purple-400 font-mono truncate block" title={sub.selector}>{sub.selector}</span>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-zinc-500">Node Weight</span>
                                  <span className="text-zinc-300 font-bold">{sub.nodeCount} children</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Interactive DOM Tree */}
                      <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl max-h-[600px] overflow-y-auto">
                        <h4 className="font-bold text-zinc-400 text-xs uppercase tracking-wider mb-4">Interactive DOM Tree Explorer</h4>
                        <div className="flex flex-col border border-zinc-850/50 rounded-xl bg-zinc-950 p-4">
                          <DOMTreeViewer node={report.dom.tree} />
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ACCESSIBILITY TAB */}
                  {activeTab === "accessibility" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left Side: Score & Breakdown */}
                      <div className="flex flex-col gap-4 lg:col-span-1">
                        <ScoreGauge score={report.accessibility.score} label="Accessibility Score" subtitle="axe-core compliance rating" size={130} />
                        
                        <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl">
                          <h4 className="font-bold text-zinc-400 text-xs uppercase tracking-wider mb-3">Audits Checklist</h4>
                          <div className="flex justify-between items-center py-2 border-b border-zinc-850">
                            <span className="text-emerald-400 text-xs font-semibold">Passed Audits</span>
                            <span className="text-sm font-bold text-emerald-400">{report.accessibility.passes} rules</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-rose-400 text-xs font-semibold">Failed Audits</span>
                            <span className="text-sm font-bold text-rose-400">{report.accessibility.violations.length} rules</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Violations Accordion */}
                      <div className="lg:col-span-2 flex flex-col gap-4">
                        <h4 className="font-bold text-zinc-400 text-sm uppercase tracking-wider pl-1">Compliance Violations ({report.accessibility.violations.length})</h4>
                        
                        {report.accessibility.violations.length === 0 ? (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-2xl text-center flex flex-col items-center">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
                            <h5 className="font-bold text-emerald-400">Zero Accessibility Violations Detected!</h5>
                            <p className="text-zinc-400 text-xs mt-1">Excellent work. This website fully respects client readability and helper navigation standards.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {report.accessibility.violations.map((violation, idx) => {
                              const sevColors = {
                                critical: "bg-red-500/10 text-red-400 border-red-500/20",
                                serious: "bg-orange-500/10 text-orange-400 border-orange-500/20",
                                moderate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                                minor: "bg-sky-500/10 text-sky-400 border-sky-500/20"
                              };
                              return (
                                <div key={idx} className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-5 hover:border-zinc-800 transition-colors">
                                  <div className="flex flex-wrap justify-between items-center gap-3">
                                    <div className="flex items-center gap-2">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${sevColors[violation.impact]}`}>
                                        {violation.impact}
                                      </span>
                                      <h5 className="font-bold text-zinc-200 text-sm">{violation.id}</h5>
                                    </div>
                                    <a
                                      href={violation.helpUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                                    >
                                      Rule Docs <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                  <p className="text-zinc-400 text-xs md:text-sm mt-3 leading-relaxed">{violation.description}</p>
                                  
                                  {/* Nodes Targeted */}
                                  <div className="mt-4 bg-zinc-950 rounded-xl p-3 border border-zinc-900">
                                    <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider mb-2">Targeted Elements ({violation.nodes.length})</span>
                                    <div className="flex flex-col gap-1.5 max-h-[120px] overflow-y-auto">
                                      {violation.nodes.map((node, nIdx) => (
                                        <code key={nIdx} className="text-[10px] font-mono text-purple-300 truncate block bg-zinc-900 p-1.5 rounded border border-zinc-850/50">
                                          {node}
                                        </code>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* SECURITY & TECH STACK TAB */}
                  {activeTab === "security" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Left: Security Headers */}
                      <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl flex flex-col gap-5">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-zinc-400 text-sm uppercase tracking-wider">Security Headers Compliance</h4>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                            report.security.score >= 80 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                              : report.security.score >= 50 
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}>
                            Score: {report.security.score}/100
                          </span>
                        </div>
                        <div className="flex flex-col gap-3 mt-1">
                          {report.security.headers.map((hdr, idx) => (
                            <div key={idx} className="flex justify-between items-start gap-4 py-3 border-b border-zinc-850/40 last:border-0">
                              <div className="flex-1">
                                <span className="font-semibold text-xs text-zinc-300 block">{hdr.header}</span>
                                <span className="text-[10px] text-zinc-500 mt-1 block leading-relaxed">{hdr.description}</span>
                              </div>
                              <div className="flex-shrink-0">
                                {hdr.present ? (
                                  <span className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                                    Present
                                  </span>
                                ) : (
                                  <span className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded border ${
                                    hdr.risk === "high" 
                                      ? "bg-red-500/10 text-red-400 border-red-500/20" 
                                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  }`}>
                                    Missing ({hdr.risk} risk)
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Tech Stack */}
                      <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl flex flex-col gap-6">
                        <h4 className="font-bold text-zinc-400 text-sm uppercase tracking-wider">Technology Stack Analysis</h4>
                        
                        <div className="flex flex-col gap-4">
                          {/* Hosting */}
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-2">Hosting Provider / Server</span>
                            <span className="px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-850/80 text-sm text-cyan-300 font-bold block w-fit">
                              {report.techStack.hosting || "Unknown"}
                            </span>
                          </div>

                          {/* Frameworks */}
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-2">JS Frameworks</span>
                            {report.techStack.frameworks.length === 0 ? (
                              <span className="text-xs text-zinc-500 italic block">No frameworks detected (Vanilla JS or Static)</span>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {report.techStack.frameworks.map((f, idx) => (
                                  <span key={idx} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-950 border border-zinc-850 text-purple-400">
                                    {f}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* CSS Libraries */}
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-2">CSS Architecture</span>
                            {report.techStack.cssLibraries.length === 0 ? (
                              <span className="text-xs text-zinc-500 italic block">Custom Vanilla CSS Stylesheets</span>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {report.techStack.cssLibraries.map((css, idx) => (
                                  <span key={idx} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-950 border border-zinc-850 text-pink-400">
                                    {css}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Analytics */}
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-2">Analytics & Trackers</span>
                            {report.techStack.analytics.length === 0 ? (
                              <span className="text-xs text-zinc-500 italic block">No analytics trackers detected</span>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {report.techStack.analytics.map((an, idx) => (
                                  <span key={idx} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-950 border border-zinc-850 text-emerald-400">
                                    {an}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Other */}
                          {report.techStack.other.length > 0 && (
                            <div>
                              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-2">Infrastructure & Bundlers</span>
                              <div className="flex flex-wrap gap-2">
                                {report.techStack.other.map((o, idx) => (
                                  <span key={idx} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-400">
                                    {o}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                </div>

              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* COMPARE SCANS MODULE */}
        {/* ========================================================================= */}
        {activeMode === "compare" && (
          <div className="flex flex-col items-center">
            {/* Dual Input Form */}
            {compareStatus !== "loading" && (
              <form onSubmit={handleCompareScan} className="w-full max-w-4xl bg-zinc-900/60 border border-zinc-850 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center shadow-3xl hover:border-zinc-800 transition-all backdrop-blur-sm">
                <div className="flex-1 w-full flex items-center bg-zinc-950 border border-zinc-850 p-2 rounded-xl">
                  <span className="text-purple-400 text-xs font-bold px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded mr-2 uppercase">Site A</span>
                  <input
                    type="text"
                    placeholder="First website (e.g. site1.com)..."
                    value={urlA}
                    onChange={(e) => setUrlA(e.target.value)}
                    className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-zinc-100 placeholder-zinc-600 text-sm py-2 px-2"
                    required
                  />
                </div>
                <div className="flex-1 w-full flex items-center bg-zinc-950 border border-zinc-850 p-2 rounded-xl">
                  <span className="text-cyan-400 text-xs font-bold px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded mr-2 uppercase">Site B</span>
                  <input
                    type="text"
                    placeholder="Second website (e.g. site2.com)..."
                    value={urlB}
                    onChange={(e) => setUrlB(e.target.value)}
                    className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-zinc-100 placeholder-zinc-600 text-sm py-2 px-2"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={!urlA || !urlB}
                  className="bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs md:text-sm font-semibold px-6 py-4 rounded-xl transition-all shadow-lg shadow-purple-500/15 disabled:opacity-50 flex items-center gap-2 flex-shrink-0 w-full md:w-auto justify-center"
                >
                  <GitCompare className="w-4 h-4" /> Run Comparison
                </button>
              </form>
            )}

            {/* Loading Box */}
            {compareStatus === "loading" && (
              <div className="w-full max-w-lg bg-zinc-900/50 border border-zinc-800/80 p-8 rounded-3xl flex flex-col items-center shadow-3xl text-center backdrop-blur-md">
                <RefreshCw className="w-10 h-10 text-purple-500 animate-spin mb-4" />
                <h3 className="text-lg font-bold text-zinc-200">Comparing Website Anatomy</h3>
                <p className="text-zinc-500 text-xs mt-1">Running Playwright and Lighthouse audits in parallel (approx 15-20s)</p>
                
                {/* Steps Visualizer */}
                <div className="w-full mt-6 bg-zinc-950 border border-zinc-900 rounded-xl p-4 divide-y divide-zinc-900 text-left">
                  {SCAN_STEPS.map((step, idx) => (
                    <div key={idx} className="flex items-center py-2 text-xs transition-opacity duration-300">
                      <span className="w-4 h-4 flex items-center justify-center mr-3">
                        {compareStepIdx > idx ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : compareStepIdx === idx ? (
                          <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                        )}
                      </span>
                      <span className={`${
                        compareStepIdx === idx 
                          ? "text-purple-400 font-semibold" 
                          : compareStepIdx > idx 
                          ? "text-zinc-500" 
                          : "text-zinc-650"
                      }`}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {compareStatus === "error" && (
              <div className="w-full max-w-xl bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-start gap-4 shadow-xl">
                <AlertOctagon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-red-400">Comparison Scan Failed</h4>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{compareError}</p>
                  <button
                    onClick={() => setCompareStatus("idle")}
                    className="mt-3 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold px-4 py-2 rounded-lg border border-red-500/20 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* COMPARISON RESULTS */}
            {compareStatus === "success" && reportA && reportB && (
              <div className="w-full mt-6 flex flex-col gap-6 animate-fade-in">
                {/* Result Title Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <GitCompare className="w-6 h-6 text-purple-400" />
                    <div>
                      <h2 className="text-base md:text-lg font-extrabold text-zinc-100 flex items-center gap-2 flex-wrap">
                        <span className="text-purple-400">{reportA.url}</span>
                        <span className="text-zinc-600 font-medium">vs</span>
                        <span className="text-cyan-400">{reportB.url}</span>
                      </h2>
                      <p className="text-zinc-500 text-xs mt-0.5">Dual comparison generated on {new Date().toLocaleString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCompareStatus("idle");
                      setReportA(null);
                      setReportB(null);
                    }}
                    className="text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 text-zinc-300 font-semibold px-4 py-2.5 rounded-xl transition-all"
                  >
                    Run Another Comparison
                  </button>
                </div>

                {/* Compare Tabs */}
                <div className="flex border-b border-zinc-850 gap-2 overflow-x-auto pb-px">
                  <button
                    onClick={() => setCompareActiveTab("overview")}
                    className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold tracking-wide uppercase border-b-2 transition-all ${
                      compareActiveTab === "overview"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    📊 Overview Matchup
                  </button>
                  <button
                    onClick={() => setCompareActiveTab("ai")}
                    className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold tracking-wide uppercase border-b-2 transition-all ${
                      compareActiveTab === "ai"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    🩺 AI Doctor Advice
                  </button>
                  <button
                    onClick={() => setCompareActiveTab("performance")}
                    className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold tracking-wide uppercase border-b-2 transition-all ${
                      compareActiveTab === "performance"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    ⚡ Page Speed Vitals
                  </button>
                  <button
                    onClick={() => setCompareActiveTab("accessibility")}
                    className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold tracking-wide uppercase border-b-2 transition-all ${
                      compareActiveTab === "accessibility"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    ♿ Accessibility Violations
                  </button>
                  <button
                    onClick={() => setCompareActiveTab("security")}
                    className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold tracking-wide uppercase border-b-2 transition-all ${
                      compareActiveTab === "security"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    🔒 Security Compliance
                  </button>
                </div>

                {/* COMPARE ACTIVE TABS */}
                <div className="min-h-[400px]">
                  
                  {/* OVERVIEW MATCHUP TAB */}
                  {compareActiveTab === "overview" && (
                    <div className="grid grid-cols-1 gap-6">
                      
                      {/* Metric Comparison Table */}
                      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="p-5 border-b border-zinc-850 bg-zinc-950/50">
                          <h4 className="font-bold text-zinc-300 text-sm">Site Matchup Analytics</h4>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs md:text-sm font-sans border-collapse">
                            <thead>
                              <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-500 font-bold uppercase tracking-wider">
                                <th className="p-4">Audited metric</th>
                                <th className="p-4 text-purple-400 truncate max-w-[200px]">{reportA.url}</th>
                                <th className="p-4 text-cyan-400 truncate max-w-[200px]">{reportB.url}</th>
                                <th className="p-4 text-center">Winner</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-850 text-zinc-300">
                              {/* Total Load Time */}
                              <tr className="hover:bg-zinc-800/10">
                                <td className="p-4 font-semibold">Speed Index (Load Time)</td>
                                <td className="p-4 font-mono">{(reportA.performance.totalLoadTime / 1000).toFixed(2)}s</td>
                                <td className="p-4 font-mono">{(reportB.performance.totalLoadTime / 1000).toFixed(2)}s</td>
                                <td className="p-4 text-center">
                                  {reportA.performance.totalLoadTime < reportB.performance.totalLoadTime ? (
                                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold text-xs uppercase">Site A</span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold text-xs uppercase">Site B</span>
                                  )}
                                </td>
                              </tr>

                              {/* LCP */}
                              <tr className="hover:bg-zinc-800/10">
                                <td className="p-4 font-semibold">Largest Contentful Paint (LCP)</td>
                                <td className="p-4 font-mono">{(reportA.performance.lcp / 1000).toFixed(2)}s</td>
                                <td className="p-4 font-mono">{(reportB.performance.lcp / 1000).toFixed(2)}s</td>
                                <td className="p-4 text-center">
                                  {reportA.performance.lcp < reportB.performance.lcp ? (
                                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold text-xs uppercase">Site A</span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold text-xs uppercase">Site B</span>
                                  )}
                                </td>
                              </tr>

                              {/* Accessibility Score */}
                              <tr className="hover:bg-zinc-800/10">
                                <td className="p-4 font-semibold">Accessibility Score</td>
                                <td className="p-4 font-mono text-purple-400 font-bold">{reportA.accessibility.score}/100</td>
                                <td className="p-4 font-mono text-cyan-400 font-bold">{reportB.accessibility.score}/100</td>
                                <td className="p-4 text-center">
                                  {reportA.accessibility.score > reportB.accessibility.score ? (
                                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold text-xs uppercase">Site A</span>
                                  ) : reportA.accessibility.score < reportB.accessibility.score ? (
                                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold text-xs uppercase">Site B</span>
                                  ) : (
                                    <span className="text-zinc-500 font-semibold text-xs">Tie</span>
                                  )}
                                </td>
                              </tr>

                              {/* Security Score */}
                              <tr className="hover:bg-zinc-800/10">
                                <td className="p-4 font-semibold">Security Header Compliance</td>
                                <td className="p-4 font-mono text-purple-400 font-bold">{reportA.security.score}/100</td>
                                <td className="p-4 font-mono text-cyan-400 font-bold">{reportB.security.score}/100</td>
                                <td className="p-4 text-center">
                                  {reportA.security.score > reportB.security.score ? (
                                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold text-xs uppercase">Site A</span>
                                  ) : reportA.security.score < reportB.security.score ? (
                                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold text-xs uppercase">Site B</span>
                                  ) : (
                                    <span className="text-zinc-500 font-semibold text-xs">Tie</span>
                                  )}
                                </td>
                              </tr>

                              {/* DOM Node Count */}
                              <tr className="hover:bg-zinc-800/10">
                                <td className="p-4 font-semibold">DOM node weight</td>
                                <td className="p-4 font-mono">{reportA.dom.nodeCount} nodes</td>
                                <td className="p-4 font-mono">{reportB.dom.nodeCount} nodes</td>
                                <td className="p-4 text-center">
                                  {reportA.dom.nodeCount < reportB.dom.nodeCount ? (
                                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold text-xs uppercase">Site A</span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold text-xs uppercase">Site B</span>
                                  )}
                                </td>
                              </tr>

                              {/* Network Requests Weight */}
                              <tr className="hover:bg-zinc-800/10">
                                <td className="p-4 font-semibold">Total Requests Weight</td>
                                <td className="p-4 font-mono">{(reportA.performance.totalTransferSize / 1024 / 1024).toFixed(2)} MB</td>
                                <td className="p-4 font-mono">{(reportB.performance.totalTransferSize / 1024 / 1024).toFixed(2)} MB</td>
                                <td className="p-4 text-center">
                                  {reportA.performance.totalTransferSize < reportB.performance.totalTransferSize ? (
                                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold text-xs uppercase">Site A</span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold text-xs uppercase">Site B</span>
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* COMPARE AI DOCTOR TAB */}
                  {compareActiveTab === "ai" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Doctor A */}
                      <div className="bg-zinc-900/40 border border-purple-500/15 p-6 rounded-2xl flex flex-col gap-4">
                        <div className="flex items-center gap-2 border-b border-zinc-850 pb-3">
                          <span className="text-purple-400 text-xs font-bold px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded uppercase">Site A</span>
                          <h4 className="font-bold text-zinc-300 truncate">{reportA.url}</h4>
                        </div>
                        <p className="text-zinc-400 text-xs leading-relaxed italic">{reportA.aiSummary?.overallHealth}</p>
                        <div className="flex flex-col gap-3 mt-2">
                          {reportA.aiSummary?.findings.slice(0, 3).map((f, idx) => (
                            <div key={idx} className="bg-zinc-950 p-4 border border-zinc-850 rounded-xl">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-zinc-200 text-xs">{f.title}</span>
                                <span className={`text-[9px] font-bold uppercase px-1.5 rounded ${f.impact === "high" ? "text-red-400" : "text-amber-400"}`}>{f.impact}</span>
                              </div>
                              <p className="text-[11px] text-zinc-500 mt-1">{f.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Doctor B */}
                      <div className="bg-zinc-900/40 border border-cyan-500/15 p-6 rounded-2xl flex flex-col gap-4">
                        <div className="flex items-center gap-2 border-b border-zinc-850 pb-3">
                          <span className="text-cyan-400 text-xs font-bold px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded uppercase">Site B</span>
                          <h4 className="font-bold text-zinc-300 truncate">{reportB.url}</h4>
                        </div>
                        <p className="text-zinc-400 text-xs leading-relaxed italic">{reportB.aiSummary?.overallHealth}</p>
                        <div className="flex flex-col gap-3 mt-2">
                          {reportB.aiSummary?.findings.slice(0, 3).map((f, idx) => (
                            <div key={idx} className="bg-zinc-950 p-4 border border-zinc-850 rounded-xl">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-zinc-200 text-xs">{f.title}</span>
                                <span className={`text-[9px] font-bold uppercase px-1.5 rounded ${f.impact === "high" ? "text-red-400" : "text-amber-400"}`}>{f.impact}</span>
                              </div>
                              <p className="text-[11px] text-zinc-500 mt-1">{f.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* COMPARE PERFORMANCE TAB */}
                  {compareActiveTab === "performance" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Perf A */}
                      <div className="bg-zinc-900/40 border border-purple-500/15 p-6 rounded-2xl flex flex-col gap-4">
                        <h4 className="font-bold text-purple-400 text-xs uppercase tracking-wider">{reportA.url} Performance</h4>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 text-center">
                            <span className="text-[10px] text-zinc-500 font-semibold block uppercase">Speed Index</span>
                            <span className="text-sm font-bold text-zinc-300 mt-0.5">{(reportA.performance.totalLoadTime / 1000).toFixed(2)}s</span>
                          </div>
                          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 text-center">
                            <span className="text-[10px] text-zinc-500 font-semibold block uppercase">LCP (Largest Paint)</span>
                            <span className="text-sm font-bold text-zinc-300 mt-0.5">{(reportA.performance.lcp / 1000).toFixed(2)}s</span>
                          </div>
                          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 text-center">
                            <span className="text-[10px] text-zinc-500 font-semibold block uppercase">FCP (First Paint)</span>
                            <span className="text-sm font-bold text-zinc-300 mt-0.5">{(reportA.performance.fcp / 1000).toFixed(2)}s</span>
                          </div>
                          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 text-center">
                            <span className="text-[10px] text-zinc-500 font-semibold block uppercase">CLS (Layout Shift)</span>
                            <span className="text-sm font-bold text-zinc-300 mt-0.5">{reportA.performance.cls.toFixed(3)}</span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <span className="text-[10px] text-zinc-500 font-semibold block uppercase mb-2">Timing Waterfall (First 50 Requests)</span>
                          <WaterfallChart requests={reportA.network.requests.slice(0, 50)} />
                        </div>
                      </div>

                      {/* Perf B */}
                      <div className="bg-zinc-900/40 border border-cyan-500/15 p-6 rounded-2xl flex flex-col gap-4">
                        <h4 className="font-bold text-cyan-400 text-xs uppercase tracking-wider">{reportB.url} Performance</h4>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 text-center">
                            <span className="text-[10px] text-zinc-500 font-semibold block uppercase">Speed Index</span>
                            <span className="text-sm font-bold text-zinc-300 mt-0.5">{(reportB.performance.totalLoadTime / 1000).toFixed(2)}s</span>
                          </div>
                          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 text-center">
                            <span className="text-[10px] text-zinc-500 font-semibold block uppercase">LCP (Largest Paint)</span>
                            <span className="text-sm font-bold text-zinc-300 mt-0.5">{(reportB.performance.lcp / 1000).toFixed(2)}s</span>
                          </div>
                          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 text-center">
                            <span className="text-[10px] text-zinc-500 font-semibold block uppercase">FCP (First Paint)</span>
                            <span className="text-sm font-bold text-zinc-300 mt-0.5">{(reportB.performance.fcp / 1000).toFixed(2)}s</span>
                          </div>
                          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 text-center">
                            <span className="text-[10px] text-zinc-500 font-semibold block uppercase">CLS (Layout Shift)</span>
                            <span className="text-sm font-bold text-zinc-300 mt-0.5">{reportB.performance.cls.toFixed(3)}</span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <span className="text-[10px] text-zinc-500 font-semibold block uppercase mb-2">Timing Waterfall (First 50 Requests)</span>
                          <WaterfallChart requests={reportB.network.requests.slice(0, 50)} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* COMPARE ACCESSIBILITY TAB */}
                  {compareActiveTab === "accessibility" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* A11y A */}
                      <div className="bg-zinc-900/40 border border-purple-500/15 p-6 rounded-2xl flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                          <h4 className="font-bold text-purple-400 text-xs uppercase tracking-wider">{reportA.url} Accessibility</h4>
                          <span className="text-sm font-bold text-purple-300">{reportA.accessibility.score}/100</span>
                        </div>
                        <span className="text-zinc-500 text-[10px] uppercase font-bold block">Violations List ({reportA.accessibility.violations.length})</span>
                        <div className="flex flex-col gap-2.5 max-h-[400px] overflow-y-auto">
                          {reportA.accessibility.violations.length === 0 ? (
                            <p className="text-emerald-400 text-xs italic">No violations detected!</p>
                          ) : (
                            reportA.accessibility.violations.map((v, idx) => (
                              <div key={idx} className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
                                <span className="font-bold text-zinc-200 text-xs block">{v.id}</span>
                                <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">{v.description}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* A11y B */}
                      <div className="bg-zinc-900/40 border border-cyan-500/15 p-6 rounded-2xl flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                          <h4 className="font-bold text-cyan-400 text-xs uppercase tracking-wider">{reportB.url} Accessibility</h4>
                          <span className="text-sm font-bold text-cyan-300">{reportB.accessibility.score}/100</span>
                        </div>
                        <span className="text-zinc-500 text-[10px] uppercase font-bold block">Violations List ({reportB.accessibility.violations.length})</span>
                        <div className="flex flex-col gap-2.5 max-h-[400px] overflow-y-auto">
                          {reportB.accessibility.violations.length === 0 ? (
                            <p className="text-emerald-400 text-xs italic">No violations detected!</p>
                          ) : (
                            reportB.accessibility.violations.map((v, idx) => (
                              <div key={idx} className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
                                <span className="font-bold text-zinc-200 text-xs block">{v.id}</span>
                                <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">{v.description}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* COMPARE SECURITY TAB */}
                  {compareActiveTab === "security" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Security A */}
                      <div className="bg-zinc-900/40 border border-purple-500/15 p-6 rounded-2xl flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                          <h4 className="font-bold text-purple-400 text-xs uppercase tracking-wider">{reportA.url} Security</h4>
                          <span className="text-sm font-bold text-purple-300">{reportA.security.score}/100</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          {reportA.security.headers.map((h, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2 border-b border-zinc-850/30 last:border-0">
                              <span className="text-zinc-400 text-xs">{h.header}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                h.present 
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                  : "bg-red-500/10 text-red-400 border-red-500/20"
                              }`}>
                                {h.present ? "Present" : "Missing"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Security B */}
                      <div className="bg-zinc-900/40 border border-cyan-500/15 p-6 rounded-2xl flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                          <h4 className="font-bold text-cyan-400 text-xs uppercase tracking-wider">{reportB.url} Security</h4>
                          <span className="text-sm font-bold text-cyan-300">{reportB.security.score}/100</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          {reportB.security.headers.map((h, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2 border-b border-zinc-850/30 last:border-0">
                              <span className="text-zinc-400 text-xs">{h.header}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                h.present 
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                  : "bg-red-500/10 text-red-400 border-red-500/20"
                              }`}>
                                {h.present ? "Present" : "Missing"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
