import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import logo from "@/assets/pamara-logo.webp";
import { catalogoPublico } from "@/lib/boutique.functions";
import {
  badge,
  COMUNAS,
  enColeccion,
  linkPedido,
  totalBolsa,
  type Coleccion,
  type Disponibilidad,
  ETIQUETA,
  type ItemPublico,
  type Linea,
} from "@/lib/boutique";
import { clp } from "@/lib/store";

// Never break the storefront on a network hiccup: show empty and retry soon.
const catalogoQuery = queryOptions({
  queryKey: ["boutique"],
  queryFn: async (): Promise<ItemPublico[]> => {
    try {
      return await catalogoPublico();
    } catch (e) {
      console.warn("Catálogo no disponible", e);
      return [];
    }
  },
  staleTime: 30_000,
  refetchInterval: (q) => (q.state.data?.length ? false : 15_000),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PaMaRa Boutique · Perfumes, cosmética y accesorios" },
      {
        name: "description",
        content:
          "Perfumes de inspiración, cosmética y accesorios con entrega en La Serena, Coquimbo y Calama. Pide por WhatsApp.",
      },
      { property: "og:title", content: "PaMaRa Boutique" },
      { property: "og:description", content: "Arma tu pedido y envíalo por WhatsApp en un toque." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogoQuery),
  component: Boutique,
});

const DISPONIBLE: { id: Disponibilidad; label: string }[] = [
  { id: "todo", label: "Todo" },
  { id: "stock", label: "📦 Entrega hoy" },
  { id: "encargo", label: "✨ A pedido" },
  { id: "remate", label: "🔥 Liquidación" },
];

const accion = (i: ItemPublico) =>
  i.estado === "encargo" ? "Encargar" : i.estado === "remate" ? "Aprovechar" : "Agregar";

const COLECCIONES: { id: Coleccion; label: string }[] = [
  { id: "todo", label: "Todo" },
  { id: "mujer", label: "Mujer" },
  { id: "hombre", label: "Hombre" },
  { id: "cosmetica", label: "Cosmética" },
  { id: "accesorios", label: "Accesorios" },
];

