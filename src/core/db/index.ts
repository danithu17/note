import Dexie, { type Table } from 'dexie';
import type {
  LectureNote,
  CanvasElement,
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
      color: '#3b82f6',
      createdAt: now,
      updatedAt: now,
    };
    await db.workspaces.add(defaultWs);

    const defaultNb: NotebookRecord = {
      id: 'nb_default',
      workspaceId: 'ws_default',
      title: 'CS 204: Graph Theory & Algorithms',
      color: '#3b82f6',
      icon: 'code-2',
      description: 'Fall semester lectures, problem sets, and visual proofs',
      createdAt: now,
      updatedAt: now,
    };
    await db.notebooks.add(defaultNb);

    const mathNb: NotebookRecord = {
      id: 'nb_math',
      workspaceId: 'ws_default',
      title: 'MATH 301: Linear Algebra & Matrix Calculus',
      color: '#10b981',
      icon: 'calculator',
      description: 'Eigenvalues, vector spaces, and SVD decomposition',
      createdAt: now - 3600000,
      updatedAt: now - 3600000,
    };
    await db.notebooks.add(mathNb);
  }

  const noteCount = await db.notes.count();
  if (noteCount === 0) {
    const demoElements: CanvasElement[] = [
      {
        id: 's-1',
        type: 'shape',
        shape: 'circle',
        startX: 80,
        startY: 100,
        endX: 160,
        endY: 180,
        color: '#3b82f6',
        fillColor: '#dbeafe',
        strokeWidth: 3,
        timestamp: now - 3600000,
        relativeAudioTime: 5,
      },
      {
        id: 's-2',
        type: 'shape',
        shape: 'circle',
        startX: 280,
        startY: 70,
        endX: 360,
        endY: 150,
        color: '#10b981',
        fillColor: '#d1fae5',
        strokeWidth: 3,
        timestamp: now - 3500000,
        relativeAudioTime: 12,
      },
      {
        id: 's-3',
        type: 'shape',
        shape: 'circle',
        startX: 120,
        startY: 280,
        endX: 200,
        endY: 360,
        color: '#f59e0b',
        fillColor: '#fef3c7',
        strokeWidth: 3,
        timestamp: now - 3400000,
        relativeAudioTime: 24,
      },
      {
        id: 's-4',
        type: 'shape',
        shape: 'circle',
        startX: 320,
        startY: 270,
        endX: 400,
        endY: 350,
        color: '#8b5cf6',
        fillColor: '#ede9fe',
        strokeWidth: 3,
        timestamp: now - 3300000,
        relativeAudioTime: 35,
      },
      {
        id: 's-5',
        type: 'shape',
        shape: 'arrow',
        startX: 160,
        startY: 130,
        endX: 280,
        endY: 105,
        color: '#10b981',
        strokeWidth: 4,
        timestamp: now - 3200000,
        relativeAudioTime: 48,
      },
      {
        id: 's-6',
        type: 'shape',
        shape: 'arrow',
        startX: 140,
        startY: 180,
        endX: 155,
        endY: 280,
        color: '#64748b',
        strokeWidth: 2,
        timestamp: now - 3100000,
        relativeAudioTime: 55,
      },
      {
        id: 's-7',
        type: 'shape',
        shape: 'arrow',
        startX: 200,
        startY: 320,
        endX: 320,
        endY: 310,
        color: '#10b981',
        strokeWidth: 4,
        timestamp: now - 3000000,
        relativeAudioTime: 62,
      },
    ];

    const defaultNote: LectureNote = {
      id: 'demo-lecture-1',
      workspaceId: 'ws_default',
      notebookId: 'nb_default',
      title: 'CS 204: Graph Algorithms & Dijkstra',
      subject: 'Computer Science',
      tags: ['Algorithms', 'Graphs', 'Lecture 7'],
      gridType: 'dots',
      markdown: `# CS 204: Graph Algorithms & Shortest Paths
**Instructor:** Prof. Elena Vance  
**Date:** Lecture 07 • Fall Term  
**Tags:** #Algorithms #Graphs #PriorityQueue

---

### 1. The Shortest Path Problem
Given a weighted directed graph $G = (V, E)$ with non-negative edge weights $w(u, v) \\ge 0$, find the minimum path cost from source vertex $s$ to all other vertices $v \\in V$.

> 💡 **Key Invariant:** Dijkstra's Algorithm works as a greedy search. It always finalizes the vertex with the current minimal tentative distance!

### 2. Algorithmic Invariants
- Maintain a min-priority queue $Q$ of vertices keyed by tentative distance $d[u]$.
- Relax each adjacent edge $(u, v)$:
  $$d[v] = \\min(d[v], d[u] + w(u, v))$$
- Once extracted from $Q$, $d[u]$ is optimal if weights are non-negative.

\`\`\`typescript
function dijkstra(graph: Map<string, Array<[string, number]>>, start: string) {
  const dist = new Map<string, number>();
  const pq = new PriorityQueue();

  dist.set(start, 0);
  pq.enqueue(start, 0);

  while (!pq.isEmpty()) {
    const { node: u, priority: currentDist } = pq.dequeue()!;
    if (currentDist > (dist.get(u) ?? Infinity)) continue;

    for (const [v, weight] of graph.get(u) || []) {
      if (currentDist + weight < (dist.get(v) ?? Infinity)) {
        dist.set(v, currentDist + weight);
        pq.enqueue(v, currentDist + weight);
      }
    }
  }
  return dist;
}
\`\`\`

### 3. Visual Proof Checklist
- [x] Trace graph vertices $A, B, C, D$ on the right canvas
- [x] Highlight shortest path in Emerald green
- [ ] Calculate time complexity: $O((V + E) \\log V)$ using Fibonacci Heap
`,
      canvasElements: demoElements,
      pages: [
        {
          id: 'p_demo_0',
          pageIndex: 0,
          elements: demoElements,
          gridType: 'dots',
        },
        {
          id: 'p_demo_1',
          pageIndex: 1,
          elements: [
            {
              id: 's-p2-1',
              type: 'shape',
              shape: 'rectangle',
              startX: 100,
              startY: 80,
              endX: 340,
              endY: 180,
              color: '#3b82f6',
              fillColor: '#eff6ff',
              strokeWidth: 2,
              timestamp: now,
            },
          ],
          gridType: 'grid',
        },
      ],
      activePageIndex: 0,
      createdAt: now - 86400000,
      updatedAt: now - 1000,
      isPinned: true,
      deletedAt: null,
      version: 1,
    };

    await db.notes.add(defaultNote);

    // Initial flashcards for this note
    await db.flashcards.add({
      id: 'fc-1',
      noteId: defaultNote.id,
      question: "What is the optimal time complexity of Dijkstra's algorithm with a Fibonacci Heap?",
      answer: "O(E + V log V), where V is vertices and E is edges.",
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: now,
    });

    await db.flashcards.add({
      id: 'fc-2',
      noteId: defaultNote.id,
      question: "Why can't Dijkstra's algorithm handle negative edge weights?",
      answer: "Because Dijkstra assumes that once a vertex distance is finalized from the priority queue, no shorter path to it can ever be found.",
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: now,
    });
  }
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
