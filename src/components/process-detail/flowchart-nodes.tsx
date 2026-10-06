'use client';

import React from 'react';
import { 
  CheckCircle2, 
  Layers, 
  HelpCircle, 
  AlertTriangle, 
  Flag, 
  ExternalLink, 
  Check, 
  Sparkles,
  ArrowDown,
  ArrowRight
} from 'lucide-react';
import { ProcessStep, StepType } from '@/types/process';

export interface LayoutNode {
  id: string;
  step: ProcessStep;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  isCompleted: boolean;
  isActive: boolean;
}

export interface LayoutEdge {
  id: string;
  fromId: string;
  toId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  label?: string;
  condition?: 'yes' | 'no' | 'next';
  isActive: boolean;
}

interface NodeRendererProps {
  node: LayoutNode;
  onSelectNode: (index: number) => void;
  onToggleComplete: (stepKey: string) => void;
}

export function FlowchartNode({
  node,
  onSelectNode,
  onToggleComplete,
}: NodeRendererProps) {
  const { step, index, isActive, isCompleted } = node;

  switch (step.stepType) {
    case 'decision':
      return (
        <DecisionNode
          node={node}
          onSelect={() => onSelectNode(index)}
          onToggleComplete={() => onToggleComplete(step.stepKey)}
        />
      );
    case 'warning':
      return (
        <WarningNode
          node={node}
          onSelect={() => onSelectNode(index)}
          onToggleComplete={() => onToggleComplete(step.stepKey)}
        />
      );
    case 'end':
      return (
        <EndNode
          node={node}
          onSelect={() => onSelectNode(index)}
          onToggleComplete={() => onToggleComplete(step.stepKey)}
        />
      );
    case 'action':
    default:
      return (
        <ActionNode
          node={node}
          onSelect={() => onSelectNode(index)}
          onToggleComplete={() => onToggleComplete(step.stepKey)}
        />
      );
  }
}

// 1. Action Node: Rectangular Card (Blue Accent)
function ActionNode({
  node,
  onSelect,
  onToggleComplete,
}: {
  node: LayoutNode;
  onSelect: () => void;
  onToggleComplete: () => void;
}) {
  const { step, index, isActive, isCompleted, x, y, width, height } = node;

  return (
    <div
      onClick={onSelect}
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      className={`rounded-2xl border p-4 cursor-pointer transition-all select-none flex flex-col justify-between shadow-md ${
        isActive
          ? 'ring-2 ring-blue-500 scale-[1.02] bg-white dark:bg-slate-900 border-blue-500 shadow-blue-500/10'
          : isCompleted
          ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500'
          : 'bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 hover:border-blue-400'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-[11px] flex items-center justify-center">
              {index + 1}
            </span>
            <span className="text-[10px] font-bold text-slate-400">گام اجرایی</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete();
            }}
            className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
              isCompleted
                ? 'bg-emerald-500 text-white'
                : 'border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-transparent'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>

        <h4 className="font-black text-xs line-clamp-2 leading-snug" style={{ color: 'var(--text-primary)' }}>
          {step.title}
        </h4>
      </div>

      <div className="pt-2 border-t flex items-center justify-between gap-1 text-[10px] text-slate-400" style={{ borderColor: 'var(--border-subtle)' }}>
        {step.targetMenuPath ? (
          <span className="truncate max-w-[170px] text-blue-600 dark:text-blue-400 font-mono">
            {step.targetMenuPath}
          </span>
        ) : (
          <span>اقدام استاندارد</span>
        )}
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800">
          ACTION
        </span>
      </div>
    </div>
  );
}

// 2. Decision Node: Distinct Diamond Geometry (Amber Accent)
function DecisionNode({
  node,
  onSelect,
  onToggleComplete,
}: {
  node: LayoutNode;
  onSelect: () => void;
  onToggleComplete: () => void;
}) {
  const { step, index, isActive, isCompleted, x, y, width, height } = node;

  return (
    <div
      onClick={onSelect}
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      className={`rounded-2xl border p-4 cursor-pointer transition-all select-none flex flex-col justify-between shadow-md relative ${
        isActive
          ? 'ring-2 ring-amber-500 scale-[1.02] bg-amber-500/10 border-amber-500 shadow-amber-500/15'
          : isCompleted
          ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500'
          : 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/30 hover:border-amber-500'
      }`}
    >
      {/* Visual Diamond Badge Indicator */}
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rotate-45 bg-amber-500 text-white rounded-xs flex items-center justify-center shadow-xs">
        <HelpCircle className="w-3 h-3 -rotate-45" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 font-black text-[11px] flex items-center justify-center">
              {index + 1}
            </span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">شرط و انشعاب</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete();
            }}
            className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
              isCompleted
                ? 'bg-emerald-500 text-white'
                : 'border border-amber-500/40 hover:border-emerald-500 text-transparent'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>

        <h4 className="font-black text-xs line-clamp-2 leading-snug text-amber-900 dark:text-amber-200">
          {step.title}
        </h4>
      </div>

      <div className="pt-2 border-t flex items-center justify-between text-[10px] text-amber-700 dark:text-amber-400" style={{ borderColor: 'var(--border-subtle)' }}>
        <span className="font-bold">دوراهی تصمیم‌گیری (بله / خیر)</span>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-500/20">
          DECISION
        </span>
      </div>
    </div>
  );
}

// 3. Warning Node: Alert Checkpoint (Rose Accent)
function WarningNode({
  node,
  onSelect,
  onToggleComplete,
}: {
  node: LayoutNode;
  onSelect: () => void;
  onToggleComplete: () => void;
}) {
  const { step, index, isActive, isCompleted, x, y, width, height } = node;

  return (
    <div
      onClick={onSelect}
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      className={`rounded-2xl border p-4 cursor-pointer transition-all select-none flex flex-col justify-between shadow-md ${
        isActive
          ? 'ring-2 ring-rose-500 scale-[1.02] bg-rose-500/15 border-rose-500 shadow-rose-500/15'
          : isCompleted
          ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500'
          : 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/30 hover:border-rose-500'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-lg bg-rose-500 text-white font-black text-[11px] flex items-center justify-center animate-pulse">
              !
            </span>
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">ایستگاه بازرسی مهم</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete();
            }}
            className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
              isCompleted
                ? 'bg-emerald-500 text-white'
                : 'border border-rose-500/40 hover:border-emerald-500 text-transparent'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>

        <h4 className="font-black text-xs line-clamp-2 leading-snug text-rose-950 dark:text-rose-200">
          {step.title}
        </h4>
      </div>

      <div className="pt-2 border-t flex items-center justify-between text-[10px] text-rose-700 dark:text-rose-400" style={{ borderColor: 'var(--border-subtle)' }}>
        <span className="font-bold">نقطه حساس و غیرقابل بازگشت</span>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-rose-500/20">
          CHECKPOINT
        </span>
      </div>
    </div>
  );
}

