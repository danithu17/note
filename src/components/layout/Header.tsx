import React, { useState, useEffect } from 'react';
import {
  Menu,
  Moon,
  Sun,
  Share2,
  Download,
  Copy,
  FileCode,
  FileDown,
  Layers,
  Layout,
  Sparkles,
  Smartphone,
  ChevronDown,
  Check,
  Search,
  Keyboard,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  MessageSquare,
  History,
  User,
  Cloud,
  WifiOff,
  RefreshCw,
  ChevronRight,
  Archive,
  Brain,
  Flame,
  Presentation,
  Globe,
  Zap,
} from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useNoteStore } from '../../store/useNoteStore';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { useI18nStore } from '@/core/i18n/useI18nStore';
import { useAssistantStore } from '@/features/assistant/useAssistantStore';
import {
  exportCanvasToPng,
  exportCanvasToSvg,
  exportNoteAsJson,
  exportNoteAsMarkdownBundle,
  copyCanvasToClipboard,
  triggerDownload,
} from '../../utils/export';
import { exportAnnotatedPdfDocument } from '@/features/pdf/pdfService';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';

export const Header: React.FC = () => {
  const {
    layoutMode,
    setLayoutMode,
    isDarkMode,
    toggleDarkMode,
    toggleSidebar,
    toggleCommandPalette,
    toggleShortcutsModal,
    toggleSound,
    toggleFullscreen,
    isSoundEnabled,
    isFullscreen,
    openModal,
    setViewMode,
  } = useCanvasStore();

  const {
    getActiveNote,
    notebooks,
    activeNotebookId,
    updateTitle,
    syncStatus,
    exportBackupBundle,
  } = useNoteStore();

  const { user, openAuthModal } = useAuthStore();
  const { locale, setLocale, t } = useI18nStore();
  const activeNote = getActiveNote();

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isMobileStudyMenuOpen, setIsMobileStudyMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  const currentNotebook = notebooks.find(
    (n) => n.id === (activeNote?.notebookId || activeNotebookId)
  );

  const handleStartRename = () => {
    setTitleInput(activeNote?.title || '');
    setIsEditingTitle(true);
  };

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallPrompt(null);
      }
    } else {
      alert(
        'To install ScribbleNote, use your browser\'s "Install App" or "Add to Home Screen" option from the address bar or browser menu.'
      );
    }
  };

  const handleExportPng = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      exportCanvasToPng(canvas, `${activeNote?.title || 'scribble-note'}.png`);
      confetti({ particleCount: 25, spread: 40 });
      sound.pop();
    }
    setIsExportMenuOpen(false);
  };

  const handleExportSvg = () => {
    if (!activeNote) return;
    const svg = exportCanvasToSvg(activeNote.canvasElements, 1920, 1080, true, isDarkMode);
    triggerDownload(svg, `${activeNote.title || 'scribble-drawing'}.svg`, 'image/svg+xml');
    confetti({ particleCount: 25, spread: 40 });
    sound.pop();
    setIsExportMenuOpen(false);
  };

  const handleExportMarkdown = () => {
    if (!activeNote) return;
    exportNoteAsMarkdownBundle(activeNote);
    confetti({ particleCount: 30, spread: 50 });
    sound.pop();
    setIsExportMenuOpen(false);
  };

  const handleExportJson = () => {
    if (!activeNote) return;
    exportNoteAsJson(activeNote);
    confetti({ particleCount: 25, spread: 40 });
    sound.pop();
    setIsExportMenuOpen(false);
  };

  const handleExportFullBackup = async () => {
    const bundle = await exportBackupBundle();
    triggerDownload(
      JSON.stringify(bundle, null, 2),
      `scribblenote_full_backup_${new Date().toISOString().split('T')[0]}.json`,
      'application/json'
    );
    confetti({ particleCount: 35, spread: 50 });
    sound.pop();
    setIsExportMenuOpen(false);
  };

  const handleExportAnnotatedPdf = async () => {
    if (!activeNote) return;
    try {
      await exportAnnotatedPdfDocument(activeNote);
      confetti({ particleCount: 30, spread: 50 });
      sound.pop();
    } catch (err: any) {
      console.error('Failed to export annotated PDF:', err);
      alert('Failed to export annotated PDF: ' + (err.message || 'Unknown error'));
    }
    setIsExportMenuOpen(false);
  };

  const handleCopySnapshot = async () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const ok = await copyCanvasToClipboard(canvas);
      if (ok) {
        setCopiedSuccess(true);
        sound.pop();
        setTimeout(() => setCopiedSuccess(false), 2000);
      }
    }
    setIsExportMenuOpen(false);
  };

  const handleTitleSubmit = async () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && activeNote && titleInput.trim() !== activeNote.title) {
      await updateTitle(titleInput.trim());
    }
  };

  return (
    <header className="h-14 border-b border-slate-200/90 dark:border-slate-800/90 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-3 sm:px-4 flex items-center justify-between shrink-0 select-none z-40 transition-colors">
      {/* Left: Sidebar Toggle, Brand, Breadcrumb Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Notebook Sidebar [B]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => setViewMode('landing')}
          className="flex items-center gap-2 shrink-0 cursor-pointer group"
          title="View ScribbleNote Home & Showcase"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 fill-white" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-extrabold text-sm sm:text-base tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent flex items-center gap-1.5 leading-tight">
              ScribbleNote
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openModal('pricing');
                }}
                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-1.5 py-0.2 rounded-md border border-blue-500/20 uppercase transition-colors cursor-pointer"
                title="View Plans & Commercial Upgrades"
              >
                {user?.plan || 'PRO'}
              </button>
            </span>
          </div>
        </div>

        {/* 🏠 Prominent Home / Landing Page Switcher */}
        <button
          onClick={() => setViewMode('landing')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all shrink-0 border border-slate-200/60 dark:border-white/5 active:scale-95"
          title="Return to Landing Page & Product Overview"
        >
          <span>🏠 Home</span>
        </button>

        {/* Breadcrumb Hierarchy Navigation */}
        {activeNote && (
          <div className="hidden md:flex items-center gap-1 text-xs text-slate-400 dark:text-slate-300 pl-2 border-l border-slate-200 dark:border-slate-800 max-w-md truncate">
            <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[120px]">
              {currentNotebook?.title || activeNote.subject || 'Lecture'}
            </span>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />

            {isEditingTitle ? (
              <input
                type="text"
                autoFocus
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSubmit();
                  if (e.key === 'Escape') {
                    setTitleInput(activeNote.title || '');
                    setIsEditingTitle(false);
                  }
                }}
                className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-slate-800 border border-blue-400 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none w-48"
              />
            ) : (
              <span
                onClick={handleStartRename}
                className="font-bold text-slate-800 dark:text-slate-200 truncate cursor-pointer hover:underline hover:text-blue-600 max-w-[200px]"
                title="Click to rename lecture note"
              >
                {activeNote.title || 'Untitled Note'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Center: Command Palette Trigger & View Mode Switcher */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleCommandPalette}
          className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 text-xs transition-all shadow-xs"
          title="Quick Command Search [Ctrl+K]"
        >
          <Search className="w-3.5 h-3.5 text-blue-500" />
          <span>Quick actions & search...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-mono text-slate-500 dark:text-slate-300 font-bold">
            Ctrl+K
          </kbd>
        </button>

        <div className="hidden md:flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-xl text-xs border border-slate-200/50 dark:border-slate-700/50">
          <button
            onClick={() => setLayoutMode('timeline')}
            title="Chat & Timeline Feed View [Tab]"
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
              layoutMode === 'timeline'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Feed</span>
          </button>

          <button
            onClick={() => setLayoutMode('notes-only')}
            title="Lecture Notes View [Tab]"
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
              layoutMode === 'notes-only'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Notes</span>
          </button>

          <button
            onClick={() => setLayoutMode('split')}
            title="Split Hybrid View [Tab]"
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
              layoutMode === 'split'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Split</span>
          </button>

          <button
            onClick={() => setLayoutMode('canvas-only')}
            title="Visual Canvas View [Tab]"
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
              layoutMode === 'canvas-only'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Canvas</span>
          </button>
        </div>
      </div>

      {/* Right: Cloud Sync, Auth, Version History, Shortcuts, Export, Sound, Theme, Fullscreen */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Study Hub Action Buttons (AI Assistant, Flashcards, Focus Pomodoro, Slide Deck Import) */}
        <div className="hidden sm:flex items-center gap-1 pr-1 border-r border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => useAssistantStore.getState().toggleAssistant()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/15 via-indigo-500/15 to-blue-500/15 hover:from-purple-500/25 hover:via-indigo-500/25 hover:to-blue-500/25 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-xs transition-all active:scale-95"
            title="AI Study Assistant: Chat, Summaries, Quiz Generator & 'Ask My Notes' [Cmd/Ctrl+J]"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden xl:inline">AI Study</span>
          </button>

          <button
            onClick={() => openModal('flashcards')}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="SM-2 Spaced Repetition Flashcards"
          >
            <Brain className="w-4 h-4 text-purple-500" />
          </button>

          <button
            onClick={() => openModal('pomodoro')}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Study Dashboard & Pomodoro Focus Timer"
          >
            <Flame className="w-4 h-4 text-amber-500" />
          </button>

          <button
            onClick={() => openModal('pdf')}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Import PDF Lecture Slides & Annotate"
          >
            <Presentation className="w-4 h-4 text-blue-500" />
          </button>
        </div>

        {/* Mobile Study Hub Dropdown Trigger (< sm) */}
        <div className="relative sm:hidden">
          <button
            onClick={() => setIsMobileStudyMenuOpen(!isMobileStudyMenuOpen)}
            className="p-1.5 rounded-xl text-purple-600 dark:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Study Tools & AI"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {isMobileStudyMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                Study Tools & AI
              </div>
              <button
                onClick={() => {
                  useAssistantStore.getState().setAssistantOpen(true);
                  setIsMobileStudyMenuOpen(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>AI Study Assistant</span>
              </button>
              <button
                onClick={() => {
                  openModal('flashcards');
                  setIsMobileStudyMenuOpen(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Brain className="w-3.5 h-3.5 text-indigo-500" />
                <span>Flashcards (SM-2)</span>
              </button>
              <button
                onClick={() => {
                  openModal('pomodoro');
                  setIsMobileStudyMenuOpen(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Focus Pomodoro</span>
              </button>
              <button
                onClick={() => {
                  openModal('pdf');
                  setIsMobileStudyMenuOpen(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Presentation className="w-3.5 h-3.5 text-blue-500" />
                <span>Import PDF Slides</span>
              </button>
              <div className="h-px bg-slate-200 dark:bg-slate-800 my-0.5" />
              <button
                onClick={() => {
                  openModal('pricing');
                  setIsMobileStudyMenuOpen(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-blue-500" />
                <span>Upgrade to Pro</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => openModal('sync')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            syncStatus.state === 'synced'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
              : syncStatus.state === 'syncing'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-500/30 animate-pulse'
                : syncStatus.state === 'offline'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-500/30'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-500/30'
          }`}
          title={`Sync status: ${syncStatus.state} (${syncStatus.mode})`}
        >
          {syncStatus.state === 'synced' ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          ) : syncStatus.state === 'syncing' ? (
            <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
          ) : syncStatus.state === 'offline' ? (
            <WifiOff className="w-3 h-3 text-amber-500" />
          ) : (
            <Cloud className="w-3 h-3 text-rose-500" />
          )}

          <span className="hidden lg:inline capitalize">
            {syncStatus.state === 'synced' ? 'Synced' : syncStatus.state}
          </span>
          {syncStatus.pendingQueueCount ? (
            <span className="text-[10px] font-mono px-1 rounded bg-blue-200 dark:bg-blue-900">
              {syncStatus.pendingQueueCount}
            </span>
          ) : null}
        </button>

        <button
          onClick={() => openModal('history')}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Note Version History & Snapshots"
        >
          <History className="w-4 h-4" />
        </button>

        <button
          onClick={openAuthModal}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            user?.isGuest
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
          }`}
          title={
            user?.isGuest ? 'Guest Mode: Click to sign in and upgrade' : `Account: ${user?.email}`
          }
        >
          <User className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {user?.isGuest ? 'Guest' : user?.name?.split(' ')[0] || 'Account'}
          </span>
        </button>

        <button
          onClick={toggleShortcutsModal}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:flex"
          title="Keyboard Shortcuts Cheatsheet [?]"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        <button
          onClick={toggleSound}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:flex"
          title={isSoundEnabled ? 'Interface Sound FX: ON' : 'Interface Sound FX: MUTED'}
        >
          {isSoundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden lg:flex"
          title="Toggle Fullscreen Immersion [F]"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Export Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95"
            title="Export Options"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {isExportMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1">
                Export Options
              </div>

              <button
                onClick={handleExportPng}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-4 h-4 text-blue-500" />
                <span>Export Drawing as PNG</span>
              </button>

              <button
                onClick={handleExportSvg}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <FileCode className="w-4 h-4 text-emerald-500" />
                <span>Export Vector SVG</span>
              </button>

              <button
                onClick={handleExportMarkdown}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <FileDown className="w-4 h-4 text-purple-500" />
                <span>Export Note (.md + Sketch)</span>
              </button>

              <button
                onClick={handleExportJson}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Share2 className="w-4 h-4 text-amber-500" />
                <span>Export Single Note JSON</span>
              </button>

              <button
                onClick={handleExportFullBackup}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Archive className="w-4 h-4 text-indigo-500" />
                <span>Export Full Backup Bundle (.json)</span>
              </button>

              <button
                onClick={handleExportAnnotatedPdf}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Presentation className="w-4 h-4 text-rose-500" />
                <span>Export Annotated Slides (PDF)</span>
              </button>

              <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />

              <button
                onClick={handleCopySnapshot}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copiedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Copied to Clipboard!
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Copy Canvas Image</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {installPrompt && (
          <button
            onClick={handleInstallApp}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Install ScribbleNote PWA"
          >
            <Smartphone className="w-4 h-4 text-blue-500" />
          </button>
        )}

        {/* Language Selector (EN | SI | TA) */}
        <div className="relative">
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/80 dark:border-slate-800"
            title="Change Language / භාෂාව / மொழி"
            aria-label="Change Language"
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span className="uppercase text-[11px] font-bold">{locale}</span>
          </button>

          {isLangMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 flex flex-col gap-0.5 z-50 animate-in fade-in zoom-in-95">
              <button
                onClick={() => {
                  setLocale('en');
                  setIsLangMenuOpen(false);
                }}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  locale === 'en'
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>English</span>
                {locale === 'en' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => {
                  setLocale('si');
                  setIsLangMenuOpen(false);
                }}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  locale === 'si'
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>සිංහල</span>
                {locale === 'si' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => {
                  setLocale('ta');
                  setIsLangMenuOpen(false);
                }}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  locale === 'ta'
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>தமிழ்</span>
                {locale === 'ta' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDarkMode ? t.navigation.themeLight : t.navigation.themeDark}
          aria-label={isDarkMode ? t.navigation.themeLight : t.navigation.themeDark}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
