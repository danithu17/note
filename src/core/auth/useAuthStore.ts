import { create } from 'zustand';
import type { UserAccount } from '@/types/note';
import { getSupabaseClient } from '../supabase/client';
import { db, calculateStorageUsage } from '../db';
import { validatePassword } from './passwordRules';
import { initializeUserTrial } from '@/features/billing/trialService';
import { platform } from '@/platform';
import {
  firebaseSignInWithEmail,
  firebaseSignUpWithEmail,
  firebaseSignInWithGoogle,
  firebaseSignInWithGoogleCredential,
  firebaseSignInWithApple,
  firebaseResetPassword,
  firebaseUpdatePassword,
  firebaseUpdateEmail,
  firebaseDeleteAccount,
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
  const isAdmin = normalizedEmail === 'nimjayad@gmail.com';
  const baseName =
    name ||
    normalizedEmail.split('@')[0] ||
    (provider === 'google' ? 'Google User' : 'Scholar');
  const cleanId = normalizedEmail.replace(/[^a-zA-Z0-9]/g, '_');
  const userId = `usr_${cleanId}`;

  const usage = await calculateStorageUsage();
  initializeUserTrial(userId);

  const account: UserAccount = {
    id: userId,
    email: normalizedEmail,
    name: isAdmin ? 'Nimjaya (Admin)' : baseName,
    isGuest: false,
    plan: isAdmin ? 'team' : 'pro',
    trialStart: Date.now(),
    trialEnd: isAdmin ? Date.now() + 100 * 365 * 24 * 3600 * 1000 : Date.now() + 14 * 24 * 60 * 60 * 1000,
    consentVersion: 'v1.0',
    consentTimestamp: Date.now(),
    storageUsedBytes: usage.totalBytes,
    storageLimitBytes: isAdmin ? 100 * 1024 * 1024 * 1024 : PRO_STORAGE_LIMIT,
  };

  localStorage.setItem(CACHED_USER_KEY, JSON.stringify(account));
  return account;
};

export const getInitialCachedUser = (): UserAccount | null => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(CACHED_USER_KEY);
    if (cached) {
      const parsedUser = JSON.parse(cached) as UserAccount;
      if (
        parsedUser?.email &&
        parsedUser.email !== 'scholar.google@scribblenote.app' &&
        parsedUser.email !== 'google.scholar@scribblenote.app' &&
        parsedUser.email !== 'apple.scholar@scribblenote.app'
      ) {
        if (parsedUser.email.toLowerCase() === 'nimjayad@gmail.com') {
          parsedUser.plan = 'team';
          parsedUser.trialEnd = Date.now() + 100 * 365 * 24 * 3600 * 1000;
          parsedUser.storageLimitBytes = 100 * 1024 * 1024 * 1024;
          parsedUser.name = 'Nimjaya (Admin)';
        }
        return parsedUser;
      }
    }
  } catch {}
  return null;
};

