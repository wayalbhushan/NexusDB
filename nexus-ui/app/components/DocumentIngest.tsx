"use client";

import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle2, ShieldCheck, Database, Cpu } from "lucide-react";

interface ServerStatus {
  ollamaAvailable: boolean;
  embedModel: string;
  genModel: string;
  docCount: number;
}

export default function DocumentIngest() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/db/status");
      const data = await res.json();
      setStatus(data);
    } catch (_) {}
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleIngest = async () => {
    if (!title || !text || loading) return;
    setLoading(true);
    setSuccess(false);
    try {
      const res = await fetch("/api/db/doc/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, text })
      });
      if (res.ok) {
        setSuccess(true);
        setTitle("");
        setText("");
        fetchStatus();
      }
    } catch (_) {} finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8 font-mono">
      {/* Input Side */}
      <div className="space-y-6">
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 border-b border-white/5 pb-2">
          Document Ingestion Core
        </h3>
        <div className="space-y-4">
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="METADATA_IDENTIFIER"
            className="w-full bg-[#0d0d0d] border border-white/10 rounded px-4 py-3 text-[11px] focus:outline-none focus:border-[#00f0ff] transition-colors text-white placeholder:text-white/10"
          />
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="RAW_TEXT_PAYLOAD_BLOCK"
            rows={10}
            className="w-full bg-[#0d0d0d] border border-white/10 rounded px-4 py-3 text-[11px] focus:outline-none focus:border-[#00f0ff] transition-colors text-white resize-none placeholder:text-white/10"
          />
          <button 
            onClick={handleIngest}
            disabled={loading || !title || !text}
            className="w-full py-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 disabled:opacity-20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Initiate Vectorization"}
          </button>
        </div>
      </div>

      {/* Status Side */}
      <div className="space-y-6">
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 border-b border-white/5 pb-2">
          Subsystem Telemetry
        </h3>
        <div className="glass p-6 rounded-lg border border-white/5 bg-[#0a0a0a] space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className={status?.ollamaAvailable ? "text-[#00ff66]" : "text-red-500"} size={16} />
              <span className="text-[10px] uppercase tracking-widest font-bold text-white/80">Ollama Daemon</span>
            </div>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${status?.ollamaAvailable ? "bg-[#00ff66]/10 text-[#00ff66]" : "bg-red-500/10 text-red-500"}`}>
              {status?.ollamaAvailable ? "CONNECTED" : "LINK_LOST"}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-white/40 uppercase">Embedding Core</span>
              <span className="text-white/80 font-bold">{status?.embedModel || "nomic-embed-text"}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-white/40 uppercase">Indexing Engine</span>
              <span className="text-white/80 font-bold text-right">NexusDB v1.4 // HNSW</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-white/40 uppercase">Resident Documents</span>
              <span className="text-[#00f0ff] font-bold">{status?.docCount || 0} Blocks</span>
            </div>
          </div>

          {success && (
            <div className="p-3 bg-[#00ff66]/5 border border-[#00ff66]/20 rounded flex items-center gap-3 text-[10px] text-[#00ff66] animate-in fade-in zoom-in duration-300">
              <CheckCircle2 size={14} />
              <span>ENTRY_INDEXED_SUCCESSFULLY</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
