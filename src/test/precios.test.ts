import { describe, expect, it } from "vitest";
import { precioVenta, type Producto } from "@/lib/store";
import { aPublico, mensajePedido } from "@/lib/boutique";

const cfg = { base: 15000, recargoEncargo: 2000, descuentoRemate: 3000 };
const hace = (d: number) => new Date(Date.now() - d * 864e5).toISOString().slice(0, 10);

describe("Precios por estado", () => {
  it("en repisa usa el precio general", () => {
    expect(
      precioVenta({ codigo: "H-01", nombre: "x", stock: 2, fechaIngreso: hace(1) }, cfg),
    ).toMatchObject({ estado: "stock", precio: 15000 });
  });
  it("sin stock suma el recargo de encargo", () => {
    expect(precioVenta({ codigo: "H-01", nombre: "x", stock: 0 }, cfg)).toMatchObject({
      estado: "encargo",
      precio: 17000,
    });
  });
  it("30+ días quieto resta el descuento de liquidación", () => {
    expect(
      precioVenta({ codigo: "H-01", nombre: "x", stock: 1, fechaIngreso: hace(40) }, cfg),
    ).toMatchObject({ estado: "remate", precio: 12000 });
  });
  it("el precio propio reemplaza al general", () => {
    expect(precioVenta({ codigo: "H-01", nombre: "x", stock: 0, precio: 20000 }, cfg).precio).toBe(
      22000,
    );
  });
  it("la tienda ofrece agotados como encargo y el mensaje lo indica", () => {
    const ps: Producto[] = [{ codigo: "M-04", nombre: "La Vie", stock: 0 }];
    const [i] = aPublico(ps, cfg);
    expect(i!.estado).toBe("encargo");
    expect(mensajePedido([{ item: i!, cantidad: 1 }], "La Serena")).toContain(
      "(por encargo) — $17.000",
    );
  });
});
