import Dexie, { type Table } from 'dexie';
import type { LectureNote, CanvasElement } from '@/types/note';

export interface AttachmentRecord {
  id: string;
  noteId: string;
  type: 'audio' | 'image' | 'pdf';
  mimeType: string;
  name: string;
  data: Blob;
  duration?: number;
  createdAt: number;
}

export interface NotebookRecord {
  id: string;
  title: string;
  color?: string;
  icon?: string;
  createdAt: number;
  updatedAt: number;
}

export interface TrashRecord {
  id: string;
  originalNote: LectureNote;
  deletedAt: number;
}

export class ScribbleDatabase extends Dexie {
  notes!: Table<LectureNote, string>;
  notebooks!: Table<NotebookRecord, string>;
  attachments!: Table<AttachmentRecord, string>;
  trash!: Table<TrashRecord, string>;

  constructor() {
    super('ScribbleNoteDB');

    // Schema Version 1 (Legacy Initial Prototype)
    this.version(1).stores({
      notes: 'id, title, subject, updatedAt, createdAt, isPinned',
    });

    // Schema Version 2 (Production Grade: Versioned Migrations, Attachments & Trash)
    this.version(2)
      .stores({
        notes: 'id, title, subject, updatedAt, createdAt, isPinned, notebookId',
        notebooks: 'id, title, updatedAt',
        attachments: 'id, noteId, type, createdAt',
        trash: 'id, deletedAt',
      })
      .upgrade((tx) => {
        // Safe migration hook: ensure all legacy notes have default notebook & valid timestamps
        return tx
          .table('notes')
          .toCollection()
          .modify((note: any) => {
            if (!note.notebookId) {
              note.notebookId = 'default_notebook';
            }
            if (!note.canvasElements) {
              note.canvasElements = [];
            }
          });
      });
  }
}

export const db = new ScribbleDatabase();

// Pre-load default lecture note if database is completely empty
export async function initializeDatabase() {
  const count = await db.notes.count();
  if (count === 0) {
    const defaultNote: LectureNote = {
      id: 'demo-lecture-1',
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
Given a weighted graph $G = (V, E)$ with non-negative edge weights $w(u, v) \\ge 0$, find the minimum path cost from a source vertex $s$ to all other vertices $v \\in V$.

> 💡 **Key Takeaway:** Dijkstra's Algorithm works as a greedy search. It always finalizes the node with the current minimal tentative distance!

### 2. Algorithmic Invariants
- Maintain a min-priority queue $Q$ of vertices keyed by tentative distance $d[u]$.
- Relax each adjacent edge $(u, v)$:
  $$d[v] = \\min(d[v], d[u] + w(u, v))$$
- Once extracted from $Q$, $d[u]$ is guaranteed to be optimal if weights are non-negative.

\`\`\`typescript
// Dijkstra Implementation in TypeScript
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

### 3. Visual Sketch Checklist
- [x] Trace graph vertices $A, B, C, D$ on the right canvas
- [x] Highlight shortest path in Emerald green
- [ ] Calculate time complexity: $O((V + E) \\log V)$ using Fibonacci Heap
`,
      canvasElements: [
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
          timestamp: Date.now() - 3600000,
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
          timestamp: Date.now() - 3500000,
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
          timestamp: Date.now() - 3400000,
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
          timestamp: Date.now() - 3300000,
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
          timestamp: Date.now() - 3200000,
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
          timestamp: Date.now() - 3100000,
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
          timestamp: Date.now() - 3000000,
        },
      ] as CanvasElement[],
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 1000,
      isPinned: true,
    };
    await db.notes.add(defaultNote);
  }
}
