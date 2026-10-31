import Dexie, { type Table } from 'dexie';
import type {
  LectureNote,
  NotebookRecord,
  WorkspaceRecord,
  AttachmentRecord,
  VersionRecord,
  TrashRecord,
  SyncQueueRecord,
  Flashcard,
  StudySessionRecord,
} from '@/types/note';

export class ScribbleDatabase extends Dexie {
  notes!: Table<LectureNote, string>;
  notebooks!: Table<NotebookRecord, string>;
  workspaces!: Table<WorkspaceRecord, string>;
  attachments!: Table<AttachmentRecord, string>;
  trash!: Table<TrashRecord, string>;
  versionHistory!: Table<VersionRecord, string>;
  syncQueue!: Table<SyncQueueRecord, string>;
  flashcards!: Table<Flashcard, string>;
  studySessions!: Table<StudySessionRecord, string>;

  constructor() {
    super('ScribbleNoteDB');

    // Schema Version 1 (Legacy Initial Prototype)
    this.version(1).stores({
      notes: 'id, title, subject, updatedAt, createdAt, isPinned',
    });

    // Schema Version 2 (Attachments & Trash initial version)
    this.version(2)
      .stores({
        notes: 'id, title, subject, updatedAt, createdAt, isPinned, notebookId',
        notebooks: 'id, title, updatedAt',
        attachments: 'id, noteId, type, createdAt',
        trash: 'id, deletedAt',
      })
      .upgrade((tx) => {
        return tx
          .table('notes')
          .toCollection()
          .modify((note: any) => {
            if (!note.notebookId) {
              note.notebookId = 'nb_default';
            }
            if (!note.canvasElements) {
              note.canvasElements = [];
            }
          });
      });

    // Schema Version 3 (Commercial Grade: Workspaces, Multi-page Canvas, CRDT Sync Queue & Version History)
    this.version(3)
      .stores({
        workspaces: 'id, name, updatedAt, createdAt',
        notebooks: 'id, workspaceId, title, updatedAt, createdAt',
        notes: 'id, workspaceId, notebookId, title, subject, updatedAt, createdAt, isPinned, deletedAt',
        attachments: 'id, noteId, type, createdAt, size',
        trash: 'id, deletedAt',
        versionHistory: 'id, noteId, createdAt',
        syncQueue: 'id, action, entityType, entityId, timestamp, status, retryCount',
      })
      .upgrade(async (tx) => {
        const now = Date.now();

        const defaultWorkspace: WorkspaceRecord = {
          id: 'ws_default',
          name: 'Academic Workspace',
          icon: 'graduation-cap',
          color: '#3b82f6',
          createdAt: now,
          updatedAt: now,
        };
        await tx.table('workspaces').put(defaultWorkspace);

        const defaultNotebook: NotebookRecord = {
          id: 'nb_default',
          workspaceId: 'ws_default',
          title: 'Computer Science & Engineering',
          color: '#3b82f6',
          icon: 'code-2',
          description: 'Core lecture notes and problem sets',
          createdAt: now,
          updatedAt: now,
        };
        await tx.table('notebooks').put(defaultNotebook);

        await tx
          .table('notes')
          .toCollection()
          .modify((note: any) => {
            if (!note.workspaceId) note.workspaceId = 'ws_default';
            if (!note.notebookId) note.notebookId = 'nb_default';
            if (note.deletedAt === undefined) note.deletedAt = null;
            if (!note.pages || note.pages.length === 0) {
              note.pages = [
                {
                  id: `p_${note.id}_0`,
                  pageIndex: 0,
                  elements: note.canvasElements || [],
                  gridType: note.gridType || 'dots',
                },
              ];
            }
            if (note.activePageIndex === undefined) note.activePageIndex = 0;
          });
      });

    // Schema Version 4 (Phase 2 Killer Features: Spaced Repetition Flashcards & Study Tracker)
    this.version(4).stores({
      workspaces: 'id, name, updatedAt, createdAt',
      notebooks: 'id, workspaceId, title, updatedAt, createdAt',
      notes: 'id, workspaceId, notebookId, title, subject, updatedAt, createdAt, isPinned, deletedAt',
      attachments: 'id, noteId, type, createdAt, size',
      trash: 'id, deletedAt',
      versionHistory: 'id, noteId, createdAt',
      syncQueue: 'id, action, entityType, entityId, timestamp, status, retryCount',
      flashcards: 'id, noteId, nextReviewDate',
      studySessions: 'id, date, timestamp',
    });
  }
}

export const db = new ScribbleDatabase();

