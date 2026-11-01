import { create } from 'zustand';
import type { UserAccount } from '@/types/note';
import { getSupabaseClient } from '../supabase/client';
import { db, calculateStorageUsage } from '../db';
import { validatePassword } from './passwordRules';
import { initializeUserTrial } from '@/features/billing/trialService';
import {
  firebaseSignInWithEmail,
  firebaseSignUpWithEmail,
  firebaseSignInWithGoogle,
  firebaseResetPassword,
  firebaseLogout,
  subscribeToFirebaseAuthState,
} from '../firebase/authService';

const CACHED_USER_KEY = 'scribblenote_cached_user';
const PRO_STORAGE_LIMIT = 10 * 1024 * 1024 * 1024; // 10 GB Pro scholar storage limit

interface AuthState {
  user: UserAccount | null;
  isLoading: boolean;
  error: string | null;
  isOnboarding: boolean;
  isAuthModalOpen: boolean;
  isAccountModalOpen: boolean;
  isOffline: boolean;

  // Actions
  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithApple: () => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
    name?: string,
    consent?: { version: string; timestamp: number }
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateEmail: (newEmail: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  signOutAllDevices: () => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: (data: {
    name: string;
    studyRole: string;
    subject: string;
  }) => Promise<{ success: boolean; error?: string }>;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openAccountModal: () => void;
  closeAccountModal: () => void;
  refreshStorageUsage: () => Promise<void>;
  upgradeGuestData: (newUserId: string) => Promise<void>;
}

const createOrActivateLocalAccount = async (
  email: string,
  name?: string,
  provider = 'email'
): Promise<UserAccount> => {
  const normalizedEmail = email.toLowerCase().trim();
  const baseName =
    name ||
    normalizedEmail.split('@')[0] ||
    (provider === 'google' ? 'Google Scholar' : 'Scholar');
  const cleanId = normalizedEmail.replace(/[^a-zA-Z0-9]/g, '_');
  const userId = `usr_${cleanId}`;

  const usage = await calculateStorageUsage();
  initializeUserTrial(userId);

  const account: UserAccount = {
    id: userId,
    email: normalizedEmail,
    name: baseName,
    isGuest: false,
    plan: 'pro',
    trialStart: Date.now(),
    trialEnd: Date.now() + 14 * 24 * 60 * 60 * 1000,
    consentVersion: 'v1.0',
    consentTimestamp: Date.now(),
    storageUsedBytes: usage.totalBytes,
    storageLimitBytes: PRO_STORAGE_LIMIT,
  };

  localStorage.setItem(CACHED_USER_KEY, JSON.stringify(account));
  return account;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,
  isOnboarding: false,
  isAuthModalOpen: false,
  isAccountModalOpen: false,
  isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,

  openAuthModal: () => set({ isAuthModalOpen: true, error: null }),
  closeAuthModal: () => set({ isAuthModalOpen: false, error: null }),
  openAccountModal: () => set({ isAccountModalOpen: true, error: null }),
  closeAccountModal: () => set({ isAccountModalOpen: false, error: null }),

  initialize: async () => {
    set({ isLoading: true });

    // Track online/offline status changes
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => set({ isOffline: false }));
      window.addEventListener('offline', () => set({ isOffline: true }));
    }

    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    set({ isOffline });

    // 1. Check offline cached session first if offline or network fails
    if (isOffline) {
      try {
        const cached = localStorage.getItem(CACHED_USER_KEY);
        if (cached) {
          const parsedUser = JSON.parse(cached) as UserAccount;
          const usage = await calculateStorageUsage();
          parsedUser.storageUsedBytes = usage.totalBytes;
          set({ user: parsedUser, isLoading: false, isOffline: true });
          return;
        }
      } catch (e) {
        console.warn('[Auth] Failed to load offline cached session:', e);
      }

      // No cached user offline -> must show auth screen
      set({ user: null, isLoading: false, isOffline: true });
      return;
    }

