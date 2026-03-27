-- Run in Supabase: SQL Editor -> New query -> Paste -> Run.
-- Fixes: Could not find the table public.enrollments in the schema cache

ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_purchases_profile_id ON public.purchases (profile_id);

CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses (id) ON DELETE RESTRICT,
  purchase_id uuid REFERENCES public.purchases (id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'refunded', 'revoked')),
  source text NOT NULL DEFAULT 'purchase',
  granted_by_profile_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT enrollments_profile_course_unique UNIQUE (profile_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_profile_id ON public.enrollments (profile_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments (course_id);

ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'purchase';
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS granted_by_profile_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL;

COMMENT ON COLUMN public.enrollments.source IS 'purchase | manual | imported';

CREATE TABLE IF NOT EXISTS public.course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  title text NOT NULL,
  description text,
  video_provider text,
  video_ref text,
  is_free_preview boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_lessons_course_sort ON public.course_lessons (course_id, sort_order);

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.course_lessons (id) ON DELETE CASCADE,
  completed_at timestamptz,
  last_position_sec int,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, lesson_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own enrollments" ON public.enrollments;
CREATE POLICY "Users read own enrollments" ON public.enrollments FOR SELECT TO authenticated USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Lessons visible for preview or enrolled" ON public.course_lessons;
CREATE POLICY "Lessons visible for preview or enrolled" ON public.course_lessons FOR SELECT USING (
  is_free_preview = true
  OR EXISTS (
    SELECT 1
    FROM public.enrollments e
    JOIN public.profiles p ON p.id = e.profile_id
    WHERE e.course_id = course_lessons.course_id
      AND e.status = 'active'
      AND p.auth_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users manage own lesson progress" ON public.lesson_progress;
CREATE POLICY "Users manage own lesson progress" ON public.lesson_progress FOR ALL TO authenticated USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
  )
)
WITH CHECK (
  profile_id IN (
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
  )
);

GRANT SELECT ON public.enrollments TO authenticated;
GRANT SELECT ON public.course_lessons TO anon, authenticated;
GRANT ALL ON public.lesson_progress TO authenticated;

NOTIFY pgrst, 'reload schema';