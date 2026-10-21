import { createFileRoute, Link } from "@tanstack/react-router";
import { VoiceCapture } from "@/components/VoiceCapture";
import { DeudaCard } from "@/components/DeudaCard";
import { clp, diasHasta, proximaCuota, saldo, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PaMaRa AyN · Anotar por voz" },
      { name: "description", content: "Anota ventas, fiados y encargos de PaMaRa AyN hablando al teléfono." },
      { property: "og:title", content: "PaMaRa AyN · Anotar por voz" },
      { property: "og:description", content: "Anota ventas, fiados y encargos hablando al teléfono." },
    ],
  }),
  component: Index,
});

function Index() {
  const { deudas } = useStore();
  const pend = deudas.filter((d) => saldo(d) > 0);
  const total = pend.reduce((a, d) => a + saldo(d), 0);
  const hoyToca = pend.filter((d) => {
    const c = proximaCuota(d);
    return c && diasHasta(c.fecha) <= 0;
  });

  return (
    <div className="space-y-6">
      <VoiceCapture />
      <Link to="/cobros" className="flex items-center justify-between rounded-3xl bg-secondary p-5">
        <span className="text-lg">Te deben en total</span>
        <span className="text-3xl font-extrabold text-primary">{clp(total)}</span>
      </Link>
      {hoyToca.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">🔔 Toca cobrar hoy</h2>
          {hoyToca.map((d) => (
            <DeudaCard key={d.id} d={d} />
          ))}
        </section>
      )}
    </div>
  );
}
