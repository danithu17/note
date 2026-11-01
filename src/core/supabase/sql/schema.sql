-- ============================================================================
-- ScribbleNote Supabase Schema & Row-Level Security (RLS) Policies
-- Commercial-grade multi-tenant notebook, multi-page canvas, & binary storage
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 0. Profiles Table (Automatic creation via Trigger on auth.users)
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

-- 1. Workspaces Table
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

-- 2. Notebooks Table (Courses / Subjects)
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

-- 3. Notes Table
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

-- 4. Canvas Strokes Table (CRDT / Append-Only Stored Strokes)
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

-- 5. Attachments Table (Audio, Images, PDFs)
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

-- 6. Version History Table
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

-- 7. Setup Storage Bucket for Blobs
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

-- Enable Realtime for Notes and Strokes safely (idempotent)
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
