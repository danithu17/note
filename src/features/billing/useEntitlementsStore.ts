import { create } from 'zustand';
import type {
  PlanId,
  FeatureKey,
  PlanFeatureLimit,
  Plan,
  Subscription,
  TrialInfo,
  StudentVerification,
  PricingVariant,
} from './types';
import {
  DEFAULT_PLANS,
  DEFAULT_PLAN_ENTITLEMENTS,
  checkCanAccessFeature,
  getFeatureLimit,
  isEducationalEmail,
} from './entitlements';
import {
  initializeUserTrial,
  refreshTrialStatus,
  getStoredTrial,
  saveStoredTrial,
} from './trialService';
import { useAuthStore } from '@/core/auth/useAuthStore';

interface EntitlementsState {
  plans: Record<PlanId, Plan>;
  dynamicEntitlements: Record<PlanId, Record<FeatureKey, PlanFeatureLimit>>;
  subscription: Subscription | null;
  trial: TrialInfo | null;
  studentVerification: StudentVerification | null;
  pricingVariant: PricingVariant;
  monthlyAiUsage: number;

  // Actions
  initialize: () => void;
  can: (feature: FeatureKey) => boolean;
  limit: (feature: FeatureKey) => number | null;
  startTrial: () => void;
  extendTrial: (additionalDays: number) => void;
  applySubscription: (
    planId: PlanId,
    provider: 'stripe' | 'payhere' | 'play_store',
    billingCycle?: 'monthly' | 'annual'
  ) => void;
  cancelSubscription: () => void;
  incrementAiUsage: () => number;
  getRemainingAiCredits: () => { used: number; total: number | null; remaining: number | null };
  submitStudentId: (institution: string, documentName: string, documentDataUrl: string) => void;
  verifyStudentStatus: (status: 'verified' | 'rejected', reason?: string) => void;
  updatePlanPrice: (
    planId: PlanId,
    monthlyUsd: number,
    yearlyUsd: number,
    monthlyLkr: number,
    yearlyLkr: number
  ) => void;
  updateFeatureLimit: (
    planId: PlanId,
    feature: FeatureKey,
    enabled: boolean,
    limit: number | null
  ) => void;
  setPricingVariant: (variant: PricingVariant) => void;
}

const STORAGE_KEY_PLANS = 'scribblenote_plans_config';
const STORAGE_KEY_ENTITLEMENTS = 'scribblenote_entitlements_matrix';
const STORAGE_KEY_STUDENT = 'scribblenote_student_verification';
const STORAGE_KEY_AI_USAGE = 'scribblenote_monthly_ai_usage';

function loadPersistedPlans(): Record<PlanId, Plan> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLANS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_PLANS;
}

function loadPersistedEntitlements(): Record<PlanId, Record<FeatureKey, PlanFeatureLimit>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ENTITLEMENTS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_PLAN_ENTITLEMENTS;
}

