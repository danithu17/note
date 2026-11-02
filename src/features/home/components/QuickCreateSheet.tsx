import React from 'react';
import {
  FileText,
  PenTool,
  Mic,
  Presentation,
  Camera,
  Sparkles,
} from 'lucide-react';
import { GlassSheet } from '@/features/glass/components/GlassSheet';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useNoteStore } from '@/store/useNoteStore';
import { sound } from '@/utils/sound';
import { hapticsPlatform } from '@/platform';

interface QuickCreateSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickCreateSheet: React.FC<QuickCreateSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const { setMainTab, setLayoutMode, openModal } = useCanvasStore();
  const { createNote } = useNoteStore();

  const handleCreateNote = async () => {
    sound.pop();
    hapticsPlatform.impact('medium').catch(() => {});
    onClose();
    await createNote('New Lecture Note');
    setLayoutMode('notes-only');
    setMainTab('notes');
  };

  const handleCreateDrawing = async () => {
    sound.pop();
    hapticsPlatform.impact('medium').catch(() => {});
    onClose();
    await createNote('New Canvas Sketch');
    setLayoutMode('canvas-only');
    setMainTab('canvas');
  };

  const handleRecordLecture = async () => {
    sound.pop();
    hapticsPlatform.impact('medium').catch(() => {});
    onClose();
    await createNote('Recorded Lecture Memo');
    setLayoutMode('notes-only');
    setMainTab('notes');
  };

  const handleImportPdf = () => {
    sound.click();
    hapticsPlatform.impact('light').catch(() => {});
    onClose();
    openModal('pdf');
  };

  const handleScanPhoto = () => {
    sound.click();
    hapticsPlatform.impact('light').catch(() => {});
    onClose();
    // Trigger file / camera picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = async () => {
      if (input.files && input.files[0]) {
        await createNote('Scanned Document Note');
        setLayoutMode('notes-only');
        setMainTab('notes');
      }
    };
    input.click();
  };

  const items = [
    {
      title: 'New Lecture Note',
      desc: 'Rich Markdown & math equations',
      icon: <FileText className="w-5 h-5 text-blue-500" />,
      bg: 'bg-blue-500/10 text-blue-600',
      action: handleCreateNote,
    },
    {
      title: 'New Canvas Drawing',
      desc: 'Freehand sketching & fluid shapes',
      icon: <PenTool className="w-5 h-5 text-purple-500" />,
      bg: 'bg-purple-500/10 text-purple-600',
      action: handleCreateDrawing,
    },
    {
      title: 'Record Lecture',
      desc: 'Audio-synced notes with live timer',
      icon: <Mic className="w-5 h-5 text-rose-500" />,
      bg: 'bg-rose-500/10 text-rose-600',
      action: handleRecordLecture,
    },
    {
      title: 'Import PDF Slides',
      desc: 'Annotate slides directly on canvas',
      icon: <Presentation className="w-5 h-5 text-amber-500" />,
      bg: 'bg-amber-500/10 text-amber-600',
      action: handleImportPdf,
    },
    {
      title: 'Scan / Photo to Note',
      desc: 'Capture chalkboard or handout',
      icon: <Camera className="w-5 h-5 text-emerald-500" />,
      bg: 'bg-emerald-500/10 text-emerald-600',
      action: handleScanPhoto,
    },
  ];

  return (
    <GlassSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Create Something New"
      subtitle="Quick actions for lecture capture"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={item.action}
            className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-slate-200/80 dark:border-white/10 hover:border-[#007aff] dark:hover:border-[#0a84ff] shadow-xs hover:shadow-md transition-all spring-interactive cursor-pointer text-left select-none group"
          >
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${item.bg} group-hover:scale-105 transition-transform`}
            >
              {item.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold text-slate-900 dark:text-white truncate">
                {item.title}
              </div>
              <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {item.desc}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 p-3 rounded-2xl bg-slate-100/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center gap-2.5 text-[12px] text-slate-500 dark:text-slate-400">
        <Sparkles className="w-4 h-4 text-[#007aff] shrink-0" />
        <span>Press anywhere outside or swipe down to dismiss.</span>
      </div>
    </GlassSheet>
  );
};
