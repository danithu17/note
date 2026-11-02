import { create } from 'zustand';
import type {
  LectureNote,
  CanvasElement,
  GridType,
  WorkspaceRecord,
  NotebookRecord,
  NotePage,
  SyncStatus,
} from '@/types/note';
import {
  db,
  initializeDatabase,
  resetToCleanWorkspace,
  exportFullDatabaseBackup,
  importFullDatabaseBackup,
} from '../db';
import { syncEngine } from '../core/sync/syncEngine';
import { moveToTrash, restoreFromTrash, permanentlyDelete } from '../core/trash/trashService';
import { createVersionSnapshot } from '../core/history/versionService';

interface NoteState {
  notes: LectureNote[];
  workspaces: WorkspaceRecord[];
  notebooks: NotebookRecord[];
  activeWorkspaceId: string;
  activeNotebookId: string | null;
  activeNoteId: string | null;
  searchQuery: string;
  selectedTag: string | null;
  isLoading: boolean;
  syncStatus: SyncStatus;

  // Actions
  initialize: () => Promise<void>;
  selectWorkspace: (id: string) => void;
  createWorkspace: (name: string, icon?: string, color?: string) => Promise<string>;
  selectNotebook: (id: string | null) => void;
  createNotebook: (title: string, workspaceId?: string, color?: string) => Promise<string>;
  selectNote: (id: string) => void;
  createNote: (subject?: string, notebookId?: string) => Promise<string>;
  updateTitle: (title: string) => Promise<void>;
  updateSubject: (subject: string) => Promise<void>;
  updateTags: (tags: string[]) => Promise<void>;
  updateMarkdown: (markdown: string) => Promise<void>;
  updateCanvasElements: (elements: CanvasElement[]) => Promise<void>;
  updateGridType: (gridType: GridType) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  permanentlyDeleteNote: (id: string) => Promise<void>;
  saveSnapshot: (summary?: string) => Promise<void>;

  // Multi-page canvas actions
  addPage: () => Promise<void>;
  selectPage: (pageIndex: number) => void;
  deletePage: (pageIndex: number) => Promise<void>;

