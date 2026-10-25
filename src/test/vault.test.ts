import { describe, expect, it } from "vitest";
import { hoy, reposicion, resumenBodega, type Encargo, type Producto } from "@/lib/store";

const hace = (d: number) => new Date(Date.now() - d * 86400000).toISOString().slice(0, 10);

describe("resumen de bodega", () => {
  it("suma unidades y valor solo de lo que está en stock", () => {
    const ps: Producto[] = [
      { codigo: "H-01", nombre: "", stock: 2, precio: 10000, fechaIngreso: hoy() },
      { codigo: "M-02", nombre: "", stock: 0, precio: 50000 },
    ];
    expect(resumenBodega(ps)).toMatchObject({ unidades: 2, valor: 20000, remate: 0 });
  });
  it("cuenta remate desde 30 días quieto", () => {
    const ps: Producto[] = [{ codigo: "H-01", nombre: "", stock: 1, fechaIngreso: hace(30) }];
    expect(resumenBodega(ps).remate).toBe(1);
  });
});

describe("reposición", () => {
  const enc = (codigo: string, entregado = false): Encargo => ({ id: codigo, cliente: "A", codigo, nota: "", entregado, creada: hoy() });
  it("alerta agotados con encargos pendientes", () => {
    const r = reposicion([{ codigo: "H-17", nombre: "", stock: 0 }], [enc("h17"), enc("H-17", true)]);
    expect(r[0]?.pedidos).toBe(1);
  });
  it("ignora agotados sin encargos ni venta reciente", () => {
    expect(reposicion([{ codigo: "H-17", nombre: "", stock: 0, ultimaVenta: hace(60) }], [])).toHaveLength(0);
  });
});
