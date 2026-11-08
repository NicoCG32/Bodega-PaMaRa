import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, HandCoins, PackagePlus, ShoppingBag, Wallet } from "lucide-react";
import { VoiceCapture } from "@/components/VoiceCapture";
import { BodegaCapture } from "@/components/BodegaCapture";
import { clp, diasHasta, proximaCuota, saldo, useStore } from "@/lib/store";

export const Route = createFileRoute("/bodega/")({
  head: () => ({
    meta: [
      { title: "PaMaRa Vault · ¿Qué pasó recién?" },
      {
        name: "description",
        content: "Anota ventas, fiados y mercadería de PaMaRa AyN en un toque.",
      },
      { property: "og:title", content: "PaMaRa Vault · ¿Qué pasó recién?" },
      { property: "og:description", content: "Anota ventas, fiados y mercadería en un toque." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Paso = null | "venta" | "fiado" | "mercaderia";

const ACCIONES = [
  {
    id: "venta",
    icon: ShoppingBag,
    titulo: "Hice una venta",
    ayuda: "Ej: “Vendí H-17 a María, pagó todo”",
  },
  {
    id: "fiado",
    icon: HandCoins,
    titulo: "Fiado o abono",
    ayuda: "Ej: “Ana llevó M-02, abonó 5 mil”",
  },
  {
    id: "mercaderia",
    icon: PackagePlus,
    titulo: "Llegó mercadería",
    ayuda: "Ej: “H-15, H-15, M-02”",
  },
] as const;

function Index() {
  const { deudas } = useStore();
  const [paso, setPaso] = useState<Paso>(null);
  const pend = deudas.filter((d) => saldo(d) > 0);
  const hoyToca = pend.filter((d) => {
    const c = proximaCuota(d);
    return c && diasHasta(c.fecha) <= 0;
  });

  if (paso) {
    const a = ACCIONES.find((x) => x.id === paso)!;
    return (
      <div className="space-y-5">
        <button
          onClick={() => setPaso(null)}
          className="flex h-14 items-center gap-2 rounded-2xl bg-secondary px-5 text-lg font-bold"
        >
          <ArrowLeft className="size-6" /> Volver
        </button>
        <div>
          <h2 className="text-3xl font-semibold">{a.titulo}</h2>
          <p className="mt-1 text-lg text-muted-foreground">Toca el micrófono y dilo. {a.ayuda}</p>
        </div>
        {paso === "mercaderia" ? <BodegaCapture /> : <VoiceCapture />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold">¿Qué pasó recién?</h2>
      <div className="grid gap-4">
        {ACCIONES.map(({ id, icon: Icon, titulo, ayuda }) => (
          <button
            key={id}
            onClick={() => setPaso(id)}
            className="flex min-h-24 items-center gap-4 rounded-3xl bg-card p-5 text-left shadow-sm ring-1 ring-border active:scale-[0.98]"
          >
            <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Icon className="size-8" />
            </span>
            <span>
              <span className="block text-2xl font-bold">{titulo}</span>
              <span className="block text-base text-muted-foreground">{ayuda}</span>
            </span>
          </button>
        ))}
      </div>
      <Link
        to="/bodega/cobros"
        className="flex min-h-20 items-center justify-between gap-3 rounded-3xl bg-secondary p-5"
      >
        <span className="flex items-center gap-3 text-xl font-bold">
          <Wallet className="size-7 text-primary" />
          {hoyToca.length > 0 ? `Cobrar hoy: ${hoyToca.length}` : "Ver cobros"}
        </span>
        <span className="text-2xl font-extrabold text-primary">
          {clp(pend.reduce((s, d) => s + saldo(d), 0))}
        </span>
      </Link>
    </div>
  );
}
