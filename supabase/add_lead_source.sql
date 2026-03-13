-- 유입 경로 구분용 컬럼 추가 (메인 vs glass-skin 등)
-- Supabase 대시보드 → SQL Editor에서 실행하세요.

ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS source text;

COMMENT ON COLUMN public.leads.source IS '유입 경로: main, glass-skin 등';
