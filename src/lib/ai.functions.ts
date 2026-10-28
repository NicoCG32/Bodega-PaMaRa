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
  const k = process.env["LOVABLE_API_KEY"];
  if (!k) throw new Error("Falta configurar la IA.");
  return k;
}


export type Motor = "gemini" | "groq" | "lovable";
const GEMINI_MODEL = "gemini-flash-latest";

function geminiKey() {
  return process.env["GEMINI_API_KEY"] || null;
}

/** Calls Gemini directly with the owner's own key. Returns text or throws. */
async function gemini(parts: unknown[], system: string | null, json: boolean): Promise<string> {
  const k = geminiKey();
  if (!k) throw new Error("sin clave Gemini");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(k)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Fall back to Lovable AI quickly if Gemini hangs.
      signal: AbortSignal.timeout(20_000),
      body: JSON.stringify({
        ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
        contents: [{ role: "user", parts }],
        generationConfig: json ? { responseMimeType: "application/json", temperature: 0.1 } : { temperature: 0 },
      }),
    },
  );
  if (!res.ok) {
    console.error("Gemini error", res.status, (await res.text()).slice(0, 500));
    throw new Error(`Gemini ${res.status}`);
  }
  const j = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text.trim()) throw new Error("Gemini sin respuesta");
  return text;
}

