import { clp, esOtro, precioVenta, type EstadoVenta, type Precios, type Producto } from "./store";

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
  estado: EstadoVenta;
  /** Ruta de la foto; el servidor la cambia por un enlace para ver. */
  foto: string | null;
};

export type Disponibilidad = "todo" | EstadoVenta;

/** Lo visible al público (no "Solo privado"): perfumes siempre (sin stock = a pedido); ropa y cosmética solo con stock. */
export function aPublico(productos: Producto[], cfg?: Precios): ItemPublico[] {
  return productos
    .filter(
      (p) =>
        p.enBoutique !== false &&
        (esOtro(p) ? p.stock > 0 : p.stock > 0 || !!(p.inspiracion || p.nombre)),
    )
    .map((p) => {
      const v = precioVenta(p, cfg);
      return {
        codigo: p.codigo,
        nombre: p.nombre,
        inspiracion: p.inspiracion ?? null,
        version: p.version ?? null,
        categoria: p.categoria ?? null,
        precio: v.precio || null,
        stock: Math.max(0, p.stock),
        perfume: !esOtro(p),
        estado: v.estado,
        foto: p.foto ?? null,
      };
    })
    .sort((a, b) => orden[a.estado] - orden[b.estado]);
}
const orden: Record<EstadoVenta, number> = { remate: 0, stock: 1, encargo: 2 };

export const ETIQUETA: Record<EstadoVenta, string> = {
  stock: "Entrega hoy",
  remate: "Liquidación",
  encargo: "A pedido · llega en pocos días",
};

const esAccesorio = (i: ItemPublico) =>
  /accesorio|joya|bolso|cartera|aro|collar/i.test(i.categoria ?? i.nombre);

export function enColeccion(i: ItemPublico, c: Coleccion) {
  if (c === "todo") return true;
  if (c === "mujer") return i.perfume && i.codigo.startsWith("M-");
  if (c === "hombre") return i.perfume && (i.codigo.startsWith("H-") || i.codigo.startsWith("T-"));
  if (c === "accesorios") return !i.perfume && esAccesorio(i);
  return !i.perfume && !esAccesorio(i);
}

export const badge = (i: ItemPublico) =>
  i.estado === "encargo"
    ? "A pedido"
    : i.estado === "remate"
      ? "Liquidación"
      : i.stock <= ULTIMAS
        ? "Últimas unidades"
        : "Entrega hoy";

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
    const modo =
      l.item.estado === "encargo"
        ? " (por encargo)"
        : l.item.estado === "remate"
          ? " (liquidación)"
          : " (en stock, entrega hoy)";
    return `• ${t} x${l.cantidad}${modo}${precio}`;
  });
  return [
    "¡Hola PaMaRa! 🌸 Me interesan estos productos:",
    "",
    ...lineas,
    "",
    `Total: ${clp(totalBolsa(b))}`,
    `Comuna de entrega: ${comuna}`,
    "",
    "¿Podemos coordinar?",
  ].join("\n");
}

export function linkPedido(b: Linea[], comuna: string) {
  return `https://wa.me/${TIENDA_WHATSAPP}?text=${encodeURIComponent(mensajePedido(b, comuna))}`;
}

export function mensajeConsulta(i: ItemPublico) {
  const nombre = i.perfume
    ? `el ${i.codigo}${i.inspiracion ? ` (Inspirado en ${i.inspiracion})` : ""}`
    : i.nombre;
  const disp = i.estado === "encargo" ? "¿Se puede encargar?" : "¿Lo tienes disponible para coordinar?";
  return `Hola! Vi en tu vitrina ${nombre}. ${disp}`;
}

export function linkConsulta(i: ItemPublico) {
  return `https://wa.me/${TIENDA_WHATSAPP}?text=${encodeURIComponent(mensajeConsulta(i))}`;
}
