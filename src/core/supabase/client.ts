import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const LOCAL_STORAGE_KEY = 'scribblenote_supabase_config';
const FALLBACK_SUPABASE_URL = 'https://psxggugvbiuiqkdpukcn.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzeGdndWd2Yml1aXFrZHB1a2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1MzA1MjksImV4cCI6MjEwOTEwNjUyOX0.vZd50qqkzaZibDb1DgbWHClBznmcCietYGNIYdxZMqw';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

let cachedClient: SupabaseClient | null = null;
let cachedConfig: SupabaseConfig | null = null;

export function getStoredSupabaseConfig(): SupabaseConfig | null {
  try {
    const envUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;
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

    if (FALLBACK_SUPABASE_URL && FALLBACK_SUPABASE_ANON_KEY) {
      return { url: FALLBACK_SUPABASE_URL, anonKey: FALLBACK_SUPABASE_ANON_KEY };
    }
  } catch (err) {
    console.warn('Failed to read Supabase configuration from storage:', err);
  }
  return { url: FALLBACK_SUPABASE_URL, anonKey: FALLBACK_SUPABASE_ANON_KEY };
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
