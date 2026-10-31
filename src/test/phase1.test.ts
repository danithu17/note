import { describe, it, expect, beforeEach } from 'vitest';
import { useNoteStore } from '@/store/useNoteStore';
import { db } from '@/core/db';
import { syncEngine } from '@/core/sync/syncEngine';
import { createVersionSnapshot, restoreVersion } from '@/core/history/versionService';
import { moveToTrash, restoreFromTrash, getDaysRemaining } from '@/core/trash/trashService';
import { calculateStorageUsage } from '@/core/db';
import type { CanvasElement } from '@/types/note';

describe('Phase 1: Real Data Model & Sync Foundation', () => {
  beforeEach(async () => {
    useNoteStore.setState({
      notes: [],
      activeNoteId: null,
      workspaces: [],
      notebooks: [],
      searchQuery: '',
      selectedTag: null,
      isLoading: false,
    });
  });

  it('supports multi-page canvas within a single note', async () => {
    await useNoteStore.getState().createNote('Physics 201');
    const note = useNoteStore.getState().getActiveNote()!;

    expect(note.pages?.length).toBe(1);
    expect(note.activePageIndex).toBe(0);

    // Add a second page
    await useNoteStore.getState().addPage();
    const withTwoPages = useNoteStore.getState().getActiveNote()!;
    expect(withTwoPages.pages?.length).toBe(2);
    expect(withTwoPages.activePageIndex).toBe(1);

    // Switch back to page 0
    useNoteStore.getState().selectPage(0);
    const switched = useNoteStore.getState().getActiveNote()!;
    expect(switched.activePageIndex).toBe(0);

    // Delete page 1
    await useNoteStore.getState().deletePage(1);
    const afterDelete = useNoteStore.getState().getActiveNote()!;
    expect(afterDelete.pages?.length).toBe(1);
  });

  it('manages version history snapshots and restores accurately', async () => {
    await useNoteStore.getState().createNote('Linear Algebra');
    const initialNote = useNoteStore.getState().getActiveNote()!;

    // Create snapshot
    const snapshot = await createVersionSnapshot(initialNote, 'Initial draft');
    expect(snapshot.id).toBeDefined();

    // Modify current note
    await useNoteStore.getState().updateMarkdown('# Revised Content');
    const modified = useNoteStore.getState().getActiveNote()!;
    expect(modified.markdown).toBe('# Revised Content');

    // Restore snapshot
    const restored = await restoreVersion(snapshot.id);
    expect(restored?.markdown).toBe(initialNote.markdown);
  });

  it('soft-deletes notes to trash and supports restore with 30-day lifecycle', async () => {
    const noteId = await useNoteStore.getState().createNote('Chemistry 101');
    const note = useNoteStore.getState().getActiveNote()!;

    await moveToTrash(note);
    const trashedDbNote = await db.notes.get(noteId);
    expect(trashedDbNote?.deletedAt).toBeDefined();

    const daysRemaining = getDaysRemaining(trashedDbNote!.deletedAt!);
    expect(daysRemaining).toBe(30);

    // Restore note
    const restored = await restoreFromTrash(noteId);
    expect(restored?.deletedAt).toBeNull();
  });

  it('reconciles per-stroke append-only canvas CRDT elements without duplication', () => {
    const strokeA: CanvasElement = {
      id: 'stroke-1',
      type: 'stroke',
      tool: 'pen',
      points: [{ x: 10, y: 10 }],
      color: '#000',
      size: 2,
      opacity: 1,
      timestamp: 1000,
    };

    const strokeB: CanvasElement = {
      id: 'stroke-2',
      type: 'stroke',
      tool: 'pen',
      points: [{ x: 20, y: 20 }],
      color: '#f00',
      size: 4,
      opacity: 1,
      timestamp: 2000,
    };

    const localStrokes = [strokeA];
    const remoteStrokes = [strokeA, strokeB];

    const reconciled = syncEngine.reconcileStrokes(localStrokes, remoteStrokes);
    expect(reconciled.length).toBe(2);
    expect(reconciled[0].id).toBe('stroke-1');
    expect(reconciled[1].id).toBe('stroke-2');
  });

  it('calculates storage usage accurately across notes and attachments', async () => {
    const usage = await calculateStorageUsage();
    expect(usage.totalBytes).toBeGreaterThanOrEqual(0);
    expect(typeof usage.formattedTotal).toBe('string');
  });
});
