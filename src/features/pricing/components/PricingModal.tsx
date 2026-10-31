import React, { useState } from 'react';
import { X, Check, Sparkles, Shield, Zap, GraduationCap, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { ModalPortal } from '@/components/ui/ModalPortal';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPlan = (planId: string) => {
    setIsProcessing(planId);
    setTimeout(() => {
      setIsProcessing(null);
      confetti({ particleCount: 50, spread: 70 });
      alert(
        `🎉 Thank you for choosing ScribbleNote ${planId.toUpperCase()}! In production, this redirects to the Stripe / PayHere secure checkout portal.`
      );
      onClose();
    }, 800);
  };

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

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Commercial Plans
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            The Ultimate Lecture Notebook
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            Supercharge your studies with offline handwriting, slide annotations, audio-sync playback, and AI tools.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mt-5">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-emerald-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid (Responsive 1-col on mobile, 3-col on desktop) */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Free Student Tier */}
          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-5 h-5 text-slate-500" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Starter</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Essential offline lecture notes and drawing canvas.
              </p>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                $0 <span className="text-xs font-normal text-slate-400">/ forever</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Local-first offline Dexie database
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Freehand drawing with 5 grid types
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Basic markdown editor with KaTeX math
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
              {user?.plan === 'free' ? 'Current Plan' : 'Get Started'}
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
                Full power for university students, educators, and researchers.
              </p>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                {billingCycle === 'annual' ? '$3.99' : '$4.99'}{' '}
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
                  <Check className="w-4 h-4 text-blue-500 shrink-0" /> AI Study Assistant (summaries & quizzes)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500 shrink-0" /> SM-2 spaced repetition flashcards
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan('pro')}
              disabled={isProcessing === 'pro'}
              className="mt-6 w-full py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all active:scale-95"
            >
              {isProcessing === 'pro' ? 'Redirecting...' : 'Upgrade to Pro'}
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
                {billingCycle === 'annual' ? '$7.99' : '$9.99'}{' '}
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
                  <Check className="w-4 h-4 text-purple-500 shrink-0" /> Live cursor collaboration
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500 shrink-0" /> Institutional SSO (SAML/Google)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500 shrink-0" /> Priority 24/7 technical support
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan('team')}
              disabled={isProcessing === 'team'}
              className="mt-6 w-full py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all active:scale-95"
            >
              {isProcessing === 'team' ? 'Contacting...' : 'Contact Campus Sales'}
            </button>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>14-day student money-back guarantee. Cancel anytime with zero fees.</span>
          </div>
          <span className="font-mono text-[11px]">Pay via Stripe / PayHere / Cards</span>
        </div>
      </div>
    </div>
  </ModalPortal>
  );
};
