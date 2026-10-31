import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Sparkles,
  RotateCw,
  Plus,
  Brain,
  Layers,
  Trash2,
} from 'lucide-react';
import { useNoteStore } from '@/store/useNoteStore';
import { db } from '@/core/db';
import { calculateSM2, isCardDue } from '../sm2';
import type { Flashcard, FlashcardRating } from '@/types/note';
import { aiAssistant } from '@/features/ai/aiService';
import confetti from 'canvas-confetti';

interface FlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlashcardsModal: React.FC<FlashcardsModalProps> = ({ isOpen, onClose }) => {
  const { getActiveNote } = useNoteStore();
  const activeNote = getActiveNote();

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [isAddingCard, setIsAddingCard] = useState(false);

  const loadCards = useCallback(async () => {
    if (!activeNote?.id) return;
    const all = await db.flashcards.where('noteId').equals(activeNote.id).toArray();
    setCards(all);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [activeNote]);

  useEffect(() => {
    let isCancelled = false;
    if (isOpen && activeNote?.id) {
      db.flashcards
        .where('noteId')
        .equals(activeNote.id)
        .toArray()
        .then((all) => {
          if (!isCancelled) {
            setCards(all);
            setCurrentIndex(0);
            setIsFlipped(false);
          }
        });
    }
    return () => {
      isCancelled = true;
    };
  }, [isOpen, activeNote]);

  if (!isOpen || !activeNote) return null;

  const currentCard = cards[currentIndex];
  const dueCardsCount = cards.filter(isCardDue).length;

  const handleRate = async (rating: FlashcardRating) => {
    if (!currentCard) return;

    const sm2Result = calculateSM2(currentCard, rating);
    const updatedCard: Flashcard = {
      ...currentCard,
      ...sm2Result,
      lastReviewedDate: Date.now(),
    };

    await db.flashcards.put(updatedCard);

    if (rating >= 3) {
      confetti({ particleCount: 20, spread: 35 });
    }

    // Advance to next card
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      await loadCards();
      alert('🎉 Study session complete! All due flashcards reviewed.');
    }
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const generated = await aiAssistant.generateFlashcardsFromNote(activeNote);
      for (const item of generated) {
        await db.flashcards.add({
          id: 'fc_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
          noteId: activeNote.id,
          question: item.question,
          answer: item.answer,
          easeFactor: 2.5,
          interval: 1,
          repetitions: 0,
          nextReviewDate: Date.now(),
        });
      }
      confetti({ particleCount: 35, spread: 50 });
      await loadCards();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateManualCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    await db.flashcards.add({
      id: 'fc_' + Date.now().toString(36),
      noteId: activeNote.id,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: Date.now(),
    });

    setNewQuestion('');
    setNewAnswer('');
    setIsAddingCard(false);
    await loadCards();
  };

  const handleDeleteCard = async (cardId: string) => {
    await db.flashcards.delete(cardId);
    await loadCards();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Spaced Repetition Flashcards
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                  SM-2 Algorithm
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {cards.length} cards in deck • {dueCardsCount} due for review
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

        {/* Action Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
          <button
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Generating Decks...' : 'AI Generate from Notes'}</span>
          </button>

          <button
            onClick={() => setIsAddingCard(!isAddingCard)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Card</span>
          </button>
        </div>

        {/* Manual Card Creator Drawer */}
        {isAddingCard && (
          <form
            onSubmit={handleCreateManualCard}
            className="p-4 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-col gap-2.5 text-xs animate-in slide-in-from-top-2"
          >
            <input
              type="text"
              required
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Question / Prompt (e.g. What is the time complexity of Dijkstra?)"
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 text-xs"
            />
            <input
              type="text"
              required
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Answer / Key Takeaway"
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 text-xs"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingCard(false)}
                className="px-3 py-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs"
              >
                Save Flashcard
              </button>
            </div>
          </form>
        )}

        {/* Main Study Flashcard View */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center overflow-y-auto min-h-[300px]">
          {cards.length === 0 ? (
            <div className="text-center flex flex-col items-center gap-3 text-slate-400 py-8">
              <Layers className="w-10 h-10 stroke-1 text-slate-300 dark:text-slate-700" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No flashcards generated yet
                </span>
                <span className="text-xs max-w-sm">
                  Click "AI Generate from Notes" above to automatically create flashcards from this lecture note, or add cards manually.
                </span>
              </div>
            </div>
          ) : currentCard ? (
            <div className="w-full flex flex-col gap-5 items-center">
              {/* Progress counter */}
              <div className="w-full flex items-center justify-between text-xs text-slate-400">
                <span>
                  Card {currentIndex + 1} of {cards.length}
                </span>
                <button
                  onClick={() => handleDeleteCard(currentCard.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                  title="Delete Card"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 3D Flip Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className={`w-full min-h-[190px] p-6 rounded-3xl border cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center shadow-lg select-none relative ${
                  isFlipped
                    ? 'bg-gradient-to-tr from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border-indigo-500/40'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="absolute top-3 left-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isFlipped ? 'Answer' : 'Question'}
                </span>

                <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 px-4">
                  {isFlipped ? currentCard.answer : currentCard.question}
                </p>

                <span className="absolute bottom-3 right-4 text-[10px] text-slate-400 flex items-center gap-1">
                  <RotateCw className="w-3 h-3" />
                  Tap to flip
                </span>
              </div>

              {/* SM-2 Rating Buttons (Active when flipped) */}
              {isFlipped ? (
                <div className="w-full grid grid-cols-4 gap-2 text-xs">
                  <button
                    onClick={() => handleRate(1)}
                    className="flex flex-col items-center py-2 px-1 rounded-2xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-bold transition-all"
                  >
                    <span>Again</span>
                    <span className="text-[10px] font-normal opacity-80">&lt;10 min</span>
                  </button>

                  <button
                    onClick={() => handleRate(2)}
                    className="flex flex-col items-center py-2 px-1 rounded-2xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 font-bold transition-all"
                  >
                    <span>Hard</span>
                    <span className="text-[10px] font-normal opacity-80">1 day</span>
                  </button>

                  <button
                    onClick={() => handleRate(3)}
                    className="flex flex-col items-center py-2 px-1 rounded-2xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 font-bold transition-all"
                  >
                    <span>Good</span>
                    <span className="text-[10px] font-normal opacity-80">3 days</span>
                  </button>

                  <button
                    onClick={() => handleRate(4)}
                    className="flex flex-col items-center py-2 px-1 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 font-bold transition-all"
                  >
                    <span>Easy</span>
                    <span className="text-[10px] font-normal opacity-80">6 days</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsFlipped(true)}
                  className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl font-semibold text-xs transition-colors"
                >
                  Reveal Answer (Space / Click)
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
