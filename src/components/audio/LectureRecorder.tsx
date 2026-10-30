import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Pause, Trash2, Volume2 } from 'lucide-react';
import { AudioRecorder } from '../../utils/audio';
import type { AudioRecording } from '../../types/note';
import { useNoteStore } from '../../store/useNoteStore';

export const LectureRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const { getActiveNote } = useNoteStore();
  const activeNote = getActiveNote();
  const recordings = activeNote?.audioRecordings || [];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    if (!recorderRef.current) {
      recorderRef.current = new AudioRecorder();
    }

    setElapsedSeconds(0);
    const started = await recorderRef.current.start((secs) => {
      setElapsedSeconds(secs);
    });

    if (started) {
      setIsRecording(true);
    } else {
      alert('Microphone access is required to record lecture audio memos.');
    }
  };

  const handleStopRecording = async () => {
    if (!recorderRef.current) return;
    const recording = await recorderRef.current.stop();
    setIsRecording(false);

    if (recording && activeNote) {
      const updatedRecordings = [...(activeNote.audioRecordings || []), recording];
      useNoteStore.setState((state) => {
        const updated = {
          ...activeNote,
          audioRecordings: updatedRecordings,
          updatedAt: Date.now(),
        };
        return {
          notes: state.notes.map((n) => (n.id === updated.id ? updated : n)),
        };
      });
    }
  };

  const handlePlayToggle = (rec: AudioRecording) => {
    if (playingId === rec.id) {
      audioPlayerRef.current?.pause();
      setPlayingId(null);
    } else {
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio();
      }
      const audioUrl = rec.blobUrl || rec.base64Data || '';
      audioPlayerRef.current.src = audioUrl;
      audioPlayerRef.current.play();
      setPlayingId(rec.id);

      audioPlayerRef.current.onended = () => {
        setPlayingId(null);
      };
    }
  };

  const handleDeleteRecording = (recId: string) => {
    if (!activeNote) return;
    const updatedRecordings = (activeNote.audioRecordings || []).filter((r) => r.id !== recId);
    useNoteStore.setState((state) => {
      const updated = {
        ...activeNote,
        audioRecordings: updatedRecordings,
        updatedAt: Date.now(),
      };
      return {
        notes: state.notes.map((n) => (n.id === updated.id ? updated : n)),
      };
    });
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
          <Volume2 className="w-3.5 h-3.5 text-blue-500" />
          <span>Lecture Voice Memos</span>
          {recordings.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
              {recordings.length}
            </span>
          )}
        </div>

        {isRecording ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-mono text-rose-500 font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {formatTime(elapsedSeconds)}
            </span>
            <button
              onClick={handleStopRecording}
              className="flex items-center gap-1 px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors shadow-sm font-medium"
            >
              <Square className="w-3 h-3 fill-white" /> Stop
            </button>
          </div>
        ) : (
          <button
            onClick={handleStartRecording}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm font-medium"
          >
            <Mic className="w-3.5 h-3.5" /> Record Clip
          </button>
        )}
      </div>

      {/* List of recordings */}
      {recordings.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-1 max-h-32 overflow-y-auto pr-1">
          {recordings.map((rec) => (
            <div
              key={rec.id}
              className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlayToggle(rec)}
                  className="p-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:scale-105 transition-transform"
                >
                  {playingId === rec.id ? (
                    <Pause className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3 fill-current" />
                  )}
                </button>
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                    {rec.name}
                  </span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                    {formatTime(rec.duration)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDeleteRecording(rec.id)}
                className="p-1 text-slate-600 dark:text-slate-300 hover:text-rose-500 rounded transition-colors"
                title="Delete recording"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
