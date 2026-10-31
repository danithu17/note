import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { getStoredSupabaseConfig, saveSupabaseConfig } from '@/core/supabase/client';
import confetti from 'canvas-confetti';

export const AuthModal: React.FC = () => {
  const {
    user,
    isAuthModalOpen,
    closeAuthModal,
    signInWithEmail,
    signUpWithEmail,
    signInWithMagicLink,
    signOut,
    error: authError,
  } = useAuthStore();

  const [tab, setTab] = useState<'signin' | 'signup' | 'magic' | 'cloud'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cloud config form
  const existingConfig = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(existingConfig?.url || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(existingConfig?.anonKey || '');
  const [cloudSaved, setCloudSaved] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      if (tab === 'signin') {
        const res = await signInWithEmail(email, password);
        if (res.success) {
          confetti({ particleCount: 35, spread: 50 });
        }
      } else if (tab === 'signup') {
        const res = await signUpWithEmail(email, password, name);
        if (res.success) {
          confetti({ particleCount: 45, spread: 60 });
          setSuccessMessage('Account created! Please check your email to confirm your account.');
        }
      } else if (tab === 'magic') {
        const res = await signInWithMagicLink(email);
        if (res.success) {
          setSuccessMessage('Magic sign-in link sent to your email. Check your inbox!');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {user && !user.isGuest ? 'Your Account' : 'Student & Pro Account'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {user && !user.isGuest ? user.email : 'Upgrade from guest mode with zero data loss'}
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Guest Reassurance Banner */}
        {user?.isGuest && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <span>
              <strong>Zero Data Loss Guarantee:</strong> All lecture notes, canvas drawings, and
              audio currently on this device will automatically migrate to your new cloud account.
            </span>
          </div>
        )}

        {/* Authenticated user view */}
        {user && !user.isGuest ? (
          <div className="p-6 flex flex-col gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Logged in as</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold uppercase text-[10px]">
                  {user.plan} Plan
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {user.name || user.email}
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                {user.email}
              </div>
            </div>

            <button
              onClick={() => signOut()}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
            >
              Sign Out (Return to Guest Mode)
            </button>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4">
            {/* Navigation Tabs */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-xs font-semibold">
              <button
                onClick={() => setTab('signin')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  tab === 'signin'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setTab('signup')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  tab === 'signup'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => setTab('magic')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  tab === 'magic'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Magic Link
              </button>
              <button
                onClick={() => setTab('cloud')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  tab === 'cloud'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Cloud URL
              </button>
            </div>

            {/* Error / Success Notifications */}
            {authError && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
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
                  Connect your custom Supabase instance. Enter your Project URL and Anon API key to
                  enable instant cloud sync across your devices.
                </p>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 text-xs text-slate-900 dark:text-slate-100"
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
                    placeholder="eyJhbGciOi..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-1 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-all active:scale-95"
                >
                  Save Cloud Configuration
                </button>

                {cloudSaved && (
                  <span className="text-center text-emerald-600 text-[11px] font-semibold">
                    ✓ Configuration saved! Supabase client updated.
                  </span>
                )}
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
                {tab === 'signup' && (
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>

                {tab !== 'magic' && (
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password (min 6 characters)"
                      minLength={6}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {tab === 'signin'
                          ? 'Sign In'
                          : tab === 'signup'
                            ? 'Create Account'
                            : 'Send Magic Link'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
