import { getStroke } from 'perfect-freehand';
import type { CanvasElement, LectureNote } from '../types/note';
import { getSvgPathFromStroke } from './stroke';

/**
 * Generates an SVG string representation of all canvas elements
 */
export function exportCanvasToSvg(
  elements: CanvasElement[],
  width: number = 1920,
  height: number = 1080,
  includeBackground: boolean = true,
  isDark: boolean = false
): string {
  const bgFill = includeBackground ? (isDark ? '#0f172a' : '#ffffff') : 'none';

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`;
  svgContent += `  <rect width="100%" height="100%" fill="${bgFill}"/>\n`;

  for (const el of elements) {
    if (el.type === 'stroke') {
      const isHighlighter = el.tool === 'highlighter';
      const strokeOptions = {
        size: isHighlighter ? el.size * 2.2 : el.size,
        thinning: isHighlighter ? 0.05 : 0.6,
        smoothing: 0.65,
        streamline: 0.6,
      };
      const outline = getStroke(
        el.points.map((p) => [p.x, p.y, p.pressure ?? 0.5]),
        strokeOptions
      );
      const pathData = getSvgPathFromStroke(outline);
      const opacity = el.opacity ?? (isHighlighter ? 0.35 : 1);
      const blend = isHighlighter ? 'style="mix-blend-mode: multiply;"' : '';

      svgContent += `  <path d="${pathData}" fill="${el.color}" opacity="${opacity}" ${blend}/>\n`;
    } else if (el.type === 'shape') {
      const { startX, startY, endX, endY, shape, color, strokeWidth, fillColor } = el;
      const w = endX - startX;
      const h = endY - startY;

      switch (shape) {
        case 'rectangle':
          svgContent += `  <rect x="${Math.min(startX, endX)}" y="${Math.min(startY, endY)}" width="${Math.abs(w)}" height="${Math.abs(h)}" stroke="${color}" stroke-width="${strokeWidth}" fill="${fillColor || 'none'}" rx="4" />\n`;
          break;

        case 'circle': {
          const cx = startX + w / 2;
          const cy = startY + h / 2;
          const rx = Math.abs(w) / 2;
          const ry = Math.abs(h) / 2;
          svgContent += `  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" stroke="${color}" stroke-width="${strokeWidth}" fill="${fillColor || 'none'}" />\n`;
          break;
        }

        case 'line':
          svgContent += `  <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" />\n`;
          break;

        case 'arrow': {
          const headLength = Math.max(14, strokeWidth * 3.5);
          const angle = Math.atan2(endY - startY, endX - startX);
          const x1 = endX - headLength * Math.cos(angle - Math.PI / 6);
          const y1 = endY - headLength * Math.sin(angle - Math.PI / 6);
          const x2 = endX - headLength * Math.cos(angle + Math.PI / 6);
          const y2 = endY - headLength * Math.sin(angle + Math.PI / 6);

          svgContent += `  <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" />\n`;
          svgContent += `  <polygon points="${endX},${endY} ${x1},${y1} ${x2},${y2}" fill="${color}" />\n`;
          break;
        }

        case 'diamond': {
          const midX = startX + w / 2;
          const midY = startY + h / 2;
          svgContent += `  <polygon points="${midX},${startY} ${endX},${midY} ${midX},${endY} ${startX},${midY}" stroke="${color}" stroke-width="${strokeWidth}" fill="${fillColor || 'none'}" />\n`;
          break;
        }

        case 'flowchart-node':
          svgContent += `  <rect x="${Math.min(startX, endX)}" y="${Math.min(startY, endY)}" width="${Math.abs(w)}" height="${Math.abs(h)}" rx="10" stroke="${color}" stroke-width="${strokeWidth}" fill="${fillColor || 'none'}" />\n`;
          break;
      }
    }
  }

  svgContent += `</svg>`;
  return svgContent;
}

/**
 * Downloads a string or blob as a file in the browser
 */
export function triggerDownload(content: string | Blob, filename: string, mimeType: string) {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Exports current canvas drawing to PNG
 */
export function exportCanvasToPng(canvas: HTMLCanvasElement, filename: string = 'scribble-drawing.png') {
  canvas.toBlob((blob) => {
    if (blob) {
      triggerDownload(blob, filename, 'image/png');
    }
  }, 'image/png');
}

/**
 * Copies the current canvas snapshot directly to clipboard
 */
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          resolve(true);
        } catch {
          resolve(false);
        }
      });
    });
  } catch {
    return false;
  }
}

/**
 * Exports the entire Lecture Note as a portable JSON document
 */
export function exportNoteAsJson(note: LectureNote) {
  const json = JSON.stringify(note, null, 2);
  const sanitizedTitle = note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  triggerDownload(json, `${sanitizedTitle || 'lecture-note'}.scribble.json`, 'application/json');
}

/**
 * Exports the Note as Markdown with embedded SVG visual diagram
 */
export function exportNoteAsMarkdownBundle(note: LectureNote) {
  const svg = exportCanvasToSvg(note.canvasElements, 1200, 800, false);
  const base64Svg = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  const bundle = `---
title: "${note.title}"
subject: "${note.subject}"
tags: [${note.tags.map((t) => `"${t}"`).join(', ')}]
date: "${new Date(note.updatedAt).toISOString()}"
---

${note.markdown}

---

## 🎨 Visual Lecture Drawing & Diagram
![Scribble Diagram](${base64Svg})
`;

  const sanitizedTitle = note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  triggerDownload(bundle, `${sanitizedTitle || 'lecture-note'}.md`, 'text/markdown');
}
