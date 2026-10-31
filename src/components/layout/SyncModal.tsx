import React, { useState, useEffect } from 'react';
import { X, Cloud, Smartphone, Laptop, RefreshCw, WifiOff, AlertTriangle } from 'lucide-react';
import { syncEngine } from '@/core/sync/syncEngine';
import { getDeviceId, getDeviceName } from '@/utils/sync';
import {
  isSupabaseConfigured,
  getStoredSupabaseConfig,
  saveSupabaseConfig,
} from '@/core/supabase/client';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { ModalPortal } from '@/components/ui/ModalPortal';
import confetti from 'canvas-confetti';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose }) => {
  const [syncStatus, setSyncStatus] = useState(syncEngine.getStatus());
  const [isSyncing, setIsSyncing] = useState(false);
  const { openAuthModal } = useAuthStore();

  const existingConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(existingConfig?.url || '');
  const [anonKey, setAnonKey] = useState(existingConfig?.anonKey || '');
  const [isConfigSaved, setIsConfigSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const unsub = syncEngine.subscribe((status) => {
        setSyncStatus(status);
      });
      return unsub;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleForceSync = async () => {
    setIsSyncing(true);
    await syncEngine.forceSync();
    confetti({ particleCount: 20, spread: 40 });
    setIsSyncing(false);
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && anonKey.trim()) {
      saveSupabaseConfig({ url: url.trim(), anonKey: anonKey.trim() });
    } else {
      saveSupabaseConfig(null);
    }
    setIsConfigSaved(true);
    setTimeout(() => setIsConfigSaved(false), 3000);
  };

  const myDeviceId = getDeviceId();
  const myDeviceName = getDeviceName();

  const getStatusBadge = () => {
    switch (syncStatus.state) {
      case 'synced':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            All Changes Synced
          </span>
        );
      case 'syncing':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-500/20 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Syncing Changes...
          </span>
        );
      case 'offline':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-xs font-semibold border border-amber-500/20">
            <WifiOff className="w-3 h-3" />
            Offline Mode
          </span>
        );
      case 'conflict':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20">
            <AlertTriangle className="w-3 h-3" />
            Sync Conflict
          </span>
        );
    }
  };

  return (
    <ModalPortal>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4"
        >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-xs">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Cloud Sync & Mesh Network
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Offline-first data architecture with auto cloud replication
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sync Status Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Connection Status
            </span>
            {getStatusBadge()}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Sync Channel
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                {isSupabaseConfigured() ? 'Supabase Realtime' : 'Local Mesh (Broadcast)'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Outbox Queue
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {syncStatus.pendingQueueCount || 0} pending items
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">
              Last synced:{' '}
              {syncStatus.lastSynced
                ? new Date(syncStatus.lastSynced).toLocaleTimeString()
                : 'Never'}
            </span>
            <button
              onClick={handleForceSync}
              disabled={isSyncing}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync Now</span>
            </button>
          </div>
        </div>

        {/* Device Info */}
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs">
          {myDeviceName.includes('Mobile') ? (
            <Smartphone className="w-4 h-4 text-blue-500 shrink-0" />
          ) : (
            <Laptop className="w-4 h-4 text-blue-500 shrink-0" />
          )}
          <div className="flex flex-col truncate">
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
              {myDeviceName}
            </span>
            <span className="font-mono text-[10px] text-slate-400 truncate">ID: {myDeviceId}</span>
          </div>
        </div>

        {/* Cloud Credentials Form */}
        <form onSubmit={handleSaveSupabase} className="flex flex-col gap-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Supabase Cloud Backend
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                openAuthModal();
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold text-[11px]"
            >
              Account Auth & Plan
            </button>
          </div>

          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Supabase Project URL (e.g. https://xyz.supabase.co)"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 text-xs text-slate-900 dark:text-slate-100"
          />

          <input
            type="password"
            value={anonKey}
            onChange={(e) => setAnonKey(e.target.value)}
            placeholder="Supabase Anon Key"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 text-xs text-slate-900 dark:text-slate-100"
          />

          <button
            type="submit"
            className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-semibold transition-colors"
          >
            Save Cloud Credentials
          </button>

          {isConfigSaved && (
            <span className="text-center text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
              ✓ Credentials updated!
            </span>
          )}
        </form>
      </div>
    </div>
  </ModalPortal>
  );
};
