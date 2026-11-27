import { z } from "zod";
import { createClientRpc } from "@tanstack/react-start/client-rpc";
import type { ItemPublico } from "./boutique";

const ORIGEN_BACKEND = "https://pamara-bodega.lovable.app";

export function origenBackendParalelo(): string | undefined {
  const value = process.env["PAMARA_BACKEND_ORIGIN"];
  if (!value) return undefined;
  if (value.replace(/\/$/, "") !== ORIGEN_BACKEND) {
    throw new Error("El backend paralelo debe apuntar a la publicación de PaMaRa en Lovable.");
  }
  return ORIGEN_BACKEND;
}

const itemPublico = z.object({
  codigo: z.string(),
  nombre: z.string(),
  inspiracion: z.string().nullable(),
  version: z.string().nullable(),
  categoria: z.string().nullable(),
  precio: z.number().nullable(),
  stock: z.number(),
  perfume: z.boolean(),
  estado: z.enum(["stock", "remate", "encargo"]),
  foto: z.string().nullable(),
  descripcion: z.string().nullable(),
  notas: z.string().nullable(),
  vistas: z.literal(0),
});

export async function catalogoDesdeBackend(
  origin: string,
  functionId: string,
): Promise<ItemPublico[]> {
  if (origin !== ORIGEN_BACKEND || !/^[a-f0-9]{64}$/.test(functionId))
    throw new Error("Backend o función no permitidos.");
  let reply: unknown;
  try {
    reply = await createClientRpc(functionId)({
      method: "GET",
      fetch: (_input: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers);
        headers.set("origin", origin);
        headers.set("sec-fetch-site", "same-origin");
        return fetch(`${origin}/_serverFn/${functionId}`, {
          ...init,
          headers,
          cache: "no-store",
          redirect: "error",
          signal: AbortSignal.timeout(15_000),
        });
      },
    });
  } catch {
    throw new Error("No se pudo consultar el catálogo de la tienda.");
  }
  const parsed = z
    .object({ result: z.array(itemPublico).max(5000), error: z.unknown().optional() })
    .safeParse(reply);
  if (!parsed.success || parsed.data.error)
    throw new Error("No se pudo consultar el catálogo de la tienda.");
  return parsed.data.result;
}

/** Called only for a resolved server function, after Start's same-origin CSRF check. */
export async function reenviarFuncion(request: Request, origin: string): Promise<Response> {
  if (origin !== ORIGEN_BACKEND || new URL(request.url).origin === origin) {
    throw new Error("Backend no permitido o configuración circular.");
  }
  if (request.method !== "GET" && request.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, POST" } });
  }
  const source = new URL(request.url);
  const headers = new Headers({ origin, "sec-fetch-site": "same-origin" });
  for (const name of ["authorization", "content-type", "accept", "x-tsr-serverfn"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  try {
    const response = await fetch(`${origin}${source.pathname}${source.search}`, {
      method: request.method,
      headers,
      ...(request.method === "POST" ? { body: await request.arrayBuffer() } : {}),
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(75_000)]),
    });
    if (response.status >= 300 && response.status < 400) throw new Error("Unexpected redirect");
    const outgoing = new Headers({ "cache-control": "no-store" });
    for (const name of ["content-type", "x-tss-serialized", "x-tss-raw", "x-tss-context"]) {
      const value = response.headers.get(name);
      if (value) outgoing.set(name, value);
    }
    return new Response(response.body, { status: response.status, headers: outgoing });
  } catch {
    return Response.json(
      { error: "No se pudo conectar con el servicio de la tienda. Intenta de nuevo." },
      { status: 502, headers: { "cache-control": "no-store" } },
    );
  }
}
