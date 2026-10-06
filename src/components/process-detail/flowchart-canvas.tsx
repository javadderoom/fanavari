'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  MapPin, 
  Layers, 
  Compass, 
  Play, 
  Eye, 
  EyeOff,
  Crosshair,
  Sparkles,
  Info
} from 'lucide-react';
import { ProcessStep } from '@/types/process';
import { 
  FlowchartNode, 
  FlowchartEdges, 
  LayoutNode, 
  LayoutEdge 
} from './flowchart-nodes';

interface FlowchartCanvasProps {
  steps: ProcessStep[];
  activeStepIndex: number;
  completedStepKeys: string[];
  onSelectStep: (index: number) => void;
  onToggleCompleteStep: (stepKey: string) => void;
  onSwitchToRunner?: () => void;
  onDrillDownSubProcess?: (subProcessSlug: string, stepTitle: string) => void;
}

const NODE_WIDTH = 270;
const NODE_HEIGHT = 115;
const VERTICAL_SPACING = 195;
const CENTER_X = 420;

export function FlowchartCanvas({
  steps,
  activeStepIndex,
  completedStepKeys,
  onSelectStep,
  onToggleCompleteStep,
  onSwitchToRunner,
  onDrillDownSubProcess,
}: FlowchartCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan and Zoom Transformation state
  const [pan, setPan] = useState({ x: 40, y: 50 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showMinimap, setShowMinimap] = useState(true);

  // Layout calculation
  const { nodes, edges, bounds } = useMemo(() => {
    const layoutNodes: LayoutNode[] = [];
    const layoutEdges: LayoutEdge[] = [];

    let currentY = 50;

    steps.forEach((step, index) => {
      let x = CENTER_X;
      // Handle conditional decision branching geometry
      if (index > 0 && steps[index - 1].stepType === 'decision') {
        // Offset alternating branches slightly for visual branching differentiation
        x = index % 2 === 1 ? CENTER_X - 110 : CENTER_X + 110;
      }

      const node: LayoutNode = {
        id: step.id || `step-${index}`,
        step,
        index,
        x,
        y: currentY,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        isCompleted: completedStepKeys.includes(step.stepKey),
        isActive: activeStepIndex === index,
      };

      layoutNodes.push(node);

      // Create edge from previous node to this node
      if (index > 0) {
        const prevNode = layoutNodes[index - 1];
        const isFromDecision = prevNode.step.stepType === 'decision';

        layoutEdges.push({
          id: `edge-${prevNode.id}-${node.id}`,
          fromId: prevNode.id,
          toId: node.id,
          fromX: prevNode.x + NODE_WIDTH / 2,
          fromY: prevNode.y + NODE_HEIGHT,
          toX: node.x + NODE_WIDTH / 2,
          toY: node.y,
          condition: isFromDecision ? (index % 2 === 1 ? 'yes' : 'no') : 'next',
          label: isFromDecision ? (index % 2 === 1 ? 'بله / تایید' : 'خیر / خطا') : undefined,
          isActive: activeStepIndex === index || activeStepIndex === index - 1,
        });
      }

      currentY += VERTICAL_SPACING;
    });

    // Compute bounding box
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    layoutNodes.forEach((n) => {
      minX = Math.min(minX, n.x);
      maxX = Math.max(maxX, n.x + n.width);
      minY = Math.min(minY, n.y);
      maxY = Math.max(maxY, n.y + n.height);
    });

    if (layoutNodes.length === 0) {
      minX = 0;
      maxX = 800;
      minY = 0;
      maxY = 600;
    }

    return {
      nodes: layoutNodes,
      edges: layoutEdges,
      bounds: {
        minX,
        maxX,
        minY,
        maxY,
        width: Math.max(maxX - minX + 150, 800),
        height: Math.max(maxY - minY + 150, 600),
      },
    };
  }, [steps, activeStepIndex, completedStepKeys]);

  // Fit to screen / Center graph
  const handleFitToScreen = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;

    const scaleX = (clientWidth - 80) / bounds.width;
    const scaleY = (clientHeight - 80) / bounds.height;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.4), 1.2);

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    setZoom(newZoom);
    setPan({
      x: clientWidth / 2 - centerX * newZoom,
      y: clientHeight / 2 - centerY * newZoom,
    });
  }, [bounds]);

  // Center on active node
  const handleFocusActiveNode = useCallback(() => {
    if (!containerRef.current || !nodes[activeStepIndex]) return;
    const activeNode = nodes[activeStepIndex];
    const { clientWidth, clientHeight } = containerRef.current;

    const nodeCenterX = activeNode.x + activeNode.width / 2;
    const nodeCenterY = activeNode.y + activeNode.height / 2;

    setPan({
      x: clientWidth / 2 - nodeCenterX * zoom,
      y: clientHeight / 2 - nodeCenterY * zoom,
    });
  }, [nodes, activeStepIndex, zoom]);

  // Initial centering
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFitToScreen();
    }, 150);
    return () => clearTimeout(timer);
  }, [handleFitToScreen]);

  // Pan Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on canvas background
    if ((e.target as HTMLElement).closest('.interactive-node')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom Wheel Handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.25), 2.0);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      setPan({
        x: cursorX - ((cursorX - pan.x) / zoom) * newZoom,
        y: cursorY - ((cursorY - pan.y) / zoom) * newZoom,
      });
      setZoom(newZoom);
    }
  };

  // Minimap click to pan
  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickRatioX = (e.clientX - rect.left) / rect.width;
    const clickRatioY = (e.clientY - rect.top) / rect.height;

    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;

    const targetWorldX = bounds.minX + clickRatioX * bounds.width;
    const targetWorldY = bounds.minY + clickRatioY * bounds.height;

    setPan({
      x: clientWidth / 2 - targetWorldX * zoom,
      y: clientHeight / 2 - targetWorldY * zoom,
    });
  };

  return (
    <div className="relative w-full rounded-3xl border overflow-hidden shadow-xl bg-slate-950 select-none"
      style={{ borderColor: 'var(--border-subtle)', height: '680px' }}
    >
      {/* Interactive Drag & Zoom Viewport Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className={`w-full h-full relative overflow-hidden ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: `${28 * zoom}px ${28 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      >
        {/* World Transform Container */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: `${bounds.width}px`,
            height: `${bounds.height}px`,
            position: 'absolute',
          }}
        >
          {/* Directed SVG Edges */}
          <FlowchartEdges edges={edges} />

          {/* Node Renderers */}
          {nodes.map((node) => (
            <div key={node.id} className="interactive-node">
              <FlowchartNode
                node={node}
                onSelectNode={onSelectStep}
                onToggleComplete={onToggleCompleteStep}
                onDrillDownSubProcess={onDrillDownSubProcess}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Floating Canvas Top Info Bar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="p-2 px-3 rounded-2xl border bg-slate-900/80 backdrop-blur-md shadow-lg flex items-center gap-2.5 text-xs text-white pointer-events-auto border-slate-800">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold">بوم هوشمند ۲ بعدی فلوچارت</span>
          <span className="text-[11px] text-slate-400 font-mono" dir="ltr">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {onSwitchToRunner && (
          <button
            type="button"
            onClick={onSwitchToRunner}
            className="p-2 px-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg pointer-events-auto transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>ورود به رانر گام‌به‌گام</span>
          </button>
        )}
      </div>

      {/* Floating Controls HUD (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl border bg-slate-900/85 backdrop-blur-md shadow-xl border-slate-800 text-white">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(z + 0.15, 2.0))}
          title="بزرگ‌نمایی"
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.25))}
          title="کوچک‌نمایی"
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleFitToScreen}
          title="انطباق با صفحه (Fit to Screen)"
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleFocusActiveNode}
          title="تمرکز روی گام فعال فعلی"
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-700 mx-0.5" />

        <button
          type="button"
          onClick={() => setShowMinimap((s) => !s)}
          title="نمایش/پنهان رادار نقشه"
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            showMinimap ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Minimap Radar (Bottom Right) */}
      {showMinimap && (
        <div 
          onClick={handleMinimapClick}
          className="absolute bottom-4 right-4 z-20 w-44 h-32 rounded-2xl border bg-slate-950/90 backdrop-blur-md shadow-2xl p-2 cursor-crosshair border-slate-800 overflow-hidden"
          title="رادار مینی‌مپ (برای جابجایی سریع کلیک کنید)"
        >
          <div className="relative w-full h-full">
            {/* Miniature Node Dots */}
            {nodes.map((n) => {
              const relX = ((n.x - bounds.minX) / bounds.width) * 100;
              const relY = ((n.y - bounds.minY) / bounds.height) * 100;

              return (
                <div
                  key={`minimap-${n.id}`}
                  style={{
                    position: 'absolute',
                    left: `${relX}%`,
                    top: `${relY}%`,
                    width: '18px',
                    height: '8px',
                  }}
                  className={`rounded-xs ${
                    n.isActive
                      ? 'bg-blue-500 shadow-sm shadow-blue-500'
                      : n.step.stepType === 'decision'
                      ? 'bg-amber-500/80'
                      : n.step.stepType === 'warning'
                      ? 'bg-rose-500/80'
                      : n.step.stepType === 'end'
                      ? 'bg-emerald-500'
                      : n.step.stepType === 'subprocess'
                      ? 'bg-indigo-500 shadow-sm shadow-indigo-500'
                      : 'bg-slate-600'
                  }`}
                />
              );
            })}

            {/* Viewport Indicator Rectangle */}
            {containerRef.current && (
              <div
                style={{
                  position: 'absolute',
                  left: `${Math.max(0, ((-pan.x / zoom - bounds.minX) / bounds.width) * 100)}%`,
                  top: `${Math.max(0, ((-pan.y / zoom - bounds.minY) / bounds.height) * 100)}%`,
                  width: `${Math.min(100, ((containerRef.current.clientWidth / zoom) / bounds.width) * 100)}%`,
                  height: `${Math.min(100, ((containerRef.current.clientHeight / zoom) / bounds.height) * 100)}%`,
                }}
                className="border border-blue-400 bg-blue-500/10 rounded-xs pointer-events-none"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
