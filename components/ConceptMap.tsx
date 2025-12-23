import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ConceptMapData, ConceptNode, ConceptEdge } from '../types';
import { geminiService } from '../services/geminiService';
import { Loader2, Share2, ZoomIn, ZoomOut, RefreshCw, AlertCircle } from 'lucide-react';

const ConceptMap: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [data, setData] = useState<ConceptMapData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const generateMap = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setData(null);
    setError(null);
    try {
      const mapData = await geminiService.generateConceptMap(topic);
      if (!mapData.nodes.length) {
         throw new Error("No concepts found.");
      }
      setData(mapData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate concept map.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const isDark = document.documentElement.classList.contains('dark');

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height]);

    // Force Simulation
    const simulation = d3.forceSimulation(data.nodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(50));

    // Defs for arrows
    svg.append("defs").selectAll("marker")
      .data(["end"])
      .enter().append("marker")
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", isDark ? "#475569" : "#94a3b8");

    // Edges
    const link = svg.append("g")
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke", isDark ? "#334155" : "#cbd5e1")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#end)");

    // Edge Labels
    const linkLabel = svg.append("g")
        .selectAll("text")
        .data(data.links)
        .join("text")
        .attr("class", "link-label")
        .attr("text-anchor", "middle")
        .attr("dy", -5)
        .attr("fill", isDark ? "#94a3b8" : "#64748b")
        .style("font-size", "10px")
        .text((d: any) => d.label || "");

    // Nodes
    const node = svg.append("g")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .call((d3.drag() as any)
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

    // Node Circles
    node.append("circle")
      .attr("r", 8)
      .attr("fill", "#3b82f6")
      .attr("stroke", isDark ? "#1e293b" : "#fff")
      .attr("stroke-width", 2);

    // Node Text Background
    node.append("rect")
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("fill", isDark ? "#1e293b" : "white")
      .attr("fill-opacity", 0.9)
      .attr("stroke", isDark ? "#334155" : "#e2e8f0")
      .attr("stroke-width", 1);
      
    // Node Labels
    node.append("text")
      .attr("dy", 25)
      .attr("text-anchor", "middle")
      .text((d: any) => d.label)
      .attr("fill", isDark ? "#f1f5f9" : "#1e293b")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .style("pointer-events", "none")
      .each(function(d) {
          const bbox = (this as SVGTextElement).getBBox();
          const padding = 6;
          const rect = d3.select(this.parentNode as any).select("rect");
          rect
            .attr("x", bbox.x - padding)
            .attr("y", bbox.y - padding)
            .attr("width", bbox.width + padding * 2)
            .attr("height", bbox.height + padding * 2);
      });

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      linkLabel
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

  }, [data]);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a concept to visualize (e.g., Photosynthesis, Solar System)..."
          className="flex-1 p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm dark:text-white transition-all"
        />
        <button
          onClick={generateMap}
          disabled={!topic.trim() || isLoading}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Share2 size={20} />}
          Visualize
        </button>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden transition-colors">
        {data ? (
          <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing"></svg>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
             {error ? (
                 <>
                   <AlertCircle size={48} className="mb-4 text-red-500" />
                   <p className="text-red-600">{error}</p>
                 </>
             ) : (
                <>
                  <Share2 size={48} className="mb-4 opacity-20" />
                  <p>Enter a topic to generate a concept map</p>
                </>
             )}
          </div>
        )}
        
        {data && (
           <div className="absolute bottom-4 right-4 flex gap-2">
             <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur p-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400 transition-colors">
               Drag nodes to rearrange
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default ConceptMap;