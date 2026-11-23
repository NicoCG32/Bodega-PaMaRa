import { describe, expect, it } from "vitest";
import {
  FORMATOS_COLLAGE,
  distribuirPerfumes,
  perfumesParaCollage,
  presentacionesDeSeleccion,
  validarSeleccion,
} from "@/lib/collage";
import { PRESENTACIONES, presentacionParaCodigo } from "@/lib/presentaciones";
import { conCatalogo, precioVenta, type Producto } from "@/lib/store";

describe("Presentaciones del catálogo", () => {
  it("asigna los 120 perfumes y respeta el límite entre Teen mujer y hombre", () => {
    expect(conCatalogo([]).every((p) => presentacionParaCodigo(p.codigo))).toBe(true);
    expect(presentacionParaCodigo("M-66")).toBe(PRESENTACIONES[0]);
    expect(presentacionParaCodigo("H-45")).toBe(PRESENTACIONES[1]);
    expect(presentacionParaCodigo("T-06")).toBe(PRESENTACIONES[2]);
    expect(presentacionParaCodigo("T-07")).toBe(PRESENTACIONES[3]);
    expect(presentacionParaCodigo("T-09")).toBe(PRESENTACIONES[3]);
    for (const codigo of ["O-1", "M-67", "T-10", "H-00", "H-46", "T-01-extra"])
      expect(presentacionParaCodigo(codigo)).toBeUndefined();
  });
  it("incluye una sola foto por presentación seleccionada", () => {
    const items = perfumesParaCollage(conCatalogo([])).filter((p) =>
      ["M-01", "M-02", "H-01", "T-06", "T-07"].includes(p.codigo),
    );
    expect(presentacionesDeSeleccion(items).map((p) => p.id)).toEqual([
      "hombre",
      "mujer",
      "teen-mujer",
      "teen-hombre",
    ]);
  });
});

describe("Selección para promociones", () => {
  it("permite perfumes a pedido, excluye privados y otros productos, y comparte la regla de precios", () => {
    const cfg = { base: 18000, recargoEncargo: 1500, descuentoRemate: 2000 };
    const productos: Producto[] = [
      { codigo: "M-01", nombre: "Publicado", stock: 0, precio: 20000 },
      { codigo: "H-01", nombre: "Privado", stock: 4, enBoutique: false },
      { codigo: "O-1", nombre: "Ropa", stock: 3 },
      { codigo: "T-01", nombre: "En stock", stock: 2 },
      { codigo: "H-99", nombre: "Sin referencia", stock: 1 },
    ];
    const items = perfumesParaCollage(productos, cfg);
    expect(items.map((p) => p.codigo)).toEqual(["T-01", "M-01"]);
    for (const p of items)
      expect(p.precio).toBe(
        precioVenta(
          productos.find((x) => x.codigo === p.codigo)!,
          cfg,
        ).precio,
      );
    expect(items[1]!.precio).toBe(21500);
    expect(items[1]!.referencia.nombre).toBeTruthy();
  });
  it("rechaza selecciones vacías, repetidas y superiores a seis", () => {
    const items = perfumesParaCollage(conCatalogo([]));
    expect(() => validarSeleccion([])).toThrow();
    expect(() => validarSeleccion(items.slice(0, 7))).toThrow();
    expect(() => validarSeleccion([items[0]!, items[0]!])).toThrow();
    expect(() => validarSeleccion(items.slice(0, 6))).not.toThrow();
  });
});

describe.each(FORMATOS_COLLAGE)("Composición $id", (formato) => {
  it.each([1, 2, 3, 4, 5, 6])(
    "distribuye %i perfumes sin recortes ni superposiciones con y sin presentaciones",
    (n) => {
      for (const conPresentaciones of [true, false]) {
        const cajas = distribuirPerfumes(n, formato, conPresentaciones);
        expect(cajas).toHaveLength(n);
        for (const [i, a] of cajas.entries()) {
          expect(a.x).toBeGreaterThanOrEqual(42);
          expect(a.y).toBeGreaterThanOrEqual(formato.id === "vertical" ? 300 : 206);
          expect(a.x + a.width).toBeLessThanOrEqual(formato.width - 42);
          expect(a.y + a.height).toBeLessThanOrEqual(
            formato.height -
              (conPresentaciones
                ? formato.id === "vertical"
                  ? 450
                  : 310
                : formato.id === "vertical"
                  ? 230
                  : 145),
          );
          expect(a.width).toBe(a.height);
          expect(a.width).toBeGreaterThan(250);
          for (const b of cajas.slice(i + 1))
            expect(
              a.x + a.width <= b.x ||
                b.x + b.width <= a.x ||
                a.y + a.height <= b.y ||
                b.y + b.height <= a.y,
            ).toBe(true);
        }
      }
    },
  );
});
