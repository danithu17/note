-- ==============================================================================
-- ScribbleNote Phase 5: Commercial Subscriptions, Entitlements & Admin Schema
-- ==============================================================================

-- 1. Plans Table
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  price_lkr NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('free', 'month', 'year')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Default Plans
INSERT INTO public.plans (id, name, price_usd, price_lkr, billing_interval, description)
VALUES
  ('free', 'Starter Free', 0.00, 0.00, 'free', 'Essential local lecture notes and drawing canvas'),
  ('pro_monthly', 'Pro Scholar (Monthly)', 4.99, 1500.00, 'month', 'Unlimited slide annotations, audio-synced recall, OCR, and AI assistant'),
  ('pro_yearly', 'Pro Scholar (Annual)', 39.99, 12000.00, 'year', 'Save 33% per year with full multi-device cloud synchronization'),
  ('team', 'Campus Lab & Team', 9.99, 3000.00, 'month', 'Collaborative academic workspaces, shared course repositories, and admin control')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_usd = EXCLUDED.price_usd,
  price_lkr = EXCLUDED.price_lkr;

-- 2. Features Table
CREATE TABLE IF NOT EXISTS public.features (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

INSERT INTO public.features (key, name, description)
VALUES
  ('unlimited_notes', 'Unlimited Notes', 'Create unrestricted number of lecture notes'),
  ('pdf_annotate', 'PDF Slide Annotate', 'Import slides as canvas backgrounds and annotate'),
  ('audio_sync', 'Audio Sync Playback', 'Timestamp strokes to audio recordings for instant seek'),
  ('ai_assistant', 'AI Study Assistant', 'Full access to lecture summarization, quiz generation and Q&A'),
  ('ocr_search', 'OCR & Handwriting Search', 'Search handwritten canvas strokes and slide PDFs'),
  ('cloud_sync', 'Multi-device Cloud Sync', 'Cross-device cloud replication via Supabase'),
  ('max_storage_mb', 'Storage Quota (MB)', 'Maximum allowable attachment and notes storage'),
  ('max_audio_minutes', 'Max Audio Minutes', 'Maximum recording duration per lecture note')
ON CONFLICT (key) DO NOTHING;

-- 3. Plan Features (Dynamic Entitlements Mapping)
CREATE TABLE IF NOT EXISTS public.plan_features (
  plan_id TEXT REFERENCES public.plans(id) ON DELETE CASCADE,
  feature_key TEXT REFERENCES public.features(key) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  numeric_limit INTEGER, -- null = unlimited
  PRIMARY KEY (plan_id, feature_key)
);

-- Seed Plan Features
INSERT INTO public.plan_features (plan_id, feature_key, enabled, numeric_limit)
VALUES
  -- Free Plan
  ('free', 'unlimited_notes', true, 25),
  ('free', 'pdf_annotate', false, NULL),
  ('free', 'audio_sync', false, NULL),
  ('free', 'ai_assistant', true, 5),
  ('free', 'ocr_search', false, NULL),
  ('free', 'cloud_sync', true, 1),
  ('free', 'max_storage_mb', true, 100),
  ('free', 'max_audio_minutes', true, 15),

  -- Pro Monthly
  ('pro_monthly', 'unlimited_notes', true, NULL),
  ('pro_monthly', 'pdf_annotate', true, NULL),
  ('pro_monthly', 'audio_sync', true, NULL),
  ('pro_monthly', 'ai_assistant', true, NULL),
  ('pro_monthly', 'ocr_search', true, NULL),
  ('pro_monthly', 'cloud_sync', true, NULL),
  ('pro_monthly', 'max_storage_mb', true, 10240),
  ('pro_monthly', 'max_audio_minutes', true, NULL),

  -- Pro Yearly
  ('pro_yearly', 'unlimited_notes', true, NULL),
  ('pro_yearly', 'pdf_annotate', true, NULL),
  ('pro_yearly', 'audio_sync', true, NULL),
  ('pro_yearly', 'ai_assistant', true, NULL),
  ('pro_yearly', 'ocr_search', true, NULL),
  ('pro_yearly', 'cloud_sync', true, NULL),
  ('pro_yearly', 'max_storage_mb', true, 10240),
  ('pro_yearly', 'max_audio_minutes', true, NULL),

  -- Team Plan
  ('team', 'unlimited_notes', true, NULL),
  ('team', 'pdf_annotate', true, NULL),
  ('team', 'audio_sync', true, NULL),
  ('team', 'ai_assistant', true, NULL),
  ('team', 'ocr_search', true, NULL),
  ('team', 'cloud_sync', true, NULL),
  ('team', 'max_storage_mb', true, 102400),
  ('team', 'max_audio_minutes', true, NULL)
ON CONFLICT (plan_id, feature_key) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  numeric_limit = EXCLUDED.numeric_limit;

-- 4. 14-Day Student Trials
CREATE TABLE IF NOT EXISTS public.trials (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  trial_start TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  trial_end TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  reminders_sent TEXT[] DEFAULT '{}'::TEXT[]
);

-- 5. Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT REFERENCES public.plans(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid')),
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'payhere', 'play_store', 'manual')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  coupon_applied TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Usage Counters (Rate limiting & AI quotas)
CREATE TABLE IF NOT EXISTS public.usage_counters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  period_start DATE DEFAULT CURRENT_DATE NOT NULL,
  UNIQUE(user_id, feature_key, period_start)
);

-- 7. Coupons & Promo Codes
CREATE TABLE IF NOT EXISTS public.coupons (
  code TEXT PRIMARY KEY,
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true
);

INSERT INTO public.coupons (code, discount_percent, max_uses, active)
VALUES
  ('STUDENT50', 50, 1000, true),
  ('ACADEMIC2026', 30, 500, true)
ON CONFLICT (code) DO NOTHING;

-- 8. Administrative Audit Log
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_user_id TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public can read plans, features, and active plan_features
CREATE POLICY "Public can view plans" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Public can view features" ON public.features FOR SELECT USING (true);
CREATE POLICY "Public can view plan_features" ON public.plan_features FOR SELECT USING (true);
CREATE POLICY "Public can view active coupons" ON public.coupons FOR SELECT USING (active = true);

-- Users can read their own trial, subscriptions, and usage
CREATE POLICY "Users can view own trial" ON public.trials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own usage counters" ON public.usage_counters FOR SELECT USING (auth.uid() = user_id);
