import { afterEach, describe, expect, it, vi } from "vitest";
import { ESPERA_CON_NATIVO_MS, transcribirConRespaldo } from "@/lib/vozNativa";

afterEach(() => vi.useRealTimers());
describe("Dictado paralelo", () => {
  it("envía ambas versiones cuando Groq responde", async () => {
    const r = await transcribirConRespaldo(
      async () => ({ texto: "H-17 H-15 H-17" }),
      () => "hache 17 hache 15 hache 17",
    );
    expect(r.groq).toBe("H-17 H-15 H-17");
    expect(r.nativo).toBe("hache 17 hache 15 hache 17");
  });
  it("conserva el nativo inmediatamente si Groq falla, sin reintentos", async () => {
    const groq = vi.fn().mockRejectedValue(new Error("falló"));
    expect(await transcribirConRespaldo(groq, () => "H-17")).toEqual({
      texto: "H-17",
      groq: "",
      nativo: "H-17",
    });
    expect(groq).toHaveBeenCalledTimes(1);
  });
  it("no espera Groq lento cuando ya hay dictado nativo, ni muta con respuesta tardía", async () => {
    vi.useFakeTimers();
    let resolver: ((r: { texto: string }) => void) | undefined;
    const p = transcribirConRespaldo(
      () =>
        new Promise((ok) => {
          resolver = ok;
        }),
      () => "H-17",
    );
    await vi.advanceTimersByTimeAsync(ESPERA_CON_NATIVO_MS);
    const r = await p;
    expect(r).toEqual({ texto: "H-17", groq: "", nativo: "H-17" });
    resolver?.({ texto: "H-15" });
    await vi.advanceTimersByTimeAsync(1);
    expect(r.texto).toBe("H-17");
  });
  it("espera Whisper si el teléfono no reconoce voz", async () => {
    vi.useFakeTimers();
    const p = transcribirConRespaldo(
      () => new Promise((ok) => setTimeout(() => ok({ texto: "H-08" }), 5000)),
      () => "",
    );
    await vi.advanceTimersByTimeAsync(5000);
    expect((await p).texto).toBe("H-08");
  });
});
