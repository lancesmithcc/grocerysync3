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

-- Create invite_codes table
DROP TABLE IF EXISTS public.invite_codes CASCADE;
CREATE TABLE public.invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('writer', 'admin')),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Enable Row Level Security
alter table public.lists enable row level security;
-- alter table public.list_users enable row level security;
alter table public.items enable row level security;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

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
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM list_users
    WHERE list_id = list_id_check
      AND user_id = auth.uid()
      AND (
        (min_role = 'writer' AND role IN ('writer', 'admin')) OR
        (min_role = 'admin' AND role = 'admin')
      )
  );
END;
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

-- RLS policies for invite_codes
DROP POLICY IF EXISTS "Allow read for list members" ON public.invite_codes;
CREATE POLICY "Allow any authenticated user to read invite codes" ON public.invite_codes
  FOR SELECT
  USING ( auth.role() = 'authenticated' );

CREATE POLICY "Allow insert by list owner or admins" ON public.invite_codes FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.list_users WHERE list_id = invite_codes.list_id AND user_id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Allow delete by list owner or admins" ON public.invite_codes FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.list_users WHERE list_id = invite_codes.list_id AND user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS policies for list_users

-- Drop old policies to be safe
DROP POLICY IF EXISTS "Allow read for list members" ON public.list_users;
DROP POLICY IF EXISTS "Allow insert for list admins or list owner" ON public.list_users;
DROP POLICY IF EXISTS "Allow modification by list admins" ON public.list_users;

-- A user can see all members of a list if they are a member of that list.
CREATE POLICY "Allow read access to fellow list members" ON public.list_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM list_users lu
      WHERE lu.list_id = list_users.list_id AND lu.user_id = auth.uid()
    )
  );

-- The list owner or a list admin can add new users.
CREATE POLICY "Allow insert by owner or admin" ON public.list_users
  FOR INSERT WITH CHECK (
    ( -- User is the list owner
      SELECT owner_uuid FROM lists WHERE id = list_id
    ) = auth.uid()
    OR
    ( -- User is an admin of the list
      SELECT role FROM list_users WHERE list_id = list_users.list_id AND user_id = auth.uid()
    ) = 'admin'
  );

-- An admin can update or delete any user in the list.
CREATE POLICY "Admins can manage list members" ON public.list_users
  FOR ALL -- For UPDATE, DELETE
  USING (
    (SELECT role FROM list_users WHERE list_id = list_users.list_id AND user_id = auth.uid()) = 'admin'
  );

-- A user can leave a list (delete their own membership).
CREATE POLICY "Users can leave lists" ON public.list_users
  FOR DELETE
  USING ( user_id = auth.uid() ); 