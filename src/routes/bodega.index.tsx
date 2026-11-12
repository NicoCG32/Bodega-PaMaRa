import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, HandCoins, PackagePlus, ShoppingBag, Wallet } from "lucide-react";
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
    <div>
      <div className="bodega-intro">
        <p className="eyebrow">El día a día de tu negocio</p>
        <h1>Hola, ¿qué pasó hoy?</h1>
        <p>Tu negocio en orden, un movimiento a la vez.</p>
      </div>
      <div className="bodega-actions">
        {ACCIONES.map(({ id, icon: Icon, titulo, ayuda }) => (
          <button key={id} onClick={() => setPaso(id)} className="bodega-action">
            <span className="bodega-action-icon">
              <Icon />
            </span>
            <span>
              <strong>{titulo}</strong>
              <small>{ayuda}</small>
            </span>
            <ArrowUpRight className="action-arrow" aria-hidden="true" />
          </button>
        ))}
      </div>
      <Link to="/bodega/cobros" className="bodega-balance">
        <span className="balance-label">
          <Wallet />
          <span>
            <span className="eyebrow block mb-2">Tus cuentas, a mano</span>
            {hoyToca.length > 0 ? "Cobrar hoy: " + hoyToca.length : "Ver cobros pendientes"}
          </span>
        </span>
        <strong>{clp(pend.reduce((s, d) => s + saldo(d), 0))}</strong>
      </Link>
    </div>
  );
}
