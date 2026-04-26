"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, Terminal, ChevronDown, ChevronUp, FileText, Loader2, Cpu } from "lucide-react";

interface Context {
  id: number;
  title: string;
  text: string;
  distance: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  contexts?: Context[];
}

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedContext, setExpandedContext] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout for cold start

    try {
      const res = await fetch("/api/db/doc/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input, k: 3 }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const errorText = await res.text();
        const origin = res.headers.get("X-Engine") === "NexusDB" ? "ENGINE_CRASH" : "PROXY_TIMEOUT";
        throw new Error(`${origin}_${res.status}: ${errorText || "Internal Server Error"}`);
      }

      const data = await res.json();

      const assistantMsg: Message = { 
        role: "assistant", 
        content: data.answer, 
        contexts: data.contexts 
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("RAG Query Failed:", err);
      
      const errorDisplay = err.name === 'AbortError' 
        ? "AI CORE COLD_START_TIMEOUT (120s EXCEEDED)" 
        : err.message.toUpperCase();

      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: `ERROR: ${errorDisplay} // UPLINK_DENIED` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full font-sans max-w-5xl mx-auto p-8 overflow-hidden">
      <div className="border-b border-white/5 pb-6 mb-6 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tighter flex items-center gap-3">
              <Cpu className="text-[#00f0ff] w-8 h-8" /> NEXUS_RAG_CORE
            </h2>
            <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-[0.2em] font-mono">NEURAL_TERMINAL // V1.5 // LLM_GENERATIVE_CONTEXT</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">System_Health</span>
              <span className="text-xs text-[#00ff66] font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse" /> OPTIMAL
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-10 pr-4 custom-scrollbar scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-700 space-y-4">
            <div className="w-16 h-16 rounded-full border border-zinc-800 flex items-center justify-center bg-zinc-900/50">
              <MessageSquare className="w-8 h-8" />
            </div>
            <p className="text-xs uppercase tracking-[0.4em] font-mono">Initialize_Handshake...</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-6 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            {/* Avatar Container */}
            <div className="flex flex-col items-center gap-2 mt-1 shrink-0">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${
                msg.role === "user"
                  ? "bg-zinc-800/50 border-zinc-700 text-zinc-400"
                  : "bg-[#00f0ff]/10 border-[#00f0ff]/20 text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.1)]"
              }`}>
                {msg.role === "user" ? <Terminal className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
            </div>
            
            {/* Message Container */}
            <div className={`max-w-[85%] space-y-4 ${msg.role === "user" ? "text-right" : "text-left"}`}>
              <div className={`px-5 py-4 rounded-2xl transition-all ${
                msg.role === "user" 
                  ? "bg-zinc-800/40 border border-zinc-700 text-white" 
                  : "bg-transparent text-zinc-300"
              }`}>
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-normal">
                  {msg.content}
                </p>
              </div>

              {msg.contexts && msg.contexts.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-zinc-900">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase font-bold tracking-widest px-1">
                    <FileText className="w-3.5 h-3.5" /> Retained Knowledge Sources
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {msg.contexts.map((ctx) => (
                      <div 
                        key={ctx.id} 
                        className="group flex flex-col bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3 hover:border-zinc-600 transition-all cursor-pointer min-w-[180px] max-w-[240px]"
                        onClick={() => setExpandedContext(expandedContext === ctx.id ? null : ctx.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] text-zinc-600 font-mono font-bold tracking-tighter">ID_{ctx.id.toString().padStart(3, '0')}</span>
                          <span className="bg-[#00ff66]/10 text-[#00ff66] text-[9px] px-2 py-0.5 rounded-full font-bold font-mono">
                            {(1 - ctx.distance).toFixed(4)} MATCH
                          </span>
                        </div>
                        <h4 className="text-xs text-zinc-300 font-mono truncate mb-2 group-hover:text-white transition-colors">
                          {ctx.title}
                        </h4>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Vector_Retrieved</span>
                          {expandedContext === ctx.id ? <ChevronUp className="w-3 h-3 text-zinc-600" /> : <ChevronDown className="w-3 h-3 text-zinc-600" />}
                        </div>

                        {expandedContext === ctx.id && (
                          <div className="mt-3 pt-3 border-t border-zinc-800 animate-in fade-in duration-300">
                            <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                              "{ctx.text.substring(0, 150)}{ctx.text.length > 150 ? '...' : ''}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-6 animate-pulse">
            <div className="w-10 h-10 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/10 flex items-center justify-center shrink-0">
              <Loader2 className="w-5 h-5 text-[#00f0ff] animate-spin" />
            </div>
            <div className="space-y-3 flex-1 pt-2">
              <div className="h-4 bg-zinc-800/50 rounded w-3/4" />
              <div className="h-4 bg-zinc-800/30 rounded w-1/2" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="mt-4 shrink-0 relative">
        <div className="absolute -top-7 left-1 flex items-center gap-2">
          <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em] font-mono">Secure_Uplink:</span>
          <span className="text-[9px] text-[#00ff66] font-bold uppercase font-mono animate-pulse flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-[#00ff66]" /> ACTIVE
          </span>
        </div>
        
        <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl flex items-center p-2 focus-within:border-zinc-600 transition-all shadow-2xl">
          <div className="pl-4 text-zinc-600">
            <Terminal size={18} />
          </div>
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Search the neural network..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-4 px-4 text-white placeholder-zinc-700"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-6 h-12 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl flex items-center gap-2 transition-all disabled:opacity-20 disabled:grayscale group"
          >
            <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Send</span>
            <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
        <p className="text-center text-[9px] text-zinc-600 mt-4 uppercase tracking-[0.3em] font-mono">Powered by NexusDB Neural Engine</p>
      </div>
    </div>
  );
}
