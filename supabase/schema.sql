-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create lists table
drop table if exists public.lists cascade;
create table public.lists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_uuid uuid not null references auth.users(id)
);

-- Create list_users table
drop table if exists public.list_users cascade;
create table public.list_users (
  list_id uuid not null references public.lists(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('member','writer','admin')),
  primary key (list_id, user_id)
);

-- Create items table
drop table if exists public.items cascade;
create table public.items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists(id) on delete cascade,
  creator_id uuid not null references auth.users(id),
  title text not null,
  stars integer default 0,
  notes text,
  done boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.lists enable row level security;
alter table public.list_users enable row level security;
alter table public.items enable row level security;

-- RLS policies for lists
create policy "Allow read for members and owner" on public.lists for select using (
  auth.uid() = owner_uuid or auth.uid() in (
    select user_id from public.list_users where list_id = id
  )
);

create policy "Allow insert by owner" on public.lists for insert with check (
  auth.uid() = owner_uuid
);

create policy "Allow delete by owner" on public.lists for delete using (
  auth.uid() = owner_uuid
);

-- RLS policies for items
-- Helper function to check list membership and role
-- Drops the function if it exists to ensure it's updated
DROP FUNCTION IF EXISTS is_list_member(uuid, text);
CREATE OR REPLACE FUNCTION is_list_member(list_id_check uuid, min_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM list_users
    WHERE list_id = list_id_check
      AND user_id = auth.uid()
      AND (
        (min_role = 'writer' AND role IN ('writer', 'admin')) OR
        (min_role = 'admin' AND role = 'admin')
      )
  );
$$;

-- Drop existing policies before recreating
DROP POLICY IF EXISTS "Allow select for list members" ON public.items;
DROP POLICY IF EXISTS "Allow insert by writers" ON public.items;
DROP POLICY IF EXISTS "Allow update by writers" ON public.items; -- Drop potential old update policy
DROP POLICY IF EXISTS "Allow delete by admins" ON public.items;

-- RLS policies for items using the helper function
create policy "Allow select for list members" on public.items 
  for select 
  using ( is_list_member(list_id, 'writer') );

create policy "Allow insert by writers or admins" on public.items 
  for insert 
  with check ( is_list_member(list_id, 'writer') );

create policy "Allow update by writers or admins" on public.items
  for update
  using ( is_list_member(list_id, 'writer') )
  with check ( is_list_member(list_id, 'writer') );

create policy "Allow delete by admins" on public.items 
  for delete 
  using ( is_list_member(list_id, 'admin') ); 