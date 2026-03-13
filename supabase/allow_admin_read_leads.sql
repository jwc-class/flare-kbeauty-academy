-- leads 테이블 RLS 정책 (리드 수집 INSERT + 어드민 조회 SELECT)
-- Supabase 대시보드 → SQL Editor에서 이 파일 내용을 붙여넣고 실행하세요.

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 리드 캡처 폼 제출 시 INSERT 허용
DROP POLICY IF EXISTS "Allow anon to insert leads" ON public.leads;
CREATE POLICY "Allow anon to insert leads"
ON public.leads
FOR INSERT
TO anon
WITH CHECK (true);

-- 어드민 API가 anon 키로 leads 조회할 수 있도록 SELECT 허용
DROP POLICY IF EXISTS "Allow anon to read leads for admin API" ON public.leads;
CREATE POLICY "Allow anon to read leads for admin API"
ON public.leads
FOR SELECT
TO anon
USING (true);
