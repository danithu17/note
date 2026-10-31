import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkCanAccessFeature,
  getFeatureLimit,
  DEFAULT_PLAN_ENTITLEMENTS,
  PLANS,
} from '../features/billing/entitlements';
import {
  initializeUserTrial,
  refreshTrialStatus,
  checkMilestoneReminder,
} from '../features/billing/trialService';
import { paymentService } from '../features/billing/paymentService';
import { adminService } from '../features/admin/adminService';
import type { Subscription, TrialInfo } from '../features/billing/types';

describe('Phase 5 (Replacement): Trial, Subscriptions, Entitlements and Admin', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('14-Day Free Student Trial Logic', () => {
    it('automatically starts a 14-day Pro trial with NO payment method required', () => {
      const trial = initializeUserTrial('user_test_student_1');

      expect(trial.isTrialActive).toBe(true);
      expect(trial.daysRemaining).toBe(14);
      expect(trial.remindersSent).toEqual([]);
      expect(trial.trialEnd).toBeGreaterThan(Date.now());
    });

    it('triggers in-app reminders on day 7, day 12, and the last day', () => {
      const now = Date.now();

      // Day 7 reminder
      const trialDay7: TrialInfo = {
        userId: 'u1',
        trialStart: now - 7 * 86400000,
        trialEnd: now + 7 * 86400000,
        isTrialActive: true,
        daysRemaining: 7,
        remindersSent: [],
      };
      expect(checkMilestoneReminder(trialDay7)).toBe('day_7');

      // Day 12 reminder (2 days remaining)
      const trialDay12: TrialInfo = {
        ...trialDay7,
        daysRemaining: 2,
        remindersSent: ['day_7'],
      };
      expect(checkMilestoneReminder(trialDay12)).toBe('day_12');

      // Last day reminder (1 day remaining)
      const trialLastDay: TrialInfo = {
        ...trialDay7,
        daysRemaining: 1,
        remindersSent: ['day_7', 'day_12'],
      };
      expect(checkMilestoneReminder(trialLastDay)).toBe('last_day');
    });

    it('automatically marks expired trials as inactive without data deletion', () => {
      const now = Date.now();
      const expiredTrial: TrialInfo = {
        userId: 'u_expired',
        trialStart: now - 15 * 86400000,
        trialEnd: now - 1 * 86400000, // 1 day ago
        isTrialActive: true,
        daysRemaining: 0,
        remindersSent: ['day_7', 'day_12', 'last_day'],
      };

      const refreshed = refreshTrialStatus(expiredTrial);
      expect(refreshed.isTrialActive).toBe(false);
      expect(refreshed.daysRemaining).toBe(0);
    });
  });

  describe('Entitlements System & Feature Gating', () => {
    it('restricts premium features on free plan, but unlocks them on trial or pro', () => {
      const trialActive: TrialInfo = {
        userId: 'u_trial',
        trialStart: Date.now(),
        trialEnd: Date.now() + 10 * 86400000,
        isTrialActive: true,
        daysRemaining: 10,
        remindersSent: [],
      };

      const subFree: Subscription = {
        id: 's_free',
        userId: 'u_free',
        planId: 'free',
        status: 'active',
        provider: 'manual',
        currentPeriodStart: Date.now(),
        currentPeriodEnd: Date.now() + 30 * 86400000,
        cancelAtPeriodEnd: false,
        updatedAt: Date.now(),
      };

      const subPro: Subscription = {
        ...subFree,
        id: 's_pro',
        planId: 'pro_monthly',
      };

      // Free plan: no PDF annotations, 100 MB storage limit
      expect(checkCanAccessFeature('pdf_annotate', subFree, null)).toBe(false);
      expect(getFeatureLimit('max_storage_mb', subFree, null)).toBe(100);

      // Active trial: unlocks Pro Scholar features
      expect(checkCanAccessFeature('pdf_annotate', subFree, trialActive)).toBe(true);
      expect(getFeatureLimit('max_storage_mb', subFree, trialActive)).toBe(10240);

      // Paid Pro subscription: unlocks Pro Scholar features
      expect(checkCanAccessFeature('pdf_annotate', subPro, null)).toBe(true);
      expect(checkCanAccessFeature('audio_sync', subPro, null)).toBe(true);
    });

    it('supports dynamic entitlement overrides without code redeployment', () => {
      const customEntitlements = JSON.parse(JSON.stringify(DEFAULT_PLAN_ENTITLEMENTS));

      // Dynamically toggle pdf_annotate to true on free plan
      customEntitlements.free.pdf_annotate.enabled = true;

      const subFree: Subscription = {
        id: 's1',
        userId: 'u1',
        planId: 'free',
        status: 'active',
        provider: 'manual',
        currentPeriodStart: Date.now(),
        currentPeriodEnd: Date.now() + 30 * 86400000,
        cancelAtPeriodEnd: false,
        updatedAt: Date.now(),
      };

      expect(checkCanAccessFeature('pdf_annotate', subFree, null, customEntitlements)).toBe(true);
    });
  });

  describe('Multi-Provider Payment & Coupon Abstraction', () => {
    it('validates active educational coupons and calculates accurate discounts', () => {
      const res = paymentService.validateCoupon('STUDENT50');
      expect(res.isValid).toBe(true);
      expect(res.coupon?.discountPercent).toBe(50);

      const invalidRes = paymentService.validateCoupon('FAKE_CODE_999');
      expect(invalidRes.isValid).toBe(false);
      expect(invalidRes.error).toBeDefined();
    });

    it('creates regional PayHere checkout in LKR with coupon discount', async () => {
      const checkout = await paymentService.createCheckoutSession(
        'pro_monthly',
        'payhere',
        'STUDENT50',
        'kasun@uom.lk'
      );

      expect(checkout.success).toBe(true);
      expect(checkout.currency).toBe('LKR');
      expect(checkout.provider).toBe('payhere');
      expect(checkout.amount).toBe((PLANS.pro_monthly.priceLkr ?? 990) * 0.5); // 50% discount
      expect(checkout.checkoutUrl).toContain('payhere.lk');
    });

    it('creates global Stripe checkout in USD', async () => {
      const checkout = await paymentService.createCheckoutSession('pro_yearly', 'stripe');

      expect(checkout.success).toBe(true);
      expect(checkout.currency).toBe('USD');
      expect(checkout.provider).toBe('stripe');
      expect(checkout.amount).toBe(PLANS.pro_yearly.priceUsd);
      expect(checkout.checkoutUrl).toContain('checkout.stripe.com');
    });
  });

  describe('Admin Dashboard, User Management & Audit Telemetry', () => {
    it('validates 2FA admin authentication passcode', () => {
      expect(adminService.verifyAdminAuth('scribbleadmin2026')).toBe(true);
      expect(adminService.verifyAdminAuth('wrong_passcode')).toBe(false);
    });

    it('logs administrative actions in an immutable audit telemetry log', () => {
      const initialLogCount = adminService.getAuditLogs().length;

      // Admin extends trial for user
      adminService.extendTrial('usr_alex_4', 7, 'admin_sarah');

      const updatedLogs = adminService.getAuditLogs();
      expect(updatedLogs.length).toBeGreaterThan(initialLogCount);
      expect(updatedLogs[0].action).toBe('extend_trial');
      expect(updatedLogs[0].details).toContain('Extended trial by 7 days');
    });

    it('computes accurate SaaS business metrics', () => {
      // When a user has an active paid plan, MRR accurately calculates real subscription value
      adminService.updateUserPlan('usr_alex_4', 'pro');
      const metrics = adminService.getMetrics();
      expect(metrics.totalUsers).toBeGreaterThan(0);
      expect(metrics.mrrUsd).toBeGreaterThan(0);
      expect(metrics.churnRatePercent).toBeLessThan(5);
    });
  });
});
