import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const LOCAL_STORAGE_KEY = 'scribblenote_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

let cachedClient: SupabaseClient | null = null;
let cachedConfig: SupabaseConfig | null = null;

export function getStoredSupabaseConfig(): SupabaseConfig | null {
  try {
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (envUrl && envKey && !envUrl.includes('your-project')) {
      return { url: envUrl, anonKey: envKey };
    }

    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read Supabase configuration from storage:', err);
  }
  return null;
}

export function saveSupabaseConfig(config: SupabaseConfig | null) {
  if (config) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
  cachedClient = null;
  cachedConfig = null;
}

export function isSupabaseConfigured(): boolean {
  return getStoredSupabaseConfig() !== null;
}

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config) return null;

  if (
    cachedClient &&
    cachedConfig?.url === config.url &&
    cachedConfig?.anonKey === config.anonKey
  ) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    cachedConfig = config;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}
