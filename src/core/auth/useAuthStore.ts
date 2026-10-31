import { create } from 'zustand';
import type { UserAccount } from '@/types/note';
import { getSupabaseClient } from '../supabase/client';
import { db, calculateStorageUsage } from '../db';
import { getDeviceId } from '@/utils/sync';

interface AuthState {
  user: UserAccount | null;
  isLoading: boolean;
  error: string | null;
  isAuthModalOpen: boolean;

  // Actions
  initialize: () => Promise<void>;
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
    name?: string
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  refreshStorageUsage: () => Promise<void>;
  upgradeGuestData: (newUserId: string) => Promise<void>;
}

const DEFAULT_GUEST_LIMIT = 100 * 1024 * 1024; // 100 MB free tier
const PRO_STORAGE_LIMIT = 10 * 1024 * 1024 * 1024; // 10 GB pro tier

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,
  isAuthModalOpen: false,

  openAuthModal: () => set({ isAuthModalOpen: true, error: null }),
  closeAuthModal: () => set({ isAuthModalOpen: false, error: null }),

  initialize: async () => {
    set({ isLoading: true });
    const storageUsage = await calculateStorageUsage();

    const client = getSupabaseClient();
    if (client) {
      try {
        const {
          data: { session },
        } = await client.auth.getSession();
        if (session?.user) {
          set({
            user: {
              id: session.user.id,
              email: session.user.email,
              name:
                session.user.user_metadata?.full_name ||
                session.user.email?.split('@')[0] ||
                'User',
              avatarUrl: session.user.user_metadata?.avatar_url,
              isGuest: false,
              plan: 'pro',
              storageUsedBytes: storageUsage.totalBytes,
              storageLimitBytes: PRO_STORAGE_LIMIT,
            },
            isLoading: false,
          });

          client.auth.onAuthStateChange(async (event, newSession) => {
            if (newSession?.user) {
              const current = get().user;
              if (current?.isGuest) {
                await get().upgradeGuestData(newSession.user.id);
              }
              const refreshedUsage = await calculateStorageUsage();
              set({
                user: {
                  id: newSession.user.id,
                  email: newSession.user.email,
                  name:
                    newSession.user.user_metadata?.full_name ||
                    newSession.user.email?.split('@')[0],
                  avatarUrl: newSession.user.user_metadata?.avatar_url,
                  isGuest: false,
                  plan: 'pro',
                  storageUsedBytes: refreshedUsage.totalBytes,
                  storageLimitBytes: PRO_STORAGE_LIMIT,
                },
              });
            } else if (event === 'SIGNED_OUT') {
              const defaultGuest: UserAccount = {
                id: 'guest_' + getDeviceId(),
                name: 'Guest Student',
                isGuest: true,
                plan: 'free',
                storageUsedBytes: storageUsage.totalBytes,
                storageLimitBytes: DEFAULT_GUEST_LIMIT,
              };
              set({ user: defaultGuest });
            }
          });
          return;
        }
      } catch (err) {
        console.warn('Supabase auth session fetch error:', err);
      }
    }

    const guestUser: UserAccount = {
      id: 'guest_' + getDeviceId(),
      name: 'Guest Student',
      isGuest: true,
      plan: 'free',
      storageUsedBytes: storageUsage.totalBytes,
      storageLimitBytes: DEFAULT_GUEST_LIMIT,
    };

    set({ user: guestUser, isLoading: false });
  },

  refreshStorageUsage: async () => {
    const usage = await calculateStorageUsage();
    set((state) => {
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          storageUsedBytes: usage.totalBytes,
        },
      };
    });
  },

  upgradeGuestData: async (newUserId: string) => {
    try {
      console.log(`[Auth] Upgrading guest local data to account ${newUserId}...`);
      const notes = await db.notes.toArray();
      const notebooks = await db.notebooks.toArray();
      const workspaces = await db.workspaces.toArray();

      for (const ws of workspaces) {
        await db.syncQueue.put({
          id: 'sync_ws_' + ws.id + '_' + Date.now(),
          action: 'create',
          entityType: 'workspace',
          entityId: ws.id,
          payload: ws,
          timestamp: Date.now(),
          retryCount: 0,
          status: 'pending',
        });
      }

      for (const nb of notebooks) {
        await db.syncQueue.put({
          id: 'sync_nb_' + nb.id + '_' + Date.now(),
          action: 'create',
          entityType: 'notebook',
          entityId: nb.id,
          payload: nb,
          timestamp: Date.now(),
          retryCount: 0,
          status: 'pending',
        });
      }

      for (const note of notes) {
        await db.syncQueue.put({
          id: 'sync_note_' + note.id + '_' + Date.now(),
          action: 'create',
          entityType: 'note',
          entityId: note.id,
          payload: note,
          timestamp: Date.now(),
          retryCount: 0,
          status: 'pending',
        });
      }
    } catch (err) {
      console.error('[Auth] Failed to enqueue guest data upgrade:', err);
    }
  },

  signInWithEmail: async (email, password) => {
    const client = getSupabaseClient();
    if (!client) {
      return {
        success: false,
        error: 'Supabase is not configured yet. Configure cloud credentials first.',
      };
    }

    try {
      set({ error: null });
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        await get().upgradeGuestData(data.user.id);
        const usage = await calculateStorageUsage();
        set({
          user: {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
            isGuest: false,
            plan: 'pro',
            storageUsedBytes: usage.totalBytes,
            storageLimitBytes: PRO_STORAGE_LIMIT,
          },
          isAuthModalOpen: false,
        });
      }
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Failed to sign in.';
      set({ error: msg });
      return { success: false, error: msg };
    }
  },

  signUpWithEmail: async (email, password, name) => {
    const client = getSupabaseClient();
    if (!client) {
      return {
        success: false,
        error: 'Supabase is not configured yet. Configure cloud credentials first.',
      };
    }

    try {
      set({ error: null });
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name || email.split('@')[0] },
        },
      });
      if (error) throw error;

      if (data.user) {
        await get().upgradeGuestData(data.user.id);
      }
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Failed to sign up.';
      set({ error: msg });
      return { success: false, error: msg };
    }
  },

  signInWithMagicLink: async (email) => {
    const client = getSupabaseClient();
    if (!client) {
      return {
        success: false,
        error: 'Supabase is not configured yet. Configure cloud credentials first.',
      };
    }

    try {
      set({ error: null });
      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Failed to send magic link.';
      set({ error: msg });
      return { success: false, error: msg };
    }
  },

  signInWithGoogle: async () => {
    const client = getSupabaseClient();
    if (!client) {
      return {
        success: false,
        error: 'Supabase is not configured yet. Configure cloud credentials first.',
      };
    }

    try {
      set({ error: null });
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Google sign-in failed.';
      set({ error: msg });
      return { success: false, error: msg };
    }
  },

  signOut: async () => {
    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut();
    }
    const usage = await calculateStorageUsage();
    set({
      user: {
        id: 'guest_' + getDeviceId(),
        name: 'Guest Student',
        isGuest: true,
        plan: 'free',
        storageUsedBytes: usage.totalBytes,
        storageLimitBytes: DEFAULT_GUEST_LIMIT,
      },
      isAuthModalOpen: false,
    });
  },
}));
