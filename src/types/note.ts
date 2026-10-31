export type ToolType =
  | 'pen'
  | 'highlighter'
  | 'eraser'
  | 'shape'
  | 'select'
  | 'laser'
  | 'text'
  | 'sticky'
  | 'ruler';

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
  relativeAudioTime?: number; // Offset in seconds relative to lecture audio recording
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
  relativeAudioTime?: number;
}

export interface TextElement {
  id: string;
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  timestamp: number;
  relativeAudioTime?: number;
}

export interface StickyNoteElement {
  id: string;
  type: 'sticky';
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string; // e.g., yellow, blue, green, pink
  timestamp: number;
  relativeAudioTime?: number;
}

export interface ImageElement {
  id: string;
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  dataUrl: string;
  timestamp: number;
  relativeAudioTime?: number;
}

export type CanvasElement =
  | StrokeElement
  | ShapeElement
  | TextElement
  | StickyNoteElement
  | ImageElement;

export interface NotePage {
  id: string;
  pageIndex: number;
  elements: CanvasElement[];
  gridType?: GridType;
  backgroundImage?: string; // Data URL for imported PDF slide / background
  backgroundType?: 'grid' | 'pdf' | 'image';
  pdfPageNumber?: number;
  originalWidth?: number;
  originalHeight?: number;
}

export interface AudioRecording {
  id: string;
  name: string;
  duration: number; // in seconds
  blobUrl?: string;
  base64Data?: string;
  attachmentId?: string;
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
  canvasElements: CanvasElement[];
  pages?: NotePage[];
  activePageIndex?: number;
  gridType: GridType;
  audioRecordings?: AudioRecording[];
  createdAt: number;
  updatedAt: number;
  syncedAt?: number;
  isPinned?: boolean;
  deletedAt?: number | null;
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

export interface Flashcard {
  id: string;
  noteId: string;
  question: string;
  answer: string;
  easeFactor: number; // Default 2.5
  interval: number; // in days
  repetitions: number;
  nextReviewDate: number; // Unix timestamp
  lastReviewedDate?: number;
}

export type FlashcardRating = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy

export interface StudySessionRecord {
  id: string;
  date: string; // YYYY-MM-DD
  minutes: number;
  noteId?: string;
  timestamp: number;
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
