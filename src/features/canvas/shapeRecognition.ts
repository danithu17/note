import type { Point, ShapeType } from '@/types/note';

export interface RecognizedShape {
  shape: ShapeType;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

/**
 * Standard Ramer-Douglas-Peucker polyline simplification to identify key corners/vertices
 */
function simplifyRDP(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let index = 0;
  const start = points[0];
  const end = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const pt = points[i];
    const dist = perpendicularDistance(pt, start, end);
    if (dist > maxDist) {
      maxDist = dist;
      index = i;
    }
  }

  if (maxDist > epsilon) {
    const left = simplifyRDP(points.slice(0, index + 1), epsilon);
    const right = simplifyRDP(points.slice(index), epsilon);
    return left.slice(0, left.length - 1).concat(right);
  } else {
    return [start, end];
  }
}

function perpendicularDistance(pt: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lineLenSq = dx * dx + dy * dy;
  if (lineLenSq === 0) return Math.hypot(pt.x - lineStart.x, pt.y - lineStart.y);

  const t = Math.max(0, Math.min(1, ((pt.x - lineStart.x) * dx + (pt.y - lineStart.y) * dy) / lineLenSq));
  const projX = lineStart.x + t * dx;
  const projY = lineStart.y + t * dy;
  return Math.hypot(pt.x - projX, pt.y - projY);
}

/**
 * Multi-shape recognition engine:
 * Detects lines, arrows, rectangles, circles, triangles, diamonds, and stars from hand-drawn strokes.
 */
