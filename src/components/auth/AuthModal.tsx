import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { getStoredSupabaseConfig, saveSupabaseConfig } from '@/core/supabase/client';
import { validatePassword } from '@/core/auth/passwordRules';
import { ModalPortal } from '@/components/ui/ModalPortal';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    isAuthModalOpen,
    closeAuthModal,
    openAccountModal,
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    signInWithMagicLink,
    resetPassword,
    signOut,
    isOffline,
    error: authError,
  } = useAuthStore();

  const effectiveIsOpen = isOpen ?? isAuthModalOpen;
  const handleClose = onClose ?? closeAuthModal;

  const [tab, setTab] = useState<'signin' | 'signup' | 'magic' | 'cloud' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Cloud config form
  const existingConfig = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(existingConfig?.url || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(existingConfig?.anonKey || '');
  const [cloudSaved, setCloudSaved] = useState(false);

  const passwordVal = validatePassword(password);

  if (!effectiveIsOpen) return null;

  const handleGoogleSignIn = async () => {
    if (isOffline) {
      setLocalError('Connect to the internet to sign in with Google.');
      return;
    }
    setLocalError(null);
    setIsSubmitting(true);
    try {
      const res = await signInWithGoogle();
      if (!res.success && res.error) setLocalError(res.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (isOffline) {
      setLocalError('Connect to the internet to sign in with Apple.');
      return;
    }
    setLocalError(null);
    setIsSubmitting(true);
    try {
      const res = await signInWithApple();
      if (!res.success && res.error) setLocalError(res.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setLocalError(null);

    if (isOffline) {
      setLocalError('Connect to the internet to sign in or create an account.');
      setIsSubmitting(false);
      return;
    }

    try {
      if (tab === 'signin') {
        const res = await signInWithEmail(email, password);
        if (res.success) {
          confetti({ particleCount: 35, spread: 50 });
          handleClose();
        } else if (res.error) {
          setLocalError(res.error);
        }
      } else if (tab === 'signup') {
        if (!agreedToTerms) {
          setLocalError('You must agree to the Terms of Service and Privacy Policy to continue.');
          setIsSubmitting(false);
          return;
        }
        if (!passwordVal.isValid) {
          setLocalError('Please choose a password that satisfies all security rules.');
          setIsSubmitting(false);
          return;
        }
        const res = await signUpWithEmail(email, password, name, {
          version: 'v1.0',
          timestamp: Date.now(),
        });
        if (res.success) {
          confetti({ particleCount: 45, spread: 60 });
          setSuccessMessage('Account created! Pro Scholar Trial activated.');
          handleClose();
        } else if (res.error) {
          setLocalError(res.error);
        }
      } else if (tab === 'magic') {
        const res = await signInWithMagicLink(email);
        if (res.success) {
          setSuccessMessage('Magic sign-in link sent to your email. Check your inbox!');
        } else if (res.error) {
          setLocalError(res.error);
        }
      } else if (tab === 'forgot') {
        const res = await resetPassword(email);
        if (res.success) {
          setSuccessMessage('Password reset link dispatched to ' + email + '.');
        } else if (res.error) {
          setLocalError(res.error);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveCloud = (e: React.FormEvent) => {
    e.preventDefault();
    if (supabaseUrl.trim() && supabaseAnonKey.trim()) {
      saveSupabaseConfig({ url: supabaseUrl.trim(), anonKey: supabaseAnonKey.trim() });
      setCloudSaved(true);
      setTimeout(() => setCloudSaved(false), 3000);
    } else {
      saveSupabaseConfig(null);
      setCloudSaved(true);
    }
  };

  const displayError = localError || authError;

  return (
    <ModalPortal>
      <div
        onClick={handleClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200/80 dark:border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {user ? 'Your Account' : 'Sign In to ScribbleNote'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {user ? user.email : 'Mandatory sign-in to access notes & canvas'}
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Authenticated user view */}
          {user ? (
            <div className="p-6 flex flex-col gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Logged in as</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold uppercase text-[10px]">
                    {user.plan} Scholar Plan
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {user.name || user.email}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{user.email}</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleClose();
                    openAccountModal();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all cursor-pointer"
                >
                  Manage Account & Security
                </button>
                <button
                  onClick={() => signOut()}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 flex flex-col gap-4">
              {/* Google & Apple Prominent Buttons */}
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white dark:bg-[#2c2c2e] hover:bg-slate-50 dark:hover:bg-[#3a3a3c] text-slate-800 dark:text-slate-100 font-semibold text-xs rounded-2xl border border-slate-300 dark:border-white/15 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleAppleSignIn}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-2xl hover:opacity-90 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.08-7.71-7.87-12.04-14.36-6.19-9.25-11.05-19.65-14.58-31.21-3.53-11.56-5.3-22.68-5.3-33.36 0-14.28 3.59-26.06 10.78-35.33 7.19-9.27 16.24-13.99 27.15-14.15 4.89 0 10.35 1.34 16.39 4.02 6.03 2.68 10.14 4.08 12.33 4.2 1.79-.24 6.07-1.74 12.85-4.5 6.78-2.76 12.44-3.95 16.99-3.56 12.63.78 22.5 5.34 29.62 13.68-11.01 6.64-16.42 15.65-16.23 27.02.2 8.92 3.65 16.46 10.35 22.62 6.7 6.16 14.65 9.87 23.86 11.13-2.02 6.16-4.59 12.44-7.71 18.84zm-37.14-106.18c0-7.39 2.63-14.26 7.89-20.61 5.26-6.35 11.75-10.22 19.47-11.61.2 1.25.3 2.45.3 3.61 0 7.23-2.73 14.16-8.19 20.78-5.46 6.62-12.08 10.51-19.86 11.67-.13-1.25-.2-2.52-.2-3.84z" />
                  </svg>
                  <span>Continue with Apple</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-0.5">
                <div className="w-full border-t border-slate-200 dark:border-white/10" />
                <span className="absolute px-3 bg-white dark:bg-[#1c1c1e] text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  or
                </span>
              </div>

              {/* Navigation Tabs */}
              <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl text-xs font-semibold">
                <button
                  onClick={() => setTab('signin')}
                  className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                    tab === 'signin'
                      ? 'bg-white dark:bg-[#2c2c2e] text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setTab('signup')}
                  className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                    tab === 'signup'
                      ? 'bg-white dark:bg-[#2c2c2e] text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Sign Up
                </button>
                <button
                  onClick={() => setTab('magic')}
                  className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                    tab === 'magic'
                      ? 'bg-white dark:bg-[#2c2c2e] text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Magic
                </button>
                <button
                  onClick={() => setTab('cloud')}
                  className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                    tab === 'cloud'
                      ? 'bg-white dark:bg-[#2c2c2e] text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Cloud
                </button>
              </div>

              {/* Error / Success Notifications */}
              {displayError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{displayError}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {tab === 'cloud' ? (
                <form onSubmit={handleSaveCloud} className="flex flex-col gap-3 text-xs">
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Connect your custom Supabase instance.
                  </p>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Supabase Project URL
                    </label>
                    <input
                      type="url"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://psxggugvbiuiqkdpukcn.supabase.co"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Supabase Anon Public Key
                    </label>
                    <input
                      type="password"
                      value={supabaseAnonKey}
                      onChange={(e) => setSupabaseAnonKey(e.target.value)}
                      placeholder="eyJhbGci..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-xs"
                  >
                    {cloudSaved ? 'Configuration Saved!' : 'Save & Connect Cloud'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
                  {tab === 'signup' && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Full Name
                      </label>
                      <div className="relative flex items-center">
                        <User className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 text-xs text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@university.edu"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 text-xs text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  {tab !== 'magic' && tab !== 'forgot' && (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Password
                        </label>
                        {tab === 'signin' && (
                          <button
                            type="button"
                            onClick={() => setTab('forgot')}
                            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <Lock className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 text-xs text-slate-900 dark:text-slate-100"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {tab === 'signup' && password.length > 0 && (
                        <div className="flex items-center gap-2 pt-1 text-[10px]">
                          <span className="text-slate-400">Strength:</span>
                          <span className="font-bold">{passwordVal.label}</span>
                          <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full ${passwordVal.colorClass}`} style={{ width: passwordVal.barWidth }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {tab === 'signup' && (
                    <label className="flex items-start gap-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-0.5 rounded text-blue-600"
                      />
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                        I accept the Terms of Service & Privacy Policy (v1.0).
                      </span>
                    </label>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>
                      {isSubmitting
                        ? 'Processing...'
                        : tab === 'signin'
                        ? 'Sign In'
                        : tab === 'signup'
                        ? 'Sign Up & Activate Trial'
                        : tab === 'magic'
                        ? 'Send Magic Link'
                        : 'Send Password Reset'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </ModalPortal>
  );
};
