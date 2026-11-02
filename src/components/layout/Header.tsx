import React, { useState, useEffect } from 'react';
import {
  Menu,
  Home,
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
  ChevronRight,
  Archive,
  Brain,
  Flame,
  Presentation,
  MoreHorizontal,
  Crown,
  Zap,
  ShieldAlert,
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
    setMainTab,
  } = useCanvasStore();

  const {
    getActiveNote,
    notebooks,
    activeNotebookId,
    updateTitle,
    syncStatus,
    exportBackupBundle,
  } = useNoteStore();

  const { user, openAuthModal, openAccountModal } = useAuthStore();
  const isOwnerAdmin = user?.email?.toLowerCase() === 'nimjayad@gmail.com';
  const { locale, setLocale, t } = useI18nStore();
  const activeNote = getActiveNote();

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
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
    <header className="h-14 border-b border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-3 sm:px-4 flex items-center justify-between shrink-0 select-none z-40 transition-colors gap-2">
      {/* 1. Left: Sidebar Toggle, Brand (Logo + Name + Badge), Breadcrumb Title */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          title="Toggle Notebook Sidebar [B]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            sound.click();
            setMainTab('home');
          }}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          title="Return to Home Dashboard"
          aria-label="Home Dashboard"
        >
          <Home className="w-4 h-4" />
        </button>

        <div
          onClick={() => {
            useCanvasStore.getState().setMainTab('home');
          }}
          className="flex items-center gap-2 shrink-0 cursor-pointer group"
          title="Return to Home Dashboard"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-1 ring-white/20 group-hover:scale-105 transition-transform shrink-0">
            <Sparkles className="w-4 h-4 fill-white" />
          </div>
          <div className="flex flex-col shrink-0">
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

        {/* Note Breadcrumb (Visible only on xl+ screens to prevent any overlap on laptops) */}
        {activeNote && (
          <div className="hidden xl:flex items-center gap-1 text-xs text-slate-400 dark:text-slate-400 pl-2 border-l border-slate-200 dark:border-slate-800 truncate max-w-[180px]">
            <span className="text-slate-600 dark:text-slate-300 font-medium truncate">
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
                className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-slate-800 border border-blue-400 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none w-36"
              />
            ) : (
              <span
                onClick={handleStartRename}
                className="font-bold text-slate-800 dark:text-slate-200 truncate cursor-pointer hover:underline hover:text-blue-600"
                title="Click to rename note"
              >
                {activeNote.title || 'Untitled Note'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 2. Center: Layout Mode Switcher (Feed | Notes | Split | Canvas) */}
      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl text-xs border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
          <button
            onClick={() => setLayoutMode('timeline')}
            title="Chat & Timeline Feed View [Tab]"
            className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              layoutMode === 'timeline'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">Feed</span>
          </button>

          <button
            onClick={() => setLayoutMode('notes-only')}
            title="Lecture Notes View [Tab]"
            className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              layoutMode === 'notes-only'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">Notes</span>
          </button>

          <button
            onClick={() => setLayoutMode('split')}
            title="Split Hybrid View [Tab]"
            className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              layoutMode === 'split'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">Split</span>
          </button>

          <button
            onClick={() => setLayoutMode('canvas-only')}
            title="Visual Canvas View [Tab]"
            className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              layoutMode === 'canvas-only'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">Canvas</span>
          </button>
        </div>
      </div>

      {/* 3. Right: Essential Primary Tools & Consolidated Overflow Menu */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Quick Command Search [Ctrl+K] Button */}
        <button
          onClick={toggleCommandPalette}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Quick Actions & Command Palette [Ctrl+K]"
        >
          <Search className="w-4 h-4 text-blue-500" />
        </button>

        {/* AI Study Assistant (Direct Action) */}
        <button
          onClick={() => useAssistantStore.getState().toggleAssistant()}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
          title="AI Study Assistant [Cmd/Ctrl+J]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Assistant</span>
        </button>

        {/* Spaced Repetition Flashcards */}
        <button
          onClick={() => openModal('flashcards')}
          className="hidden md:flex p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Flashcards (SM-2 Spaced Repetition)"
        >
          <Brain className="w-4 h-4 text-purple-500" />
        </button>

        {/* Sync Status Badge */}
        <button
          onClick={() => openModal('sync')}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            syncStatus.state === 'synced'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
              : syncStatus.state === 'syncing'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-500/30 animate-pulse'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-500/30'
          }`}
          title={`Sync status: ${syncStatus.state} (${syncStatus.mode})`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              syncStatus.state === 'synced' ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          <span className="hidden lg:inline text-[11px] capitalize">
            {syncStatus.state === 'synced' ? 'Synced' : syncStatus.state}
          </span>
        </button>

        {/* Export Dropdown Menu */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
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
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-500" />
                <span>Export Drawing as PNG</span>
              </button>

              <button
                onClick={handleExportSvg}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-emerald-500" />
                <span>Export Vector SVG</span>
              </button>

              <button
                onClick={handleExportMarkdown}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-purple-500" />
                <span>Export Note (.md + Sketch)</span>
              </button>

              <button
                onClick={handleExportJson}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-amber-500" />
                <span>Export Single Note JSON</span>
              </button>

              <button
                onClick={handleExportFullBackup}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Archive className="w-4 h-4 text-indigo-500" />
                <span>Export Full Backup Bundle (.json)</span>
              </button>

              <button
                onClick={handleExportAnnotatedPdf}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Presentation className="w-4 h-4 text-rose-500" />
                <span>Export Annotated Slides (PDF)</span>
              </button>

              <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />

              <button
                onClick={handleCopySnapshot}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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

        {/* God Mode Trigger Pill for Sovereign Admin (nimjayad@gmail.com only) */}
        {isOwnerAdmin && (
          <button
            onClick={() => {
              confetti({ particleCount: 40, spread: 60 });
              openModal('admin');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black tracking-wide border border-amber-400/80 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-2 ring-amber-400/30 animate-pulse"
            title="⚡ GOD MODE ACTIVATED: Supreme System Creator Access"
          >
            <Crown className="w-3.5 h-3.5 text-yellow-200 fill-yellow-300" />
            <span className="hidden sm:inline">GOD MODE</span>
            <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" />
          </button>
        )}

        {/* User Account / Manage Profile */}
        <button
          onClick={() => (user ? openAccountModal() : openAuthModal())}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-white shadow-xs hover:brightness-105 active:scale-95 ${
            isOwnerAdmin
              ? 'bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 border-amber-400/60 ring-1 ring-amber-400/30'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent'
          }`}
          title={isOwnerAdmin ? '👑 Supreme Architect Account (nimjayad@gmail.com)' : `Account: ${user?.email || 'Scholar'}`}
        >
          {isOwnerAdmin ? (
            <Crown className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
          ) : (
            <User className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">
            {isOwnerAdmin ? 'Nimjaya (God)' : (user?.name?.split(' ')[0] || 'Account')}
          </span>
        </button>

        {/* Dark/Light Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isDarkMode ? t.navigation.themeLight : t.navigation.themeDark}
          aria-label={isDarkMode ? t.navigation.themeLight : t.navigation.themeDark}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* More Tools Overflow Dropdown (...) */}
        <div className="relative">
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isMoreMenuOpen
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="More Options & Study Tools"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMoreMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95">
              {isOwnerAdmin && (
                <>
                  <div className="text-[10px] uppercase font-bold text-amber-500 px-3 py-1 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-500 fill-amber-400" />
                    <span>God Overlord</span>
                  </div>
                  <button
                    onClick={() => {
                      confetti({ particleCount: 35, spread: 50 });
                      openModal('admin');
                      setIsMoreMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    <span>God Mode Panel</span>
                  </button>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
                </>
              )}

              <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1">
                Study Tools
              </div>

              <button
                onClick={() => {
                  openModal('pdf');
                  setIsMoreMenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Presentation className="w-4 h-4 text-blue-500" />
                <span>Import PDF Slides</span>
              </button>

              <button
                onClick={() => {
                  openModal('pomodoro');
                  setIsMoreMenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Pomodoro Focus Timer</span>
              </button>

              <button
                onClick={() => {
                  openModal('flashcards');
                  setIsMoreMenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Brain className="w-4 h-4 text-purple-500" />
                <span>Flashcards (SM-2 Spaced Repetition)</span>
              </button>

              <button
                onClick={() => {
                  setIsExportMenuOpen(true);
                  setIsMoreMenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-500" />
                <span>Export Note & Drawings...</span>
              </button>

              <button
                onClick={() => {
                  openModal('history');
                  setIsMoreMenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <History className="w-4 h-4 text-slate-400" />
                <span>Version Snapshots</span>
              </button>

              <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
              <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1">
                Settings & Preferences
              </div>

              <button
                onClick={() => {
                  toggleSound();
                  setIsMoreMenuOpen(false);
                }}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  {isSoundEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Sound Effects</span>
                </div>
                <span className="text-[10px] text-slate-400">{isSoundEnabled ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => {
                  toggleShortcutsModal();
                  setIsMoreMenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Keyboard className="w-4 h-4 text-slate-400" />
                <span>Keyboard Shortcuts [?]</span>
              </button>

              <button
                onClick={() => {
                  setViewMode('glass-preview');
                  setIsMoreMenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>iOS 27 Liquid Glass Preview</span>
              </button>

              <button
                onClick={() => {
                  toggleFullscreen();
                  setIsMoreMenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Immersion [F]'}</span>
              </button>

              <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
              <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1">
                Language
              </div>
              <div className="flex items-center gap-1 px-2 pb-1">
                {(['en', 'si', 'ta'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLocale(lang);
                      setIsMoreMenuOpen(false);
                    }}
                    className={`flex-1 py-1 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${
                      locale === lang
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {installPrompt && (
                <>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
                  <button
                    onClick={() => {
                      handleInstallApp();
                      setIsMoreMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Install App (PWA)</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
