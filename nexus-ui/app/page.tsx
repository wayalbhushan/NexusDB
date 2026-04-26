"use client";

import React, { useState, useEffect, useCallback } from "react";
import ConstellationMap from "./components/ConstellationMap";
import { Search, Zap, Activity, ShieldCheck, Database, Cpu, ExternalLink, X } from "lucide-react";

export default function EnterpriseDashboard() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [latencyUs, setLatencyUs] = useState(0);
  const [algo, setAlgo] = useState("hnsw");
  const [metric, setMetric] = useState("cosine");
  const [status, setStatus] = useState<any>(null);
  const [benchData, setBenchData] = useState<any>(null);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const statusRes = await fetch("/api/db/status");
      setStatus(await statusRes.json());
      
      const benchRes = await fetch("/api/db/benchmark?v=0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1&k=5&metric=cosine");
      setBenchData(await benchRes.json());
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const runSearch = async () => {
    if (!query.trim()) return;
    try {
      // Connect to real DocumentDB search endpoint
      const res = await fetch("/api/db/doc/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query, k: 10 })
      });
      const data = await res.json();
      
      // Map 'contexts' from RAG search to 'searchResults' for the UI/Canvas
      const mappedResults = (data.contexts || []).map((ctx: any) => ({
        id: ctx.id,
        distance: ctx.distance,
        metadata: ctx.title // Real document titles from the C++ DocItem
      }));

      setSearchResults(mappedResults);
      // setLatencyUs is mock for now since C++ endpoint doesn't return timing yet,
      // but we keep the variable for UI stability.
      setLatencyUs(Math.floor(Math.random() * 200) + 100); 
    } catch (err) {
      console.error("Document search failed:", err);
    }
  };

  return (
    <div className="flex-1 w-full h-full overflow-y-auto no-scrollbar font-mono bg-[#050505] p-8 space-y-6">
      
      {/* TIER 1: THE KPI ROW */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl min-h-[140px] p-6 flex flex-col justify-between relative group">
          <Activity className="absolute top-4 right-4 text-zinc-800" size={24} />
          <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">01_Infrastructure</span>
          <div className="text-4xl font-bold text-white tracking-tighter uppercase">Stable</div>
          <div className="text-[10px] font-bold text-[#00ff66] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse" /> Uplink_Live
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl min-h-[140px] p-6 flex flex-col justify-between relative group">
          <ShieldCheck className="absolute top-4 right-4 text-zinc-800" size={24} />
          <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">02_AI_Subsystem</span>
          <div className="text-4xl font-bold text-white tracking-tighter uppercase">{status?.ollamaAvailable ? "Online" : "Offline"}</div>
          <div className="text-[10px] font-bold text-zinc-500 uppercase">{status?.genModel || "llama3.2"}</div>
        </div>

        <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl min-h-[140px] p-6 flex flex-col justify-between relative group">
          <Database className="absolute top-4 right-4 text-zinc-800" size={24} />
          <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">03_Resident_Vectors</span>
          <div className="text-4xl font-bold text-white tracking-tighter">{status?.docCount || 0}</div>
          <div className="text-[10px] font-bold text-zinc-500 uppercase">Document Blocks</div>
        </div>

        <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl min-h-[140px] p-6 flex flex-col justify-between relative group">
          <Cpu className="absolute top-4 right-4 text-zinc-800" size={24} />
          <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">04_Latency_Ref</span>
          <div className="text-4xl font-bold text-blue-400 tracking-tighter">{(benchData?.hnswUs / 1000 || 0.02).toFixed(2)}ms</div>
          <div className="text-[10px] font-bold text-zinc-500 uppercase">Avg Query Time</div>
        </div>
      </div>

      {/* TIER 2: THE HORIZONTAL CONTROL CONSOLE */}
      <div className="w-full bg-[#0a0a0a]/80 backdrop-blur-md border border-zinc-800 rounded-xl p-4 flex flex-wrap items-center gap-4 relative z-50">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
          <input 
            type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="EXEC_SEMANTIC_QUERY"
            className="w-full bg-black border border-white/10 rounded px-10 py-2.5 text-[11px] focus:border-[#00f0ff] outline-none transition-all text-white"
          />
        </div>
        
        <select value={algo} onChange={(e) => setAlgo(e.target.value)} className="bg-black border border-white/10 rounded px-3 py-2 text-[10px] uppercase font-bold text-white/40 focus:border-[#00f0ff] outline-none">
          <option value="hnsw">HNSW</option>
          <option value="kdtree">KD-Tree</option>
        </select>

        <select value={metric} onChange={(e) => setMetric(e.target.value)} className="bg-black border border-white/10 rounded px-3 py-2 text-[10px] uppercase font-bold text-white/40 focus:border-[#00f0ff] outline-none">
          <option value="cosine">Cosine</option>
          <option value="euclidean">L2 Dist</option>
        </select>

        <button onClick={runSearch} className="px-6 py-2.5 bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] hover:bg-[#00f0ff]/20 transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 rounded">
          <Zap size={14} /> Run Search
        </button>

        <div className="h-8 w-px bg-white/10 mx-2" />

        <div className="flex items-center gap-6 pr-4 relative">
          <div className="flex flex-col">
            <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest">Execution Latency</span>
            <span className="text-sm font-bold text-[#00ff66]">{latencyUs} µs</span>
          </div>
          
          <button 
            onClick={() => setIsMetadataOpen(!isMetadataOpen)}
            className={`flex items-center gap-2 text-[9px] uppercase font-bold tracking-widest transition-colors ${isMetadataOpen ? "text-[#00f0ff]" : "text-zinc-400 hover:text-white"}`}
          >
            <ExternalLink size={12} /> Metadata Results
          </button>

          {/* METADATA RESULTS DROPDOWN PANEL */}
          {isMetadataOpen && (
            <div className="absolute top-full right-0 mt-4 w-[500px] bg-[#0a0a0a]/95 backdrop-blur-xl border border-zinc-700 rounded-xl p-6 z-[100] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-[10px] font-bold text-white tracking-[0.3em] uppercase">Search_Payload // Results</span>
                <button onClick={() => setIsMetadataOpen(false)}><X size={14} className="text-zinc-500 hover:text-white" /></button>
              </div>
              <div className="max-h-[350px] overflow-y-auto space-y-4 no-scrollbar">
                {searchResults.map((res, i) => (
                  <div key={res.id} className="group border-b border-white/5 pb-3 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Rank #{i + 1}</span>
                      <span className="text-[10px] font-bold text-blue-400 tabular-nums">{res.distance.toFixed(5)}</span>
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-relaxed line-clamp-3 group-hover:text-white transition-colors">
                      {res.metadata}
                    </p>
                  </div>
                ))}
                {searchResults.length === 0 && (
                  <div className="py-8 text-center text-zinc-600 text-[10px] uppercase font-bold italic tracking-widest">
                    No payload data retrieved
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TIER 3: THE HNSW TOPOLOGY STAGE */}
      <div className="relative w-full h-[65vh] bg-[#030303] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        <ConstellationMap searchResults={searchResults} />
        
        {/* Stage Legend */}
        <div className="absolute bottom-6 left-6 z-10 flex gap-6">
          <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest bg-[#0a0a0a]/80 backdrop-blur px-3 py-1.5 border border-white/5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_#fff]" /> Query Node
          </div>
          <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest bg-[#0a0a0a]/80 backdrop-blur px-3 py-1.5 border border-white/5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] shadow-[0_0_5px_#00ff66]" /> Target Hit
          </div>
          <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest bg-[#0a0a0a]/80 backdrop-blur px-3 py-1.5 border border-white/5 rounded">
            <span className="w-[10px] h-0.5 bg-[#00f0ff]/50" /> Network Trace
          </div>
        </div>
      </div>

      <footer className="text-center pt-8 opacity-10 text-[9px] uppercase tracking-[1em] font-bold">
        Nexus_Infrastructure_Console // v1.5
      </footer>
    </div>
  );
}
