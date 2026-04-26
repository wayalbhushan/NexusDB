"use client";

import React, { useEffect, useRef } from "react";

interface SearchResult {
  id: number;
  distance: number;
  category: string;
  metadata: string;
}

interface TelemetryPanelProps {
  latencyUs: number;
  results: SearchResult[];
  rawVector: number[];
  algo: string;
  metric: string;
}

export default function TelemetryPanel({ latencyUs, results, rawVector, algo, metric }: TelemetryPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the raw vector box
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [rawVector]);

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] border-l border-white/5 font-mono text-[11px] overflow-hidden">
      {/* Latency Section */}
      <div className="p-6 border-b border-white/5 bg-[#0a0a0a]">
        <div className="flex justify-between items-center mb-2">
          <span className="text-zinc-400 uppercase tracking-widest text-[10px] font-bold">Execution Latency</span>
          <span className="text-white/20 text-[9px]">{algo.toUpperCase()} // {metric.toUpperCase()}</span>
        </div>
        <div className="text-4xl font-bold tracking-tighter text-[#00ff66] drop-shadow-[0_0_15px_rgba(0,255,102,0.3)]">
          {latencyUs < 1000 ? `${latencyUs} μs` : `${(latencyUs / 1000).toFixed(2)} ms`}
        </div>
      </div>

      {/* Results Table */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#0d0d0d] z-10">
            <tr className="text-zinc-400 uppercase text-[9px] tracking-widest border-b border-white/5">
              <th className="px-4 py-3 font-bold">Rank</th>
              <th className="px-4 py-3 font-bold text-right">Distance</th>
              <th className="px-4 py-3 font-bold">Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {results.map((res, i) => {
              const badgeColors: Record<string, string> = {
                CS: "text-[#00f0ff] border-[#00f0ff]/30 bg-[#00f0ff]/5",
                MATH: "text-[#ff007f] border-[#ff007f]/30 bg-[#ff007f]/5",
                FOOD: "text-[#ffcc00] border-[#ffcc00]/30 bg-[#ffcc00]/5",
                SPORT: "text-[#00ff66] border-[#00ff66]/30 bg-[#00ff66]/5",
                default: "text-zinc-400 border-zinc-400/30 bg-zinc-400/5",
              };
              const badgeStyle = badgeColors[res.category] || badgeColors.default;

              return (
                <tr key={res.id} className="hover:bg-white/2 group transition-colors">
                  <td className="px-4 py-4 text-white/50">#{i + 1}</td>
                  <td className="px-4 py-4 text-right tabular-nums text-[#00f0ff] font-bold">
                    {res.distance.toFixed(5)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex">
                        <span className={`text-[8px] px-1.5 py-0.5 border rounded uppercase font-bold tracking-tighter ${badgeStyle}`}>
                          {res.category}
                        </span>
                      </div>
                      <span className="text-white/80 leading-relaxed line-clamp-2">
                        {res.metadata}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {results.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-white/10 italic uppercase tracking-widest">
                  No active telemetry
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Raw Vector Stream */}
      <div className="h-32 p-3 bg-black border-t border-white/5">
        <div className="text-[9px] text-zinc-400 uppercase tracking-widest mb-2 flex justify-between">
          <span>Raw Vector Output</span>
          <span className="animate-pulse text-[#00ff66]">STREAMING_ACTIVE</span>
        </div>
        <div 
          ref={scrollRef}
          className="h-20 overflow-y-auto text-[#00ff66]/60 text-[9px] leading-tight break-all scroll-smooth no-scrollbar"
        >
          {rawVector.length > 0 ? (
            `[ ${rawVector.map(v => v.toFixed(4)).join(", ")} ]`
          ) : (
            "SYSTEM_IDLE // WAITING FOR QUERY..."
          )}
        </div>
      </div>
    </div>
  );
}
