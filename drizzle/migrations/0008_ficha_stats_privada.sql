DROP POLICY IF EXISTS "Estadisticas visibles" ON public.ficha_stats;
REVOKE SELECT ON public.ficha_stats FROM anon;
CREATE POLICY "Admin ve estadisticas" ON public.ficha_stats FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));