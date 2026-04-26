"use client";

import { useState } from "react";
import { FileUp, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function IngestPage() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ids: number[]; chunks: number; dims: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !text) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/db/doc/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, text })
      });

      const data = await res.json();
      
      if (res.ok) {
        setResult(data);
        setTitle("");
        setText("");
      } else {
        setError(data.error || "UNKNOWN ENGINE ERROR");
      }
    } catch (err) {
      setError("CONNECTION FAILED // ENGINE UNREACHABLE");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-mono">
      <div className="border-b border-white/10 pb-6">
        <h2 className="text-3xl font-bold text-white tracking-tighter flex items-center gap-3">
          <FileUp className="text-neon-blue" /> DATA_INGESTION
        </h2>
        <p className="text-sm text-gray-500 mt-1">VECTORIZE DOCUMENTS INTO HNSW GRAPH</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleIngest} className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Document Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. SYSTEM_ARCHITECTURE_V2"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-neon-blue transition-colors text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Payload Content</label>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste raw text for semantic indexing..."
              rows={12}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-neon-blue transition-colors text-white resize-none"
            />
          </div>

          <button 
            type="submit"
            disabled={loading || !title || !text}
            className="w-full py-4 bg-neon-blue/10 border border-neon-blue/50 text-neon-blue rounded-lg hover:bg-neon-blue/20 transition-all font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50 group"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Embeddings...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                ⚡ EMBED & INSERT
              </>
            )}
          </button>
        </form>

        <div className="space-y-6">
          <div className="glass p-6 rounded-xl border border-white/5 h-fit">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Ingestion Status</h3>
            
            {loading && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs text-neon-blue">
                  <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
                  <span>Ollama: Computing Embeddings</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-neon-blue">
                  <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
                  <span>NexusDB: Updating HNSW Layers</span>
                </div>
              </div>
            )}

            {!loading && !result && !error && (
              <p className="text-xs text-gray-500 italic">Waiting for transmission...</p>
            )}

            {error && (
              <div className="flex items-start gap-3 text-xs text-red-500 bg-red-500/10 p-3 rounded border border-red-500/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-xs text-neon-green bg-neon-green/10 p-3 rounded border border-neon-green/20">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>INJECTION SUCCESSFUL</span>
                </div>
                
                <div className="space-y-2 text-[10px] uppercase font-bold text-gray-400 mt-4">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>Chunks Created</span>
                    <span className="text-white">{result.chunks}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>Vector Dims</span>
                    <span className="text-white">{result.dims}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>Base IDs</span>
                    <span className="text-white">[{result.ids.join(", ")}]</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="glass p-6 rounded-xl border border-white/5 bg-gradient-to-br from-neon-blue/5 to-transparent">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-white">Pro Tip</h3>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Large documents are automatically chunked into 250-word segments with 30-word overlap to preserve semantic context during retrieval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
