import { getStroke } from 'perfect-freehand';
import type { Point, ShapeElement, CanvasElement } from '../types/note';

export interface StrokeOptions {
  size: number;
  thinning?: number;
  smoothing?: number;
  streamline?: number;
  simulatePressure?: boolean;
}

/**
 * Returns SVG path data string from an array of [x, y] outline points
 */
export function getSvgPathFromStroke(stroke: number[][]): string {
  if (!stroke.length) return '';

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q']
  );

  d.push('Z');
  return d.join(' ');
}

/**
 * Renders a perfect-freehand stroke directly to a Canvas 2D context
 */
export function drawFreehandStroke(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  size: number,
  opacity: number = 1,
  isHighlighter: boolean = false
) {
  if (points.length === 0) return;

  const strokeOptions = {
    size: isHighlighter ? size * 2.2 : size,
    thinning: isHighlighter ? 0.05 : 0.6,
    smoothing: 0.65,
    streamline: 0.6,
    simulatePressure: points.every((p) => p.pressure === undefined || p.pressure === 0.5),
  };

  const formattedPoints = points.map((p) => [p.x, p.y, p.pressure ?? 0.5]);
  const outline = getStroke(formattedPoints, strokeOptions);

  if (outline.length === 0) return;

  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity;

  if (isHighlighter) {
    ctx.globalCompositeOperation = 'multiply';
  }

  ctx.beginPath();
  ctx.moveTo(outline[0][0], outline[0][1]);

  for (let i = 1; i < outline.length; i++) {
    ctx.lineTo(outline[i][0], outline[i][1]);
  }

  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Renders geometric shapes (rectangle, circle, arrow, line, diamond, flowchart node)
 */
export function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: ShapeElement
) {
  ctx.save();
  ctx.strokeStyle = shape.color;
  ctx.lineWidth = shape.strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const x1 = shape.startX;
  const y1 = shape.startY;
  const x2 = shape.endX;
  const y2 = shape.endY;
  const width = x2 - x1;
  const height = y2 - y1;

  switch (shape.shape) {
    case 'rectangle': {
      if (shape.fillColor) {
        ctx.fillStyle = shape.fillColor;
        ctx.fillRect(x1, y1, width, height);
      }
      ctx.strokeRect(x1, y1, width, height);
      break;
    }

    case 'circle': {
      const centerX = x1 + width / 2;
      const centerY = y1 + height / 2;
      const radiusX = Math.abs(width) / 2;
      const radiusY = Math.abs(height) / 2;

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      if (shape.fillColor) {
        ctx.fillStyle = shape.fillColor;
        ctx.fill();
      }
      ctx.stroke();
      break;
    }

    case 'line': {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      break;
    }

    case 'arrow': {
      // Draw shaft
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Draw arrowhead
      const headLength = Math.max(14, shape.strokeWidth * 3.5);
      const angle = Math.atan2(y2 - y1, x2 - x1);

      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(
        x2 - headLength * Math.cos(angle - Math.PI / 6),
        y2 - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(x2, y2);
      ctx.lineTo(
        x2 - headLength * Math.cos(angle + Math.PI / 6),
        y2 - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
      break;
    }

    case 'diamond': {
      const midX = x1 + width / 2;
      const midY = y1 + height / 2;

      ctx.beginPath();
      ctx.moveTo(midX, y1);
      ctx.lineTo(x2, midY);
      ctx.lineTo(midX, y2);
      ctx.lineTo(x1, midY);
      ctx.closePath();

      if (shape.fillColor) {
        ctx.fillStyle = shape.fillColor;
        ctx.fill();
      }
      ctx.stroke();
      break;
    }

    case 'flowchart-node': {
      // Rounded rectangle with title bar line
      const radius = 10;
      ctx.beginPath();
      ctx.roundRect(x1, y1, width, height, radius);
      if (shape.fillColor) {
        ctx.fillStyle = shape.fillColor;
        ctx.fill();
      }
      ctx.stroke();

      // subtle header line
      ctx.beginPath();
      ctx.moveTo(x1, y1 + Math.min(28, height * 0.3));
      ctx.lineTo(x2, y1 + Math.min(28, height * 0.3));
      ctx.strokeStyle = shape.color;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

/**
 * Check if a point is close to a line segment
 */
function isPointNearSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number, threshold: number): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    const dist = Math.hypot(px - x1, py - y1);
    return dist <= threshold;
  }

  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));

  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return Math.hypot(px - projX, py - projY) <= threshold;
}

/**
 * Stroke-based eraser hit test:
 * Returns true if eraser point (ex, ey) hits the canvas element
 */
export function elementIntersectsPoint(
  element: CanvasElement,
  ex: number,
  ey: number,
  eraserRadius: number = 12
): boolean {
  if (element.type === 'stroke') {
    const pts = element.points;
    const threshold = eraserRadius + (element.size / 2);
    for (let i = 0; i < pts.length; i++) {
      if (Math.hypot(pts[i].x - ex, pts[i].y - ey) <= threshold) {
        return true;
      }
      if (i > 0 && isPointNearSegment(ex, ey, pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y, threshold)) {
        return true;
      }
    }
    return false;
  }

  if (element.type === 'shape') {
    const { startX, startY, endX, endY, strokeWidth } = element;
    const threshold = eraserRadius + strokeWidth;
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);

    if (element.shape === 'line' || element.shape === 'arrow') {
      return isPointNearSegment(ex, ey, startX, startY, endX, endY, threshold);
    }

    // Check boundary segments for rectangles / shapes
    const nearLeft = isPointNearSegment(ex, ey, minX, minY, minX, maxY, threshold);
    const nearRight = isPointNearSegment(ex, ey, maxX, minY, maxX, maxY, threshold);
    const nearTop = isPointNearSegment(ex, ey, minX, minY, maxX, minY, threshold);
    const nearBottom = isPointNearSegment(ex, ey, minX, maxY, maxX, maxY, threshold);

    // If filled, check inside
    if (element.fillColor) {
      if (ex >= minX - threshold && ex <= maxX + threshold && ey >= minY - threshold && ey <= maxY + threshold) {
        return true;
      }
    }

    return nearLeft || nearRight || nearTop || nearBottom;
  }

  return false;
}
