import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LayoutDashboard, FileUp, MessageSquare, Terminal } from "lucide-react";
import Link from "next/link";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "NEXUS_DB // ADMIN_CONSOLE",
  description: "Production-ready C++ Vector Engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} dark`}>
      <body className="bg-[#050505] text-gray-300 antialiased min-h-screen flex overflow-hidden">
        <div className="scanline" />
        
        {/* Left Sidebar (Navigation) */}
        <aside className="w-64 flex-shrink-0 border-r border-zinc-900 bg-[#050505] z-50 relative flex flex-col">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-neon-green shadow-[0_0_15px_rgba(0,255,102,0.5)] flex items-center justify-center">
                <Terminal className="text-black w-5 h-5" />
              </div>
              <h1 className="text-xs font-bold tracking-widest text-white">
                NEXUS_DB<br />
                <span className="text-[10px] text-neon-green/80 font-mono">ADMIN_CONSOLE</span>
              </h1>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <Link 
              href="/" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-all text-sm group"
            >
              <LayoutDashboard className="w-4 h-4 group-hover:text-neon-green transition-colors" />
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/ingest" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-all text-sm group"
            >
              <FileUp className="w-4 h-4 group-hover:text-neon-green transition-colors" />
              <span>Document Ingestion</span>
            </Link>
            <Link 
              href="/chat" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-all text-sm group"
            >
              <MessageSquare className="w-4 h-4 group-hover:text-neon-green transition-colors" />
              <span>RAG Chat</span>
            </Link>
          </nav>
          
          <div className="p-4 border-t border-white/5 mt-auto">
            <div className="flex items-center gap-3 px-4 py-3 rounded bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <span className="text-[10px] uppercase tracking-tighter text-neon-green font-bold">Engine Connected</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 relative h-screen overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
