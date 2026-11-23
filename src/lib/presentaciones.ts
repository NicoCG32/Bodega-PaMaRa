import mujer from "@/assets/presentaciones/mujer.webp";
import hombre from "@/assets/presentaciones/hombre.webp";
import teenMujer from "@/assets/presentaciones/teen-mujer.webp";
import teenHombre from "@/assets/presentaciones/teen-hombre.webp";
import logo from "@/assets/presentaciones/parfums-logo.webp";

export const LOGO_PARFUMS = logo;
export const PRESENTACIONES = [
  { id: "mujer", nombre: "Presentación mujer", imagen: mujer },
  { id: "hombre", nombre: "Presentación hombre", imagen: hombre },
  { id: "teen-mujer", nombre: "Teen mujer", imagen: teenMujer },
  { id: "teen-hombre", nombre: "Teen hombre", imagen: teenHombre },
] as const;
export type Presentacion = (typeof PRESENTACIONES)[number];

export function presentacionParaCodigo(codigo: string): Presentacion | undefined {
  if (/^M-(0[1-9]|[1-5]\d|6[0-6])$/.test(codigo)) return PRESENTACIONES[0];
  if (/^H-(0[1-9]|[1-3]\d|4[0-5])$/.test(codigo)) return PRESENTACIONES[1];
  if (/^T-0[1-6]$/.test(codigo)) return PRESENTACIONES[2];
  if (/^T-0[7-9]$/.test(codigo)) return PRESENTACIONES[3];
  return undefined;
}