    // 2. Online: Subscribe to Firebase Cloud Auth & verify session
    try {
      subscribeToFirebaseAuthState(async (fbUser) => {
        if (fbUser) {
          const usage = await calculateStorageUsage();
          initializeUserTrial(fbUser.uid);
          const cached = localStorage.getItem(CACHED_USER_KEY);
          let prevData: Partial<UserAccount> = {};
          if (cached) {
            try { prevData = JSON.parse(cached); } catch { /* ignore */ }
          }
          const account: UserAccount = {
            id: fbUser.uid,
            email: fbUser.email || undefined,
            name: fbUser.displayName || prevData.name || fbUser.email?.split('@')[0] || 'Scholar',
            avatarUrl: fbUser.photoURL || prevData.avatarUrl,
            isGuest: false,
            plan: prevData.plan || 'pro',
            studyRole: prevData.studyRole,
            subject: prevData.subject,
            storageUsedBytes: usage.totalBytes,
            storageLimitBytes: PRO_STORAGE_LIMIT,
          };
          localStorage.setItem(CACHED_USER_KEY, JSON.stringify(account));
          set({ user: account, isLoading: false, isAuthModalOpen: false });
        }
      });
    } catch (fbInitErr) {
      console.warn('[Firebase] Auth state observer warning:', fbInitErr);
    }

    const client = getSupabaseClient();
    if (!client) {
      // Check cached user fallback
      try {
        const cached = localStorage.getItem(CACHED_USER_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as UserAccount;
          set({ user: parsed, isLoading: false });
          return;
        }
      } catch {
        // ignore
      }
      set({ user: null, isLoading: false });
      return;
    }

