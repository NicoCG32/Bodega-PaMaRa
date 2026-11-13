DROP POLICY IF EXISTS "Precios públicos" ON public.ajustes_tienda;
CREATE POLICY "Precios públicos" ON public.ajustes_tienda FOR SELECT TO anon, authenticated USING (id = 1);

DROP POLICY IF EXISTS "Fotos vitrina visibles" ON storage.objects;
CREATE POLICY "Fotos vitrina visibles" ON storage.objects FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'fotos-productos' AND (
    EXISTS (SELECT 1 FROM public.productos p WHERE p.en_boutique AND p.data->>'foto' = storage.objects.name)
    OR public.has_role(auth.uid(), 'admin')
  )
);