function dataUrlParts(url: string) {
  const m = /^data:([^;]+);base64,(.+)$/.exec(url);
  return m ? { mimeType: m[1], data: m[2] } : null;
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
  .handler(async ({ data }): Promise<{ texto: string; motor: Motor }> => {
    // Groq only — never Lovable AI. Client falls back to the phone's native dictation.
    const bytes = Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0));
    const ext = data.mime.includes("mp4") ? "mp4" : data.mime.includes("ogg") ? "ogg" : "webm";
    const groqKey = process.env["GROQ_API_KEY"];
    if (!groqKey) throw new Error("Falta la clave de Groq");
    let ultimo = "";
    for (let intento = 0; intento < 3; intento++) {
      if (intento > 0) await new Promise((r) => setTimeout(r, 1500 * intento));
      try {
        const g = new FormData();
        g.append("file", new Blob([bytes], { type: data.mime.split(";")[0] ?? data.mime }), `audio.${ext}`);
        g.append("model", "whisper-large-v3");
        g.append("language", "es");
        g.append("response_format", "json");
        const r = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${groqKey}` },
          body: g,
          signal: AbortSignal.timeout(60_000),
        });
        if (r.ok) {
          const gj = (await r.json()) as { text?: string };
          return { texto: (gj.text ?? "").trim(), motor: "groq" };
        }
        ultimo = `Groq ${r.status}: ${(await r.text()).slice(0, 200)}`;
        if (r.status !== 429 && r.status < 500) break;
      } catch (e) {
        ultimo = (e as Error).message;
      }
    }
    throw new Error(ultimo || "Groq no respondió");
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
  .handler(async ({ data }): Promise<Interpretacion & { motor: Motor }> => {
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
    try {
      const t = await gemini(
        [{ text: data.texto }],
        `${system}\nResponde SOLO JSON con exactamente estas claves: tipo, cliente, codigo, total, abono_inicial, cuotas (lista de {monto, fecha}), cantidad, nota, resumen. Usa null cuando no aplique.`,
        true,
      );
      const r = JSON.parse(t) as Interpretacion;
      return { ...r, cuotas: Array.isArray(r.cuotas) ? r.cuotas : [], motor: "gemini" };
    } catch (e) {
      console.warn("Gemini interpretar falló, usando Lovable AI", e);
    }
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
    return { ...(JSON.parse(text) as Interpretacion), motor: "lovable" };
  });

export type ItemBodega = { codigo: string | null; nombre: string | null; tipo: "perfume" | "otro"; cantidad: number };

const schemaBodega = {
  type: "object",
  additionalProperties: false,
  required: ["items"],
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["codigo", "nombre", "tipo", "cantidad"],
        properties: {
          codigo: nullable("string"),
          nombre: nullable("string"),
          tipo: { type: "string", enum: ["perfume", "otro"] },
          cantidad: { type: "number" },
        },
      },
    },
  },
};

/** Inventory count from a dictation chunk or a shelf photo. Items keep the order they were said/seen. */
export const interpretarBodega = createServerFn({ method: "POST" })
  .inputValidator((d: { texto?: string; imagen?: string; otros: string[] }) => {
    if (!d?.texto && !d?.imagen) throw new Error("Nada que revisar");
    if ((d.texto?.length ?? 0) > 4000 || (d.imagen?.length ?? 0) > 12_000_000) throw new Error("Muy largo");
    return { ...d, otros: (d.otros ?? []).slice(0, 200) };
  })
  .handler(async ({ data }): Promise<{ items: ItemBodega[]; motor: Motor }> => {
    const system = `Ayudas a contar la bodega de PaMaRa AyN (perfumes réplica, ropa, cosmética).
Perfumes: códigos Hombre "H-NN", Mujer "M-NN", Juveniles "T-NN" ("hache diecisiete" = H-17). Normaliza a letra-guion-dos dígitos, tipo "perfume", nombre null.
Otros productos (aceites, cremas, prendas) no tienen código: codigo null, tipo "otro", nombre corto con mayúscula inicial. Si se parece a uno conocido, usa exactamente ese nombre. Conocidos: ${data.otros.join(", ") || "ninguno"}.
La dueña suele nombrar frasco por frasco ("H-17, H-15, H-17"): cada mención suma 1. Si dice cantidad explícita ("dos H-04", "tres aceites") usa esa cantidad.
Devuelve un ítem por cada mención en el orden en que aparecen (no agrupes, la app agrupa). Ignora muletillas y palabras sueltas sin producto.
En una foto: lee los códigos visibles en las etiquetas y devuelve un ítem por frasco/producto visible.`;
    try {
      const img = data.imagen ? dataUrlParts(data.imagen) : null;
      const parts = img
        ? [{ inlineData: img }, { text: "Cuenta los productos de esta repisa." }]
        : [{ text: data.texto ?? "" }];
      const t = await gemini(
        parts,
        `${system}\nResponde SOLO JSON: {"items":[{"codigo":string|null,"nombre":string|null,"tipo":"perfume"|"otro","cantidad":number}]}`,
        true,
      );
      const r = JSON.parse(t) as { items?: ItemBodega[] };
      return { items: Array.isArray(r.items) ? r.items : [], motor: "gemini" };
    } catch (e) {
      console.warn("Gemini bodega falló, usando Lovable AI", e);
    }
    const content = data.imagen
      ? [
          { type: "input_text", text: "Cuenta los productos de esta repisa." },
          { type: "input_image", image_url: data.imagen },
        ]
      : data.texto!;
    const res = await fetch(`${GATEWAY}/responses`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        reasoning: { effort: "low" },
        input: [
          { role: "system", content: system },
          { role: "user", content },
        ],
        text: { format: { type: "json_schema", name: "bodega", strict: true, schema: schemaBodega } },
      }),
    });
    if (!res.ok) await fail(res);
    const j = (await res.json()) as {
      output_text?: string;
      output?: { type: string; content?: { type: string; text?: string }[] }[];
    };
    const text =
      j.output_text ?? j.output?.flatMap((o) => o.content ?? []).find((c) => c.type === "output_text")?.text ?? "";
    if (!text) return { items: [], motor: "lovable" };
    return { ...(JSON.parse(text) as { items: ItemBodega[] }), motor: "lovable" };
  });

/** Turns a spoken meme/trend idea into a ready-to-paste ChatGPT prompt (image + caption). */
export const crearPromptTrend = createServerFn({ method: "POST" })
  .inputValidator((d: { idea: string; productos: string }) => {
    if (!d?.idea || d.idea.length > 2000) throw new Error("Cuéntame la idea primero");
    return { idea: d.idea, productos: (d.productos ?? "").slice(0, 1500) };
  })
  .handler(async ({ data }): Promise<{ prompt: string; motor: Motor }> => {
    const system = `Eres experta en marketing para redes sociales de PaMaRa AyN, una tienda chilena de perfumes (inspiraciones de alta fijación), ropa y cosmética.
La dueña te cuenta una idea de meme o trend en lenguaje natural. Escribe UN prompt en español, listo para pegar en ChatGPT, que le pida:
1) Generar una imagen (describe escena, personajes, estilo visual, colores, encuadre cuadrado 1:1, texto corto dentro de la imagen si corresponde).
2) Un texto gracioso y breve para publicar en Facebook/Instagram con emojis y llamado a escribir por WhatsApp.
Nunca uses las palabras "réplica", "imitación" ni "copia"; usa "inspiración". Menciona la marca PaMaRa AyN. Si nombra un código (H-05, M-12, T-03) úsalo.
Productos disponibles como referencia: ${data.productos || "no indicado"}.
Devuelve SOLO el texto del prompt, sin explicaciones ni comillas.`;
    try {
      const t = await gemini([{ text: data.idea }], system, false);
      return { prompt: t.trim(), motor: "gemini" };
    } catch (e) {
      console.warn("Gemini trend falló, usando Lovable AI", e);
    }
    const res = await fetch(`${GATEWAY}/responses`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        reasoning: { effort: "low" },
        input: [
          { role: "system", content: system },
          { role: "user", content: data.idea },
        ],
      }),
    });
    if (!res.ok) await fail(res);
    const j = (await res.json()) as {
      output_text?: string;
      output?: { type: string; content?: { type: string; text?: string }[] }[];
    };
    const text =
      j.output_text ?? j.output?.flatMap((o) => o.content ?? []).find((c) => c.type === "output_text")?.text ?? "";
    if (!text.trim()) throw new Error("La IA no devolvió respuesta. Intenta contarlo de otra forma.");
    return { prompt: text.trim(), motor: "lovable" };
  });
