-- ============================================================================
-- ScribbleNote Supabase Schema & Row-Level Security (RLS) Policies
-- Commercial-grade multi-tenant notebook, multi-page canvas, & binary storage
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

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

create policy "Users can read own workspaces"
  on public.workspaces for select
  using (auth.uid() = user_id);

create policy "Users can insert own workspaces"
  on public.workspaces for insert
  with check (auth.uid() = user_id);

create policy "Users can update own workspaces"
  on public.workspaces for update
  using (auth.uid() = user_id);

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

create policy "Users can manage own version history"
  on public.version_history for all
  using (auth.uid() = user_id);

-- 7. Setup Storage Bucket for Blobs
insert into storage.buckets (id, name, public)
values ('scribblenote-media', 'scribblenote-media', true)
on conflict (id) do nothing;

create policy "Users can upload own media objects"
  on storage.objects for insert
  with check (bucket_id = 'scribblenote-media' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view own media objects"
  on storage.objects for select
  using (bucket_id = 'scribblenote-media' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own media objects"
  on storage.objects for delete
  using (bucket_id = 'scribblenote-media' and auth.uid()::text = (storage.foldername(name))[1]);

-- Enable Realtime for Notes and Strokes
alter publication supabase_realtime add table public.notes;
alter publication supabase_realtime add table public.canvas_strokes;