export function recognizeHandDrawnShape(points: Point[]): RecognizedShape | null {
  if (points.length < 8) return null;

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
      pathLength += Math.hypot(pt.x - prev.x, pt.y - prev.y);
    }
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const maxDim = Math.max(width, height);
  if (maxDim < 15 || pathLength < 20) return null;

  // Direct distance between stroke start and end
  const closureDist = Math.hypot(end.x - start.x, end.y - start.y);
  const isClosed = closureDist / pathLength < 0.35 || (closureDist < 25 && pathLength > 60);

  // --------------------------------------------------------------------------
  // CASE 1: Open Stroke -> Straight Line or Arrow
  // --------------------------------------------------------------------------
  if (!isClosed) {
    const straightDist = Math.hypot(end.x - start.x, end.y - start.y);

    // Check for straight line
    if (straightDist / pathLength > 0.84) {
      return {
        shape: 'line',
        startX: start.x,
        startY: start.y,
        endX: end.x,
        endY: end.y,
      };
    }

    // Check for arrow: shaft followed by an arrowhead / hook turnaround
    if (points.length >= 12 && pathLength > 35) {
      // Find point along stroke farthest from start (arrow tip)
      let maxDistFromStart = 0;
      let tipIndex = 0;
      for (let i = 0; i < points.length; i++) {
        const d = Math.hypot(points[i].x - start.x, points[i].y - start.y);
        if (d > maxDistFromStart) {
          maxDistFromStart = d;
          tipIndex = i;
        }
      }

      // If tip is past 65% of the stroke and the remaining stroke returns backwards
      if (tipIndex >= Math.floor(points.length * 0.6) && tipIndex < points.length - 2) {
        const tip = points[tipIndex];
        const shaftDist = Math.hypot(tip.x - start.x, tip.y - start.y);
        const shaftPoints = points.slice(0, tipIndex + 1);
        let shaftLen = 0;
        for (let i = 1; i < shaftPoints.length; i++) {
          shaftLen += Math.hypot(shaftPoints[i].x - shaftPoints[i - 1].x, shaftPoints[i].y - shaftPoints[i - 1].y);
        }

        if (shaftLen > 0 && shaftDist / shaftLen > 0.80) {
          return {
            shape: 'arrow',
            startX: start.x,
            startY: start.y,
            endX: tip.x,
            endY: tip.y,
          };
        }
      }
    }

    return null;
  }

  // --------------------------------------------------------------------------
  // CASE 2: Closed Stroke -> Polygon or Circular Shape
  // --------------------------------------------------------------------------
  if (width < 15 || height < 15) return null;

  // 1. Polygon Area via Shoelace Formula
  let area = 0;
  for (let i = 0; i < points.length - 1; i++) {
    area += points[i].x * points[i + 1].y - points[i + 1].x * points[i].y;
  }
  area += points[points.length - 1].x * points[0].y - points[0].x * points[0].y;
  area = Math.abs(area / 2);

  const bboxArea = width * height;
  if (bboxArea <= 0) return null;
  const fillRatio = area / bboxArea;

  // Centroid
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  // Circularity quotient: 4 * PI * Area / Perimeter^2
  const circularity = pathLength > 0 ? (4 * Math.PI * area) / (pathLength * pathLength) : 0;

  // RDP Vertex reduction to count corners
  const epsilon = Math.max(5, maxDim * 0.08);
  const simplified = simplifyRDP(points, epsilon);
  // Remove duplicate close end point if present
  const vertices = simplified.length > 2 && Math.hypot(simplified[0].x - simplified[simplified.length - 1].x, simplified[0].y - simplified[simplified.length - 1].y) < epsilon
    ? simplified.slice(0, -1)
    : simplified;

  const cornerCount = vertices.length;

  // Radial distances from centroid to detect stars vs circles
  const radialDists = points.map((p) => Math.hypot(p.x - cx, p.y - cy));
  const avgRadius = radialDists.reduce((a, b) => a + b, 0) / radialDists.length;
  let radialVariance = 0;
  for (const r of radialDists) {
    radialVariance += (r - avgRadius) * (r - avgRadius);
  }
  radialVariance = Math.sqrt(radialVariance / radialDists.length) / (avgRadius || 1);

  // A. Circle / Ellipse Detection:
  // Smooth curvature, high circularity, or low radial variance with circle fill ratio (~0.62 - 0.83)
  if (circularity >= 0.80 || (radialVariance < 0.18 && fillRatio >= 0.62 && fillRatio <= 0.83)) {
    return {
      shape: 'circle',
      startX: minX,
      startY: minY,
      endX: maxX,
      endY: maxY,
    };
  }

  // B. Star Detection:
  // Low fill ratio, high radial variance with multiple peaks
  if (fillRatio < 0.48 && radialVariance > 0.28 && cornerCount >= 5) {
    return {
      shape: 'star',
      startX: minX,
      startY: minY,
      endX: maxX,
      endY: maxY,
    };
  }

  // C. Triangle Detection:
  // Exactly 3 distinct corners or fill ratio around 0.32 - 0.60
  if (cornerCount === 3 || (cornerCount <= 4 && fillRatio >= 0.32 && fillRatio <= 0.60 && circularity < 0.75)) {
    return {
      shape: 'triangle',
      startX: minX,
      startY: minY,
      endX: maxX,
      endY: maxY,
    };
  }

  // D. Diamond Detection (Rhombus):
  // 4 corners located near edge midpoints, fill ratio approx 0.42 - 0.66
  if (cornerCount === 4 && fillRatio >= 0.42 && fillRatio <= 0.66) {
    return {
      shape: 'diamond',
      startX: minX,
      startY: minY,
      endX: maxX,
      endY: maxY,
    };
  }

  // E. Rectangle / Box Detection:
  // High fill ratio (>= 0.83) filling corners of bounding box
  if (fillRatio >= 0.83) {
    return {
      shape: 'rectangle',
      startX: minX,
      startY: minY,
      endX: maxX,
      endY: maxY,
    };
  }

  // F. Circularity Fallback
  if (circularity >= 0.70) {
    return {
      shape: 'circle',
      startX: minX,
      startY: minY,
      endX: maxX,
      endY: maxY,
    };
  }

  // Fallback to rectangle if fill is high, or circle
  if (fillRatio >= 0.78) {
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
