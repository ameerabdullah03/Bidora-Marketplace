-- Minimal, authenticated intake for access, correction, and deletion requests.
-- This migration is source-only until an owner applies it to the live project.
BEGIN;

CREATE TABLE IF NOT EXISTS public.privacy_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('deletion', 'access', 'correction')),
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'in_review', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  CHECK ((status = 'completed') = (completed_at IS NOT NULL))
);

CREATE UNIQUE INDEX IF NOT EXISTS privacy_requests_one_open_per_user
  ON public.privacy_requests(user_id) WHERE status IN ('received', 'in_review');

ALTER TABLE public.privacy_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.privacy_requests FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.privacy_requests TO authenticated;
GRANT INSERT (user_id, request_type) ON TABLE public.privacy_requests TO authenticated;
GRANT UPDATE (status, completed_at) ON TABLE public.privacy_requests TO authenticated;

DROP POLICY IF EXISTS privacy_requests_view_own_or_admin ON public.privacy_requests;
CREATE POLICY privacy_requests_view_own_or_admin
  ON public.privacy_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS privacy_requests_insert_own ON public.privacy_requests;
CREATE POLICY privacy_requests_insert_own
  ON public.privacy_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'received' AND completed_at IS NULL);

DROP POLICY IF EXISTS privacy_requests_update_admin ON public.privacy_requests;
CREATE POLICY privacy_requests_update_admin
  ON public.privacy_requests FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid()));

COMMIT;
