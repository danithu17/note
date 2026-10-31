import React, { useState } from 'react';
import {
  X,
  Check,
  Sparkles,
  Shield,
  Zap,
  GraduationCap,
  Users,
  Tag,
  CreditCard,
  Building,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { paymentService, type PaymentProvider } from '../../billing/paymentService';
import { useEntitlementsStore } from '../../billing/useEntitlementsStore';
import type { PlanId } from '../../billing/types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { trial, startTrial, applySubscription } = useEntitlementsStore();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [provider, setProvider] = useState<PaymentProvider>('stripe');
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const res = paymentService.validateCoupon(couponCode);
    if (res.isValid && res.coupon) {
      setAppliedDiscount(res.coupon.discountPercent);
      setCouponError(null);
      confetti({ particleCount: 25, spread: 45 });
    } else {
      setCouponError(res.error || 'Invalid code');
      setAppliedDiscount(null);
    }
  };

  const handleSelectPlan = async (planKey: 'free' | 'pro' | 'team') => {
    if (planKey === 'free') {
      onClose();
      return;
    }

    const planId: PlanId =
      planKey === 'pro'
        ? billingCycle === 'annual'
          ? 'pro_yearly'
          : 'pro_monthly'
        : 'team';

    setIsProcessing(planKey);

    try {
      const res = await paymentService.createCheckoutSession(
        planId,
        provider,
        appliedDiscount ? couponCode : undefined,
        user?.email || 'student@university.edu'
      );

      if (res.success) {
        applySubscription(planId, provider);
        confetti({ particleCount: 50, spread: 70 });

        if (res.checkoutUrl && provider === 'payhere') {
          alert(`🇱🇰 Redirecting to PayHere secure payment portal (${res.amount} LKR)...`);
        } else {
          alert(
            `🎉 Subscription activated! Welcome to ScribbleNote PRO. Billed via ${provider.toUpperCase()} (${res.amount} ${res.currency}).`
          );
        }
        onClose();
      }
    } finally {
      setIsProcessing(null);
    }
  };

  const handleStartTrialClick = () => {
    startTrial();
    confetti({ particleCount: 40, spread: 60 });
    alert('🎉 14-day Pro Scholar trial started! No credit card or payment method required.');
    onClose();
  };

  const isLkr = provider === 'payhere';

  return (
    <ModalPortal>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl my-auto flex flex-col"
        >
          {/* Header */}
          <div className="p-6 text-center relative border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Commercial Plans & Subscriptions
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              The Ultimate Lecture Notebook
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              Supercharge your studies with offline handwriting, slide annotations, audio-sync playback, and AI tools.
            </p>

            {/* Trial Banner or Currency Switcher */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {/* Billing Cycle Switcher */}
              <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1 ${
                    billingCycle === 'annual'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  <span>Annual</span>
                  <span className="text-[10px] bg-emerald-500 text-white font-bold px-1.5 rounded-full">
                    -33%
                  </span>
                </button>
              </div>

              {/* Currency & Gateway Switcher */}
              <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs">
                <button
                  onClick={() => setProvider('stripe')}
                  className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 transition-all ${
                    provider === 'stripe'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                  <span>Global (USD)</span>
                </button>
                <button
                  onClick={() => setProvider('payhere')}
                  className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 transition-all ${
                    provider === 'payhere'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  <Building className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sri Lanka (LKR)</span>
                </button>
              </div>
            </div>

            {/* 14-Day Free Trial Reassurance */}
            {(!trial || !trial.isTrialActive) && (
              <div className="mt-3">
                <button
                  onClick={handleStartTrialClick}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                >
                  <span>✨ Click here to start 14-day free Pro trial (No credit card needed)</span>
                </button>
              </div>
            )}
          </div>

          {/* Pricing Cards Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Free Student Tier */}
            <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-5 h-5 text-slate-500" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Starter Free</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Essential offline lecture notes and drawing canvas.
                </p>
                <div className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                  {isLkr ? 'Rs. 0' : '$0'}{' '}
                  <span className="text-xs font-normal text-slate-400">/ forever</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Local-first offline Dexie database
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Freehand drawing with 5 grid backgrounds
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Markdown notes & syntax code blocks
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" /> PNG & SVG diagram export
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlan('free')}
                className="mt-6 w-full py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
              >
                {user?.plan === 'free' ? 'Current Plan' : 'Stay on Free'}
              </button>
            </div>

            {/* 2. Pro Scholar Tier (Featured) */}
            <div className="p-5 rounded-3xl border-2 border-blue-500 bg-white dark:bg-slate-900 shadow-xl shadow-blue-500/10 flex flex-col justify-between relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                Most Popular
              </span>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Pro Scholar</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Full power for university students, educators, and engineers.
                </p>
                <div className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                  {isLkr
                    ? billingCycle === 'annual'
                      ? 'Rs. 1,000'
                      : 'Rs. 1,500'
                    : billingCycle === 'annual'
                      ? '$3.33'
                      : '$4.99'}{' '}
                  <span className="text-xs font-normal text-slate-400">/ month</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-200">
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-blue-500 shrink-0" /> Everything in Starter
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-500 shrink-0" /> Multi-device Supabase cloud sync
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-500 shrink-0" /> PDF & PPT slide deck import & annotate
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-500 shrink-0" /> Audio-synced seekable lecture notes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-500 shrink-0" /> AI Study Assistant & chat summaries
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-500 shrink-0" /> 10 GB cloud storage allocation
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlan('pro')}
                disabled={isProcessing === 'pro'}
                className="mt-6 w-full py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
              >
                {isProcessing === 'pro'
                  ? 'Processing...'
                  : appliedDiscount
                    ? `Upgrade with ${appliedDiscount}% OFF`
                    : 'Upgrade to Pro'}
              </button>
            </div>

            {/* 3. Campus / Team Tier */}
            <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Campus / Lab</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  For research groups, university departments, and study pods.
                </p>
                <div className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                  {isLkr ? 'Rs. 2,500' : '$7.99'}{' '}
                  <span className="text-xs font-normal text-slate-400">/ seat / mo</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-purple-500 shrink-0" /> Everything in Pro Scholar
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-500 shrink-0" /> Shared workspace & course folders
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-500 shrink-0" /> 100 GB team cloud storage
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-500 shrink-0" /> Priority 24/7 technical support
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlan('team')}
                disabled={isProcessing === 'team'}
                className="mt-6 w-full py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all active:scale-95 cursor-pointer"
              >
                {isProcessing === 'team' ? 'Processing...' : 'Choose Team Plan'}
              </button>
            </div>
          </div>

          {/* Coupon Code Bar */}
          <div className="px-6 pb-2">
            <form onSubmit={handleApplyCoupon} className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 max-w-md mx-auto">
              <Tag className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponError(null);
                }}
                placeholder="Promo Code (try: STUDENT50)"
                className="w-full bg-transparent text-xs font-mono uppercase text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-400 placeholder:normal-case"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Apply
              </button>
            </form>
            {appliedDiscount && (
              <div className="text-center text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1.5">
                ✓ Coupon applied: {appliedDiscount}% discount activated!
              </div>
            )}
            {couponError && (
              <div className="text-center text-xs text-rose-500 font-medium mt-1.5">
                {couponError}
              </div>
            )}
          </div>

          {/* Footer Guarantee */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>14-day student money-back guarantee. Cancel anytime with zero penalties.</span>
            </div>
            <span className="font-mono text-[11px]">Secure Checkout via Stripe & PayHere</span>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
