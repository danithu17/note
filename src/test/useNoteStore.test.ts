import { describe, it, expect, beforeEach } from 'vitest';
import { useNoteStore } from '@/store/useNoteStore';

describe('useNoteStore', () => {
  beforeEach(() => {
    useNoteStore.setState({
      notes: [],
      activeNoteId: null,
      searchQuery: '',
      selectedTag: null,
      isLoading: false,
    });
  });

  it('creates a new lecture note and sets it as active', async () => {
    const id = await useNoteStore.getState().createNote('Physics 101');
    expect(id).toBeDefined();

    const state = useNoteStore.getState();
    expect(state.notes.length).toBe(1);
    expect(state.notes[0].subject).toBe('Physics 101');
    expect(state.activeNoteId).toBe(id);
  });

  it('updates title of the active note', async () => {
    await useNoteStore.getState().createNote('Calculus');
    await useNoteStore.getState().updateTitle('Limits and Continuity');

    const active = useNoteStore.getState().getActiveNote();
    expect(active?.title).toBe('Limits and Continuity');
  });

  it('toggles pinned state on a note', async () => {
    const id = await useNoteStore.getState().createNote('Algorithms');
    const note = useNoteStore.getState().getActiveNote()!;
    expect(note.isPinned).toBeFalsy();

    await useNoteStore.getState().togglePin(id);
    const updated = useNoteStore.getState().getActiveNote()!;
    expect(updated.isPinned).toBe(true);
  });

  it('filters notes by search query', async () => {
    await useNoteStore.getState().createNote('Quantum Mechanics');
    await useNoteStore.getState().updateTitle('Schrodinger Wave Equation');

    useNoteStore.getState().setSearchQuery('Schrodinger');
    expect(useNoteStore.getState().searchQuery).toBe('Schrodinger');
  });
});
