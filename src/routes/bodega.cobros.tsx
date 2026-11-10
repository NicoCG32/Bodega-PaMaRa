import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DeudaCard } from "@/components/DeudaCard";
import { AvisosCobro } from "@/components/AvisosCobro";
import { clp, diasHasta, fechaBonita, proximaCuota, saldo, useStore } from "@/lib/store";

export const Route = createFileRoute("/bodega/cobros")({
  head: () => ({
    meta: [
      { title: "Cobros y Deudores · PaMaRa AyN" },
      {
        name: "description",
        content: "Quién debe, cuánto y cuándo paga. Recordatorios por WhatsApp con un toque.",
      },
      { property: "og:title", content: "Cobros y Deudores · PaMaRa AyN" },
      { property: "og:description", content: "Quién debe, cuánto y cuándo paga." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cobros,
});

function Cobros() {
  const { deudas } = useStore();
  const [verPagados, setVerPagados] = useState(false);
  const orden = (f: string | undefined) => f ?? "9999";
  const pend = deudas
    .filter((d) => saldo(d) > 0)
    .sort((a, b) => orden(proximaCuota(a)?.fecha).localeCompare(orden(proximaCuota(b)?.fecha)));
  const urgente = (d: (typeof deudas)[number]) => {
    const f = proximaCuota(d)?.fecha;
    return !f || diasHasta(f) <= 0;
  };
  const hoy = pend.filter(urgente);
  const luego = pend.filter((d) => !urgente(d));
  const pagados = deudas.filter((d) => saldo(d) === 0);
  const total = pend.reduce((a, d) => a + saldo(d), 0);
  const mes = new Date().toISOString().slice(0, 7);
  const cobradoMes = deudas.reduce(
    (a, d) =>
      a + d.abonos.filter((b) => b.fecha.slice(0, 7) === mes).reduce((x, b) => x + b.monto, 0),
    0,
  );
  const fechaSaldada = (d: (typeof deudas)[number]) =>
    d.abonos
      .map((b) => b.fecha.slice(0, 10))
      .sort()
      .at(-1) ?? d.creada.slice(0, 10);
  const pagadosOrden = [...pagados].sort((a, b) => fechaSaldada(b).localeCompare(fechaSaldada(a)));

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold">Cobros</h2>
      <AvisosCobro />
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-card p-4 shadow-soft">
          <p className="text-sm font-bold text-muted-foreground">🟢 Cobrado este mes</p>
          <p className="text-2xl font-extrabold text-success">{clp(cobradoMes)}</p>
        </div>
        <div className="rounded-3xl bg-card p-4 shadow-soft">
          <p className="text-sm font-bold text-muted-foreground">🟡 Por cobrar</p>
          <p className="text-2xl font-extrabold text-primary">{clp(total)}</p>
        </div>
      </div>
      {pend.length === 0 && (
        <p className="rounded-3xl bg-card p-6 text-center text-lg text-muted-foreground">
          Nadie te debe 🎉 Cuando fíes algo, anótalo con el micrófono.
        </p>
      )}
      {hoy.length > 0 && (
        <section className="space-y-3">
          <h3 className="rounded-2xl bg-destructive/10 px-4 py-3 text-xl font-bold text-destructive">
            🔴 Cobrar hoy ({hoy.length})
          </h3>
          {hoy.map((d) => (
            <DeudaCard key={d.id} d={d} />
          ))}
        </section>
      )}
      {luego.length > 0 && (
        <section className="space-y-3">
          <h3 className="rounded-2xl bg-secondary px-4 py-3 text-xl font-bold">
            🗓️ Más adelante ({luego.length})
          </h3>
          {luego.map((d) => (
            <DeudaCard key={d.id} d={d} />
          ))}
        </section>
      )}
      {pagados.length > 0 && (
        <button
          onClick={() => setVerPagados((v) => !v)}
          className="h-14 w-full rounded-2xl bg-secondary text-lg font-bold"
        >
          {verPagados ? "Ocultar cuentas pagadas" : `✅ Ver cuentas pagadas (${pagados.length})`}
        </button>
      )}
      {verPagados && (
        <ul className="space-y-2">
          {pagadosOrden.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-soft"
            >
              <div>
                <p className="text-lg font-bold">{d.cliente}</p>
                <p className="text-muted-foreground">
                  {d.codigo} · {clp(d.total)}
                </p>
              </div>
              <p className="text-right text-sm">
                <span className="block font-bold text-success">Pagó todo ✓</span>
                <span className="text-muted-foreground">{fechaBonita(fechaSaldada(d))}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
