import React from 'react';
import { ZoomIn, ZoomOut, Shield, ShieldCheck, Trash2, Wand2 } from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';

interface CanvasControlsProps {
  onClear: () => void;
  hasElements: boolean;
}

export const CanvasControls: React.FC<CanvasControlsProps> = ({ onClear, hasElements }) => {
  const {
    zoom,
    setZoom,
    resetView,
    palmRejection,
    togglePalmRejection,
    autoShapeRecognition,
    toggleAutoShapeRecognition,
  } = useCanvasStore();

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto select-none">
      {/* Touch & Stylus drawing mode toggle */}
      <button
        onClick={togglePalmRejection}
        title={
          palmRejection
            ? 'Stylus-Only Mode (ON): Only active stylus draws, finger pans/zooms.'
            : 'Touch & Pen Mode: Both finger and stylus draw! (Use 2 fingers to pan/zoom).'
        }
        className={`flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium shadow-sm backdrop-blur-md transition-all border ${
          palmRejection
            ? 'bg-purple-500/15 border-purple-500/40 text-purple-700 dark:text-purple-300'
            : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
        }`}
      >
        {palmRejection ? (
          <Shield className="w-3.5 h-3.5 text-purple-500 shrink-0" />
        ) : (
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        )}
        <span className="text-[11px] font-semibold hidden xl:inline">
          {palmRejection ? 'Stylus Only' : 'Touch & Pen'}
        </span>
      </button>

      {/* Auto-Shape Recognition toggle */}
      <button
        onClick={toggleAutoShapeRecognition}
        title={
          autoShapeRecognition
            ? 'Auto-Shape Snap ON: Hand-drawn loops & lines automatically snap into geometric shapes'
            : 'Auto-Shape Snap OFF'
        }
        className={`flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium shadow-sm backdrop-blur-md transition-all border ${
          autoShapeRecognition
            ? 'bg-blue-500/15 border-blue-500/40 text-blue-700 dark:text-blue-300'
            : 'bg-slate-500/10 border-slate-500/25 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
        }`}
      >
        <Wand2 className={`w-3.5 h-3.5 shrink-0 ${autoShapeRecognition ? 'text-blue-500' : 'text-slate-400'}`} />
        <span className="text-[11px] font-semibold hidden xl:inline">Shape</span>
      </button>

      {/* Zoom controls card */}
      <div className="flex items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-0.5 text-slate-700 dark:text-slate-200">
        <button
          onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}
          className="hidden sm:flex p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={resetView}
          className="px-1.5 py-0.5 text-xs font-mono font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors min-w-[2.6rem] text-center"
          title="Reset to 100% (Ctrl+0)"
        >
          {zoomPercent}%
        </button>

        <button
          onClick={() => setZoom((z) => Math.min(5, z + 0.1))}
          className="hidden sm:flex p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Clear canvas button */}
      {hasElements && (
        <button
          onClick={onClear}
          className="p-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border border-slate-200/80 dark:border-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          title="Clear Canvas"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
