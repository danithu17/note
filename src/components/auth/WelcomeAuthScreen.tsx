import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  WifiOff,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { validatePassword } from '@/core/auth/passwordRules';
import confetti from 'canvas-confetti';

export const WelcomeAuthScreen: React.FC = () => {
  const {
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    signInWithMagicLink,
    resetPassword,
    isOffline,
    error: authError,
  } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'signup' | 'magic' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const passwordVal = validatePassword(password);

  const handleGoogleSignIn = async () => {
    if (isOffline) {
      setLocalError('Connect to the internet to sign in with Google.');
      return;
    }
    setLocalError(null);
    setIsLoading(true);
    try {
      const res = await signInWithGoogle();
      if (!res.success && res.error) {
        setLocalError(res.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (isOffline) {
      setLocalError('Connect to the internet to sign in with Apple.');
      return;
    }
    setLocalError(null);
    setIsLoading(true);
    try {
      const res = await signInWithApple();
      if (!res.success && res.error) {
        setLocalError(res.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    if (isOffline) {
      setLocalError('Connect to the internet to sign in or create an account.');
      return;
    }

    if (!email.trim()) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        if (!password) {
          setLocalError('Please enter your password.');
          setIsLoading(false);
          return;
        }
        const res = await signInWithEmail(email, password);
        if (res.success) {
          confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
        } else if (res.error) {
          setLocalError(res.error);
        }
      } else if (mode === 'signup') {
        if (!agreedToTerms) {
          setLocalError('You must agree to the Terms of Service and Privacy Policy to continue.');
          setIsLoading(false);
          return;
        }
        if (!passwordVal.isValid) {
          setLocalError('Please choose a password meeting all security requirements.');
          setIsLoading(false);
          return;
        }

        const res = await signUpWithEmail(email, password, name, {
          version: 'v1.0',
          timestamp: Date.now(),
        });

        if (res.success) {
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.5 } });
          setSuccessMessage(
            'Account created successfully! Check your email to verify your address or proceed to onboarding.'
          );
        } else if (res.error) {
          setLocalError(res.error);
        }
      } else if (mode === 'magic') {
        const res = await signInWithMagicLink(email);
        if (res.success) {
          setSuccessMessage('We sent a passwordless magic sign-in link to ' + email + '. Check your inbox!');
        } else if (res.error) {
          setLocalError(res.error);
        }
      } else if (mode === 'forgot') {
        const res = await resetPassword(email);
        if (res.success) {
          setSuccessMessage('Password reset instructions have been sent to ' + email + '.');
        } else if (res.error) {
          setLocalError(res.error);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="relative w-screen h-screen overflow-y-auto flex flex-col items-center justify-center p-4 sm:p-6 bg-[#f5f5f7] dark:bg-[#000000] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Background Decorative Ambient Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/15 via-indigo-500/10 to-purple-500/15 blur-3xl pointer-events-none rounded-full" />

      {/* Offline Alert Pill */}
      {isOffline && (
        <div className="mb-4 w-full max-w-md px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
          <WifiOff className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex-1">
            <span className="font-semibold block">You are currently offline</span>
            <span>Connect to the internet to sign in, create an account, or sync notes.</span>
          </div>
        </div>
      )}

      {/* Main Apple-Grade Centered Card */}
      <div className="relative z-10 w-full max-w-md bg-white/85 dark:bg-[#1c1c1e]/85 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
        {/* App Logo & Short Tagline */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            ScribbleNote
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
            Your lectures, sketches, and notes organized with intelligence. Sign in to access your
            workspace.
          </p>
        </div>

        {/* Primary OAuth Actions */}
        <div className="flex flex-col gap-3">
          {/* Big "Continue with Google" Button (Official Google Branding Guidelines) */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-[#2c2c2e] hover:bg-slate-50 dark:hover:bg-[#3a3a3c] text-slate-800 dark:text-slate-100 font-semibold text-sm rounded-2xl border border-slate-300 dark:border-white/15 shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {/* Google Multi-Color SVG Logo */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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

          {/* "Continue with Apple" Button (Placeholder-Ready for iOS) */}
          <button
            type="button"
            onClick={handleAppleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black text-white dark:bg-white dark:text-black font-semibold text-sm rounded-2xl hover:opacity-90 shadow-sm transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {/* Apple Logo SVG */}
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.08-7.71-7.87-12.04-14.36-6.19-9.25-11.05-19.65-14.58-31.21-3.53-11.56-5.3-22.68-5.3-33.36 0-14.28 3.59-26.06 10.78-35.33 7.19-9.27 16.24-13.99 27.15-14.15 4.89 0 10.35 1.34 16.39 4.02 6.03 2.68 10.14 4.08 12.33 4.2 1.79-.24 6.07-1.74 12.85-4.5 6.78-2.76 12.44-3.95 16.99-3.56 12.63.78 22.5 5.34 29.62 13.68-11.01 6.64-16.42 15.65-16.23 27.02.2 8.92 3.65 16.46 10.35 22.62 6.7 6.16 14.65 9.87 23.86 11.13-2.02 6.16-4.59 12.44-7.71 18.84zm-37.14-106.18c0-7.39 2.63-14.26 7.89-20.61 5.26-6.35 11.75-10.22 19.47-11.61.2 1.25.3 2.45.3 3.61 0 7.23-2.73 14.16-8.19 20.78-5.46 6.62-12.08 10.51-19.86 11.67-.13-1.25-.2-2.52-.2-3.84z" />
            </svg>
            <span>Continue with Apple</span>
          </button>
        </div>

        {/* Divider "or" */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-200 dark:border-white/10" />
          <span className="absolute px-3 bg-white dark:bg-[#1c1c1e] text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            or
          </span>
        </div>

        {/* Tab Toggle: Log In / Create Account */}
        <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLocalError(null);
            }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white dark:bg-[#2c2c2e] text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setLocalError(null);
            }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white dark:bg-[#2c2c2e] text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('magic');
              setLocalError(null);
            }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              mode === 'magic'
                ? 'bg-white dark:bg-[#2c2c2e] text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Magic Link
          </button>
        </div>

        {/* Feedback Alert Messages */}
        {displayError && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div className="flex-1 leading-relaxed">{displayError}</div>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div className="flex-1 leading-relaxed">{successMessage}</div>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {mode === 'signup' && (
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Marie Curie"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs transition-all"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs transition-all"
              />
            </div>
          </div>

          {mode !== 'magic' && mode !== 'forgot' && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setLocalError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter (On Signup) */}
              {mode === 'signup' && password.length > 0 && (
                <div className="flex flex-col gap-2 mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Strength:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {passwordVal.label}
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordVal.colorClass}`}
                      style={{ width: passwordVal.barWidth }}
                    />
                  </div>

                  {/* Checklist Rules */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[10px]">
                    {passwordVal.rules.map((rule) => (
                      <div
                        key={rule.id}
                        className={`flex items-center gap-1.5 ${
                          rule.passed
                            ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {rule.passed ? (
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                        ) : (
                          <XCircle className="w-3 h-3 shrink-0" />
                        )}
                        <span>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Terms and Privacy Checkbox on Signup */}
          {mode === 'signup' && (
            <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 rounded-md text-blue-600 focus:ring-blue-500 dark:bg-white/5 border-slate-300 dark:border-slate-700"
              />
              <span className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                I agree to the{' '}
                <a
                  href="/TERMS.md"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 font-medium underline"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="/PRIVACY.md"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 font-medium underline"
                >
                  Privacy Policy
                </a>
                . (Consent logged with version v1.0).
              </span>
            </label>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : mode === 'login' ? (
              <>
                <span>Sign In to ScribbleNote</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === 'signup' ? (
              <>
                <span>Create Free Account & Start Pro Trial</span>
                <Sparkles className="w-4 h-4" />
              </>
            ) : mode === 'magic' ? (
              <>
                <span>Send Passwordless Magic Link</span>
                <Mail className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Send Password Reset Link</span>
                <Mail className="w-4 h-4" />
              </>
            )}
          </button>

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLocalError(null);
                setSuccessMessage(null);
              }}
              className="text-center text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white mt-1"
            >
              Back to Sign In
            </button>
          )}
        </form>

        {/* Security & Shield Footer */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-white/5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span>Secured by Supabase Cloud, Cloudflare Bot Protection & Row Level Security</span>
        </div>
      </div>
    </div>
  );
};
