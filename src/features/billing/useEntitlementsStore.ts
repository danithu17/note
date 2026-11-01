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
  acknowledgeReminder,
} from './trialService';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { getSupabaseClient } from '@/core/supabase/client';

const STORAGE_KEY_SUBSCRIPTION = 'scribblenote_subscription';

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
  acknowledgeTrialReminder: (reminder: 'day_7' | 'day_12' | 'last_day') => void;
  applySubscription: (
    planId: PlanId,
    provider: 'stripe' | 'payhere' | 'play_store' | 'manual',
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
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_PLANS,
        ...parsed,
        team: {
          ...DEFAULT_PLANS.team,
          ...(parsed.team || {}),
          name:
            !parsed.team?.name || parsed.team?.name === 'Team / Education'
              ? DEFAULT_PLANS.team.name
              : parsed.team.name,
        },
      };
    }
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
    const isOwnerAdmin = user?.email?.toLowerCase() === 'nimjayad@gmail.com';

    // 0. Super Admin VIP Lifetime Access: Always active, never expires
    if (isOwnerAdmin) {
      const adminSub: Subscription = {
        id: 'admin_lifetime_vip_license',
        userId: user?.id || 'admin_user',
        planId: 'team',
        status: 'active',
        provider: 'manual',
        billingCycle: 'annual',
        currentPeriodStart: Date.now() - 365 * 24 * 3600 * 1000,
        currentPeriodEnd: Date.now() + 100 * 365 * 24 * 3600 * 1000,
        cancelAtPeriodEnd: false,
        updatedAt: Date.now(),
      };
      const adminTrial: TrialInfo = {
        userId: user?.id || 'admin_user',
        trialStart: Date.now(),
        trialEnd: Date.now() + 100 * 365 * 24 * 3600 * 1000,
        daysRemaining: 36500,
        isTrialActive: true,
        remindersSent: [],
      };
      set({ subscription: adminSub, trial: adminTrial });
      return;
    }

    const userId = user?.id || 'guest_user';

    // 1. Initialize trial: Automatically start 14-day Pro trial with NO payment method required
    let currentTrial = getStoredTrial(userId);
    if (!currentTrial) {
      currentTrial = initializeUserTrial(userId);
    } else {
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

    // 3. Load active subscription from localStorage cache
    let activeSub: Subscription | null = null;
    try {
      const storedSub = localStorage.getItem(STORAGE_KEY_SUBSCRIPTION);
      if (storedSub) {
        const parsed = JSON.parse(storedSub) as Subscription;
        if (parsed && parsed.status === 'active' && parsed.currentPeriodEnd > Date.now()) {
          activeSub = parsed;
        }
      }
    } catch {
      // ignore
    }

    set({ trial: currentTrial, studentVerification: studentStatus, subscription: activeSub });

    // 4. If Supabase is connected, query and sync live subscription
    const client = getSupabaseClient();
    if (client && user?.id) {
      client
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('current_period_end', { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data, error }) => {
          if (!error && data) {
            const remoteSub: Subscription = {
              id: data.id,
              userId: data.user_id,
              planId: data.plan_id as PlanId,
              status: data.status,
              provider: data.provider,
              billingCycle: data.billing_cycle || 'annual',
              currentPeriodStart: new Date(data.current_period_start).getTime(),
              currentPeriodEnd: new Date(data.current_period_end).getTime(),
              cancelAtPeriodEnd: data.cancel_at_period_end || false,
              updatedAt: new Date(data.updated_at).getTime(),
            };
            try {
              localStorage.setItem(STORAGE_KEY_SUBSCRIPTION, JSON.stringify(remoteSub));
            } catch {
              // ignore
            }
            set({ subscription: remoteSub });
          }
        });

      // 5. Setup Realtime subscription updates (instant automatic activation on webhooks)
      try {
        client
          .channel(`user_sub_${user.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'subscriptions',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              if (payload.new && (payload.new as any).status === 'active') {
                const d = payload.new as any;
                const liveSub: Subscription = {
                  id: d.id,
                  userId: d.user_id,
                  planId: d.plan_id as PlanId,
                  status: d.status,
                  provider: d.provider,
                  billingCycle: d.billing_cycle || 'annual',
                  currentPeriodStart: new Date(d.current_period_start).getTime(),
                  currentPeriodEnd: new Date(d.current_period_end).getTime(),
                  cancelAtPeriodEnd: d.cancel_at_period_end || false,
                  updatedAt: new Date(d.updated_at).getTime(),
                };
                try {
                  localStorage.setItem(STORAGE_KEY_SUBSCRIPTION, JSON.stringify(liveSub));
                } catch {
                  // ignore
                }
                set({ subscription: liveSub });
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('[Entitlements] Realtime subscription listener error:', err);
      }
    }
  },

  can: (feature: FeatureKey) => {
    const user = useAuthStore.getState().user;
    if (user?.email?.toLowerCase() === 'nimjayad@gmail.com') {
      return true;
    }
    const { subscription, trial, dynamicEntitlements } = get();
    return checkCanAccessFeature(feature, subscription, trial, dynamicEntitlements);
  },

  limit: (feature: FeatureKey) => {
    const user = useAuthStore.getState().user;
    if (user?.email?.toLowerCase() === 'nimjayad@gmail.com') {
      return null; // Unlimited for admin
    }
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

  acknowledgeTrialReminder: (reminder: 'day_7' | 'day_12' | 'last_day') => {
    const { trial } = get();
    if (!trial) return;
    const updated = acknowledgeReminder(trial, reminder);
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

    try {
      localStorage.setItem(STORAGE_KEY_SUBSCRIPTION, JSON.stringify(sub));
    } catch {
      // ignore
    }

    set({ subscription: sub });
  },

  cancelSubscription: () => {
    const { subscription } = get();
    if (!subscription) return;

    const updated = {
      ...subscription,
      cancelAtPeriodEnd: true,
      updatedAt: Date.now(),
    };

    try {
      localStorage.setItem(STORAGE_KEY_SUBSCRIPTION, JSON.stringify(updated));
    } catch {
      // ignore
    }

    set({ subscription: updated });
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

// Automatically re-initialize trial and student verification when user authentication state changes
useAuthStore.subscribe((state, prevState) => {
  if (state.user?.id !== prevState.user?.id) {
    useEntitlementsStore.getState().initialize();
  }
});
