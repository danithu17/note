import React, { useState } from 'react';
import {
  MessageSquare,
  Calendar,
  Send,
  Plus,
  Volume2,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useNoteStore } from '@/store/useNoteStore';
import { useCanvasStore } from '@/store/useCanvasStore';
import { exportCanvasToSvg } from '@/utils/export';
import { sound } from '@/utils/sound';
import confetti from 'canvas-confetti';

export const ChatTimelineView: React.FC = () => {
  const { notes, selectNote, createNote } = useNoteStore();
  const { setLayoutMode, isDarkMode } = useCanvasStore();

  const [inputTitle, setInputTitle] = useState('');
  const [inputSubject, setInputSubject] = useState('Computer Science');

  // Sort notes chronologically (newest at bottom like a chat thread)
  const sortedNotes = [...notes].sort((a, b) => a.createdAt - b.createdAt);

  const handleQuickSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTitle.trim()) return;

    const newId = await createNote(inputSubject);
    useNoteStore.getState().updateTitle(inputTitle.trim());
    selectNote(newId);
    setInputTitle('');
    sound.pop();
    confetti({ particleCount: 25, spread: 50 });

    // Open in Split Note + Board mode
    setLayoutMode('split');
  };

  const handleOpenInSplit = (noteId: string) => {
    selectNote(noteId);
    setLayoutMode('split');
    sound.click();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden select-none">
      {/* Feed Header */}
      <div className="px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              Lecture Thread & Timeline Feed
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                {notes.length} lectures
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Browse existing lectures like a chat stream, or tap to open in side-by-side Note + Board mode
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            createNote().then((id) => {
              selectNote(id);
              setLayoutMode('split');
            });
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Note & Board</span>
        </button>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
        {sortedNotes.map((note) => {
          const hasCanvas = note.canvasElements && note.canvasElements.length > 0;
          const svgPreview = hasCanvas
            ? exportCanvasToSvg(note.canvasElements, 600, 350, false, isDarkMode)
            : null;
          const base64Svg = svgPreview ? `data:image/svg+xml;utf8,${encodeURIComponent(svgPreview)}` : null;

          return (
            <div
              key={note.id}
              className="flex items-start gap-3 max-w-3xl w-full group animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              {/* Avatar Icon */}
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/15 font-bold text-xs uppercase">
                {note.subject ? note.subject.slice(0, 2) : 'LN'}
              </div>

              {/* Message Bubble Card */}
              <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-slate-200/20 dark:shadow-none hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all">
                {/* Top Meta Line */}
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-200/60 dark:border-blue-800/60">
                      {note.subject || 'General'}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {note.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(note.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    {note.isPinned && (
                      <span className="text-amber-500 font-bold ml-1">★ Pinned</span>
                    )}
                  </div>
                </div>

                {/* Markdown text preview snippet */}
                <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed font-sans mb-3">
                  {note.markdown.replace(/[#*`_>-]/g, '').trim() || 'Empty note content...'}
                </div>

                {/* Drawing Board Snapshot Preview (if present) */}
                {base64Svg && (
                  <div className="my-2 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-56 bg-slate-50 dark:bg-slate-950 flex items-center justify-center relative group/img">
                    <img
                      src={base64Svg}
                      alt="Board Diagram"
                      className="w-full h-auto max-h-52 object-contain"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono flex items-center gap-1">
                      <Layers className="w-3 h-3 text-emerald-400" />
                      <span>{note.canvasElements.length} vector elements</span>
                    </div>
                  </div>
                )}

                {/* Voice recordings indicator */}
                {note.audioRecordings && note.audioRecordings.length > 0 && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs mb-3">
                    <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {note.audioRecordings.length} Voice Memo{note.audioRecordings.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {note.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleOpenInSplit(note.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 text-xs font-semibold transition-all group/btn"
                  >
                    <span>Open Split Note & Board</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat-Like Quick Entry Bar at Bottom */}
      <form
        onSubmit={handleQuickSend}
        className="p-3 sm:p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 shrink-0"
      >
        <div className="max-w-3xl mx-auto flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-inner">
          <input
            type="text"
            value={inputSubject}
            onChange={(e) => setInputSubject(e.target.value)}
            placeholder="Subject..."
            className="w-24 sm:w-32 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 border-0 outline-none"
          />

          <input
            type="text"
            value={inputTitle}
            onChange={(e) => setInputTitle(e.target.value)}
            placeholder="Type a new lecture topic or note... (Press Enter to open Note + Board)"
            className="flex-1 bg-transparent px-2 text-xs text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400"
          />

          <button
            type="submit"
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shrink-0 shadow-sm"
            title="Create & Open Split Studio"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
