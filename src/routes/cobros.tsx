import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DeudaCard } from "@/components/DeudaCard";
import { NubeCard } from "@/components/NubeCard";
import { InstalarCard } from "@/components/InstalarCard";
import { clp, proximaCuota, saldo, useStore } from "@/lib/store";

export const Route = createFileRoute("/cobros")({
  head: () => ({
    meta: [
      { title: "Cobros y Deudores · PaMaRa AyN" },
      { name: "description", content: "Quién debe, cuánto y cuándo paga. Recordatorios por WhatsApp con un toque." },
      { property: "og:title", content: "Cobros y Deudores · PaMaRa AyN" },
      { property: "og:description", content: "Quién debe, cuánto y cuándo paga." },
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
  const pagados = deudas.filter((d) => saldo(d) === 0);
  const total = pend.reduce((a, d) => a + saldo(d), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <h2 className="text-3xl font-semibold">Cobros</h2>
        <p className="text-right">
          <span className="block text-sm text-muted-foreground">Por cobrar</span>
          <span className="text-2xl font-extrabold text-primary">{clp(total)}</span>
        </p>
      </div>
      <NubeCard />
      <InstalarCard />
      {pend.length === 0 && (
        <p className="rounded-3xl bg-card p-6 text-center text-lg text-muted-foreground">
          Nadie te debe 🎉 Cuando fíes algo, anótalo con el micrófono.
        </p>
      )}
      {pend.map((d) => (
        <DeudaCard key={d.id} d={d} />
      ))}
      {pagados.length > 0 && (
        <button onClick={() => setVerPagados((v) => !v)} className="w-full py-3 font-bold text-primary underline">
          {verPagados ? "Ocultar" : "Ver"} pagados ({pagados.length})
        </button>
      )}
      {verPagados && pagados.map((d) => <DeudaCard key={d.id} d={d} />)}
    </div>
  );
}
