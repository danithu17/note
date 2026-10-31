import React, { useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  X,
  Sparkles,
} from 'lucide-react';
import { useAudioSyncStore } from '../useAudioSyncStore';
import { useNoteStore } from '@/store/useNoteStore';
import { getAttachmentBlob } from '@/core/db/attachments';

export const AudioPlaybackIsland: React.FC = () => {
  const {
    isPlaying,
    activeRecordingId,
    currentPlaybackTime,
    duration,
    playbackRate,
    pauseRecording,
    resumeRecording,
    stopPlayback,
    seekTo,
    setCurrentPlaybackTime,
    setPlaybackRate,
  } = useAudioSyncStore();

  const { getActiveNote } = useNoteStore();
  const activeNote = getActiveNote();
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const activeRecording = activeNote?.audioRecordings?.find((r) => r.id === activeRecordingId);

  useEffect(() => {
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio();
    }
    const audio = audioElementRef.current;

    const handleTimeUpdate = () => {
      setCurrentPlaybackTime(audio.currentTime);
    };

    const handleEnded = () => {
      stopPlayback();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [setCurrentPlaybackTime, stopPlayback]);

  // Load recording source
  useEffect(() => {
    if (!activeRecording || !audioElementRef.current) return;

    const loadSrc = async () => {
      const audio = audioElementRef.current!;
      let url = activeRecording.blobUrl;

      if (!url && activeRecording.attachmentId) {
        const blob = await getAttachmentBlob(activeRecording.attachmentId);
        if (blob) {
          url = URL.createObjectURL(blob);
        }
      }
      if (!url && activeRecording.base64Data) {
        url = activeRecording.base64Data;
      }

      if (url && audio.src !== url) {
        audio.src = url;
        audio.playbackRate = playbackRate;
        if (currentPlaybackTime > 0) {
          audio.currentTime = currentPlaybackTime;
        }
        audio.play().catch(console.warn);
      }
    };

    loadSrc();
  }, [activeRecording, currentPlaybackTime, playbackRate]);

  // Handle play / pause state changes
  useEffect(() => {
    const audio = audioElementRef.current;
    if (!audio) return;

    if (isPlaying && audio.paused) {
      audio.play().catch(console.warn);
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [isPlaying]);

  // Handle speed changes
  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  if (!activeRecordingId || !activeRecording) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSliderSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    seekTo(val);
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = val;
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    setPlaybackRate(speeds[nextIdx]);
  };

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 select-none">
      <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 shadow-2xl rounded-2xl text-xs">
        {/* Play / Pause Toggle */}
        <button
          onClick={() => (isPlaying ? pauseRecording() : resumeRecording())}
          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-xs active:scale-95"
          title={isPlaying ? 'Pause Audio' : 'Play Audio'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
        </button>

        {/* Title and Time */}
        <div className="flex flex-col min-w-[130px] max-w-[180px]">
          <span className="font-semibold truncate text-[11px]">{activeRecording.name}</span>
          <span className="font-mono text-[10px] text-slate-400">
            {formatTime(currentPlaybackTime)} / {formatTime(duration || activeRecording.duration)}
          </span>
        </div>

        {/* Scrubber slider */}
        <input
          type="range"
          min={0}
          max={duration || activeRecording.duration || 100}
          step={0.5}
          value={currentPlaybackTime}
          onChange={handleSliderSeek}
          className="w-28 sm:w-44 accent-blue-500 cursor-pointer h-1 rounded-lg bg-slate-700"
        />

        {/* Speed button */}
        <button
          onClick={cycleSpeed}
          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 font-mono text-[10px] font-bold text-blue-400 transition-colors"
          title="Audio Playback Speed"
        >
          {playbackRate}x
        </button>

        {/* Close island */}
        <button
          onClick={stopPlayback}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Stop Playback"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sync hint pill */}
      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/80 backdrop-blur-xs border border-blue-500/30 text-[10px] text-blue-300 font-medium">
        <Sparkles className="w-3 h-3 text-blue-400" />
        <span>Audio-Synced: Drawing or tapping strokes highlights in sync</span>
      </div>
    </div>
  );
};
