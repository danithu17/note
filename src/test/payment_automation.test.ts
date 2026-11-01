import { describe, it, expect, beforeEach } from 'vitest';
import { paymentService } from '../features/billing/paymentService';
import { useEntitlementsStore } from '../features/billing/useEntitlementsStore';
import { adminService } from '../features/admin/adminService';
import { useAuthStore } from '../core/auth/useAuthStore';

describe('Automated Payment Verification & Subscription Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      user: {
        id: 'usr_test_payee',
        email: 'payee@university.edu',
        name: 'Alex Payee',
        isGuest: false,
        plan: 'free',
        storageUsedBytes: 0,
        storageLimitBytes: 100 * 1024 * 1024,
      },
    });

    useEntitlementsStore.setState({
      subscription: null,
      trial: null,
      monthlyAiUsage: 0,
    });
  });

  it('automatically verifies Stripe payment and activates Pro Scholar subscription', async () => {
    const orderId = 'ord_stripe_test_12345';
    const res = await paymentService.verifyAndActivatePayment({
      orderId,
      planId: 'pro',
      provider: 'stripe',
      cycle: 'annual',
      amount: 39.99,
      currency: 'USD',
    });

    expect(res.success).toBe(true);
    expect(res.subscription).toBeDefined();
    expect(res.subscription?.planId).toBe('pro');
    expect(res.subscription?.status).toBe('active');

    // Entitlements should be unlocked immediately
    const entitlements = useEntitlementsStore.getState();
    expect(entitlements.can('pdf_import_annotate')).toBe(true);
    expect(entitlements.can('audio_synced_notes')).toBe(true);
    expect(entitlements.can('ocr_handwriting_search')).toBe(true);
    expect(entitlements.subscription?.status).toBe('active');
  });

  it('automatically verifies PayHere Sri Lanka payment in LKR and activates plan', async () => {
    const orderId = 'ord_payhere_lkr_67890';
    const res = await paymentService.verifyAndActivatePayment({
      orderId,
      planId: 'pro',
      provider: 'payhere',
      cycle: 'annual',
      amount: 7990,
      currency: 'LKR',
    });

    expect(res.success).toBe(true);
    expect(res.subscription?.provider).toBe('payhere');
    expect(res.transaction?.currency).toBe('LKR');
    expect(res.transaction?.amount).toBe(7990);
  });

  it('handles duplicate return callbacks idempotently without duplicating transactions', async () => {
    const orderId = 'ord_stripe_duplicate_check';

    // First verification
    const res1 = await paymentService.verifyAndActivatePayment({
      orderId,
      planId: 'pro_student',
      provider: 'stripe',
      cycle: 'annual',
      amount: 24.99,
      currency: 'USD',
    });
    expect(res1.success).toBe(true);

    const initialTxCount = paymentService.getTransactions().length;

    // Second verification with identical orderId (e.g. user refreshed the page)
    const res2 = await paymentService.verifyAndActivatePayment({
      orderId,
      planId: 'pro_student',
      provider: 'stripe',
      cycle: 'annual',
      amount: 24.99,
      currency: 'USD',
    });
    expect(res2.success).toBe(true);
    expect(res2.message).toContain('already verified');

    // Transactions count must not duplicate
    const finalTxCount = paymentService.getTransactions().length;
    expect(finalTxCount).toBe(initialTxCount);
  });

  it('records automated payment telemetry into admin business metrics', async () => {
    await paymentService.verifyAndActivatePayment({
      orderId: 'ord_stripe_stats_1',
      planId: 'pro',
      provider: 'stripe',
      cycle: 'annual',
      amount: 39.99,
      currency: 'USD',
    });

    await paymentService.verifyAndActivatePayment({
      orderId: 'ord_payhere_stats_2',
      planId: 'pro_student',
      provider: 'payhere',
      cycle: 'annual',
      amount: 4990,
      currency: 'LKR',
    });

    const metrics = adminService.getMetrics();
    expect(metrics.totalAutomatedTransactions).toBeGreaterThanOrEqual(2);
    expect(metrics.stripeVolumeUsd).toBeGreaterThanOrEqual(39.99);
    expect(metrics.payhereVolumeLkr).toBeGreaterThanOrEqual(4990);
    expect(metrics.paidSubscribers).toBeGreaterThanOrEqual(1);
    expect(metrics.mrrUsd).toBeGreaterThan(0);

    // Audit telemetry check
    const auditLogs = adminService.getAuditLogs();
    const automatedLog = auditLogs.find((l) => l.action === 'automated_payment');
    expect(automatedLog).toBeDefined();
    expect(automatedLog?.adminId).toBe('system_webhook');
  });
});
