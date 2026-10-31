import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Shield, ShieldAlert, Trash2, Wand2 } from 'lucide-react';
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
    <div className="absolute top-3 sm:top-4 right-2 sm:right-4 z-20 flex items-center gap-1 sm:gap-2 pointer-events-auto select-none">
      {/* Palm rejection badge & toggle */}
      <button
        onClick={togglePalmRejection}
        title={
          palmRejection
            ? 'Palm Rejection ON: Stylus writes, finger pans/zooms (palm touches ignored)'
            : 'Palm Rejection OFF: Touch drawing active'
        }
        className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium shadow-md backdrop-blur-md transition-all border ${
          palmRejection
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
            : 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300'
        }`}
      >
        {palmRejection ? (
          <>
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden md:inline">Palm Rejection</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 hidden sm:inline">Stylus</span>
          </>
        ) : (
          <>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Palm Rejection</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400 hidden sm:inline">Touch</span>
          </>
        )}
      </button>

      {/* Auto-Shape Recognition toggle */}
      <button
        onClick={toggleAutoShapeRecognition}
        title={
          autoShapeRecognition
            ? 'Auto-Shape Recognition ON: Hand-drawn loops & lines automatically snap into shapes'
            : 'Auto-Shape Recognition OFF'
        }
        className={`hidden sm:flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium shadow-md backdrop-blur-md transition-all border ${
          autoShapeRecognition
            ? 'bg-blue-500/15 border-blue-500/40 text-blue-700 dark:text-blue-300'
            : 'bg-slate-500/15 border-slate-500/30 text-slate-500 dark:text-slate-400'
        }`}
      >
        <Wand2 className={`w-3.5 h-3.5 ${autoShapeRecognition ? 'text-blue-500' : 'text-slate-400'}`} />
        <span className="hidden md:inline">Auto-Shape</span>
      </button>

      {/* Zoom controls card */}
      <div className="flex items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl shadow-md border border-slate-200/80 dark:border-slate-800 p-0.5 sm:p-1 text-slate-700 dark:text-slate-200">
        <button
          onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}
          className="hidden sm:flex p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={resetView}
          className="px-2 py-1 text-xs font-mono font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors min-w-[2.8rem] text-center"
          title="Reset to 100%"
        >
          {zoomPercent}%
        </button>

        <button
          onClick={() => setZoom((z) => Math.min(5, z + 0.1))}
          className="hidden sm:flex p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={resetView}
          className="hidden md:flex p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border-l border-slate-200 dark:border-slate-800 ml-1"
          title="Reset View (Ctrl+0)"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>

      {/* Clear canvas button */}
      {hasElements && (
        <button
          onClick={onClear}
          className="p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border border-slate-200/80 dark:border-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          title="Clear Canvas"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
