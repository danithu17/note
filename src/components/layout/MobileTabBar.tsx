import React from 'react';
import { FileText, PenTool, Sparkles, Flame } from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useAssistantStore } from '@/features/assistant/useAssistantStore';
import { sound } from '@/utils/sound';

export const MobileTabBar: React.FC = () => {
  const { layoutMode, setLayoutMode, openModal } = useCanvasStore();
  const { isOpen: isAssistantOpen, setAssistantOpen } = useAssistantStore();

  const handleSelectTab = (tab: 'notes' | 'canvas' | 'assistant' | 'study') => {
    sound.click();
    if (tab === 'notes') {
      setLayoutMode('notes-only');
      setAssistantOpen(false);
    } else if (tab === 'canvas') {
      setLayoutMode('canvas-only');
      setAssistantOpen(false);
    } else if (tab === 'assistant') {
      setAssistantOpen(true);
    } else if (tab === 'study') {
      openModal('pomodoro');
    }
  };

  const isNotesActive = !isAssistantOpen && (layoutMode === 'notes-only' || layoutMode === 'split');
  const isCanvasActive = !isAssistantOpen && layoutMode === 'canvas-only';
  const isAssistantActive = isAssistantOpen;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 apple-blur border-t border-slate-200/80 dark:border-white/10 px-2 py-1 flex items-center justify-around select-none transition-colors"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 8px), 8px)' }}
    >
      {/* 1. Notes Tab */}
      <button
        onClick={() => handleSelectTab('notes')}
        className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all ${
          isNotesActive
            ? 'text-[#007aff] dark:text-[#0a84ff] font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
        aria-label="Notes Tab"
      >
        <FileText className="w-5 h-5" />
        <span className="text-[10px] tracking-tight">Notes</span>
      </button>

      {/* 2. Canvas Tab */}
      <button
        onClick={() => handleSelectTab('canvas')}
        className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all ${
          isCanvasActive
            ? 'text-[#007aff] dark:text-[#0a84ff] font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
        aria-label="Drawing Canvas Tab"
      >
        <PenTool className="w-5 h-5" />
        <span className="text-[10px] tracking-tight">Canvas</span>
      </button>

      {/* 3. AI Assistant Tab */}
      <button
        onClick={() => handleSelectTab('assistant')}
        className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all relative ${
          isAssistantActive
            ? 'text-[#007aff] dark:text-[#0a84ff] font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
        aria-label="AI Study Assistant Tab"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500" />
        </div>
        <span className="text-[10px] tracking-tight">Assistant</span>
      </button>

      {/* 4. Study Focus Tab */}
      <button
        onClick={() => handleSelectTab('study')}
        className="flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-amber-500 transition-all"
        aria-label="Study & Focus Tab"
      >
        <Flame className="w-5 h-5 text-amber-500" />
        <span className="text-[10px] tracking-tight">Study</span>
      </button>
    </nav>
  );
};
