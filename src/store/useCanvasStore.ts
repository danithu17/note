import { create } from 'zustand';
import type {
  ToolType,
  ShapeType,
  EraserMode,
  GridType,
  CanvasElement,
  ViewLayoutMode,
} from '../types/note';
import { sound } from '../utils/sound';

export type ActiveModalType =
  | 'ai'
  | 'flashcards'
  | 'pomodoro'
  | 'pdf'
  | 'pricing'
  | 'sync'
  | 'history'
  | 'auth'
  | 'trash'
  | 'admin'
  | null;

export interface CanvasState {
  tool: ToolType;
  shape: ShapeType;
  eraserMode: EraserMode;
  color: string;
  fillColor: string;
  strokeWidth: number;
  highlighterColor: string;
  gridType: GridType;
  palmRejection: boolean;
  zoom: number;
  pan: { x: number; y: number };
  layoutMode: ViewLayoutMode;
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  isCommandPaletteOpen: boolean;
  isShortcutsModalOpen: boolean;
  activeModal: ActiveModalType;
  viewMode: 'app' | 'landing';
  isSoundEnabled: boolean;
  isFullscreen: boolean;
  autoShapeRecognition: boolean;
  undoStack: CanvasElement[][];
  redoStack: CanvasElement[][];

  // Actions
  setTool: (tool: ToolType) => void;
  setShape: (shape: ShapeType) => void;
  setEraserMode: (mode: EraserMode) => void;
  setColor: (color: string) => void;
  setFillColor: (fillColor: string) => void;
  setStrokeWidth: (width: number) => void;
  increaseStrokeWidth: () => void;
  decreaseStrokeWidth: () => void;
  setHighlighterColor: (color: string) => void;
  setGridType: (grid: GridType) => void;
  cycleGridType: () => void;
  togglePalmRejection: () => void;
  setPalmRejection: (enabled: boolean) => void;
  toggleAutoShapeRecognition: () => void;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setPan: (
    pan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })
  ) => void;
  resetView: () => void;
  setLayoutMode: (mode: ViewLayoutMode) => void;
  cycleLayoutMode: () => void;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setShortcutsModalOpen: (open: boolean) => void;
  toggleShortcutsModal: () => void;
  openModal: (modal: ActiveModalType) => void;
  closeModal: () => void;
  setViewMode: (viewMode: 'app' | 'landing') => void;
  toggleSound: () => void;
  toggleFullscreen: () => void;
  pushHistory: (elements: CanvasElement[]) => void;
  undo: (currentElements: CanvasElement[]) => CanvasElement[] | null;
  redo: (currentElements: CanvasElement[]) => CanvasElement[] | null;
  clearHistory: () => void;
}

const GRIDS: GridType[] = ['dots', 'ruled', 'grid', 'isometric', 'blank'];
const LAYOUTS: ViewLayoutMode[] = ['split', 'canvas-only', 'notes-only', 'timeline'];

function getInitialDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem('scribblenote_dark_mode');
    if (stored !== null) {
      const isDark = stored === 'true';
      if (isDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return isDark;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) document.documentElement.classList.add('dark');
    return prefersDark;
  } catch {
    return false;
  }
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  tool: 'pen',
  shape: 'rectangle',
  eraserMode: 'stroke',
  color: '#3b82f6',
  fillColor: 'transparent',
  strokeWidth: 3,
  highlighterColor: '#facc15',
  gridType: 'dots',
  palmRejection: true,
  zoom: 1,
  pan: { x: 0, y: 0 },
  layoutMode: typeof window !== 'undefined' && window.innerWidth < 768 ? 'canvas-only' : 'split',
  isDarkMode: getInitialDarkMode(),
  isSidebarOpen: typeof window !== 'undefined' && window.innerWidth >= 1024,
  isCommandPaletteOpen: false,
  isShortcutsModalOpen: false,
  activeModal: null,
  viewMode:
    typeof window !== 'undefined' && window.location.hash.includes('app') ? 'app' : 'landing',
  isSoundEnabled: true,
  isFullscreen: false,
  autoShapeRecognition: true,
  undoStack: [],
  redoStack: [],

  setTool: (tool) => {
    sound.click();
    set({ tool });
  },

  setShape: (shape) => {
    sound.click();
    set({ shape, tool: 'shape' });
  },

  setEraserMode: (eraserMode) => {
    sound.click();
    set({ eraserMode, tool: 'eraser' });
  },

  setColor: (color) => set({ color }),
  setFillColor: (fillColor) => set({ fillColor }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),

  increaseStrokeWidth: () => {
    sound.click();
    set((state) => ({ strokeWidth: Math.min(32, state.strokeWidth + 2) }));
  },

  decreaseStrokeWidth: () => {
    sound.click();
    set((state) => ({ strokeWidth: Math.max(1, state.strokeWidth - 2) }));
  },

  setHighlighterColor: (highlighterColor) => {
    sound.click();
    set({ highlighterColor, tool: 'highlighter' });
  },

  setGridType: (gridType) => {
    sound.click();
    set({ gridType });
  },

  cycleGridType: () => {
    sound.click();
    const current = get().gridType;
    const nextIdx = (GRIDS.indexOf(current) + 1) % GRIDS.length;
    set({ gridType: GRIDS[nextIdx] });
  },

  togglePalmRejection: () => {
    sound.pop();
    set((state) => ({ palmRejection: !state.palmRejection }));
  },

  setPalmRejection: (palmRejection) => set({ palmRejection }),

  toggleAutoShapeRecognition: () => {
    sound.pop();
    set((state) => ({ autoShapeRecognition: !state.autoShapeRecognition }));
  },

  setZoom: (zoom) =>
    set((state) => {
      const nextZoom = typeof zoom === 'function' ? zoom(state.zoom) : zoom;
      return { zoom: Math.max(0.1, Math.min(5, nextZoom)) };
    }),

  setPan: (pan) =>
    set((state) => ({
      pan: typeof pan === 'function' ? pan(state.pan) : pan,
    })),

  resetView: () => {
    sound.whoosh();
    set({ zoom: 1, pan: { x: 0, y: 0 } });
  },

  setLayoutMode: (layoutMode) => {
    sound.click();
    set({ layoutMode });
  },

  cycleLayoutMode: () => {
    sound.click();
    const current = get().layoutMode;
    const nextIdx = (LAYOUTS.indexOf(current) + 1) % LAYOUTS.length;
    set({ layoutMode: LAYOUTS[nextIdx] });
  },

  toggleDarkMode: () => {
    sound.pop();
    const nextDark = !get().isDarkMode;
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('scribblenote_dark_mode', String(nextDark));
    } catch {
      // ignore
    }
    set({ isDarkMode: nextDark });
  },

  toggleSidebar: () => {
    sound.click();
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },

  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),

  setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),

  toggleCommandPalette: () => {
    sound.pop();
    set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen }));
  },

  setShortcutsModalOpen: (isShortcutsModalOpen) => set({ isShortcutsModalOpen }),

  toggleShortcutsModal: () => {
    sound.pop();
    set((state) => ({ isShortcutsModalOpen: !state.isShortcutsModalOpen }));
  },

  openModal: (modal) => {
    sound.click();
    set({ activeModal: modal });
  },

  closeModal: () => {
    set({ activeModal: null });
  },

  setViewMode: (viewMode) => {
    sound.click();
    if (typeof window !== 'undefined') {
      window.location.hash = viewMode === 'app' ? '#app' : '#landing';
    }
    set({ viewMode });
  },

  toggleSound: () => {
    const next = !get().isSoundEnabled;
    sound.enabled = next;
    set({ isSoundEnabled: next });
    if (next) sound.pop();
  },

  toggleFullscreen: () => {
    sound.pop();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      set({ isFullscreen: true });
    } else {
      document.exitFullscreen().catch(() => {});
      set({ isFullscreen: false });
    }
  },

  pushHistory: (elements) => {
    set((state) => ({
      undoStack: [...state.undoStack.slice(-30), elements],
      redoStack: [],
    }));
  },

  undo: (currentElements) => {
    const { undoStack, redoStack } = get();
    if (undoStack.length === 0) return null;
    sound.whoosh();
    const previous = undoStack[undoStack.length - 1];
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [currentElements, ...redoStack],
    });
    return previous;
  },

  redo: (currentElements) => {
    const { undoStack, redoStack } = get();
    if (redoStack.length === 0) return null;
    sound.whoosh();
    const next = redoStack[0];
    set({
      redoStack: redoStack.slice(1),
      undoStack: [...undoStack, currentElements],
    });
    return next;
  },

  clearHistory: () => set({ undoStack: [], redoStack: [] }),
}));
