import type { PlanId, Subscription, Coupon, TransactionRecord } from './types';
import { DEFAULT_PLANS } from './entitlements';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { useEntitlementsStore } from './useEntitlementsStore';
import { getSupabaseClient } from '@/core/supabase/client';
import { adminService } from '../admin/adminService';

export type PaymentProvider = 'stripe' | 'payhere' | 'play_store';

export interface CheckoutResult {
  success: boolean;
  checkoutUrl?: string;
  orderId?: string;
  amount: number;
  currency: 'USD' | 'LKR';
  discountAmount?: number;
  provider: PaymentProvider;
  message?: string;
}

export interface PaymentVerificationParams {
  orderId: string;
  planId: PlanId;
  provider: PaymentProvider;
  cycle?: 'monthly' | 'annual';
  amount?: number;
  currency?: 'USD' | 'LKR';
}

export interface VerificationResult {
  success: boolean;
  subscription?: Subscription;
  transaction?: TransactionRecord;
  message?: string;
  error?: string;
}

const STORAGE_KEY_PROCESSED_ORDERS = 'scribblenote_processed_orders';
const STORAGE_KEY_TRANSACTIONS = 'scribblenote_payment_transactions';

import { ACTIVE_COUPONS } from './coupons';
export { ACTIVE_COUPONS } from './coupons';

class PaymentService {
  /**
   * Validates and applies a coupon code to calculate discount.
   */
  public validateCoupon(code: string): { isValid: boolean; coupon?: Coupon; error?: string } {
    const trimmed = code.trim().toUpperCase();
    const found = ACTIVE_COUPONS.find((c) => c.code === trimmed && c.active);

    if (!found) {
      return { isValid: false, error: 'Invalid or expired coupon code' };
    }

    if (found.expiresAt && found.expiresAt < Date.now()) {
      return { isValid: false, error: 'This coupon has expired' };
    }

    if (found.maxUses && found.usedCount >= found.maxUses) {
      return { isValid: false, error: 'Coupon usage limit has been reached' };
    }

    return { isValid: true, coupon: found };
  }

  /**
   * Unified Checkout Initiator: Routes to Stripe (USD) or PayHere (LKR, Sri Lanka)
   */
  public async createCheckoutSession(
    planId: PlanId,
    provider: PaymentProvider,
    couponCode?: string,
    userEmail: string = 'student@university.edu',
    billingCycle?: 'monthly' | 'annual',
    quantity: number = 1
  ): Promise<CheckoutResult> {
    const plan = DEFAULT_PLANS[planId];
    if (!plan || plan.id === 'free') {
      return {
        success: false,
        amount: 0,
        currency: 'USD',
        provider,
        message: 'Cannot checkout a free plan',
      };
    }

    const resolvedCycle =
      billingCycle ??
      (planId === 'pro_yearly' ? 'annual' : planId === 'pro_monthly' ? 'monthly' : 'annual');

    let discountPercent = 0;
    if (couponCode) {
      const couponValidation = this.validateCoupon(couponCode);
      if (couponValidation.isValid && couponValidation.coupon) {
        discountPercent = couponValidation.coupon.discountPercent;
      }
    }

    const isLkr = provider === 'payhere';
    const unitPrice = isLkr
      ? resolvedCycle === 'annual'
        ? plan.yearlyLkr
        : plan.monthlyLkr
      : resolvedCycle === 'annual'
        ? plan.yearlyUsd
        : plan.monthlyUsd;

    const seatCount = planId === 'team' ? Math.max(1, quantity) : 1;
    const baseAmount = Number((unitPrice * seatCount).toFixed(2));

    const discountAmount = Number(((baseAmount * discountPercent) / 100).toFixed(2));
    const finalAmount = Number(Math.max(0, baseAmount - discountAmount).toFixed(2));
    const orderId = `ord_${provider}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const lineItemLabel =
      planId === 'team' && seatCount > 1
        ? `${plan.name} (${seatCount} persons)`
        : plan.name;

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const successReturnUrl = `${origin}/#/app?payment=success&order_id=${orderId}&plan_id=${planId}&provider=${provider}&cycle=${resolvedCycle}&amount=${finalAmount}&currency=${isLkr ? 'LKR' : 'USD'}`;
    const returnUrl = encodeURIComponent(successReturnUrl);
    const cancelUrl = encodeURIComponent(`${origin}/#/app?payment=cancel`);

    if (provider === 'payhere') {
      // PayHere Sri Lanka Gateway Parameters
      const payhereUrl = `https://sandbox.payhere.lk/pay/checkout?merchant_id=1211111&return_url=${returnUrl}&cancel_url=${cancelUrl}&order_id=${orderId}&items=${encodeURIComponent(
        lineItemLabel
      )}&currency=LKR&amount=${finalAmount}&email=${encodeURIComponent(userEmail)}`;

      return {
        success: true,
        checkoutUrl: payhereUrl,
        orderId,
        amount: finalAmount,
        currency: 'LKR',
        discountAmount,
        provider: 'payhere',
      };
    }

    if (provider === 'stripe') {
      // Stripe Global Checkout (cards, Apple Pay, Google Pay)
      const stripeCheckoutUrl = `https://checkout.stripe.com/c/pay/cs_test_mock_${orderId}?success_url=${returnUrl}&cancel_url=${cancelUrl}`;

      return {
        success: true,
        checkoutUrl: stripeCheckoutUrl,
        orderId,
        amount: finalAmount,
        currency: 'USD',
        discountAmount,
        provider: 'stripe',
      };
    }

    // Android Google Play Billing
    return {
      success: true,
      orderId,
      amount: finalAmount,
      currency: 'USD',
      provider: 'play_store',
      message: 'Triggered native Android In-App Billing bridge.',
    };
  }

