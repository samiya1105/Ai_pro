import * as React from 'react';
import * as d3 from 'd3';
import { ConceptMapData, ConceptNode, ConceptEdge } from '../types';
import { geminiService } from '../services/geminiService';
import { Loader2, Share2, ZoomIn, ZoomOut, RefreshCw, AlertCircle, Maximize2 } from 'lucide-react';

const ConceptMap: React.FC = () => {
  const [topic, setTopic] = React.useState('');
  const [data, setData] = React.useState<ConceptMapData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const svgRef = React.useRef<SVGSVGElement | null>(null);

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

  React.useEffect(() => {
    if (!data || !svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height]);

    // Container for zooming
    const g = svg.append("g");

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom as any);

    const simulation = d3.forceSimulation(data.nodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(180))
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(80));

    // Defs for arrows and glows
    const defs = svg.append("defs");
    
    defs.append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 30)
      .attr("refY", 0)
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#94a3b8");

    // Glow filter
    const filter = defs.append("filter")
      .attr("id", "glow");
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "3.5")
      .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Edges
    const link = g.append("g")
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrow)");

    // Edge Labels
    const linkLabel = g.append("g")
        .selectAll("text")
        .data(data.links)
        .join("text")
        .attr("text-anchor", "middle")
        .attr("dy", -5)
        .attr("fill", "#64748b")
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .text((d: any) => d.label || "");

    // Nodes
    const node = g.append("g")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .call((d3.drag() as any)
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

    // Node "Bubble"
    node.append("circle")
      .attr("r", 10)
      .attr("fill", "#2563eb")
      .attr("filter", "url(#glow)")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Label Group
    const labelGroup = node.append("g")
      .attr("transform", "translate(0, 28)");

    // Glassmorphism background for label
    labelGroup.append("rect")
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("fill", "rgba(255, 255, 255, 0.9)")
      .attr("class", "dark:fill-slate-800/90 transition-colors")
      .attr("stroke", "rgba(59, 130, 246, 0.2)")
      .attr("stroke-width", 1);
      
    // Text Label
    const textLabels = labelGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .text((d: any) => d.label)
      .attr("fill", "#1e293b")
      .attr("class", "dark:fill-white font-bold transition-colors")
      .style("font-size", "13px")
      .style("pointer-events", "none");

    // Adjust rect size to text
    textLabels.each(function(d) {
      const bbox = (this as SVGTextElement).getBBox();
      const padding = 8;
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
          placeholder="Visualize any concept (e.g., Quantum Physics, Cellular Biology)..."
          className="flex-1 p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-bold"
        />
        <button
          onClick={generateMap}
          disabled={!topic.trim() || isLoading}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Share2 size={20} />}
          Visualize
        </button>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900/50 rounded-3xl shadow-inner border border-slate-200 dark:border-slate-800 relative overflow-hidden backdrop-blur-sm">
        {data ? (
          <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing"></svg>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
             {error ? (
                 <>
                   <AlertCircle size={64} className="mb-4 text-red-500 opacity-50" />
                   <p className="text-red-600 font-bold">{error}</p>
                 </>
             ) : (
                <>
                  <Share2 size={80} className="mb-6 opacity-10 animate-pulse" />
                  <p className="text-xl font-black uppercase tracking-widest opacity-30">Map Your Knowledge</p>
                  <p className="text-sm mt-2 opacity-40">Enter a topic above to begin exploration</p>
                </>
             )}
          </div>
        )}
        
        {data && (
           <div className="absolute top-4 right-4 flex gap-2">
             <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur p-3 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 text-[10px] font-black uppercase tracking-tighter text-slate-500 dark:text-slate-400 flex items-center gap-2">
               <Maximize2 size={12} /> Scroll to Zoom • Drag to Move
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default ConceptMap;