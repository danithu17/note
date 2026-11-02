import React, { useRef, useState, useEffect, useCallback } from 'react';
import { PenTool, RotateCcw, Trash2, Sparkles, Check, Download } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

export const InteractiveMiniCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#0071e3');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  const colors = [
    { label: 'Apple Blue', hex: '#0071e3' },
    { label: 'Graphite', hex: '#1d1d1f' },
    { label: 'Purple Accent', hex: '#8b5cf6' },
    { label: 'Emerald Green', hex: '#10b981' },
    { label: 'Coral Red', hex: '#ef4444' },
  ];

  // Resize canvas to match display DPI
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      redrawAll(ctx, strokes, currentStroke);
    }
  }, [strokes, currentStroke]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const redrawAll = (
    ctx: CanvasRenderingContext2D,
    allStrokes: Stroke[],
    active: Stroke | null
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    // Draw subtle grid dots
    ctx.fillStyle = 'rgba(100, 116, 139, 0.15)';
    const spacing = 28;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    for (let x = spacing; x < w; x += spacing) {
      for (let y = spacing; y < h; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const drawSingleStroke = (st: Stroke) => {
      if (st.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = st.color;
      ctx.lineWidth = st.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(st.points[0].x, st.points[0].y);
      for (let i = 1; i < st.points.length - 1; i++) {
        const xc = (st.points[i].x + st.points[i + 1].x) / 2;
        const yc = (st.points[i].y + st.points[i + 1].y) / 2;
        ctx.quadraticCurveTo(st.points[i].x, st.points[i].y, xc, yc);
      }
      ctx.lineTo(
        st.points[st.points.length - 1].x,
        st.points[st.points.length - 1].y
      );
      ctx.stroke();
    };

    allStrokes.forEach(drawSingleStroke);
    if (active) drawSingleStroke(active);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const pt = getCoordinates(e);
    if (!pt) return;
    setIsDrawing(true);
    setHasDrawn(true);
    const newStroke: Stroke = {
      points: [pt],
      color: currentColor,
      width: 3.5,
    };
    setCurrentStroke(newStroke);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentStroke) return;
    const pt = getCoordinates(e);
    if (!pt) return;

    const updatedStroke: Stroke = {
      ...currentStroke,
      points: [...currentStroke.points, pt],
    };
    setCurrentStroke(updatedStroke);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        redrawAll(ctx, strokes, updatedStroke);
      }
    }
  };

  const stopDrawing = () => {
    if (!isDrawing || !currentStroke) return;
    setIsDrawing(false);
    if (currentStroke.points.length > 1) {
      setStrokes((prev) => [...prev, currentStroke]);
    }
    setCurrentStroke(null);
  };

  const handleUndo = () => {
    setStrokes((prev) => {
      const next = prev.slice(0, -1);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) redrawAll(ctx, next, null);
      }
      return next;
    });
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke(null);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) redrawAll(ctx, [], null);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'scribblenote-sketch.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <section className="py-20 md:py-28 px-6 sm:px-12 bg-white dark:bg-[#0a0a0c] border-y border-slate-200/80 dark:border-white/5 relative overflow-hidden">
      <div className="max-w-[1240px] mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-[#0071e3] text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Live Demo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            Try it right here. Draw something.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-500 dark:text-slate-400">
            Experience our 60fps low-latency stroke smoothing. Sketch a diagram, circle an equation, or sign your name.
          </p>
        </div>

        {/* Canvas Frame */}
        <div className="relative rounded-[28px] overflow-hidden bg-slate-50/70 dark:bg-[#151518] border border-slate-200/90 dark:border-white/10 shadow-2xl shadow-blue-500/5">
          {/* Canvas Floating Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#1a1a1e]/80 backdrop-blur-md">
            {/* Color Palette */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">
                Ink Color:
              </span>
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 p-1 rounded-full">
                {colors.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    aria-label={c.label}
                    onClick={() => setCurrentColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-6 h-6 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                      currentColor === c.hex
                        ? 'ring-2 ring-offset-2 ring-blue-500 scale-110 shadow-sm'
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                  >
                    {currentColor === c.hex && (
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUndo}
                disabled={strokes.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={strokes.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={strokes.length === 0}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save Sketch</span>
              </button>
            </div>
          </div>

          {/* Drawing Area */}
          <div
            ref={containerRef}
            className="relative w-full h-[380px] sm:h-[460px] cursor-crosshair touch-none select-none"
          >
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="absolute inset-0 w-full h-full block"
            />

            {/* Prompt Overlay when empty */}
            {!hasDrawn && strokes.length === 0 && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-[#0071e3]">
                  <PenTool className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="text-center px-4">
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Your canvas is ready. Click and drag or touch to draw.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try drawing an arrow, a triangle, or writing a formula
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Status Pill */}
            <div className="absolute bottom-4 left-4 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md border border-slate-200/60 dark:border-white/10 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                60 FPS Vector Smooth Engine • Pressure & Tilt Aware
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
