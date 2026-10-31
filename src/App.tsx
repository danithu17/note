import { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileTabBar } from './components/layout/MobileTabBar';
import { LectureEditor } from './components/editor/LectureEditor';
import { VisualCanvas } from './components/canvas/VisualCanvas';
import { SplitPane } from './components/ui/SplitPane';
import { CommandPalette } from './components/ui/CommandPalette';
import { ShortcutsModal } from './components/ui/ShortcutsModal';
import { ReloadPrompt } from './components/ui/ReloadPrompt';
import { ChatTimelineView } from './features/notes/components/ChatTimelineView';
import { ChatAssistantPanel } from './features/assistant/components/ChatAssistantPanel';
import { LandingPage } from './features/landing/components/LandingPage';
import { GlobalModals } from './components/layout/GlobalModals';
import { TrialBanner } from './features/billing/components/TrialBanner';
import { useEntitlementsStore } from './features/billing/useEntitlementsStore';
import { useNoteStore } from './store/useNoteStore';
import { useCanvasStore } from './store/useCanvasStore';
import { useAuthStore } from './core/auth/useAuthStore';

export function App() {
  const { initialize, isLoading } = useNoteStore();
  const { isDarkMode, layoutMode, viewMode, setViewMode, openModal } = useCanvasStore();

  useEffect(() => {
    initialize();
    useAuthStore.getState().initialize();
    useEntitlementsStore.getState().initialize();

    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('admin')) {
        useCanvasStore.setState({ activeModal: 'admin', viewMode: 'app' });
      } else {
        const isApp = hash.includes('app');
        useCanvasStore.setState({ viewMode: isApp ? 'app' : 'landing' });
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    // Secret Admin keyboard shortcut: Ctrl+Shift+A / Cmd+Shift+A
    const handleAdminKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        openModal('admin');
      }
    };
    window.addEventListener('keydown', handleAdminKey);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleAdminKey);
    };
  }, [initialize, openModal]);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-black text-slate-700 dark:text-slate-300 gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium tracking-wide">Loading ScribbleNote workspace...</span>
      </div>
    );
  }

  return (
    <div
      className={`w-screen h-screen flex flex-col overflow-hidden bg-[#f2f2f7] dark:bg-black ${
        isDarkMode ? 'dark' : ''
      }`}
    >
      {viewMode === 'landing' ? (
        <div className="w-full h-full overflow-y-auto">
          <LandingPage
            onLaunchApp={() => setViewMode('app')}
            onOpenPricing={() => openModal('pricing')}
          />
        </div>
      ) : (
        <>
          {/* Top Apple Navigation Bar */}
          <Header />

          {/* 14-Day Free Student Trial Status Banner */}
          <TrialBanner />

          {/* Main Content Workspace */}
          <div className="flex-1 flex overflow-hidden relative pb-14 md:pb-0">
            {/* Apple Notes Style 3-Column Sidebar Drawer */}
            <Sidebar />

            {/* Dynamic Workspace Layout: Chat Timeline Feed OR Resizable Hybrid Split Workspace */}
            {layoutMode === 'timeline' ? (
              <ChatTimelineView />
            ) : (
              <SplitPane left={<LectureEditor />} right={<VisualCanvas />} />
            )}

            {/* Apple iMessage-Style AI Study Assistant (Cmd/Ctrl+J) */}
            <ChatAssistantPanel />
          </div>

          {/* Mobile Bottom Navigation Tab Bar (Notes, Canvas, Assistant, Study) */}
          <MobileTabBar />
        </>
      )}

      {/* Global Modals (Auth, Sync, History, PDF, AI, Flashcards, Pomodoro, Pricing, Trash) */}
      <GlobalModals />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette />

      {/* Keyboard Shortcuts Cheatsheet (?) */}
      <ShortcutsModal />

      {/* PWA Service Worker Offline & Update Prompt */}
      <ReloadPrompt />
    </div>
  );
}

export default App;
