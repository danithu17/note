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
  Radio,
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
} from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useNoteStore } from '../../store/useNoteStore';
import {
  exportCanvasToPng,
  exportCanvasToSvg,
  exportNoteAsJson,
  exportNoteAsMarkdownBundle,
  copyCanvasToClipboard,
  triggerDownload,
} from '../../utils/export';
import { SyncModal } from './SyncModal';
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
  } = useCanvasStore();

  const { getActiveNote } = useNoteStore();
  const activeNote = getActiveNote();

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Capture PWA install prompt
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
      alert('To install ScribbleNote, use your browser\'s "Install App" or "Add to Home Screen" option from the address bar or browser menu.');
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

  return (
    <header className="h-14 border-b border-slate-200/90 dark:border-slate-800/90 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-3 sm:px-4 flex items-center justify-between shrink-0 select-none z-40 transition-colors">
      {/* Left: Sidebar Toggle & Brand */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Notebook Sidebar [B]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-1 ring-white/20">
            <Sparkles className="w-4 h-4 fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm sm:text-base tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent flex items-center gap-1.5 leading-tight">
              ScribbleNote
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded-md border border-blue-500/20">
                PWA
              </span>
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-300 leading-none hidden sm:inline">
              Lecture Notes & Visual Canvas
            </span>
          </div>
        </div>
      </div>

      {/* Center: Command Palette Trigger & View Mode Switcher */}
      <div className="flex items-center gap-2">
        {/* Quick Search / Command Palette Search Pill */}
        <button
          onClick={toggleCommandPalette}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 text-xs transition-all shadow-xs"
          title="Quick Command Search [Ctrl+K]"
        >
          <Search className="w-3.5 h-3.5 text-blue-500" />
          <span>Quick actions & search...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-mono text-slate-500 dark:text-slate-300 font-bold">
            Ctrl+K
          </kbd>
        </button>

        {/* View Layout Switcher (Notes Only | Split | Canvas Only) */}
        <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-xl text-xs border border-slate-200/50 dark:border-slate-700/50">
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

      {/* Right: Realtime Sync, Shortcuts, Export, Sound, Theme, Fullscreen */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Real-time Multi-Device Sync Pill */}
        <button
          onClick={() => setIsSyncModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50"
          title="Realtime Multi-Device Sync Mesh"
        >
          <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span className="hidden lg:inline font-mono">Sync</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </button>

        {/* Shortcuts Cheat Sheet [?] */}
        <button
          onClick={toggleShortcutsModal}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Keyboard Shortcuts Cheatsheet [?]"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Sound FX Toggle */}
        <button
          onClick={toggleSound}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isSoundEnabled ? 'Interface Sound FX: ON' : 'Interface Sound FX: MUTED'}
        >
          {isSoundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Fullscreen Immersion Mode [F] */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:flex"
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
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95">
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
                <span>Export JSON Backup</span>
              </button>

              <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />

              <button
                onClick={handleCopySnapshot}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copiedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied to Clipboard!</span>
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

        {/* PWA Install Button */}
        {installPrompt && (
          <button
            onClick={handleInstallApp}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Install ScribbleNote PWA"
          >
            <Smartphone className="w-4 h-4 text-blue-500" />
          </button>
        )}

        {/* Dark Mode Toggle [D] */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDarkMode ? 'Switch to Light Mode [D]' : 'Switch to Dark Mode [D]'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Sync Configuration Modal */}
      <SyncModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} />
    </header>
  );
};
