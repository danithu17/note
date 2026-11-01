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
import { WelcomeAuthScreen } from './components/auth/WelcomeAuthScreen';
import { OnboardingScreen } from './components/auth/OnboardingScreen';
import { useEntitlementsStore } from './features/billing/useEntitlementsStore';
import { useNoteStore } from './store/useNoteStore';
import { useCanvasStore } from './store/useCanvasStore';
import { useAuthStore } from './core/auth/useAuthStore';
import { Sparkles } from 'lucide-react';

export function App() {
  const { initialize, isLoading: isNotesLoading } = useNoteStore();
  const { isDarkMode, layoutMode, viewMode, setViewMode, openModal } = useCanvasStore();
  const { user, isLoading: isAuthLoading, isOnboarding } = useAuthStore();

  useEffect(() => {
    initialize();
    useAuthStore.getState().initialize();
    useEntitlementsStore.getState().initialize();

    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('admin')) {
        useCanvasStore.setState({ activeModal: 'admin', viewMode: 'app' });
      } else if (hash.includes('landing')) {
        useCanvasStore.setState({ viewMode: 'landing' });
      } else {
        useCanvasStore.setState({ viewMode: 'app' });
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

  // Apple-Grade Splash / Initialization Spinner
  if (isAuthLoading || isNotesLoading) {
    return (
      <div className={`w-screen h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-black text-slate-700 dark:text-slate-300 gap-4 font-sans ${isDarkMode ? 'dark' : ''}`}>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 animate-pulse">
          <Sparkles className="w-7 h-7" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
            Initializing ScribbleNote...
          </span>
        </div>
      </div>
    );
  }

  // MANDATORY AUTH GUARD: No anonymous/guest use. The app is accessible only after signing in.
  if (!user) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <WelcomeAuthScreen />
      </div>
    );
  }

  // ONBOARDING STEP: Name, Academic Role, and Subject immediately after first signup
  if (isOnboarding) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <OnboardingScreen />
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

      {/* Global Modals (Auth, Sync, History, PDF, AI, Flashcards, Pomodoro, Pricing, Trash, Account) */}
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
