import { describe, it, expect } from 'vitest';
import { exportCanvasToSvg } from '@/utils/export';
import type { ShapeElement, StrokeElement } from '@/types/note';

describe('export utilities', () => {
  it('exports canvas elements to a valid SVG document', () => {
    const elements = [
      {
        id: 'shp1',
        type: 'shape',
        shape: 'rectangle',
        startX: 10,
        startY: 10,
        endX: 100,
        endY: 100,
        color: '#3b82f6',
        strokeWidth: 2,
        timestamp: Date.now(),
      } as ShapeElement,
      {
        id: 'strk1',
        type: 'stroke',
        tool: 'pen',
        points: [
          { x: 10, y: 10, pressure: 0.5 },
          { x: 30, y: 30, pressure: 0.5 },
        ],
        color: '#10b981',
        size: 3,
        opacity: 1,
        timestamp: Date.now(),
      } as StrokeElement,
    ];

    const svg = exportCanvasToSvg(elements, 800, 600, true, false);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('rect');
    expect(svg).toContain('path');
  });
});
