import React, { useRef } from 'react';
import {
  Plus,
  Search,
  Pin,
  Trash2,
  Database,
  Upload,
  X,
  FolderOpen,
} from 'lucide-react';
import { useNoteStore } from '../../store/useNoteStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import type { LectureNote } from '../../types/note';
import confetti from 'canvas-confetti';

export const Sidebar: React.FC = () => {
  const {
    notes,
    activeNoteId,
    selectNote,
    createNote,
    deleteNote,
    togglePin,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
  } = useNoteStore();

  const { isSidebarOpen, setSidebarOpen } = useCanvasStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Extract all unique tags
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags)));

  // Filter notes based on search query and selected tag
  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.markdown.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = !selectedTag || n.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  const handleCreateNote = async () => {
    const newId = await createNote();
    selectNote(newId);
    confetti({ particleCount: 20, spread: 40 });
    // On mobile, auto close sidebar on selection
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as LectureNote;
        if (parsed.id && parsed.title) {
          // Assign fresh id to prevent collisions
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

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out shrink-0 select-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:-ml-72 sm:lg:-ml-80'
        }`}
      >
        {/* Top Header & Search */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
              Notebooks ({notes.length})
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New Note & Import Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCreateNote}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Note</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
              title="Import Note JSON"
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
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lectures, tags, concepts..."
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 dark:placeholder:text-slate-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 hover:text-slate-800 text-xs"
              >
                &times;
              </button>
            )}
          </div>

          {/* Tag filters list */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-2 py-0.5 rounded-full transition-colors whitespace-nowrap ${
                  selectedTag === null
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-2 py-0.5 rounded-full transition-colors whitespace-nowrap ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white font-medium'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
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
          {/* Pinned section */}
          {pinnedNotes.length > 0 && (
            <div className="mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 px-2 py-1 flex items-center gap-1">
                <Pin className="w-3 h-3 text-amber-500" /> Pinned
              </span>
              {pinnedNotes.map((note) => renderNoteCard(note))}
            </div>
          )}

          {/* Recent notes section */}
          <div>
            {pinnedNotes.length > 0 && unpinnedNotes.length > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 px-2 py-1">
                All Lectures
              </span>
            )}
            {unpinnedNotes.map((note) => renderNoteCard(note))}

            {filteredNotes.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-600 dark:text-slate-300">
                No matching lecture notes found.
              </div>
            )}
          </div>
        </div>

        {/* Bottom Dexie Offline Status Card */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-mono text-[11px]">IndexedDB Offline Ready</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
      </aside>
    </>
  );

  function renderNoteCard(note: LectureNote) {
    const isActive = note.id === activeNoteId;
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
                note.isPinned ? 'text-amber-500 opacity-100' : 'text-slate-600 dark:text-slate-300'
              }`}
              title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
            >
              <Pin className="w-3 h-3" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete "${note.title}"?`)) {
                  deleteNote(note.id);
                }
              }}
              className="p-1 rounded text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700"
              title="Delete Note"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mb-1">
          {note.title || 'Untitled Note'}
        </h4>

        <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 mb-2">
          {note.markdown.replace(/[#*`_>-]/g, '').trim() || 'No additional content...'}
        </p>

        <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300">
          <span>{new Date(note.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
          <span>{note.canvasElements.length} drawings</span>
        </div>
      </div>
    );
  }
};
