import type { Point, ShapeType } from '@/types/note';

export interface RecognizedShape {
  shape: ShapeType;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export function recognizeHandDrawnShape(points: Point[]): RecognizedShape | null {
  if (points.length < 10) return null;

  const start = points[0];
  const end = points[points.length - 1];

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let pathLength = 0;

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    if (pt.x < minX) minX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y > maxY) maxY = pt.y;

    if (i > 0) {
      const prev = points[i - 1];
      const dx = pt.x - prev.x;
      const dy = pt.y - prev.y;
      pathLength += Math.hypot(dx, dy);
    }
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const maxDim = Math.max(width, height);
  if (maxDim < 20) return null;

  // Direct distance between start and end
  const closureDist = Math.hypot(end.x - start.x, end.y - start.y);
  const straightDist = Math.hypot(end.x - start.x, end.y - start.y);

  // 1. Check if straight line
  if (straightDist / pathLength > 0.88) {
    return {
      shape: 'line',
      startX: start.x,
      startY: start.y,
      endX: end.x,
      endY: end.y,
    };
  }

  // 2. Closed 2D shape (Circle or Rectangle)
  if (width < 20 || height < 20) return null;
  const isClosed = closureDist / pathLength < 0.3;

  if (isClosed) {
    // Compute enclosed polygon area via Shoelace formula
    let area = 0;
    for (let i = 0; i < points.length - 1; i++) {
      area += points[i].x * points[i + 1].y - points[i + 1].x * points[i].y;
    }
    area = Math.abs(area / 2);

    const bboxArea = width * height;
    const fillRatio = bboxArea > 0 ? area / bboxArea : 0;

    // A rectangle fills its bounding box corners (fillRatio ~ 1.0, theoretical limit for circle is π/4 ≈ 0.785)
    if (fillRatio > 0.84) {
      return {
        shape: 'rectangle',
        startX: minX,
        startY: minY,
        endX: maxX,
        endY: maxY,
      };
    } else {
      return {
        shape: 'circle',
        startX: minX,
        startY: minY,
        endX: maxX,
        endY: maxY,
      };
    }
  }

  return null;
}
