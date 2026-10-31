export type ToolType = 'pen' | 'highlighter' | 'eraser' | 'shape' | 'select' | 'laser';

export type ShapeType = 'rectangle' | 'circle' | 'arrow' | 'line' | 'diamond' | 'flowchart-node';

export type GridType = 'dots' | 'ruled' | 'grid' | 'isometric' | 'blank';

export type EraserMode = 'stroke' | 'pixel';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface StrokeElement {
  id: string;
  type: 'stroke';
  tool: 'pen' | 'highlighter';
  points: Point[];
  color: string;
  size: number;
  opacity: number;
  timestamp: number;
}

export interface ShapeElement {
  id: string;
  type: 'shape';
  shape: ShapeType;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  fillColor?: string;
  strokeWidth: number;
  timestamp: number;
}

export type CanvasElement = StrokeElement | ShapeElement;

export interface NotePage {
  id: string;
  pageIndex: number;
  elements: CanvasElement[];
  gridType?: GridType;
}

export interface AudioRecording {
  id: string;
  name: string;
  duration: number; // in seconds
  blobUrl?: string;
  base64Data?: string; // legacy fallback
  attachmentId?: string; // pointer to binary Dexie AttachmentRecord
  createdAt: number;
}

export interface WorkspaceRecord {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  createdAt: number;
  updatedAt: number;
}

export interface NotebookRecord {
  id: string;
  workspaceId: string;
  title: string;
  color?: string;
  icon?: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface LectureNote {
  id: string;
  workspaceId?: string;
  notebookId?: string;
  title: string;
  subject: string;
  tags: string[];
  markdown: string;
  canvasElements: CanvasElement[]; // Active page elements (synced with pages[activePageIndex])
  pages?: NotePage[]; // Multi-page canvas pages
  activePageIndex?: number;
  gridType: GridType;
  audioRecordings?: AudioRecording[];
  createdAt: number;
  updatedAt: number;
  syncedAt?: number;
  isPinned?: boolean;
  deletedAt?: number | null; // Soft-delete for trash with 30-day restore
  version?: number;
}

export interface AttachmentRecord {
  id: string;
  noteId: string;
  type: 'audio' | 'image' | 'pdf';
  mimeType: string;
  name: string;
  data: Blob;
  size: number;
  storageUrl?: string;
  duration?: number;
  createdAt: number;
}

export interface VersionRecord {
  id: string;
  noteId: string;
  title: string;
  markdown: string;
  canvasElements: CanvasElement[];
  pages?: NotePage[];
  createdAt: number;
  summary?: string;
}

export interface TrashRecord {
  id: string;
  originalNote: LectureNote;
  deletedAt: number;
}

export interface SyncQueueRecord {
  id: string;
  action: 'create' | 'update' | 'delete' | 'canvas_stroke_append' | 'attachment_upload';
  entityType: 'note' | 'notebook' | 'workspace' | 'attachment' | 'canvas_stroke';
  entityId: string;
  payload: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'processing' | 'failed';
  lastError?: string;
}

export interface UserAccount {
  id: string;
  email?: string;
  name?: string;
  isGuest: boolean;
  avatarUrl?: string;
  plan: 'free' | 'pro' | 'team';
  storageUsedBytes: number;
  storageLimitBytes: number;
}

export type ViewLayoutMode = 'split' | 'canvas-only' | 'notes-only' | 'timeline';

export type SyncState = 'offline' | 'syncing' | 'synced' | 'conflict' | 'error';

export interface SyncStatus {
  state: SyncState;
  lastSynced?: number;
  mode: 'local' | 'broadcast' | 'supabase';
  pendingQueueCount?: number;
  deviceCount?: number;
  errorMessage?: string;
}
