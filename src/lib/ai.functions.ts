import { createServerFn } from "@tanstack/react-start";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

export type Interpretacion = {
  tipo: "fiado" | "abono" | "encargo" | "stock" | "otro";
  cliente: string | null;
  codigo: string | null;
  total: number | null;
  abono_inicial: number | null;
  cuotas: { monto: number; fecha: string }[];
  cantidad: number | null;
  nota: string | null;
  resumen: string;
};

function key() {
  const k = process.env.LOVABLE_API_KEY;
  if (!k) throw new Error("Falta configurar la IA.");
  return k;
}

async function fail(res: Response): Promise<never> {
  const body = await res.text();
  console.error("AI gateway error", res.status, body);
  if (res.status === 429) throw new Error("Muchas solicitudes, espera un momento e intenta de nuevo.");
  if (res.status === 402) throw new Error("Se acabaron los créditos de IA del espacio de trabajo.");
  throw new Error(`No se pudo procesar (${res.status}).`);
}

export const transcribir = createServerFn({ method: "POST" })
  .inputValidator((d: { audio: string; mime: string }) => {
    if (!d?.audio || d.audio.length > 15_000_000) throw new Error("Audio inválido o muy largo");
    return d;
  })
  .handler(async ({ data }) => {
    const bytes = Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0));
    const ext = data.mime.includes("mp4") ? "mp4" : data.mime.includes("ogg") ? "ogg" : "webm";
    const fd = new FormData();
    fd.append("file", new Blob([bytes], { type: data.mime }), `audio.${ext}`);
    fd.append("model", "openai/gpt-transcribe");
    fd.append("language", "es");
    const res = await fetch(`${GATEWAY}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key()}` },
      body: fd,
    });
    if (!res.ok) await fail(res);
    const j = (await res.json()) as { text?: string };
    return { texto: (j.text ?? "").trim() };
  });

const nullable = (t: string) => ({ type: [t, "null"] });
const schema = {
  type: "object",
  additionalProperties: false,
  required: ["tipo", "cliente", "codigo", "total", "abono_inicial", "cuotas", "cantidad", "nota", "resumen"],
  properties: {
    tipo: { type: "string", enum: ["fiado", "abono", "encargo", "stock", "otro"] },
    cliente: nullable("string"),
    codigo: nullable("string"),
    total: nullable("number"),
    abono_inicial: nullable("number"),
    cuotas: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["monto", "fecha"],
        properties: { monto: { type: "number" }, fecha: { type: "string" } },
      },
    },
    cantidad: nullable("number"),
    nota: nullable("string"),
    resumen: { type: "string" },
  },
};

export const interpretar = createServerFn({ method: "POST" })
  .inputValidator((d: { texto: string; hoy: string }) => {
    if (!d?.texto || d.texto.length > 2000) throw new Error("Texto inválido");
    return d;
  })
  .handler(async ({ data }): Promise<Interpretacion> => {
    const system = `Eres la asistente de PaMaRa AyN, un pequeño negocio chileno de perfumes réplica, ropa, cosmética y encargos.
Hoy es ${data.hoy} (formato AAAA-MM-DD). Clasifica lo que dicta la dueña.
Códigos de perfume: Hombre "H-NN", Mujer "M-NN", Juveniles "T-NN" (ej. "hache cinco" = H-05, "eme doce" = M-12). Normaliza siempre a letra-guion-dos dígitos.
Montos en pesos chilenos: "18 mil" = 18000, "lucas" = mil pesos.
tipo:
- "fiado": se vendió a crédito. total = precio; abono_inicial = lo pagado ahora (0 si nada); cuotas = pagos futuros comprometidos con fecha AAAA-MM-DD (resuelve "el viernes" al próximo viernes, "fin de mes" al último día del mes actual). Si dice "me paga X el viernes y el resto a fin de mes", el resto = total - abono_inicial - X.
- "abono": un cliente pagó parte de una deuda existente. total = monto pagado.
- "encargo": pedido de un producto para un cliente.
- "stock": llegó o se vendió mercadería. cantidad positiva si llegó, negativa si salió.
- "otro": cualquier otra cosa.
Nombres de clientes con mayúscula inicial. resumen: una frase corta y cálida en español explicando lo entendido.`;
    const res = await fetch(`${GATEWAY}/responses`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        reasoning: { effort: "low" },
        input: [
          { role: "system", content: system },
          { role: "user", content: data.texto },
        ],
        text: { format: { type: "json_schema", name: "registro", strict: true, schema } },
      }),
    });
    if (!res.ok) await fail(res);
    const j = (await res.json()) as {
      output_text?: string;
      output?: { type: string; content?: { type: string; text?: string }[] }[];
    };
    const text =
      j.output_text ??
      j.output?.flatMap((o) => o.content ?? []).find((c) => c.type === "output_text")?.text ??
      "";
    if (!text) throw new Error("La IA no devolvió respuesta. Intenta escribirlo de otra forma.");
    return JSON.parse(text) as Interpretacion;
  });
