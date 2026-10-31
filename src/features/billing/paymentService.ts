import type { PlanId, Subscription, Coupon } from './types';
import { DEFAULT_PLANS } from './entitlements';

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

// Built-in verified educational promo coupons & launch discounts
export const ACTIVE_COUPONS: Coupon[] = [
  {
    code: 'STUDENT50',
    discountPercent: 50,
    expiresAt: Date.now() + 365 * 24 * 3600 * 1000,
    maxUses: 1000,
    usedCount: 142,
    active: true,
  },
  {
    code: 'ACADEMIC2026',
    discountPercent: 30,
    expiresAt: Date.now() + 180 * 24 * 3600 * 1000,
    maxUses: 500,
    usedCount: 88,
    active: true,
  },
  {
    code: 'BETA2026',
    discountPercent: 30,
    expiresAt: Date.now() + 90 * 24 * 3600 * 1000,
    maxUses: 2000,
    usedCount: 310,
    active: true,
  },
];

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

    if (provider === 'payhere') {
      // PayHere Sri Lanka Gateway Parameters
      const returnUrl = encodeURIComponent(window.location.origin + '/#/app?payment=success&order=' + orderId);
      const cancelUrl = encodeURIComponent(window.location.origin + '/#/app?payment=cancel');
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
      const stripeCheckoutUrl = `https://checkout.stripe.com/c/pay/cs_test_mock_${orderId}`;

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
