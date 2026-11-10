DO $$
DECLARE
  definition text := pg_get_functiondef('public.primera_admin()'::regprocedure);
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_access_emails WHERE email = 'pguzmanns.04@gmail.com') THEN
    RAISE EXCEPTION 'Requested tester email is not approved';
  END IF;
  IF EXISTS (SELECT 1 FROM public.admin_access_emails WHERE email = 'unapproved-admin-test@example.invalid') THEN
    RAISE EXCEPTION 'Unapproved test account must not be allowlisted';
  END IF;
  IF definition NOT LIKE '%NEW.email_confirmed_at IS NOT NULL%'
     OR definition NOT LIKE '%provider%google%'
     OR definition NOT LIKE '%public.admin_access_emails%' THEN
    RAISE EXCEPTION 'Automatic admin must require verified Google and the allowlist';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.role_table_grants
    WHERE table_schema='public' AND table_name='admin_access_emails'
    AND grantee IN ('anon','authenticated') AND privilege_type IN ('INSERT','UPDATE','DELETE')) THEN
    RAISE EXCEPTION 'Visitors must not be able to authorize themselves';
  END IF;
END;
$$;
SELECT 'Admin access configuration tests passed' AS result;