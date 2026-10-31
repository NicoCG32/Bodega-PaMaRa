import { clp, esOtro, type Producto } from "./store";

/** Número de WhatsApp de la tienda (formato 569XXXXXXXX). Vacío = la clienta elige el chat. */
export const TIENDA_WHATSAPP = "56935774427";
export const COMUNAS = ["La Serena", "Coquimbo", "Calama", "Otra"] as const;
export const ULTIMAS = 2;

export type Coleccion = "todo" | "mujer" | "hombre" | "cosmetica" | "accesorios";

export type ItemPublico = {
  codigo: string;
  nombre: string;
  inspiracion: string | null;
  version: string | null;
  categoria: string | null;
  precio: number | null;
  stock: number;
  perfume: boolean;
};

/** Solo lo visible al público: con stock y no marcado "Solo privado". */
export function aPublico(productos: Producto[]): ItemPublico[] {
  return productos
    .filter((p) => p.stock > 0 && p.enBoutique !== false)
    .map((p) => ({
      codigo: p.codigo,
      nombre: p.nombre,
      inspiracion: p.inspiracion ?? null,
      version: p.version ?? null,
      categoria: p.categoria ?? null,
      precio: p.precio ?? null,
      stock: p.stock,
      perfume: !esOtro(p),
    }));
}

const esAccesorio = (i: ItemPublico) =>
  /accesorio|joya|bolso|cartera|aro|collar/i.test(i.categoria ?? i.nombre);

export function enColeccion(i: ItemPublico, c: Coleccion) {
  if (c === "todo") return true;
  if (c === "mujer") return i.perfume && i.codigo.startsWith("M-");
  if (c === "hombre") return i.perfume && (i.codigo.startsWith("H-") || i.codigo.startsWith("T-"));
  if (c === "accesorios") return !i.perfume && esAccesorio(i);
  return !i.perfume && !esAccesorio(i);
}

export const badge = (i: ItemPublico) => (i.stock <= ULTIMAS ? "Últimas unidades" : "Disponible");

export type Linea = { item: ItemPublico; cantidad: number };

export function totalBolsa(b: Linea[]) {
  return b.reduce((a, l) => a + (l.item.precio ?? 0) * l.cantidad, 0);
}

export function mensajePedido(b: Linea[], comuna: string) {
  const lineas = b.map((l) => {
    const t = [
      l.item.perfume ? `[${l.item.codigo}]` : "",
      l.item.nombre,
      l.item.inspiracion ? `(${l.item.inspiracion})` : "",
    ]
      .filter(Boolean)
      .join(" ");
    const precio = l.item.precio
      ? ` — ${clp(l.item.precio * l.cantidad)}`
      : " — precio a confirmar";
    return `• ${t} x${l.cantidad}${precio}`;
  });
  return [
    "¡Hola PaMaRa! 🌸 Quiero hacer este pedido:",
    "",
    ...lineas,
    "",
    `Total: ${clp(totalBolsa(b))}`,
    `Comuna de entrega: ${comuna}`,
  ].join("\n");
}

export function linkPedido(b: Linea[], comuna: string) {
  return `https://wa.me/${TIENDA_WHATSAPP}?text=${encodeURIComponent(mensajePedido(b, comuna))}`;
}
