import { create } from 'zustand';

interface AudioSyncState {
  isRecording: boolean;
  recordingStartTime: number | null;
  isPlaying: boolean;
  activeRecordingId: string | null;
  currentPlaybackTime: number;
  duration: number;
  playbackRate: number;

  // Actions
  startRecordingSession: () => void;
  stopRecordingSession: () => void;
  playRecording: (recordingId: string, duration: number, startAtSecond?: number) => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopPlayback: () => void;
  seekTo: (second: number) => void;
  setCurrentPlaybackTime: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
  getRelativeAudioTime: () => number | undefined;
}

export const useAudioSyncStore = create<AudioSyncState>((set, get) => ({
  isRecording: false,
  recordingStartTime: null,
  isPlaying: false,
  activeRecordingId: null,
  currentPlaybackTime: 0,
  duration: 0,
  playbackRate: 1,

  startRecordingSession: () => {
    set({
      isRecording: true,
      recordingStartTime: Date.now(),
    });
  },

  stopRecordingSession: () => {
    set({
      isRecording: false,
      recordingStartTime: null,
    });
  },

  playRecording: (recordingId: string, duration: number, startAtSecond: number = 0) => {
    set({
      isPlaying: true,
      activeRecordingId: recordingId,
      currentPlaybackTime: startAtSecond,
      duration,
    });
  },

  pauseRecording: () => set({ isPlaying: false }),
  resumeRecording: () => set({ isPlaying: true }),

  stopPlayback: () =>
    set({
      isPlaying: false,
      activeRecordingId: null,
      currentPlaybackTime: 0,
    }),

  seekTo: (second: number) => {
    set({ currentPlaybackTime: Math.max(0, Math.min(get().duration, second)) });
  },

  setCurrentPlaybackTime: (time: number) => set({ currentPlaybackTime: time }),

  setPlaybackRate: (rate: number) => set({ playbackRate: rate }),

  getRelativeAudioTime: () => {
    const { isRecording, recordingStartTime } = get();
    if (!isRecording || !recordingStartTime) return undefined;
    return Math.max(0, Math.round(((Date.now() - recordingStartTime) / 1000) * 10) / 10);
  },
}));
