import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Pen,
  Highlighter,
  Eraser,
  Sparkles,
  Zap,
  Grid,
  FileText,
  Layout,
  Layers,
  Plus,
  Moon,
  Sun,
  Shield,
  Volume2,
  VolumeX,
  Maximize2,
  HelpCircle,
  Brain,
  Flame,
  Presentation,
  Crown,
} from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useNoteStore } from '../../store/useNoteStore';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { useAssistantStore } from '@/features/assistant/useAssistantStore';
import { ModalPortal } from '@/components/ui/ModalPortal';
import confetti from 'canvas-confetti';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setTool,
    setShape,
    setGridType,
    setLayoutMode,
    toggleDarkMode,
    togglePalmRejection,
    toggleFullscreen,
    toggleSound,
    isSoundEnabled,
    isDarkMode,
    toggleShortcutsModal,
    openModal,
    setViewMode,
  } = useCanvasStore();

  const { notes, selectNote, createNote } = useNoteStore();
  const user = useAuthStore((s) => s.user);
  const isOwnerAdmin = user?.email?.toLowerCase() === 'nimjayad@gmail.com';
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      const timer = setTimeout(() => {
        setQuery('');
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  // Static commands list
  const commands = [
    // Tools
    {
      id: 'tool-pen',
      title: 'Pen Tool',
      category: 'Drawing Tools',
      shortcut: '1 or P',
      icon: <Pen className="w-4 h-4 text-blue-500" />,
      action: () => setTool('pen'),
    },
    {
      id: 'tool-highlighter',
      title: 'Highlighter Tool',
      category: 'Drawing Tools',
      shortcut: '2 or H',
      icon: <Highlighter className="w-4 h-4 text-amber-500" />,
      action: () => setTool('highlighter'),
    },
    {
      id: 'tool-eraser',
      title: 'Eraser Tool',
      category: 'Drawing Tools',
      shortcut: '3 or E',
      icon: <Eraser className="w-4 h-4 text-rose-500" />,
      action: () => setTool('eraser'),
    },
    {
      id: 'tool-laser',
      title: 'Laser Pointer (Presentation Glow)',
      category: 'Drawing Tools',
      shortcut: '5 or L',
      icon: <Zap className="w-4 h-4 text-emerald-500" />,
      action: () => setTool('laser'),
    },
    {
      id: 'shape-rect',
      title: 'Draw Rectangle',
      category: 'Shapes',
      shortcut: '4 or S',
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
      action: () => setShape('rectangle'),
    },
    {
      id: 'shape-circle',
      title: 'Draw Circle',
      category: 'Shapes',
      shortcut: '',
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
      action: () => setShape('circle'),
    },
    {
      id: 'shape-arrow',
      title: 'Draw Arrow Connector',
      category: 'Shapes',
      shortcut: '',
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
      action: () => setShape('arrow'),
    },

    // Views
    {
      id: 'view-split',
      title: 'Split View (Notes + Canvas)',
      category: 'Layout',
      shortcut: 'Tab',
      icon: <Layout className="w-4 h-4 text-blue-500" />,
      action: () => setLayoutMode('split'),
    },
    {
      id: 'view-canvas',
      title: 'Canvas Only (Full Screen Sketch)',
      category: 'Layout',
      shortcut: 'Tab',
      icon: <Layers className="w-4 h-4 text-blue-500" />,
      action: () => setLayoutMode('canvas-only'),
    },
    {
      id: 'view-notes',
      title: 'Notes Only (Focused Markdown)',
      category: 'Layout',
      shortcut: 'Tab',
      icon: <FileText className="w-4 h-4 text-blue-500" />,
      action: () => setLayoutMode('notes-only'),
    },

    // Grids
    {
      id: 'grid-dots',
      title: 'Dot Matrix Paper',
      category: 'Paper Grid',
      shortcut: 'G',
      icon: <Grid className="w-4 h-4 text-slate-500" />,
      action: () => setGridType('dots'),
    },
    {
      id: 'grid-ruled',
      title: 'Ruled Lined Paper',
      category: 'Paper Grid',
      shortcut: 'G',
      icon: <Grid className="w-4 h-4 text-slate-500" />,
      action: () => setGridType('ruled'),
    },
    {
      id: 'grid-math',
      title: 'Math Graph Grid',
      category: 'Paper Grid',
      shortcut: 'G',
      icon: <Grid className="w-4 h-4 text-slate-500" />,
      action: () => setGridType('grid'),
    },
    {
      id: 'grid-iso',
      title: 'Isometric 3D Grid',
      category: 'Paper Grid',
      shortcut: 'G',
      icon: <Grid className="w-4 h-4 text-slate-500" />,
      action: () => setGridType('isometric'),
    },
    {
      id: 'grid-blank',
      title: 'Blank Slate',
      category: 'Paper Grid',
      shortcut: 'G',
      icon: <Grid className="w-4 h-4 text-slate-500" />,
      action: () => setGridType('blank'),
    },

    // Actions
    {
      id: 'act-new-note',
      title: 'Create New Lecture Note',
      category: 'Actions',
      shortcut: 'Ctrl+N',
      icon: <Plus className="w-4 h-4 text-emerald-500" />,
      action: async () => {
        const id = await createNote();
        selectNote(id);
        confetti({ particleCount: 25, spread: 45 });
      },
    },
    {
      id: 'act-theme',
      title: isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme',
      category: 'Actions',
      shortcut: 'D',
      icon: isDarkMode ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-400" />
      ),
      action: () => toggleDarkMode(),
    },
    {
      id: 'act-palm',
      title: 'Toggle Palm Rejection (Stylus mode)',
      category: 'Actions',
      shortcut: '',
      icon: <Shield className="w-4 h-4 text-emerald-500" />,
      action: () => togglePalmRejection(),
    },
    {
      id: 'act-fullscreen',
      title: 'Toggle Fullscreen Immersion',
      category: 'Actions',
      shortcut: 'F',
      icon: <Maximize2 className="w-4 h-4 text-blue-500" />,
      action: () => toggleFullscreen(),
    },
    {
      id: 'act-sound',
      title: isSoundEnabled ? 'Mute Interface Sound FX' : 'Enable Tactile Sound FX',
      category: 'Actions',
      shortcut: '',
      icon: isSoundEnabled ? (
        <VolumeX className="w-4 h-4 text-slate-400" />
      ) : (
        <Volume2 className="w-4 h-4 text-emerald-500" />
      ),
      action: () => toggleSound(),
    },
    {
      id: 'act-shortcuts',
      title: 'View All Keyboard Shortcuts',
      category: 'Actions',
      shortcut: '?',
      icon: <HelpCircle className="w-4 h-4 text-purple-400" />,
      action: () => toggleShortcutsModal(),
    },
    {
      id: 'act-ai-assistant',
      title: 'Chat AI Study Assistant (iMessage Style)',
      category: 'Study Tools',
      shortcut: 'Cmd+J',
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
      action: () => useAssistantStore.getState().toggleAssistant(),
    },
    {
      id: 'act-landing-page',
      title: 'View ScribbleNote Landing Page & Showcase',
      category: 'Navigation',
      shortcut: '',
      icon: <Layers className="w-4 h-4 text-blue-500" />,
      action: () => setViewMode('landing'),
    },
    {
      id: 'act-pricing',
      title: 'Commercial Plans & 14-Day Free Trial',
      category: 'Billing',
      shortcut: '',
      icon: <Sparkles className="w-4 h-4 text-blue-500" />,
      action: () => openModal('pricing'),
    },
    ...(isOwnerAdmin
      ? [
          {
            id: 'act-admin',
            title: '👑 GOD MODE: Supreme System Overlord & Telemetry Control',
            category: 'God Mode',
            shortcut: 'admin',
            icon: <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />,
            action: () => {
              confetti({ particleCount: 30, spread: 60 });
              openModal('admin');
            },
          },
        ]
      : []),
    {
      id: 'act-reset-demo',
      title: 'Reset Demo Data to Clean Workspace',
      category: 'Actions',
      shortcut: '',
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      action: async () => {
        if (window.confirm('Remove example notes and reset to a clean blank workspace?')) {
          await useNoteStore.getState().resetWorkspaceToClean();
        }
      },
    },
    {
      id: 'act-flashcards',
      title: 'Spaced Repetition Flashcards (SM-2)',
      category: 'Study Tools',
      shortcut: '',
      icon: <Brain className="w-4 h-4 text-indigo-500" />,
      action: () => openModal('flashcards'),
    },
    {
      id: 'act-pomodoro',
      title: 'Study Dashboard & Focus Timer (Pomodoro)',
      category: 'Study Tools',
      shortcut: '',
      icon: <Flame className="w-4 h-4 text-amber-500" />,
      action: () => openModal('pomodoro'),
    },
    {
      id: 'act-pdf',
      title: 'Import PDF / PPT Slides & Annotate',
      category: 'Study Tools',
      shortcut: '',
      icon: <Presentation className="w-4 h-4 text-blue-500" />,
      action: () => openModal('pdf'),
    },
    {
      id: 'act-pricing',
      title: 'View Commercial Plans & Upgrade to Pro',
      category: 'Account & Plans',
      shortcut: '',
      icon: <Zap className="w-4 h-4 text-blue-500" />,
      action: () => openModal('pricing'),
    },
  ];

  // Notes results matching query
  const noteItems = notes
    .filter(
      (n) =>
        n.title.toLowerCase().includes(query.toLowerCase()) ||
        n.subject.toLowerCase().includes(query.toLowerCase()) ||
        n.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
    )
    .map((n) => ({
      id: `note-${n.id}`,
      title: `${n.title} (${n.subject})`,
      category: 'Lecture Notes',
      shortcut: `#${n.tags[0] || 'Note'}`,
      icon: <FileText className="w-4 h-4 text-blue-500" />,
      action: () => selectNote(n.id),
    }));

  const allFiltered = [
    ...noteItems,
    ...commands.filter(
      (c) =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
    ),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % allFiltered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allFiltered.length) % allFiltered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allFiltered[selectedIndex]) {
        allFiltered[selectedIndex].action();
        setCommandPaletteOpen(false);
      }
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  };

  return (
    <ModalPortal>
      <div
        onClick={() => setCommandPaletteOpen(false)}
        className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in"
      >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col max-h-[70vh] animate-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-blue-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, tool, or search lecture notes... (e.g. 'pen', 'ruled', 'cs204')"
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
          />
          <kbd className="hidden sm:inline px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500 border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
          {allFiltered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching commands or notes found.
            </div>
          ) : (
            allFiltered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    setCommandPaletteOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-xs ${
                    isSelected
                      ? 'bg-blue-600 text-white font-medium shadow-sm'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={isSelected ? 'text-white' : ''}>{item.icon}</div>
                    <span className="truncate max-w-[340px]">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] ${
                        isSelected ? 'text-blue-100 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      {item.category}
                    </span>
                    {item.shortcut && (
                      <kbd
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                          isSelected
                            ? 'bg-blue-700/60 border-blue-400 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                        }`}
                      >
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Helper Bar */}
        <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 select-none">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span className="font-mono text-[10px]">ScribbleNote Raycast</span>
        </div>
      </div>
    </div>
  </ModalPortal>
  );
};
