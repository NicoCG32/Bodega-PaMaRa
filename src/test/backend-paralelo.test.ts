import { afterEach, describe, expect, it, vi } from "vitest";
import {
  catalogoDesdeBackend,
  origenBackendParalelo,
  reenviarFuncion,
} from "@/lib/backend-paralelo.server";
import { aPublico } from "@/lib/boutique";

const backend = "https://pamara-bodega.lovable.app";
const site = "https://pamara-bodega-paralelo.vercel.app";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("Backend del despliegue paralelo", () => {
  it("conserva la ejecución local si no está configurado", () => {
    vi.stubEnv("PAMARA_BACKEND_ORIGIN", undefined);
    expect(origenBackendParalelo()).toBeUndefined();
  });
  it("solo permite el backend de la tienda", () => {
    vi.stubEnv("PAMARA_BACKEND_ORIGIN", backend + "/");
    expect(origenBackendParalelo()).toBe(backend);
    for (const origin of [
      site,
      "http://localhost",
      backend + "/otro",
      backend + ".example.com",
      "https://example.com",
    ]) {
      vi.stubEnv("PAMARA_BACKEND_ORIGIN", origin);
      expect(() => origenBackendParalelo()).toThrow();
    }
  });
  it("lee la misma proyección pública y descarta campos ajenos al catálogo", async () => {
    const p = aPublico([{ codigo: "M-01", nombre: "Publicado", stock: 2 }])[0]!;
    const f = vi
      .fn()
      .mockResolvedValue(
        Response.json([
          { ...p, telefonos: { cliente: "privado" }, deudas: [1], user_id: "no-publicar" },
        ]),
      );
    vi.stubGlobal("fetch", f);
    expect(await catalogoDesdeBackend(backend)).toEqual([p]);
    expect(f).toHaveBeenCalledWith(
      `${backend}/api/public/catalogo`,
      expect.objectContaining({ cache: "no-store", redirect: "error" }),
    );
  });
  it("rechaza respuestas que no respetan el contrato público", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json([{ codigo: "M-01", vistas: 15 }])),
    );
    await expect(catalogoDesdeBackend(backend)).rejects.toThrow();
  });
  it("informa cuando el backend no entrega el catálogo", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("No disponible", { status: 503 })),
    );
    await expect(catalogoDesdeBackend(backend)).rejects.toThrow("catálogo");
  });
  it("conserva cuerpo y token de sesión sin reenviar cookies ni cabeceras de infraestructura", async () => {
    const f = vi.fn().mockResolvedValue(
      new Response('{"ok":true}', {
        headers: {
          "content-type": "application/json",
          "x-tss-serialized": "true",
          "set-cookie": "session=not-forwarded",
          "content-encoding": "gzip",
          "access-control-allow-origin": "*",
        },
      }),
    );
    vi.stubGlobal("fetch", f);
    const request = new Request(`${site}/_serverFn/test?version=1`, {
      method: "POST",
      headers: {
        authorization: "Bearer test-session",
        "content-type": "application/json",
        "x-tsr-serverfn": "true",
        cookie: "private=not-forwarded",
        "x-forwarded-host": "untrusted.example.com",
        origin: site,
      },
      body: '{"data":{"texto":"prueba"}}',
    });
    const result = await reenviarFuncion(request, backend);
    const [url, init] = f.mock.calls[0]!;
    expect(url).toBe(`${backend}/_serverFn/test?version=1`);
    expect(new TextDecoder().decode(init.body)).toBe('{"data":{"texto":"prueba"}}');
    expect(init.headers.get("authorization")).toBe("Bearer test-session");
    expect(init.headers.get("origin")).toBe(backend);
    expect(init.headers.has("cookie")).toBe(false);
    expect(init.headers.has("x-forwarded-host")).toBe(false);
    expect(init.redirect).toBe("manual");
    expect(result.headers.get("x-tss-serialized")).toBe("true");
    expect(result.headers.get("cache-control")).toBe("no-store");
    for (const name of ["set-cookie", "content-encoding", "access-control-allow-origin"])
      expect(result.headers.has(name)).toBe(false);
    expect(await result.json()).toEqual({ ok: true });
  });
  it("no convierte un rechazo de autenticación en una respuesta exitosa", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Unauthorized", { status: 401 })),
    );
    const result = await reenviarFuncion(new Request(`${site}/_serverFn/test`), backend);
    expect(result.status).toBe(401);
    expect(await result.text()).toBe("Unauthorized");
  });
  it("no sigue redirecciones con el token de la administradora", async () => {
    const f = vi
      .fn()
      .mockResolvedValue(
        new Response(null, { status: 302, headers: { location: "https://example.com" } }),
      );
    vi.stubGlobal("fetch", f);
    expect((await reenviarFuncion(new Request(`${site}/_serverFn/test`), backend)).status).toBe(
      502,
    );
    expect(f).toHaveBeenCalledTimes(1);
  });
  it("maneja fallos de red sin devolver datos de la solicitud", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("private-request-details")));
    const result = await reenviarFuncion(new Request(`${site}/_serverFn/test`), backend);
    expect(result.status).toBe(502);
    expect(await result.text()).not.toContain("private-request-details");
  });
  it("impide bucles, otros destinos y métodos ajenos a las funciones", async () => {
    const f = vi.fn();
    vi.stubGlobal("fetch", f);
    await expect(
      reenviarFuncion(new Request(`${backend}/_serverFn/test`), backend),
    ).rejects.toThrow();
    await expect(
      reenviarFuncion(new Request(`${site}/_serverFn/test`), "https://example.com"),
    ).rejects.toThrow();
    expect(
      (await reenviarFuncion(new Request(`${site}/_serverFn/test`, { method: "DELETE" }), backend))
        .status,
    ).toBe(405);
    expect(f).not.toHaveBeenCalled();
  });
});
