import React, { useRef, useState } from 'react';
import {
  Plus,
  Search,
  Pin,
  Trash2,
  Upload,
  X,
  ChevronDown,
  Layers,
  HardDrive,
  Mic,
} from 'lucide-react';
import { useNoteStore } from '../../store/useNoteStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useAuthStore } from '@/core/auth/useAuthStore';
import type { LectureNote } from '../../types/note';
import { TrashModal } from '../trash/TrashModal';
import confetti from 'canvas-confetti';

export const Sidebar: React.FC = () => {
  const {
    notes,
    workspaces,
    notebooks,
    activeWorkspaceId,
    activeNotebookId,
    selectWorkspace,
    selectNotebook,
    createWorkspace,
    createNotebook,
    activeNoteId,
    selectNote,
    createNote,
    deleteNote,
    togglePin,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    importBackupBundle,
  } = useNoteStore();

  const { isSidebarOpen, setSidebarOpen } = useCanvasStore();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isWsDropdownOpen, setIsWsDropdownOpen] = useState(false);

  // Active workspace & notebooks for this workspace
  const currentWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const workspaceNotebooks = notebooks.filter(
    (n) => !n.workspaceId || n.workspaceId === activeWorkspaceId
  );

  // Extract all unique tags
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags || [])));

  // Filter notes based on workspace, active notebook, search query and selected tag
  const filteredNotes = notes.filter((n) => {
    const matchesNotebook =
      !activeNotebookId ||
      n.notebookId === activeNotebookId ||
      n.subject === workspaceNotebooks.find((nb) => nb.id === activeNotebookId)?.title;

    const matchesSearch =
      searchQuery.trim() === '' ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.markdown.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.tags && n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesTag = !selectedTag || (n.tags && n.tags.includes(selectedTag));

    return matchesNotebook && matchesSearch && matchesTag;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  const handleCreateNote = async () => {
    const targetNotebook = workspaceNotebooks.find((n) => n.id === activeNotebookId);
    const newId = await createNote(
      targetNotebook?.title || 'General Lecture',
      activeNotebookId || undefined
    );
    selectNote(newId);
    confetti({ particleCount: 20, spread: 40 });
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleCreateNewNotebook = async () => {
    const title = window.prompt('Enter course or notebook name (e.g. CS 301: Compilers):');
    if (title && title.trim()) {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const id = await createNotebook(title.trim(), activeWorkspaceId, randomColor);
      selectNotebook(id);
    }
  };

  const handleCreateNewWorkspace = async () => {
    const name = window.prompt('Enter workspace name (e.g. University Fall 2026, Research Lab):');
    if (name && name.trim()) {
      const id = await createWorkspace(name.trim());
      selectWorkspace(id);
      setIsWsDropdownOpen(false);
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.version === 'scribblenote_bundle_v1' || Array.isArray(parsed.notes)) {
          await importBackupBundle(parsed);
          confetti({ particleCount: 40, spread: 60 });
          alert('Full backup bundle successfully imported!');
        } else if (parsed.id && parsed.title) {
          parsed.id = 'imported_' + Date.now().toString(36);
          parsed.updatedAt = Date.now();
          useNoteStore.setState((state) => ({
            notes: [parsed, ...state.notes],
            activeNoteId: parsed.id,
          }));
          confetti({ particleCount: 30, spread: 60 });
        }
      } catch (err) {
        alert('Invalid ScribbleNote JSON backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const usedMb = user ? (user.storageUsedBytes / (1024 * 1024)).toFixed(1) : '0';
  const limitMb = user ? Math.round(user.storageLimitBytes / (1024 * 1024)) : 100;
  const usagePercentage = user
    ? Math.min(100, Math.round((user.storageUsedBytes / user.storageLimitBytes) * 100))
    : 0;

  return (
    <>
      {isSidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out shrink-0 select-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:-ml-72 sm:lg:-ml-80'
        }`}
      >
        {/* Workspace Switcher & Close */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 mr-2">
              <button
                onClick={() => setIsWsDropdownOpen(!isWsDropdownOpen)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="truncate">{currentWorkspace?.name || 'Academic Workspace'}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              </button>

              {isWsDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                    Your Workspaces
                  </span>
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => {
                        selectWorkspace(ws.id);
                        setIsWsDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between px-2 py-1.5 rounded-xl text-xs text-left transition-colors ${
                        ws.id === activeWorkspaceId
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">{ws.name}</span>
                      {ws.id === activeWorkspaceId && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      )}
                    </button>
                  ))}

                  <div className="h-px bg-slate-200 dark:bg-slate-800 my-0.5" />

                  <button
                    onClick={handleCreateNewWorkspace}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Workspace</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New Note & Import Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCreateNote}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Note</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
              title="Import Note JSON or Full Backup"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lectures, tags, concepts..."
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                &times;
              </button>
            )}
          </div>

          {/* Course Notebooks Pills */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
              <span>Courses ({workspaceNotebooks.length})</span>
              <button
                onClick={handleCreateNewNotebook}
                className="hover:text-blue-600 flex items-center gap-0.5 font-semibold text-blue-500"
                title="Add Course Notebook"
              >
                <Plus className="w-3 h-3" /> New
              </button>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <button
                onClick={() => selectNotebook(null)}
                className={`px-2.5 py-1 rounded-xl transition-colors whitespace-nowrap ${
                  activeNotebookId === null
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                All Courses
              </button>

              {workspaceNotebooks.map((nb) => {
                const isSelected = activeNotebookId === nb.id;
                return (
                  <button
                    key={nb.id}
                    onClick={() => selectNotebook(isSelected ? null : nb.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-colors whitespace-nowrap ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: nb.color || '#3b82f6' }}
                    />
                    <span className="truncate max-w-[110px]">{nb.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tag filters list */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-2 py-0.5 rounded-full transition-colors whitespace-nowrap ${
                  selectedTag === null
                    ? 'bg-slate-700 text-white font-medium'
                    : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100'
                }`}
              >
                #all
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-2 py-0.5 rounded-full transition-colors whitespace-nowrap ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white font-medium'
                      : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notes Scrollable List */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {pinnedNotes.length > 0 && (
            <div className="mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 py-1 flex items-center gap-1">
                <Pin className="w-3 h-3 text-amber-500" /> Pinned
              </span>
              {pinnedNotes.map((note) => renderNoteCard(note))}
            </div>
          )}

          <div>
            {pinnedNotes.length > 0 && unpinnedNotes.length > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 py-1">
                All Lectures
              </span>
            )}
            {unpinnedNotes.map((note) => renderNoteCard(note))}

            {filteredNotes.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                No matching lecture notes found.
              </div>
            )}
          </div>
        </div>

        {/* Bottom Area: Trash Button & Storage Quota Meter */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/50 flex flex-col gap-2.5">
          <button
            onClick={() => setIsTrashOpen(true)}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs text-slate-600 dark:text-slate-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Trash (30-day restore)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Bin</span>
          </button>

          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex items-center justify-between text-slate-500">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-blue-500" />
                Storage
              </span>
              <span className="font-mono text-[10px]">
                {usedMb} MB /{' '}
                {limitMb >= 1024 ? `${Math.round(limitMb / 1024)} GB` : `${limitMb} MB`}
              </span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usagePercentage > 85 ? 'bg-rose-500' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.max(4, usagePercentage)}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      <TrashModal isOpen={isTrashOpen} onClose={() => setIsTrashOpen(false)} />
    </>
  );

  function renderNoteCard(note: LectureNote) {
    const isActive = note.id === activeNoteId;
    const pageCount = note.pages?.length || 1;
    const drawingsCount = note.canvasElements?.length || 0;
    const audioCount = note.audioRecordings?.length || 0;

    return (
      <div
        key={note.id}
        onClick={() => {
          selectNote(note.id);
          if (window.innerWidth < 1024) setSidebarOpen(false);
        }}
        className={`group relative p-3 rounded-2xl cursor-pointer transition-all border ${
          isActive
            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500/40 shadow-xs'
            : 'bg-white dark:bg-slate-800/70 border-slate-200/70 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
        }`}
      >
        <div className="flex items-start justify-between gap-1 mb-1">
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 truncate max-w-[140px]">
            {note.subject || 'Lecture'}
          </span>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePin(note.id);
              }}
              className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${
                note.isPinned ? 'text-amber-500 opacity-100' : 'text-slate-400'
              }`}
              title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
            >
              <Pin className="w-3 h-3" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (
                  window.confirm(
                    `Move "${note.title}" to trash? You can restore it anytime within 30 days.`
                  )
                ) {
                  deleteNote(note.id);
                }
              }}
              className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700"
              title="Move to Trash"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mb-1">
          {note.title || 'Untitled Note'}
        </h4>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
          {note.markdown.replace(/[#*`_>-]/g, '').trim() || 'No additional content...'}
        </p>

        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>
            {new Date(note.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </span>
          <div className="flex items-center gap-2">
            {audioCount > 0 && (
              <span className="flex items-center gap-0.5 text-rose-500 font-medium">
                <Mic className="w-2.5 h-2.5" /> {audioCount}
              </span>
            )}
            {pageCount > 1 && (
              <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400 font-medium">
                <Layers className="w-2.5 h-2.5" /> {pageCount}p
              </span>
            )}
            <span>{drawingsCount} strk</span>
          </div>
        </div>
      </div>
    );
  }
};
