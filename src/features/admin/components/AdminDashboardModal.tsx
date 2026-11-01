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
  Plus,
  TrendingUp,
  DollarSign,
  GraduationCap,
  CheckCircle,
  XCircle,
  FlaskConical,
  CreditCard,
  CheckCircle2,
  Crown,
  Sparkles,
  ShieldCheck,
  HardDrive,
  Cpu,
} from 'lucide-react';
import { adminService, type ManagedUser } from '../adminService';
import { useEntitlementsStore } from '../../billing/useEntitlementsStore';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { ModalPortal } from '@/components/ui/ModalPortal';
import {
  FEATURE_CATALOG,
  formatFeatureDisplay,
} from '../../billing/entitlements';
import type { FeatureKey, PlanId, PricingVariant } from '../../billing/types';
import confetti from 'canvas-confetti';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
  const user = useAuthStore((s) => s.user);
  const isOwnerAdmin = user?.email?.toLowerCase() === 'nimjayad@gmail.com';

  const [activeTab, setActiveTab] = useState<
    'god' | 'metrics' | 'pricing' | 'features' | 'students' | 'users' | 'coupons' | 'audit'
  >('god');

  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [users, setUsers] = useState<ManagedUser[]>(adminService.getUsers());
  const [auditLogs, setAuditLogs] = useState(adminService.getAuditLogs());
  const [coupons, setCoupons] = useState(adminService.getCoupons());

  // Dynamic state from store
  const {
    plans,
    dynamicEntitlements,
    pricingVariant,
    studentVerification,
    updatePlanPrice,
    updateFeatureLimit,
    setPricingVariant,
    verifyStudentStatus,
  } = useEntitlementsStore();

  // Price editing state
  const [editingPlan, setEditingPlan] = useState<PlanId>('pro');
  const [editMonthlyUsd, setEditMonthlyUsd] = useState(() => plans['pro']?.monthlyUsd.toString() || '9.99');
  const [editYearlyUsd, setEditYearlyUsd] = useState(() => plans['pro']?.yearlyUsd.toString() || '79.99');
  const [editMonthlyLkr, setEditMonthlyLkr] = useState(() => plans['pro']?.monthlyLkr.toString() || '2999');
  const [editYearlyLkr, setEditYearlyLkr] = useState(() => plans['pro']?.yearlyLkr.toString() || '23999');

  // Selected plan for feature limits
  const [selectedFeaturePlan, setSelectedFeaturePlan] = useState<PlanId>('free');

  // New coupon form
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('25');

  const metrics = adminService.getMetrics();

  if (!isOpen) return null;

  if (!isOwnerAdmin) {
    return (
      <ModalPortal>
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center text-center"
          >
            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center text-rose-500 mb-4 shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h4 className="font-black text-slate-900 dark:text-slate-100 text-xl mb-1.5">
              403 - Forbidden
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Administrative console access is restricted to verified system personnel. Passcode entry is disabled.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs transition-all cursor-pointer hover:opacity-90 active:scale-95 shadow-md"
            >
              Return to Workspace
            </button>
          </div>
        </div>
      </ModalPortal>
    );
  }

  const handleSelectPlanForPriceEdit = (pid: PlanId) => {
    setEditingPlan(pid);
    const p = plans[pid];
    setEditMonthlyUsd(p.monthlyUsd.toString());
    setEditYearlyUsd(p.yearlyUsd.toString());
    setEditMonthlyLkr(p.monthlyLkr.toString());
    setEditYearlyLkr(p.yearlyLkr.toString());
  };

  const handleSavePrices = (e: React.FormEvent) => {
    e.preventDefault();
    const mUsd = parseFloat(editMonthlyUsd) || 0;
    const yUsd = parseFloat(editYearlyUsd) || 0;
    const mLkr = parseFloat(editMonthlyLkr) || 0;
    const yLkr = parseFloat(editYearlyLkr) || 0;

    updatePlanPrice(editingPlan, mUsd, yUsd, mLkr, yLkr);
    adminService.logAction(
      'admin_master',
      'update_pricing',
      undefined,
      `Updated ${editingPlan} prices: $${mUsd}/mo, $${yUsd}/yr, Rs. ${mLkr}/mo, Rs. ${yLkr}/yr`
    );
    setAuditLogs(adminService.getAuditLogs());
    confetti({ particleCount: 20, spread: 40 });
    alert(`✅ Updated prices for plan "${editingPlan}" successfully!`);
  };

  const handleToggleABVariant = (variant: PricingVariant) => {
    setPricingVariant(variant);
    adminService.logAction(
      'admin_master',
      'toggle_feature',
      undefined,
      `Switched pricing A/B test to ${variant}`
    );
    setAuditLogs(adminService.getAuditLogs());
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

  const handleStudentApproval = (status: 'verified' | 'rejected') => {
    verifyStudentStatus(status, status === 'rejected' ? 'Invalid student credential photo' : undefined);
    adminService.logAction(
      'admin_master',
      'verify_student',
      studentVerification?.userId,
      `Student ID review: marked as ${status} for ${studentVerification?.email}`
    );
    setAuditLogs(adminService.getAuditLogs());
    confetti({ particleCount: 25, spread: 45 });
  };

  const handleToggleFeature = (planId: PlanId, feat: FeatureKey) => {
    const current = dynamicEntitlements[planId]?.[feat];
    const isCurrentlyEnabled = current?.enabled ?? false;
    updateFeatureLimit(planId, feat, !isCurrentlyEnabled, current?.limit ?? null);
    adminService.logAction(
      'admin_master',
      'toggle_feature',
      undefined,
      `Toggled ${feat} on ${planId} to ${!isCurrentlyEnabled}`
    );
    setAuditLogs(adminService.getAuditLogs());
  };

  const handleLimitChange = (planId: PlanId, feat: FeatureKey, newLimitStr: string) => {
    const current = dynamicEntitlements[planId]?.[feat];
    const limit = newLimitStr.trim() === '' ? null : parseInt(newLimitStr, 10);
    updateFeatureLimit(planId, feat, current?.enabled ?? true, isNaN(limit as any) ? null : limit);
    adminService.logAction(
      'admin_master',
      'update_limit',
      undefined,
      `Changed limit for ${feat} on ${planId} to ${limit === null ? 'Unlimited' : limit}`
    );
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
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-amber-500/25">
                <Crown className="w-5 h-5 text-yellow-200 fill-yellow-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                    ScribbleNote God Mode & System Overlord
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-purple-600 text-white font-black text-[9px] uppercase tracking-wider shadow-xs">
                    👑 Sovereign Creator
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Supreme control console for nimjayad@gmail.com • Unlimited override of commercial pricing, quotas, and users
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col flex-1 min-h-0">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs overflow-x-auto shrink-0">
              <button
                onClick={() => setActiveTab('god')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl font-black border-b-2 transition-all cursor-pointer ${
                  activeTab === 'god'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                    : 'border-transparent text-amber-700 dark:text-amber-300 hover:bg-amber-500/5'
                }`}
              >
                <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>⚡ God Mode Controls</span>
              </button>
              <button
                onClick={() => setActiveTab('metrics')}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-xl font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'metrics'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Metrics</span>
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-xl font-semibold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'pricing'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Prices & A/B Testing</span>
                </button>
                <button
                  onClick={() => setActiveTab('features')}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-xl font-semibold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'features'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>18-Feature Matrix</span>
                </button>
                <button
                  onClick={() => setActiveTab('students')}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-xl font-semibold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'students'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Review</span>
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-xl font-semibold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'users'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Users ({users.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('coupons')}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-xl font-semibold border-b-2 transition-all cursor-pointer ${
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
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-xl font-semibold border-b-2 transition-all cursor-pointer ${
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
                {/* 0. Supreme God Mode Controls */}
                {activeTab === 'god' && (
                  <div className="flex flex-col gap-6">
                    {/* Divine Status Banner */}
                    <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/20 via-purple-600/15 to-indigo-600/20 border-2 border-amber-400/50 shadow-lg shadow-amber-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-amber-500/30">
                          <Crown className="w-6 h-6 text-yellow-200 fill-yellow-200" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-black text-slate-900 dark:text-white">
                              Supreme Sovereign Creator (God Mode)
                            </h4>
                            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wide">
                              Permanent
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            Logged in as <strong className="text-amber-600 dark:text-amber-400 font-bold">nimjayad@gmail.com</strong>. All commercial quotas, paywalls, and system limitations are permanently bypassed.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
                        }}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:brightness-110 text-white font-black text-xs shadow-md shadow-amber-500/25 flex items-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
                      >
                        <Sparkles className="w-4 h-4 text-yellow-200 fill-yellow-200" />
                        <span>Trigger Divine Aura</span>
                      </button>
                    </div>

                    {/* Instant Plan Simulator (God Override) */}
                    <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-purple-500" />
                          <span>Instant Plan Simulator (God Override)</span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Instantly test the student experience across commercial tiers without losing your permanent God Admin status.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { id: 'free', name: 'Free Scholar', badge: 'Basic 100 Notes', sub: 'Standard Limits' },
                          { id: 'pro_student', name: 'Student Pro', badge: '$4.99 / mo', sub: '500 Notes, 10GB' },
                          { id: 'pro', name: 'Pro Scholar', badge: '$9.99 / mo', sub: 'Unlimited Notes, AI' },
                          { id: 'team', name: '👑 God Tier (Team)', badge: 'ALL UNLOCKED', sub: 'Active Super Admin' },
                        ].map((simPlan) => (
                          <button
                            key={simPlan.id}
                            onClick={() => {
                              adminService.updateUserPlan('current_account', simPlan.id as PlanId);
                              setUsers([...adminService.getUsers()]);
                              confetti({ particleCount: 25, spread: 45 });
                            }}
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-95 ${
                              simPlan.id === 'team'
                                ? 'bg-amber-500/10 border-amber-500/40 hover:bg-amber-500/20'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-400'
                            }`}
                          >
                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-0.5">
                              {simPlan.name}
                            </div>
                            <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                              {simPlan.badge}
                            </div>
                            <div className="text-[9px] text-slate-400">
                              {simPlan.sub}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* God Mode Telemetry & System Core */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          <Cpu className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Turbo Engine</span>
                          <span className="font-black text-sm text-slate-900 dark:text-white">Active (Uncapped)</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          <HardDrive className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Cloud Storage</span>
                          <span className="font-black text-sm text-slate-900 dark:text-white">100 GB (∞ Quota)</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Creator Immunity</span>
                          <span className="font-black text-sm text-slate-900 dark:text-white">Active (100 Years)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1. Metrics View */}
                {activeTab === 'metrics' && (
                  <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col gap-1">
                        <span className="text-[11px] text-slate-500">Monthly Recurring (MRR)</span>
                        <span className="text-xl font-black text-slate-900 dark:text-slate-100">
                          ${metrics.mrrUsd.toLocaleString()} / Rs. {metrics.mrrLkr.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" /> Live Real Revenue
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col gap-1">
                        <span className="text-[11px] text-slate-500">Paid Subscribers</span>
                        <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                          {metrics.paidSubscribers}
                        </span>
                        <span className="text-[10px] text-slate-400">Auto-activated plans</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col gap-1">
                        <span className="text-[11px] text-slate-500">Active Pro Trials</span>
                        <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                          {metrics.activeTrials}
                        </span>
                        <span className="text-[10px] text-slate-400">14-day zero CC</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col gap-1">
                        <span className="text-[11px] text-slate-500">Conversion Rate</span>
                        <span className="text-xl font-black text-purple-600 dark:text-purple-400">
                          {metrics.conversionRatePercent}%
                        </span>
                        <span className="text-[10px] text-emerald-500 font-semibold">Trial → Paid</span>
                      </div>
                    </div>

                    {/* Automated Payment Engine Stats */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-slate-50 to-purple-50/30 dark:from-slate-800/50 dark:via-slate-800/40 dark:to-purple-950/20 border border-slate-200 dark:border-slate-700/70 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100">
                            Automated Payment Engine (Stripe & PayHere)
                          </h4>
                        </div>
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Verified & Synced
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/50 flex flex-col gap-1">
                          <span className="text-[11px] text-slate-500">Total Processed Transactions</span>
                          <span className="text-lg font-bold text-slate-900 dark:text-white">
                            {metrics.totalAutomatedTransactions || 0}
                          </span>
                          <span className="text-[10px] text-slate-400">Webhook & return verified</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/50 flex flex-col gap-1">
                          <span className="text-[11px] text-slate-500">Stripe Global Volume</span>
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            ${metrics.stripeVolumeUsd?.toLocaleString() || '0.00'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {metrics.stripeTxCount || 0} USD checkouts
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/50 flex flex-col gap-1">
                          <span className="text-[11px] text-slate-500">PayHere Sri Lanka Volume</span>
                          <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                            Rs. {(metrics.payhereVolumeLkr || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {metrics.payhereTxCount || 0} LKR checkouts
                          </span>
                        </div>
                      </div>

                      {/* Recent Automated Transactions Table */}
                      <div className="flex flex-col gap-2 pt-1">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Recent Automated Transactions ({metrics.recentTransactions?.length || 0})
                        </span>
                        {metrics.recentTransactions && metrics.recentTransactions.length > 0 ? (
                          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700/60">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-100/70 dark:bg-slate-800/80 text-[11px] text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                  <th className="p-2.5">Date</th>
                                  <th className="p-2.5">Customer</th>
                                  <th className="p-2.5">Plan</th>
                                  <th className="p-2.5">Gateway</th>
                                  <th className="p-2.5">Amount</th>
                                  <th className="p-2.5">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-700/40">
                                {metrics.recentTransactions.map((tx) => (
                                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                    <td className="p-2.5 text-slate-500 font-mono text-[10px]">
                                      {new Date(tx.timestamp).toLocaleDateString()}{' '}
                                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200">
                                      {tx.userEmail}
                                    </td>
                                    <td className="p-2.5">
                                      <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-[10px]">
                                        {plans[tx.planId]?.name || tx.planId} ({tx.billingCycle})
                                      </span>
                                    </td>
                                    <td className="p-2.5">
                                      <span
                                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                                          tx.provider === 'payhere'
                                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                            : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                                        }`}
                                      >
                                        {tx.provider}
                                      </span>
                                    </td>
                                    <td className="p-2.5 font-mono font-semibold text-slate-900 dark:text-white">
                                      {tx.currency === 'LKR' ? `Rs. ${tx.amount}` : `$${tx.amount}`}
                                    </td>
                                    <td className="p-2.5">
                                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                        <CheckCircle2 className="w-3 h-3" /> Auto-Verified
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700/70 text-center text-[11px] text-slate-400">
                            Zero manual work needed. When users complete payment via Stripe or PayHere, transactions are automatically verified, entitlements are unlocked, and stats appear here.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
                      <div>
                        <strong>AI Assistant Telemetry:</strong> {metrics.aiQueriesToday} queries executed. Server-side credit meter active.
                      </div>
                      <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full font-bold">
                        Live Tracking
                      </span>
                    </div>
                  </div>
                )}

                {/* 2. Prices & A/B Testing View */}
                {activeTab === 'pricing' && (
                  <div className="flex flex-col gap-6">
                    {/* A/B Testing Control */}
                    <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60">
                      <div className="flex items-center gap-2 mb-2">
                        <FlaskConical className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100">
                          A/B Pricing Experimentation
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                        Test price elasticity between Standard ($4.99 / Rs. 990) and Aggressive Student Growth ($3.99 / Rs. 790).
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleABVariant('variant_a')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            pricingVariant === 'variant_a'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          Variant A: Standard ($4.99 / Rs. 990)
                        </button>
                        <button
                          onClick={() => handleToggleABVariant('variant_b')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            pricingVariant === 'variant_b'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          Variant B: Growth Test ($3.99 / Rs. 790)
                        </button>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Active: {pricingVariant.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Live Plan Pricing Editor */}
                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">
                        Live Plan Price Editor (Stored as Data)
                      </h4>
                      <p className="text-xs text-slate-500 mb-4">
                        Edit prices without redeploying code. Changes update instantly in user checkout and pricing tables.
                      </p>

                      <div className="flex gap-2 mb-4">
                        {(['free', 'pro_student', 'pro', 'team'] as PlanId[]).map((pid) => (
                          <button
                            key={pid}
                            type="button"
                            onClick={() => handleSelectPlanForPriceEdit(pid)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              editingPlan === pid
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {plans[pid]?.name || pid}
                          </button>
                        ))}
                      </div>

                      <form onSubmit={handleSavePrices} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                            Monthly USD ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={editMonthlyUsd}
                            onChange={(e) => setEditMonthlyUsd(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                            Yearly USD ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={editYearlyUsd}
                            onChange={(e) => setEditYearlyUsd(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                            Monthly LKR (Rs.)
                          </label>
                          <input
                            type="number"
                            step="1"
                            value={editMonthlyLkr}
                            onChange={(e) => setEditMonthlyLkr(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                            Yearly LKR (Rs.)
                          </label>
                          <input
                            type="number"
                            step="1"
                            value={editYearlyLkr}
                            onChange={(e) => setEditYearlyLkr(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-none"
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-4 mt-2">
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                          >
                            Save Prices for {plans[editingPlan]?.name}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* 3. 18-Feature Matrix & Limits Editor */}
                {activeTab === 'features' && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        Feature flags and numeric limits are stored as dynamic database rows. Toggling takes effect live in real-time.
                      </p>
                      <div className="flex gap-1.5">
                        {(['free', 'pro_student', 'pro', 'team'] as PlanId[]).map((pid) => (
                          <button
                            key={pid}
                            onClick={() => setSelectedFeaturePlan(pid)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              selectedFeaturePlan === pid
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {plans[pid]?.name || pid}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="p-3">Feature Key</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Limit Value (Blank = Unlimited)</th>
                            <th className="p-3">Current Display</th>
                            <th className="p-3">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {FEATURE_CATALOG.map((feat) => {
                            const config = dynamicEntitlements[selectedFeaturePlan]?.[feat.key];
                            const isEnabled = config?.enabled ?? false;
                            const limitVal = config?.limit === null || config?.limit === undefined ? '' : config.limit.toString();

                            return (
                              <tr key={feat.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                <td className="p-3">
                                  <div className="font-bold text-slate-900 dark:text-slate-100">
                                    {feat.label}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {feat.key} • {feat.category}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                      isEnabled
                                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                    }`}
                                  >
                                    {isEnabled ? 'Enabled' : 'Disabled'}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <input
                                    type="number"
                                    placeholder="Unlimited"
                                    defaultValue={limitVal}
                                    onBlur={(e) =>
                                      handleLimitChange(selectedFeaturePlan, feat.key, e.target.value)
                                    }
                                    className="w-24 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-none"
                                  />
                                </td>
                                <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                                  {formatFeatureDisplay(feat.key, config)}
                                </td>
                                <td className="p-3">
                                  <button
                                    onClick={() => handleToggleFeature(selectedFeaturePlan, feat.key)}
                                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                      isEnabled
                                        ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40'
                                        : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40'
                                    }`}
                                  >
                                    {isEnabled ? 'Turn OFF' : 'Turn ON'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. Student ID Review Queue */}
                {activeTab === 'students' && (
                  <div className="flex flex-col gap-4">
                    <p className="text-xs text-slate-500">
                      Students without institutional .edu / .ac.lk emails upload campus ID photos for manual verification. Review and approve to unlock the $2.99 / Rs. 590 student rate.
                    </p>

                    {studentVerification ? (
                      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                              {studentVerification.email}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                studentVerification.status === 'verified'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                  : studentVerification.status === 'pending'
                                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                              }`}
                            >
                              {studentVerification.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">
                            <strong>Institution:</strong> {studentVerification.institution} •{' '}
                            <strong>Document:</strong> {studentVerification.documentName || 'student_id.png'}
                          </div>
                          {studentVerification.documentDataUrl && (
                            <div className="mt-2 text-[11px] text-blue-600 hover:underline cursor-pointer">
                              <a
                                href={studentVerification.documentDataUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                🔍 View Uploaded Student ID Document
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStudentApproval('verified')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approve Student</span>
                          </button>
                          <button
                            onClick={() => handleStudentApproval('rejected')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/40 hover:bg-rose-200 text-rose-600 dark:text-rose-300 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                        No pending student verification requests in queue.
                      </div>
                    )}
                  </div>
                )}

                {/* 5. User Management View */}
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
                                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                                    title="Extend trial by 7 days"
                                  >
                                    +7d Trial
                                  </button>
                                  <button
                                    onClick={() => handleChangePlan(u.id, u.planId === 'free' ? 'pro' : 'free')}
                                    className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-[11px] font-semibold text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                                  >
                                    {u.planId === 'free' ? 'Grant Pro' : 'Set Free'}
                                  </button>
                                  <button
                                    onClick={() => handleToggleSuspend(u.id)}
                                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
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

                {/* 6. Coupons View */}
                {activeTab === 'coupons' && (
                  <div className="flex flex-col gap-5">
                    <form onSubmit={handleCreateCoupon} className="flex gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                      <input
                        type="text"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value)}
                        placeholder="Coupon Code (e.g. EXAMBOOST)"
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono uppercase text-slate-800 dark:text-slate-200 outline-none"
                      />
                      <input
                        type="number"
                        value={newCouponDiscount}
                        onChange={(e) => setNewCouponDiscount(e.target.value)}
                        placeholder="% Off"
                        className="w-20 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none"
                      />
                      <button
                        type="submit"
                        className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Promo</span>
                      </button>
                    </form>

                    <div className="space-y-2">
                      {coupons.map((c) => (
                        <div
                          key={c.code}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                              {c.code}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {c.discountPercent}% OFF
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-[11px]">
                              Used: {c.usedCount} / {c.maxUses}
                            </span>
                            <button
                              onClick={() => handleToggleCoupon(c.code)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                                c.active
                                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              }`}
                            >
                              {c.active ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. Audit Log View */}
                {activeTab === 'audit' && (
                  <div className="space-y-2">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100 font-mono text-[11px]">
                            [{log.action.toUpperCase()}] {log.details}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            By admin <span className="font-mono">{log.adminId}</span>
                            {log.targetUserId && <span> • Target user: {log.targetUserId}</span>}
                          </div>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>
    </ModalPortal>
  );
};
