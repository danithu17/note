import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import type { LectureNote } from '@/types/note';
import { drawFreehandStroke, drawShape } from '@/utils/stroke';
import { triggerDownload } from '@/utils/export';

// Configure PDF.js worker
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export interface RenderedPdfPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

export async function renderPdfFileToPages(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<RenderedPdfPage[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;
  const renderedPages: RenderedPdfPage[] = [];

  for (let i = 1; i <= totalPages; i++) {
    onProgress?.(i, totalPages);
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 }); // 1.5x crisp lecture slide resolution

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      await page.render({
        canvasContext: ctx,
        viewport,
        canvas,
      } as any).promise;

      // JPEG compression keeps storage footprint minimal (~120KB per slide)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      renderedPages.push({
        pageNumber: i,
        dataUrl,
        width: viewport.width,
        height: viewport.height,
      });
    }
  }

  return renderedPages;
}

export async function exportAnnotatedPdfDocument(note: LectureNote): Promise<void> {
  const pages = note.pages && note.pages.length > 0
    ? note.pages
    : [{ id: `p_${note.id}_0`, pageIndex: 0, elements: note.canvasElements || [] }];

  const pdfDoc = await PDFDocument.create();

  for (const page of pages) {
    const pageWidth = page.originalWidth || 1280;
    const pageHeight = page.originalHeight || 720;
    const pdfPage = pdfDoc.addPage([pageWidth, pageHeight]);

    // 1. Embed background slide image if present
    if (page.backgroundImage) {
      try {
        const isPng = page.backgroundImage.startsWith('data:image/png');
        const imageBytes = await fetch(page.backgroundImage).then((res) => res.arrayBuffer());
        const embeddedBg = isPng
          ? await pdfDoc.embedPng(imageBytes)
          : await pdfDoc.embedJpg(imageBytes);

        pdfPage.drawImage(embeddedBg, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
        });
      } catch (err) {
        console.warn('Failed to embed background slide image:', err);
      }
    }

    // 2. Render vector drawing layer to an offscreen transparent canvas and composite
    if (page.elements && page.elements.length > 0) {
      try {
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = pageWidth;
        offscreenCanvas.height = pageHeight;
        const ctx = offscreenCanvas.getContext('2d');

        if (ctx) {
          ctx.clearRect(0, 0, pageWidth, pageHeight);

          for (const el of page.elements) {
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
            } else if (el.type === 'text') {
              ctx.font = `${el.fontSize || 16}px sans-serif`;
              ctx.fillStyle = el.color || '#000000';
              ctx.fillText(el.text, el.x, el.y);
            } else if (el.type === 'sticky') {
              ctx.fillStyle = el.color || '#fef08a';
              ctx.fillRect(el.x, el.y, el.width, el.height);
              ctx.strokeStyle = '#ca8a04';
              ctx.lineWidth = 1;
              ctx.strokeRect(el.x, el.y, el.width, el.height);
              ctx.fillStyle = '#0f172a';
              ctx.font = '13px sans-serif';
              ctx.fillText(el.text, el.x + 8, el.y + 20);
            }
          }

          const overlayDataUrl = offscreenCanvas.toDataURL('image/png');
          const overlayBytes = await fetch(overlayDataUrl).then((res) => res.arrayBuffer());
          const embeddedOverlay = await pdfDoc.embedPng(overlayBytes);

          pdfPage.drawImage(embeddedOverlay, {
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight,
          });
        }
      } catch (err) {
        console.warn('Failed to render vector annotations to PDF:', err);
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  const safeTitle = (note.title || 'annotated_lecture').replace(/[^a-zA-Z0-9_-]/g, '_');
  triggerDownload(blob, `${safeTitle}_annotated.pdf`, 'application/pdf');
}
