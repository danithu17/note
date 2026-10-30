import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Point, StrokeElement, ShapeElement } from '../../types/note';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useNoteStore } from '../../store/useNoteStore';
import { drawFreehandStroke, drawShape, elementIntersectsPoint } from '../../utils/stroke';
import { exportCanvasToSvg } from '../../utils/export';
import { sound } from '../../utils/sound';
import { GridOverlay } from './GridOverlay';
import { CanvasToolbar } from './CanvasToolbar';
import { CanvasControls } from './CanvasControls';
import confetti from 'canvas-confetti';

interface LaserPoint {
  x: number;
  y: number;
  time: number;
}

export const VisualCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    tool,
    setTool,
    shape,
    setShape,
    color,
    strokeWidth,
    increaseStrokeWidth,
    decreaseStrokeWidth,
    highlighterColor,
    gridType,
    cycleGridType,
    palmRejection,
    zoom,
    pan,
    setZoom,
    setPan,
    isDarkMode,
    toggleDarkMode,
    cycleLayoutMode,
    toggleSidebar,
    toggleCommandPalette,
    toggleShortcutsModal,
    toggleFullscreen,
    undoStack,
    redoStack,
    pushHistory,
    undo,
    redo,
  } = useCanvasStore();

  const { getActiveNote, updateCanvasElements, updateMarkdown } = useNoteStore();
  const activeNote = getActiveNote();
  const elements = activeNote?.canvasElements || [];

  // In-progress drawing state
  const isDrawingRef = useRef(false);
  const isPanningRef = useRef(false);
  const lastPanPointRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const activePointsRef = useRef<Point[]>([]);
  const activeShapeStartRef = useRef<{ x: number; y: number } | null>(null);
  const [currentShapePreview, setCurrentShapePreview] = useState<ShapeElement | null>(null);

  // Laser Pointer trail state
  const laserTrailRef = useRef<LaserPoint[]>([]);

  // Multi-touch tracking for pinch-zoom and two-finger pan
  const touchPointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const initialPinchDistRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(zoom);

  // Convert client viewport coordinates to Canvas World coordinates
  const screenToWorld = useCallback(
    (screenX: number, screenY: number): { x: number; y: number } => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: screenX, y: screenY };

      const canvasX = screenX - rect.left;
      const canvasY = screenY - rect.top;

      return {
        x: (canvasX - pan.x) / zoom,
        y: (canvasY - pan.y) / zoom,
      };
    },
    [pan.x, pan.y, zoom]
  );

  // Redraw all elements on canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Apply zoom and pan transformation
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // 1. Draw all saved elements
    for (const el of elements) {
      if (el.type === 'stroke') {
        drawFreehandStroke(
          ctx,
          el.points,
          el.color,
          el.size,
          el.opacity ?? 1,
          el.tool === 'highlighter'
        );
      } else if (el.type === 'shape') {
        drawShape(ctx, el);
      }
    }

    // 2. Draw current in-progress freehand stroke
    if (activePointsRef.current.length > 0 && (tool === 'pen' || tool === 'highlighter')) {
      const isHighlighter = tool === 'highlighter';
      drawFreehandStroke(
        ctx,
        activePointsRef.current,
        isHighlighter ? highlighterColor : color,
        strokeWidth,
        isHighlighter ? 0.35 : 1,
        isHighlighter
      );
    }

    // 3. Draw current in-progress shape preview
    if (currentShapePreview) {
      drawShape(ctx, currentShapePreview);
    }

    // 4. Draw temporary glowing Laser Pointer trail
    const now = Date.now();
    const activeLaser = laserTrailRef.current.filter((p) => now - p.time < 1200);
    laserTrailRef.current = activeLaser;

    if (activeLaser.length > 1) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#10b981';

      for (let i = 1; i < activeLaser.length; i++) {
        const p1 = activeLaser[i - 1];
        const p2 = activeLaser[i];
        const age = now - p2.time;
        const alpha = Math.max(0, 1 - age / 1200);

        ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
        ctx.lineWidth = Math.max(3, (strokeWidth * 2) * alpha);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  }, [elements, pan.x, pan.y, zoom, tool, color, strokeWidth, highlighterColor, currentShapePreview]);

  // Laser Pointer Animation Loop
  useEffect(() => {
    let animId: number;
    const animate = () => {
      if (laserTrailRef.current.length > 0) {
        renderCanvas();
      }
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [renderCanvas]);

  // Handle Resize and DPR
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      renderCanvas();
    };

    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [renderCanvas]);

  // Trigger render when elements, zoom, pan, or previews change
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Handle Undo
  const handleUndo = () => {
    const prev = undo(elements);
    if (prev) {
      updateCanvasElements(prev);
    }
  };

  // Handle Redo
  const handleRedo = () => {
    const next = redo(elements);
    if (next) {
      updateCanvasElements(next);
    }
  };

  // Handle Clear
  const handleClear = () => {
    if (elements.length === 0) return;
    if (window.confirm('Clear all drawings and diagrams on this page?')) {
      pushHistory(elements);
      updateCanvasElements([]);
      sound.whoosh();
    }
  };

  // POINTER DOWN
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Add touch pointer to map
    if (e.pointerType === 'touch') {
      touchPointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // If 2 touches active, initiate pinch / two-finger pan
      if (touchPointersRef.current.size >= 2) {
        isDrawingRef.current = false;
        activePointsRef.current = [];
        setCurrentShapePreview(null);

        const pts = Array.from(touchPointersRef.current.values());
        initialPinchDistRef.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        initialZoomRef.current = zoom;
        lastPanPointRef.current = {
          x: (pts[0].x + pts[1].x) / 2,
          y: (pts[0].y + pts[1].y) / 2,
        };
        return;
      }

      // If Palm Rejection is ON and pointer is touch (finger/palm instead of stylus pen):
      if (palmRejection) {
        isPanningRef.current = true;
        lastPanPointRef.current = { x: e.clientX, y: e.clientY };
        return;
      }
    }

    // Space or Middle mouse click -> Pan
    if (e.button === 1 || e.buttons === 4 || e.shiftKey) {
      isPanningRef.current = true;
      lastPanPointRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (e.button !== 0) return; // Only primary button

    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    const world = screenToWorld(e.clientX, e.clientY);
    const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;

    isDrawingRef.current = true;

    if (tool === 'pen' || tool === 'highlighter') {
      activePointsRef.current = [{ x: world.x, y: world.y, pressure }];
      renderCanvas();
    } else if (tool === 'laser') {
      sound.laser();
      laserTrailRef.current.push({ x: world.x, y: world.y, time: Date.now() });
      renderCanvas();
    } else if (tool === 'shape') {
      activeShapeStartRef.current = { x: world.x, y: world.y };
      setCurrentShapePreview({
        id: 'preview',
        type: 'shape',
        shape,
        startX: world.x,
        startY: world.y,
        endX: world.x,
        endY: world.y,
        color,
        strokeWidth,
        timestamp: Date.now(),
      });
    } else if (tool === 'eraser') {
      handleEraser(world.x, world.y);
    }
  };

  // POINTER MOVE
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Multi-touch gestures (pinch-zoom and 2-finger pan)
    if (e.pointerType === 'touch' && touchPointersRef.current.size >= 2) {
      touchPointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const pts = Array.from(touchPointersRef.current.values());

      // 1. Pinch zoom
      if (initialPinchDistRef.current && pts.length >= 2) {
        const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const scaleFactor = currentDist / initialPinchDistRef.current;
        setZoom(Math.max(0.1, Math.min(5, initialZoomRef.current * scaleFactor)));
      }

      // 2. Two-finger Pan
      const midX = (pts[0].x + pts[1].x) / 2;
      const midY = (pts[0].y + pts[1].y) / 2;
      const dx = midX - lastPanPointRef.current.x;
      const dy = midY - lastPanPointRef.current.y;
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      lastPanPointRef.current = { x: midX, y: midY };
      return;
    }

    // Panning
    if (isPanningRef.current) {
      const dx = e.clientX - lastPanPointRef.current.x;
      const dy = e.clientY - lastPanPointRef.current.y;
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      lastPanPointRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (!isDrawingRef.current) return;

    const world = screenToWorld(e.clientX, e.clientY);
    const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;

    if (tool === 'pen' || tool === 'highlighter') {
      activePointsRef.current.push({ x: world.x, y: world.y, pressure });
      renderCanvas();
    } else if (tool === 'laser') {
      laserTrailRef.current.push({ x: world.x, y: world.y, time: Date.now() });
      renderCanvas();
    } else if (tool === 'shape' && activeShapeStartRef.current) {
      setCurrentShapePreview({
        id: 'preview',
        type: 'shape',
        shape,
        startX: activeShapeStartRef.current.x,
        startY: activeShapeStartRef.current.y,
        endX: world.x,
        endY: world.y,
        color,
        strokeWidth,
        timestamp: Date.now(),
      });
      renderCanvas();
    } else if (tool === 'eraser') {
      handleEraser(world.x, world.y);
    }
  };

  // Eraser execution
  const handleEraser = (worldX: number, worldY: number) => {
    const eraserRadius = (strokeWidth * 4) / zoom;
    const remaining = elements.filter(
      (el) => !elementIntersectsPoint(el, worldX, worldY, eraserRadius)
    );

    if (remaining.length !== elements.length) {
      pushHistory(elements);
      updateCanvasElements(remaining);
      sound.click();
    }
  };

  // POINTER UP
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'touch') {
      touchPointersRef.current.delete(e.pointerId);
      if (touchPointersRef.current.size < 2) {
        initialPinchDistRef.current = null;
      }
    }

    if (isPanningRef.current) {
      isPanningRef.current = false;
      return;
    }

    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if ((tool === 'pen' || tool === 'highlighter') && activePointsRef.current.length > 0) {
      const isHighlighter = tool === 'highlighter';
      const newStroke: StrokeElement = {
        id: 'stroke_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        type: 'stroke',
        tool,
        points: [...activePointsRef.current],
        color: isHighlighter ? highlighterColor : color,
        size: strokeWidth,
        opacity: isHighlighter ? 0.35 : 1,
        timestamp: Date.now(),
      };

      pushHistory(elements);
      updateCanvasElements([...elements, newStroke]);
      activePointsRef.current = [];
    } else if (tool === 'shape' && currentShapePreview && activeShapeStartRef.current) {
      const dist = Math.hypot(
        currentShapePreview.endX - currentShapePreview.startX,
        currentShapePreview.endY - currentShapePreview.startY
      );

      if (dist > 5) {
        const finalShape: ShapeElement = {
          ...currentShapePreview,
          id: 'shape_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        };
        pushHistory(elements);
        updateCanvasElements([...elements, finalShape]);
        sound.pop();
      }

      setCurrentShapePreview(null);
      activeShapeStartRef.current = null;
    }

    renderCanvas();
  };

  // Wheel Zoom & Pan
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const nextZoom = Math.max(0.1, Math.min(5, zoom * zoomFactor));

      const newPanX = mouseX - (mouseX - pan.x) * (nextZoom / zoom);
      const newPanY = mouseY - (mouseY - pan.y) * (nextZoom / zoom);

      setZoom(nextZoom);
      setPan({ x: newPanX, y: newPanY });
    } else {
      setPan((p) => ({
        x: p.x - e.deltaX,
        y: p.y - e.deltaY,
      }));
    }
  };

  // Comprehensive Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in textarea / input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        // Special case: Ctrl+Enter snapshots canvas even when in textarea!
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          if (activeNote && elements.length > 0) {
            const svg = exportCanvasToSvg(elements, 800, 500, false, isDarkMode);
            const base64Svg = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
            updateMarkdown(activeNote.markdown + `\n\n![Lecture Sketch](${base64Svg})\n`);
            confetti({ particleCount: 30, spread: 50 });
            sound.pop();
          }
        }
        return;
      }

      // Global Command Palette: Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      // Help shortcuts: '?'
      if (e.key === '?' || (e.key === '/' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        toggleShortcutsModal();
        return;
      }

      // Cycle Views: Tab
      if (e.key === 'Tab') {
        e.preventDefault();
        cycleLayoutMode();
        return;
      }

      // Stroke size adjustments: [ or ]
      if (e.key === '[') {
        e.preventDefault();
        decreaseStrokeWidth();
        return;
      }
      if (e.key === ']') {
        e.preventDefault();
        increaseStrokeWidth();
        return;
      }

      // Grid cycler: 'g' or 'G'
      if (e.key.toLowerCase() === 'g') {
        e.preventDefault();
        cycleGridType();
        return;
      }

      // Toggle Sidebar: 'b' or 'B'
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // Toggle Dark theme: 'd' or 'D'
      if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleDarkMode();
        return;
      }

      // Toggle Fullscreen: 'f' or 'F'
      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      // Numeric tool selectors: 1=Pen, 2=Highlighter, 3=Eraser, 4=Shapes, 5=Laser
      if (e.key === '1' || e.key.toLowerCase() === 'p') {
        setTool('pen');
      } else if (e.key === '2' || e.key.toLowerCase() === 'h') {
        setTool('highlighter');
      } else if (e.key === '3' || e.key.toLowerCase() === 'e') {
        setTool('eraser');
      } else if (e.key === '4' || e.key.toLowerCase() === 's') {
        setTool('shape');
      } else if (e.key === '5' || e.key.toLowerCase() === 'l') {
        setTool('laser');
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }

      // Reset Zoom: Ctrl+0
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        useCanvasStore.getState().resetView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    elements,
    undoStack,
    redoStack,
    activeNote,
    isDarkMode,
    setTool,
    setShape,
    cycleGridType,
    cycleLayoutMode,
    toggleSidebar,
    toggleDarkMode,
    toggleFullscreen,
    toggleCommandPalette,
    toggleShortcutsModal,
    increaseStrokeWidth,
    decreaseStrokeWidth,
    updateMarkdown,
  ]);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className="relative w-full h-full overflow-hidden select-none touch-none bg-slate-100 dark:bg-slate-950"
    >
      {/* Background Paper Grid Overlay */}
      <GridOverlay
        gridType={activeNote?.gridType || gridType}
        zoom={zoom}
        pan={pan}
        isDarkMode={isDarkMode}
      />

      {/* Main Interactive Drawing Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`absolute inset-0 block w-full h-full touch-none ${
          tool === 'eraser'
            ? 'cursor-cell'
            : tool === 'pen' || tool === 'highlighter' || tool === 'laser'
            ? 'cursor-crosshair'
            : 'cursor-default'
        }`}
      />

      {/* Floating Canvas Controls (Zoom, Palm Rejection, Clear) */}
      <CanvasControls onClear={handleClear} hasElements={elements.length > 0} />

      {/* Floating Bottom Toolbar (Pen, Highlighter, Eraser, Shapes, Laser, Colors, Stroke Width) */}
      <CanvasToolbar
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
      />
    </div>
  );
};
