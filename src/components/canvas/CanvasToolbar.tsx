import React, { useState } from 'react';
import {
  Pen,
  Highlighter,
  Eraser,
  Square,
  Circle,
  ArrowRight,
  Minus,
  Diamond,
  Workflow,
  Undo2,
  Redo2,
  Grid,
  ChevronDown,
  ChevronUp,
  Palette,
  Zap,
} from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';
import type { ShapeType, GridType } from '../../types/note';

const PEN_COLORS = [
  '#0f172a', // Slate black
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Emerald green
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ffffff', // White (for dark mode)
];

const HIGHLIGHTER_COLORS = [
  '#facc15', // Yellow
  '#4ade80', // Green
  '#f472b6', // Pink
  '#38bdf8', // Light blue
  '#fb923c', // Orange
];

const STROKE_WIDTHS = [
  { label: 'Fine', value: 2 },
  { label: 'Medium', value: 4 },
  { label: 'Thick', value: 8 },
  { label: 'Heavy', value: 14 },
];

interface CanvasToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  const {
    tool,
    setTool,
    shape,
    setShape,
    eraserMode,
    setEraserMode,
    color,
    setColor,
    strokeWidth,
    setStrokeWidth,
    highlighterColor,
    setHighlighterColor,
    gridType,
    setGridType,
    isDarkMode,
  } = useCanvasStore();

  const [isShapeMenuOpen, setIsShapeMenuOpen] = useState(false);
  const [isGridMenuOpen, setIsGridMenuOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isMobileCollapsed, setIsMobileCollapsed] = useState(false);

  const shapes: Array<{ type: ShapeType; label: string; icon: React.ReactNode }> = [
    { type: 'rectangle', label: 'Rectangle', icon: <Square className="w-4 h-4" /> },
    { type: 'circle', label: 'Circle', icon: <Circle className="w-4 h-4" /> },
    { type: 'arrow', label: 'Arrow Connector', icon: <ArrowRight className="w-4 h-4" /> },
    { type: 'line', label: 'Straight Line', icon: <Minus className="w-4 h-4" /> },
    { type: 'diamond', label: 'Decision Diamond', icon: <Diamond className="w-4 h-4" /> },
    { type: 'flowchart-node', label: 'Flowchart Box', icon: <Workflow className="w-4 h-4" /> },
  ];

  const gridOptions: Array<{ type: GridType; label: string; key: string }> = [
    { type: 'dots', label: 'Dot Matrix', key: 'G' },
    { type: 'ruled', label: 'Ruled Paper', key: 'G' },
    { type: 'grid', label: 'Math Grid', key: 'G' },
    { type: 'isometric', label: 'Isometric 3D', key: 'G' },
    { type: 'blank', label: 'Blank Slate', key: 'G' },
  ];

  return (
    <div className="absolute bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-auto max-w-[96vw]">
      {/* Mobile collapse / expand handle */}
      <button
        onClick={() => setIsMobileCollapsed(!isMobileCollapsed)}
        className="md:hidden mb-1 px-3 py-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-full shadow-md text-[11px] font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1 border border-slate-200 dark:border-slate-800"
      >
        {isMobileCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5" /> Show Tools
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5" /> Hide Tools
          </>
        )}
      </button>

      {/* Main Apple / Figma Inspired Floating Island Toolbar */}
      {!isMobileCollapsed && (
        <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-200 transition-all ring-1 ring-black/5 dark:ring-white/5 max-w-[96vw] overflow-x-auto scrollbar-none">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 pr-1.5 border-r border-slate-200 dark:border-slate-800">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className={`p-2 rounded-xl transition-all ${
                canUndo
                  ? 'hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 text-slate-700 dark:text-slate-200'
                  : 'opacity-25 cursor-not-allowed'
              }`}
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className={`p-2 rounded-xl transition-all ${
                canRedo
                  ? 'hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 text-slate-700 dark:text-slate-200'
                  : 'opacity-25 cursor-not-allowed'
              }`}
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Pen Tool [1] */}
          <button
            onClick={() => {
              setTool('pen');
              setIsShapeMenuOpen(false);
              setIsGridMenuOpen(false);
            }}
            title="Pen Tool (Shortcut: 1 or P)"
            className={`p-2 rounded-xl flex items-center justify-center transition-all relative group ${
              tool === 'pen'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105 font-medium'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95'
            }`}
          >
            <Pen className="w-4 h-4" />
            {tool === 'pen' && (
              <span
                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 shadow-xs"
                style={{ backgroundColor: color }}
              />
            )}
            <span className="hidden group-hover:flex absolute -top-8 px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-mono pointer-events-none whitespace-nowrap">
              Pen [1]
            </span>
          </button>

          {/* Highlighter Tool [2] */}
          <button
            onClick={() => {
              setTool('highlighter');
              setIsShapeMenuOpen(false);
              setIsGridMenuOpen(false);
            }}
            title="Highlighter (Shortcut: 2 or H)"
            className={`p-2 rounded-xl flex items-center justify-center transition-all relative group ${
              tool === 'highlighter'
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25 scale-105 font-medium'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95'
            }`}
          >
            <Highlighter className="w-4 h-4" />
            {tool === 'highlighter' && (
              <span
                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 shadow-xs"
                style={{ backgroundColor: highlighterColor }}
              />
            )}
            <span className="hidden group-hover:flex absolute -top-8 px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-mono pointer-events-none whitespace-nowrap">
              Highlight [2]
            </span>
          </button>

          {/* Eraser Tool [3] */}
          <button
            onClick={() => {
              if (tool === 'eraser') {
                setEraserMode(eraserMode === 'stroke' ? 'pixel' : 'stroke');
              } else {
                setTool('eraser');
              }
              setIsShapeMenuOpen(false);
              setIsGridMenuOpen(false);
            }}
            title={`Eraser (Shortcut: 3 or E) - Mode: ${eraserMode === 'stroke' ? 'Stroke (Obj)' : 'Pixel (Pix)'}`}
            className={`p-2 rounded-xl flex items-center gap-1 transition-all group ${
              tool === 'eraser'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25 scale-105'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95'
            }`}
          >
            <Eraser className="w-4 h-4" />
            {tool === 'eraser' && (
              <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
                {eraserMode === 'stroke' ? 'Obj' : 'Pix'}
              </span>
            )}
            <span className="hidden group-hover:flex absolute -top-8 px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-mono pointer-events-none whitespace-nowrap">
              Eraser [3]
            </span>
          </button>

          {/* Shapes Dropdown [4] */}
          <div className="relative">
            <button
              onClick={() => {
                setIsShapeMenuOpen(!isShapeMenuOpen);
                setIsGridMenuOpen(false);
                setIsColorPickerOpen(false);
                if (tool !== 'shape') setTool('shape');
              }}
              title="Geometric Shapes (Shortcut: 4 or S)"
              className={`p-2 rounded-xl flex items-center gap-1 transition-all group ${
                tool === 'shape'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 scale-105'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95'
              }`}
            >
              {shapes.find((s) => s.type === shape)?.icon || <Square className="w-4 h-4" />}
              <ChevronDown className="w-3 h-3 opacity-70" />
              <span className="hidden group-hover:flex absolute -top-8 px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-mono pointer-events-none whitespace-nowrap">
                Shapes [4]
              </span>
            </button>

            {/* Shapes Flyout Menu */}
            {isShapeMenuOpen && (
              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 flex flex-col gap-1 min-w-[170px] animate-in fade-in zoom-in-95">
                <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                  Shapes & Connectors [4]
                </div>
                {shapes.map((s) => (
                  <button
                    key={s.type}
                    onClick={() => {
                      setShape(s.type);
                      setIsShapeMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      shape === s.type
                        ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {s.icon}
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Laser Pointer Tool [5] */}
          <button
            onClick={() => {
              setTool('laser');
              setIsShapeMenuOpen(false);
              setIsGridMenuOpen(false);
            }}
            title="Laser Pointer for Presenting / Lecturing (Shortcut: 5 or L)"
            className={`p-2 rounded-xl flex items-center justify-center transition-all relative group ${
              tool === 'laser'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-105 font-medium'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95'
            }`}
          >
            <Zap className="w-4 h-4 fill-current" />
            <span className="hidden group-hover:flex absolute -top-8 px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-mono pointer-events-none whitespace-nowrap">
              Laser [5]
            </span>
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

          {/* Color Palettes */}
          <div className="flex items-center gap-1">
            {tool === 'highlighter' ? (
              // Highlighter colors
              <div className="flex items-center gap-1">
                {HIGHLIGHTER_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setHighlighterColor(c)}
                    className={`w-6 h-6 rounded-full transition-all border-2 ${
                      highlighterColor === c
                        ? 'scale-110 border-slate-800 dark:border-white shadow-sm'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            ) : (
              // Pen & Shape colors
              <div className="flex items-center gap-1">
                {PEN_COLORS.slice(0, 5).map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-all border-2 ${
                      color === c
                        ? 'scale-110 border-blue-500 shadow-sm'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: c,
                      borderColor: c === '#ffffff' && !isDarkMode ? '#e2e8f0' : undefined,
                    }}
                  />
                ))}

                {/* Custom Color Picker Popover */}
                <div className="relative">
                  <button
                    onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                    className="w-6 h-6 rounded-full flex items-center justify-center border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Custom color"
                  >
                    <Palette className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                  </button>

                  {isColorPickerOpen && (
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 flex flex-col gap-2 min-w-[150px]">
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        Custom Ink Color
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                          {color.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

          {/* Stroke Width Selector with [ / ] shortcut hints */}
          <div className="flex items-center gap-1">
            {STROKE_WIDTHS.map((w) => (
              <button
                key={w.value}
                onClick={() => setStrokeWidth(w.value)}
                title={`Stroke: ${w.label} (${w.value}px) [Shortcut: [ or ]]`}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                  strokeWidth === w.value
                    ? 'bg-slate-200 dark:bg-slate-700 font-bold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div
                  className="rounded-full bg-slate-800 dark:bg-slate-200"
                  style={{
                    width: `${Math.min(14, w.value * 1.5 + 2)}px`,
                    height: `${Math.min(14, w.value * 1.5 + 2)}px`,
                  }}
                />
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

          {/* Grid Background Selector [G] */}
          <div className="relative">
            <button
              onClick={() => {
                setIsGridMenuOpen(!isGridMenuOpen);
                setIsShapeMenuOpen(false);
                setIsColorPickerOpen(false);
              }}
              title="Paper Background & Grid (Shortcut: G)"
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 group"
            >
              <Grid className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <ChevronDown className="w-3 h-3 opacity-70" />
              <span className="hidden group-hover:flex absolute -top-8 px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-mono pointer-events-none whitespace-nowrap">
                Grid [G]
              </span>
            </button>

            {/* Grid options flyout */}
            {isGridMenuOpen && (
              <div className="absolute bottom-full mb-3 right-0 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 flex flex-col gap-1 min-w-[160px] animate-in fade-in zoom-in-95">
                <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 flex items-center justify-between">
                  <span>Background Style</span>
                  <kbd className="text-[9px] font-mono px-1 bg-slate-100 dark:bg-slate-800 rounded">
                    G
                  </kbd>
                </div>
                {gridOptions.map((g) => (
                  <button
                    key={g.type}
                    onClick={() => {
                      setGridType(g.type);
                      setIsGridMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      gridType === g.type
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{g.label}</span>
                    {gridType === g.type && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
