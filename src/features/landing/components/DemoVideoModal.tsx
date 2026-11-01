import React from 'react';
import { X, Sparkles, CheckCircle2, Play } from 'lucide-react';

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartFree: () => void;
}

export const DemoVideoModal: React.FC<DemoVideoModalProps> = ({
  isOpen,
  onClose,
  onStartFree,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-[#1c1c1e] rounded-[28px] border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close demo"
          className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-[#0071e3] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[14px] font-bold text-[#0071e3] tracking-wide uppercase">
            60-Second Interactive Tour
          </span>
        </div>

        <h3
          id="demo-modal-title"
          className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]"
        >
          ScribbleNote in 60 Seconds
        </h3>
        <p className="mt-2 text-[16px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
          Watch how ScribbleNote seamlessly connects typed markdown, fluid handwriting, slide annotation, and timestamped audio recordings in one unified canvas.
        </p>

        {/* Video / Interactive Player Simulation */}
        <div className="mt-6 aspect-video w-full rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 border border-black/10 dark:border-white/10 relative overflow-hidden flex flex-col justify-between p-6 text-white shadow-inner">
          <div className="flex items-center justify-between text-[14px]">
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md font-medium">
              Demo: Lecture 07 — Neural Optimization
            </span>
            <span className="font-mono text-emerald-400 font-semibold">00:48 / 01:00</span>
          </div>

          <div className="flex flex-col items-center justify-center text-center my-auto">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-lg">
              <Play className="w-8 h-8 fill-white translate-x-0.5" />
            </div>
            <p className="mt-4 text-[17px] font-semibold text-white">
              Full Interactive Engine Ready
            </p>
            <p className="text-[14px] text-slate-300 max-w-md mt-1">
              Zero lag vector strokes, shape recognition, KaTeX equations, and local Dexie database.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-[13px] sm:text-[14px]">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Offline IndexedDB</span>
            </div>
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Audio-Vector Sync</span>
            </div>
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Study AI Assistant</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-black/10 dark:border-white/10">
          <span className="text-[14px] text-slate-500 dark:text-slate-400">
            Ready to test with your own lecture notes?
          </span>
          <button
            onClick={() => {
              onClose();
              onStartFree();
            }}
            className="w-full sm:w-auto h-12 px-8 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-[15px] font-semibold shadow-md shadow-blue-500/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            Launch Notebook Free (14 Days)
          </button>
        </div>
      </div>
    </div>
  );
};
