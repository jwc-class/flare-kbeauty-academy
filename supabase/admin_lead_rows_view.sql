-- Admin Leads 페이지: 제출 + 레거시 통합 뷰 + contact_ids_for_email
-- (Supabase SQL Editor에서 실행하거나 MCP migration과 동기화)

CREATE OR REPLACE VIEW public.admin_lead_rows AS
SELECT
  ls.submitted_at AS sort_at,
  ls.id::text AS list_id,
  'submission'::text AS origin,
  c.first_name,
  c.last_name,
  c.email,
  c.phone_country_code,
  c.phone_number,
  c.marketing_consent,
  c.source,
  c.created_at AS contact_row_created_at
FROM public.lead_submissions ls
INNER JOIN public.contacts c ON c.id = ls.contact_id
UNION ALL
SELECT
  l.created_at AS sort_at,
  ('legacy-' || l.id::text) AS list_id,
  'legacy'::text AS origin,
  l.first_name,
  NULL::text AS last_name,
  l.email,
  l.country_code AS phone_country_code,
  l.phone_number,
  l.marketing_consent,
  l.source,
  NULL::timestamptz AS contact_row_created_at
FROM public.leads l;

GRANT SELECT ON public.admin_lead_rows TO service_role;

CREATE OR REPLACE FUNCTION public.contact_ids_for_email(p_email text)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id
  FROM public.contacts c
  WHERE lower(trim(c.email)) = lower(trim(p_email));
$$;

REVOKE ALL ON FUNCTION public.contact_ids_for_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.contact_ids_for_email(text) TO service_role;
