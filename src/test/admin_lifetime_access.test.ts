import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../core/auth/useAuthStore';
import { useEntitlementsStore } from '../features/billing/useEntitlementsStore';
import type { FeatureKey } from '../features/billing/types';

describe('Admin Permanent Lifetime VIP Access (nimjayad@gmail.com)', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ user: null, error: null, isOnboarding: false });
    useEntitlementsStore.setState({ subscription: null, trial: null });
  });

  it('automatically configures nimjayad@gmail.com with team plan, 100GB storage, and 100-year validity on email sign-in', async () => {
    const res = await useAuthStore.getState().signInWithEmail('nimjayad@gmail.com', 'AdminPassword2026!');
    expect(res.success).toBe(true);

    const user = useAuthStore.getState().user;
    expect(user).not.toBeNull();
    expect(user?.email).toBe('nimjayad@gmail.com');
    expect(user?.name).toBe('Nimjaya (Admin)');
    expect(user?.plan).toBe('team');
    expect(user?.storageLimitBytes).toBe(100 * 1024 * 1024 * 1024);

    // Trial / license validity is 100 years
    const fiftyYearsMs = 50 * 365 * 24 * 3600 * 1000;
    expect((user?.trialEnd ?? 0) - Date.now()).toBeGreaterThan(fiftyYearsMs);
  });

  it('grants unlimited access to every feature in useEntitlementsStore for nimjayad@gmail.com', async () => {
    await useAuthStore.getState().signInWithEmail('nimjayad@gmail.com', 'AdminPassword2026!');
    useEntitlementsStore.getState().initialize();

    const allFeatures: FeatureKey[] = [
      'notes_count',
      'cloud_sync',
      'ocr_handwriting_search',
      'ai_assistant_messages_per_month',
      'version_history_days',
      'collaboration',
      'priority_support',
      'themes_accents',
      'unlimited_notes',
      'pdf_annotate',
      'team_collaboration',
    ];

    for (const feature of allFeatures) {
      expect(useEntitlementsStore.getState().can(feature)).toBe(true);
      expect(useEntitlementsStore.getState().limit(feature)).toBeNull();
    }

    const sub = useEntitlementsStore.getState().subscription;
    expect(sub?.status).toBe('active');
    expect(sub?.planId).toBe('team');
  });

  it('preserves admin VIP lifetime status even when initialized from cached local storage', async () => {
    await useAuthStore.getState().signInWithEmail('nimjayad@gmail.com', 'AdminPassword2026!');
    useAuthStore.setState({ user: null }); // simulate tab reload
    await useAuthStore.getState().initialize();

    const user = useAuthStore.getState().user;
    expect(user).not.toBeNull();
    expect(user?.email).toBe('nimjayad@gmail.com');
    expect(user?.plan).toBe('team');
    expect(user?.storageLimitBytes).toBe(100 * 1024 * 1024 * 1024);
  });
});
