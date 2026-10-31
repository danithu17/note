import { describe, it, expect } from 'vitest';
import { elementIntersectsPoint, getSvgPathFromStroke } from '@/utils/stroke';
import type { StrokeElement, ShapeElement } from '@/types/note';

describe('stroke utilities', () => {
  it('generates non-empty SVG path data from outline points', () => {
    const points = [
      [10, 10],
      [20, 10],
      [20, 20],
      [10, 20],
    ];
    const path = getSvgPathFromStroke(points);
    expect(path).toContain('M');
    expect(path).toContain('Q');
    expect(path).toContain('Z');
  });

  it('detects point intersection on a stroke', () => {
    const stroke: StrokeElement = {
      id: 'stroke_test',
      type: 'stroke',
      tool: 'pen',
      points: [
        { x: 50, y: 50, pressure: 0.5 },
        { x: 100, y: 50, pressure: 0.5 },
      ],
      color: '#3b82f6',
      size: 4,
      opacity: 1,
      timestamp: Date.now(),
    };

    // Point on the line segment
    expect(elementIntersectsPoint(stroke, 75, 50, 10)).toBe(true);

    // Far away point
    expect(elementIntersectsPoint(stroke, 200, 200, 10)).toBe(false);
  });

  it('detects point intersection on a rectangle shape', () => {
    const rect: ShapeElement = {
      id: 'shape_rect',
      type: 'shape',
      shape: 'rectangle',
      startX: 50,
      startY: 50,
      endX: 150,
      endY: 150,
      color: '#ef4444',
      strokeWidth: 2,
      timestamp: Date.now(),
    };

    // Point on top edge
    expect(elementIntersectsPoint(rect, 100, 50, 8)).toBe(true);

    // Far away point
    expect(elementIntersectsPoint(rect, 300, 300, 8)).toBe(false);
  });
});
