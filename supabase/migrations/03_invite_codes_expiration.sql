-- Create or update invite_codes table
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists(id) on delete cascade,
  code text not null,
  role text not null check (role in ('writer','admin')),
  created_at timestamptz default now(),
  expires_at timestamptz not null
);

-- Enable Row Level Security
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- RLS policies for invite_codes
CREATE POLICY "Allow read for list members" ON public.invite_codes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.lists WHERE id = list_id AND owner_uuid = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.list_users WHERE list_id = invite_codes.list_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Allow insert by list owner or admins" ON public.invite_codes FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.lists WHERE id = list_id AND owner_uuid = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.list_users WHERE list_id = invite_codes.list_id AND user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Allow delete by list owner or admins" ON public.invite_codes FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.lists WHERE id = list_id AND owner_uuid = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.list_users WHERE list_id = invite_codes.list_id AND user_id = auth.uid() AND role = 'admin'
  )
);

-- Create function to delete expired invite codes
CREATE OR REPLACE FUNCTION delete_expired_invite_codes()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete any invite codes that have expired
  DELETE FROM public.invite_codes WHERE expires_at < NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run cleanup function periodically
DROP TRIGGER IF EXISTS trigger_delete_expired_invite_codes ON public.invite_codes;
CREATE TRIGGER trigger_delete_expired_invite_codes
  AFTER INSERT ON public.invite_codes
  EXECUTE FUNCTION delete_expired_invite_codes();

-- Also add a cron job to periodically clean up expired codes
-- This requires the pg_cron extension which must be enabled by a superuser
-- Uncomment these lines if pg_cron is available:
-- 
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('0 0 * * *', $$
--   DELETE FROM public.invite_codes WHERE expires_at < NOW();
-- $$); 