import { createServerFn } from "@tanstack/react-start";
import { aPublico, type ItemPublico } from "./boutique";
import type { Precios, Producto } from "./store";

/** Público: lee el respaldo más reciente de la dueña y devuelve solo productos visibles. */
export const catalogoPublico = createServerFn({ method: "GET" }).handler(
  async (): Promise<ItemPublico[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("backups")
      .select("data")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return [];
    const snap = data.data as { productos?: Producto[]; precios?: Precios };
    const productos = (snap?.productos ?? []).filter(
      (p) => p && typeof p.codigo === "string",
    );
    return aPublico(productos, snap?.precios);
  },
);
