import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Search } from "lucide-react";
import { actions, normCodigo, useStore } from "@/lib/store";

export const Route = createFileRoute("/catalogo")({
  head: () => ({
    meta: [
      { title: "Catálogo y Stock · PaMaRa AyN" },
      { name: "description", content: "Perfumes por código H, M y T: qué hay en stock y qué es a encargo." },
      { property: "og:title", content: "Catálogo y Stock · PaMaRa AyN" },
      { property: "og:description", content: "Perfumes por código: en stock o a encargo." },
    ],
  }),
  component: Catalogo,
});

const filtros = [
  { k: "", label: "Todos" },
  { k: "H", label: "Hombre" },
  { k: "M", label: "Mujer" },
  { k: "T", label: "Juvenil" },
];

function Catalogo() {
  const { productos } = useStore();
  const [q, setQ] = useState("");
  const [f, setF] = useState("");
  const [nombre, setNombre] = useState("");
  const lista = productos
    .filter((p) => (!f || p.codigo.startsWith(f + "-")) && (p.codigo + p.nombre).toLowerCase().includes(q.toLowerCase().replace(/\s/g, "")))
    .sort((a, b) => a.codigo.localeCompare(b.codigo, "es", { numeric: true }));

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold">Catálogo</h2>
      <button
        onClick={() => {
          const disp = [...productos]
            .filter((p) => p.stock > 0 && (!f || p.codigo.startsWith(f + "-")))
            .sort((a, b) => a.codigo.localeCompare(b.codigo, "es", { numeric: true }));
          if (disp.length === 0) return alert("No hay perfumes con stock para enviar.");
          const lineas = disp.map((p) => `• ${p.codigo}${p.nombre ? ` ${p.nombre}` : ""}`).join("\n");
          const msg = `¡Hola! 🌸 Te saluda PaMaRa AyN. Tengo disponibles para entrega inmediata:\n${lineas}\n\n¿Te interesa alguno? 💛`;
          window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
        }}
        className="h-14 w-full rounded-2xl bg-success text-lg font-bold text-success-foreground"
      >
        📲 Enviar disponibles por WhatsApp
      </button>
      <label className="flex h-14 items-center gap-2 rounded-2xl border-2 border-input bg-card px-4">
        <Search className="text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar código, ej: H-05" className="h-full flex-1 bg-transparent text-lg outline-none" />
      </label>
      <div className="flex gap-2 overflow-x-auto">
        {filtros.map((x) => (
          <button key={x.k} onClick={() => setF(x.k)} className={`rounded-full px-5 py-2 font-bold ${f === x.k ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
            {x.label}
          </button>
        ))}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const c = normCodigo(q);
          if (!/^[HMT]-\d+$/.test(c)) return;
          actions.upsertProducto({ codigo: c, nombre: nombre.trim(), stock: 0 });
          setNombre("");
          setQ("");
        }}
      >
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre (opcional)" className="h-12 flex-1 rounded-2xl border-2 border-input bg-card px-4" />
        <button className="h-12 rounded-2xl bg-primary px-4 font-bold text-primary-foreground">+ Agregar {normCodigo(q) || "código"}</button>
      </form>
      {lista.length === 0 && <p className="text-center text-muted-foreground">Escribe un código arriba (H-, M- o T-) para agregarlo.</p>}
      <ul className="space-y-3">
        {lista.map((p) => (
          <li key={p.codigo} className="flex items-center gap-3 rounded-3xl bg-card p-4 shadow-soft">
            <div className="flex-1">
              <p className="text-2xl font-extrabold">{p.codigo}</p>
              {p.nombre && <p className="text-muted-foreground">{p.nombre}</p>}
              <span className={`mt-1 inline-block rounded-full px-3 py-0.5 text-sm font-bold ${p.stock > 0 ? "bg-success text-success-foreground" : "bg-accent text-accent-foreground"}`}>
                {p.stock > 0 ? `En stock: ${p.stock}` : "A encargo"}
              </span>
            </div>
            <button onClick={() => actions.ajustarStock(p.codigo, -1)} aria-label="Quitar uno" className="flex size-14 items-center justify-center rounded-2xl bg-secondary">
              <Minus />
            </button>
            <button onClick={() => actions.ajustarStock(p.codigo, 1)} aria-label="Sumar uno" className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Plus />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
