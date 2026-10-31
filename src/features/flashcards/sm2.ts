import type { Flashcard, FlashcardRating } from '@/types/note';

/**
 * SuperMemo SM-2 Spaced Repetition Algorithm
 * Computes optimal review intervals and retention difficulty factors.
 */
export function calculateSM2(
  card: Flashcard,
  rating: FlashcardRating
): {
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReviewDate: number;
} {
  // Map rating (1..4) to standard SM-2 grade q (2..5)
  // 1: Again (q=2) - Failed recall
  // 2: Hard (q=3) - Recalled with serious difficulty
  // 3: Good (q=4) - Recalled with slight hesitation
  // 4: Easy (q=5) - Perfect instant recall
  const q = rating + 1;

  let interval: number;
  let repetitions: number;
  let easeFactor: number;

  if (rating < 3) {
    // Incorrect / failed recall: reset repetition chain
    repetitions = 0;
    interval = 1;
  } else {
    // Correct recall
    if (card.repetitions === 0) {
      interval = 1;
    } else if (card.repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(card.interval * card.easeFactor);
    }
    repetitions = card.repetitions + 1;
  }

  // Calculate new Ease Factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const delta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  easeFactor = Math.max(1.3, Number((card.easeFactor + delta).toFixed(2)));

  const nextReviewDate = Date.now() + interval * 24 * 60 * 60 * 1000;

  return {
    interval,
    repetitions,
    easeFactor,
    nextReviewDate,
  };
}

export function isCardDue(card: Flashcard): boolean {
  return card.nextReviewDate <= Date.now();
}
