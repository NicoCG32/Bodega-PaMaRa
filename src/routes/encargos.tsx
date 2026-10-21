import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { actions, normCodigo, useStore } from "@/lib/store";

export const Route = createFileRoute("/encargos")({
  head: () => ({
    meta: [
      { title: "Encargos · PaMaRa AyN" },
      { name: "description", content: "Lista de encargos pendientes y entregados de PaMaRa AyN." },
      { property: "og:title", content: "Encargos · PaMaRa AyN" },
      { property: "og:description", content: "Lista de encargos pendientes y entregados." },
    ],
  }),
  component: Encargos,
});

function Encargos() {
  const { encargos } = useStore();
  const [cliente, setCliente] = useState("");
  const [codigo, setCodigo] = useState("");
  const pend = encargos.filter((e) => !e.entregado);
  const listos = encargos.filter((e) => e.entregado);

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold">Encargos</h2>
      <form
        className="space-y-3 rounded-3xl bg-card p-5 shadow-soft"
        onSubmit={(e) => {
          e.preventDefault();
          if (!cliente.trim()) return;
          actions.addEncargo({ cliente: cliente.trim(), codigo: codigo ? normCodigo(codigo) : "", nota: "" });
          setCliente("");
          setCodigo("");
        }}
      >
        <input value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="¿Para quién?" className="h-14 w-full rounded-2xl border-2 border-input bg-background px-4 text-lg" />
        <input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Código o producto (ej: M-12)" className="h-14 w-full rounded-2xl border-2 border-input bg-background px-4 text-lg" />
        <button className="h-14 w-full rounded-2xl bg-primary text-lg font-bold text-primary-foreground">Agregar encargo</button>
      </form>
      {pend.length === 0 && <p className="text-center text-muted-foreground">No hay encargos pendientes.</p>}
      {[...pend, ...listos].map((e) => (
        <div key={e.id} className={`flex items-center gap-3 rounded-3xl bg-card p-4 shadow-soft ${e.entregado ? "opacity-60" : ""}`}>
          <button
            onClick={() => actions.toggleEncargo(e.id)}
            aria-label="Marcar entregado"
            className={`flex size-14 shrink-0 items-center justify-center rounded-2xl border-2 ${e.entregado ? "border-success bg-success text-success-foreground" : "border-border"}`}
          >
            {e.entregado && <Check className="size-8" />}
          </button>
          <div className="flex-1">
            <p className="text-xl font-bold">{e.cliente}</p>
            <p className="text-muted-foreground">
              {e.codigo || "—"} {e.nota && `· ${e.nota}`}
            </p>
          </div>
          <button onClick={() => confirm("¿Borrar encargo?") && actions.borrarEncargo(e.id)} aria-label="Borrar" className="p-2 text-muted-foreground">
            <Trash2 />
          </button>
        </div>
      ))}
    </div>
  );
}
