import { describe, it, expect, beforeEach } from 'vitest';
import {
  detectUserRegion,
  isEducationalEmail,
  checkCanAccessFeature,
  getFeatureLimit,
  formatFeatureDisplay,
  FEATURE_CATALOG,
  DEFAULT_PLANS,
  DEFAULT_PLAN_ENTITLEMENTS,
} from '@/features/billing/entitlements';
import { useEntitlementsStore } from '@/features/billing/useEntitlementsStore';
import { paymentService } from '@/features/billing/paymentService';

describe('Phase 5: Pricing, Plans & 18-Feature Matrix Specification', () => {
  beforeEach(() => {
    localStorage.clear();
    useEntitlementsStore.setState({
      subscription: null,
      trial: null,
      studentVerification: null,
      monthlyAiUsage: 0,
      pricingVariant: 'variant_a',
      plans: { ...DEFAULT_PLANS },
      dynamicEntitlements: JSON.parse(JSON.stringify(DEFAULT_PLAN_ENTITLEMENTS)),
    });
  });

  describe('1. Educational Email Auto-Detection', () => {
    it('should correctly identify student email domains', () => {
      expect(isEducationalEmail('kasun@sliit.lk')).toBe(false); // only .ac.lk or .edu
      expect(isEducationalEmail('kasun@uom.ac.lk')).toBe(true);
      expect(isEducationalEmail('student@stanford.edu')).toBe(true);
      expect(isEducationalEmail('student@oxford.ac.uk')).toBe(true);
      expect(isEducationalEmail('student@sydney.edu.au')).toBe(true);
      expect(isEducationalEmail('student@ananda.sch.lk')).toBe(true);
    });

    it('should reject non-educational personal emails', () => {
      expect(isEducationalEmail('student@gmail.com')).toBe(false);
      expect(isEducationalEmail('user@outlook.com')).toBe(false);
      expect(isEducationalEmail('developer@company.io')).toBe(false);
      expect(isEducationalEmail('')).toBe(false);
    });
  });

  describe('2. Regional Auto-Detection', () => {
    it('detectUserRegion returns currency and provider info', () => {
      const region = detectUserRegion();
      expect(['USD', 'LKR']).toContain(region.currency);
      expect(['stripe', 'payhere']).toContain(region.provider);
      expect(typeof region.isSriLanka).toBe('boolean');
    });
  });

  describe('3. 18-Feature Matrix Catalog & Limits', () => {
    it('should define exactly the required 18 features in FEATURE_CATALOG', () => {
      expect(FEATURE_CATALOG.length).toBe(19); // 18 keys + themes_accents
      const keys = FEATURE_CATALOG.map((f) => f.key);
      expect(keys).toContain('notes_count');
      expect(keys).toContain('notebooks_count');
      expect(keys).toContain('storage_mb');
      expect(keys).toContain('cloud_sync');
      expect(keys).toContain('devices');
      expect(keys).toContain('canvas_basic_tools');
      expect(keys).toContain('canvas_advanced');
      expect(keys).toContain('pdf_import_annotate');
      expect(keys).toContain('audio_record_minutes_per_note');
      expect(keys).toContain('audio_synced_notes');
      expect(keys).toContain('ocr_handwriting_search');
      expect(keys).toContain('ai_assistant_messages_per_month');
      expect(keys).toContain('ai_flashcards_quiz');
      expect(keys).toContain('version_history_days');
      expect(keys).toContain('export_formats');
      expect(keys).toContain('share_links');
      expect(keys).toContain('collaboration');
      expect(keys).toContain('priority_support');
    });

    it('enforces Free plan limits correctly', () => {
      // Free plan constraints
      expect(checkCanAccessFeature('canvas_basic_tools', null, null)).toBe(true);
      expect(checkCanAccessFeature('canvas_advanced', null, null)).toBe(false);
      expect(checkCanAccessFeature('cloud_sync', null, null)).toBe(false);
      expect(checkCanAccessFeature('audio_synced_notes', null, null)).toBe(false);
      expect(checkCanAccessFeature('ocr_handwriting_search', null, null)).toBe(false);

      expect(getFeatureLimit('notes_count', null, null)).toBe(30);
      expect(getFeatureLimit('notebooks_count', null, null)).toBe(3);
      expect(getFeatureLimit('audio_record_minutes_per_note', null, null)).toBe(10);
      expect(getFeatureLimit('ai_assistant_messages_per_month', null, null)).toBe(10);
    });

    it('enforces Pro Scholar plan privileges when subscribed', () => {
      const proSub = {
        id: 'sub_pro_1',
        userId: 'usr_1',
        planId: 'pro' as const,
        status: 'active' as const,
        provider: 'stripe' as const,
        currentPeriodStart: Date.now(),
        currentPeriodEnd: Date.now() + 30 * 86400000,
        cancelAtPeriodEnd: false,
        updatedAt: Date.now(),
      };

      expect(checkCanAccessFeature('canvas_advanced', proSub, null)).toBe(true);
      expect(checkCanAccessFeature('cloud_sync', proSub, null)).toBe(true);
      expect(checkCanAccessFeature('audio_synced_notes', proSub, null)).toBe(true);
      expect(checkCanAccessFeature('ocr_handwriting_search', proSub, null)).toBe(true);

      expect(getFeatureLimit('notes_count', proSub, null)).toBeNull(); // Unlimited
      expect(getFeatureLimit('storage_mb', proSub, null)).toBe(10240); // 10 GB
      expect(getFeatureLimit('ai_assistant_messages_per_month', proSub, null)).toBe(500);
    });

    it('enforces Pro Student limits (300 AI queries/month)', () => {
      const studentSub = {
        id: 'sub_student_1',
        userId: 'usr_student',
        planId: 'pro_student' as const,
        status: 'active' as const,
        provider: 'payhere' as const,
        currentPeriodStart: Date.now(),
        currentPeriodEnd: Date.now() + 30 * 86400000,
        cancelAtPeriodEnd: false,
        updatedAt: Date.now(),
      };

      expect(checkCanAccessFeature('cloud_sync', studentSub, null)).toBe(true);
      expect(getFeatureLimit('ai_assistant_messages_per_month', studentSub, null)).toBe(300);
      expect(getFeatureLimit('notes_count', studentSub, null)).toBeNull();
    });

    it('formats feature display strings nicely for comparison table', () => {
      expect(
        formatFeatureDisplay('storage_mb', { featureKey: 'storage_mb', enabled: true, limit: 10240 })
      ).toBe('10 GB');

      expect(
        formatFeatureDisplay('notes_count', { featureKey: 'notes_count', enabled: true, limit: null })
      ).toBe('Unlimited');

      expect(
        formatFeatureDisplay('cloud_sync', { featureKey: 'cloud_sync', enabled: false, limit: null })
      ).toBe('Off');

      expect(
        formatFeatureDisplay('storage_mb', {
          featureKey: 'storage_mb',
          enabled: true,
          limit: 100,
          customNote: 'Local only',
        })
      ).toBe('Local only');
    });
  });

  describe('4. AI Assistant Monthly Metering & Credit Caps', () => {
    it('tracks remaining AI assistant credits properly for Free user', () => {
      const store = useEntitlementsStore.getState();
      const initialCredits = store.getRemainingAiCredits();
      expect(initialCredits.total).toBe(10);
      expect(initialCredits.used).toBe(0);
      expect(initialCredits.remaining).toBe(10);

      // Consume 3 queries
      store.incrementAiUsage();
      store.incrementAiUsage();
      store.incrementAiUsage();

      const afterCredits = useEntitlementsStore.getState().getRemainingAiCredits();
      expect(afterCredits.used).toBe(3);
      expect(afterCredits.remaining).toBe(7);
    });

    it('returns Unlimited credits for plans with null limits', () => {
      useEntitlementsStore.getState().updateFeatureLimit('free', 'ai_assistant_messages_per_month', true, null);
      const credits = useEntitlementsStore.getState().getRemainingAiCredits();
      expect(credits.total).toBeNull();
      expect(credits.remaining).toBeNull();
    });
  });

  describe('5. Student Verification Flow', () => {
    it('handles student ID upload and admin verification', () => {
      const store = useEntitlementsStore.getState();
      store.submitStudentId('University of Colombo', 'student_card.jpg', 'data:image/jpeg;base64,mock');

      expect(useEntitlementsStore.getState().studentVerification?.status).toBe('pending');
      expect(useEntitlementsStore.getState().studentVerification?.institution).toBe('University of Colombo');

      // Admin reviews and approves
      store.verifyStudentStatus('verified');
      expect(useEntitlementsStore.getState().studentVerification?.status).toBe('verified');
      expect(useEntitlementsStore.getState().studentVerification?.verifiedAt).toBeDefined();
    });
  });

  describe('6. Admin Price & Feature Matrix Dynamic Mutations', () => {
    it('allows admin to edit prices dynamically without redeploying code', () => {
      const store = useEntitlementsStore.getState();
      store.updatePlanPrice('pro', 5.99, 49.99, 1200, 9900);

      const updatedPro = useEntitlementsStore.getState().plans.pro;
      expect(updatedPro.monthlyUsd).toBe(5.99);
      expect(updatedPro.yearlyUsd).toBe(49.99);
      expect(updatedPro.monthlyLkr).toBe(1200);
      expect(updatedPro.yearlyLkr).toBe(9900);
    });

    it('allows admin to edit feature gates and numeric limits dynamically', () => {
      const store = useEntitlementsStore.getState();
      // Increase free plan notes limit from 30 to 50
      store.updateFeatureLimit('free', 'notes_count', true, 50);

      expect(useEntitlementsStore.getState().limit('notes_count')).toBe(50);

      // Turn on cloud sync for free plan dynamically
      store.updateFeatureLimit('free', 'cloud_sync', true, null);
      expect(useEntitlementsStore.getState().can('cloud_sync')).toBe(true);
    });

    it('supports A/B testing toggle between pricing variants', () => {
      const store = useEntitlementsStore.getState();
      expect(store.pricingVariant).toBe('variant_a');

      store.setPricingVariant('variant_b');
      expect(useEntitlementsStore.getState().pricingVariant).toBe('variant_b');
    });
  });

  describe('7. Coupon Code Engine', () => {
    it('validates STUDENT50 (50% off) and BETA2026 (30% off)', () => {
      const student50 = paymentService.validateCoupon('STUDENT50');
      expect(student50.isValid).toBe(true);
      expect(student50.coupon?.discountPercent).toBe(50);

      const beta2026 = paymentService.validateCoupon('beta2026');
      expect(beta2026.isValid).toBe(true);
      expect(beta2026.coupon?.discountPercent).toBe(30);

      const invalid = paymentService.validateCoupon('UNKNOWN');
      expect(invalid.isValid).toBe(false);
      expect(invalid.error).toBe('Invalid or expired coupon code');
    });
  });

  describe('8. Automatic 14-Day Pro Trial Initialization', () => {
    it('automatically starts a 14-day Pro trial on initialize without requiring user action', () => {
      localStorage.clear();
      useEntitlementsStore.setState({ trial: null, subscription: null });

      useEntitlementsStore.getState().initialize();

      const trial = useEntitlementsStore.getState().trial;
      expect(trial).not.toBeNull();
      expect(trial?.isTrialActive).toBe(true);
      expect(trial?.daysRemaining).toBe(14);
      expect(useEntitlementsStore.getState().can('canvas_advanced')).toBe(true);
      expect(useEntitlementsStore.getState().can('cloud_sync')).toBe(true);
    });
  });

  describe('9. Campus Lab Per-Person Pricing & Multi-Seat Checkout', () => {
    it('defines Campus Lab with per-person rate ($3.99 / Rs. 790)', () => {
      const teamPlan = DEFAULT_PLANS.team;
      expect(teamPlan.name).toBe('Campus Lab');
      expect(teamPlan.monthlyUsd).toBe(3.99);
      expect(teamPlan.monthlyLkr).toBe(790);
      expect(teamPlan.badge).toContain('Campus');
    });

    it('calculates accurate group checkout amounts based on seat quantity', async () => {
      // 5 seats checkout via Stripe (USD): 5 * $3.99 = $19.95
      const usdCheckout = await paymentService.createCheckoutSession(
        'team',
        'stripe',
        undefined,
        'lab@stanford.edu',
        'monthly',
        5
      );
      expect(usdCheckout.success).toBe(true);
      expect(usdCheckout.amount).toBe(19.95);
      expect(usdCheckout.currency).toBe('USD');

      // 10 seats checkout via PayHere (LKR): 10 * Rs. 790 = Rs. 7,900
      const lkrCheckout = await paymentService.createCheckoutSession(
        'team',
        'payhere',
        undefined,
        'lab@uom.lk',
        'monthly',
        10
      );
      expect(lkrCheckout.success).toBe(true);
      expect(lkrCheckout.amount).toBe(7900);
      expect(lkrCheckout.currency).toBe('LKR');
    });
  });
});
