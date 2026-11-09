import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, MessageCircle, Mic, PackageCheck, Plus, Trash2, Undo2 } from "lucide-react";
import { VoiceCapture } from "@/components/VoiceCapture";
import {
  actions,
  avisoEncargoLink,
  clp,
  normCodigo,
  precioVenta,
  useStore,
  type Encargo,
} from "@/lib/store";

export const Route = createFileRoute("/bodega/encargos")({
  head: () => ({
    meta: [
      { title: "Encargos · PaMaRa AyN" },
      { name: "description", content: "Encargos por llegar y listos para entregar de PaMaRa AyN." },
      { property: "og:title", content: "Encargos · PaMaRa AyN" },
      { property: "og:description", content: "Encargos por llegar y listos para entregar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Encargos,
});

type Pestana = "pendientes" | "listos";
type Modo = null | "voz" | "escribir";

function Encargos() {
  const { encargos, productos, telefonos } = useStore();
  const [tab, setTab] = useState<Pestana>("pendientes");
  const [modo, setModo] = useState<Modo>(null);
  const pend = encargos.filter((e) => !e.entregado && !e.llego);
  const listos = encargos.filter((e) => !e.entregado && e.llego);
  const entregados = encargos.filter((e) => e.entregado).slice(0, 10);
  const lista = tab === "pendientes" ? pend : listos;

  const nombreProd = (e: Encargo) => {
    const p = productos.find((x) => x.codigo === e.codigo);
    const n = p?.inspiracion || p?.nombre;
    return [e.codigo, n].filter(Boolean).join(" · ");
  };

  if (modo) {
    return (
      <div className="space-y-5">
        <button
          onClick={() => setModo(null)}
          className="flex h-14 items-center gap-2 rounded-2xl bg-secondary px-5 text-lg font-bold"
        >
          <ArrowLeft className="size-6" /> Volver
        </button>
        <h2 className="text-3xl font-semibold">Nuevo encargo</h2>
        {modo === "voz" ? (
          <>
            <p className="text-lg text-muted-foreground">
              Ej: “Encargo de Carmen, M-12, en 17 mil”
            </p>
            <VoiceCapture />
          </>
        ) : (
          <FormEncargo onListo={() => setModo(null)} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-semibold">Encargos</h2>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setModo("voz")}
          className="flex min-h-20 items-center justify-center gap-2 rounded-3xl bg-primary px-3 text-lg font-bold text-primary-foreground active:scale-[0.98]"
        >
          <Mic className="size-7" /> Dictar encargo
        </button>
        <button
          onClick={() => setModo("escribir")}
          className="flex min-h-20 items-center justify-center gap-2 rounded-3xl bg-card px-3 text-lg font-bold ring-2 ring-border active:scale-[0.98]"
        >
          <Plus className="size-7" /> Escribirlo
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-3xl bg-secondary p-1.5" role="tablist">
        {(
          [
            ["pendientes", "⏳ Por llegar", pend.length],
            ["listos", "✅ Para entregar", listos.length],
          ] as const
        ).map(([id, label, n]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`min-h-14 rounded-2xl px-2 text-base font-bold ${tab === id ? "bg-card shadow-sm" : "text-muted-foreground"}`}
          >
            {label} ({n})
          </button>
        ))}
      </div>

      {lista.length === 0 && (
        <p className="rounded-3xl bg-card p-6 text-center text-lg text-muted-foreground">
          {tab === "pendientes"
            ? "No hay encargos esperando. 🌸"
            : "Nada para entregar todavía. Cuando llegue un encargo, márcalo en «Por llegar»."}
        </p>
      )}

      {lista.map((e) => {
        const prod = nombreProd(e);
        return (
          <article key={e.id} className="space-y-4 rounded-3xl bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-2xl font-bold">{e.cliente}</p>
                <p className="text-lg text-muted-foreground">{prod || "Sin producto"}</p>
                {e.nota && <p className="text-base text-muted-foreground">{e.nota}</p>}
              </div>
              {e.precio ? (
                <p className="shrink-0 text-2xl font-extrabold text-primary">{clp(e.precio)}</p>
              ) : null}
            </div>

            {tab === "pendientes" ? (
              <button
                onClick={() => {
                  actions.marcarLlego(e.id);
                  setTab("listos");
                }}
                className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-bold text-primary-foreground"
              >
                <PackageCheck className="size-6" /> Ya llegó
              </button>
            ) : (
              <>
                <a
                  href={avisoEncargoLink(telefonos[e.cliente.toLowerCase()], e.cliente, prod)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-success text-lg font-bold text-success-foreground"
                >
                  <MessageCircle className="size-6" /> Avisar por WhatsApp que llegó
                </a>
                <button
                  onClick={() => actions.toggleEncargo(e.id)}
                  className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl border-2 border-success text-lg font-bold"
                >
                  <Check className="size-6" /> Entregado y cobrado
                </button>
              </>
            )}

            <div className="flex justify-between text-base">
              {tab === "listos" ? (
                <button
                  onClick={() => actions.marcarLlego(e.id, false)}
                  className="flex items-center gap-1 p-2 text-muted-foreground"
                >
                  <Undo2 className="size-5" /> Aún no llega
                </button>
              ) : (
                <span />
              )}
              <button
                onClick={() => confirm(`¿Borrar el encargo de ${e.cliente}?`) && actions.borrarEncargo(e.id)}
                className="flex items-center gap-1 p-2 text-muted-foreground"
              >
                <Trash2 className="size-5" /> Borrar
              </button>
            </div>
          </article>
        );
      })}

      {tab === "listos" && entregados.length > 0 && (
        <details className="rounded-3xl bg-secondary p-4">
          <summary className="text-lg font-bold">Ya entregados ({entregados.length})</summary>
          <ul className="mt-3 space-y-2">
            {entregados.map((e) => (
              <li key={e.id} className="flex items-center justify-between rounded-2xl bg-card p-3">
                <span>
                  <b>{e.cliente}</b> · {e.codigo || "—"}
                </span>
                <button
                  onClick={() => actions.toggleEncargo(e.id)}
                  className="p-2 text-sm text-muted-foreground underline"
                >
                  Deshacer
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function FormEncargo({ onListo }: { onListo: () => void }) {
  const { productos, precios } = useStore();
  const [cliente, setCliente] = useState("");
  const [codigo, setCodigo] = useState("");
  const [precio, setPrecio] = useState("");
  const c = codigo ? normCodigo(codigo) : "";
  const prod = productos.find((x) => x.codigo === c);
  const sugerido = prod ? precioVenta({ ...prod, stock: 0 }, precios).precio : undefined;

  return (
    <form
      className="space-y-4 rounded-3xl bg-card p-5 shadow-soft"
      onSubmit={(e) => {
        e.preventDefault();
        if (!cliente.trim()) return;
        const p = Number(precio.replace(/\D/g, ""));
        actions.addEncargo({ cliente: cliente.trim(), codigo: c, nota: "", precio: p || sugerido });
        onListo();
      }}
    >
      <label className="block text-lg font-bold">
        ¿Para quién?
        <input
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          placeholder="Nombre de la clienta"
          className="mt-1 h-14 w-full rounded-2xl border-2 border-input bg-background px-4 text-lg font-normal"
        />
      </label>
      <label className="block text-lg font-bold">
        ¿Qué perfume?
        <input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Ej: M-12"
          className="mt-1 h-14 w-full rounded-2xl border-2 border-input bg-background px-4 text-lg font-normal"
        />
        {prod && (
          <span className="mt-1 block text-base font-normal text-muted-foreground">
            {prod.inspiracion || prod.nombre}
          </span>
        )}
      </label>
      <label className="block text-lg font-bold">
        Precio acordado
        <input
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          inputMode="numeric"
          placeholder={sugerido ? clp(sugerido) : "Ej: 17000"}
          className="mt-1 h-14 w-full rounded-2xl border-2 border-input bg-background px-4 text-lg font-normal"
        />
      </label>
      <button className="h-16 w-full rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
        Guardar encargo
      </button>
    </form>
  );
}
