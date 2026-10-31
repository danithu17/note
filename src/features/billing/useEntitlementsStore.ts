import { create } from 'zustand';
import type { PlanId, FeatureKey, PlanFeatureLimit, Subscription, TrialInfo } from './types';
import {
  DEFAULT_PLAN_ENTITLEMENTS,
  checkCanAccessFeature,
  getFeatureLimit,
} from './entitlements';
import {
  initializeUserTrial,
  refreshTrialStatus,
  getStoredTrial,
  saveStoredTrial,
} from './trialService';
import { useAuthStore } from '@/core/auth/useAuthStore';

interface EntitlementsState {
  subscription: Subscription | null;
  trial: TrialInfo | null;
  dynamicEntitlements: Record<PlanId, Record<FeatureKey, PlanFeatureLimit>>;

  // Actions
  initialize: () => void;
  can: (feature: FeatureKey) => boolean;
  limit: (feature: FeatureKey) => number | null;
  startTrial: () => void;
  extendTrial: (additionalDays: number) => void;
  applySubscription: (planId: PlanId, provider: 'stripe' | 'payhere' | 'play_store') => void;
  cancelSubscription: () => void;
  updateFeatureLimit: (
    planId: PlanId,
    feature: FeatureKey,
    enabled: boolean,
    limit: number | null
  ) => void;
}

export const useEntitlementsStore = create<EntitlementsState>((set, get) => ({
  subscription: null,
  trial: null,
  dynamicEntitlements: DEFAULT_PLAN_ENTITLEMENTS,

  initialize: () => {
    const user = useAuthStore.getState().user;
    const userId = user?.id || 'guest_user';

    let currentTrial = getStoredTrial(userId);
    if (!currentTrial && user && !user.isGuest) {
      currentTrial = initializeUserTrial(userId);
    } else if (currentTrial) {
      currentTrial = refreshTrialStatus(currentTrial);
    }

    set({ trial: currentTrial });
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

  applySubscription: (planId: PlanId, provider) => {
    const user = useAuthStore.getState().user;
    const userId = user?.id || 'current_user';
    const now = Date.now();
    const ONE_MONTH_MS = 30 * 24 * 3600 * 1000;

    const sub: Subscription = {
      id: `sub_${Date.now().toString(36)}`,
      userId,
      planId,
      status: 'active',
      provider,
      currentPeriodStart: now,
      currentPeriodEnd: now + ONE_MONTH_MS,
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

  updateFeatureLimit: (planId, feature, enabled, limit) => {
    set((state) => ({
      dynamicEntitlements: {
        ...state.dynamicEntitlements,
        [planId]: {
          ...state.dynamicEntitlements[planId],
          [feature]: {
            featureKey: feature,
            enabled,
            limit,
          },
        },
      },
    }));
  },
}));
