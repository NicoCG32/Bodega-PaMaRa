CREATE TABLE public.ficha_stats (
  codigo text PRIMARY KEY,
  vistas integer NOT NULL DEFAULT 0,
  compartidos integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ficha_stats TO anon, authenticated;
GRANT ALL ON public.ficha_stats TO service_role;
ALTER TABLE public.ficha_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Estadisticas visibles" ON public.ficha_stats FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.registrar_ficha(_codigo text, _tipo text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _codigo !~ '^[A-Z]-[0-9A-Za-z]{1,12}$' OR _tipo NOT IN ('vista','compartir') THEN RETURN; END IF;
  INSERT INTO public.ficha_stats(codigo, vistas, compartidos)
  VALUES (_codigo, CASE WHEN _tipo='vista' THEN 1 ELSE 0 END, CASE WHEN _tipo='compartir' THEN 1 ELSE 0 END)
  ON CONFLICT (codigo) DO UPDATE SET
    vistas = ficha_stats.vistas + EXCLUDED.vistas,
    compartidos = ficha_stats.compartidos + EXCLUDED.compartidos,
    updated_at = now();
END $$;
REVOKE ALL ON FUNCTION public.registrar_ficha(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.registrar_ficha(text, text) TO anon, authenticated;