import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { aPublico, type ItemPublico } from "./boutique";
import { conCatalogo, type Precios, type Producto } from "./store";

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
    const [{ data, error }, { data: aj }, { data: stats }] = await Promise.all([
      sb.from("productos").select("data").eq("en_boutique", true),
      sb.from("ajustes_tienda").select("precios").maybeSingle(),
      sb.from("ficha_stats").select("codigo, vistas"),
    ]);
    const vistas = new Map((stats ?? []).map((s) => [s.codigo, s.vistas]));
    // Códigos "Solo privado": solo se leen los códigos, nunca sus datos.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: priv } = await supabaseAdmin
      .from("productos")
      .select("codigo")
      .eq("en_boutique", false);
    const privados = new Set((priv ?? []).map((r) => r.codigo));
    // Siempre los perfumes oficiales (a pedido) + lo que la bodega tenga en la nube.
    const productos = conCatalogo(
      (error || !data ? [] : data)
        .map((f) => f.data as unknown as Producto)
        .filter((p) => p && typeof p.codigo === "string"),
    ).filter((p) => !privados.has(p.codigo));
    const items = aPublico(productos, (aj?.precios as unknown as Precios) ?? undefined, vistas);
    const rutas = items.map((i) => i.foto).filter((r): r is string => !!r);
    if (rutas.length) {
      const { data: urls } = await sb.storage
        .from("fotos-productos")
        .createSignedUrls(rutas, 60 * 60 * 24);
      const mapa = new Map((urls ?? []).map((u) => [u.path, u.signedUrl]));
      for (const i of items) i.foto = i.foto ? (mapa.get(i.foto) ?? null) : null;
    }
    return items;
  },
);

/** Público: suma una visita o un "compartir" a la ficha (solo contadores, sin datos personales). */
export const registrarFicha = createServerFn({ method: "POST" })
  .inputValidator((d: { codigo: string; tipo: "vista" | "compartir" }) => {
    if (typeof d?.codigo !== "string" || d.codigo.length > 20) throw new Error("código inválido");
    if (d.tipo !== "vista" && d.tipo !== "compartir") throw new Error("tipo inválido");
    return d;
  })
  .handler(async ({ data }) => {
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
    await sb.rpc("registrar_ficha", { _codigo: data.codigo, _tipo: data.tipo });
    return { ok: true };
  });
