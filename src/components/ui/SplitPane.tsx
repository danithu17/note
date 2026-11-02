import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export const SplitPane: React.FC<SplitPaneProps> = ({ left, right }) => {
  const { layoutMode } = useCanvasStore();
  const [splitPercent, setSplitPercent] = useState<number>(45); // Left width %
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [mobileActivePane, setMobileActivePane] = useState<'notes' | 'canvas'>('canvas');
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Drag handler for resizer
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (isMobile) {
        const currentY = e.clientY - rect.top;
        const newPercent = (currentY / rect.height) * 100;
        setSplitPercent(Math.max(20, Math.min(80, newPercent)));
      } else {
        const currentX = e.clientX - rect.left;
        const newPercent = (currentX / rect.width) * 100;
        setSplitPercent(Math.max(20, Math.min(80, newPercent)));
      }
    },
    [isDragging, isMobile]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // If in Notes Only mode
  if (layoutMode === 'notes-only') {
    return <div className="flex-1 w-full h-full overflow-hidden">{left}</div>;
  }

  // If in Canvas Only mode
  if (layoutMode === 'canvas-only') {
    return <div className="flex-1 w-full h-full overflow-hidden">{right}</div>;
  }

  // If on mobile and in Split mode: adaptive full screen with segment switcher
  if (isMobile) {
    return (
      <div className="flex-1 w-full h-full overflow-hidden flex flex-col relative">
        <div className="flex justify-center p-1.5 bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 shrink-0 z-20">
          <div className="inline-flex items-center bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setMobileActivePane('notes')}
              className={`px-3 py-1 rounded-lg transition-all ${
                mobileActivePane === 'notes'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              📝 Notes
            </button>
            <button
              onClick={() => setMobileActivePane('canvas')}
              className={`px-3 py-1 rounded-lg transition-all ${
                mobileActivePane === 'canvas'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              🎨 Canvas
            </button>
          </div>
        </div>

        <div className="flex-1 w-full h-full overflow-hidden relative">
          {mobileActivePane === 'notes' ? left : right}
        </div>
      </div>
    );
  }

  // Split Hybrid Mode (Desktop >= 768px)
  return (
    <div
      ref={containerRef}
      className={`flex-1 flex flex-col md:flex-row w-full h-full overflow-hidden relative select-none ${
        isDragging
          ? isMobile
            ? 'cursor-row-resize select-none pointer-events-none'
            : 'cursor-col-resize select-none pointer-events-none'
          : ''
      }`}
    >
      {/* Left Pane (Lecture Editor) */}
      <div
        className="w-full md:h-full overflow-hidden transition-all duration-75 flex flex-col"
        style={{
          width: !isMobile ? `${splitPercent}%` : '100%',
          height: isMobile ? `${splitPercent}%` : '100%',
        }}
      >
        {left}
      </div>

      {/* Resizable Divider bar (Adaptive Horizontal/Vertical) */}
      <div
        onPointerDown={handlePointerDown}
        onDoubleClick={() => setSplitPercent(50)}
        title="Drag to resize panels (Double click to center 50/50)"
        className="flex w-full h-2 md:w-2 md:h-full bg-slate-200/90 dark:bg-slate-800/90 hover:bg-blue-500 active:bg-blue-600 transition-colors cursor-row-resize md:cursor-col-resize items-center justify-center relative z-20 group shrink-0"
      >
        <div className="w-8 h-1 md:w-1 md:h-8 rounded-full bg-slate-400 dark:bg-slate-500 group-hover:bg-white transition-colors" />
      </div>

      {/* Right Pane (Visual Canvas) */}
      <div
        className="w-full md:h-full overflow-hidden transition-all duration-75 flex flex-col relative"
        style={{
          width: !isMobile ? `${100 - splitPercent}%` : '100%',
          height: isMobile ? `${100 - splitPercent}%` : '100%',
        }}
      >
        {right}
      </div>
    </div>
  );
};
