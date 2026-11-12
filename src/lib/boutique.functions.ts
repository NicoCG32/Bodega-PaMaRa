import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { aPublico, type ItemPublico } from "./boutique";
import type { Precios, Producto } from "./store";

/** Público: lee la vitrina compartida (solo productos marcados para la Boutique). */
export const catalogoPublico = createServerFn({ method: "GET" }).handler(
  async (): Promise<ItemPublico[]> => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const sb = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
            h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const [{ data, error }, { data: aj }] = await Promise.all([
      sb.from("productos").select("data").eq("en_boutique", true),
      sb.from("ajustes_tienda").select("precios").maybeSingle(),
    ]);
    if (error || !data) return [];
    const productos = data
      .map((f) => f.data as unknown as Producto)
      .filter((p) => p && typeof p.codigo === "string");
    const items = aPublico(productos, (aj?.precios as unknown as Precios) ?? undefined);
    const rutas = items.map((i) => i.foto).filter((r): r is string => !!r);
    if (rutas.length) {
      const { data: urls } = await sb.storage.from("fotos-productos").createSignedUrls(rutas, 60 * 60 * 24);
      const mapa = new Map((urls ?? []).map((u) => [u.path, u.signedUrl]));
      for (const i of items) i.foto = i.foto ? (mapa.get(i.foto) ?? null) : null;
    }
    return items;
  },
);
