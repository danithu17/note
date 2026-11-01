import React, { useEffect, useState } from 'react';
import {
  Clock,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useEntitlementsStore } from '../useEntitlementsStore';
import { checkMilestoneReminder } from '../trialService';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useAuthStore } from '@/core/auth/useAuthStore';

export const TrialMilestoneModal: React.FC = () => {
  const { trial, subscription, acknowledgeTrialReminder } = useEntitlementsStore();
  const { openModal } = useCanvasStore();
  const user = useAuthStore((s) => s.user);

  const isOwnerAdmin = user?.email?.toLowerCase() === 'nimjayad@gmail.com';
  const hasActiveSub = subscription?.status === 'active';

  const [dismissedMilestone, setDismissedMilestone] = useState<string | null>(null);

  const activeMilestone = React.useMemo<'day_7' | 'day_12' | 'last_day' | null>(() => {
    if (isOwnerAdmin || hasActiveSub || !trial || !trial.isTrialActive || trial.daysRemaining > 14) {
      return null;
    }
    const milestone = checkMilestoneReminder(trial);
    if ((milestone === 'last_day' || milestone === 'day_7') && milestone !== dismissedMilestone) {
      return milestone;
    }
    return null;
  }, [isOwnerAdmin, hasActiveSub, trial, dismissedMilestone]);

  // Handle closing and acknowledging reminder so it doesn't show again
  const handleDismiss = React.useCallback(() => {
    if (activeMilestone) {
      acknowledgeTrialReminder(activeMilestone);
      setDismissedMilestone(activeMilestone);
    }
  }, [activeMilestone, acknowledgeTrialReminder]);

  const handleUpgrade = () => {
    if (activeMilestone) {
      acknowledgeTrialReminder(activeMilestone);
      setDismissedMilestone(activeMilestone);
    }
    openModal('pricing');
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeMilestone) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMilestone, handleDismiss]);

  if (!activeMilestone) return null;

  const isLastDay = activeMilestone === 'last_day';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="trial-milestone-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={handleDismiss}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#1c1c1e] rounded-[28px] border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden p-6 sm:p-8 animate-in zoom-in-95 duration-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          aria-label="Dismiss reminder"
          className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Milestone Pill Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm ${
              isLastDay
                ? 'bg-gradient-to-tr from-amber-500 to-rose-500 shadow-rose-500/20'
                : 'bg-gradient-to-tr from-[#0071e3] to-indigo-600 shadow-blue-500/20'
            }`}
          >
            {isLastDay ? (
              <AlertCircle className="w-4 h-4 fill-white text-rose-500" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
          </div>
          <span
            className={`text-[13px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full ${
              isLastDay
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                : 'bg-blue-500/10 text-[#0071e3] dark:text-blue-400 border border-blue-500/20'
            }`}
          >
            {isLastDay ? 'Final 24 Hours • Trial Ending' : '7 Days Remaining • Halfway Check-in'}
          </span>
        </div>

        {/* Headline */}
        <h3
          id="trial-milestone-title"
          className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]"
        >
          {isLastDay
            ? 'Final Day of Your Free Pro Trial'
            : '7 Days Left on Your Free Pro Trial'}
        </h3>

        {/* Description */}
        <p className="mt-3 text-[15px] sm:text-[16px] leading-relaxed text-slate-600 dark:text-slate-300">
          {isLastDay
            ? 'Your 14-day free trial ends tomorrow. After tomorrow, your account will automatically transition to the Starter Free plan.'
            : 'You have completed the first week of your Pro trial! You still have 7 full days of audio-synced recall, slide deck annotation, and AI study flashcards.'}
        </p>

        {/* Reassurance Callout Card */}
        <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-black/30 border border-black/5 dark:border-white/5 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-[13px] text-slate-600 dark:text-slate-400 leading-normal">
            <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">
              Zero Surprise Charges
            </strong>
            No payment method is on file. Your notes, vector drawings, and local audio are 100% safe in Dexie IndexedDB and will never be locked or deleted.
          </div>
        </div>

        {/* Feature bullets */}
        <div className="mt-5 space-y-2 text-[14px] text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0071e3] shrink-0" />
            <span>Slide deck (PDF) markup & export</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0071e3] shrink-0" />
            <span>Tap handwritten strokes to seek synced lecture audio</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0071e3] shrink-0" />
            <span>AI study assistant & spaced-repetition flashcards</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-7 flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-black/[0.08] dark:border-white/10">
          <button
            onClick={handleUpgrade}
            className="w-full sm:flex-1 h-12 px-6 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-[15px] font-semibold shadow-md shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isLastDay ? 'Upgrade to Pro' : 'Keep Pro Scholar (Save 33%)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleDismiss}
            className="w-full sm:w-auto h-12 px-5 rounded-full border border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-[15px] font-medium transition-colors cursor-pointer"
          >
            {isLastDay ? 'Continue with Free' : 'Got it, continue learning'}
          </button>
        </div>
      </div>
    </div>
  );
};