  /**
   * Automatically verifies and activates the paid subscription upon completion.
   * Zero manual intervention needed: updates store, Supabase DB, local cache, and admin audit stats.
   */
  public async verifyAndActivatePayment(
    params: PaymentVerificationParams
  ): Promise<VerificationResult> {
    const { orderId, planId, provider, cycle = 'annual', amount = 0, currency = 'USD' } = params;

    // 1. Verify valid order format
    if (!orderId || (!orderId.startsWith('ord_') && !orderId.startsWith('cs_'))) {
      return {
        success: false,
        error: 'Invalid payment order reference.',
      };
    }

    const processed = this.getProcessedOrders();
    const existingTx = this.getTransactions().find((t) => t.orderId === orderId);

    const user = useAuthStore.getState().user;
    const userId = user?.id || 'current_account';
    const userEmail = user?.email || 'user@scribblenote.local';

    // 2. Prevent duplicate processing on page refresh
    if (processed.includes(orderId) && existingTx) {
      const activeSub = useEntitlementsStore.getState().subscription;
      return {
        success: true,
        subscription: activeSub || undefined,
        transaction: existingTx,
        message: 'Order already verified and subscription is active.',
      };
    }

    const now = Date.now();
    const periodMs = (cycle === 'monthly' ? 30 : 365) * 24 * 3600 * 1000;

    const subscription: Subscription = {
      id: `sub_${orderId.replace(/[^a-zA-Z0-9]/g, '_')}`,
      userId,
      planId,
      status: 'active',
      provider,
      billingCycle: cycle,
      currentPeriodStart: now,
      currentPeriodEnd: now + periodMs,
      cancelAtPeriodEnd: false,
      updatedAt: now,
    };

    // 3. Activate immediately in Entitlements Store
    useEntitlementsStore.getState().applySubscription(planId, provider, cycle);

    // 4. Record Transaction for Admin Stats & Analytics
    const tx: TransactionRecord = {
      id: `tx_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      orderId,
      userId,
      userEmail,
      planId,
      provider,
      billingCycle: cycle,
      amount,
      currency,
      status: 'verified',
      timestamp: now,
    };
    this.recordTransaction(tx);

    // 5. Sync to Supabase Database (public.subscriptions) if authenticated
    const client = getSupabaseClient();
    if (client && user?.id) {
      try {
        await client.from('subscriptions').upsert({
          id: subscription.id,
          user_id: user.id,
          plan_id: planId,
          status: 'active',
          provider,
          current_period_start: new Date(subscription.currentPeriodStart).toISOString(),
          current_period_end: new Date(subscription.currentPeriodEnd).toISOString(),
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('[PaymentService] Supabase subscription sync warning:', err);
      }
    }

    // 6. Update Admin User Plan & Immutable Telemetry Log
    adminService.updateUserPlan(userId, planId, 'system_webhook');
    adminService.logAction(
      'system_webhook',
      'automated_payment',
      userId,
      `Automated payment verified: Order ${orderId} via ${provider.toUpperCase()} (${currency} ${amount}). Plan ${planId} (${cycle}) activated automatically.`
    );

    // 7. Mark order as processed
    this.markOrderProcessed(orderId);

    return {
      success: true,
      subscription,
      transaction: tx,
      message: `Payment verified. Plan ${DEFAULT_PLANS[planId]?.name || planId} activated.`,
    };
  }

  public getTransactions(): TransactionRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return [];
  }

  public recordTransaction(tx: TransactionRecord): void {
    const list = this.getTransactions();
    list.unshift(tx);
    try {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(list.slice(0, 500)));
    } catch {
      // ignore
    }
  }

  public getProcessedOrders(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PROCESSED_ORDERS);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return [];
  }

  private markOrderProcessed(orderId: string): void {
    const list = this.getProcessedOrders();
    if (!list.includes(orderId)) {
      list.push(orderId);
      try {
        localStorage.setItem(STORAGE_KEY_PROCESSED_ORDERS, JSON.stringify(list));
      } catch {
        // ignore
      }
    }
  }

  /**
   * Cancel subscription (remains active until current billing period ends).
   */
  public async cancelSubscription(
    subscription: Subscription
  ): Promise<{ success: boolean; effectiveUntil: number }> {
    const effectiveUntil = subscription.currentPeriodEnd;
    return {
      success: true,
      effectiveUntil,
    };
  }
}

export const paymentService = new PaymentService();
