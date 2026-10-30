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
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Drag handler for resizer
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const newPercent = (currentX / rect.width) * 100;
      // Clamp between 20% and 80%
      setSplitPercent(Math.max(20, Math.min(80, newPercent)));
    },
    [isDragging]
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
    return (
      <div className="flex-1 w-full h-full overflow-hidden">
        {left}
      </div>
    );
  }

  // If in Canvas Only mode
  if (layoutMode === 'canvas-only') {
    return (
      <div className="flex-1 w-full h-full overflow-hidden">
        {right}
      </div>
    );
  }

  // Split Hybrid Mode
  return (
    <div
      ref={containerRef}
      className={`flex-1 flex flex-col md:flex-row w-full h-full overflow-hidden relative select-none ${
        isDragging ? 'cursor-col-resize select-none pointer-events-none' : ''
      }`}
    >
      {/* Left Pane (Lecture Editor) */}
      <div
        className="w-full md:h-full overflow-hidden transition-all duration-75 flex flex-col"
        style={{
          width: window.innerWidth >= 768 ? `${splitPercent}%` : '100%',
          height: window.innerWidth < 768 ? '50%' : '100%',
        }}
      >
        {left}
      </div>

      {/* Resizable Divider bar (Desktop only) */}
      <div
        onPointerDown={handlePointerDown}
        onDoubleClick={() => setSplitPercent(50)}
        title="Drag to resize panels (Double click to center 50/50)"
        className="hidden md:flex w-2 bg-slate-200/90 dark:bg-slate-800/90 hover:bg-blue-500 active:bg-blue-600 transition-colors cursor-col-resize items-center justify-center relative z-20 group"
      >
        <div className="w-1 h-8 rounded-full bg-slate-400 dark:bg-slate-500 group-hover:bg-white transition-colors" />
      </div>

      {/* Right Pane (Visual Canvas) */}
      <div
        className="w-full md:h-full overflow-hidden transition-all duration-75 flex flex-col relative"
        style={{
          width: window.innerWidth >= 768 ? `${100 - splitPercent}%` : '100%',
          height: window.innerWidth < 768 ? '50%' : '100%',
        }}
      >
        {right}
      </div>
    </div>
  );
};
