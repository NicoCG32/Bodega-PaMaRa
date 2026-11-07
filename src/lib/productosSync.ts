import { supabase } from "@/integrations/supabase/client";
import { getState, restoreState, subscribe, type Producto } from "./store";

/** Productos y precios viven en la nube (tabla compartida); este teléfono guarda una copia. */
let activo = false;
let aplicando = false;
let enNube = new Map<string, string>();
let preciosNube = "";
let timer: ReturnType<typeof setTimeout> | undefined;
let unsub: (() => void) | undefined;
let canal: ReturnType<typeof supabase.channel> | undefined;

export async function esAdmin(): Promise<boolean> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return false;
  const { data } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
  return data === true;
}

async function bajar() {
  const [{ data: filas, error }, { data: aj }] = await Promise.all([
    supabase.from("productos").select("codigo, data"),
    supabase.from("ajustes_tienda").select("precios").maybeSingle(),
  ]);
  if (error) return false;
  const local = getState();
  if (!filas?.length) {
    enNube = new Map();
    programar(); // primera vez: sube la bodega de este teléfono
    return true;
  }
  const productos = filas.map((f) => f.data as unknown as Producto);
  enNube = new Map(productos.map((p) => [p.codigo, JSON.stringify(p)]));
  const precios = (aj?.precios as unknown as typeof local.precios) ?? local.precios;
  preciosNube = JSON.stringify(aj?.precios ?? null);
  aplicando = true;
  restoreState(precios ? { ...local, productos, precios } : { ...local, productos });
  aplicando = false;
  programar(); // sube productos nuevos del catálogo, si faltan
  return true;
}

function programar() {
  clearTimeout(timer);
  timer = setTimeout(() => void subir(), 800);
}

async function subir() {
  if (!activo) return;
  const s = getState();
  const cambios = s.productos.filter((p) => enNube.get(p.codigo) !== JSON.stringify(p));
  const actuales = new Set(s.productos.map((p) => p.codigo));
  const borrados = [...enNube.keys()].filter((c) => !actuales.has(c));
  if (cambios.length) {
    const { error } = await supabase.from("productos").upsert(
      cambios.map((p) => ({
        codigo: p.codigo,
        data: JSON.parse(JSON.stringify(p)),
        en_boutique: p.enBoutique !== false,
        updated_at: new Date().toISOString(),
      })),
    );
    if (!error) cambios.forEach((p) => enNube.set(p.codigo, JSON.stringify(p)));
  }
  if (borrados.length) {
    const { error } = await supabase.from("productos").delete().in("codigo", borrados);
    if (!error) borrados.forEach((c) => enNube.delete(c));
  }
  const p = JSON.stringify(s.precios ?? null);
  if (s.precios && p !== preciosNube) {
    const { error } = await supabase
      .from("ajustes_tienda")
      .upsert({ id: 1, precios: JSON.parse(p), updated_at: new Date().toISOString() });
    if (!error) preciosNube = p;
  }
}

/** Activa la bodega compartida si la cuenta es Administradora. */
export async function iniciarProductos() {
  if (typeof window === "undefined") return;
  if (!(await esAdmin())) return detenerProductos();
  if (activo) return;
  activo = true;
  await bajar();
  unsub = subscribe(() => {
    if (activo && !aplicando) programar();
  });
  canal = supabase
    .channel(`productos-${Math.random().toString(36).slice(2)}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "productos" }, () => {
      clearTimeout(timer);
      timer = setTimeout(() => void subir().then(bajar), 1500);
    })
    .subscribe();
}

export function detenerProductos() {
  activo = false;
  unsub?.();
  unsub = undefined;
  if (canal) void supabase.removeChannel(canal);
  canal = undefined;
}
