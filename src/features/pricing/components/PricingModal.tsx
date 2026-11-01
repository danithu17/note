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
  ChevronDown,
  ChevronUp,
  Upload,
  CheckCircle2,
  HelpCircle,
  Star,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { platform } from '@/platform';
import { paymentService, type PaymentProvider } from '../../billing/paymentService';
import { useEntitlementsStore } from '../../billing/useEntitlementsStore';
import {
  detectUserRegion,
  FEATURE_CATALOG,
  formatFeatureDisplay,
} from '../../billing/entitlements';
import type { PlanId } from '../../billing/types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const {
    plans,
    dynamicEntitlements,
    trial,
    startTrial,
    applySubscription,
    studentVerification,
    submitStudentId,
  } = useEntitlementsStore();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [provider, setProvider] = useState<PaymentProvider>(() => detectUserRegion().provider);
  const [currency, setCurrency] = useState<'USD' | 'LKR'>(() => detectUserRegion().currency);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Accordion & verification state
  const [showMatrix, setShowMatrix] = useState(true);
  const [showStudentVerification, setShowStudentVerification] = useState(false);
  const [studentInstitution, setStudentInstitution] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [campusSeats, setCampusSeats] = useState(5);

  if (!isOpen) return null;

  const isLkr = currency === 'LKR';

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const res = paymentService.validateCoupon(couponCode);
    if (res.isValid && res.coupon) {
      setAppliedDiscount(res.coupon.discountPercent);
      setCouponError(null);
      confetti({ particleCount: 30, spread: 50 });
    } else {
      setCouponError(res.error || 'Invalid code');
      setAppliedDiscount(null);
    }
  };

  const handleSelectPlan = async (
    planKey: 'free' | 'pro_student' | 'pro' | 'team',
    seatsCount: number = 1
  ) => {
    if (planKey === 'free') {
      onClose();
      return;
    }

    if (planKey === 'pro_student' && studentVerification?.status !== 'verified') {
      setShowStudentVerification(true);
      return;
    }

    const planId: PlanId =
      planKey === 'pro'
        ? billingCycle === 'annual'
          ? 'pro_yearly'
          : 'pro_monthly'
        : planKey;

    // 1. Android Native: Route purchases exclusively through Google Play Billing
    if (platform.capabilities.isNativeApp) {
      const productId =
        planKey === 'pro_student'
          ? billingCycle === 'annual'
            ? 'scribble_student_yearly'
            : 'scribble_student_monthly'
          : billingCycle === 'annual'
            ? 'scribble_pro_yearly'
            : 'scribble_pro_monthly';

      setIsProcessing(planKey);
      try {
        const res = await platform.billing.purchase(productId);
        if (res.success) {
          applySubscription(planId, 'play_store', billingCycle);
          confetti({ particleCount: 50, spread: 70 });
          alert('🎉 Google Play subscription activated! Welcome to ScribbleNote PRO.');
          onClose();
        } else if (res.error) {
          alert(`Google Play billing error: ${res.error}`);
        }
      } catch (err: any) {
        alert('Failed to connect to Google Play: ' + err.message);
      } finally {
        setIsProcessing(null);
      }
      return;
    }

    setIsProcessing(planKey);

    try {
      const res = await paymentService.createCheckoutSession(
        planId,
        provider,
        appliedDiscount ? couponCode : undefined,
        user?.email || 'student@university.edu',
        billingCycle,
        seatsCount
      );

      if (res.success) {
        applySubscription(planId, provider, billingCycle);
        confetti({ particleCount: 50, spread: 70 });

        if (res.checkoutUrl && provider === 'payhere') {
          alert(`🇱🇰 Redirecting to PayHere secure payment portal (${res.amount} LKR)...`);
        } else {
          alert(
            `🎉 Subscription activated! Welcome to ScribbleNote PRO (${planKey === 'team' ? `Campus Lab - ${seatsCount} persons` : 'Pro Scholar'}). Billed via ${provider.toUpperCase()} (${res.amount} ${res.currency}).`
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

  const handleRestorePurchases = async () => {
    setIsProcessing('restore');
    try {
      const res = await platform.billing.restorePurchases();
      if (res.success && res.activeProductIds.length > 0) {
        applySubscription('pro_monthly', 'play_store', 'monthly');
        confetti({ particleCount: 40, spread: 60 });
        alert('✅ Purchases successfully restored from Google Play!');
        onClose();
      } else {
        alert('No active subscriptions found for this Google Play account.');
      }
    } catch (err: any) {
      alert('Failed to restore purchases: ' + err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleStudentIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      submitStudentId(
        studentInstitution || 'University Student',
        file.name,
        reader.result as string
      );
      confetti({ particleCount: 25, spread: 40 });
      alert('📄 Student ID uploaded! Verification usually takes less than 24 hours.');
    };
    reader.readAsDataURL(file);
  };

  const faqs = [
    {
      q: 'How does the automatic 14-day Pro trial work?',
      a: 'Every new account instantly gets 14 days of full Pro Scholar access with no credit card or payment method required. When the trial ends, your account smoothly transitions to the Free tier. Your notes, sketches, and files are NEVER locked or deleted.',
    },
    {
      q: 'What happens to my notes if I downgrade or my trial ends?',
      a: 'ScribbleNote is strictly local-first with Dexie database storage. You can always view, edit, search, and export all your existing notes, drawings, and PDF annotations even if your subscription expires.',
    },
    {
      q: 'How do I qualify for the Pro Student discount?',
      a: 'If you register with an institutional educational email (.edu, .ac.lk, .edu.*), verification is instant! Alternatively, upload a photo of your campus student ID card or semester registration letter for same-day manual review.',
    },
    {
      q: 'What payment methods are supported in Sri Lanka and globally?',
      a: 'Globally, we accept all major Credit/Debit cards and Apple Pay via Stripe (USD). For students and educators in Sri Lanka, we accept local Visa, Mastercard, Genie, eZ Cash, and mCash via PayHere in LKR.',
    },
    {
      q: 'How does Campus Lab per-person pricing work?',
      a: 'Campus Lab is priced per member ($3.99 / mo or Rs. 790 / mo). University research labs, study pods, and academic departments can select the exact seat count needed with centralized billing on a single invoice or payment card.',
    },
    {
      q: 'Can I cancel my subscription anytime?',
      a: 'Yes, with one click in your account settings. You will retain Pro access until the end of your prepaid billing period, with zero hidden cancellation fees.',
    },
  ];

  return (
    <ModalPortal>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl my-auto flex flex-col"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 text-center relative border-b border-slate-100 dark:border-slate-800 shrink-0">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5" /> Commercial Plans & Subscriptions
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Invest in Your Academic Excellence
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto mt-1.5">
              Apple-grade lecture notebook with offline handwriting canvas, PDF markup, synced audio recall, and AI Study Assistant.
            </p>

            {/* Controls Bar: Billing Interval & Currency Switchers */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {/* Billing Cycle Switcher */}
              <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold shadow-inner">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-1.5 rounded-xl transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    billingCycle === 'annual'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <span>Annual Billing</span>
                  <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-tight">
                    Save 33%
                  </span>
                </button>
              </div>

              {/* Currency & Regional Gateway Switcher / Google Play Indicator on Android */}
              {platform.capabilities.isNativeApp ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-xs font-semibold shadow-2xs">
                  <Shield className="w-3.5 h-3.5 text-blue-500" />
                  <span>Google Play Billing</span>
                </div>
              ) : (
                <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold shadow-inner">
                  <button
                    onClick={() => {
                      setCurrency('USD');
                      setProvider('stripe');
                    }}
                    className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                      currency === 'USD'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                    <span>Global (USD $)</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrency('LKR');
                      setProvider('payhere');
                    }}
                    className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                      currency === 'LKR'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5 text-amber-500" />
                    <span>Sri Lanka (LKR Rs.)</span>
                  </button>
                </div>
              )}
            </div>

            {/* 14-Day Free Trial Notice */}
            {(!trial || !trial.isTrialActive) && (
              <div className="mt-4">
                <button
                  onClick={handleStartTrialClick}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors shadow-2xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Start 14-day free Pro Scholar trial (No card required)</span>
                </button>
              </div>
            )}
          </div>

          {/* Pricing Cards Grid (4 Tiers: Free, Pro Student, Pro Scholar, Team) */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Starter Free */}
            <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {plans.free.name}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 min-h-[30px]">
                  {plans.free.description}
                </p>
                <div className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                  {isLkr ? 'Rs. 0' : '$0'}{' '}
                  <span className="text-[11px] font-normal text-slate-400">/ forever</span>
                </div>

                <ul className="space-y-2 text-[11px] text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> 30 notes & 3 notebooks
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Local-first Dexie storage
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Freehand pen & highlighter
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> 1 PDF slide annotate
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> 10 AI queries / month
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlan('free')}
                className="mt-5 w-full py-2 rounded-2xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                {user?.plan === 'free' ? 'Current Plan' : 'Free Forever'}
              </button>
            </div>

            {/* 2. Pro Student (Discounted with Verification) */}
            <div className="p-5 rounded-3xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 flex flex-col justify-between relative shadow-xs">
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-extrabold uppercase tracking-wider">
                Student Special
              </span>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {plans.pro_student.name}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 min-h-[30px]">
                  Verified student discount (.edu / .ac.lk or campus ID).
                </p>
                <div className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                  {isLkr
                    ? billingCycle === 'annual'
                      ? 'Rs. 4,990'
                      : 'Rs. 590'
                    : billingCycle === 'annual'
                      ? '$24.99'
                      : '$2.99'}{' '}
                  <span className="text-[11px] font-normal text-slate-400">
                    / {billingCycle === 'annual' ? 'yr' : 'mo'}
                  </span>
                </div>

                <ul className="space-y-2 text-[11px] text-slate-700 dark:text-slate-200 border-t border-indigo-100 dark:border-indigo-900/40 pt-3">
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> Unlimited notes & books
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> Cloud sync on all devices
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> Unlimited PDF annotation
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> Audio-synced lecture notes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> 300 AI queries / month
                  </li>
                </ul>
              </div>

              <div className="mt-5">
                {studentVerification?.status === 'verified' ? (
                  <button
                    onClick={() => handleSelectPlan('pro_student')}
                    disabled={isProcessing === 'pro_student'}
                    className="w-full py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                  >
                    {isProcessing === 'pro_student'
                      ? 'Processing...'
                      : appliedDiscount
                        ? `Upgrade with ${appliedDiscount}% OFF`
                        : 'Get Pro Student'}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowStudentVerification(true)}
                    className="w-full py-2 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 hover:bg-indigo-200 text-indigo-800 dark:text-indigo-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    Verify Student Status
                  </button>
                )}
              </div>
            </div>

            {/* 3. Pro Scholar (Flagship) */}
            <div className="p-5 rounded-3xl border-2 border-blue-500 bg-white dark:bg-slate-900 shadow-xl shadow-blue-500/10 flex flex-col justify-between relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                Most Popular
              </span>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {plans.pro.name}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 min-h-[30px]">
                  Full lecture power for university students, educators, and engineers.
                </p>
                <div className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                  {isLkr
                    ? billingCycle === 'annual'
                      ? 'Rs. 7,990'
                      : 'Rs. 990'
                    : billingCycle === 'annual'
                      ? '$39.99'
                      : '$4.99'}{' '}
                  <span className="text-[11px] font-normal text-slate-400">
                    / {billingCycle === 'annual' ? 'yr' : 'mo'}
                  </span>
                </div>

                <ul className="space-y-2 text-[11px] text-slate-700 dark:text-slate-200 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" /> Everything in Student
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" /> 10 GB cloud storage
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" /> 500 AI queries / month
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" /> OCR handwriting search
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" /> 30-day version history
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlan('pro')}
                disabled={isProcessing === 'pro'}
                className="mt-5 w-full py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
              >
                {isProcessing === 'pro'
                  ? 'Processing...'
                  : appliedDiscount
                    ? `Upgrade with ${appliedDiscount}% OFF`
                    : 'Upgrade to Pro'}
              </button>
            </div>

            {/* 4. Campus Lab (Per Person / Seat Pricing & Live Calculator) */}
            <div className="p-5 rounded-3xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/20 flex flex-col justify-between relative shadow-xs">
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[9px] font-extrabold uppercase tracking-wider">
                Campus & Labs
              </span>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {plans.team?.name || 'Campus Lab'}
                  </h3>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 min-h-[30px]">
                  Research pods, student lab cohorts, and faculty groups with per-person pricing.
                </p>

                {/* Per Person Price Highlight */}
                <div className="mb-2">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {isLkr
                      ? billingCycle === 'annual'
                        ? 'Rs. 7,990'
                        : 'Rs. 790'
                      : billingCycle === 'annual'
                        ? '$39.99'
                        : '$3.99'}{' '}
                    <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                      / person / {billingCycle === 'annual' ? 'yr' : 'mo'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {billingCycle === 'annual'
                      ? isLkr
                        ? 'Equivalent to ~Rs. 665 / person / month'
                        : 'Equivalent to ~$3.33 / person / month (Save 17%)'
                      : 'Each person billed monthly'}
                  </div>
                </div>

                {/* Interactive Seat / Person Stepper & Live Calculation */}
                <div className="my-2.5 p-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-purple-200/80 dark:border-purple-800/80">
                  <div className="flex items-center justify-between text-[11px] mb-1.5 font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-purple-500" />
                      <span>Lab Members / Seats:</span>
                    </span>
                    <span className="font-mono text-purple-600 dark:text-purple-400 text-xs">
                      {campusSeats} {campusSeats === 1 ? 'Person' : 'Persons'}
                    </span>
                  </div>

                  {/* Stepper + Quick Preset Pills */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 p-0.5">
                      <button
                        type="button"
                        onClick={() => setCampusSeats((s) => Math.max(2, s - 1))}
                        disabled={campusSeats <= 2}
                        className="px-2 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-bold font-mono min-w-[1.8rem] text-center">
                        {campusSeats}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCampusSeats((s) => Math.min(200, s + 1))}
                        className="px-2 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-1 flex-wrap">
                      {[5, 10, 25, 50].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setCampusSeats(preset)}
                          className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-lg transition-colors cursor-pointer ${
                            campusSeats === preset
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-100 dark:hover:bg-purple-950/60'
                          }`}
                        >
                          {preset}p
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calculated Total Breakdown */}
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-purple-100 dark:border-purple-900/40">
                    <span className="text-slate-500 dark:text-slate-400">Total Group:</span>
                    <span className="font-extrabold text-purple-700 dark:text-purple-300 font-mono">
                      {isLkr
                        ? `Rs. ${(billingCycle === 'annual' ? 7990 : 790) * campusSeats}`
                        : `$${(((billingCycle === 'annual' ? 39.99 : 3.99) * campusSeats)).toFixed(2)}`}
                      <span className="text-[10px] font-normal text-slate-400">
                        {' '}/ {billingCycle === 'annual' ? 'yr' : 'mo'}
                      </span>
                    </span>
                  </div>
                </div>

                <ul className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-200 border-t border-purple-100 dark:border-purple-900/40 pt-2.5">
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span><strong>Full Pro for each person</strong> ({campusSeats} seats)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" /> Real-time canvas collaboration
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" /> Shared lab folders & lecture pools
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" /> 100 GB pooled cloud (+10GB/person)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" /> 2,000 AI queries/month per seat
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" /> Single consolidated university invoice
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlan('team', campusSeats)}
                disabled={isProcessing === 'team'}
                className="mt-4 w-full py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all cursor-pointer"
              >
                {isProcessing === 'team'
                  ? 'Processing...'
                  : appliedDiscount
                    ? `Get Campus Lab (${appliedDiscount}% OFF)`
                    : `Subscribe for ${campusSeats} Persons`}
              </button>
            </div>
          </div>

          {/* Student Verification Drawer / Banner */}
          {showStudentVerification && (
            <div className="mx-6 sm:mx-8 mb-4 p-5 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Verify Your Student Status for $2.99 / Rs. 590 Pricing
                  </h4>
                </div>
                <button
                  onClick={() => setShowStudentVerification(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Close
                </button>
              </div>

              {studentVerification?.status === 'verified' ? (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Student status verified ({studentVerification.institution})! You can now subscribe to Pro Student.</span>
                </div>
              ) : studentVerification?.status === 'pending' ? (
                <div className="text-xs text-amber-700 dark:text-amber-300">
                  ⏳ Document under manual review ({studentVerification.documentName}). We will notify you via email shortly.
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="flex-1 text-xs text-slate-600 dark:text-slate-300">
                    <p className="mb-2">
                      If you have an educational email ending in <strong>.edu</strong>, <strong>.ac.lk</strong>, or <strong>.sch.lk</strong>, sign in with that address for instant automated verification.
                    </p>
                    <p>Or upload your student ID card photo below for same-day manual review:</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="University name (e.g. SLIIT, Moratuwa, Stanford)"
                      value={studentInstitution}
                      onChange={(e) => setStudentInstitution(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none"
                    />
                    <label className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-colors whitespace-nowrap">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadedFileName || 'Upload Student ID'}</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleStudentIdUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Coupon Code Input */}
          <div className="px-6 sm:px-8 pb-3">
            <form
              onSubmit={handleApplyCoupon}
              className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 max-w-md mx-auto"
            >
              <Tag className="w-4 h-4 text-slate-400 shrink-0 ml-1.5" />
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponError(null);
                }}
                placeholder="Enter promo or coupon code"
                className="w-full bg-transparent text-xs font-mono uppercase text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-400 placeholder:normal-case"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
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

          {/* Full 18-Row Feature Matrix Toggle */}
          <div className="px-6 sm:px-8 py-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowMatrix(!showMatrix)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>Compare All 18 Features Side-by-Side</span>
              </div>
              {showMatrix ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showMatrix && (
              <div className="mt-3 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3 w-1/3">Feature</th>
                      <th className="p-3 text-center">Starter Free</th>
                      <th className="p-3 text-center text-indigo-600 dark:text-indigo-400">Pro Student</th>
                      <th className="p-3 text-center text-blue-600 dark:text-blue-400 font-black">Pro Scholar</th>
                      <th className="p-3 text-center text-purple-600 dark:text-purple-400">Campus Lab</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {FEATURE_CATALOG.map((feat) => {
                      const freeLimit = dynamicEntitlements.free?.[feat.key];
                      const studentLimit = dynamicEntitlements.pro_student?.[feat.key];
                      const proLimit = dynamicEntitlements.pro?.[feat.key];
                      const teamLimit = dynamicEntitlements.team?.[feat.key];

                      return (
                        <tr key={feat.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-3">
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {feat.label}
                            </div>
                            <div className="text-[10px] text-slate-400">{feat.description}</div>
                          </td>
                          <td className="p-3 text-center text-slate-600 dark:text-slate-400">
                            {formatFeatureDisplay(feat.key, freeLimit)}
                          </td>
                          <td className="p-3 text-center font-semibold text-indigo-600 dark:text-indigo-400">
                            {formatFeatureDisplay(feat.key, studentLimit)}
                          </td>
                          <td className="p-3 text-center font-bold text-blue-600 dark:text-blue-400 bg-blue-50/20 dark:bg-blue-950/10">
                            {formatFeatureDisplay(feat.key, proLimit)}
                          </td>
                          <td className="p-3 text-center font-semibold text-purple-600 dark:text-purple-400">
                            {formatFeatureDisplay(feat.key, teamLimit)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Testimonial Quotes */}
          <div className="px-6 sm:px-8 py-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-1 text-amber-400 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 italic mb-2">
                "The audio sync note player changed how I revise engineering lectures. Clicking a handwritten formula to re-hear what the professor said is brilliant."
              </p>
              <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                — Kasun P., Computer Engineering, University of Moratuwa
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-1 text-amber-400 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 italic mb-2">
                "Instant PDF slide annotation plus AI flashcard generation cuts my study prep in half. Well worth the student subscription."
              </p>
              <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                — Sarah L., Pre-Med Student, Stanford University
              </span>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="px-6 sm:px-8 py-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
            </h4>
            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full p-3 text-left text-xs font-semibold flex items-center justify-between text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {activeFaq === idx ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {activeFaq === idx && (
                    <div className="p-3 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Guarantee / Native Google Play Controls */}
          <div className="px-6 sm:px-8 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3 shrink-0">
            {platform.capabilities.isNativeApp ? (
              <div className="w-full flex flex-col gap-2">
                <div className="flex items-center justify-between w-full">
                  <button
                    type="button"
                    onClick={handleRestorePurchases}
                    disabled={isProcessing === 'restore'}
                    className="font-semibold text-blue-600 dark:text-blue-400 underline hover:opacity-80 transition-opacity cursor-pointer text-xs"
                  >
                    {isProcessing === 'restore' ? 'Restoring...' : 'Restore Purchases'}
                  </button>
                  <button
                    type="button"
                    onClick={() => platform.billing.openSubscriptionManagement()}
                    className="font-semibold text-slate-600 dark:text-slate-300 underline hover:opacity-80 transition-opacity cursor-pointer text-xs"
                  >
                    Manage in Google Play
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-normal">
                  Subscriptions automatically renew unless cancelled in Google Play Subscriptions at least 24 hours before the end of the current billing cycle. Local notes and drawings are never deleted or locked.
                </p>
              </div>
            ) : (
              <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>14-day money-back guarantee. Local data is never deleted or locked.</span>
                </div>
                <span className="font-mono text-[11px]">Pay via Stripe (Global) or PayHere (Sri Lanka)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
