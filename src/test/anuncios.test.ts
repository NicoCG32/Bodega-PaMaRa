import { describe, expect, it } from "vitest";
import { anuncioIndividual, anuncioMultiple, chatgptUrl, filtrarStock } from "@/lib/anuncios";
import type { Producto } from "@/lib/store";

const hace = (d: number) => new Date(Date.now() - d * 86400000).toISOString().slice(0, 10);
const base = (o: Partial<Producto>): Producto =>
  ({ codigo: "H-17", nombre: "", stock: 3, ...o }) as Producto;

describe("anuncios Marketplace", () => {
  it("nunca usa la palabra réplica ni imitación", () => {
    const t = anuncioIndividual(
      base({ inspiracion: "Réplica Cristiano Ronaldo", version: "imitación GOAT" }),
    );
    expect(t).not.toMatch(/r[eé]plica|imitaci/i);
  });
  it("producto con 30+ días quieto lleva gancho de oferta", () => {
    expect(anuncioIndividual(base({ fechaIngreso: hace(31) }))).toContain("OFERTA");
    expect(anuncioIndividual(base({ fechaIngreso: hace(3) }))).not.toContain("OFERTA");
  });
  it("solo mujer incluye solo códigos M con stock", () => {
    const ps = [
      base({ codigo: "M-01" }),
      base({ codigo: "H-02" }),
      base({ codigo: "M-03", stock: 0 }),
    ];
    expect(filtrarStock(ps, "M").map((p) => p.codigo)).toEqual(["M-01"]);
    expect(anuncioMultiple(ps, "M")).not.toContain("H-02");
  });
  it("ChatGPT recibe el prompt en ?q=", () => {
    expect(chatgptUrl("hola mundo")).toBe("https://chatgpt.com/?q=hola%20mundo");
  });
});
