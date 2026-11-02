import { describe, it, expect, beforeEach } from 'vitest';
import { useCanvasStore } from '@/store/useCanvasStore';
import type { StrokeElement } from '@/types/note';

describe('useCanvasStore', () => {
  beforeEach(() => {
    useCanvasStore.setState({
      tool: 'pen',
      shape: 'rectangle',
      eraserMode: 'stroke',
      strokeWidth: 4,
      zoom: 1,
      pan: { x: 0, y: 0 },
      palmRejection: false,
      undoStack: [],
      redoStack: [],
    });
  });

  it('switches tools properly', () => {
    useCanvasStore.getState().setTool('highlighter');
    expect(useCanvasStore.getState().tool).toBe('highlighter');

    useCanvasStore.getState().setTool('eraser');
    expect(useCanvasStore.getState().tool).toBe('eraser');

    useCanvasStore.getState().setTool('laser');
    expect(useCanvasStore.getState().tool).toBe('laser');
  });

  it('handles stroke width step adjustments', () => {
    const initial = useCanvasStore.getState().strokeWidth;
    useCanvasStore.getState().increaseStrokeWidth();
    expect(useCanvasStore.getState().strokeWidth).toBe(initial + 2);

    useCanvasStore.getState().decreaseStrokeWidth();
    expect(useCanvasStore.getState().strokeWidth).toBe(initial);
  });

  it('cycles paper grid types correctly', () => {
    expect(useCanvasStore.getState().gridType).toBe('dots');
    useCanvasStore.getState().cycleGridType();
    expect(useCanvasStore.getState().gridType).toBe('ruled');
    useCanvasStore.getState().cycleGridType();
    expect(useCanvasStore.getState().gridType).toBe('grid');
  });

  it('manages undo and redo stacks', () => {
    const mockStroke1: StrokeElement = {
      id: 's1',
      type: 'stroke',
      tool: 'pen',
      points: [{ x: 10, y: 10, pressure: 0.5 }],
      color: '#000000',
      size: 3,
      opacity: 1,
      timestamp: Date.now(),
    };

    const current = [mockStroke1];
    useCanvasStore.getState().pushHistory([]);

    const previous = useCanvasStore.getState().undo(current);
    expect(previous).toEqual([]);

    const restored = useCanvasStore.getState().redo([]);
    expect(restored).toEqual(current);
  });
});
