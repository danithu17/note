import React from 'react';
import type { GridType } from '../../types/note';

interface GridOverlayProps {
  gridType: GridType;
  zoom: number;
  pan: { x: number; y: number };
  isDarkMode: boolean;
}

export const GridOverlay: React.FC<GridOverlayProps> = ({ gridType, zoom, pan, isDarkMode }) => {
  if (gridType === 'blank') {
    return (
      <div
        className={`absolute inset-0 pointer-events-none transition-colors duration-200 ${
          isDarkMode ? 'bg-slate-950' : 'bg-[#fafafa]'
        }`}
      />
    );
  }

  const dotColor = isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.14)';
  const lineColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.09)';
  const marginLineColor = isDarkMode ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.35)';

  const baseSpacing = 28;
  const scaledSpacing = baseSpacing * zoom;
  const offsetX = ((pan.x % scaledSpacing) + scaledSpacing) % scaledSpacing;
  const offsetY = ((pan.y % scaledSpacing) + scaledSpacing) % scaledSpacing;

  let backgroundStyle: React.CSSProperties = {};

  if (gridType === 'dots') {
    backgroundStyle = {
      backgroundImage: `radial-gradient(${dotColor} 1.5px, transparent 1.5px)`,
      backgroundSize: `${scaledSpacing}px ${scaledSpacing}px`,
      backgroundPosition: `${offsetX}px ${offsetY}px`,
    };
  } else if (gridType === 'ruled') {
    backgroundStyle = {
      backgroundImage: `linear-gradient(${lineColor} 1px, transparent 1px)`,
      backgroundSize: `100% ${scaledSpacing}px`,
      backgroundPosition: `0px ${offsetY}px`,
    };
  } else if (gridType === 'grid') {
    backgroundStyle = {
      backgroundImage: `
        linear-gradient(to right, ${lineColor} 1px, transparent 1px),
        linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)
      `,
      backgroundSize: `${scaledSpacing}px ${scaledSpacing}px`,
      backgroundPosition: `${offsetX}px ${offsetY}px`,
    };
  } else if (gridType === 'isometric') {
    // 30-degree isometric grid using repeating linear gradients
    backgroundStyle = {
      backgroundImage: `
        linear-gradient(30deg, ${lineColor} 1px, transparent 1px),
        linear-gradient(-30deg, ${lineColor} 1px, transparent 1px),
        linear-gradient(90deg, ${lineColor} 1px, transparent 1px)
      `,
      backgroundSize: `${scaledSpacing * 1.732}px ${scaledSpacing}px`,
      backgroundPosition: `${offsetX}px ${offsetY}px`,
    };
  }

  return (
    <div
      className={`absolute inset-0 pointer-events-none transition-colors duration-200 ${
        isDarkMode ? 'bg-slate-950' : 'bg-[#fcfbf9]'
      }`}
      style={backgroundStyle}
    >
      {/* Red margin for ruled paper */}
      {gridType === 'ruled' && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: `${Math.max(60, 80 * zoom + pan.x)}px`,
            width: '2px',
            backgroundColor: marginLineColor,
          }}
        />
      )}
    </div>
  );
};
