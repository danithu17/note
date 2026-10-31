import { db } from '../db';
import type { LectureNote, TrashRecord } from '@/types/note';
import { syncEngine } from '../sync/syncEngine';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function moveToTrash(note: LectureNote): Promise<void> {
  const now = Date.now();
  const trashedNote: LectureNote = {
    ...note,
    deletedAt: now,
    updatedAt: now,
  };

  await db.notes.put(trashedNote);

  const trashEntry: TrashRecord = {
    id: note.id,
    originalNote: trashedNote,
    deletedAt: now,
  };
  await db.trash.put(trashEntry);

  await syncEngine.enqueue('update', 'note', note.id, trashedNote);
}

export async function restoreFromTrash(noteId: string): Promise<LectureNote | null> {
  const note = await db.notes.get(noteId);
  if (!note) return null;

  const now = Date.now();
  const restored: LectureNote = {
    ...note,
    deletedAt: null,
    updatedAt: now,
  };

  await db.notes.put(restored);
  await db.trash.delete(noteId);

  await syncEngine.enqueue('update', 'note', note.id, restored);
  return restored;
}

export async function permanentlyDelete(noteId: string): Promise<void> {
  await db.notes.delete(noteId);
  await db.trash.delete(noteId);
  await db.versionHistory.where('noteId').equals(noteId).delete();
  await db.attachments.where('noteId').equals(noteId).delete();

  await syncEngine.enqueue('delete', 'note', noteId, { id: noteId });
}

export async function emptyTrash(): Promise<number> {
  const trashed = await db.trash.toArray();
  for (const item of trashed) {
    await permanentlyDelete(item.id);
  }
  return trashed.length;
}

export async function getTrashedNotes(): Promise<LectureNote[]> {
  const allNotes = await db.notes.toArray();
  const now = Date.now();

  const trashed = allNotes.filter((n) => n.deletedAt !== null && n.deletedAt !== undefined);

  // Auto-purge notes that exceeded 30 days
  for (const note of trashed) {
    if (note.deletedAt && now - note.deletedAt > THIRTY_DAYS_MS) {
      await permanentlyDelete(note.id);
    }
  }

  return trashed.filter((n) => n.deletedAt && now - n.deletedAt <= THIRTY_DAYS_MS);
}

export function getDaysRemaining(deletedAt: number): number {
  const elapsedMs = Date.now() - deletedAt;
  const remainingMs = THIRTY_DAYS_MS - elapsedMs;
  return Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
}
