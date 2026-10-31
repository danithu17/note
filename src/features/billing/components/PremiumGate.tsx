import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import type { FeatureKey } from '../types';
import { useEntitlementsStore } from '../useEntitlementsStore';
import { useCanvasStore } from '@/store/useCanvasStore';

interface PremiumGateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  featureName?: string;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({
  feature,
  children,
  fallback,
  featureName = 'Pro Scholar Feature',
}) => {
  const { can } = useEntitlementsStore();
  const { openModal } = useCanvasStore();

  const isAllowed = can(feature);

  if (isAllowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 text-center flex flex-col items-center gap-3 shadow-lg my-4 max-w-lg mx-auto">
      <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
        <Sparkles className="w-5 h-5" />
      </div>

      <div className="flex flex-col gap-1">
        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Unlock {featureName}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
          This feature is available with your 14-day free trial or Pro Scholar plan. Zero data lock-in guarantee.
        </p>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={() => openModal('pricing')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <span>Upgrade to Pro</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>14-day student trial with no payment method required</span>
      </div>
    </div>
  );
};
