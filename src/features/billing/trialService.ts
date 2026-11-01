import type { TrialInfo } from './types';

const STORAGE_KEY_TRIAL = 'scribblenote_user_trial';

/**
 * Starts a 14-day Pro trial for a new user account.
 * Requires no credit card or payment method.
 */
export function initializeUserTrial(userId: string): TrialInfo {
  const existing = getStoredTrial(userId);
  if (existing) {
    return refreshTrialStatus(existing);
  }

  const now = Date.now();
  const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
  const trialEnd = now + FOURTEEN_DAYS_MS;

  const trialInfo: TrialInfo = {
    userId,
    trialStart: now,
    trialEnd,
    isTrialActive: true,
    daysRemaining: 14,
    remindersSent: [],
  };

  saveStoredTrial(trialInfo);
  return trialInfo;
}

/**
 * Computes remaining days and checks if reminders should be triggered.
 */
export function refreshTrialStatus(trial: TrialInfo): TrialInfo {
  const now = Date.now();
  const diffMs = trial.trialEnd - now;
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
  const isTrialActive = diffMs > 0;

  const updated: TrialInfo = {
    ...trial,
    daysRemaining,
    isTrialActive,
  };

  saveStoredTrial(updated);
  return updated;
}

export function getStoredTrial(userId: string): TrialInfo | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_TRIAL}_${userId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredTrial(trial: TrialInfo): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_TRIAL}_${trial.userId}`, JSON.stringify(trial));
  } catch (err) {
    console.warn('Failed to persist trial data:', err);
  }
}

/**
 * Checks if a specific milestone reminder should be shown to the student.
 */
export function checkMilestoneReminder(trial: TrialInfo): 'day_7' | 'day_12' | 'last_day' | null {
  if (!trial.isTrialActive) return null;

  // Last day reminder (1 day remaining)
  if (trial.daysRemaining <= 1) {
    return !trial.remindersSent.includes('last_day') ? 'last_day' : null;
  }

  // Day 12 reminder (2 days remaining)
  if (trial.daysRemaining <= 2) {
    return !trial.remindersSent.includes('day_12') ? 'day_12' : null;
  }

  // Day 7 reminder (7 days remaining)
  if (trial.daysRemaining <= 7) {
    return !trial.remindersSent.includes('day_7') ? 'day_7' : null;
  }

  return null;
}

/**
 * Mark a milestone reminder as acknowledged/sent.
 */
export function acknowledgeReminder(
  trial: TrialInfo,
  reminder: 'day_7' | 'day_12' | 'last_day'
): TrialInfo {
  const updated: TrialInfo = {
    ...trial,
    remindersSent: [...new Set([...trial.remindersSent, reminder])],
  };
  saveStoredTrial(updated);
  return updated;
}
