import { clp, DIAS_REMATE, diasQuieto, esOtro, type Producto } from "./store";

export const FB_CREAR = "https://www.facebook.com/marketplace/create/item";
export const chatgptUrl = (prompt: string) =>
  `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;

export type FiltroStock = "todo" | "M" | "H";

/** Words that get Marketplace posts blocked; never appear in generated copy. */
const PROHIBIDAS = /\b(r[eé]plica|imitaci[oó]n|copia|falso|clon|alternativo)\w*/gi;
const limpiar = (s: string) =>
  s
    .replace(PROHIBIDAS, "")
    .replace(/\s{2,}/g, " ")
    .trim();

export const enRemate = (p: Producto) => p.stock > 0 && diasQuieto(p) >= DIAS_REMATE;

function nombreProducto(p: Producto) {
  if (esOtro(p)) return limpiar(p.nombre || "Producto");
  const insp = [p.inspiracion, p.version].filter(Boolean).join(" ");
  return limpiar(insp ? `Inspiración ${insp}` : p.nombre || p.codigo);
}

const publico = (p: Producto) =>
  esOtro(p)
    ? ""
    : p.codigo.startsWith("H-")
      ? "Hombre"
      : p.codigo.startsWith("M-")
        ? "Mujer"
        : "Juvenil";

export function anuncioIndividual(p: Producto): string {
  const remate = enRemate(p);
  const titulo = remate ? `🔥 OFERTA · ${nombreProducto(p)}` : `✨ ${nombreProducto(p)}`;
  const lineas = [
    titulo,
    "",
    esOtro(p)
      ? `• ${p.categoria ? limpiar(p.categoria) : "Producto de calidad"}`
      : `• Perfume ${publico(p)} · Código ${p.codigo}`,
    !esOtro(p) ? "• Inspiración de alta fijación y gran duración" : null,
    p.precio
      ? `• Precio: ${clp(p.precio)}${remate ? " (precio especial por tiempo limitado)" : ""}`
      : null,
    p.stock <= 2 ? "• ¡Últimas unidades!" : null,
    "• Entrega inmediata 🎁",
    "",
    "Escríbeme y te lo reservo 💛",
    "PaMaRa AyN",
  ];
  return lineas.filter((l) => l !== null).join("\n");
}

export function filtrarStock(productos: Producto[], f: FiltroStock) {
  return productos
    .filter((p) => p.stock > 0)
    .filter((p) => f === "todo" || (!esOtro(p) && p.codigo.startsWith(f + "-")))
    .sort((a, b) => a.codigo.localeCompare(b.codigo, "es", { numeric: true }));
}

export function anuncioMultiple(productos: Producto[], f: FiltroStock): string {
  const lista = filtrarStock(productos, f);
  const cab = f === "M" ? "Perfumes Mujer" : f === "H" ? "Perfumes Hombre" : "Perfumes y más";
  const items = lista.map((p) => {
    const precio = p.precio ? ` · ${clp(p.precio)}` : "";
    const cod = esOtro(p) ? "" : `${p.codigo} `;
    return `• ${cod}${nombreProducto(p)}${precio}${enRemate(p) ? " 🔥" : ""}`;
  });
  return [
    `✨ ${cab} · Entrega inmediata 🎁`,
    "Inspiraciones de alta fijación y gran duración.",
    "",
    ...items,
    "",
    items.some((i) => i.endsWith("🔥")) ? "🔥 = precio especial" : null,
    "Escríbeme y te lo reservo 💛",
    "PaMaRa AyN",
  ]
    .filter((l) => l !== null)
    .join("\n");
}
