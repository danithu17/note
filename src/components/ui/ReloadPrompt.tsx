import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X, DownloadCloud } from 'lucide-react';

export const ReloadPrompt: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Check for service worker updates periodically (every 1 hour)
        setInterval(() => {
          r.update().catch(console.warn);
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.warn('SW registration error:', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center gap-3 p-3.5 bg-slate-900/95 dark:bg-slate-800/95 text-white rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-xl max-w-sm">
        <div className="w-8 h-8 rounded-xl bg-blue-600/30 flex items-center justify-center text-blue-400 shrink-0">
          {needRefresh ? <RefreshCw className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
        </div>

        <div className="flex-1 text-xs">
          {offlineReady ? (
            <p className="font-semibold text-slate-200">ScribbleNote is ready to work offline.</p>
          ) : (
            <div>
              <p className="font-bold text-slate-100">Update available!</p>
              <p className="text-[11px] text-slate-400">A new version has been deployed.</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {needRefresh && (
            <button
              onClick={() => updateServiceWorker(true)}
              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Reload
            </button>
          )}

          <button
            onClick={close}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
