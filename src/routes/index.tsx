import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { X } from "lucide-react";
import logo from "@/assets/pamara-logo.webp";
import { catalogoPublico } from "@/lib/boutique.functions";
import {
  badge,
  enColeccion,
  linkConsulta,
  type Coleccion,
  type Disponibilidad,
  ETIQUETA,
  type ItemPublico,
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
      { property: "og:description", content: "Mira la vitrina y consulta por WhatsApp en un toque." },
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
  const [ficha, setFicha] = useState<ItemPublico | null>(null);

  const visibles = items.filter(
    (i) => enColeccion(i, col) && (disp === "todo" || i.estado === disp),
  );
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-hero px-6 pb-12 pt-10 text-center text-primary-foreground">
        <img
          src={logo}
          alt="PaMaRa AyN"
          width={1442}
          height={1442}
          fetchPriority="high"
          decoding="async"
          className="mx-auto size-28 object-contain drop-shadow-lg"
        />
        <div className="mx-auto mt-6 h-px w-16 bg-accent/60" />
        <h1 className="mt-6 font-display text-3xl font-light italic leading-tight md:text-4xl">
          Bienvenida a nuestra vitrina
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-primary-foreground/80">
          Fragancias elegidas con cariño para ti. Mira con calma y, si algo te gusta,
          escríbenos y lo conversamos.
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

      <main className="mx-auto max-w-5xl px-4 pb-12 pt-6">
        {visibles.length === 0 ? (
          <p className="py-20 text-center font-display text-xl text-muted-foreground">
            Pronto nuevas piezas en esta colección.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {visibles.map((i) => (
              <li
                key={i.codigo}
                className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5"
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
                <a
                  href={linkConsulta(i)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex min-h-12 items-center justify-center rounded-full bg-success text-center text-sm font-bold text-success-foreground"
                >
                  Me interesa
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>

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
          <a
            href={linkConsulta(ficha)}
            target="_blank"
            rel="noreferrer"
            className="mt-5 block w-full rounded-full bg-success py-5 text-center text-xl font-bold text-success-foreground shadow-lg"
          >
            Consultar por WhatsApp
          </a>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Se abre WhatsApp con tu consulta lista para conversar.
          </p>
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
