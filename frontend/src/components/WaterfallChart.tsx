import React, { useState, useMemo } from "react";
import type { NetworkRequest } from "@web-inspectra/shared-types";
import { Search, HelpCircle } from "lucide-react";

interface WaterfallChartProps {
  requests: NetworkRequest[];
}

type FilterType = "all" | "document" | "script" | "stylesheet" | "image" | "font" | "xhr" | "fetch" | "other";

export default function WaterfallChart({ requests }: WaterfallChartProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const timingLimits = useMemo(() => {
    if (requests.length === 0) return { maxTime: 1000 };
    
    let maxTime = 100;
    requests.forEach(r => {
      const endTime = r.startTime + r.duration;
      if (endTime > maxTime) {
        maxTime = endTime;
      }
    });
    
    return { maxTime };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchesSearch = r.url.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilter === "all" 
        || r.resourceType === activeFilter 
        || (activeFilter === "xhr" && r.resourceType === "fetch")
        || (activeFilter === "fetch" && r.resourceType === "xhr");
      return matchesSearch && matchesFilter;
    });
  }, [requests, searchTerm, activeFilter]);

  const getTypeColor = (type: NetworkRequest["resourceType"]) => {
    switch (type) {
      case "document": return "bg-blue-500 border-blue-400";
      case "script": return "bg-yellow-500 border-yellow-400";
      case "stylesheet": return "bg-pink-500 border-pink-400";
      case "image": return "bg-purple-500 border-purple-400";
      case "font": return "bg-teal-500 border-teal-400";
      case "xhr":
      case "fetch": return "bg-emerald-500 border-emerald-400";
      default: return "bg-zinc-500 border-zinc-400";
    }
  };

  const getTypeText = (type: NetworkRequest["resourceType"]) => {
    switch (type) {
      case "document": return "text-blue-400";
      case "script": return "text-yellow-400";
      case "stylesheet": return "text-pink-400";
      case "image": return "text-purple-400";
      case "font": return "text-teal-400";
      case "xhr":
      case "fetch": return "text-emerald-400";
      default: return "text-zinc-400";
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
      <div className="flex flex-col md:flex-row gap-4 p-4 border-b border-zinc-800 bg-zinc-950/80 items-center justify-between">
        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Filter by request URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 placeholder-zinc-500"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 justify-center">
          {(["all", "document", "script", "stylesheet", "image", "font", "xhr"] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize border transition-all ${
                activeFilter === f
                  ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
              }`}
            >
              {f === "xhr" ? "Fetch/XHR" : f === "document" ? "Doc" : f === "stylesheet" ? "CSS" : f === "script" ? "JS" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px] flex flex-col">
          <div className="flex py-2 px-4 border-b border-zinc-800 bg-zinc-950 text-xs font-semibold text-zinc-500 tracking-wider">
            <div className="w-[30%]">Resource URL</div>
            <div className="w-[10%] text-center">Type</div>
            <div className="w-[8%] text-center">Status</div>
            <div className="w-[10%] text-right">Size</div>
            <div className="w-[10%] text-right">Time</div>
            <div className="w-[32%] pl-6">Timeline (Relative Waterfall)</div>
          </div>

          <div className="max-h-[400px] overflow-y-auto divide-y divide-zinc-800/50">
            {filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                <HelpCircle className="w-12 h-12 mb-3 text-zinc-700 animate-pulse" />
                <p className="text-sm">No matching network requests found.</p>
              </div>
            ) : (
              filteredRequests.map((req, idx) => {
                let filename = "/";
                let displayUrl = req.url;
                try {
                  const urlObj = new URL(req.url);
                  filename = urlObj.pathname.split("/").pop() || urlObj.pathname || "/";
                  displayUrl = urlObj.hostname + (urlObj.pathname.length > 30 ? urlObj.pathname.substring(0, 30) + "..." : urlObj.pathname);
                } catch (e) {
                  // Fallback for relative or invalid URLs
                  const segments = req.url.split("/");
                  filename = segments.pop() || "/";
                  displayUrl = req.url.substring(0, 45) + (req.url.length > 45 ? "..." : "");
                }

                const startOffsetPct = (req.startTime / timingLimits.maxTime) * 100;
                const durationPct = Math.max((req.duration / timingLimits.maxTime) * 100, 1.5);

                return (
                  <div key={idx} className="flex py-2.5 px-4 text-xs font-mono text-zinc-300 hover:bg-zinc-800/30 items-center">
                    <div className="w-[30%] truncate flex flex-col pr-2" title={req.url}>
                      <span className="font-semibold text-zinc-200 truncate">{filename}</span>
                      <span className="text-[10px] text-zinc-500 truncate mt-0.5">{displayUrl}</span>
                    </div>

                    <div className={`w-[10%] text-center capitalize font-semibold ${getTypeText(req.resourceType)}`}>
                      {req.resourceType === "xhr" || req.resourceType === "fetch" ? "Fetch" : req.resourceType}
                    </div>

                    <div className="w-[8%] text-center font-bold">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        req.failed || req.status >= 400
                          ? "bg-red-500/10 text-red-400 border border-red-500/25"
                          : req.status >= 300
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                      }`}>
                        {req.failed ? "Failed" : req.status}
                      </span>
                    </div>

                    <div className="w-[10%] text-right text-zinc-400">
                      {req.size > 0 ? formatSize(req.size) : "Cached"}
                    </div>

                    <div className="w-[10%] text-right text-zinc-400 font-semibold">
                      {req.duration} ms
                    </div>

                    <div className="w-[32%] h-7 flex items-center relative pl-6 select-none">
                      <div className="w-full h-1 bg-zinc-800 rounded-full relative">
                        <div
                          className={`h-3 -top-1 absolute rounded-sm border-l-2 transition-all duration-300 hover:scale-y-125 ${getTypeColor(req.resourceType)}`}
                          style={{
                            left: `${startOffsetPct}%`,
                            width: `${durationPct}%`
                          }}
                          title={`Start: ${req.startTime.toFixed(0)}ms, Duration: ${req.duration}ms`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      
      <div className="flex p-3 bg-zinc-950 border-t border-zinc-800 text-[10px] text-zinc-500 justify-between items-center px-4 font-sans">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-500" /> HTML Document</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-yellow-500" /> Javascript</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-pink-500" /> Stylesheet</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-purple-500" /> Image</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Fetch/XHR</span>
        </div>
        <div>
          Showing {filteredRequests.length} of {requests.length} requests • Max Timeline: {timingLimits.maxTime.toFixed(0)} ms
        </div>
      </div>
    </div>
  );
}
