-- ============================================================================
-- ScribbleNote Supabase Complete Master Setup Script
-- 100% Idempotent (Safe to run multiple times without 42710 / collision errors)
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 0. Profiles Table (Automatic sync on signup)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  avatar_url text,
  locale text default 'en',
  plan text default 'pro',
  trial_start timestamp with time zone default now(),
  trial_end timestamp with time zone default (now() + interval '14 days'),
  study_role text,
  subject text,
  consent_version text default 'v1.0',
  consent_timestamp timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    email,
    name,
    avatar_url,
    plan,
    trial_start,
    trial_end,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    'pro',
    now(),
    now() + interval '14 days',
    now(),
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(excluded.name, public.profiles.name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 1. Workspaces Table
-- ----------------------------------------------------------------------------
create table if not exists public.workspaces (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  icon text,
  color text default '#3b82f6',
  created_at bigint not null,
  updated_at bigint not null
);

alter table public.workspaces enable row level security;

drop policy if exists "Users can read own workspaces" on public.workspaces;
create policy "Users can read own workspaces"
  on public.workspaces for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own workspaces" on public.workspaces;
create policy "Users can insert own workspaces"
  on public.workspaces for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own workspaces" on public.workspaces;
create policy "Users can update own workspaces"
  on public.workspaces for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own workspaces" on public.workspaces;
create policy "Users can delete own workspaces"
  on public.workspaces for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 2. Notebooks Table
-- ----------------------------------------------------------------------------
create table if not exists public.notebooks (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  workspace_id text references public.workspaces(id) on delete cascade not null,
  title text not null,
  color text default '#3b82f6',
  icon text default 'book',
  description text,
  created_at bigint not null,
  updated_at bigint not null
);

alter table public.notebooks enable row level security;

drop policy if exists "Users can manage own notebooks" on public.notebooks;
create policy "Users can manage own notebooks"
  on public.notebooks for all
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 3. Notes Table
-- ----------------------------------------------------------------------------
create table if not exists public.notes (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  workspace_id text references public.workspaces(id) on delete cascade,
  notebook_id text references public.notebooks(id) on delete cascade,
  title text not null,
  subject text default 'General',
  tags text[] default '{}',
  markdown text default '',
  grid_type text default 'dots',
  active_page_index integer default 0,
  pages jsonb default '[]'::jsonb,
  canvas_elements jsonb default '[]'::jsonb,
  is_pinned boolean default false,
  deleted_at bigint,
  version integer default 1,
  created_at bigint not null,
  updated_at bigint not null
);

alter table public.notes enable row level security;

drop policy if exists "Users can manage own notes" on public.notes;
create policy "Users can manage own notes"
  on public.notes for all
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 4. Canvas Strokes Table
-- ----------------------------------------------------------------------------
create table if not exists public.canvas_strokes (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  note_id text references public.notes(id) on delete cascade not null,
  page_index integer default 0,
  stroke_data jsonb not null,
  created_at bigint not null
);

alter table public.canvas_strokes enable row level security;

drop policy if exists "Users can manage own canvas strokes" on public.canvas_strokes;
create policy "Users can manage own canvas strokes"
  on public.canvas_strokes for all
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 5. Attachments Table
-- ----------------------------------------------------------------------------
create table if not exists public.attachments (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  note_id text references public.notes(id) on delete cascade not null,
  type text not null check (type in ('audio', 'image', 'pdf')),
  mime_type text not null,
  name text not null,
  size bigint not null default 0,
  storage_url text,
  duration numeric,
  created_at bigint not null
);

alter table public.attachments enable row level security;

drop policy if exists "Users can manage own attachments" on public.attachments;
create policy "Users can manage own attachments"
  on public.attachments for all
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 6. Version History Table
-- ----------------------------------------------------------------------------
create table if not exists public.version_history (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  note_id text references public.notes(id) on delete cascade not null,
  title text not null,
  markdown text not null,
  canvas_elements jsonb not null,
  pages jsonb,
  summary text,
  created_at bigint not null
);

alter table public.version_history enable row level security;

drop policy if exists "Users can manage own version history" on public.version_history;
create policy "Users can manage own version history"
  on public.version_history for all
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 7. Commercial Plans & Subscriptions
-- ----------------------------------------------------------------------------
create table if not exists public.plans (
  id text primary key,
  name text not null,
  price_usd numeric(10, 2) not null default 0.00,
  price_lkr numeric(10, 2) not null default 0.00,
  billing_interval text not null check (billing_interval in ('free', 'month', 'year')),
  description text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

insert into public.plans (id, name, price_usd, price_lkr, billing_interval, description)
values
  ('free', 'Starter Free', 0.00, 0.00, 'free', 'Essential local lecture notes and drawing canvas'),
  ('pro_monthly', 'Pro Scholar (Monthly)', 4.99, 1500.00, 'month', 'Unlimited slide annotations, audio-synced recall, OCR, and AI assistant'),
  ('pro_yearly', 'Pro Scholar (Annual)', 39.99, 12000.00, 'year', 'Save 33% per year with full multi-device cloud synchronization'),
  ('team', 'Campus Lab & Team', 9.99, 3000.00, 'month', 'Collaborative academic workspaces, shared course repositories, and admin control')
on conflict (id) do update set
  name = excluded.name,
  price_usd = excluded.price_usd,
  price_lkr = excluded.price_lkr;

create table if not exists public.features (
  key text primary key,
  name text not null,
  description text
);

insert into public.features (key, name, description)
values
  ('unlimited_notes', 'Unlimited Notes', 'Create unrestricted number of lecture notes'),
  ('pdf_annotate', 'PDF Slide Annotate', 'Import slides as canvas backgrounds and annotate'),
  ('audio_sync', 'Audio Sync Playback', 'Timestamp strokes to audio recordings for instant seek'),
  ('ai_assistant', 'AI Study Assistant', 'Full access to lecture summarization, quiz generation and Q&A'),
  ('ocr_search', 'OCR & Handwriting Search', 'Search handwritten canvas strokes and slide PDFs'),
  ('cloud_sync', 'Multi-device Cloud Sync', 'Cross-device cloud replication via Supabase'),
  ('max_storage_mb', 'Storage Quota (MB)', 'Maximum allowable attachment and notes storage'),
  ('max_audio_minutes', 'Max Audio Minutes', 'Maximum recording duration per lecture note')
on conflict (key) do nothing;

create table if not exists public.plan_features (
  plan_id text references public.plans(id) on delete cascade,
  feature_key text references public.features(key) on delete cascade,
  enabled boolean not null default true,
  numeric_limit integer,
  primary key (plan_id, feature_key)
);

insert into public.plan_features (plan_id, feature_key, enabled, numeric_limit)
values
  ('free', 'unlimited_notes', true, 25),
  ('free', 'pdf_annotate', false, null),
  ('free', 'audio_sync', false, null),
  ('free', 'ai_assistant', true, 5),
  ('free', 'ocr_search', false, null),
  ('free', 'cloud_sync', true, 1),
  ('free', 'max_storage_mb', true, 100),
  ('free', 'max_audio_minutes', true, 15),

  ('pro_monthly', 'unlimited_notes', true, null),
  ('pro_monthly', 'pdf_annotate', true, null),
  ('pro_monthly', 'audio_sync', true, null),
  ('pro_monthly', 'ai_assistant', true, null),
  ('pro_monthly', 'ocr_search', true, null),
  ('pro_monthly', 'cloud_sync', true, null),
  ('pro_monthly', 'max_storage_mb', true, 10240),
  ('pro_monthly', 'max_audio_minutes', true, null),

  ('pro_yearly', 'unlimited_notes', true, null),
  ('pro_yearly', 'pdf_annotate', true, null),
  ('pro_yearly', 'audio_sync', true, null),
  ('pro_yearly', 'ai_assistant', true, null),
  ('pro_yearly', 'ocr_search', true, null),
  ('pro_yearly', 'cloud_sync', true, null),
  ('pro_yearly', 'max_storage_mb', true, 10240),
  ('pro_yearly', 'max_audio_minutes', true, null),

  ('team', 'unlimited_notes', true, null),
  ('team', 'pdf_annotate', true, null),
  ('team', 'audio_sync', true, null),
  ('team', 'ai_assistant', true, null),
  ('team', 'ocr_search', true, null),
  ('team', 'cloud_sync', true, null),
  ('team', 'max_storage_mb', true, 102400),
  ('team', 'max_audio_minutes', true, null)
on conflict (plan_id, feature_key) do update set
  enabled = excluded.enabled,
  numeric_limit = excluded.numeric_limit;

create table if not exists public.trials (
  user_id uuid primary key references auth.users(id) on delete cascade,
  trial_start timestamptz default timezone('utc'::text, now()) not null,
  trial_end timestamptz not null,
  is_active boolean not null default true,
  reminders_sent text[] default '{}'::text[]
);

create table if not exists public.subscriptions (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  plan_id text references public.plans(id),
  status text not null check (status in ('active', 'trialing', 'past_due', 'canceled', 'unpaid')),
  provider text not null check (provider in ('stripe', 'payhere', 'play_store', 'manual')),
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  cancel_at_period_end boolean default false,
  coupon_applied text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.usage_counters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  feature_key text not null,
  usage_count integer not null default 0,
  period_start date default current_date not null,
  unique(user_id, feature_key, period_start)
);

create table if not exists public.coupons (
  code text primary key,
  discount_percent integer not null check (discount_percent > 0 and discount_percent <= 100),
  expires_at timestamptz,
  max_uses integer,
  used_count integer default 0,
  active boolean default true
);

insert into public.coupons (code, discount_percent, max_uses, active)
values
  ('STUDENT50', 50, 1000, true),
  ('ACADEMIC2026', 30, 500, true)
on conflict (code) do nothing;

create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  admin_id text not null,
  action text not null,
  target_user_id text,
  details text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.plans enable row level security;
alter table public.features enable row level security;
alter table public.plan_features enable row level security;
alter table public.trials enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_counters enable row level security;
alter table public.coupons enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "Public can view plans" on public.plans;
create policy "Public can view plans" on public.plans for select using (true);

drop policy if exists "Public can view features" on public.features;
create policy "Public can view features" on public.features for select using (true);

drop policy if exists "Public can view plan_features" on public.plan_features;
create policy "Public can view plan_features" on public.plan_features for select using (true);

drop policy if exists "Public can view active coupons" on public.coupons;
create policy "Public can view active coupons" on public.coupons for select using (active = true);

drop policy if exists "Users can view own trial" on public.trials;
create policy "Users can view own trial" on public.trials for select using (auth.uid() = user_id);

drop policy if exists "Users can view own subscriptions" on public.subscriptions;
create policy "Users can view own subscriptions" on public.subscriptions for select using (auth.uid() = user_id);

drop policy if exists "Users can view own usage counters" on public.usage_counters;
create policy "Users can view own usage counters" on public.usage_counters for select using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 8. Storage Bucket for Media
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('scribblenote-media', 'scribblenote-media', true)
on conflict (id) do nothing;

drop policy if exists "Users can upload own media objects" on storage.objects;
create policy "Users can upload own media objects"
  on storage.objects for insert
  with check (bucket_id = 'scribblenote-media' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can view own media objects" on storage.objects;
create policy "Users can view own media objects"
  on storage.objects for select
  using (bucket_id = 'scribblenote-media' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can delete own media objects" on storage.objects;
create policy "Users can delete own media objects"
  on storage.objects for delete
  using (bucket_id = 'scribblenote-media' and auth.uid()::text = (storage.foldername(name))[1]);

-- ----------------------------------------------------------------------------
-- 9. Realtime Publication Setup (Safe & Idempotent)
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notes'
  ) then
    alter publication supabase_realtime add table public.notes;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'canvas_strokes'
  ) then
    alter publication supabase_realtime add table public.canvas_strokes;
  end if;
end $$;
