import { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LectureEditor } from './components/editor/LectureEditor';
import { VisualCanvas } from './components/canvas/VisualCanvas';
import { SplitPane } from './components/ui/SplitPane';
import { CommandPalette } from './components/ui/CommandPalette';
import { ShortcutsModal } from './components/ui/ShortcutsModal';
import { ChatTimelineView } from './features/notes/components/ChatTimelineView';
import { useNoteStore } from './store/useNoteStore';
import { useCanvasStore } from './store/useCanvasStore';
import { useAuthStore } from './core/auth/useAuthStore';

export function App() {
  const { initialize, isLoading } = useNoteStore();
  const { isDarkMode, layoutMode } = useCanvasStore();

  useEffect(() => {
    initialize();
    useAuthStore.getState().initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium tracking-wide">Loading ScribbleNote workspace...</span>
      </div>
    );
  }

  return (
    <div className={`w-screen h-screen flex flex-col overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      {/* Top Application Navigation */}
      <Header />

      {/* Main Content Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Notebook Sidebar Drawer */}
        <Sidebar />

        {/* Dynamic Workspace Layout: Chat Timeline Feed OR Resizable Hybrid Split Workspace */}
        {layoutMode === 'timeline' ? (
          <ChatTimelineView />
        ) : (
          <SplitPane left={<LectureEditor />} right={<VisualCanvas />} />
        )}
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette />

      {/* Keyboard Shortcuts Cheatsheet (?) */}
      <ShortcutsModal />
    </div>
  );
}

export default App;
