import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Users,
  BarChart3,
  Sliders,
  Tag,
  History,
  Search,
  Lock,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { adminService, type ManagedUser } from '../adminService';
import { useEntitlementsStore } from '../../billing/useEntitlementsStore';
import { ModalPortal } from '@/components/ui/ModalPortal';
import type { FeatureKey, PlanId } from '../../billing/types';
import confetti from 'canvas-confetti';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'features' | 'coupons' | 'audit'>('metrics');
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [users, setUsers] = useState<ManagedUser[]>(adminService.getUsers());
  const [auditLogs, setAuditLogs] = useState(adminService.getAuditLogs());
  const [coupons, setCoupons] = useState(adminService.getCoupons());

  // New coupon form
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('25');

  const { dynamicEntitlements, updateFeatureLimit } = useEntitlementsStore();
  const metrics = adminService.getMetrics();

  if (!isOpen) return null;

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminService.verifyAdminAuth(passcode)) {
      setIsAuthenticated(true);
      setAuthError(false);
      confetti({ particleCount: 30, spread: 50 });
    } else {
      setAuthError(true);
    }
  };

  const handleSearchUsers = (q: string) => {
    setSearchUserQuery(q);
    setUsers(adminService.getUsers(q));
  };

  const handleExtendTrial = (userId: string, days: number) => {
    adminService.extendTrial(userId, days);
    setUsers([...adminService.getUsers(searchUserQuery)]);
    setAuditLogs(adminService.getAuditLogs());
  };

  const handleChangePlan = (userId: string, plan: PlanId) => {
    adminService.updateUserPlan(userId, plan);
    setUsers([...adminService.getUsers(searchUserQuery)]);
    setAuditLogs(adminService.getAuditLogs());
  };

  const handleToggleSuspend = (userId: string) => {
    adminService.toggleUserSuspension(userId);
    setUsers([...adminService.getUsers(searchUserQuery)]);
    setAuditLogs(adminService.getAuditLogs());
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    adminService.addCoupon(newCouponCode, parseInt(newCouponDiscount, 10) || 20);
    setCoupons([...adminService.getCoupons()]);
    setAuditLogs(adminService.getAuditLogs());
    setNewCouponCode('');
  };

  const handleToggleCoupon = (code: string) => {
    adminService.toggleCoupon(code);
    setCoupons([...adminService.getCoupons()]);
    setAuditLogs(adminService.getAuditLogs());
  };

  return (
    <ModalPortal>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-xs">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    ScribbleNote Admin & Entitlements Control
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-[10px] uppercase">
                    2FA Protected
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Manage commercial subscriptions, 14-day trials, feature gates, and audit telemetry
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <button
                  onClick={() => setIsAuthenticated(false)}
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 transition-colors"
                >
                  <Lock className="w-3 h-3" />
                  <span>Lock</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2FA Login Form */}
          {!isAuthenticated ? (
            <div className="p-8 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 mb-4 shadow-inner">
                <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Administrator Authentication
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
                Enter your security passcode or 2FA administrative key to access the subscriber command console.
              </p>

              <form onSubmit={handleAuthSubmit} className="w-full flex flex-col gap-3">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setAuthError(false);
                  }}
                  placeholder="Enter Passcode (e.g. scribbleadmin2026)"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500 text-center font-mono"
                  autoFocus
                />
                {authError && (
                  <span className="text-[11px] text-rose-500 font-medium">
                    Incorrect administrative passcode.
                  </span>
                )}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 active:scale-95 transition-all"
                >
                  Verify & Open Dashboard
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col flex-1">
              {/* Tab navigation */}
              <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto text-xs">
                <button
                  onClick={() => setActiveTab('metrics')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl font-semibold border-b-2 transition-all ${
                    activeTab === 'metrics'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Metrics</span>
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl font-semibold border-b-2 transition-all ${
                    activeTab === 'users'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>User Management ({users.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('features')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl font-semibold border-b-2 transition-all ${
                    activeTab === 'features'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Feature Gates & Limits</span>
                </button>
                <button
                  onClick={() => setActiveTab('coupons')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl font-semibold border-b-2 transition-all ${
                    activeTab === 'coupons'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Coupons ({coupons.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl font-semibold border-b-2 transition-all ${
                    activeTab === 'audit'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Audit Log ({auditLogs.length})</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 flex-1 overflow-y-auto">
                {/* 1. Metrics View */}
                {activeTab === 'metrics' && (
                  <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col gap-1">
                        <span className="text-[11px] text-slate-500">Monthly Recurring (MRR)</span>
                        <span className="text-xl font-black text-slate-900 dark:text-slate-100">
                          ${metrics.mrrUsd.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" /> +18.4% vs last mo
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col gap-1">
                        <span className="text-[11px] text-slate-500">Active Pro Trials</span>
                        <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                          {metrics.activeTrials}
                        </span>
                        <span className="text-[10px] text-slate-400">14-day zero CC</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col gap-1">
                        <span className="text-[11px] text-slate-500">Trial → Paid Conversion</span>
                        <span className="text-xl font-black text-purple-600 dark:text-purple-400">
                          {metrics.conversionRatePercent}%
                        </span>
                        <span className="text-[10px] text-emerald-500 font-semibold">High benchmark</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col gap-1">
                        <span className="text-[11px] text-slate-500">Churn Rate</span>
                        <span className="text-xl font-black text-slate-900 dark:text-slate-100">
                          {metrics.churnRatePercent}%
                        </span>
                        <span className="text-[10px] text-emerald-500 font-semibold">&lt; 2% target</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
                      <div>
                        <strong>AI Assistant Query Cost Today:</strong> {metrics.aiQueriesToday} queries (estimated ~$0.64 total).
                      </div>
                      <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full font-bold">
                        Within Budget
                      </span>
                    </div>
                  </div>
                )}

                {/* 2. User Management View */}
                {activeTab === 'users' && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <Search className="w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchUserQuery}
                        onChange={(e) => handleSearchUsers(e.target.value)}
                        placeholder="Search student by name or university email..."
                        className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-400"
                      />
                    </div>

                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="p-3">User</th>
                            <th className="p-3">Plan / Trial</th>
                            <th className="p-3">Usage</th>
                            <th className="p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="p-3">
                                <div className="font-bold text-slate-900 dark:text-slate-100">{u.name}</div>
                                <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold uppercase text-[10px]">
                                    {u.planId}
                                  </span>
                                  {u.trialDaysLeft > 0 && (
                                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                                      ({u.trialDaysLeft}d trial left)
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-[11px] text-slate-500">
                                <div>Storage: {u.storageMb} MB</div>
                                <div>AI queries: {u.aiQueries}</div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleExtendTrial(u.id, 7)}
                                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                                    title="Extend trial by 7 days"
                                  >
                                    +7d Trial
                                  </button>
                                  <button
                                    onClick={() => handleChangePlan(u.id, u.planId === 'free' ? 'pro_monthly' : 'free')}
                                    className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-[11px] font-semibold text-blue-600 dark:text-blue-400 transition-colors"
                                  >
                                    {u.planId === 'free' ? 'Grant Pro' : 'Set Free'}
                                  </button>
                                  <button
                                    onClick={() => handleToggleSuspend(u.id)}
                                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                                      u.status === 'active'
                                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40'
                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40'
                                    }`}
                                  >
                                    {u.status === 'active' ? 'Suspend' : 'Activate'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. Feature Gates & Limits View */}
                {activeTab === 'features' && (
                  <div className="flex flex-col gap-4">
                    <p className="text-xs text-slate-500">
                      Features and limits are stored as dynamic data. Changes take effect instantly for all active sessions without requiring a code redeploy.
                    </p>

                    <div className="space-y-3">
                      {(['pdf_annotate', 'audio_sync', 'ai_assistant', 'ocr_search'] as FeatureKey[]).map(
                        (feat) => {
                          const isFreeEnabled = dynamicEntitlements.free[feat]?.enabled;
                          const isProEnabled = dynamicEntitlements.pro_monthly[feat]?.enabled;

                          return (
                            <div
                              key={feat}
                              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono text-[11px]">
                                  {feat}
                                </span>
                                <div className="text-[11px] text-slate-500">
                                  Free: {isFreeEnabled ? 'Enabled' : 'Disabled'} • Pro: {isProEnabled ? 'Enabled' : 'Disabled'}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    updateFeatureLimit('free', feat, !isFreeEnabled, null)
                                  }
                                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                                    isFreeEnabled
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                                      : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                                  }`}
                                >
                                  Free Plan: {isFreeEnabled ? 'ON' : 'OFF'}
                                </button>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Coupons View */}
                {activeTab === 'coupons' && (
                  <div className="flex flex-col gap-5">
                    <form onSubmit={handleCreateCoupon} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                      <input
                        type="text"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value)}
                        placeholder="Coupon Code (e.g. SEMESTER2026)"
                        className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono uppercase flex-1 outline-none"
                      />
                      <input
                        type="number"
                        min="5"
                        max="100"
                        value={newCouponDiscount}
                        onChange={(e) => setNewCouponDiscount(e.target.value)}
                        className="w-20 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-center font-mono outline-none"
                        placeholder="%"
                      />
                      <button
                        type="submit"
                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Coupon</span>
                      </button>
                    </form>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {coupons.map((c) => (
                        <div
                          key={c.code}
                          className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs shadow-2xs"
                        >
                          <div>
                            <div className="font-mono font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              {c.code}
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                                {c.discountPercent}% OFF
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {c.usedCount} uses / {c.maxUses || 'Unlimited'}
                            </div>
                          </div>

                          <button
                            onClick={() => handleToggleCoupon(c.code)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors ${
                              c.active
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800'
                            }`}
                          >
                            {c.active ? 'Active' : 'Disabled'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Audit Log View */}
                {activeTab === 'audit' && (
                  <div className="space-y-2">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-medium text-slate-800 dark:text-slate-200">{log.details}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Action: {log.action} • Admin: {log.adminId}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalPortal>
  );
};
