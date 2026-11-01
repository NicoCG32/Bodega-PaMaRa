import { describe, expect, it } from "vitest";
import { aPublico, badge, enColeccion, linkPedido, mensajePedido } from "@/lib/boutique";
import type { Producto } from "@/lib/store";

const ps: Producto[] = [
  { codigo: "M-12", nombre: "Good Girl", stock: 5, precio: 15000 },
  { codigo: "H-05", nombre: "One Million", stock: 2, precio: 15000 },
  { codigo: "H-07", nombre: "Privado", stock: 3, enBoutique: false },
  { codigo: "H-09", nombre: "Agotado", stock: 0 },
  { codigo: "O-ab", nombre: "Aceite argán", stock: 4, tipo: "otro" },
];

describe("Boutique", () => {
  it("oculta los marcados solo privado; agotados quedan a pedido al final", () => {
    expect(aPublico(ps).map((i) => i.codigo)).toEqual(["M-12", "H-05", "O-ab", "H-09"]);
  });
  it("2 o menos unidades = Últimas unidades", () => {
    const [m, h] = aPublico(ps);
    expect(badge(m!)).toBe("Entrega hoy");
    expect(badge(h!)).toBe("Últimas unidades");
  });
  it("filtra Mujer y Cosmética", () => {
    const pub = aPublico(ps);
    expect(pub.filter((i) => enColeccion(i, "mujer")).map((i) => i.codigo)).toEqual(["M-12"]);
    expect(pub.filter((i) => enColeccion(i, "cosmetica")).map((i) => i.codigo)).toEqual(["O-ab"]);
  });
  it("mensaje incluye total y comuna", () => {
    const pub = aPublico(ps);
    const msg = mensajePedido(
      [
        { item: pub[0]!, cantidad: 2 },
        { item: pub[1]!, cantidad: 1 },
      ],
      "Calama",
    );
    expect(msg).toContain("Total: $45.000");
    expect(msg).toContain("(en stock, entrega hoy)");
    expect(msg).toContain("Comuna de entrega: Calama");
  });
  it("el pedido abre el WhatsApp de la tienda", () => {
    const url = linkPedido([{ item: aPublico(ps)[0]!, cantidad: 1 }], "Coquimbo");
    expect(url.startsWith("https://wa.me/56935774427?text=")).toBe(true);
    expect(decodeURIComponent(url)).toContain("Comuna de entrega: Coquimbo");
  });
});
