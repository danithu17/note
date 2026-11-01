import React, { useState } from 'react';
import {
  X,
  Shield,
  LogOut,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  AlertTriangle,
  Crown,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { useCanvasStore } from '@/store/useCanvasStore';
import { validatePassword } from '@/core/auth/passwordRules';
import { ModalPortal } from '@/components/ui/ModalPortal';
import confetti from 'canvas-confetti';

export const AccountSecurityModal: React.FC = () => {
  const {
    user,
    isAccountModalOpen,
    closeAccountModal,
    updatePassword,
    updateEmail,
    signOutAllDevices,
    deleteAccount,
    signOut,
  } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'email' | 'danger'>('profile');

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Email state
  const [newEmail, setNewEmail] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Delete state
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  if (!isAccountModalOpen || !user) return null;

  const isOwnerAdmin = user.email?.toLowerCase() === 'nimjayad@gmail.com';
  const passwordVal = validatePassword(newPassword);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    if (!passwordVal.isValid) {
      setPasswordError('Password does not meet complexity requirements.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await updatePassword(newPassword);
      if (res.success) {
        setPasswordSuccess(true);
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(false), 4000);
      } else if (res.error) {
        setPasswordError(res.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(false);

    if (!newEmail.trim() || !newEmail.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await updateEmail(newEmail.trim());
      if (res.success) {
        setEmailSuccess(true);
        setNewEmail('');
        setTimeout(() => setEmailSuccess(false), 4000);
      } else if (res.error) {
        setEmailError(res.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      setDeleteError('Please type DELETE in uppercase to confirm permanent deletion.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await deleteAccount();
      if (!res.success && res.error) {
        setDeleteError(res.error);
        setIsDeleting(false);
      }
    } catch (e: any) {
      setDeleteError(e.message || 'Failed to delete account.');
      setIsDeleting(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <ModalPortal>
      <div
        onClick={closeAccountModal}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200/80 dark:border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base shadow-sm relative ${
                isOwnerAdmin
                  ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white ring-2 ring-amber-400 shadow-amber-500/30'
                  : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
              }`}>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  user.name?.charAt(0).toUpperCase() || 'S'
                )}
                {isOwnerAdmin && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                    <Crown className="w-3 h-3 fill-slate-950" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {user.name || 'Scholar Account'}
                  </h3>
                  {isOwnerAdmin && (
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-purple-600 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                      GOD MODE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
            </div>

            <button
              onClick={closeAccountModal}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub Navigation Bar */}
          <div className="flex border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 pt-2 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Profile & Plan
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                activeTab === 'password'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Change Password
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                activeTab === 'email'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Change Email
            </button>
            <button
              onClick={() => setActiveTab('danger')}
              className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                activeTab === 'danger'
                  ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Security & Delete
            </button>
          </div>

          {/* Tab Body */}
          <div className="p-6 overflow-y-auto max-h-[60vh] text-xs">
            {activeTab === 'profile' && (
              <div className="flex flex-col gap-4">
                {isOwnerAdmin && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-purple-600/15 border-2 border-amber-500/40 flex flex-col gap-3 shadow-md shadow-amber-500/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-xl bg-amber-500 text-slate-950 shadow-xs">
                          <Crown className="w-4 h-4 fill-slate-950" />
                        </span>
                        <div>
                          <div className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                            Supreme Sovereign (God Mode)
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            Eternal Platform Creator & Lead Architect
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-700 dark:text-amber-300 font-extrabold text-[10px] uppercase">
                        Active Forever (100 Yrs)
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-amber-200/50 dark:border-amber-900/30">
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Storage Quota</span>
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400">100 GB (∞)</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-amber-200/50 dark:border-amber-900/30">
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold block">AI Assistant</span>
                        <span className="text-xs font-black text-purple-600 dark:text-purple-400">Unlimited</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-amber-200/50 dark:border-amber-900/30">
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Paywalls</span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">Bypassed</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        confetti({ particleCount: 35, spread: 60 });
                        closeAccountModal();
                        useCanvasStore.getState().openModal('admin');
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:brightness-110 text-white font-black text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                      <Zap className="w-4 h-4 fill-yellow-200" />
                      <span>Launch God Mode Admin Engine</span>
                    </button>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Active Membership</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      isOwnerAdmin
                        ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-xs'
                        : 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                    }`}>
                      {isOwnerAdmin ? 'GOD TIER VIP (CAMPUS LAB)' : `${user.plan} Scholar Plan`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Academic Role</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {isOwnerAdmin ? 'Platform Creator & God Admin' : (user.studyRole || 'Student / Scholar')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Primary Subject</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {isOwnerAdmin ? 'System Architecture & Engineering' : (user.subject || 'General')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5" />
                      Cloud Storage Used:
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {isOwnerAdmin
                        ? `${formatBytes(user.storageUsedBytes || 0)} / 100 GB (∞ Unlimited)`
                        : `${formatBytes(user.storageUsedBytes || 0)} / ${formatBytes(user.storageLimitBytes || 10737418240)}`}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => signOut()}
                    className="flex-1 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 font-semibold text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                  <button
                    onClick={() => signOutAllDevices()}
                    className="flex-1 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 font-semibold text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span>Sign Out All Devices</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Update your password. Ensure it has at least 8 characters with upper, lowercase, and numeric characters.
                </p>

                {passwordError && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Password updated successfully.</span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:border-blue-500 text-xs text-slate-900 dark:text-white"
                  />
                  {newPassword.length > 0 && (
                    <div className="flex items-center gap-2 pt-1 text-[10px]">
                      <span className="text-slate-400">Strength:</span>
                      <span className="font-bold">{passwordVal.label}</span>
                      <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full ${passwordVal.colorClass}`} style={{ width: passwordVal.barWidth }} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:border-blue-500 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}

            {activeTab === 'email' && (
              <form onSubmit={handleUpdateEmail} className="flex flex-col gap-4">
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Current email: <strong className="text-slate-700 dark:text-slate-300">{user.email}</strong>.
                  A confirmation email will be dispatched to verify your new email.
                </p>

                {emailError && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{emailError}</span>
                  </div>
                )}

                {emailSuccess && (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Confirmation links sent to both email addresses.</span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">New Email Address</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="new.email@university.edu"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:border-blue-500 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Change Email Address'}
                </button>
              </form>
            )}

            {activeTab === 'danger' && (
              <div className="flex flex-col gap-4">
                {isOwnerAdmin ? (
                  <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex flex-col gap-3">
                    <div className="flex items-center gap-2 font-bold text-xs text-amber-700 dark:text-amber-300">
                      <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
                      <span>God Mode Protection Active</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                      As the platform creator and system overlord (<strong className="text-amber-600 dark:text-amber-400">nimjayad@gmail.com</strong>), your account is permanently protected. Account deletion and degradation are disabled to ensure platform persistence.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col gap-2 text-rose-900 dark:text-rose-200">
                      <div className="flex items-center gap-2 font-bold text-xs text-rose-600 dark:text-rose-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Danger Zone: Permanent Account Deletion</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-rose-700 dark:text-rose-300">
                        Deleting your account permanently destroys all cloud backups, your profile record, and all local offline notes and canvases on this device. This action is irreversible.
                      </p>
                    </div>

                    {deleteError && (
                      <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{deleteError}</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                        To confirm deletion, type <span className="text-rose-600 font-bold">DELETE</span> below:
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="DELETE"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:border-rose-500 text-xs text-slate-900 dark:text-white font-mono"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                      className="w-full py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{isDeleting ? 'Deleting Account...' : 'Permanently Delete My Account'}</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
