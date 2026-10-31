import type { Plan, PlanId, FeatureKey, PlanFeatureLimit, Subscription, TrialInfo } from './types';

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Starter Free',
    priceUsd: 0,
    priceLkr: 0,
    billingInterval: 'free',
    description: 'Essential lecture typing, handwriting canvas, and local offline storage.',
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro Scholar (Monthly)',
    priceUsd: 4.99,
    priceLkr: 1500,
    billingInterval: 'month',
    description: 'Unlimited PDF slide annotations, audio-synced recall, OCR search, and AI assistant.',
  },
  pro_yearly: {
    id: 'pro_yearly',
    name: 'Pro Scholar (Annual)',
    priceUsd: 39.99,
    priceLkr: 12000,
    billingInterval: 'year',
    description: 'Save 33% per year with full offline-first multi-device cloud synchronization.',
    isPopular: true,
  },
  team: {
    id: 'team',
    name: 'Campus Lab & Team',
    priceUsd: 9.99,
    priceLkr: 3000,
    billingInterval: 'month',
    description: 'Collaborative academic workspaces, shared course repositories, and admin control.',
  },
};

export const DEFAULT_PLAN_ENTITLEMENTS: Record<PlanId, Record<FeatureKey, PlanFeatureLimit>> = {
  free: {
    unlimited_notes: { featureKey: 'unlimited_notes', enabled: true, limit: 25 },
    pdf_annotate: { featureKey: 'pdf_annotate', enabled: false, limit: null },
    audio_sync: { featureKey: 'audio_sync', enabled: false, limit: null },
    ai_assistant: { featureKey: 'ai_assistant', enabled: true, limit: 5 }, // 5 queries/day
    ocr_search: { featureKey: 'ocr_search', enabled: false, limit: null },
    cloud_sync: { featureKey: 'cloud_sync', enabled: true, limit: 1 }, // 1 device sync
    max_storage_mb: { featureKey: 'max_storage_mb', enabled: true, limit: 100 }, // 100 MB
    max_audio_minutes: { featureKey: 'max_audio_minutes', enabled: true, limit: 15 },
    export_pdf: { featureKey: 'export_pdf', enabled: true, limit: 10 },
    team_collaboration: { featureKey: 'team_collaboration', enabled: false, limit: null },
  },
  pro_monthly: {
    unlimited_notes: { featureKey: 'unlimited_notes', enabled: true, limit: null },
    pdf_annotate: { featureKey: 'pdf_annotate', enabled: true, limit: null },
    audio_sync: { featureKey: 'audio_sync', enabled: true, limit: null },
    ai_assistant: { featureKey: 'ai_assistant', enabled: true, limit: null },
    ocr_search: { featureKey: 'ocr_search', enabled: true, limit: null },
    cloud_sync: { featureKey: 'cloud_sync', enabled: true, limit: null },
    max_storage_mb: { featureKey: 'max_storage_mb', enabled: true, limit: 10240 }, // 10 GB
    max_audio_minutes: { featureKey: 'max_audio_minutes', enabled: true, limit: null },
    export_pdf: { featureKey: 'export_pdf', enabled: true, limit: null },
    team_collaboration: { featureKey: 'team_collaboration', enabled: false, limit: null },
  },
  pro_yearly: {
    unlimited_notes: { featureKey: 'unlimited_notes', enabled: true, limit: null },
    pdf_annotate: { featureKey: 'pdf_annotate', enabled: true, limit: null },
    audio_sync: { featureKey: 'audio_sync', enabled: true, limit: null },
    ai_assistant: { featureKey: 'ai_assistant', enabled: true, limit: null },
    ocr_search: { featureKey: 'ocr_search', enabled: true, limit: null },
    cloud_sync: { featureKey: 'cloud_sync', enabled: true, limit: null },
    max_storage_mb: { featureKey: 'max_storage_mb', enabled: true, limit: 10240 }, // 10 GB
    max_audio_minutes: { featureKey: 'max_audio_minutes', enabled: true, limit: null },
    export_pdf: { featureKey: 'export_pdf', enabled: true, limit: null },
    team_collaboration: { featureKey: 'team_collaboration', enabled: false, limit: null },
  },
  team: {
    unlimited_notes: { featureKey: 'unlimited_notes', enabled: true, limit: null },
    pdf_annotate: { featureKey: 'pdf_annotate', enabled: true, limit: null },
    audio_sync: { featureKey: 'audio_sync', enabled: true, limit: null },
    ai_assistant: { featureKey: 'ai_assistant', enabled: true, limit: null },
    ocr_search: { featureKey: 'ocr_search', enabled: true, limit: null },
    cloud_sync: { featureKey: 'cloud_sync', enabled: true, limit: null },
    max_storage_mb: { featureKey: 'max_storage_mb', enabled: true, limit: 102400 }, // 100 GB
    max_audio_minutes: { featureKey: 'max_audio_minutes', enabled: true, limit: null },
    export_pdf: { featureKey: 'export_pdf', enabled: true, limit: null },
    team_collaboration: { featureKey: 'team_collaboration', enabled: true, limit: null },
  },
};

/**
 * Checks if a feature is enabled for the user based on active subscription or active trial.
 */
export function checkCanAccessFeature(
  featureKey: FeatureKey,
  subscription: Subscription | null,
  trial: TrialInfo | null,
  dynamicEntitlements: Record<PlanId, Record<FeatureKey, PlanFeatureLimit>> = DEFAULT_PLAN_ENTITLEMENTS
): boolean {
  // If user is actively trialing, grant Pro privileges
  if (trial && trial.isTrialActive && trial.daysRemaining > 0) {
    const proConfig = dynamicEntitlements.pro_monthly[featureKey];
    return proConfig ? proConfig.enabled : true;
  }

  // Active paid subscription
  if (subscription && (subscription.status === 'active' || subscription.status === 'trialing')) {
    const planConfig = dynamicEntitlements[subscription.planId]?.[featureKey];
    return planConfig ? planConfig.enabled : false;
  }

  // Fallback to Free Plan
  const freeConfig = dynamicEntitlements.free[featureKey];
  return freeConfig ? freeConfig.enabled : false;
}

/**
 * Gets the numeric limit for a feature (e.g. storage MB, max audio mins). Returns null if unlimited.
 */
export function getFeatureLimit(
  featureKey: FeatureKey,
  subscription: Subscription | null,
  trial: TrialInfo | null,
  dynamicEntitlements: Record<PlanId, Record<FeatureKey, PlanFeatureLimit>> = DEFAULT_PLAN_ENTITLEMENTS
): number | null {
  if (trial && trial.isTrialActive && trial.daysRemaining > 0) {
    return dynamicEntitlements.pro_monthly[featureKey]?.limit ?? null;
  }

  if (subscription && (subscription.status === 'active' || subscription.status === 'trialing')) {
    return dynamicEntitlements[subscription.planId]?.[featureKey]?.limit ?? null;
  }

  return dynamicEntitlements.free[featureKey]?.limit ?? null;
}