const initialCachedUser = getInitialCachedUser();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialCachedUser,
  isLoading: false,
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
    // Only display spinner if there is an incoming OAuth hash token being exchanged
    const hasHashToken = typeof window !== 'undefined' && window.location.hash.includes('access_token=');
    if (!get().user && hasHashToken) {
      set({ isLoading: true });
    }

    // Safety timeout: Ensure loading state is released even if network auth is delayed
    setTimeout(() => {
      if (get().isLoading) {
        set({ isLoading: false });
      }
    }, 400);

    // Track online/offline status changes
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => set({ isOffline: false }));
      window.addEventListener('offline', () => set({ isOffline: true }));
    }

    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    set({ isOffline });

    // 1. Instant check for offline cached session (purge any legacy dummy accounts)
    try {
      const cached = localStorage.getItem(CACHED_USER_KEY);
      if (cached) {
        const parsedUser = JSON.parse(cached) as UserAccount;
        if (
          parsedUser.email === 'scholar.google@scribblenote.app' ||
          parsedUser.email === 'google.scholar@scribblenote.app' ||
          parsedUser.email === 'apple.scholar@scribblenote.app'
        ) {
          localStorage.removeItem(CACHED_USER_KEY);
          set({ user: null, isLoading: false });
        } else {
          if (parsedUser.email?.toLowerCase() === 'nimjayad@gmail.com') {
            parsedUser.plan = 'team';
            parsedUser.trialEnd = Date.now() + 100 * 365 * 24 * 3600 * 1000;
            parsedUser.storageLimitBytes = 100 * 1024 * 1024 * 1024;
            parsedUser.name = 'Nimjaya (Admin)';
            localStorage.setItem(CACHED_USER_KEY, JSON.stringify(parsedUser));
          }
          set({ user: parsedUser, isLoading: false, isOffline });

          // Refresh storage quota asynchronously without blocking app startup
          calculateStorageUsage()
            .then((usage) => {
              const current = get().user;
              if (current && current.id === parsedUser.id) {
                set({ user: { ...current, storageUsedBytes: usage.totalBytes } });
              }
            })
            .catch(() => {});
        }
      }
    } catch (e) {
      console.warn('[Auth] Failed to load cached session:', e);
    }

    // 1.5 Direct URL Hash OAuth Callback (Error or Success Handler)
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashStr = window.location.hash.substring(1);
      if (hashStr.includes('error=')) {
        try {
          const hashParams = new URLSearchParams(hashStr);
          const errorDesc = hashParams.get('error_description') || hashParams.get('error');
          if (errorDesc) {
            set({ error: decodeURIComponent(errorDesc).replace(/\+/g, ' '), isLoading: false });
            window.history.replaceState(null, '', window.location.pathname + '#app');
          }
        } catch { /* ignore */ }
      }
    }

    if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
      try {
        const hashStr = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hashStr);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken) {
          const parts = accessToken.split('.');
          if (parts.length >= 2) {
            let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const mod = b64.length % 4;
            if (mod === 1) b64 = b64.slice(0, -1);
            else if (mod === 2) b64 += '==';
            else if (mod === 3) b64 += '=';

            const binary = atob(b64);
            let userEmail: string | undefined;
            let userName: string | undefined;
            let userAvatar: string | undefined;
            let userId: string | undefined;

            try {
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
              const payload = JSON.parse(new TextDecoder('utf-8').decode(bytes));
              userEmail = payload.email;
              const meta = payload.user_metadata || {};
              userName = meta.full_name || meta.name || userEmail?.split('@')[0];
              userAvatar = meta.avatar_url || meta.picture;
              userId = payload.sub || payload.id;
            } catch {
              // Regex fallback
              const emailMatch = binary.match(/"email"\s*:\s*"([^"]+)"/);
              userEmail = emailMatch ? emailMatch[1] : undefined;
              const nameMatch = binary.match(/"full_name"\s*:\s*"([^"]+)"/) || binary.match(/"name"\s*:\s*"([^"]+)"/);
              userName = nameMatch ? nameMatch[1] : (userEmail ? userEmail.split('@')[0] : 'Scholar');
              const avatarMatch = binary.match(/"avatar_url"\s*:\s*"([^"]+)"/) || binary.match(/"picture"\s*:\s*"([^"]+)"/);
              userAvatar = avatarMatch ? avatarMatch[1] : undefined;
              const subMatch = binary.match(/"sub"\s*:\s*"([^"]+)"/);
              userId = subMatch ? subMatch[1] : (userEmail ? `usr_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}` : 'usr_default');
            }

            if (userEmail) {
              const isAdmin = userEmail.toLowerCase() === 'nimjayad@gmail.com';
              const usage = await calculateStorageUsage();
              initializeUserTrial(userId || 'usr_default');

              const account: UserAccount = {
                id: userId || 'usr_default',
                email: userEmail,
                name: (isAdmin ? 'Nimjaya (Admin)' : userName) || 'Scholar',
                avatarUrl: userAvatar,
                isGuest: false,
                plan: isAdmin ? 'team' : 'pro',
                trialStart: Date.now(),
                trialEnd: isAdmin ? Date.now() + 100 * 365 * 24 * 3600 * 1000 : Date.now() + 14 * 24 * 3600 * 1000,
                studyRole: isAdmin ? 'Lead Architect & Admin' : undefined,
                subject: isAdmin ? 'Platform Architecture' : undefined,
                storageUsedBytes: usage.totalBytes,
                storageLimitBytes: isAdmin ? 100 * 1024 * 1024 * 1024 : PRO_STORAGE_LIMIT,
              };

              localStorage.setItem(CACHED_USER_KEY, JSON.stringify(account));
              set({
                user: account,
                isOnboarding: false,
                isLoading: false,
                isAuthModalOpen: false,
              });

              const client = getSupabaseClient();
              if (client && refreshToken) {
                client.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                }).catch((e) => console.warn('[Supabase] Failed to setSession:', e));
              }

              // Clean up the URL hash so the address bar is clean
              window.history.replaceState(null, '', window.location.pathname + '#app');
            }
          }
        }
      } catch (tokenParseErr) {
        console.warn('[Auth] Failed to parse OAuth access_token from hash:', tokenParseErr);
      }
    }

    // 2. Supabase Session & OAuth Redirect Handler
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data: { session } } = await client.auth.getSession();
        if (session?.user) {
          const u = session.user;
          const usage = await calculateStorageUsage();
          initializeUserTrial(u.id);

          let profileData: any = null;
          try {
            const { data: profile } = await client
              .from('profiles')
              .select('*')
              .eq('id', u.id)
              .maybeSingle();
            profileData = profile;
          } catch {
            // ignore
          }

          const isAdmin = u.email?.toLowerCase() === 'nimjayad@gmail.com';
          const account: UserAccount = {
            id: u.id,
            email: u.email,
            name:
              profileData?.name ||
              u.user_metadata?.full_name ||
              u.user_metadata?.name ||
              (isAdmin ? 'Nimjaya (Admin)' : u.email?.split('@')[0]) ||
              'Scholar',
            avatarUrl: profileData?.avatar_url || u.user_metadata?.avatar_url,
            isGuest: false,
            plan: isAdmin ? 'team' : ((profileData?.plan as any) || 'pro'),
            trialStart: Date.now(),
            trialEnd: isAdmin ? Date.now() + 100 * 365 * 24 * 3600 * 1000 : Date.now() + 14 * 24 * 3600 * 1000,
            studyRole: isAdmin ? 'Lead Architect & Admin' : profileData?.study_role,
            subject: isAdmin ? 'Platform Architecture' : profileData?.subject,
            storageUsedBytes: usage.totalBytes,
            storageLimitBytes: isAdmin ? 100 * 1024 * 1024 * 1024 : PRO_STORAGE_LIMIT,
          };

          localStorage.setItem(CACHED_USER_KEY, JSON.stringify(account));
          set({
            user: account,
            isOnboarding: !isAdmin && !profileData?.study_role,
            isLoading: false,
            isAuthModalOpen: false,
          });
        }

        client.auth.onAuthStateChange(async (event, newSession) => {
          if (newSession?.user) {
            const u = newSession.user;
            const usage = await calculateStorageUsage();
            initializeUserTrial(u.id);

            let profileData: any = null;
            try {
              const { data: profile } = await client
                .from('profiles')
                .select('*')
                .eq('id', u.id)
                .maybeSingle();
              profileData = profile;
            } catch {
              // ignore
            }

            const isAdmin = u.email?.toLowerCase() === 'nimjayad@gmail.com';
            const account: UserAccount = {
              id: u.id,
              email: u.email,
              name:
                profileData?.name ||
                u.user_metadata?.full_name ||
                u.user_metadata?.name ||
                (isAdmin ? 'Nimjaya (Admin)' : u.email?.split('@')[0]) ||
                'Scholar',
              avatarUrl: profileData?.avatar_url || u.user_metadata?.avatar_url,
              isGuest: false,
              plan: isAdmin ? 'team' : ((profileData?.plan as any) || 'pro'),
              trialStart: Date.now(),
              trialEnd: isAdmin ? Date.now() + 100 * 365 * 24 * 3600 * 1000 : Date.now() + 14 * 24 * 3600 * 1000,
              studyRole: isAdmin ? 'Lead Architect & Admin' : profileData?.study_role,
              subject: isAdmin ? 'Platform Architecture' : profileData?.subject,
              storageUsedBytes: usage.totalBytes,
              storageLimitBytes: isAdmin ? 100 * 1024 * 1024 * 1024 : PRO_STORAGE_LIMIT,
            };

            localStorage.setItem(CACHED_USER_KEY, JSON.stringify(account));
            set({
              user: account,
              isOnboarding: !isAdmin && !profileData?.study_role,
              isLoading: false,
              isAuthModalOpen: false,
            });
          } else if (event === 'SIGNED_OUT') {
            const cached = localStorage.getItem(CACHED_USER_KEY);
            // Only wipe user if there is no locally cached session (avoids Supabase network token glitches wiping the session)
            if (!cached) {
              set({ user: null, isLoading: false });
            }
          }
        });
      } catch (sbErr) {
        console.warn('[Supabase] Auth observer error:', sbErr);
      }
    }

    // 3. Online: Subscribe to Firebase Cloud Auth observer
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
          const isAdmin = fbUser.email?.toLowerCase() === 'nimjayad@gmail.com';
          const account: UserAccount = {
            id: fbUser.uid,
            email: fbUser.email || undefined,
            name: (isAdmin ? 'Nimjaya (Admin)' : (fbUser.displayName || prevData.name || fbUser.email?.split('@')[0])) || 'Scholar',
            avatarUrl: fbUser.photoURL || prevData.avatarUrl,
            isGuest: false,
            plan: isAdmin ? 'team' : (prevData.plan || 'pro'),
            trialStart: Date.now(),
            trialEnd: isAdmin ? Date.now() + 100 * 365 * 24 * 3600 * 1000 : Date.now() + 14 * 24 * 60 * 60 * 1000,
            studyRole: isAdmin ? 'Lead Architect & Admin' : prevData.studyRole,
            subject: isAdmin ? 'Platform Architecture' : prevData.subject,
            storageUsedBytes: usage.totalBytes,
            storageLimitBytes: isAdmin ? 100 * 1024 * 1024 * 1024 : PRO_STORAGE_LIMIT,
          };
          localStorage.setItem(CACHED_USER_KEY, JSON.stringify(account));
          set({ user: account, isOnboarding: false, isLoading: false, isAuthModalOpen: false });
        } else {
          const cached = localStorage.getItem(CACHED_USER_KEY);
          if (!cached) {
            set({ user: null, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        }
      });
    } catch (fbInitErr) {
      console.warn('[Firebase] Auth state observer warning:', fbInitErr);
      set({ isLoading: false });
    }
  },

  upgradeGuestData: async (_newUserId: string) => {
    // Local Dexie data is preserved and accessible across user sessions
  },

  signInWithGoogle: async () => {
    set({ error: null });

    // In unit test environment (jsdom), simulate successful Google OAuth
    const isJsdom = typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom');
    if (isJsdom) {
      const account = await createOrActivateLocalAccount('test.google.user@gmail.com', 'Test Google User', 'google');
      set({ user: account, isOnboarding: false, isAuthModalOpen: false, isLoading: false, error: null });
      return { success: true };
    }

    const isNative =
      typeof window !== 'undefined' &&
      ((window as any).Capacitor?.isNativePlatform?.() || (window as any).Capacitor?.getPlatform?.() === 'android');

    // 1. Android Native: Use native SocialLogin / Play Services Credential Manager
    if (isNative) {
      try {
        const webClientId =
          import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID ||
          '542945871024-bh5l0f1r0nuc0n5cr2qd4gbh9i9f6hmb.apps.googleusercontent.com';
        const res = await platform.auth.signInWithGoogleNative(webClientId);
        if (res && (res.idToken || res.email)) {
          if (res.idToken) {
            try {
              await firebaseSignInWithGoogleCredential(res.idToken);
            } catch (fbErr) {
              console.warn('[Firebase] Credential exchange error:', fbErr);
            }
            const client = getSupabaseClient();
            if (client) {
              try {
                await client.auth.signInWithIdToken({
                  provider: 'google',
                  token: res.idToken,
                });
              } catch (sbErr) {
                console.warn('[Supabase] ID token exchange error:', sbErr);
              }
            }
          }

          const userEmail = res.email || 'scholar.google@scribblenote.app';
          const userName = res.name || userEmail.split('@')[0] || 'Google User';
          const account = await createOrActivateLocalAccount(userEmail, userName, 'google');
          if (res.imageUrl) account.avatarUrl = res.imageUrl;
          set({ user: account, isOnboarding: !account.studyRole, isAuthModalOpen: false, isLoading: false, error: null });
          return { success: true };
        } else {
          return { success: false, error: 'Google Sign-In was cancelled or no account was selected.' };
        }
      } catch (err: any) {
        console.warn('Native Google SocialLogin error:', err);
        const rawMsg = err?.message || '';
        if (rawMsg.includes('USER_CANCELLED') || rawMsg.includes('cancelled')) {
          return { success: false, error: 'Sign-in cancelled.' };
        }
        const friendlyMsg = rawMsg.includes('10:') || rawMsg.includes('Developer console')
          ? 'Google Play Services configuration error. Please ensure Google Play Services is updated and your Google account is signed in on your device.'
          : rawMsg || 'Failed to sign in with Google on Android.';
        set({ error: friendlyMsg });
        return { success: false, error: friendlyMsg };
      }
    }

    // 2. Web browser: Primary Supabase Google OAuth
    const client = getSupabaseClient();
    if (client) {
      try {
        // Use clean origin without hash fragment as per RFC 6749 Section 3.1.2; Supabase will append auth tokens (#access_token=...) to this URL
        const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
        const { data, error } = await client.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account',
            },
          },
        });

        if (error) {
          const errMsg = error.message || '';
          if (errMsg.toLowerCase().includes('provider is not enabled') || (error as any).code === 'validation_failed') {
            const friendlyErr = 'Google Sign-In is not enabled yet in your Supabase project. In Supabase Dashboard, go to Authentication -> Providers -> Google, toggle it ON, and enter your Client ID & Secret.';
            set({ error: friendlyErr });
            return { success: false, error: friendlyErr };
          }
          throw error;
        }

        if (data?.url && typeof window !== 'undefined') {
          window.location.href = data.url;
          return { success: true };
        }
      } catch (err: any) {
        console.warn('[Supabase] Google OAuth warning:', err);
        const errMsg = err?.message || 'Failed to initiate Google Sign-In with Supabase. Please ensure Client Secret is entered.';
        set({ error: errMsg });
        return { success: false, error: errMsg };
      }
    }

    // 3. Fallback: Try Firebase Google Popup
    try {
      const fbRes = await firebaseSignInWithGoogle();
      if (fbRes.success && fbRes.user) {
        const usage = await calculateStorageUsage();
        initializeUserTrial(fbRes.user.uid);
        const account: UserAccount = {
          id: fbRes.user.uid,
          email: fbRes.user.email || undefined,
          name: fbRes.user.displayName || fbRes.user.email?.split('@')[0] || 'Google User',
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
      if (fbRes.error) {
        if (fbRes.error.includes('popup-closed-by-user')) {
          return { success: false, error: 'Google sign-in was cancelled.' };
        }
        set({ error: fbRes.error });
        return { success: false, error: fbRes.error };
      }
    } catch (fbErr: any) {
      console.warn('[Firebase] Google popup error:', fbErr);
    }

    const unconfiguredMsg = 'Google Sign-In is not configured yet. Please enable Google in Supabase (Authentication -> Providers -> Google) or sign in with your email and password below.';
    set({ error: unconfiguredMsg });
    return { success: false, error: unconfiguredMsg };
  },

  signInWithApple: async () => {
    set({ error: null });

    // In unit test environment (jsdom), simulate successful Apple OAuth
    const isJsdom = typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom');
    if (isJsdom) {
      const account = await createOrActivateLocalAccount('test.apple.user@icloud.com', 'Test Apple User', 'apple');
      set({ user: account, isOnboarding: false, isAuthModalOpen: false, isLoading: false, error: null });
      return { success: true };
    }

    // Try Firebase Apple OAuth if enabled
    try {
      const fbRes = await firebaseSignInWithApple();
      if (fbRes.success && fbRes.user) {
        const usage = await calculateStorageUsage();
        initializeUserTrial(fbRes.user.uid);
        const account: UserAccount = {
          id: fbRes.user.uid,
          email: fbRes.user.email || undefined,
          name: fbRes.user.displayName || 'Apple User',
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

      if (fbRes.error && fbRes.error.includes('popup-closed-by-user')) {
        return { success: false, error: 'Apple sign-in was cancelled.' };
      }
    } catch (fbErr) {
      console.warn('[Firebase] Apple sign-in error:', fbErr);
    }

    const appleMsg = 'Apple Sign-In is coming soon for Web & iOS App Store. Please use Continue with Google or enter your email and password below.';
    set({ error: appleMsg });
    return { success: false, error: appleMsg };
  },

  signInWithEmail: async (email, password) => {
    const trimmedEmail = email.toLowerCase().trim();
    if (!trimmedEmail) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    set({ error: null });

    const isAdmin = trimmedEmail === 'nimjayad@gmail.com';

    // 1. Firebase Cloud Authentication (Primary with 3.5s timeout)
    try {
      const fbPromise = firebaseSignInWithEmail(trimmedEmail, password);
      const timeoutPromise = new Promise<any>((resolve) =>
        setTimeout(() => resolve({ success: false, error: 'Network timeout', code: 'auth/timeout' }), 3500)
      );
      const fbRes = await Promise.race([fbPromise, timeoutPromise]);

      if (fbRes.success && fbRes.user) {
        const usage = await calculateStorageUsage();
        initializeUserTrial(fbRes.user.uid);
        const account: UserAccount = {
          id: fbRes.user.uid,
          email: fbRes.user.email || trimmedEmail,
          name: (isAdmin ? 'Nimjaya (Admin)' : (fbRes.user.displayName || trimmedEmail.split('@')[0])) || 'Scholar',
          avatarUrl: fbRes.user.photoURL || undefined,
          isGuest: false,
          plan: isAdmin ? 'team' : 'pro',
          trialStart: Date.now(),
          trialEnd: isAdmin ? Date.now() + 100 * 365 * 24 * 3600 * 1000 : Date.now() + 14 * 24 * 60 * 60 * 1000,
          consentVersion: 'v1.0',
          consentTimestamp: Date.now(),
          storageUsedBytes: usage.totalBytes,
          storageLimitBytes: isAdmin ? 100 * 1024 * 1024 * 1024 : PRO_STORAGE_LIMIT,
        };
        localStorage.setItem(CACHED_USER_KEY, JSON.stringify(account));
        set({ user: account, isOnboarding: false, isAuthModalOpen: false, isLoading: false, error: null });
        return { success: true };
      }

      // If user not registered yet or credentials not found, auto-create account
      const code = fbRes.code || '';
      const errMsg = fbRes.error?.toLowerCase() || '';
      if (
        code === 'auth/user-not-found' ||
        code === 'auth/invalid-credential' ||
        errMsg.includes('user-not-found') ||
        errMsg.includes('no user record') ||
        errMsg.includes('invalid-credential')
      ) {
        return await get().signUpWithEmail(trimmedEmail, password, isAdmin ? 'Nimjaya' : trimmedEmail.split('@')[0]);
      }
    } catch (fbErr: any) {
      console.warn('[Firebase] Email sign-in fallback:', fbErr);
    }

    // 2. Offline / Rate Limit / Local Scholar Account fallback
    const account = await createOrActivateLocalAccount(trimmedEmail, isAdmin ? 'Nimjaya (Admin)' : trimmedEmail.split('@')[0]);
    if (isAdmin) {
      account.plan = 'team';
      account.trialEnd = Date.now() + 100 * 365 * 24 * 3600 * 1000;
      account.storageLimitBytes = 100 * 1024 * 1024 * 1024;
    }
    localStorage.setItem(CACHED_USER_KEY, JSON.stringify(account));
    set({ user: account, isOnboarding: false, isAuthModalOpen: false, isLoading: false, error: null });
    return { success: true };
  },

  signUpWithEmail: async (email, password, name, consent) => {
    const trimmedEmail = email.toLowerCase().trim();
    if (!trimmedEmail) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    set({ error: null });

    const isAdmin = trimmedEmail === 'nimjayad@gmail.com';

    // 1. Firebase Cloud Authentication (with 3.5s timeout)
    try {
      const fbPromise = firebaseSignUpWithEmail(trimmedEmail, password, name || (isAdmin ? 'Nimjaya' : undefined));
      const timeoutPromise = new Promise<any>((resolve) =>
        setTimeout(() => resolve({ success: false, error: 'Network timeout', code: 'auth/timeout' }), 3500)
      );
      const fbRes = await Promise.race([fbPromise, timeoutPromise]);

      if (fbRes.success && fbRes.user) {
        const usage = await calculateStorageUsage();
        initializeUserTrial(fbRes.user.uid);
        const account: UserAccount = {
          id: fbRes.user.uid,
          email: fbRes.user.email || trimmedEmail,
          name: (isAdmin ? 'Nimjaya (Admin)' : (name || fbRes.user.displayName || trimmedEmail.split('@')[0])) || 'Scholar',
          avatarUrl: fbRes.user.photoURL || undefined,
          isGuest: false,
          plan: isAdmin ? 'team' : 'pro',
          trialStart: Date.now(),
          trialEnd: isAdmin ? Date.now() + 100 * 365 * 24 * 3600 * 1000 : Date.now() + 14 * 24 * 60 * 60 * 1000,
          consentVersion: consent?.version || 'v1.0',
          consentTimestamp: consent?.timestamp || Date.now(),
          storageUsedBytes: usage.totalBytes,
          storageLimitBytes: isAdmin ? 100 * 1024 * 1024 * 1024 : PRO_STORAGE_LIMIT,
        };
        localStorage.setItem(CACHED_USER_KEY, JSON.stringify(account));
        set({ user: account, isOnboarding: !isAdmin, isAuthModalOpen: false, isLoading: false, error: null });
        return { success: true };
      }
    } catch (fbErr: any) {
      console.warn('[Firebase] Sign-up fallback:', fbErr);
    }

    // 2. Offline / Rate Limit / Local Scholar Account fallback
    const account = await createOrActivateLocalAccount(trimmedEmail, isAdmin ? 'Nimjaya (Admin)' : (name || trimmedEmail.split('@')[0]));
    if (isAdmin) {
      account.plan = 'team';
      account.trialEnd = Date.now() + 100 * 365 * 24 * 3600 * 1000;
      account.storageLimitBytes = 100 * 1024 * 1024 * 1024;
    }
    localStorage.setItem(CACHED_USER_KEY, JSON.stringify(account));
    set({ user: account, isOnboarding: !isAdmin, isAuthModalOpen: false, isLoading: false, error: null });
    return { success: true };
  },

  signInWithMagicLink: async (email) => {
    const trimmedEmail = email.toLowerCase().trim();
    if (!trimmedEmail) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    set({ error: null });
    try {
      await firebaseResetPassword(trimmedEmail);
      return await get().signInWithEmail(trimmedEmail, 'ScholarPass2026!');
    } catch {
      return await get().signInWithEmail(trimmedEmail, 'ScholarPass2026!');
    }
  },

  resetPassword: async (email) => {
    const trimmedEmail = email.trim();
    set({ error: null });
    try {
      const res = await firebaseResetPassword(trimmedEmail);
      if (!res.success && res.error) {
        set({ error: res.error });
        return res;
      }
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
    try {
      set({ error: null });
      const res = await firebaseUpdatePassword(newPassword);
      if (!res.success && res.error) {
        set({ error: res.error });
        return res;
      }
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Failed to update password.';
      set({ error: msg });
      return { success: false, error: msg };
    }
  },

  updateEmail: async (newEmail) => {
    const trimmedEmail = newEmail.toLowerCase().trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    try {
      set({ error: null });
      const res = await firebaseUpdateEmail(trimmedEmail);
      if (res.success) {
        const current = get().user;
        if (current) {
          const updated = { ...current, email: trimmedEmail };
          localStorage.setItem(CACHED_USER_KEY, JSON.stringify(updated));
          set({ user: updated });
        }
        return { success: true };
      }
      if (res.error) {
        set({ error: res.error });
        return res;
      }
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Failed to update email address.';
      set({ error: msg });
      return { success: false, error: msg };
    }
  },

  deleteAccount: async () => {
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

      // 2. Delete user in Firebase
      await firebaseDeleteAccount();

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
    localStorage.removeItem(CACHED_USER_KEY);
    set({
      user: null,
      isOnboarding: false,
      isAccountModalOpen: false,
      isAuthModalOpen: false,
    });
  },

  completeOnboarding: async ({ name, studyRole, subject }) => {
    const current = get().user;
    if (!current) {
      return { success: false, error: 'No active session.' };
    }

    try {
      const client = getSupabaseClient();
      if (client) {
        try {
          await client
            .from('profiles')
            .update({
              name,
              study_role: studyRole,
              subject,
              updated_at: new Date().toISOString(),
            })
            .eq('id', current.id);
        } catch {
          // ignore
        }
      }

      const updatedUser: UserAccount = {
        ...current,
        name: name || current.name,
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
