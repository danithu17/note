import React, { useState } from 'react';
import {
  FileText,
  PenTool,
  Mic,
  Presentation,
  Flame,
  Brain,
  Sparkles,
  Plus,
  BookOpen,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { GlassSearchPill } from '@/features/glass/components/GlassSearchPill';
import { ContentCard } from '@/features/glass/components/ContentCard';
import { GlassChip } from '@/features/glass/components/GlassChip';
import { useNoteStore } from '@/store/useNoteStore';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { useAssistantStore } from '@/features/assistant/useAssistantStore';
import { sound } from '@/utils/sound';
import { hapticsPlatform } from '@/platform';
import { COURSE_PALETTE } from '@/features/glass/glassTokens';

interface HomeDashboardViewProps {
  onScroll?: (e: React.UIEvent<HTMLElement>) => void;
  className?: string;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  onScroll,
  className = '',
}) => {
  const { notes, notebooks, selectNote, createNote, syncStatus } = useNoteStore();
  const { setMainTab, setLayoutMode, openModal } = useCanvasStore();
  const { user } = useAuthStore();
  const { setAssistantOpen, sendMessage } = useAssistantStore();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [chatInput, setChatInput] = useState('');

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const firstName = user?.name ? user.name.split(' ')[0] : 'Scholar';

  // Last edited note (hero resume)
  const heroNote = notes.length > 0 ? notes[0] : null;

  // Filter notes based on active chip
  const filteredNotes = notes.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'handwritten') return n.canvasElements && n.canvasElements.length > 0;
    if (activeFilter === 'pinned') return n.tags && n.tags.includes('Pinned');
    return true;
  });

  const formatRelativeTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const handleOpenNote = (id: string, preferredMode: 'notes-only' | 'canvas-only' = 'notes-only') => {
    sound.click();
    hapticsPlatform.impact('light').catch(() => {});
    selectNote(id);
    setLayoutMode(preferredMode);
    setMainTab('notes');
  };

  const handleQuickCreateNote = async () => {
    sound.pop();
    hapticsPlatform.impact('medium').catch(() => {});
    const newId = await createNote('New Lecture Note');
    selectNote(newId);
    setLayoutMode('notes-only');
    setMainTab('notes');
  };

  const handleQuickCreateCanvas = async () => {
    sound.pop();
    hapticsPlatform.impact('medium').catch(() => {});
    const newId = await createNote('Canvas Sketch');
    selectNote(newId);
    setLayoutMode('canvas-only');
    setMainTab('canvas');
  };

  const handleAssistantPrompt = (promptText: string) => {
    sound.click();
    hapticsPlatform.impact('light').catch(() => {});
    setAssistantOpen(true);
    sendMessage(promptText);
  };

  return (
    <div
      onScroll={onScroll}
      className={`flex-1 h-full overflow-y-auto overscroll-contain bg-[#f2f2f7] dark:bg-black text-slate-900 dark:text-slate-100 pb-36 select-none transition-colors ${className}`}
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 16px), 16px)',
        paddingLeft: 'max(env(safe-area-inset-left, 16px), 16px)',
        paddingRight: 'max(env(safe-area-inset-right, 16px), 16px)',
      }}
    >
      <div className="max-w-4xl mx-auto space-y-6 pt-2">
        {/* =========================================================================
            1. Large Title Header & Profile Avatar
           ========================================================================= */}
        <header className="flex items-start justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {/* Sync Status Indicator Pill */}
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  syncStatus?.state === 'synced'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : syncStatus?.state === 'syncing'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 animate-pulse'
                    : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    syncStatus?.state === 'synced'
                      ? 'bg-emerald-500'
                      : syncStatus?.state === 'syncing'
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`}
                />
                <span>
                  {syncStatus?.state === 'synced'
                    ? 'Synced'
                    : syncStatus?.state === 'syncing'
                    ? 'Syncing...'
                    : 'Offline Mode'}
                </span>
              </div>
              <span className="text-[12px] text-slate-400 dark:text-slate-500 font-medium">
                {formattedDate}
              </span>
            </div>

            <h1 className="text-[32px] sm:text-[34px] leading-tight font-bold text-slate-900 dark:text-white tracking-tight">
              {getGreeting()}, {firstName}
            </h1>
          </div>

          {/* User Profile / Account Glass Button */}
          <button
            onClick={() => {
              sound.click();
              hapticsPlatform.impact('light').catch(() => {});
              openModal('account');
            }}
            aria-label="Open Account Settings"
            className="liquid-glass-control p-2.5 sm:p-3 rounded-full flex items-center gap-2 spring-interactive cursor-pointer shadow-md shrink-0 mt-1"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={firstName}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[13px] font-bold">
                {firstName.charAt(0)}
              </div>
            )}
          </button>
        </header>

        {/* =========================================================================
            2. Glass Search Pill
           ========================================================================= */}
        <div className="relative">
          <GlassSearchPill
            placeholder="Search notes, handwriting, PDFs..."
            onClick={() => {
              useCanvasStore.getState().toggleCommandPalette();
            }}
            onVoiceClick={() => {
              useCanvasStore.getState().toggleCommandPalette();
            }}
          />
        </div>

        {/* =========================================================================
            3. Free Student Trial / Pro Banner
           ========================================================================= */}
        {user?.plan !== 'team' && (
          <div className="liquid-glass-control p-4 rounded-3xl flex items-center justify-between gap-3 shadow-sm border border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-[#007aff] dark:text-[#0a84ff] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-slate-900 dark:text-white leading-tight">
                  Pro Scholar Student Pass: 14 Days Active
                </div>
                <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Unlimited AI study summaries, audio-sync notes & 10GB cloud storage
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                sound.click();
                openModal('pricing');
              }}
              className="px-3.5 py-1.5 rounded-full bg-[#007aff] dark:bg-[#0a84ff] text-white text-[12px] font-semibold shadow-md hover:bg-blue-600 transition-colors shrink-0 cursor-pointer"
            >
              Plans
            </button>
          </div>
        )}

        {/* =========================================================================
            4. Continue Where You Left Off (Hero Resume Card)
           ========================================================================= */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#007aff]" />
              Continue Where You Left Off
            </h2>
            {heroNote && (
              <span className="text-[12px] font-medium text-slate-400">
                {formatRelativeTime(heroNote.updatedAt)}
              </span>
            )}
          </div>

          {heroNote ? (
            <ContentCard
              isHero={true}
              title={heroNote.title || 'Untitled Lecture Note'}
              subject={heroNote.subject || 'General Lecture'}
              updatedAtText={formatRelativeTime(heroNote.updatedAt)}
              pageCount={heroNote.pages?.length || 1}
              previewSnippet={heroNote.markdown?.substring(0, 150) || 'Handwritten sketch and lecture notes...'}
              onClick={() => handleOpenNote(heroNote.id)}
            />
          ) : (
            <div className="liquid-content-card p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-[#007aff] flex items-center justify-center mx-auto">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-slate-900 dark:text-white">
                  Welcome to ScribbleNote
                </h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Create your first lecture note to capture lectures, audio, and fluid stylus sketches.
                </p>
              </div>
              <button
                onClick={handleQuickCreateNote}
                className="px-5 py-2.5 rounded-full bg-[#007aff] dark:bg-[#0a84ff] text-white text-[14px] font-semibold shadow-md shadow-blue-500/25 spring-interactive cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Note</span>
              </button>
            </div>
          )}
        </section>

        {/* =========================================================================
            5. Quick Actions Row (Liquid Glass Tiles)
           ========================================================================= */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">
              Quick Actions
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <button
              onClick={handleQuickCreateNote}
              className="liquid-glass-control p-3.5 rounded-2xl flex flex-col items-start gap-2 text-left spring-interactive cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-[#007aff] dark:text-[#0a84ff] flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-slate-900 dark:text-white">New Note</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Typed & KaTeX</div>
              </div>
            </button>

            <button
              onClick={handleQuickCreateCanvas}
              className="liquid-glass-control p-3.5 rounded-2xl flex flex-col items-start gap-2 text-left spring-interactive cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-slate-900 dark:text-white">New Drawing</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Fluid Stylus & Pen</div>
              </div>
            </button>

            <button
              onClick={() => {
                sound.click();
                hapticsPlatform.impact('light').catch(() => {});
                handleQuickCreateNote();
              }}
              className="liquid-glass-control p-3.5 rounded-2xl flex flex-col items-start gap-2 text-left spring-interactive cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-slate-900 dark:text-white">Record Audio</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Synced to strokes</div>
              </div>
            </button>

            <button
              onClick={() => {
                sound.click();
                hapticsPlatform.impact('light').catch(() => {});
                openModal('pdf');
              }}
              className="liquid-glass-control p-3.5 rounded-2xl flex flex-col items-start gap-2 text-left spring-interactive cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Presentation className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-slate-900 dark:text-white">Import Slides</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Annotate PDF</div>
              </div>
            </button>
          </div>
        </section>

        {/* =========================================================================
            6. Today Focus & Study Streak Card
           ========================================================================= */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              Today's Focus
            </h2>
          </div>

          <div className="liquid-content-card p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                <Flame className="w-6 h-6 fill-amber-500" />
              </div>
              <div>
                <div className="text-[20px] font-bold text-slate-900 dark:text-white">
                  5 Days
                </div>
                <div className="text-[12px] text-slate-500 dark:text-slate-400">
                  Study Streak • Keep it going!
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:border-l sm:border-slate-100 dark:sm:border-white/5 sm:pl-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[20px] font-bold text-slate-900 dark:text-white">
                  12 Cards
                </div>
                <div className="text-[12px] text-slate-500 dark:text-slate-400">
                  Due for Spaced Review
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end sm:border-l sm:border-slate-100 dark:sm:border-white/5 sm:pl-4">
              <button
                onClick={() => {
                  sound.click();
                  hapticsPlatform.impact('medium').catch(() => {});
                  openModal('flashcards');
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#007aff] dark:bg-[#0a84ff] text-white text-[13px] font-semibold shadow-md hover:bg-blue-600 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Start Review</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            7. Notebooks & Academic Courses Shelf
           ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">
              Notebooks & Courses
            </h2>
            <button
              onClick={() => {
                sound.click();
                useCanvasStore.getState().setSidebarOpen(true);
              }}
              className="text-[13px] text-[#007aff] dark:text-[#0a84ff] font-medium hover:underline cursor-pointer"
            >
              See All
            </button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {notebooks.map((nb, idx) => {
              const colorKeys = Object.keys(COURSE_PALETTE);
              const colorKey = colorKeys[idx % colorKeys.length];
              const token = COURSE_PALETTE[colorKey];
              const noteCount = notes.filter((n) => n.notebookId === nb.id).length;

              return (
                <div
                  key={nb.id}
                  onClick={() => {
                    sound.click();
                    hapticsPlatform.impact('light').catch(() => {});
                    useNoteStore.getState().selectNotebook(nb.id);
                    setMainTab('notes');
                  }}
                  role="button"
                  tabIndex={0}
                  className="liquid-content-card w-40 p-4 rounded-2xl shrink-0 cursor-pointer spring-interactive group flex flex-col justify-between h-32 relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: token.hex }}
                  />
                  <div>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white mb-2 shadow-xs"
                      style={{ backgroundColor: token.hex }}
                    >
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="text-[14px] font-bold text-slate-900 dark:text-white truncate group-hover:text-[#007aff] transition-colors">
                      {nb.title}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {noteCount} {noteCount === 1 ? 'Note' : 'Notes'}
                  </div>
                </div>
              );
            })}

            {/* "+ New Notebook" Tile */}
            <button
              onClick={async () => {
                sound.click();
                const name = prompt('Enter notebook course title:');
                if (name) {
                  await useNoteStore.getState().createNotebook(name);
                }
              }}
              className="w-36 h-32 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-[#007aff] p-4 flex flex-col items-center justify-center gap-2 shrink-0 spring-interactive cursor-pointer text-slate-500 hover:text-[#007aff] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[12px] font-semibold">New Course</span>
            </button>
          </div>
        </section>

        {/* =========================================================================
            8. Recent Notes Grid with Filter Chips
           ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">
              Recent Notes
            </h2>
            <div className="flex items-center gap-1.5">
              <GlassChip
                label="All"
                count={notes.length}
                isSelected={activeFilter === 'all'}
                onClick={() => setActiveFilter('all')}
              />
              <GlassChip
                label="Handwritten"
                isSelected={activeFilter === 'handwritten'}
                onClick={() => setActiveFilter('handwritten')}
              />
            </div>
          </div>

          {filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredNotes.slice(0, 6).map((note, idx) => {
                const colorKeys = Object.keys(COURSE_PALETTE);
                const colorKey = colorKeys[idx % colorKeys.length];
                const isPinned = Boolean(note.tags && note.tags.includes('Pinned'));

                return (
                  <ContentCard
                    key={note.id}
                    title={note.title || 'Untitled Lecture Note'}
                    subject={note.subject || 'Lecture'}
                    courseColorKey={colorKey}
                    updatedAtText={formatRelativeTime(note.updatedAt)}
                    pageCount={note.pages?.length || 1}
                    isPinned={isPinned}
                    previewSnippet={note.markdown?.substring(0, 120)}
                    onClick={() => handleOpenNote(note.id)}
                    onContextMenuClick={() => {
                      const choice = confirm(`Note Options for "${note.title}":\nClick OK to toggle Pin status, Cancel to dismiss.`);
                      if (choice) {
                        useNoteStore.getState().togglePin(note.id);
                      }
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="liquid-content-card p-8 text-center text-slate-500 dark:text-slate-400">
              No notes found for this filter.
            </div>
          )}
        </section>

        {/* =========================================================================
            9. Assistant Bar with Suggestion Chips
           ========================================================================= */}
        <section className="p-4 rounded-3xl liquid-glass-control space-y-3 shadow-md border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[14px] font-bold text-slate-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>AI Study Assistant</span>
            </div>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded-full">
              iMessage Style
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && chatInput.trim()) {
                  handleAssistantPrompt(chatInput.trim());
                  setChatInput('');
                }
              }}
              placeholder="Ask about formulas, exam summaries, flashcards..."
              className="flex-1 bg-white/70 dark:bg-black/50 border border-slate-200 dark:border-white/10 px-3.5 py-2.5 rounded-full text-[14px] text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#007aff]"
            />
            <button
              onClick={() => {
                if (chatInput.trim()) {
                  handleAssistantPrompt(chatInput.trim());
                  setChatInput('');
                } else {
                  setAssistantOpen(true);
                }
              }}
              className="p-2.5 rounded-full bg-[#007aff] dark:bg-[#0a84ff] text-white shadow-md hover:bg-blue-600 transition-colors shrink-0 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => handleAssistantPrompt('Summarize my most recent lecture note')}
              className="px-3 py-1 rounded-full bg-white/80 dark:bg-white/10 hover:bg-white text-[12px] font-medium text-slate-700 dark:text-slate-300 shrink-0 transition-colors cursor-pointer border border-slate-200/60 dark:border-white/5"
            >
              💡 Summarize latest note
            </button>
            <button
              onClick={() => handleAssistantPrompt('Generate 5 flashcards from my lecture notes')}
              className="px-3 py-1 rounded-full bg-white/80 dark:bg-white/10 hover:bg-white text-[12px] font-medium text-slate-700 dark:text-slate-300 shrink-0 transition-colors cursor-pointer border border-slate-200/60 dark:border-white/5"
            >
              🧠 Make flashcards
            </button>
            <button
              onClick={() => handleAssistantPrompt('Quiz me with 3 practice exam questions')}
              className="px-3 py-1 rounded-full bg-white/80 dark:bg-white/10 hover:bg-white text-[12px] font-medium text-slate-700 dark:text-slate-300 shrink-0 transition-colors cursor-pointer border border-slate-200/60 dark:border-white/5"
            >
              📝 Quiz me
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