// 4. End / Terminal Node: Double-ring Pill Card (Emerald Accent)
function EndNode({
  node,
  onSelect,
  onToggleComplete,
}: {
  node: LayoutNode;
  onSelect: () => void;
  onToggleComplete: () => void;
}) {
  const { step, index, isActive, isCompleted, x, y, width, height } = node;

  return (
    <div
      onClick={onSelect}
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      className={`rounded-2xl border-2 p-4 cursor-pointer transition-all select-none flex flex-col justify-between shadow-lg relative ${
        isActive
          ? 'ring-4 ring-emerald-500/30 scale-[1.02] bg-emerald-500/15 border-emerald-500'
          : 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/40 hover:border-emerald-500'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-black text-[11px] flex items-center justify-center">
              ✓
            </span>
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">پایان موفقیت‌آمیز</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete();
            }}
            className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center cursor-pointer shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>

        <h4 className="font-black text-xs line-clamp-2 leading-snug text-emerald-950 dark:text-emerald-100">
          {step.title}
        </h4>
      </div>

      <div className="pt-2 border-t flex items-center justify-between text-[10px] text-emerald-700 dark:text-emerald-300 border-emerald-500/20">
        <span className="font-bold">تکمیل فرایند و ثبت نهایی</span>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-emerald-500/20">
          TERMINAL
        </span>
      </div>
    </div>
  );
}

// 5. SVG Edges & Directed Flow Connectors
export function FlowchartEdges({ edges }: { edges: LayoutEdge[] }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
      <defs>
        <marker
          id="flow-arrow-default"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 8 5 L 0 9 z" fill="#94a3b8" />
        </marker>
        <marker
          id="flow-arrow-active"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 8 5 L 0 9 z" fill="#3b82f6" />
        </marker>
        <marker
          id="flow-arrow-yes"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 8 5 L 0 9 z" fill="#10b981" />
        </marker>
        <marker
          id="flow-arrow-no"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 8 5 L 0 9 z" fill="#ef4444" />
        </marker>
      </defs>

      {edges.map((edge) => {
        const { fromX, fromY, toX, toY, condition, isActive, label } = edge;
        // Smooth Cubic Bezier S-Curve
        const deltaY = toY - fromY;
        const cy1 = fromY + Math.max(deltaY * 0.5, 30);
        const cy2 = toY - Math.max(deltaY * 0.5, 30);
        const pathData = `M ${fromX} ${fromY} C ${fromX} ${cy1}, ${toX} ${cy2}, ${toX} ${toY}`;

        const strokeColor = condition === 'yes'
          ? '#10b981'
          : condition === 'no'
          ? '#ef4444'
          : isActive
          ? '#3b82f6'
          : '#94a3b8';

        const markerId = condition === 'yes'
          ? 'url(#flow-arrow-yes)'
          : condition === 'no'
          ? 'url(#flow-arrow-no)'
          : isActive
          ? 'url(#flow-arrow-active)'
          : 'url(#flow-arrow-default)';

        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;

        return (
          <g key={edge.id}>
            {/* Glow Path */}
            {isActive && (
              <path
                d={pathData}
                fill="none"
                stroke={strokeColor}
                strokeWidth={5}
                strokeOpacity={0.25}
              />
            )}

            {/* Main Connecting Path */}
            <path
              d={pathData}
              fill="none"
              stroke={strokeColor}
              strokeWidth={isActive ? 2.5 : 1.75}
              strokeDasharray={condition ? '5,4' : undefined}
              markerEnd={markerId}
              className={isActive ? 'animate-pulse' : undefined}
            />

            {/* Condition Branch Pill */}
            {label && (
              <g transform={`translate(${midX}, ${midY})`}>
                <rect
                  x="-30"
                  y="-10"
                  width="60"
                  height="20"
                  rx="6"
                  fill={condition === 'yes' ? '#10b981' : condition === 'no' ? '#ef4444' : '#1e293b'}
                  className="shadow-sm"
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {label}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
