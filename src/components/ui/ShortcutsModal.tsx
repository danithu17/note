import React from 'react';
import { X, Keyboard, Sparkles } from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';

export const ShortcutsModal: React.FC = () => {
  const { isShortcutsModalOpen, setShortcutsModalOpen } = useCanvasStore();

  if (!isShortcutsModalOpen) return null;

  const shortcutSections = [
    {
      title: 'Drawing & Pen Tools',
      items: [
        { key: '1 / P', desc: 'Pen Tool' },
        { key: '2 / H', desc: 'Highlighter' },
        { key: '3 / E', desc: 'Eraser (Click again for Pix/Obj)' },
        { key: '4 / S', desc: 'Geometric Shapes' },
        { key: '5 / L', desc: 'Laser Pointer (Presenting / Teaching)' },
        { key: '[ / ]', desc: 'Decrease / Increase Stroke Width' },
      ],
    },
    {
      title: 'Layout & View Toggles',
      items: [
        { key: 'Tab', desc: 'Cycle Layout (Split ↔ Canvas ↔ Notes)' },
        { key: 'G', desc: 'Cycle Grid (Dots → Ruled → Math → 3D → Blank)' },
        { key: 'B', desc: 'Toggle Sidebar' },
        { key: 'D', desc: 'Toggle Dark / Light Theme' },
        { key: 'F', desc: 'Toggle Fullscreen Immersion Mode' },
        { key: 'Ctrl + 0', desc: 'Reset Canvas Zoom to 100%' },
      ],
    },
    {
      title: 'Quick Power Actions',
      items: [
        { key: 'Ctrl + K', desc: 'Command Palette / Quick Search' },
        { key: 'Ctrl + Z', desc: 'Undo Canvas Stroke' },
        { key: 'Ctrl + Y', desc: 'Redo Canvas Stroke' },
        { key: 'Ctrl + Enter', desc: 'Snapshot Canvas into Lecture Note' },
        { key: 'Ctrl + C', desc: 'Copy Canvas Snapshot to Clipboard' },
        { key: '?', desc: 'Open / Close this Shortcuts Sheet' },
      ],
    },
  ];

  return (
    <div
      onClick={() => setShortcutsModalOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden relative"
      >
        {/* Close Button */}
        <button
          onClick={() => setShortcutsModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Keyboard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Keyboard Shortcuts & Quick Toggles
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h2>
            <p className="text-xs text-slate-500">
              Blazing fast navigation for effortless lecture note-taking & sketching
            </p>
          </div>
        </div>

        {/* Shortcuts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shortcutSections.map((sec) => (
            <div
              key={sec.title}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-2.5"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {sec.title}
              </h3>
              <div className="flex flex-col gap-2">
                {sec.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between text-xs gap-2"
                  >
                    <span className="text-slate-700 dark:text-slate-300 text-[11px]">
                      {item.desc}
                    </span>
                    <kbd className="px-2 py-1 rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-mono text-[10px] font-semibold shadow-xs border border-slate-200 dark:border-slate-600 shrink-0">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Tip */}
        <div className="mt-5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/50 text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
          <span>💡 Press <kbd className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 font-mono text-[10px] font-bold">Ctrl+K</kbd> anytime to open the global Command Search bar.</span>
          <span className="text-[10px] font-semibold text-blue-500">Press ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
};
