import React, { useState } from 'react';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { useEntitlementsStore } from '../useEntitlementsStore';
import { useCanvasStore } from '@/store/useCanvasStore';

export const TrialBanner: React.FC = () => {
  const { trial } = useEntitlementsStore();
  const { openModal } = useCanvasStore();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!trial || !trial.isTrialActive || isDismissed) {
    return null;
  }

  const isUrgent = trial.daysRemaining <= 2;

  return (
    <div
      className={`px-3 py-1.5 flex items-center justify-between text-xs transition-colors shrink-0 ${
        isUrgent
          ? 'bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 border-b border-amber-500/30 text-amber-900 dark:text-amber-200'
          : 'bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-b border-blue-500/20 text-slate-800 dark:text-slate-200'
      }`}
    >
      <div className="flex items-center gap-2 truncate">
        <span className="p-1 rounded-lg bg-blue-600 text-white shadow-xs shrink-0">
          <Sparkles className="w-3 h-3" />
        </span>
        <span className="font-semibold truncate">
          <strong>14-Day Pro Trial Active:</strong>{' '}
          {trial.daysRemaining === 1
            ? 'Last day of your free trial!'
            : `${trial.daysRemaining} days remaining.`}{' '}
          <span className="hidden md:inline text-slate-500 dark:text-slate-400">
            Enjoy full slide annotations, audio-synced recall, and AI tools.
          </span>
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => openModal('pricing')}
          className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <span>Upgrade</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          title="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
