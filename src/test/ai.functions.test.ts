import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({ inputValidator: (validate: (d: unknown) => unknown) => ({
    handler: (fn: (input: { data: unknown }) => unknown) => (input: { data: unknown }) => fn({ data: validate(input.data) }),
  }) }),
}));
import { interpretar, interpretarBodega, crearPromptTrend, transcribir } from "@/lib/ai.functions";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const registro = { tipo: "fiado", cliente: "Carmen", codigo: "H-05", total: 18000, abono_inicial: 0, cuotas: [], cantidad: null, nota: null, resumen: "Carmen debe 18 mil", texto_validado: "Le fié a Carmen H-05 por 18 mil" };
function responder(content: unknown) {
  vi.stubEnv("GROQ_API_KEY", "test-only");
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(content) } }] })));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
describe("IA sin Lovable", () => {
  it("interpreta las dos versiones en una sola llamada Groq", async () => {
    const f = responder(registro);
    const r = await interpretar({ data: { texto: "Carmen H-05 18 mil", groq: "Carmen H-05 18 mil", nativo: "Carmen hache cinco dieciocho mil", hoy: "2026-10-29" } });
    expect(r.total).toBe(18000);
    expect(f).toHaveBeenCalledTimes(1);
    expect(f.mock.calls[0]?.[0]).toBe("https://api.groq.com/openai/v1/chat/completions");
    const body = JSON.parse(f.mock.calls[0]?.[1].body);
    expect(JSON.parse(body.messages[1].content).telefono).toBe("Carmen hache cinco dieciocho mil");
    expect(body.model).toBe("openai/gpt-oss-120b");
    expect(body.response_format.json_schema.strict).toBe(true);
  });
  it("un fallo de Groq nunca llama otro proveedor", async () => {
    const f = responder({});
    f.mockResolvedValue(new Response("ocupado", { status: 429 }));
    await expect(interpretar({ data: { texto: "H-17", hoy: "2026-10-29" } })).rejects.toThrow("Groq está ocupado");
    expect(f).toHaveBeenCalledTimes(1);
  });
  it("foto se envía al modelo de visión Groq", async () => {
    const f = responder({ items: [{ codigo: "H-17", nombre: null, tipo: "perfume", cantidad: 1 }] });
    const r = await interpretarBodega({ data: { imagen: "data:image/jpeg;base64,YQ==", otros: [] } });
    expect(r.items[0]?.cantidad).toBe(1);
    expect(JSON.parse(f.mock.calls[0]?.[1].body).model).toBe("qwen/qwen3.8-27b");
  });
  it("rechaza cantidades inválidas antes del registro", async () => {
    responder({ items: [{ codigo: "H-17", nombre: null, tipo: "perfume", cantidad: -1 }] });
    await expect(interpretarBodega({ data: { texto: "H-17", otros: [] } })).rejects.toThrow("No pude confirmar");
  });
  it("promociones también usan exclusivamente Groq", async () => {
    const f = responder("Prompt");
    await crearPromptTrend({ data: { idea: "perrito triste", productos: "H-17" } });
    expect(f.mock.calls[0]?.[0]).toBe("https://api.groq.com/openai/v1/chat/completions");
  });
  it("Whisper falla una sola vez sin respaldo de Lovable", async () => {
    const f = responder({});
    f.mockResolvedValue(new Response("error", { status: 500 }));
    await expect(transcribir({ data: { audio: "YQ==", mime: "audio/webm" } })).rejects.toThrow("Groq no respondió");
    expect(f).toHaveBeenCalledTimes(1);
    expect(f.mock.calls[0]?.[0]).toBe("https://api.groq.com/openai/v1/audio/transcriptions");
  });
});