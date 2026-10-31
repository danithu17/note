import { db } from '../db';
import type { LectureNote, VersionRecord } from '@/types/note';
import { syncEngine } from '../sync/syncEngine';

export async function createVersionSnapshot(
  note: LectureNote,
  summary?: string
): Promise<VersionRecord> {
  const version: VersionRecord = {
    id: `ver_${note.id}_${Date.now()}`,
    noteId: note.id,
    title: note.title,
    markdown: note.markdown,
    canvasElements: [...(note.canvasElements || [])],
    pages: note.pages ? JSON.parse(JSON.stringify(note.pages)) : undefined,
    createdAt: Date.now(),
    summary:
      summary ||
      `Saved revision (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
  };

  await db.versionHistory.put(version);
  return version;
}

export async function getVersionsForNote(noteId: string): Promise<VersionRecord[]> {
  const list = await db.versionHistory.where('noteId').equals(noteId).sortBy('createdAt');
  return list.reverse();
}

export async function restoreVersion(versionId: string): Promise<LectureNote | null> {
  const version = await db.versionHistory.get(versionId);
  if (!version) return null;

  const current = await db.notes.get(version.noteId);
  if (!current) return null;

  // Save current state as an auto-snapshot before restoring
  await createVersionSnapshot(current, 'Pre-restore backup snapshot');

  const restored: LectureNote = {
    ...current,
    title: version.title,
    markdown: version.markdown,
    canvasElements: version.canvasElements,
    pages: version.pages || current.pages,
    updatedAt: Date.now(),
    version: (current.version || 1) + 1,
  };

  await db.notes.put(restored);
  await syncEngine.enqueue('update', 'note', restored.id, restored);

  return restored;
}
