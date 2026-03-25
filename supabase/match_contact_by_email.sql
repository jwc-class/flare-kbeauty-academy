-- Applied via Supabase migration: match_contact_by_email_function
-- Resolves contacts by lower(trim(email)) so duplicate lead submits reuse one row.

CREATE OR REPLACE FUNCTION public.match_contact_by_email(p_email text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id
  FROM public.contacts c
  WHERE lower(trim(c.email)) = lower(trim(p_email))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.match_contact_by_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.match_contact_by_email(text) TO service_role;
