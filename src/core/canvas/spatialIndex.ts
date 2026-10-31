import type { CanvasElement } from '@/types/note';
import { type BoundingBox, getElementBoundingBox, doBoxesIntersect } from './simplify';

interface QuadItem {
  element: CanvasElement;
  bbox: BoundingBox;
}

class QuadNode {
  public bounds: BoundingBox;
  public items: QuadItem[] = [];
  public children: QuadNode[] | null = null;
  public depth: number;
  private readonly maxItems: number;
  private readonly maxDepth: number;

  constructor(bounds: BoundingBox, depth: number = 0, maxItems: number = 16, maxDepth: number = 8) {
    this.bounds = bounds;
    this.depth = depth;
    this.maxItems = maxItems;
    this.maxDepth = maxDepth;
  }

  public insert(item: QuadItem): void {
    if (!doBoxesIntersect(this.bounds, item.bbox)) {
      return;
    }

    if (this.children !== null) {
      for (const child of this.children) {
        if (doBoxesIntersect(child.bounds, item.bbox)) {
          child.insert(item);
        }
      }
      return;
    }

    this.items.push(item);

    if (this.items.length > this.maxItems && this.depth < this.maxDepth) {
      this.subdivide();
    }
  }

  private subdivide(): void {
    const midX = (this.bounds.minX + this.bounds.maxX) / 2;
    const midY = (this.bounds.minY + this.bounds.maxY) / 2;

    this.children = [
      // NW
      new QuadNode(
        { minX: this.bounds.minX, minY: this.bounds.minY, maxX: midX, maxY: midY },
        this.depth + 1,
        this.maxItems,
        this.maxDepth
      ),
      // NE
      new QuadNode(
        { minX: midX, minY: this.bounds.minY, maxX: this.bounds.maxX, maxY: midY },
        this.depth + 1,
        this.maxItems,
        this.maxDepth
      ),
      // SW
      new QuadNode(
        { minX: this.bounds.minX, minY: midY, maxX: midX, maxY: this.bounds.maxY },
        this.depth + 1,
        this.maxItems,
        this.maxDepth
      ),
      // SE
      new QuadNode(
        { minX: midX, minY: midY, maxX: this.bounds.maxX, maxY: this.bounds.maxY },
        this.depth + 1,
        this.maxItems,
        this.maxDepth
      ),
    ];

    const currentItems = this.items;
    this.items = [];

    for (const item of currentItems) {
      for (const child of this.children) {
        if (doBoxesIntersect(child.bounds, item.bbox)) {
          child.insert(item);
        }
      }
    }
  }

  public query(queryBox: BoundingBox, resultSet: Set<CanvasElement>): void {
    if (!doBoxesIntersect(this.bounds, queryBox)) {
      return;
    }

    for (const item of this.items) {
      if (doBoxesIntersect(item.bbox, queryBox)) {
        resultSet.add(item.element);
      }
    }

    if (this.children !== null) {
      for (const child of this.children) {
        child.query(queryBox, resultSet);
      }
    }
  }
}

/**
 * 2D Spatial Index using Quadtree partitioning.
 * Enables O(log N) viewport culling and spatial hit-testing for 10,000+ canvas strokes.
 */
export class SpatialIndex {
  private root: QuadNode | null = null;
  private elementsCount: number = 0;

  /**
   * Rebuilds the spatial index from an array of elements.
   * Computes the global bounds and partitions elements into the tree.
   */
  public buildIndex(elements: CanvasElement[]): void {
    this.elementsCount = elements.length;
    if (elements.length === 0) {
      this.root = null;
      return;
    }

    // Compute global bounding box across all elements
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const items: QuadItem[] = elements.map((element) => {
      const bbox = getElementBoundingBox(element);
      if (bbox.minX < minX) minX = bbox.minX;
      if (bbox.minY < minY) minY = bbox.minY;
      if (bbox.maxX > maxX) maxX = bbox.maxX;
      if (bbox.maxY > maxY) maxY = bbox.maxY;
      return { element, bbox };
    });

    // Provide a comfortable margin so root bounds don't collapse to 0
    const margin = 500;
    const globalBounds: BoundingBox = {
      minX: (minX === Infinity ? -1000 : minX) - margin,
      minY: (minY === Infinity ? -1000 : minY) - margin,
      maxX: (maxX === -Infinity ? 1000 : maxX) + margin,
      maxY: (maxY === -Infinity ? 1000 : maxY) + margin,
    };

    this.root = new QuadNode(globalBounds);
    for (const item of items) {
      this.root.insert(item);
    }
  }

  /**
   * Returns all elements whose bounding boxes intersect the visible viewport
   */
  public queryViewport(viewport: BoundingBox): CanvasElement[] {
    if (!this.root || this.elementsCount === 0) {
      return [];
    }

    const resultSet = new Set<CanvasElement>();
    this.root.query(viewport, resultSet);
    return Array.from(resultSet);
  }

  /**
   * Queries elements within a circular or square radius of a point (for eraser and select)
   */
  public queryPoint(x: number, y: number, radius: number): CanvasElement[] {
    return this.queryViewport({
      minX: x - radius,
      minY: y - radius,
      maxX: x + radius,
      maxY: y + radius,
    });
  }

  public size(): number {
    return this.elementsCount;
  }

  public clear(): void {
    this.root = null;
    this.elementsCount = 0;
  }
}
