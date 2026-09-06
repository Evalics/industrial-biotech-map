import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D, { type ForceGraphMethods, type NodeObject } from 'react-force-graph-2d';
import type { CompanyMapNode, TaxonomyEntry, TaxonomyId } from '../types/map';
import { getVisibleIds } from '../lib/filterCompanies';

export interface GraphNode extends NodeObject {
  id: string;
  name: string;
  primary_space: TaxonomyId;
  highlight?: boolean;
  x: number;
  y: number;
  fx: number;
  fy: number;
}

interface MapCanvasProps {
  companies: CompanyMapNode[];
  taxonomy: TaxonomyEntry[];
  selectedSpaces: TaxonomyId[];
  searchQuery: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function MapCanvas({
  companies,
  taxonomy,
  selectedSpaces,
  searchQuery,
  selectedId,
  onSelect,
}: MapCanvasProps) {
  const graphRef = useRef<ForceGraphMethods<GraphNode> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const colorBySpace = useMemo(
    () => new Map(taxonomy.map((t) => [t.id, t.color])),
    [taxonomy],
  );

  const visibleIds = useMemo(
    () => getVisibleIds(companies, selectedSpaces, searchQuery),
    [companies, selectedSpaces, searchQuery],
  );

  const graphData = useMemo(() => {
    const nodes: GraphNode[] = companies.map((c) => ({
      id: c.id,
      name: c.name,
      primary_space: c.primary_space,
      highlight: c.highlight,
      x: c.x,
      y: c.y,
      fx: c.x,
      fy: c.y,
    }));

    return { nodes, links: [] };
  }, [companies]);

  const paintNode = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const visible = visibleIds.has(node.id);
      const isSelected = node.id === selectedId;
      const baseRadius = node.highlight ? 9 : 6;
      const radius = (isSelected ? baseRadius + 3 : baseRadius) / Math.sqrt(globalScale);

      ctx.globalAlpha = visible ? 1 : 0.12;

      if (node.highlight || isSelected) {
        ctx.beginPath();
        ctx.arc(node.x!, node.y!, radius + 4 / Math.sqrt(globalScale), 0, 2 * Math.PI);
        ctx.strokeStyle = node.highlight ? '#14b8a6' : '#f8fafc';
        ctx.lineWidth = 2 / globalScale;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI);
      ctx.fillStyle = colorBySpace.get(node.primary_space) ?? '#64748b';
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(15, 23, 42, 0.35)';
      ctx.lineWidth = 1.2 / globalScale;
      ctx.stroke();

      if (globalScale > 0.55 && visible) {
        ctx.font = `${11 / globalScale}px "IBM Plex Sans", system-ui, sans-serif`;
        ctx.fillStyle = '#e2e8f0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(node.name, node.x!, node.y! + radius + 3 / globalScale);
      }

      ctx.globalAlpha = 1;
    },
    [colorBySpace, selectedId, visibleIds],
  );

  useEffect(() => {
    const fg = graphRef.current;
    if (!fg) return;
    fg.d3Force('charge')?.strength(0);
    fg.d3Force('link')?.distance(0);
    fg.d3Force('center')?.strength(0);
    fg.d3ReheatSimulation();
  }, [graphData]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const resize = () => {
      if (!el) return;
      setDimensions({ width: el.clientWidth, height: el.clientHeight });
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="map-canvas">
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeId="id"
        enableNodeDrag={false}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        cooldownTicks={0}
        d3AlphaDecay={1}
        d3VelocityDecay={1}
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={(node, color, ctx) => {
          const n = node as GraphNode;
          const r = (n.highlight ? 12 : 8);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(n.x!, n.y!, r, 0, 2 * Math.PI);
          ctx.fill();
        }}
        onNodeClick={(node) => {
          if (!visibleIds.has((node as GraphNode).id)) return;
          onSelect((node as GraphNode).id);
        }}
        onBackgroundClick={() => onSelect(null)}
        backgroundColor="transparent"
      />
    </div>
  );
}