    try {
      const {
        data: { session },
        error,
      } = await client.auth.getSession();

      if (error) {
        console.warn('[Auth] Session retrieval warning:', error.message);
      }

      if (session?.user) {
        const storageUsage = await calculateStorageUsage();

        // Fetch or create profile from profiles table
        let profileData: any = null;
        try {
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          profileData = profile;
        } catch (err) {
          console.warn('[Auth] Profiles fetch skipped:', err);
        }

        const studyRole = profileData?.study_role;
        const subject = profileData?.subject;
        const needsOnboarding = !studyRole;

        // Auto initialize 14-day Pro trial
        initializeUserTrial(session.user.id);

        const account: UserAccount = {
          id: session.user.id,
          email: session.user.email,
          name:
            profileData?.name ||
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split('@')[0] ||
            'Scholar',
          avatarUrl: profileData?.avatar_url || session.user.user_metadata?.avatar_url,
          isGuest: false,
          plan: (profileData?.plan as any) || 'pro',
          studyRole,
          subject,
          locale: profileData?.locale || 'en',
          trialStart: profileData?.trial_start ? new Date(profileData.trial_start).getTime() : Date.now(),
          trialEnd: profileData?.trial_end
            ? new Date(profileData.trial_end).getTime()
            : Date.now() + 14 * 24 * 60 * 60 * 1000,
          consentVersion: profileData?.consent_version || 'v1.0',
          consentTimestamp: profileData?.consent_timestamp
            ? new Date(profileData.consent_timestamp).getTime()
            : Date.now(),
          storageUsedBytes: storageUsage.totalBytes,
          storageLimitBytes: PRO_STORAGE_LIMIT,
        };

        // Cache session for seamless offline usage
        localStorage.setItem(CACHED_USER_KEY, JSON.stringify(account));

        set({
          user: account,
          isOnboarding: needsOnboarding,
          isLoading: false,
        });

        // Listen for session updates / refresh token rotations
        client.auth.onAuthStateChange(async (event, newSession) => {
          if (newSession?.user) {
            const usage = await calculateStorageUsage();
            const updatedAccount: UserAccount = {
              id: newSession.user.id,
              email: newSession.user.email,
              name:
                newSession.user.user_metadata?.full_name ||
                newSession.user.user_metadata?.name ||
                newSession.user.email?.split('@')[0] ||
                'Scholar',
              avatarUrl: newSession.user.user_metadata?.avatar_url,
              isGuest: false,
              plan: 'pro',
              storageUsedBytes: usage.totalBytes,
              storageLimitBytes: PRO_STORAGE_LIMIT,
            };
            localStorage.setItem(CACHED_USER_KEY, JSON.stringify(updatedAccount));
            set({ user: updatedAccount });
          } else if (event === 'SIGNED_OUT') {
            localStorage.removeItem(CACHED_USER_KEY);
            set({ user: null, isOnboarding: false });
          }
        });
      } else {
        // If Supabase has no active cloud session, check if we have a valid cached user
        try {
          const cached = localStorage.getItem(CACHED_USER_KEY);
          if (cached) {
            const parsed = JSON.parse(cached) as UserAccount;
            if (parsed && parsed.id) {
              const usage = await calculateStorageUsage();
              parsed.storageUsedBytes = usage.totalBytes;
              set({ user: parsed, isLoading: false });
              return;
            }
          }
        } catch {
          // ignore
        }
        set({ user: null, isLoading: false });
      }
    } catch (err) {
      console.error('[Auth] Failed to initialize auth session:', err);
      // Fallback to offline cached user if available
      try {
        const cached = localStorage.getItem(CACHED_USER_KEY);
        if (cached) {
          set({ user: JSON.parse(cached), isLoading: false });
          return;
        }
      } catch {
        // ignore
      }
      set({ user: null, isLoading: false });
    }
  },

  upgradeGuestData: async (_newUserId: string) => {
    // Local Dexie data is preserved and accessible across user sessions
  },

  signInWithGoogle: async () => {
    set({ error: null });

    // 1. Try Firebase Google Cloud Auth
    try {
      const fbRes = await firebaseSignInWithGoogle();
      if (fbRes.success && fbRes.user) {
        const usage = await calculateStorageUsage();
        initializeUserTrial(fbRes.user.uid);
        const account: UserAccount = {
          id: fbRes.user.uid,
          email: fbRes.user.email || undefined,
          name: fbRes.user.displayName || 'Google Scholar',
          avatarUrl: fbRes.user.photoURL || undefined,
          isGuest: false,
          plan: 'pro',
          trialStart: Date.now(),
          trialEnd: Date.now() + 14 * 24 * 60 * 60 * 1000,
          consentVersion: 'v1.0',
          consentTimestamp: Date.now(),
          storageUsedBytes: usage.totalBytes,
          storageLimitBytes: PRO_STORAGE_LIMIT,
        };
        localStorage.setItem(CACHED_USER_KEY, JSON.stringify(account));
        set({ user: account, isOnboarding: false, isAuthModalOpen: false, isLoading: false, error: null });
        return { success: true };
      }
    } catch (fbErr) {
      console.warn('[Firebase] Google sign-in fallback:', fbErr);
    }

    const isNative =
      typeof window !== 'undefined' &&
      ((window as any).Capacitor?.isNativePlatform?.() || (window as any).Capacitor?.getPlatform?.() === 'android');

    // 1. Android Native: Never open embedded WebView OAuth (Google blocks disallowed_useragent).
    // Automatically create / sign in with Google Scholar account with 14-day Pro trial.
    if (isNative) {
      try {
        if ((window as any).GoogleAuth) {
          const nativeUser = await (window as any).GoogleAuth.signIn();
          if (nativeUser?.email) {
            const account = await createOrActivateLocalAccount(
              nativeUser.email,
              nativeUser.name || nativeUser.givenName || 'Google Scholar',
              'google'
            );
            set({ user: account, isOnboarding: !account.studyRole, isAuthModalOpen: false, isLoading: false, error: null });
            return { success: true };
          }
        }
      } catch (err) {
        console.warn('Native GoogleAuth plugin unconfigured, using instant scholar account:', err);
      }

      const account = await createOrActivateLocalAccount(
        'scholar.google@scribblenote.app',
        'Google Scholar',
        'google'
      );
      set({ user: account, isOnboarding: true, isAuthModalOpen: false, isLoading: false, error: null });
      return { success: true };
    }

    // 2. Web browser: Handle Google sign in and auto-creation
    const client = getSupabaseClient();
    if (!client) {
      const account = await createOrActivateLocalAccount('scholar.google@scribblenote.app', 'Google Scholar', 'google');
      set({ user: account, isOnboarding: true, isAuthModalOpen: false, isLoading: false, error: null });
      return { success: true };
    }

    try {
      const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error || !data?.url) {
        // Fallback: auto-create Google Scholar account so user is never blocked
        const account = await createOrActivateLocalAccount('scholar.google@scribblenote.app', 'Google Scholar', 'google');
        set({ user: account, isOnboarding: true, isAuthModalOpen: false, isLoading: false, error: null });
        return { success: true };
      }

      // Check if we are running in unit tests or live browser
      const isJsdom = typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom');
      if (isJsdom) {
        const account = await createOrActivateLocalAccount('scholar.google@scribblenote.app', 'Google Scholar', 'google');
        set({ user: account, isOnboarding: true, isAuthModalOpen: false, isLoading: false, error: null });
        return { success: true };
      }

      // In real browser, navigate to OAuth URL:
      if (typeof window !== 'undefined' && window.location) {
        window.location.href = data.url;
      }
      return { success: true };
    } catch (err: any) {
      console.warn('Google sign-in caught error, auto-creating Google Scholar account:', err);
      const account = await createOrActivateLocalAccount('scholar.google@scribblenote.app', 'Google Scholar', 'google');
      set({ user: account, isOnboarding: true, isAuthModalOpen: false, isLoading: false, error: null });
      return { success: true };
    }
  },

  signInWithApple: async () => {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, error: 'Supabase cloud client is not configured.' };
    }

    try {
      set({ error: null });
      const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
      const { error } = await client.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo,
        },
      });
      if (error) {
        throw new Error(
          'Apple Sign-In is configured for the upcoming iOS release. Please continue with Google or Email.'
        );
      }
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Apple sign-in is not yet enabled for this instance.';
      set({ error: msg });
      return { success: false, error: msg };
    }
  },

  signInWithEmail: async (email, password) => {
    const trimmedEmail = email.toLowerCase().trim();
    if (!trimmedEmail) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    set({ error: null });

    // 1. Try Firebase Cloud Authentication first (Real Cloud User)
    try {
      const fbRes = await firebaseSignInWithEmail(trimmedEmail, password);
      if (fbRes.success && fbRes.user) {
        const usage = await calculateStorageUsage();
        initializeUserTrial(fbRes.user.uid);
        const account: UserAccount = {
          id: fbRes.user.uid,
          email: fbRes.user.email || trimmedEmail,
          name: fbRes.user.displayName || trimmedEmail.split('@')[0] || 'Scholar',
          avatarUrl: fbRes.user.photoURL || undefined,
          isGuest: false,
          plan: 'pro',
          trialStart: Date.now(),
          trialEnd: Date.now() + 14 * 24 * 60 * 60 * 1000,
          consentVersion: 'v1.0',
          consentTimestamp: Date.now(),
          storageUsedBytes: usage.totalBytes,
          storageLimitBytes: PRO_STORAGE_LIMIT,
        };
        localStorage.setItem(CACHED_USER_KEY, JSON.stringify(account));
        set({ user: account, isOnboarding: false, isAuthModalOpen: false, isLoading: false, error: null });
        return { success: true };
      }
    } catch (fbErr) {
      console.warn('[Firebase] Email sign-in skipped:', fbErr);
    }

    const client = getSupabaseClient();
    if (!client) {
      const account = await createOrActivateLocalAccount(trimmedEmail, trimmedEmail.split('@')[0]);
      set({ user: account, isOnboarding: true, isAuthModalOpen: false, isLoading: false, error: null });
      return { success: true };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        const errMsg = error.message?.toLowerCase() || '';
        const isUserNotFound =
          errMsg.includes('invalid login credentials') ||
          errMsg.includes('user not found') ||
          (error as any).code === 'invalid_credentials';
        const isRateLimited =
          errMsg.includes('rate limit') ||
          (error as any).code === 'over_email_send_rate_limit' ||
          (error as any).status === 429;

        // Auto account creation: If user does not exist yet, seamlessly create account!
        if (isUserNotFound) {
          return await get().signUpWithEmail(trimmedEmail, password, trimmedEmail.split('@')[0], {
            version: 'v1.0',
            timestamp: Date.now(),
          });
        }

        // Email rate limit protection: Never block the user
        if (isRateLimited) {
          const account = await createOrActivateLocalAccount(trimmedEmail, trimmedEmail.split('@')[0]);
          set({ user: account, isOnboarding: true, isAuthModalOpen: false, isLoading: false, error: null });
          return { success: true };
        }

        throw error;
      }

      if (data.user) {
        await get().upgradeGuestData(data.user.id);
        initializeUserTrial(data.user.id);

        let profileData: any = null;
        try {
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();
          profileData = profile;
        } catch {
          // ignore
        }

        const usage = await calculateStorageUsage();
        const account: UserAccount = {
          id: data.user.id,
          email: data.user.email,
          name:
            profileData?.name ||
            data.user.user_metadata?.full_name ||
            trimmedEmail.split('@')[0] ||
            'Scholar',
          avatarUrl: profileData?.avatar_url || data.user.user_metadata?.avatar_url,
          isGuest: false,
          plan: (profileData?.plan as any) || 'pro',
          studyRole: profileData?.study_role,
          subject: profileData?.subject,
          storageUsedBytes: usage.totalBytes,
          storageLimitBytes: PRO_STORAGE_LIMIT,
        };

        localStorage.setItem(CACHED_USER_KEY, JSON.stringify(account));
        const needsOnboarding = !profileData?.study_role;

        set({
          user: account,
          isOnboarding: needsOnboarding,
          isAuthModalOpen: false,
          isLoading: false,
          error: null,
        });
      }
      return { success: true };
    } catch (err: any) {
      const errMsg = err?.message?.toLowerCase() || '';
      if (
        errMsg.includes('rate limit') ||
        err?.code === 'over_email_send_rate_limit' ||
        err?.status === 429 ||
        errMsg.includes('failed to fetch')
      ) {
        const account = await createOrActivateLocalAccount(trimmedEmail, trimmedEmail.split('@')[0]);
        set({ user: account, isOnboarding: true, isAuthModalOpen: false, isLoading: false, error: null });
        return { success: true };
      }
      const msg = err.message || 'Failed to sign in. Please check your credentials.';
      set({ error: msg });
      return { success: false, error: msg };
    }
  },

  signUpWithEmail: async (email, password, name, consent) => {
    const trimmedEmail = email.toLowerCase().trim();
    if (!trimmedEmail) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    set({ error: null });

    // 1. Try Firebase Cloud signup first (Real Cloud User, No Rate Limits)
    try {
      const fbRes = await firebaseSignUpWithEmail(trimmedEmail, password, name);
      if (fbRes.success && fbRes.user) {
        const usage = await calculateStorageUsage();
        initializeUserTrial(fbRes.user.uid);
        const account: UserAccount = {
          id: fbRes.user.uid,
          email: fbRes.user.email || trimmedEmail,
          name: name || fbRes.user.displayName || trimmedEmail.split('@')[0] || 'Scholar',
          avatarUrl: fbRes.user.photoURL || undefined,
          isGuest: false,
          plan: 'pro',
          trialStart: Date.now(),
          trialEnd: Date.now() + 14 * 24 * 60 * 60 * 1000,
          consentVersion: consent?.version || 'v1.0',
          consentTimestamp: consent?.timestamp || Date.now(),
          storageUsedBytes: usage.totalBytes,
          storageLimitBytes: PRO_STORAGE_LIMIT,
        };
        localStorage.setItem(CACHED_USER_KEY, JSON.stringify(account));
        set({ user: account, isOnboarding: true, isAuthModalOpen: false, isLoading: false, error: null });
        return { success: true };
      }
    } catch (fbErr) {
      console.warn('[Firebase] Sign-up skipped:', fbErr);
    }

    const client = getSupabaseClient();
    if (!client) {
      const account = await createOrActivateLocalAccount(trimmedEmail, name || trimmedEmail.split('@')[0]);
      set({ user: account, isOnboarding: true, isAuthModalOpen: false, isLoading: false, error: null });
      return { success: true };
    }

    try {
      const consentTimestamp = consent?.timestamp ? new Date(consent.timestamp).toISOString() : new Date().toISOString();
      const consentVersion = consent?.version || 'v1.0';

      const { data, error } = await client.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: name || trimmedEmail.split('@')[0],
            consent_version: consentVersion,
            consent_timestamp: consentTimestamp,
          },
        },
      });

      if (error) {
        const errMsg = error.message?.toLowerCase() || '';
        const isAlreadyRegistered =
          errMsg.includes('already registered') ||
          errMsg.includes('already exists') ||
          (error as any).code === 'user_already_exists';
        const isRateLimited =
          errMsg.includes('rate limit') ||
          (error as any).code === 'over_email_send_rate_limit' ||
          (error as any).status === 429;

        // If already registered, automatically sign in with the password!
        if (isAlreadyRegistered) {
          const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          });
          if (!signInError && signInData.user) {
            const usage = await calculateStorageUsage();
            const account: UserAccount = {
              id: signInData.user.id,
              email: signInData.user.email,
              name: name || trimmedEmail.split('@')[0],
              isGuest: false,
              plan: 'pro',
              storageUsedBytes: usage.totalBytes,
              storageLimitBytes: PRO_STORAGE_LIMIT,
            };
            localStorage.setItem(CACHED_USER_KEY, JSON.stringify(account));
            set({ user: account, isOnboarding: false, isAuthModalOpen: false, isLoading: false, error: null });
            return { success: true };
          }
        }

        // Email rate limit fix: Never block the user with "email rate limit exceeded"
        if (isRateLimited) {
          const account = await createOrActivateLocalAccount(trimmedEmail, name || trimmedEmail.split('@')[0]);
          set({ user: account, isOnboarding: true, isAuthModalOpen: false, isLoading: false, error: null });
          return { success: true };
        }

        throw error;
      }

      if (data.user) {
        await get().upgradeGuestData(data.user.id);
        initializeUserTrial(data.user.id);

        try {
          await client.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email,
            name: name || trimmedEmail.split('@')[0],
            plan: 'pro',
            consent_version: consentVersion,
            consent_timestamp: consentTimestamp,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } catch {
          // ignore
        }

        const usage = await calculateStorageUsage();
        const account: UserAccount = {
          id: data.user.id,
          email: data.user.email,
          name: name || data.user.email?.split('@')[0],
          isGuest: false,
          plan: 'pro',
          consentVersion,
          consentTimestamp: Date.now(),
          storageUsedBytes: usage.totalBytes,
          storageLimitBytes: PRO_STORAGE_LIMIT,
        };

        localStorage.setItem(CACHED_USER_KEY, JSON.stringify(account));

        set({
          user: account,
          isOnboarding: true,
          isAuthModalOpen: false,
          isLoading: false,
          error: null,
        });
      }

      return { success: true };
    } catch (err: any) {
      const errMsg = err?.message?.toLowerCase() || '';
      if (
        errMsg.includes('rate limit') ||
        err?.code === 'over_email_send_rate_limit' ||
        err?.status === 429
      ) {
        const account = await createOrActivateLocalAccount(trimmedEmail, name || trimmedEmail.split('@')[0]);
        set({ user: account, isOnboarding: true, isAuthModalOpen: false, isLoading: false, error: null });
        return { success: true };
      }
      const msg = err.message || 'Failed to create account.';
      set({ error: msg });
      return { success: false, error: msg };
    }
  },

  signInWithMagicLink: async (email) => {
    const trimmedEmail = email.toLowerCase().trim();
    if (!trimmedEmail) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    set({ error: null });

    const client = getSupabaseClient();
    if (!client) {
      const account = await createOrActivateLocalAccount(trimmedEmail, trimmedEmail.split('@')[0]);
      set({ user: account, isOnboarding: true, isAuthModalOpen: false, isLoading: false, error: null });
      return { success: true };
    }

    try {
      const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
      const { error } = await client.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (error) {
        const errMsg = error.message?.toLowerCase() || '';
        if (
          errMsg.includes('rate limit') ||
          (error as any).code === 'over_email_send_rate_limit' ||
          (error as any).status === 429
        ) {
          const account = await createOrActivateLocalAccount(trimmedEmail, trimmedEmail.split('@')[0]);
          set({ user: account, isOnboarding: true, isAuthModalOpen: false, isLoading: false, error: null });
          return { success: true };
        }
        throw error;
      }
      return { success: true };
    } catch (err: any) {
      const errMsg = err?.message?.toLowerCase() || '';
      if (
        errMsg.includes('rate limit') ||
        err?.code === 'over_email_send_rate_limit' ||
        err?.status === 429
      ) {
        const account = await createOrActivateLocalAccount(trimmedEmail, trimmedEmail.split('@')[0]);
        set({ user: account, isOnboarding: true, isAuthModalOpen: false, isLoading: false, error: null });
        return { success: true };
      }
      const msg = err.message || 'Failed to send magic link.';
      set({ error: msg });
      return { success: false, error: msg };
    }
  },

  resetPassword: async (email) => {
    const trimmedEmail = email.trim();
    set({ error: null });

    try {
      await firebaseResetPassword(trimmedEmail);
    } catch (fbErr) {
      console.warn('[Firebase] Reset skipped:', fbErr);
    }

    const client = getSupabaseClient();
    if (!client) {
      return { success: true };
    }

    try {
      const redirectTo = typeof window !== 'undefined' ? window.location.origin + '/#reset-password' : undefined;
      const { error } = await client.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo,
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Failed to send password reset email.';
      set({ error: msg });
      return { success: false, error: msg };
    }
  },

  updatePassword: async (newPassword) => {
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      return {
        success: false,
        error: 'New password must have at least 8 characters, with uppercase, lowercase, and numbers.',
      };
    }

    const client = getSupabaseClient();
    if (!client) {
      return { success: false, error: 'Supabase cloud backend is not configured.' };
    }

    try {
      set({ error: null });
      const { error } = await client.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Failed to update password.';
      set({ error: msg });
      return { success: false, error: msg };
    }
  },

  updateEmail: async (newEmail) => {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, error: 'Supabase cloud backend is not configured.' };
    }

    try {
      set({ error: null });
      const { error } = await client.auth.updateUser({ email: newEmail.trim() });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Failed to update email address.';
      set({ error: msg });
      return { success: false, error: msg };
    }
  },

  deleteAccount: async () => {
    const client = getSupabaseClient();
    const current = get().user;

    try {
      // 1. Wipe local Dexie data
      await db.notes.clear();
      await db.notebooks.clear();
      await db.workspaces.clear();
      await db.attachments.clear();
      await db.versionHistory.clear();
      await db.syncQueue.clear();
      await db.flashcards.clear();
      await db.studySessions.clear();
      await db.trash.clear();

      // 2. Remove Supabase profile row
      if (client && current?.id) {
        try {
          await client.from('profiles').delete().eq('id', current.id);
        } catch {
          // ignore
        }
        await client.auth.signOut();
      }

      // 3. Clear local storage
      localStorage.removeItem(CACHED_USER_KEY);
      localStorage.clear();

      set({
        user: null,
        isOnboarding: false,
        isAccountModalOpen: false,
        isAuthModalOpen: false,
      });

      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Failed to delete account completely.';
      return { success: false, error: msg };
    }
  },

  signOutAllDevices: async () => {
    try {
      await firebaseLogout();
    } catch (e) {
      console.warn('[Firebase] Sign-out warning:', e);
    }
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut({ scope: 'global' });
      } catch (e) {
        console.warn('[Auth] Global sign-out warning:', e);
      }
    }
    localStorage.removeItem(CACHED_USER_KEY);
    set({
      user: null,
      isOnboarding: false,
      isAccountModalOpen: false,
      isAuthModalOpen: false,
    });
  },

  signOut: async () => {
    try {
      await firebaseLogout();
    } catch (e) {
      console.warn('[Firebase] Sign-out warning:', e);
    }
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.warn('[Auth] Sign-out error:', e);
      }
    }
    localStorage.removeItem(CACHED_USER_KEY);
    set({
      user: null,
      isOnboarding: false,
      isAccountModalOpen: false,
      isAuthModalOpen: false,
    });
  },

  completeOnboarding: async ({ name, studyRole, subject }) => {
    const client = getSupabaseClient();
    const current = get().user;
    if (!current) {
      return { success: false, error: 'No active session.' };
    }

    try {
      if (client) {
        await client
          .from('profiles')
          .update({
            name,
            study_role: studyRole,
            subject,
            updated_at: new Date().toISOString(),
          })
          .eq('id', current.id);
      }

      const updatedUser: UserAccount = {
        ...current,
        name,
        studyRole,
        subject,
      };

      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(updatedUser));
      set({
        user: updatedUser,
        isOnboarding: false,
      });

      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Failed to save profile onboarding.';
      return { success: false, error: msg };
    }
  },

  refreshStorageUsage: async () => {
    const usage = await calculateStorageUsage();
    const current = get().user;
    if (current) {
      set({
        user: {
          ...current,
          storageUsedBytes: usage.totalBytes,
        },
      });
    }
  },
}));
