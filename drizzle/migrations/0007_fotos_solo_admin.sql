DROP POLICY IF EXISTS "Fotos vitrina visibles" ON storage.objects;
CREATE POLICY "Admin ve fotos" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'fotos-productos' AND public.has_role(auth.uid(), 'admin'::public.app_role));