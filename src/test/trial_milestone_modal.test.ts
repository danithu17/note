import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkMilestoneReminder,
  acknowledgeReminder,
} from '@/features/billing/trialService';
import { useEntitlementsStore } from '@/features/billing/useEntitlementsStore';
import type { TrialInfo } from '@/features/billing/types';

describe('Trial Milestone Reminders: 7-Day & 1-Day Popups', () => {
  beforeEach(() => {
    localStorage.clear();
    useEntitlementsStore.setState({
      subscription: null,
      trial: null,
    });
  });

  it('triggers "day_7" popup reminder when 7 days remain and not yet acknowledged', () => {
    const now = Date.now();
    const trialDay7: TrialInfo = {
      userId: 'test_student_7d',
      trialStart: now - 7 * 86400000,
      trialEnd: now + 7 * 86400000,
      isTrialActive: true,
      daysRemaining: 7,
      remindersSent: [],
    };

    expect(checkMilestoneReminder(trialDay7)).toBe('day_7');

    // Acknowledge day_7 reminder
    const acknowledged = acknowledgeReminder(trialDay7, 'day_7');
    expect(acknowledged.remindersSent).toContain('day_7');

    // Check again: should NOT return day_7 anymore
    expect(checkMilestoneReminder(acknowledged)).toBeNull();
  });

  it('triggers "last_day" popup reminder when 1 day remains and not yet acknowledged', () => {
    const now = Date.now();
    const trialLastDay: TrialInfo = {
      userId: 'test_student_1d',
      trialStart: now - 13 * 86400000,
      trialEnd: now + 1 * 86400000,
      isTrialActive: true,
      daysRemaining: 1,
      remindersSent: ['day_7'], // Already saw day 7 reminder
    };

    expect(checkMilestoneReminder(trialLastDay)).toBe('last_day');

    // Acknowledge last_day reminder
    const acknowledged = acknowledgeReminder(trialLastDay, 'last_day');
    expect(acknowledged.remindersSent).toContain('last_day');

    // Check again: should NOT trigger last_day anymore
    expect(checkMilestoneReminder(acknowledged)).toBeNull();
  });

  it('useEntitlementsStore correctly acknowledges trial reminder', () => {
    const now = Date.now();
    const trialDay7: TrialInfo = {
      userId: 'store_student_1',
      trialStart: now - 7 * 86400000,
      trialEnd: now + 7 * 86400000,
      isTrialActive: true,
      daysRemaining: 7,
      remindersSent: [],
    };

    useEntitlementsStore.setState({ trial: trialDay7 });

    expect(checkMilestoneReminder(useEntitlementsStore.getState().trial!)).toBe('day_7');

    useEntitlementsStore.getState().acknowledgeTrialReminder('day_7');

    const updatedTrial = useEntitlementsStore.getState().trial!;
    expect(updatedTrial.remindersSent).toContain('day_7');
    expect(checkMilestoneReminder(updatedTrial)).toBeNull();
  });
});
