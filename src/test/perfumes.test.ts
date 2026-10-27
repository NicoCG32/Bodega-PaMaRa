import { describe, expect, it } from "vitest";
import { conCatalogo, normCodigo } from "@/lib/store";

describe("catálogo de perfumes", () => {
  it("carga 120 fragancias con stock 0", () => {
    const p = conCatalogo([]);
    expect(p).toHaveLength(120);
    expect(p.find((x) => x.codigo === "H-18")?.inspiracion).toBe("Sauvage");
    expect(p.every((x) => x.stock === 0)).toBe(true);
  });
  it("no toca el stock existente", () => {
    const p = conCatalogo([{ codigo: "M-43", nombre: "", stock: 4 }]);
    expect(p.find((x) => x.codigo === "M-43")).toMatchObject({ stock: 4, inspiracion: "Good Girl" });
  });
  it("F y J se convierten en Mujer y Juvenil", () => {
    expect(normCodigo("f43")).toBe("M-43");
    expect(normCodigo("J-1")).toBe("T-01");
  });
});
