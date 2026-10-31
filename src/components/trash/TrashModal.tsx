import React, { useState, useEffect, useCallback } from 'react';
import { X, Trash2, RotateCcw, Clock } from 'lucide-react';
import { useNoteStore } from '@/store/useNoteStore';
import {
  getTrashedNotes,
  restoreFromTrash,
  permanentlyDelete,
  emptyTrash,
  getDaysRemaining,
} from '@/core/trash/trashService';
import type { LectureNote } from '@/types/note';
import confetti from 'canvas-confetti';

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrashModal: React.FC<TrashModalProps> = ({ isOpen, onClose }) => {
  const { initialize } = useNoteStore();
  const [trashedNotes, setTrashedNotes] = useState<LectureNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reloadTrash = useCallback(async () => {
    setIsLoading(true);
    const list = await getTrashedNotes();
    setTrashedNotes(list);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;
    getTrashedNotes().then((list) => {
      if (!isCancelled) {
        setTrashedNotes(list);
        setIsLoading(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRestore = async (noteId: string) => {
    await restoreFromTrash(noteId);
    confetti({ particleCount: 25, spread: 45 });
    await reloadTrash();
    await initialize();
  };

  const handlePermanentDelete = async (noteId: string) => {
    if (window.confirm('Permanently delete this note? This action cannot be undone.')) {
      await permanentlyDelete(noteId);
      await reloadTrash();
      await initialize();
    }
  };

  const handleEmptyTrash = async () => {
    if (
      window.confirm(
        'Empty all items from Trash? All notes and drawings will be permanently erased.'
      )
    ) {
      await emptyTrash();
      await reloadTrash();
      await initialize();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Trash & Retention
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Notes are preserved for 30 days before being permanently removed
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar */}
        {trashedNotes.length > 0 && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              {trashedNotes.length} {trashedNotes.length === 1 ? 'note' : 'notes'} in trash
            </span>
            <button
              onClick={handleEmptyTrash}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold"
            >
              Empty Trash
            </button>
          </div>
        )}

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {isLoading && (
            <div className="text-center py-10 text-xs text-slate-400 animate-pulse">
              Checking trash records...
            </div>
          )}

          {!isLoading && trashedNotes.length === 0 && (
            <div className="text-center py-12 flex flex-col items-center gap-2 text-slate-400">
              <Trash2 className="w-8 h-8 stroke-1 text-slate-300 dark:text-slate-700" />
              <span className="text-xs">Your trash is empty.</span>
            </div>
          )}

          {trashedNotes.map((note) => {
            const daysLeft = note.deletedAt ? getDaysRemaining(note.deletedAt) : 30;
            return (
              <div
                key={note.id}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {note.title || 'Untitled Lecture Note'}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {note.subject || 'General'}
                    </span>
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                      <Clock className="w-3 h-3" />
                      {daysLeft} days remaining
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleRestore(note.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl text-xs font-semibold transition-colors"
                    title="Restore Note"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>

                  <button
                    onClick={() => handlePermanentDelete(note.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
