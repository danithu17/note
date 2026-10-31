import { describe, it, expect, beforeEach } from 'vitest';
import { calculateSM2, isCardDue } from '@/features/flashcards/sm2';
import { recognizeHandDrawnShape } from '@/features/canvas/shapeRecognition';
import { useAudioSyncStore } from '@/features/audio/useAudioSyncStore';
import { aiAssistant } from '@/features/ai/aiService';
import type { Flashcard, Point, LectureNote } from '@/types/note';

describe('Phase 2: Killer Features (Audio Sync, Flashcards, AI, Shape Snapping)', () => {
  beforeEach(() => {
    useAudioSyncStore.setState({
      isRecording: false,
      recordingStartTime: null,
      isPlaying: false,
      activeRecordingId: null,
      currentPlaybackTime: 0,
      duration: 0,
      playbackRate: 1,
    });
  });

  describe('SM-2 Spaced Repetition Engine', () => {
    const baseCard: Flashcard = {
      id: 'fc_test_1',
      noteId: 'note_1',
      question: 'What is the time complexity of QuickSort average case?',
      answer: 'O(n log n)',
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: Date.now() - 1000,
    };

    it('identifies overdue flashcards correctly', () => {
      expect(isCardDue(baseCard)).toBe(true);

      const futureCard: Flashcard = {
        ...baseCard,
        nextReviewDate: Date.now() + 86400000, // tomorrow
      };
      expect(isCardDue(futureCard)).toBe(false);
    });

    it('advances repetitions and intervals for correct recall (grade >= 3)', () => {
      // First review with rating 4 (good)
      const res1 = calculateSM2(baseCard, 4);
      expect(res1.repetitions).toBe(1);
      expect(res1.interval).toBe(1);
      expect(res1.easeFactor).toBeGreaterThanOrEqual(2.5);

      // Second consecutive review
      const card2: Flashcard = { ...baseCard, ...res1 };
      const res2 = calculateSM2(card2, 4);
      expect(res2.repetitions).toBe(2);
      expect(res2.interval).toBe(6);

      // Third consecutive review
      const card3: Flashcard = { ...card2, ...res2 };
      const res3 = calculateSM2(card3, 4);
      expect(res3.repetitions).toBe(3);
      expect(res3.interval).toBe(Math.round(6 * res2.easeFactor));
    });

    it('resets repetitions to 0 and interval to 1 on failure (grade < 3)', () => {
      const advancedCard: Flashcard = {
        ...baseCard,
        repetitions: 5,
        interval: 30,
        easeFactor: 2.6,
      };

      const failed = calculateSM2(advancedCard, 1);
      expect(failed.repetitions).toBe(0);
      expect(failed.interval).toBe(1);
      // Ease factor decreases but never drops below the 1.30 floor
      expect(failed.easeFactor).toBeLessThan(2.6);
      expect(failed.easeFactor).toBeGreaterThanOrEqual(1.30);
    });

    it('strictly enforces the 1.30 minimum ease factor threshold', () => {
      const lowEaseCard: Flashcard = {
        ...baseCard,
        easeFactor: 1.35,
      };

      const res = calculateSM2(lowEaseCard, 1); // grade 1 "again"
      expect(res.easeFactor).toBe(1.30);
    });
  });

  describe('Shape Auto-Recognition Engine', () => {
    it('returns null for strokes with fewer than 10 points', () => {
      const shortStroke: Point[] = [
        { x: 0, y: 0 },
        { x: 5, y: 5 },
      ];
      expect(recognizeHandDrawnShape(shortStroke)).toBeNull();
    });

    it('detects a straight horizontal line accurately', () => {
      const linePoints: Point[] = [];
      for (let i = 0; i < 20; i++) {
        // Collinear points with slight hand tremor
        linePoints.push({ x: i * 10, y: 50 + (i % 2 === 0 ? 0.5 : -0.5) });
      }

      const shape = recognizeHandDrawnShape(linePoints);
      expect(shape).not.toBeNull();
      expect(shape?.shape).toBe('line');
      expect(shape?.startX).toBe(0);
      expect(shape?.endX).toBe(190);
    });

    it('detects a hand-drawn circle / ellipse accurately', () => {
      const circlePoints: Point[] = [];
      const cx = 100;
      const cy = 100;
      const r = 50;
      const steps = 30;

      for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * 2 * Math.PI;
        circlePoints.push({
          x: cx + r * Math.cos(theta),
          y: cy + r * Math.sin(theta),
        });
      }

      const shape = recognizeHandDrawnShape(circlePoints);
      expect(shape).not.toBeNull();
      expect(shape?.shape).toBe('circle');
      expect(shape?.startX).toBeCloseTo(50, -1);
      expect(shape?.endX).toBeCloseTo(150, -1);
    });

    it('detects a hand-drawn rectangular box accurately', () => {
      const rectPoints: Point[] = [];
      // 4 sides of rectangle
      for (let x = 10; x <= 80; x += 10) rectPoints.push({ x, y: 10 });
      for (let y = 10; y <= 80; y += 10) rectPoints.push({ x: 80, y });
      for (let x = 80; x >= 10; x -= 10) rectPoints.push({ x, y: 80 });
      for (let y = 80; y >= 10; y -= 10) rectPoints.push({ x: 10, y });

      const shape = recognizeHandDrawnShape(rectPoints);
      expect(shape).not.toBeNull();
      expect(shape?.shape).toBe('rectangle');
    });

    it('detects a hand-drawn triangle accurately', () => {
      const trianglePoints: Point[] = [];
      // 3 sides of triangle: (50, 10) -> (90, 80) -> (10, 80) -> (50, 10)
      for (let t = 0; t <= 10; t++) {
        trianglePoints.push({ x: 50 + (40 * t) / 10, y: 10 + (70 * t) / 10 });
      }
      for (let t = 0; t <= 10; t++) {
        trianglePoints.push({ x: 90 - (80 * t) / 10, y: 80 });
      }
      for (let t = 0; t <= 10; t++) {
        trianglePoints.push({ x: 10 + (40 * t) / 10, y: 80 - (70 * t) / 10 });
      }

      const shape = recognizeHandDrawnShape(trianglePoints);
      expect(shape).not.toBeNull();
      expect(shape?.shape).toBe('triangle');
    });

    it('detects a hand-drawn diamond / rhombus accurately', () => {
      const diamondPoints: Point[] = [];
      // 4 sides of diamond: (50, 10) -> (90, 50) -> (50, 90) -> (10, 50) -> (50, 10)
      for (let t = 0; t <= 8; t++) diamondPoints.push({ x: 50 + (40 * t) / 8, y: 10 + (40 * t) / 8 });
      for (let t = 0; t <= 8; t++) diamondPoints.push({ x: 90 - (40 * t) / 8, y: 50 + (40 * t) / 8 });
      for (let t = 0; t <= 8; t++) diamondPoints.push({ x: 50 - (40 * t) / 8, y: 90 - (40 * t) / 8 });
      for (let t = 0; t <= 8; t++) diamondPoints.push({ x: 10 + (40 * t) / 8, y: 50 - (40 * t) / 8 });

      const shape = recognizeHandDrawnShape(diamondPoints);
      expect(shape).not.toBeNull();
      expect(shape?.shape).toBe('diamond');
    });

    it('detects a hand-drawn arrow accurately', () => {
      const arrowPoints: Point[] = [];
      // Straight shaft from (10, 50) to (100, 50)
      for (let x = 10; x <= 100; x += 5) arrowPoints.push({ x, y: 50 });
      // Barb turning backwards from (100, 50) towards (80, 40)
      for (let s = 1; s <= 5; s++) arrowPoints.push({ x: 100 - s * 4, y: 50 - s * 2 });

      const shape = recognizeHandDrawnShape(arrowPoints);
      expect(shape).not.toBeNull();
      expect(shape?.shape).toBe('arrow');
      expect(shape?.endX).toBe(100);
    });
  });

  describe('Audio Sync Store & Relative Timestamps', () => {
    it('manages recording session timestamps', () => {
      expect(useAudioSyncStore.getState().isRecording).toBe(false);
      expect(useAudioSyncStore.getState().getRelativeAudioTime()).toBeUndefined();

      useAudioSyncStore.getState().startRecordingSession();
      expect(useAudioSyncStore.getState().isRecording).toBe(true);
      expect(useAudioSyncStore.getState().recordingStartTime).toBeDefined();

      const rel = useAudioSyncStore.getState().getRelativeAudioTime();
      expect(rel).toBeGreaterThanOrEqual(0);

      useAudioSyncStore.getState().stopRecordingSession();
      expect(useAudioSyncStore.getState().isRecording).toBe(false);
    });

    it('controls seek and playback rate within bounds', () => {
      useAudioSyncStore.getState().playRecording('rec_100', 120, 15);
      const state = useAudioSyncStore.getState();
      expect(state.isPlaying).toBe(true);
      expect(state.activeRecordingId).toBe('rec_100');
      expect(state.currentPlaybackTime).toBe(15);
      expect(state.duration).toBe(120);

      // Seek forward
      useAudioSyncStore.getState().seekTo(45);
      expect(useAudioSyncStore.getState().currentPlaybackTime).toBe(45);

      // Clamp seek beyond duration
      useAudioSyncStore.getState().seekTo(250);
      expect(useAudioSyncStore.getState().currentPlaybackTime).toBe(120);

      // Clamp seek below 0
      useAudioSyncStore.getState().seekTo(-10);
      expect(useAudioSyncStore.getState().currentPlaybackTime).toBe(0);

      // Set playback speed
      useAudioSyncStore.getState().setPlaybackRate(1.5);
      expect(useAudioSyncStore.getState().playbackRate).toBe(1.5);
    });
  });

  describe('AI Study Assistant Services', () => {
    const mockNote: LectureNote = {
      id: 'note_ai_test',
      title: 'Neural Networks and Deep Learning',
      subject: 'Computer Science 480',
      tags: ['ai', 'deep-learning', 'backpropagation'],
      markdown: `## Neural Networks Architecture
A multilayer perceptron (MLP) consists of an input layer, hidden layers, and an output layer.
Backpropagation uses gradient descent and the chain rule to update weights.
Activation functions such as ReLU, Sigmoid, and GELU introduce non-linearity into the network.`,
      canvasElements: [],
      audioRecordings: [],
      gridType: 'dots',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPinned: false,
    };

    it('summarizes note with bullet points and key takeaways', async () => {
      const summary = await aiAssistant.summarizeNote(mockNote);
      expect(summary.summary).toBeDefined();
      expect(summary.keyTakeaways.length).toBeGreaterThan(0);
      expect(summary.keyTerms).toBeDefined();
    });

    it('extracts flashcard pairs from structured note text', async () => {
      const flashcards = await aiAssistant.generateFlashcardsFromNote(mockNote);
      expect(flashcards.length).toBeGreaterThan(0);
      expect(flashcards[0].question).toBeDefined();
      expect(flashcards[0].answer).toBeDefined();
    });

    it('generates multi-choice quiz questions from lecture concepts', async () => {
      const quiz = await aiAssistant.generateQuizFromNote(mockNote);
      expect(quiz.length).toBeGreaterThan(0);
      expect(quiz[0].options.length).toBe(4);
      expect(quiz[0].correctIndex).toBeGreaterThanOrEqual(0);
      expect(quiz[0].correctIndex).toBeLessThan(4);
    });

    it('answers queries against note contents via semantic search', async () => {
      const answer = await aiAssistant.askMyNotes(mockNote, 'What rule does backpropagation use?');
      expect(answer).toBeDefined();
      expect(typeof answer).toBe('string');
      expect(answer.length).toBeGreaterThan(10);
    });
  });
});
