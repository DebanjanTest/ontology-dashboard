import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from '../../context/ThemeContext';

export default function ForceGraph({ nodes, edges, onNodeClick }) {
  const svgRef = useRef(null);
  const { theme: t } = useTheme();

  useEffect(() => {
    if (!svgRef.current) return;

    const svgEl = svgRef.current;
    const rect = svgEl.getBoundingClientRect();
    const width = Math.max(700, rect.width || 900);
    const height = Math.max(420, rect.height || 520);

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);

    if (!nodes?.length) {
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', t.textMuted)
        .attr('font-size', 14)
        .text('No graph data available');
      return;
    }

    const defs = svg.append('defs');
    ['diplomatic', 'trade', 'conflict'].forEach((type) => {
      defs
        .append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 24)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', type === 'conflict' ? '#e63946' : '#2a9d8f');
    });

    const root = svg.append('g').attr('class', 'zoom-root');
    const linkLayer = root.append('g').attr('class', 'links');
    const nodeLayer = root.append('g').attr('class', 'nodes');

    const simNodes = nodes.map((n) => ({ ...n, x: width / 2 + (n.anchorX || 0), y: height / 2 + (n.anchorY || 0) }));
    const nodeIds = new Set(simNodes.map((n) => n.id));
    const simEdges = (edges || []).filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target)).map((e) => ({ ...e }));

    const edgeStyle = {
      diplomatic: { stroke: '#0ea5a4', dash: 'none' },
      trade: { stroke: '#2563eb', dash: '6,4' },
      conflict: { stroke: '#dc2626', dash: '2,3' },
    };

    const link = linkLayer
      .selectAll('line')
      .data(simEdges)
      .join('line')
      .attr('stroke', (d) => {
        if ((d.relationRisk || 0) >= 85) return '#7f1d1d';
        if ((d.relationRisk || 0) >= 70) return '#dc2626';
        return edgeStyle[d.type]?.stroke || '#94a3b8';
      })
      .attr('stroke-width', (d) => {
        const base = 0.8 + (Number(d.impact || 0.5) * 2.2);
        return Math.min(4.2, Math.max(1.1, base));
      })
      .attr('stroke-dasharray', (d) => (edgeStyle[d.type]?.dash === 'none' ? null : edgeStyle[d.type]?.dash))
      .attr('opacity', (d) => Math.min(0.95, Math.max(0.35, Number(d.confidence || 0.7))))
      .attr('marker-end', (d) => `url(#arrow-${d.type || 'trade'})`);

    link
      .append('title')
      .text((d) => `${d.predicate || d.type}\nConfidence: ${Math.round((d.confidence || 0) * 100)}%\nImpact: ${Math.round((d.impact || 0) * 100)}%\nRelation risk: ${d.relationRisk || 'n/a'}`);

    const node = nodeLayer
      .selectAll('g')
      .data(simNodes)
      .join('g')
      .style('cursor', 'grab')
      .on('click', (event, d) => {
        if (event.defaultPrevented) return;
        onNodeClick?.(d);
      });

    const nodeFill = (risk) => {
      if (risk >= 85) return '#7f1d1d';   // Critical
      if (risk >= 70) return '#dc2626';   // High
      if (risk >= 55) return '#f97316';   // Elevated
      if (risk >= 35) return '#f59e0b';   // Guarded
      return '#14b8a6';                   // Low
    };

    const nodeStroke = (risk) => {
      if (risk >= 85) return '#450a0a';
      if (risk >= 70) return '#7f1d1d';
      if (risk >= 55) return '#9a3412';
      if (risk >= 35) return '#92400e';
      return '#0f766e';
    };

    node
      .append('circle')
      .attr('r', (d) => Math.max(6, (d.size || 18) / 2))
      .attr('fill', (d) => nodeFill(Number(d.risk || 0)))
      .attr('stroke', (d) => nodeStroke(Number(d.risk || 0)))
      .attr('stroke-width', (d) => (Number(d.risk || 0) >= 70 ? 1.6 : 1.2))
      .attr('opacity', 0.96);

    node
      .append('title')
      .text((d) => `${d.label || d.id}\nRisk: ${d.risk}\nDomain: ${d.domain || 'n/a'}`);

    node
      .append('text')
      .text((d) => d.label || d.id)
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => Math.max(14, (d.size || 18) / 2 + 12))
      .attr('fill', t.text)
      .attr('font-size', 10)
      .attr('font-family', 'Syne, sans-serif')
      .attr('pointer-events', 'none');

    const simulation = d3
      .forceSimulation(simNodes)
      .force('link', d3.forceLink(simEdges).id((d) => d.id).distance(110).strength(0.35))
      .force('charge', d3.forceManyBody().strength(-350))
      .force('x', d3.forceX((d) => width / 2 + (d.anchorX || 0)).strength(0.18))
      .force('y', d3.forceY((d) => height / 2 + (d.anchorY || 0)).strength(0.18))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.03))
      .force('collide', d3.forceCollide((d) => Math.max(20, (d.size || 18) / 2 + 22)))
      .alpha(1)
      .alphaDecay(0.04);

    const drag = d3
      .drag()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.2).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag);

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    const zoom = d3
      .zoom()
      .scaleExtent([0.35, 3.5])
      .on('zoom', (event) => {
        root.attr('transform', event.transform);
      });

    svg.call(zoom);

    // initial fit
    svg.call(zoom.transform, d3.zoomIdentity.translate(40, 20).scale(0.95));

    return () => {
      simulation.stop();
      svg.on('.zoom', null);
      svg.selectAll('*').interrupt();
    };
  }, [nodes, edges, onNodeClick]);

  return <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }} />;
}
