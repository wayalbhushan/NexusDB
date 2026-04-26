"use client";

import React from "react";

interface BenchmarkData {
  bruteforceUs: number;
  kdtreeUs: number;
  hnswUs: number;
}

interface BenchmarkVisualizerProps {
  data: BenchmarkData | null;
}

export default function BenchmarkVisualizer({ data }: BenchmarkVisualizerProps) {
  if (!data) return null;

  const maxUs = Math.max(data.bruteforceUs, data.kdtreeUs, data.hnswUs, 1);

  const ProgressRow = ({ label, us, color }: { label: string; us: number; color: string }) => {
    const percent = (us / maxUs) * 100;
    const barLength = 40;
    const filled = Math.round((percent / 100) * barLength);
    const barStr = `[${"=".repeat(filled).padEnd(barLength, " ")}]`;

    return (
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
          <span className="text-white/60">{label}</span>
          <span style={{ color }}>{us < 1000 ? `${us} μs` : `${(us / 1000).toFixed(2)} ms`}</span>
        </div>
        <div className="font-mono text-[10px] whitespace-pre tracking-tighter" style={{ color }}>
          {barStr}
        </div>
      </div>
    );
  };

  return (
    <div className="glass p-6 rounded-lg border border-white/5 bg-[#0a0a0a] space-y-6">
      <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 mb-4 border-b border-white/5 pb-2">
        Algorithmic Benchmark Analysis
      </h3>
      
      <div className="space-y-6">
        <ProgressRow label="Linear Brute Force" us={data.bruteforceUs} color="#f87171" />
        <ProgressRow label="KD-Tree Index" us={data.kdtreeUs} color="#60a5fa" />
        <ProgressRow label="HNSW Graph" us={data.hnswUs} color="#c084fc" />
      </div>

      <div className="mt-4 p-3 bg-white/2 rounded text-[9px] text-white/30 leading-relaxed italic border border-white/5">
        HNSW efficiency stems from logarithmic complexity O(log N) through hierarchical graph traversal.
      </div>
    </div>
  );
}
