"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";

interface TopologyMapProps {
  searchResults: any[];
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  id: number;
  hexId?: string;
}

export default function TopologyMap({ searchResults }: TopologyMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // High-Density Node Configuration (300 Nodes with Selective Hex Identifiers)
  const graphNodes = useMemo(() => {
    const nodes: Node[] = [];
    for (let i = 0; i < 300; i++) {
      const size = 0.5 + Math.random() * 2;
      let hexId;
      if (Math.random() < 0.2) {
        hexId = `0x${Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0')}`;
      }
      nodes.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0003,
        vy: (Math.random() - 0.5) * 0.0003,
        size: size,
        id: i,
        hexId: hexId,
      });
    }
    return nodes;
  }, []);

  const crosshairs = useMemo(() => {
    const items = [];
    for (let i = 0; i < 15; i++) {
      items.push({ x: Math.random(), y: Math.random() });
    }
    return items;
  }, []);

  const [targets, setTargets] = useState<{nodeIdx: number, rank: number, distance: number, metadata: string}[]>([]);

  useEffect(() => {
    if (searchResults.length > 0 && graphNodes.length > 0) {
      setTargets(searchResults.slice(0, 3).map((r, i) => ({
        nodeIdx: r.id % graphNodes.length,
        rank: i + 1,
        distance: r.distance,
        metadata: r.metadata
      })));
    }
  }, [searchResults, graphNodes.length]);

  useEffect(() => {
    let animationFrameId: number;
    let localPulse = 0;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // 1. Ambient Telemetry
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      crosshairs.forEach(ch => {
        const cx = ch.x * width;
        const cy = ch.y * height;
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy); ctx.lineTo(cx + 4, cy);
        ctx.moveTo(cx, cy - 4); ctx.lineTo(cx, cy + 4);
        ctx.stroke();
      });

      // 2. Proximity Web
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < graphNodes.length; i += 2) {
        const node = graphNodes[i];
        const x = node.x * width;
        const y = node.y * height;
        for (let j = i + 1; j < graphNodes.length; j += 4) {
          const other = graphNodes[j];
          const dx = (node.x - other.x) * width;
          const dy = (node.y - other.y) * height;
          if (dx * dx + dy * dy < 60 * 60) {
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(other.x * width, other.y * height); ctx.stroke();
          }
        }
      }

      // 3. Node Rendering & Ambient Hex Identifiers
      graphNodes.forEach((node) => {
        node.x += node.vx; node.y += node.vy;
        if (node.x < 0) node.x = 1; if (node.x > 1) node.x = 0;
        if (node.y < 0) node.y = 1; if (node.y > 1) node.y = 0;

        const x = node.x * width;
        const y = node.y * height;
        const opacity = (node.size / 2.5) * 0.4;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath(); ctx.arc(x, y, node.size, 0, Math.PI * 2); ctx.fill();

        // Selective Ambient Hex Identifier
        if (node.hexId) {
          ctx.font = '8px monospace';
          ctx.fillStyle = `rgba(255, 255, 255, 0.12)`;
          ctx.textAlign = 'left';
          ctx.fillText(node.hexId, x + 6, y + 3);
        }
      });

      // 4. Search Pulse, Laser Metrics & HUD Labels
      if (targets.length > 0) {
        const qx = width / 2;
        const qy = height / 2;
        
        // Query Node Anchor
        ctx.shadowBlur = 10; ctx.shadowColor = "#fff";
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(qx, qy, 4, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        targets.forEach((target) => {
          const targetNode = graphNodes[target.nodeIdx];
          if (!targetNode) return;

          const tx = targetNode.x * width;
          const ty = targetNode.y * height;

          // Laser Line
          const gradient = ctx.createLinearGradient(qx, qy, tx, ty);
          gradient.addColorStop(0, "rgba(0, 240, 255, 0.8)");
          gradient.addColorStop(1, "rgba(0, 240, 255, 0)");
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(tx, ty); ctx.stroke();

          // Midpoint Distance Metric
          const mx = (qx + tx) / 2;
          const my = (qy + ty) / 2;
          ctx.font = '9px monospace';
          ctx.fillStyle = 'rgba(10, 10, 10, 0.8)';
          const distLabel = `dist: ${target.distance.toFixed(4)}`;
          const metrics = ctx.measureText(distLabel);
          ctx.fillRect(mx - metrics.width/2 - 2, my - 6, metrics.width + 4, 12);
          ctx.fillStyle = '#00f0ff';
          ctx.textAlign = 'center';
          ctx.fillText(distLabel, mx, my + 3);

          // Target Hit & HUD Label
          ctx.shadowBlur = 15; ctx.shadowColor = "#00ff66";
          ctx.fillStyle = "#00ff66";
          ctx.beginPath(); ctx.arc(tx, ty, 6, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;

          // HUD Label Background Box
          const label = `[#${target.rank}] ${target.metadata.slice(0, 20)}...`;
          ctx.font = '10px monospace';
          const labelMetrics = ctx.measureText(label);
          ctx.fillStyle = 'rgba(10, 10, 10, 0.85)';
          ctx.fillRect(tx + 10, ty - 8, labelMetrics.width + 6, 16);
          ctx.strokeStyle = 'rgba(0, 255, 102, 0.3)';
          ctx.strokeRect(tx + 10, ty - 8, labelMetrics.width + 6, 16);
          
          ctx.fillStyle = '#00ff66';
          ctx.textAlign = 'left';
          ctx.fillText(label, tx + 13, ty + 4);

          // Pulse Effect
          const ripple = (localPulse * 100) % 40;
          ctx.strokeStyle = `rgba(0, 255, 102, ${1 - ripple/40})`;
          ctx.beginPath(); ctx.arc(tx, ty, ripple, 0, Math.PI * 2); ctx.stroke();
        });
      }

      localPulse += 0.01;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, [graphNodes, crosshairs, targets]);

  return (
    <div className="w-full h-full bg-[#030303] relative">
      <canvas ref={canvasRef} width={1200} height={600} className="w-full h-full block" />
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.4em]">
          Topology_Observatory // Deep_Index_Web
        </div>
      </div>
    </div>
  );
}
