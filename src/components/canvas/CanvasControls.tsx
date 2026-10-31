import React from 'react';
import { ZoomIn, ZoomOut, Shield, ShieldAlert, Trash2, Wand2 } from 'lucide-react';
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
      {/* Palm rejection badge & toggle */}
      <button
        onClick={togglePalmRejection}
        title={
          palmRejection
            ? 'Palm Rejection ON: Stylus writes, finger pans/zooms (palm touches ignored)'
            : 'Palm Rejection OFF: Touch drawing active'
        }
        className={`flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium shadow-sm backdrop-blur-md transition-all border ${
          palmRejection
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
            : 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300'
        }`}
      >
        {palmRejection ? (
          <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        ) : (
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        )}
        <span className="text-[11px] font-semibold hidden xl:inline">
          {palmRejection ? 'Stylus' : 'Touch'}
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