export const useEntitlementsStore = create<EntitlementsState>((set, get) => ({
  plans: loadPersistedPlans(),
  dynamicEntitlements: loadPersistedEntitlements(),
  subscription: null,
  trial: null,
  studentVerification: null,
  pricingVariant: 'variant_a',
  monthlyAiUsage: parseInt(localStorage.getItem(STORAGE_KEY_AIUsageKey()) || '0', 10),

  initialize: () => {
    const user = useAuthStore.getState().user;
    const userId = user?.id || 'guest_user';

    // 1. Initialize trial
    let currentTrial = getStoredTrial(userId);
    if (!currentTrial && user && !user.isGuest) {
      currentTrial = initializeUserTrial(userId);
    } else if (currentTrial) {
      currentTrial = refreshTrialStatus(currentTrial);
    }

    // 2. Check student verification (.edu or .ac.lk automatic detection)
    let studentStatus: StudentVerification | null = null;
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_STUDENT}_${userId}`);
      if (stored) {
        studentStatus = JSON.parse(stored);
      }
    } catch {
      // fallback
    }

    if (!studentStatus && user?.email && isEducationalEmail(user.email)) {
      studentStatus = {
        userId,
        email: user.email,
        institution: user.email.split('@')[1],
        status: 'verified',
        verifiedAt: Date.now(),
      };
      localStorage.setItem(`${STORAGE_KEY_STUDENT}_${userId}`, JSON.stringify(studentStatus));
    }

    set({ trial: currentTrial, studentVerification: studentStatus });
  },

  can: (feature: FeatureKey) => {
    const { subscription, trial, dynamicEntitlements } = get();
    return checkCanAccessFeature(feature, subscription, trial, dynamicEntitlements);
  },

  limit: (feature: FeatureKey) => {
    const { subscription, trial, dynamicEntitlements } = get();
    return getFeatureLimit(feature, subscription, trial, dynamicEntitlements);
  },

  startTrial: () => {
    const user = useAuthStore.getState().user;
    const userId = user?.id || 'current_user';
    const trial = initializeUserTrial(userId);
    set({ trial });
  },

  extendTrial: (additionalDays: number) => {
    const { trial } = get();
    if (!trial) return;

    const extensionMs = additionalDays * 24 * 3600 * 1000;
    const updated: TrialInfo = {
      ...trial,
      trialEnd: trial.trialEnd + extensionMs,
      daysRemaining: trial.daysRemaining + additionalDays,
      isTrialActive: true,
    };
    saveStoredTrial(updated);
    set({ trial: updated });
  },

  applySubscription: (planId: PlanId, provider, billingCycle = 'annual') => {
    const user = useAuthStore.getState().user;
    const userId = user?.id || 'current_user';
    const now = Date.now();
    const periodMs = (billingCycle === 'annual' ? 365 : 30) * 24 * 3600 * 1000;

    const sub: Subscription = {
      id: `sub_${Date.now().toString(36)}`,
      userId,
      planId,
      status: 'active',
      provider,
      billingCycle,
      currentPeriodStart: now,
      currentPeriodEnd: now + periodMs,
      cancelAtPeriodEnd: false,
      updatedAt: now,
    };

    set({ subscription: sub });
  },

  cancelSubscription: () => {
    const { subscription } = get();
    if (!subscription) return;

    set({
      subscription: {
        ...subscription,
        cancelAtPeriodEnd: true,
        updatedAt: Date.now(),
      },
    });
  },

  incrementAiUsage: () => {
    const next = get().monthlyAiUsage + 1;
    set({ monthlyAiUsage: next });
    try {
      localStorage.setItem(STORAGE_KEY_AIUsageKey(), next.toString());
    } catch {
      // ignore
    }
    return next;
  },

  getRemainingAiCredits: () => {
    const limit = get().limit('ai_assistant_messages_per_month');
    const used = get().monthlyAiUsage;
    if (limit === null) return { used, total: null, remaining: null };
    return {
      used,
      total: limit,
      remaining: Math.max(0, limit - used),
    };
  },

  submitStudentId: (institution: string, documentName: string, documentDataUrl: string) => {
    const user = useAuthStore.getState().user;
    const userId = user?.id || 'student_id';

    const verification: StudentVerification = {
      userId,
      email: user?.email || 'student@university.edu',
      institution,
      documentName,
      documentDataUrl,
      status: 'pending',
      submittedAt: Date.now(),
    };

    localStorage.setItem(`${STORAGE_KEY_STUDENT}_${userId}`, JSON.stringify(verification));
    set({ studentVerification: verification });
  },

  verifyStudentStatus: (status, reason) => {
    const current = get().studentVerification;
    if (!current) return;

    const updated: StudentVerification = {
      ...current,
      status,
      verifiedAt: status === 'verified' ? Date.now() : undefined,
      rejectionReason: reason,
    };

    localStorage.setItem(`${STORAGE_KEY_STUDENT}_${current.userId}`, JSON.stringify(updated));
    set({ studentVerification: updated });
  },

  updatePlanPrice: (planId, monthlyUsd, yearlyUsd, monthlyLkr, yearlyLkr) => {
    set((state) => {
      const updated = {
        ...state.plans,
        [planId]: {
          ...state.plans[planId],
          monthlyUsd,
          yearlyUsd,
          monthlyLkr,
          yearlyLkr,
          priceUsd: monthlyUsd,
          priceLkr: monthlyLkr,
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return { plans: updated };
    });
  },

  updateFeatureLimit: (planId, feature, enabled, limit) => {
    set((state) => {
      const updated = {
        ...state.dynamicEntitlements,
        [planId]: {
          ...state.dynamicEntitlements[planId],
          [feature]: {
            featureKey: feature,
            enabled,
            limit,
          },
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY_ENTITLEMENTS, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return { dynamicEntitlements: updated };
    });
  },

  setPricingVariant: (pricingVariant) => set({ pricingVariant }),
}));

function STORAGE_KEY_AIUsageKey(): string {
  const date = new Date();
  return `${STORAGE_KEY_AI_USAGE}_${date.getFullYear()}_${date.getMonth()}`;
}
