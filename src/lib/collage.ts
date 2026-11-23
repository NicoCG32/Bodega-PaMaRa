import { aPublico, type ItemPublico } from "./boutique";
import { IMAGENES_CATALOGO, type ImagenReferencia } from "./catalogo-imagenes";
import { presentacionParaCodigo, type Presentacion } from "./presentaciones";
import type { Precios, Producto } from "./store";

export const MAX_PERFUMES_COLLAGE = 6;
export const MENSAJE_COLLAGE = "A pedido · Consulta por WhatsApp";
export const FORMATOS_COLLAGE = [
  { id: "cuadrado", nombre: "Publicación cuadrada", width: 1080, height: 1080 },
  { id: "vertical", nombre: "Estado vertical", width: 1080, height: 1920 },
] as const;
export type FormatoCollage = (typeof FORMATOS_COLLAGE)[number];
export type PerfumeCollage = ItemPublico & { referencia: ImagenReferencia };
export type OpcionesCollage = {
  titulo: string;
  mensaje: string;
  mostrarPrecios: boolean;
  mostrarPresentaciones: boolean;
};
export type ArchivoCollage = { formato: FormatoCollage; archivo: File };

export function perfumesParaCollage(productos: Producto[], precios?: Precios): PerfumeCollage[] {
  return aPublico(productos, precios).flatMap((p) => {
    const referencia = IMAGENES_CATALOGO[p.codigo];
    return p.perfume && referencia ? [{ ...p, referencia }] : [];
  });
}

export function validarSeleccion(items: PerfumeCollage[]) {
  if (
    items.length < 1 ||
    items.length > MAX_PERFUMES_COLLAGE ||
    new Set(items.map((p) => p.codigo)).size !== items.length
  ) {
    throw new Error("Elige entre uno y seis perfumes diferentes.");
  }
}

export function presentacionesDeSeleccion(items: PerfumeCollage[]): Presentacion[] {
  return [
    ...new Map(
      items.flatMap((p) => {
        const presentacion = presentacionParaCodigo(p.codigo);
        return presentacion ? [[presentacion.id, presentacion] as const] : [];
      }),
    ).values(),
  ];
}

export type RectanguloCollage = { x: number; y: number; width: number; height: number };
export function distribuirPerfumes(
  cantidad: number,
  formato: FormatoCollage,
  conPresentaciones: boolean,
): RectanguloCollage[] {
  if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAX_PERFUMES_COLLAGE)
    throw new Error("Cantidad inválida.");
  const vertical = formato.id === "vertical";
  const columnas = vertical ? (cantidad <= 2 ? 1 : 2) : cantidad === 4 ? 2 : Math.min(cantidad, 3);
  const filas = Math.ceil(cantidad / columnas);
  const inicio = vertical ? 300 : 206;
  const fin = formato.height - (conPresentaciones ? (vertical ? 450 : 310) : vertical ? 230 : 145);
  const gap = vertical ? 24 : 18;
  const lado = Math.min(
    (984 - gap * (columnas - 1)) / columnas,
    (fin - inicio - gap * (filas - 1)) / filas,
    vertical ? 830 : 600,
  );
  const alto = filas * lado + (filas - 1) * gap;
  return Array.from({ length: cantidad }, (_, i) => {
    const fila = Math.floor(i / columnas);
    const enFila = Math.min(columnas, cantidad - fila * columnas);
    return {
      x: (formato.width - (enFila * lado + (enFila - 1) * gap)) / 2 + (i % columnas) * (lado + gap),
      y: inicio + (fin - inicio - alto) / 2 + fila * (lado + gap),
      width: lado,
      height: lado,
    };
  });
}
