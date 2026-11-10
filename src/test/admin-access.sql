-- Run with: lovable supabase query "$(cat src/test/admin-access.sql)"
-- All test accounts are rolled back; no real Google session is fabricated.
BEGIN;
DO $$
DECLARE
  approved_id uuid := gen_random_uuid();
  rejected_id uuid := gen_random_uuid();
  password_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_access_emails WHERE email = 'pguzmanns.04@gmail.com') THEN
    RAISE EXCEPTION 'Requested tester email is not approved';
  END IF;
  INSERT INTO auth.users (id, email, email_confirmed_at, raw_app_meta_data)
  VALUES (approved_id, 'pguzmanns.04@gmail.com', now(), '{"provider":"google"}');
  IF NOT public.has_role(approved_id, 'admin') THEN
    RAISE EXCEPTION 'Verified approved Google tester must receive admin';
  END IF;
  INSERT INTO auth.users (id, email, email_confirmed_at, raw_app_meta_data)
  VALUES (rejected_id, 'unapproved-admin-test@example.invalid', now(), '{"provider":"google"}');
  IF public.has_role(rejected_id, 'admin') THEN
    RAISE EXCEPTION 'Unapproved Google account must not receive admin';
  END IF;
  INSERT INTO auth.users (id, email, email_confirmed_at, raw_app_meta_data)
  VALUES (password_id, 'pguzmanns.04@gmail.com', now(), '{"provider":"email"}');
  IF public.has_role(password_id, 'admin') THEN
    RAISE EXCEPTION 'Non-Google account must not receive automatic admin';
  END IF;
END;
$$;
ROLLBACK;
SELECT 'Admin access tests passed; test accounts rolled back' AS result;