function Boutique() {
  const { data: items } = useSuspenseQuery(catalogoQuery);
  const [col, setCol] = useState<Coleccion>("todo");
  const [disp, setDisp] = useState<Disponibilidad>("todo");
  const [bolsa, setBolsa] = useState<Linea[]>([]);
  const [ficha, setFicha] = useState<ItemPublico | null>(null);
  const [abierta, setAbierta] = useState(false);
  const [comuna, setComuna] = useState<string>(COMUNAS[0]);

  const visibles = items.filter(
    (i) => enColeccion(i, col) && (disp === "todo" || i.estado === disp),
  );
  const unidades = bolsa.reduce((a, l) => a + l.cantidad, 0);

  const cambiar = (item: ItemPublico, d: number) =>
    setBolsa((b) => {
      const l = b.find((x) => x.item.codigo === item.codigo);
      if (!l) return d > 0 ? [...b, { item, cantidad: 1 }] : b;
      const tope = item.estado === "encargo" ? 20 : item.stock;
      const cantidad = Math.min(tope, l.cantidad + d);
      return cantidad <= 0
        ? b.filter((x) => x !== l)
        : b.map((x) => (x === l ? { ...x, cantidad } : x));
    });

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-hero px-5 pb-8 pt-6 text-center text-primary-foreground">
        <div className="mx-auto flex max-w-5xl items-start justify-between">
          <span className="size-10" />
          <img
            src={logo}
            alt="PaMaRa AyN"
            width={1442}
            height={1442}
            fetchPriority="high"
            decoding="async"
            className="size-24 shrink-0 object-contain"
          />
          <span className="size-10" />
        </div>
        <p className="mt-3 font-display text-2xl italic">Boutique</p>
        <p className="mt-1 text-xs uppercase tracking-[0.35em] text-accent">
          Perfumería · Cosmética · Accesorios
        </p>
      </header>

      <nav className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <ul className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-3">
          {COLECCIONES.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setCol(c.id)}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  col === c.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                }`}
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
        <ul className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 pb-3">
          {DISPONIBLE.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setDisp(c.id)}
                className={`min-h-11 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition ${
                  disp === c.id
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <main className="mx-auto max-w-5xl px-4 pb-32 pt-6">
        {visibles.length === 0 ? (
          <p className="py-20 text-center font-display text-xl text-muted-foreground">
            Pronto nuevas piezas en esta colección.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {visibles.map((i) => (
              <li
                key={i.codigo}
                className="flex flex-col rounded-2xl border border-border bg-card p-4"
              >
                <button onClick={() => setFicha(i)} className="flex-1 text-left">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${i.estado === "remate" ? "bg-primary text-primary-foreground" : i.estado === "encargo" ? "bg-secondary text-muted-foreground" : "bg-accent/30 text-foreground"}`}
                  >
                    {badge(i)}
                  </span>
                  {i.perfume && (
                    <p className="mt-3 text-xs tracking-widest text-muted-foreground">{i.codigo}</p>
                  )}
                  <h3 className="mt-1 font-display text-xl leading-tight">
                    {i.inspiracion || i.nombre}
                  </h3>
                  {i.version && <p className="text-sm italic text-muted-foreground">{i.version}</p>}
                  <p className="mt-2 text-xl font-extrabold text-primary">
                    {i.precio ? clp(i.precio) : "Consultar precio"}
                  </p>
                </button>
                <button
                  onClick={() => cambiar(i, 1)}
                  className="mt-3 min-h-12 rounded-full bg-primary text-sm font-bold text-primary-foreground"
                >
                  + {accion(i)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      {unidades > 0 && !abierta && (
        <button
          onClick={() => setAbierta(true)}
          className="fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-md items-center justify-between rounded-full bg-hero px-6 py-4 font-bold text-primary-foreground shadow-xl"
        >
          <span className="flex items-center gap-2">
            <ShoppingBag className="size-5" /> Mi bolsa ({unidades})
          </span>
          <span>{clp(totalBolsa(bolsa))}</span>
        </button>
      )}

      {ficha && (
        <Hoja onClose={() => setFicha(null)}>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            {ETIQUETA[ficha.estado]}
          </span>
          {ficha.perfume && (
            <p className="mt-2 text-sm tracking-widest text-muted-foreground">{ficha.codigo}</p>
          )}
          <h2 className="font-display text-3xl">{ficha.inspiracion || ficha.nombre}</h2>
          {ficha.inspiracion && (
            <p className="text-muted-foreground">Inspiración de {ficha.nombre}</p>
          )}
          {ficha.version && (
            <p className="mt-2">
              <b>Versión:</b> {ficha.version}
            </p>
          )}
          {ficha.categoria && (
            <p className="mt-1">
              <b>{ficha.perfume ? "Notas" : "Tipo"}:</b> {ficha.categoria}
            </p>
          )}
          <p className="mt-4 text-2xl font-bold text-primary">
            {ficha.precio ? clp(ficha.precio) : "Consultar precio"}
          </p>
          <button
            onClick={() => {
              cambiar(ficha, 1);
              setFicha(null);
            }}
            className="mt-5 w-full rounded-full bg-primary py-4 text-lg font-bold text-primary-foreground"
          >
            {accion(ficha)} · {ficha.precio ? clp(ficha.precio) : "precio a confirmar"}
          </button>
        </Hoja>
      )}

      {abierta && (
        <Hoja onClose={() => setAbierta(false)}>
          <h2 className="font-display text-3xl">Mi bolsa</h2>
          <ul className="mt-4 divide-y divide-border">
            {bolsa.map((l) => (
              <li key={l.item.codigo} className="flex items-center gap-3 py-3">
                <div className="flex-1">
                  <p className="font-semibold">{l.item.inspiracion || l.item.nombre}</p>
                  <p className="text-sm text-muted-foreground">
                    {badge(l.item)} ·{" "}
                    {l.item.precio ? clp(l.item.precio * l.cantidad) : "Precio a confirmar"}
                  </p>
                </div>
                <button
                  aria-label="Quitar uno"
                  onClick={() => cambiar(l.item, -1)}
                  className="flex size-12 items-center justify-center rounded-full border border-border"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-6 text-center font-bold">{l.cantidad}</span>
                <button
                  aria-label="Agregar uno"
                  onClick={() => cambiar(l.item, 1)}
                  className="flex size-12 items-center justify-center rounded-full border border-border"
                >
                  <Plus className="size-4" />
                </button>
              </li>
            ))}
          </ul>
          <label className="mt-4 block text-sm font-semibold">Comuna de entrega</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {COMUNAS.map((c) => (
              <button
                key={c}
                onClick={() => setComuna(c)}
                className={`min-h-12 rounded-full border text-sm font-semibold ${comuna === c ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="mt-5 flex justify-between text-xl font-bold">
            <span>Total</span>
            <span className="text-primary">{clp(totalBolsa(bolsa))}</span>
          </div>
          <a
            href={linkPedido(bolsa, comuna)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 block w-full rounded-full bg-success py-5 text-center text-xl font-bold text-success-foreground shadow-lg"
          >
            Pedir por WhatsApp
          </a>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Se abre WhatsApp con tu pedido listo. Solo tienes que enviarlo.
          </p>
          <a hidden>
          </a>
        </Hoja>
      )}
    </div>
  );
}

function Hoja({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/40"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-background p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-secondary"
        >
          <X className="size-4" />
        </button>
        {children}
      </div>
    </div>
  );
}
