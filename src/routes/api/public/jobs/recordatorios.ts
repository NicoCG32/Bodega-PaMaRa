import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/firebase_messaging";

type Cuota = { id: string; monto: number; fecha: string; pagada: boolean };
type Deuda = {
  cliente: string;
  total: number;
  abonos: { monto: number; fecha: string }[];
  cuotas: Cuota[];
};
type BackupData = { deudas?: Deuda[] };

function hoyChile() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" });
}

function saldo(d: Deuda) {
  return Math.max(0, d.total - (d.abonos ?? []).reduce((a, b) => a + b.monto, 0));
}

function proximaCuota(d: Deuda): Cuota | null {
  return [...(d.cuotas ?? [])].filter((c) => !c.pagada).sort((a, b) => a.fecha.localeCompare(b.fecha))[0] ?? null;
}

const clp = (n: number) => "$" + Math.round(n).toLocaleString("es-CL");

async function enviarPush(token: string, titulo: string, cuerpo: string) {
  const res = await fetch(`${GATEWAY_URL}/v1/projects/_/messages:send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env["LOVABLE_API_KEY"]}`,
      "X-Connection-Api-Key": process.env["FIREBASE_MESSAGING_API_KEY"] ?? "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        token,
        notification: { title: titulo, body: cuerpo },
        data: { path: "/cobros" },
      },
    }),
  });
  return res;
}

export const Route = createFileRoute("/api/public/jobs/recordatorios")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;

        if (!process.env["LOVABLE_API_KEY"] || !process.env["FIREBASE_MESSAGING_API_KEY"]) {
          return Response.json({ ok: false, error: "Faltan claves del servicio de avisos" }, { status: 500 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const [{ data: backups }, { data: tokens }] = await Promise.all([
          supabaseAdmin.from("backups").select("user_id, data"),
          supabaseAdmin.from("push_tokens").select("user_id, token"),
        ]);

        const hoy = hoyChile();
        const porUsuario = new Map<string, string[]>();
        for (const b of backups ?? []) {
          const deudas = ((b.data as BackupData) ?? {}).deudas ?? [];
          const pendientes = deudas
            .filter((d) => saldo(d) > 0)
            .map((d) => ({ d, c: proximaCuota(d) }))
            .filter((x): x is { d: Deuda; c: Cuota } => !!x.c && x.c.fecha <= hoy);
          if (pendientes.length) {
            porUsuario.set(
              b.user_id,
              pendientes.map(({ d, c }) => `${d.cliente}: ${clp(Math.min(c.monto, saldo(d)))}`),
            );
          }
        }

        let enviados = 0;
        const borrar: string[] = [];
        for (const t of tokens ?? []) {
          const lineas = porUsuario.get(t.user_id);
          if (!lineas) continue;
          const res = await enviarPush(t.token, "PaMaRa AyN · Toca cobrar 🔔", lineas.join(" · "));
          if (res.ok) {
            enviados++;
          } else if (res.status === 404 || res.status === 400) {
            borrar.push(t.token); // token viejo: no reintentar
          } else {
            console.error(`FCM falló [${res.status}]: ${await res.text()}`);
          }
        }
        if (borrar.length) {
          await supabaseAdmin.from("push_tokens").delete().in("token", borrar);
        }

        return Response.json({ ok: true, enviados, usuariosConCobros: porUsuario.size });
      },
    },
  },
});
