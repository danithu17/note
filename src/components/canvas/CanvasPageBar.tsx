import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Layers } from 'lucide-react';
import { useNoteStore } from '@/store/useNoteStore';

export const CanvasPageBar: React.FC = () => {
  const { getActiveNote, addPage, selectPage, deletePage } = useNoteStore();
  const activeNote = getActiveNote();
  const [isPageDrawerOpen, setIsPageDrawerOpen] = useState(false);

  if (!activeNote) return null;

  const pages =
    activeNote.pages && activeNote.pages.length > 0
      ? activeNote.pages
      : [{ id: `p_${activeNote.id}_0`, pageIndex: 0, elements: activeNote.canvasElements || [] }];

  const activePageIndex = activeNote.activePageIndex || 0;
  const totalPages = pages.length;

  const handlePrev = () => {
    if (activePageIndex > 0) {
      selectPage(activePageIndex - 1);
    }
  };

  const handleNext = () => {
    if (activePageIndex < totalPages - 1) {
      selectPage(activePageIndex + 1);
    }
  };

  return (
    <div className="relative flex flex-col gap-1 select-none pointer-events-auto">
      {/* Main Page Navigation Bar */}
      <div className="flex items-center gap-0.5 sm:gap-1 p-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-md rounded-2xl text-xs">
        <button
          onClick={() => setIsPageDrawerOpen(!isPageDrawerOpen)}
          className="flex items-center gap-1 px-1.5 sm:px-2 py-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors"
          title="Toggle Canvas Page List"
        >
          <Layers className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="font-semibold text-[11px] sm:text-xs">
            {activePageIndex + 1}/{totalPages}
          </span>
        </button>

        <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

        <button
          onClick={handlePrev}
          disabled={activePageIndex === 0}
          className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleNext}
          disabled={activePageIndex === totalPages - 1}
          className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Next Page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

        <button
          onClick={() => addPage()}
          className="flex items-center justify-center p-1 sm:px-2 sm:py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs transition-all active:scale-95"
          title="Add New Canvas Page"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden xl:inline ml-1 text-xs">Page</span>
        </button>
      </div>

      {/* Dropdown Page Drawer */}
      {isPageDrawerOpen && (
        <div className="absolute top-full mt-2 left-0 flex flex-col gap-1.5 p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xl rounded-2xl w-48 max-h-64 overflow-y-auto z-40 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            <span>Pages ({totalPages})</span>
            <span className="text-[10px] text-blue-500 font-normal">Vector Layer</span>
          </div>

          {pages.map((p, idx) => {
            const isSelected = idx === activePageIndex;
            return (
              <div
                key={p.id || idx}
                onClick={() => {
                  selectPage(idx);
                  setIsPageDrawerOpen(false);
                }}
                className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-500/40 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-mono">
                    {idx + 1}
                  </span>
                  <span className="text-xs">Page {idx + 1}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-600 dark:text-slate-300">
                    {p.elements?.length || 0} strk
                  </span>

                  {totalPages > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete Page ${idx + 1}?`)) {
                          deletePage(idx);
                        }
                      }}
                      className="p-1 text-slate-600 dark:text-slate-300 hover:text-rose-500 rounded transition-colors"
                      title="Delete Page"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