  // Filters & Helpers
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: string | null) => void;
  getActiveNote: () => LectureNote | undefined;
  resetWorkspaceToClean: () => Promise<void>;
  exportBackupBundle: () => Promise<any>;
  importBackupBundle: (bundle: any) => Promise<{ importedCount: number }>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  workspaces: [],
  notebooks: [],
  activeWorkspaceId: 'ws_default',
  activeNotebookId: null,
  activeNoteId: null,
  searchQuery: '',
  selectedTag: null,
  isLoading: true,
  syncStatus: syncEngine.getStatus(),

  getActiveNote: () => {
    const { notes, activeNoteId } = get();
    return notes.find((n) => n.id === activeNoteId);
  },

  initialize: async () => {
    set({ isLoading: true });

    // Safety timeout: Ensure loading state is released even if IndexedDB is locked
    const timeout = setTimeout(() => {
      if (get().isLoading) {
        set({ isLoading: false });
      }
    }, 300);

    try {
      await initializeDatabase();

      const [workspaces, notebooks, rawNotes] = await Promise.all([
        db.workspaces.toArray(),
        db.notebooks.toArray(),
        db.notes.toArray(),
      ]);

      // Active (non-trashed) notes sorted by recency
      const activeNotes = rawNotes
        .filter((n) => !n.deletedAt)
        .sort((a, b) => b.updatedAt - a.updatedAt);

      const initialWorkspaceId = workspaces.length > 0 ? workspaces[0].id : 'ws_default';
      const initialId = activeNotes.length > 0 ? activeNotes[0].id : null;

      clearTimeout(timeout);
      set({
        workspaces,
        notebooks,
        notes: activeNotes,
        activeWorkspaceId: initialWorkspaceId,
        activeNoteId: initialId,
        isLoading: false,
      });
    } catch (err) {
      console.warn('[NoteStore] Failed to initialize notes database:', err);
      clearTimeout(timeout);
      set({ isLoading: false });
    }

    // Subscribe to background sync engine updates
    try {
      syncEngine.subscribe((status) => {
        set({ syncStatus: status });
      });
    } catch {
      // ignore
    }
  },

  selectWorkspace: (id: string) => {
    set({ activeWorkspaceId: id, activeNotebookId: null });
  },

  createWorkspace: async (name: string, icon: string = 'folder', color: string = '#3b82f6') => {
    const newWs: WorkspaceRecord = {
      id: 'ws_' + Date.now().toString(36),
      name,
      icon,
      color,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.workspaces.add(newWs);
    await syncEngine.enqueue('create', 'workspace', newWs.id, newWs);

    set((state) => ({
      workspaces: [...state.workspaces, newWs],
      activeWorkspaceId: newWs.id,
    }));
    return newWs.id;
  },

  selectNotebook: (id: string | null) => {
    set({ activeNotebookId: id });
  },

  createNotebook: async (title: string, workspaceId?: string, color: string = '#3b82f6') => {
    const wsId = workspaceId || get().activeWorkspaceId || 'ws_default';
    const newNb: NotebookRecord = {
      id: 'nb_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      workspaceId: wsId,
      title,
      color,
      icon: 'book',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.notebooks.add(newNb);
    await syncEngine.enqueue('create', 'notebook', newNb.id, newNb);

    set((state) => ({
      notebooks: [...state.notebooks, newNb],
      activeNotebookId: newNb.id,
    }));
    return newNb.id;
  },

  selectNote: (id: string) => {
    set({ activeNoteId: id });
  },

  createNote: async (subject: string = 'General Lecture', notebookId?: string) => {
    const now = Date.now();
    const activeWs = get().activeWorkspaceId || 'ws_default';
    const targetNotebookId = notebookId || get().activeNotebookId || 'nb_default';

    const defaultPage: NotePage = {
      id: `p_${now.toString(36)}_0`,
      pageIndex: 0,
      elements: [],
      gridType: 'dots',
    };

    const newNote: LectureNote = {
      id: 'note_' + now.toString(36) + Math.random().toString(36).substring(2, 6),
      workspaceId: activeWs,
      notebookId: targetNotebookId,
      title: 'Untitled Lecture Note',
      subject,
      tags: ['Lecture'],
      gridType: 'dots',
      markdown: `# Lecture Notes\n**Date:** ${new Date().toLocaleDateString()}\n\n### Key Concepts\n- Point 1\n- Point 2\n\n> 💡 Summary takeaway goes here...\n`,
      canvasElements: [],
      pages: [defaultPage],
      activePageIndex: 0,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      version: 1,
    };

    await db.notes.add(newNote);
    await syncEngine.enqueue('create', 'note', newNote.id, newNote);

    set((state) => ({
      notes: [newNote, ...state.notes],
      activeNoteId: newNote.id,
    }));

    return newNote.id;
  },

  updateTitle: async (title: string) => {
    const active = get().getActiveNote();
    if (!active) return;

    const updated: LectureNote = { ...active, title, updatedAt: Date.now() };
    await db.notes.put(updated);
    await syncEngine.enqueue('update', 'note', updated.id, updated);

    set((state) => ({
      notes: state.notes.map((n) => (n.id === updated.id ? updated : n)),
    }));
  },

  updateSubject: async (subject: string) => {
    const active = get().getActiveNote();
    if (!active) return;

    const updated: LectureNote = { ...active, subject, updatedAt: Date.now() };
    await db.notes.put(updated);
    await syncEngine.enqueue('update', 'note', updated.id, updated);

    set((state) => ({
      notes: state.notes.map((n) => (n.id === updated.id ? updated : n)),
    }));
  },

  updateTags: async (tags: string[]) => {
    const active = get().getActiveNote();
    if (!active) return;

    const updated: LectureNote = { ...active, tags, updatedAt: Date.now() };
    await db.notes.put(updated);
    await syncEngine.enqueue('update', 'note', updated.id, updated);

    set((state) => ({
      notes: state.notes.map((n) => (n.id === updated.id ? updated : n)),
    }));
  },

  updateMarkdown: async (markdown: string) => {
    const active = get().getActiveNote();
    if (!active) return;

    const updated: LectureNote = { ...active, markdown, updatedAt: Date.now() };
    await db.notes.put(updated);
    await syncEngine.enqueue('update', 'note', updated.id, updated);

    set((state) => ({
      notes: state.notes.map((n) => (n.id === updated.id ? updated : n)),
    }));
  },

  updateCanvasElements: async (elements: CanvasElement[]) => {
    let active = get().getActiveNote();
    if (!active) {
      await get().createNote('Lecture Note');
      active = get().getActiveNote();
    }
    if (!active) return;

    const activePageIndex = active.activePageIndex || 0;
    const pages =
      active.pages && active.pages.length > 0
        ? [...active.pages]
        : [{ id: `p_${active.id}_0`, pageIndex: 0, elements: [], gridType: active.gridType }];

    if (pages[activePageIndex]) {
      pages[activePageIndex] = {
        ...pages[activePageIndex],
        elements,
      };
    }

    const updated: LectureNote = {
      ...active,
      canvasElements: elements,
      pages,
      updatedAt: Date.now(),
    };

    await db.notes.put(updated);
    await syncEngine.enqueue('update', 'note', updated.id, updated);

    set((state) => ({
      notes: state.notes.map((n) => (n.id === updated.id ? updated : n)),
    }));
  },

  updateGridType: async (gridType: GridType) => {
    const active = get().getActiveNote();
    if (!active) return;

    const activePageIndex = active.activePageIndex || 0;
    const pages =
      active.pages && active.pages.length > 0
        ? [...active.pages]
        : [{ id: `p_${active.id}_0`, pageIndex: 0, elements: active.canvasElements, gridType }];

    if (pages[activePageIndex]) {
      pages[activePageIndex] = {
        ...pages[activePageIndex],
        gridType,
      };
    }

    const updated: LectureNote = {
      ...active,
      gridType,
      pages,
      updatedAt: Date.now(),
    };

    await db.notes.put(updated);
    await syncEngine.enqueue('update', 'note', updated.id, updated);

    set((state) => ({
      notes: state.notes.map((n) => (n.id === updated.id ? updated : n)),
    }));
  },

  togglePin: async (id: string) => {
    const target = get().notes.find((n) => n.id === id);
    if (!target) return;

    const updated: LectureNote = { ...target, isPinned: !target.isPinned, updatedAt: Date.now() };
    await db.notes.put(updated);
    await syncEngine.enqueue('update', 'note', updated.id, updated);

    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? updated : n)),
    }));
  },

  deleteNote: async (id: string) => {
    const target = get().notes.find((n) => n.id === id);
    if (target) {
      await moveToTrash(target);
    } else {
      await db.notes.delete(id);
    }

    set((state) => {
      const remaining = state.notes.filter((n) => n.id !== id);
      const nextActive = state.activeNoteId === id ? remaining[0]?.id || null : state.activeNoteId;
      return { notes: remaining, activeNoteId: nextActive };
    });
  },

  restoreNote: async (id: string) => {
    const restored = await restoreFromTrash(id);
    if (restored) {
      set((state) => ({
        notes: [restored, ...state.notes],
        activeNoteId: restored.id,
      }));
    }
  },

  permanentlyDeleteNote: async (id: string) => {
    await permanentlyDelete(id);
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      activeNoteId:
        state.activeNoteId === id
          ? state.notes.filter((n) => n.id !== id)[0]?.id || null
          : state.activeNoteId,
    }));
  },

  saveSnapshot: async (summary?: string) => {
    const active = get().getActiveNote();
    if (!active) return;
    await createVersionSnapshot(active, summary);
  },

  // Multi-page canvas navigation
  addPage: async () => {
    const active = get().getActiveNote();
    if (!active) return;

    const currentPages = active.pages || [
      {
        id: `p_${active.id}_0`,
        pageIndex: 0,
        elements: active.canvasElements,
        gridType: active.gridType,
      },
    ];

    const newPageIndex = currentPages.length;
    const newPage: NotePage = {
      id: `p_${active.id}_${newPageIndex}_${Date.now().toString(36)}`,
      pageIndex: newPageIndex,
      elements: [],
      gridType: active.gridType,
    };

    const updatedPages = [...currentPages, newPage];
    const updated: LectureNote = {
      ...active,
      pages: updatedPages,
      activePageIndex: newPageIndex,
      canvasElements: [],
      updatedAt: Date.now(),
    };

    await db.notes.put(updated);
    await syncEngine.enqueue('update', 'note', updated.id, updated);

    set((state) => ({
      notes: state.notes.map((n) => (n.id === updated.id ? updated : n)),
    }));
  },

  selectPage: (pageIndex: number) => {
    const active = get().getActiveNote();
    if (!active || !active.pages || !active.pages[pageIndex]) return;

    const page = active.pages[pageIndex];
    const updated: LectureNote = {
      ...active,
      activePageIndex: pageIndex,
      canvasElements: page.elements || [],
    };

    set((state) => ({
      notes: state.notes.map((n) => (n.id === updated.id ? updated : n)),
    }));
  },

  deletePage: async (pageIndex: number) => {
    const active = get().getActiveNote();
    if (!active || !active.pages || active.pages.length <= 1) return;

    const remainingPages = active.pages
      .filter((_, idx) => idx !== pageIndex)
      .map((p, idx) => ({ ...p, pageIndex: idx }));

    const nextPageIndex = Math.max(0, pageIndex - 1);
    const updated: LectureNote = {
      ...active,
      pages: remainingPages,
      activePageIndex: nextPageIndex,
      canvasElements: remainingPages[nextPageIndex]?.elements || [],
      updatedAt: Date.now(),
    };

    await db.notes.put(updated);
    await syncEngine.enqueue('update', 'note', updated.id, updated);

    set((state) => ({
      notes: state.notes.map((n) => (n.id === updated.id ? updated : n)),
    }));
  },

  setSearchQuery: (searchQuery: string) => set({ searchQuery }),
  setSelectedTag: (selectedTag: string | null) => set({ selectedTag }),

  resetWorkspaceToClean: async () => {
    await resetToCleanWorkspace();
    await get().initialize();
  },

  exportBackupBundle: async () => {
    return await exportFullDatabaseBackup();
  },

  importBackupBundle: async (bundle: any) => {
    const res = await importFullDatabaseBackup(bundle);
    await get().initialize();
    return res;
  },
}));
