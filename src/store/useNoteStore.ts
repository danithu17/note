import { create } from 'zustand';
import type { LectureNote, CanvasElement, GridType } from '../types/note';
import { db, initializeDatabase } from '../db';
import { realtimeSync, getDeviceId } from '../utils/sync';

interface NoteState {
  notes: LectureNote[];
  activeNoteId: string | null;
  searchQuery: string;
  selectedTag: string | null;
  isLoading: boolean;
  syncState: 'offline' | 'syncing' | 'synced' | 'error';
  lastSynced: number | null;

  // Actions
  initialize: () => Promise<void>;
  selectNote: (id: string) => void;
  createNote: (subject?: string) => Promise<string>;
  updateTitle: (title: string) => Promise<void>;
  updateSubject: (subject: string) => Promise<void>;
  updateTags: (tags: string[]) => Promise<void>;
  updateMarkdown: (markdown: string) => Promise<void>;
  updateCanvasElements: (elements: CanvasElement[]) => Promise<void>;
  updateGridType: (gridType: GridType) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: string | null) => void;
  getActiveNote: () => LectureNote | undefined;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  activeNoteId: null,
  searchQuery: '',
  selectedTag: null,
  isLoading: true,
  syncState: 'synced',
  lastSynced: Date.now(),

  getActiveNote: () => {
    const { notes, activeNoteId } = get();
    return notes.find((n) => n.id === activeNoteId);
  },

  initialize: async () => {
    set({ isLoading: true });
    await initializeDatabase();
    const notes = await db.notes.toArray();
    notes.sort((a, b) => b.updatedAt - a.updatedAt);

    const initialId = notes.length > 0 ? notes[0].id : null;
    set({ notes, activeNoteId: initialId, isLoading: false });

    // Setup listener for real-time peer updates
    realtimeSync.subscribe((msg) => {
      if (msg.type === 'NOTE_UPDATED') {
        set((state) => {
          const index = state.notes.findIndex((n) => n.id === msg.note.id);
          let newNotes = [...state.notes];
          if (index >= 0) {
            newNotes[index] = msg.note;
          } else {
            newNotes = [msg.note, ...newNotes];
          }
          return { notes: newNotes, lastSynced: Date.now() };
        });
        db.notes.put(msg.note);
      } else if (msg.type === 'CANVAS_UPDATED') {
        set((state) => {
          const index = state.notes.findIndex((n) => n.id === msg.noteId);
          if (index >= 0) {
            const updated = {
              ...state.notes[index],
              canvasElements: msg.elements,
              updatedAt: Date.now(),
            };
            const newNotes = [...state.notes];
            newNotes[index] = updated;
            db.notes.put(updated);
            return { notes: newNotes, lastSynced: Date.now() };
          }
          return state;
        });
      } else if (msg.type === 'NOTE_DELETED') {
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== msg.noteId),
          activeNoteId: state.activeNoteId === msg.noteId ? (state.notes[0]?.id || null) : state.activeNoteId,
        }));
        db.notes.delete(msg.noteId);
      }
    });
  },

  selectNote: (id: string) => {
    set({ activeNoteId: id });
  },

  createNote: async (subject: string = 'General Lecture') => {
    const newNote: LectureNote = {
      id: 'note_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      title: 'Untitled Lecture Note',
      subject,
      tags: ['Lecture'],
      gridType: 'dots',
      markdown: `# Lecture Notes\n**Date:** ${new Date().toLocaleDateString()}\n\n### Key Concepts\n- Point 1\n- Point 2\n\n> 💡 Summary takeaway goes here...\n`,
      canvasElements: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.notes.add(newNote);
    set((state) => ({
      notes: [newNote, ...state.notes],
      activeNoteId: newNote.id,
      syncState: 'synced',
      lastSynced: Date.now(),
    }));

    realtimeSync.broadcast({
      type: 'NOTE_UPDATED',
      note: newNote,
      sourceDeviceId: getDeviceId(),
    });

    return newNote.id;
  },

  updateTitle: async (title: string) => {
    const active = get().getActiveNote();
    if (!active) return;

    const updated: LectureNote = { ...active, title, updatedAt: Date.now() };
    await db.notes.put(updated);

    set((state) => ({
      notes: state.notes.map((n) => (n.id === updated.id ? updated : n)),
      lastSynced: Date.now(),
    }));

    realtimeSync.broadcast({
      type: 'NOTE_UPDATED',
      note: updated,
      sourceDeviceId: getDeviceId(),
    });
  },

  updateSubject: async (subject: string) => {
    const active = get().getActiveNote();
    if (!active) return;

    const updated: LectureNote = { ...active, subject, updatedAt: Date.now() };
    await db.notes.put(updated);

    set((state) => ({
      notes: state.notes.map((n) => (n.id === updated.id ? updated : n)),
      lastSynced: Date.now(),
    }));

    realtimeSync.broadcast({
      type: 'NOTE_UPDATED',
      note: updated,
      sourceDeviceId: getDeviceId(),
    });
  },

  updateTags: async (tags: string[]) => {
    const active = get().getActiveNote();
    if (!active) return;

    const updated: LectureNote = { ...active, tags, updatedAt: Date.now() };
    await db.notes.put(updated);

    set((state) => ({
      notes: state.notes.map((n) => (n.id === updated.id ? updated : n)),
      lastSynced: Date.now(),
    }));

    realtimeSync.broadcast({
      type: 'NOTE_UPDATED',
      note: updated,
      sourceDeviceId: getDeviceId(),
    });
  },

  updateMarkdown: async (markdown: string) => {
    const active = get().getActiveNote();
    if (!active) return;

    const updated: LectureNote = { ...active, markdown, updatedAt: Date.now() };
    await db.notes.put(updated);

    set((state) => ({
      notes: state.notes.map((n) => (n.id === updated.id ? updated : n)),
      lastSynced: Date.now(),
    }));

    realtimeSync.broadcast({
      type: 'NOTE_UPDATED',
      note: updated,
      sourceDeviceId: getDeviceId(),
    });
  },

  updateCanvasElements: async (elements: CanvasElement[]) => {
    const active = get().getActiveNote();
    if (!active) return;

    const updated: LectureNote = { ...active, canvasElements: elements, updatedAt: Date.now() };
    await db.notes.put(updated);

    set((state) => ({
      notes: state.notes.map((n) => (n.id === updated.id ? updated : n)),
      lastSynced: Date.now(),
    }));

    realtimeSync.broadcast({
      type: 'CANVAS_UPDATED',
      noteId: updated.id,
      elements,
      sourceDeviceId: getDeviceId(),
    });
  },

  updateGridType: async (gridType: GridType) => {
    const active = get().getActiveNote();
    if (!active) return;

    const updated: LectureNote = { ...active, gridType, updatedAt: Date.now() };
    await db.notes.put(updated);

    set((state) => ({
      notes: state.notes.map((n) => (n.id === updated.id ? updated : n)),
      lastSynced: Date.now(),
    }));

    realtimeSync.broadcast({
      type: 'NOTE_UPDATED',
      note: updated,
      sourceDeviceId: getDeviceId(),
    });
  },

  togglePin: async (id: string) => {
    const target = get().notes.find((n) => n.id === id);
    if (!target) return;

    const updated: LectureNote = { ...target, isPinned: !target.isPinned, updatedAt: Date.now() };
    await db.notes.put(updated);

    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? updated : n)),
      lastSynced: Date.now(),
    }));

    realtimeSync.broadcast({
      type: 'NOTE_UPDATED',
      note: updated,
      sourceDeviceId: getDeviceId(),
    });
  },

  deleteNote: async (id: string) => {
    await db.notes.delete(id);
    set((state) => {
      const remaining = state.notes.filter((n) => n.id !== id);
      const nextActive = state.activeNoteId === id ? (remaining[0]?.id || null) : state.activeNoteId;
      return { notes: remaining, activeNoteId: nextActive };
    });

    realtimeSync.broadcast({
      type: 'NOTE_DELETED',
      noteId: id,
      sourceDeviceId: getDeviceId(),
    });
  },

  setSearchQuery: (searchQuery: string) => set({ searchQuery }),
  setSelectedTag: (selectedTag: string | null) => set({ selectedTag }),
}));
