import React, { useState, useRef } from 'react';
import { X, FileUp, Presentation, Loader2 } from 'lucide-react';
import { renderPdfFileToPages } from '../pdfService';
import { useNoteStore } from '@/store/useNoteStore';
import type { NotePage } from '@/types/note';
import { ModalPortal } from '@/components/ui/ModalPortal';
import confetti from 'canvas-confetti';

interface PdfImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PdfImportModal: React.FC<PdfImportModalProps> = ({ isOpen, onClose }) => {
  const { getActiveNote, updateCanvasElements } = useNoteStore();
  const activeNote = getActiveNote();

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen || !activeNote) return null;

  const handleFileSelect = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please select a valid .pdf lecture document or slide deck.');
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: 0 });

    try {
      const renderedSlides = await renderPdfFileToPages(file, (current, total) => {
        setProgress({ current, total });
      });

      if (renderedSlides.length === 0) {
        alert('Could not render any pages from this PDF.');
        return;
      }

      // Convert each slide into an individual canvas NotePage
      const newPages: NotePage[] = renderedSlides.map((slide, idx) => ({
        id: `p_${activeNote.id}_pdf_${slide.pageNumber}_${Date.now().toString(36)}`,
        pageIndex: idx,
        backgroundImage: slide.dataUrl,
        backgroundType: 'pdf',
        pdfPageNumber: slide.pageNumber,
        originalWidth: slide.width,
        originalHeight: slide.height,
        elements: [],
        gridType: 'blank',
      }));

      // Update active note in store and database
      const updatedNote = {
        ...activeNote,
        pages: newPages,
        activePageIndex: 0,
        canvasElements: [],
        updatedAt: Date.now(),
      };

      useNoteStore.setState((state) => ({
        notes: state.notes.map((n) => (n.id === updatedNote.id ? updatedNote : n)),
      }));

      // Trigger re-render
      await updateCanvasElements([]);

      confetti({ particleCount: 40, spread: 60 });
      onClose();
    } catch (err: any) {
      console.error('PDF parsing error:', err);
      alert('Failed to process PDF: ' + (err.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <ModalPortal>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Presentation className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Import Lecture Slides (PDF)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Renders slides as canvas backgrounds with vector drawing layers
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        {/* Upload Dropzone */}
        <div className="p-6 flex flex-col gap-4 text-xs">
          {isProcessing ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <div className="flex flex-col gap-1">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Processing Lecture Slides...
                </span>
                <span className="text-[11px] text-slate-400">
                  {progress.total > 0
                    ? `Rendering slide ${progress.current} of ${progress.total}`
                    : 'Reading PDF document structure...'}
                </span>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <FileUp className="w-6 h-6" />
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Click or drag lecture slides here
                </span>
                <span className="text-[11px] text-slate-400">
                  Supports PDF lecture decks and PowerPoint exported as PDF
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>
          )}

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700 text-[11px] text-slate-500 leading-relaxed">
            💡 <strong>Vector Separation:</strong> Slides are saved as background layers. You can draw, highlight, annotate with Apple Pencil or mouse, and export clean annotated PDFs at any time.
          </div>
        </div>
      </div>
    </div>
  </ModalPortal>
  );
};
