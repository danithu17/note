import React, { useEffect } from 'react';
import {
  X,
  Flame,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { usePomodoroStore } from '../usePomodoroStore';
import { useNoteStore } from '@/store/useNoteStore';
import { ModalPortal } from '@/components/ui/ModalPortal';

interface StudyDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudyDashboardModal: React.FC<StudyDashboardModalProps> = ({ isOpen, onClose }) => {
  const {
    isRunning,
    mode,
    secondsRemaining,
    totalFocusSessions,
    streakDays,
    todayMinutes,
    start,
    pause,
    reset,
    setMode,
    loadStudyStats,
  } = usePomodoroStore();

  const { notes, notebooks } = useNoteStore();

  useEffect(() => {
    if (isOpen) {
      loadStudyStats();
    }
  }, [isOpen, loadStudyStats]);

  if (!isOpen) return null;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ModalPortal>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs">
              <Flame className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Study Dashboard & Focus Hub
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Daily streak tracking and Pomodoro focus sessions
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

        {/* Content */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto text-xs">
          {/* Streak & Stats Row */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex flex-col items-center justify-center text-center">
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-extrabold text-base">
                <Flame className="w-4 h-4 fill-current" />
                {streakDays} {streakDays === 1 ? 'Day' : 'Days'}
              </span>
              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">Daily Streak</span>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex flex-col items-center justify-center text-center">
              <span className="text-blue-600 dark:text-blue-400 font-extrabold text-base">
                {todayMinutes}m
              </span>
              <span className="text-[10px] text-blue-700 dark:text-blue-300 font-medium">Studied Today</span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex flex-col items-center justify-center text-center">
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-base">
                {totalFocusSessions}
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">Pomodoro Cycles</span>
            </div>
          </div>

          {/* Pomodoro Focus Timer Section */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col items-center justify-center gap-4 text-center">
            {/* Mode Selector */}
            <div className="flex p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs font-semibold">
              <button
                onClick={() => setMode('focus')}
                className={`py-1 px-3 rounded-xl transition-all ${
                  mode === 'focus'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Focus (25m)
              </button>
              <button
                onClick={() => setMode('short_break')}
                className={`py-1 px-3 rounded-xl transition-all ${
                  mode === 'short_break'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Short Break (5m)
              </button>
              <button
                onClick={() => setMode('long_break')}
                className={`py-1 px-3 rounded-xl transition-all ${
                  mode === 'long_break'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Long Break (15m)
              </button>
            </div>

            {/* Countdown Clock */}
            <div className="font-mono text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100 my-1">
              {formatTimer(secondsRemaining)}
            </div>

            {/* Control buttons */}
            <div className="flex items-center gap-2">
              {isRunning ? (
                <button
                  onClick={pause}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold shadow-xs transition-all active:scale-95"
                >
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={start}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xs transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                  <span>Start Focus Session</span>
                </button>
              )}

              <button
                onClick={reset}
                className="p-2.5 rounded-2xl bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Course Notebooks Distribution */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1">
              Courses & Notes ({notebooks.length} notebooks • {notes.length} notes)
            </span>

            <div className="flex flex-col gap-1.5">
              {notebooks.map((nb) => {
                const count = notes.filter((n) => n.notebookId === nb.id).length;
                return (
                  <div
                    key={nb.id}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: nb.color || '#3b82f6' }}
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{nb.title}</span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {count} {count === 1 ? 'lecture' : 'lectures'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  </ModalPortal>
  );
};
