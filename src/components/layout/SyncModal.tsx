import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  Smartphone,
  Laptop,
  Radio,
  ShieldCheck,
} from 'lucide-react';
import { realtimeSync, getDeviceId, getDeviceName } from '../../utils/sync';
import confetti from 'canvas-confetti';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose }) => {
  const currentConfig = realtimeSync.getCloudConfig() || {};
  const [projectId, setProjectId] = useState(currentConfig.projectId || '');
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    realtimeSync.saveCloudConfig({ projectId, apiKey });
    setIsSaved(true);
    confetti({ particleCount: 30, spread: 50 });
    setTimeout(() => setIsSaved(false), 3000);
  };

  const myDeviceId = getDeviceId();
  const myDeviceName = getDeviceName();
  const peerCount = realtimeSync.getConnectedPeerCount();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Real-Time Multi-Device Sync
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Low-latency peer sync + cloud persistence
            </p>
          </div>
        </div>

        {/* Live Device Status Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 mb-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              Active Sync Mesh
            </span>
            <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
              {peerCount > 0 ? `${peerCount + 1} Devices Synced` : 'Local Mesh Ready'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex-1">
              {myDeviceName.includes('Mobile') ? (
                <Smartphone className="w-4 h-4 text-blue-500" />
              ) : (
                <Laptop className="w-4 h-4 text-blue-500" />
              )}
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {myDeviceName} (This Device)
                </span>
                <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300">
                  ID: {myDeviceId}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            💡 <strong>Multi-Window Testing:</strong> Open another browser tab or window with ScribbleNote to watch drawings and lecture notes stream instantly in real-time between devices!
          </p>
        </div>

        {/* Optional Cloud Sync (Firebase / Supabase) */}
        <form onSubmit={handleSaveConfig} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-blue-500" />
              Firebase / Supabase Cloud Sync (Optional)
            </label>
            <span className="text-[10px] text-slate-600 dark:text-slate-300">
              Offline IndexedDB active by default
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Firebase Project ID or Supabase URL"
              className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API Key / Public Anon Key"
              className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Keys stored locally in browser
            </span>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved & Connected!
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5" /> Save Cloud Config
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
