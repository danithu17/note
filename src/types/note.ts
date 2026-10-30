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

export interface AudioRecording {
  id: string;
  name: string;
  duration: number; // in seconds
  blobUrl?: string;
  base64Data?: string; // for storage
  createdAt: number;
}

export interface LectureNote {
  id: string;
  title: string;
  subject: string;
  tags: string[];
  markdown: string;
  canvasElements: CanvasElement[];
  gridType: GridType;
  audioRecordings?: AudioRecording[];
  createdAt: number;
  updatedAt: number;
  syncedAt?: number;
  isPinned?: boolean;
}

export type ViewLayoutMode = 'split' | 'canvas-only' | 'notes-only';

export interface SyncStatus {
  state: 'offline' | 'syncing' | 'synced' | 'error';
  lastSynced?: number;
  mode: 'local' | 'broadcast' | 'firebase';
  deviceCount?: number;
}
