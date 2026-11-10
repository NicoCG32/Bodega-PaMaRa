CREATE TABLE public.admin_access_emails (
  email text PRIMARY KEY,
  CONSTRAINT admin_access_emails_normalized CHECK (email = lower(btrim(email)))
);
GRANT ALL ON public.admin_access_emails TO service_role;
ALTER TABLE public.admin_access_emails ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.admin_access_emails IS 'Approved Google admin emails; maintained through privileged tools only.';

CREATE OR REPLACE FUNCTION public.primera_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL
     AND NEW.raw_app_meta_data ->> 'provider' = 'google'
     AND EXISTS (SELECT 1 FROM public.admin_access_emails WHERE email = lower(btrim(NEW.email))) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_approved_admin_update
AFTER UPDATE OF email, email_confirmed_at, raw_app_meta_data ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.primera_admin();