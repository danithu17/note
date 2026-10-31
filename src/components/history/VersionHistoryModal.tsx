import React, { useState, useEffect } from 'react';
import { X, History, RotateCcw, Clock, Check, Plus, Palette } from 'lucide-react';
import { useNoteStore } from '@/store/useNoteStore';
import {
  getVersionsForNote,
  restoreVersion,
  createVersionSnapshot,
} from '@/core/history/versionService';
import type { VersionRecord } from '@/types/note';
import confetti from 'canvas-confetti';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ isOpen, onClose }) => {
  const { getActiveNote } = useNoteStore();
  const activeNote = getActiveNote();

  const [versions, setVersions] = useState<VersionRecord[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<VersionRecord | null>(null);
  const [snapshotSummary, setSnapshotSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [restoredId, setRestoredId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && activeNote) {
      loadVersions();
    }
  }, [isOpen, activeNote?.id]);

  const loadVersions = async () => {
    if (!activeNote) return;
    setIsLoading(true);
    const list = await getVersionsForNote(activeNote.id);
    setVersions(list);
    if (list.length > 0) {
      setSelectedVersion(list[0]);
    }
    setIsLoading(false);
  };

  if (!isOpen || !activeNote) return null;

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNote) return;
    const snap = await createVersionSnapshot(activeNote, snapshotSummary.trim() || undefined);
    setSnapshotSummary('');
    await loadVersions();
    setSelectedVersion(snap);
  };

  const handleRestore = async (version: VersionRecord) => {
    if (
      window.confirm(
        `Restore revision from ${new Date(version.createdAt).toLocaleString()}? Current changes will be preserved as an auto-snapshot.`
      )
    ) {
      const restored = await restoreVersion(version.id);
      if (restored) {
        setRestoredId(version.id);
        confetti({ particleCount: 30, spread: 50 });
        setTimeout(() => {
          onClose();
          setRestoredId(null);
        }, 600);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Version History
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-sm">
                {activeNote.title}
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

        {/* Create Manual Snapshot Bar */}
        <form
          onSubmit={handleCreateSnapshot}
          className="p-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={snapshotSummary}
            onChange={(e) => setSnapshotSummary(e.target.value)}
            placeholder="Snapshot label (e.g. Before Exam 2, Added Dijkstra proof)..."
            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Save Snapshot</span>
          </button>
        </form>

        {/* Content Pane */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800">
          {/* Versions List */}
          <div className="overflow-y-auto p-3 flex flex-col gap-1.5 max-h-[50vh] sm:max-h-none">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1">
              Revision Timeline ({versions.length})
            </span>

            {isLoading && (
              <div className="text-center py-8 text-xs text-slate-400 animate-pulse">
                Loading revisions...
              </div>
            )}

            {!isLoading && versions.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                No previous snapshots recorded yet. Click "Save Snapshot" above to create one.
              </div>
            )}

            {versions.map((ver) => {
              const isSelected = selectedVersion?.id === ver.id;
              return (
                <div
                  key={ver.id}
                  onClick={() => setSelectedVersion(ver)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500/40 text-blue-900 dark:text-blue-100'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/60 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold truncate">
                      {ver.summary || 'Revision Snapshot'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(ver.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ver.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Palette className="w-3 h-3 text-emerald-500" />
                      {ver.canvasElements.length} drawings
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Version Preview */}
          <div className="p-4 flex flex-col justify-between overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
            {selectedVersion ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Snapshot Details
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(selectedVersion.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Title
                  </span>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {selectedVersion.title}
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs max-h-48 overflow-y-auto">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Markdown Excerpt
                  </span>
                  <pre className="font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {selectedVersion.markdown.substring(0, 300)}...
                  </pre>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>
                    Canvas Drawings: <strong>{selectedVersion.canvasElements.length}</strong>
                  </span>
                  <span>
                    Pages: <strong>{selectedVersion.pages?.length || 1}</strong>
                  </span>
                </div>

                <button
                  onClick={() => handleRestore(selectedVersion)}
                  className="mt-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {restoredId === selectedVersion.id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Restored Successfully!</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore This Version</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-slate-400">
                Select a revision from the left to view details and restore.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
