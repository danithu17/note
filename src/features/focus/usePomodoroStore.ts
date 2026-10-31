import { create } from 'zustand';
import { db } from '@/core/db';
import { sound } from '@/utils/sound';

export type PomodoroMode = 'focus' | 'short_break' | 'long_break';

interface PomodoroState {
  isRunning: boolean;
  mode: PomodoroMode;
  secondsRemaining: number;
  totalFocusSessions: number;
  streakDays: number;
  todayMinutes: number;

  // Actions
  start: () => void;
  pause: () => void;
  reset: () => void;
  setMode: (mode: PomodoroMode) => void;
  tick: () => void;
  loadStudyStats: () => Promise<void>;
}

const DURATIONS: Record<PomodoroMode, number> = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

let intervalId: number | null = null;

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  isRunning: false,
  mode: 'focus',
  secondsRemaining: 25 * 60,
  totalFocusSessions: 0,
  streakDays: 1,
  todayMinutes: 0,

  start: () => {
    if (get().isRunning) return;

    set({ isRunning: true });

    if (intervalId) clearInterval(intervalId);
    intervalId = window.setInterval(() => {
      get().tick();
    }, 1000);
  },

  pause: () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    set({ isRunning: false });
  },

  reset: () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    const mode = get().mode;
    set({
      isRunning: false,
      secondsRemaining: DURATIONS[mode],
    });
  },

  setMode: (mode: PomodoroMode) => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    set({
      mode,
      isRunning: false,
      secondsRemaining: DURATIONS[mode],
    });
  },

  tick: async () => {
    const { secondsRemaining, mode, totalFocusSessions } = get();

    if (secondsRemaining <= 1) {
      // Completed session!
      sound.chime();

      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      if (mode === 'focus') {
        const nextSessions = totalFocusSessions + 1;
        const nextMode = nextSessions % 4 === 0 ? 'long_break' : 'short_break';

        // Log session in Dexie
        const todayStr = new Date().toISOString().split('T')[0];
        await db.studySessions.add({
          id: 'session_' + Date.now().toString(36),
          date: todayStr,
          minutes: 25,
          timestamp: Date.now(),
        });

        await get().loadStudyStats();

        set({
          isRunning: false,
          mode: nextMode,
          secondsRemaining: DURATIONS[nextMode],
          totalFocusSessions: nextSessions,
        });
      } else {
        set({
          isRunning: false,
          mode: 'focus',
          secondsRemaining: DURATIONS.focus,
        });
      }
    } else {
      set({ secondsRemaining: secondsRemaining - 1 });
    }
  },

  loadStudyStats: async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const sessions = await db.studySessions.toArray();

    const todaySessions = sessions.filter((s) => s.date === todayStr);
    const todayMinutes = todaySessions.reduce((sum, s) => sum + s.minutes, 0);

    // Calculate unique consecutive dates for streaks
    const uniqueDates = Array.from(new Set(sessions.map((s) => s.date))).sort();
    let streak = 0;
    if (uniqueDates.includes(todayStr) || sessions.length > 0) {
      streak = Math.max(1, uniqueDates.length);
    }

    set({ todayMinutes, streakDays: streak });
  },
}));
