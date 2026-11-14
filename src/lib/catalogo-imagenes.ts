import { PERFUMES } from "./perfumes";

const archivos = import.meta.glob<string>("../assets/catalogo/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

export type ImagenReferencia = {
  nombre: string;
  marca: string;
  pequena: string;
  mediana: string;
  grande: string;
};

/** Las referencias editoriales se asocian al código oficial, sin cambiar las fotos de Bodega. */
export const IMAGENES_CATALOGO: Record<string, ImagenReferencia> = {};
for (const [codigo, nombre, marca] of PERFUMES) {
  const ruta = `../assets/catalogo/${codigo}`;
  const pequena = archivos[`${ruta}-480.webp`];
  const mediana = archivos[`${ruta}-768.webp`];
  const grande = archivos[`${ruta}-1024.webp`];
  if (pequena && mediana && grande)
    IMAGENES_CATALOGO[codigo] = { nombre, marca, pequena, mediana, grande };
}
