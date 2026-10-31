import { describe, it, expect } from 'vitest';
import {
  simplifyPoints,
  getElementBoundingBox,
  doBoxesIntersect,
  type BoundingBox,
} from '@/core/canvas/simplify';
import { SpatialIndex } from '@/core/canvas/spatialIndex';
import type { StrokeElement, ShapeElement, Point } from '@/types/note';

describe('Phase 3: Performance, Spatial Indexing & Reliability', () => {
  describe('Ramer-Douglas-Peucker (RDP) Point Simplification', () => {
    it('returns original points for arrays with 2 or fewer points', () => {
      const single: Point[] = [{ x: 10, y: 10 }];
      expect(simplifyPoints(single)).toEqual(single);

      const pair: Point[] = [
        { x: 10, y: 10 },
        { x: 50, y: 50 },
      ];
      expect(simplifyPoints(pair)).toEqual(pair);
    });

    it('decimates redundant collinear points while preserving endpoints', () => {
      // 50 collinear points on line y = 2x
      const collinear: Point[] = [];
      for (let i = 0; i <= 50; i++) {
        collinear.push({ x: i * 2, y: i * 4 });
      }

      const simplified = simplifyPoints(collinear, 0.5);
      expect(simplified.length).toBe(2);
      expect(simplified[0]).toEqual(collinear[0]);
      expect(simplified[1]).toEqual(collinear[50]);
    });

    it('preserves significant peaks and curves above epsilon', () => {
      const pointsWithPeak: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 20, y: 0 },
        { x: 25, y: 50 }, // Sharp peak
        { x: 30, y: 0 },
        { x: 40, y: 0 },
        { x: 50, y: 0 },
      ];

      const simplified = simplifyPoints(pointsWithPeak, 1.0);
      expect(simplified.some((p) => p.x === 25 && p.y === 50)).toBe(true);
      expect(simplified.length).toBeLessThan(pointsWithPeak.length);
    });
  });

  describe('Axis-Aligned Bounding Box (AABB) Calculations', () => {
    it('computes tight bounds for StrokeElement with padding', () => {
      const stroke: StrokeElement = {
        id: 's_test',
        type: 'stroke',
        tool: 'pen',
        points: [
          { x: 10, y: 20 },
          { x: 100, y: 200 },
        ],
        color: '#000',
        size: 4,
        opacity: 1,
        timestamp: Date.now(),
      };

      const bbox = getElementBoundingBox(stroke);
      expect(bbox.minX).toBeLessThan(10);
      expect(bbox.minY).toBeLessThan(20);
      expect(bbox.maxX).toBeGreaterThan(100);
      expect(bbox.maxY).toBeGreaterThan(200);
    });

    it('correctly assesses bounding box intersections', () => {
      const boxA: BoundingBox = { minX: 0, minY: 0, maxX: 50, maxY: 50 };
      const boxB: BoundingBox = { minX: 40, minY: 40, maxX: 100, maxY: 100 };
      const boxC: BoundingBox = { minX: 200, minY: 200, maxX: 300, maxY: 300 };

      expect(doBoxesIntersect(boxA, boxB)).toBe(true);
      expect(doBoxesIntersect(boxA, boxC)).toBe(false);
    });
  });

  describe('2D Spatial Quadtree Index & Viewport Culling', () => {
    it('partitions elements and queries visible viewport efficiently', () => {
      const index = new SpatialIndex();
      const elements: StrokeElement[] = [];

      // Create 400 strokes across a 4000x4000 world plane
      for (let i = 0; i < 400; i++) {
        const x = (i % 20) * 200;
        const y = Math.floor(i / 20) * 200;
        elements.push({
          id: `stroke_${i}`,
          type: 'stroke',
          tool: 'pen',
          points: [
            { x, y },
            { x: x + 20, y: y + 20 },
          ],
          color: '#3b82f6',
          size: 2,
          opacity: 1,
          timestamp: 1000 + i,
        });
      }

      index.buildIndex(elements);
      expect(index.size()).toBe(400);

      // Query a small viewport: [0, 0] to [450, 450]
      const visible = index.queryViewport({
        minX: 0,
        minY: 0,
        maxX: 450,
        maxY: 450,
      });

      // Should return only strokes within or touching this viewport window
      expect(visible.length).toBeGreaterThan(0);
      expect(visible.length).toBeLessThan(50); // Far less than total 400

      // Query an area with no strokes
      const emptyVisible = index.queryViewport({
        minX: 10000,
        minY: 10000,
        maxX: 11000,
        maxY: 11000,
      });
      expect(emptyVisible.length).toBe(0);
    });

    it('performs point radius query for O(log N) eraser hit-testing', () => {
      const index = new SpatialIndex();
      const s1: ShapeElement = {
        id: 'shape_at_origin',
        type: 'shape',
        shape: 'circle',
        startX: 50,
        startY: 50,
        endX: 100,
        endY: 100,
        color: '#ff0000',
        strokeWidth: 2,
        timestamp: 100,
      };

      const s2: ShapeElement = {
        id: 'shape_far_away',
        type: 'shape',
        shape: 'rectangle',
        startX: 2000,
        startY: 2000,
        endX: 2500,
        endY: 2500,
        color: '#00ff00',
        strokeWidth: 2,
        timestamp: 200,
      };

      index.buildIndex([s1, s2]);

      // Eraser touching shape 1
      const hitCandidates = index.queryPoint(75, 75, 10);
      expect(hitCandidates.length).toBe(1);
      expect(hitCandidates[0].id).toBe('shape_at_origin');

      // Eraser in empty space
      const noHits = index.queryPoint(500, 500, 10);
      expect(noHits.length).toBe(0);
    });

    it('clears spatial index on demand', () => {
      const index = new SpatialIndex();
      index.buildIndex([
        {
          id: 'test',
          type: 'shape',
          shape: 'circle',
          startX: 0,
          startY: 0,
          endX: 10,
          endY: 10,
          color: '#000',
          strokeWidth: 1,
          timestamp: 1,
        },
      ]);
      expect(index.size()).toBe(1);

      index.clear();
      expect(index.size()).toBe(0);
      expect(index.queryViewport({ minX: 0, minY: 0, maxX: 100, maxY: 100 })).toEqual([]);
    });
  });
});