export async function initializeDatabase() {
  const wsCount = await db.workspaces.count();
  const now = Date.now();

  if (wsCount === 0) {
    const defaultWs: WorkspaceRecord = {
      id: 'ws_default',
      name: 'Academic Workspace',
      icon: 'graduation-cap',
      color: '#0A84FF',
      createdAt: now,
      updatedAt: now,
    };
    await db.workspaces.add(defaultWs);

    const defaultNb: NotebookRecord = {
      id: 'nb_default',
      workspaceId: 'ws_default',
      title: 'My Notebook',
      color: '#0A84FF',
      icon: 'book-open',
      description: 'Lecture notes, problem sets, and visual summaries',
      createdAt: now,
      updatedAt: now,
    };
    await db.notebooks.add(defaultNb);
  }

  const noteCount = await db.notes.count();
  if (noteCount === 0) {
    const defaultNote: LectureNote = {
      id: `note_${now.toString(36)}`,
      workspaceId: 'ws_default',
      notebookId: 'nb_default',
      title: 'Welcome to ScribbleNote',
      subject: 'Getting Started',
      tags: ['Notes'],
      gridType: 'dots',
      markdown: `# Welcome to ScribbleNote 📝
Your modern lecture notebook combining typed notes, fluid handwriting, slide annotations, and audio recall.

### Quick Start:
- **Type or Draw:** Type notes on the left, sketch on the infinite canvas on the right.
- **Insert Code Blocks:** Use the code button in the toolbar above with language selection.
- **Audio-Synced Recall:** Tap **Record Memo** above to record lecture audio synchronized with your strokes.
- **Import Slides:** Click **Import PDF** to annotate lecture decks directly on canvas.
- **Spotlight Search:** Press \`Ctrl+K\` (or \`Cmd+K\`) anytime.
`,
      canvasElements: [],
      pages: [
        {
          id: `p_init_0`,
          pageIndex: 0,
          elements: [],
          gridType: 'dots',
        },
      ],
      activePageIndex: 0,
      createdAt: now,
      updatedAt: now,
      isPinned: true,
      deletedAt: null,
      version: 1,
    };

    await db.notes.add(defaultNote);
  }
}

/**
 * Reset workspace to a clean, fresh state by clearing demo/example data
 */
export async function resetToCleanWorkspace() {
  await db.notes.clear();
  await db.flashcards.clear();
  await db.attachments.clear();
  await db.notebooks.clear();
  await db.workspaces.clear();
  await initializeDatabase();
}

export async function calculateStorageUsage(): Promise<{
  totalBytes: number;
  attachmentsBytes: number;
  notesBytes: number;
  formattedTotal: string;
}> {
  let attachmentsBytes = 0;
  let notesBytes = 0;

  try {
    const attachments = await db.attachments.toArray();
    for (const att of attachments) {
      attachmentsBytes += att.size || att.data?.size || 0;
    }

    const notes = await db.notes.toArray();
    for (const note of notes) {
      notesBytes += new Blob([JSON.stringify(note)]).size;
    }
  } catch (err) {
    console.warn('Error calculating storage usage:', err);
  }

  const totalBytes = attachmentsBytes + notesBytes;
  const mb = totalBytes / (1024 * 1024);
  const formattedTotal = mb < 0.1 ? `${Math.round(totalBytes / 1024)} KB` : `${mb.toFixed(1)} MB`;

  return {
    totalBytes,
    attachmentsBytes,
    notesBytes,
    formattedTotal,
  };
}

export async function exportFullDatabaseBackup() {
  const workspaces = await db.workspaces.toArray();
  const notebooks = await db.notebooks.toArray();
  const notes = await db.notes.toArray();
  const versions = await db.versionHistory.toArray();
  const flashcards = await db.flashcards.toArray();

  return {
    version: 'scribblenote_bundle_v1',
    exportedAt: Date.now(),
    workspaces,
    notebooks,
    notes,
    versionHistory: versions,
    flashcards,
  };
}

export async function importFullDatabaseBackup(bundle: any): Promise<{ importedCount: number }> {
  if (!bundle || !Array.isArray(bundle.notes)) {
    throw new Error('Invalid ScribbleNote backup bundle: missing notes array.');
  }

  let count = 0;
  await db.transaction('rw', [db.workspaces, db.notebooks, db.notes, db.flashcards], async () => {
    if (Array.isArray(bundle.workspaces)) {
      for (const ws of bundle.workspaces) {
        await db.workspaces.put(ws);
      }
    }
    if (Array.isArray(bundle.notebooks)) {
      for (const nb of bundle.notebooks) {
        await db.notebooks.put(nb);
      }
    }
    for (const note of bundle.notes) {
      await db.notes.put(note);
      count++;
    }
    if (Array.isArray(bundle.flashcards)) {
      for (const card of bundle.flashcards) {
        await db.flashcards.put(card);
      }
    }
  });

  return { importedCount: count };
}
