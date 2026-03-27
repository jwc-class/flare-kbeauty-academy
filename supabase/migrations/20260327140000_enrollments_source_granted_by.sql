-- Audit fields for manual vs purchase enrollments
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'purchase';

ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS granted_by_profile_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL;

COMMENT ON COLUMN public.enrollments.source IS 'purchase | manual | imported';