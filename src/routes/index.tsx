import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import logo from "@/assets/pamara-logo.webp";
import { catalogoPublico } from "@/lib/boutique.functions";
import {
  badge,
  enColeccion,
  linkConsulta,
  linkPedido,
  totalBolsa,
  COMUNAS,
  type Linea,
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
  const [bolsa, setBolsa] = useState<Linea[]>([]);
  const [verBolsa, setVerBolsa] = useState(false);
  const [comuna, setComuna] = useState<string>(COMUNAS[0]);
  const cantidad = (c: string) => bolsa.find((l) => l.item.codigo === c)?.cantidad ?? 0;
  const cambiar = (item: ItemPublico, d: number) =>
    setBolsa((b) => {
      const actual = b.find((l) => l.item.codigo === item.codigo);
      if (!actual) return d > 0 ? [...b, { item, cantidad: 1 }] : b;
      const n = actual.cantidad + d;
      return n <= 0
        ? b.filter((l) => l !== actual)
        : b.map((l) => (l === actual ? { ...l, cantidad: n } : l));
    });
  const unidades = bolsa.reduce((a, l) => a + l.cantidad, 0);

  const visibles = items.filter(
    (i) => enColeccion(i, col) && (disp === "todo" || i.estado === disp),
  );
  return (
    <div className={`min-h-screen bg-background ${unidades ? "pb-24" : ""}`}>
      <header className="flex min-h-[60svh] flex-col items-center justify-center bg-hero px-6 py-12 text-center text-primary-foreground md:min-h-0 md:py-16">
        <img
          src={logo}
          alt="PaMaRa AyN"
          width={1442}
          height={1442}
          fetchPriority="high"
          decoding="async"
          className="mx-auto block size-44 object-contain drop-shadow-lg sm:size-52 md:size-56"
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
                  {i.foto && (
                    <img
                      src={i.foto}
                      alt={i.nombre}
                      loading="lazy"
                      className="mb-3 aspect-square w-full rounded-xl object-cover"
                    />
                  )}
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
                <Agregar n={cantidad(i.codigo)} onCambio={(d) => cambiar(i, d)} />
                <a
                  href={linkConsulta(i)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 text-center text-xs font-semibold text-muted-foreground underline"
                >
                  Preguntar solo por este
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>

      {ficha && (
        <Hoja onClose={() => setFicha(null)}>
          {ficha.foto && (
            <img src={ficha.foto} alt={ficha.nombre} className="mb-4 w-full rounded-2xl object-cover" />
          )}
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
          <div className="mt-5">
            <Agregar n={cantidad(ficha.codigo)} onCambio={(d) => cambiar(ficha, d)} grande />
          </div>
          <a
            href={linkConsulta(ficha)}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block w-full rounded-full border-2 border-success py-4 text-center text-lg font-bold text-success"
          >
            Consultar solo este por WhatsApp
          </a>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Se abre WhatsApp con tu consulta lista para conversar.
          </p>
        </Hoja>
      )}

      {unidades > 0 && !verBolsa && (
        <button
          onClick={() => setVerBolsa(true)}
          className="fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-md items-center justify-between rounded-full bg-primary px-6 py-4 text-primary-foreground shadow-xl"
        >
          <span className="flex items-center gap-2 font-semibold">
            <ShoppingBag className="size-5" /> {unidades} {unidades === 1 ? "producto" : "productos"} · {clp(totalBolsa(bolsa))}
          </span>
          <span className="font-bold">Ver mi lista</span>
        </button>
      )}

      {verBolsa && (
        <Hoja onClose={() => setVerBolsa(false)}>
          <h2 className="font-display text-3xl">Mi lista</h2>
          {bolsa.length === 0 ? (
            <p className="mt-6 text-muted-foreground">Tu lista está vacía.</p>
          ) : (
            <>
              <ul className="mt-4 divide-y divide-border">
                {bolsa.map((l) => (
                  <li key={l.item.codigo} className="flex items-center gap-3 py-3">
                    {l.item.foto && (
                      <img src={l.item.foto} alt="" className="size-14 rounded-lg object-cover" />
                    )}
                    <div className="min-w-0 flex-1">
                      {l.item.perfume && (
                        <p className="text-xs tracking-widest text-muted-foreground">{l.item.codigo}</p>
                      )}
                      <p className="truncate font-semibold">{l.item.inspiracion || l.item.nombre}</p>
                      <p className="text-sm text-primary">
                        {l.item.precio ? clp(l.item.precio * l.cantidad) : "Precio a confirmar"}
                      </p>
                    </div>
                    <Agregar n={l.cantidad} onCambio={(d) => cambiar(l.item, d)} compacto />
                  </li>
                ))}
              </ul>
              <p className="mt-4 flex justify-between text-xl font-bold">
                <span>Total</span> <span>{clp(totalBolsa(bolsa))}</span>
              </p>
              <p className="mt-5 text-sm font-semibold">¿Dónde te lo entregamos?</p>
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
              <a
                href={linkPedido(bolsa, comuna)}
                target="_blank"
                rel="noreferrer"
                className="mt-6 block w-full rounded-full bg-success py-5 text-center text-xl font-bold text-success-foreground shadow-lg"
              >
                Enviar mi lista por WhatsApp
              </a>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Se abre WhatsApp con tu lista lista. Ahí coordinamos pago y entrega.
              </p>
            </>
          )}
        </Hoja>
      )}
    </div>
  );
}

function Agregar({
  n,
  onCambio,
  grande,
  compacto,
}: {
  n: number;
  onCambio: (d: number) => void;
  grande?: boolean;
  compacto?: boolean;
}) {
  const alto = grande ? "min-h-14 text-lg" : "min-h-12 text-sm";
  if (n === 0 && !compacto)
    return (
      <button
        onClick={() => onCambio(1)}
        className={`mt-3 flex w-full items-center justify-center gap-1 rounded-full bg-success font-bold text-success-foreground ${alto}`}
      >
        <Plus className="size-4" /> Agregar a mi lista
      </button>
    );
  return (
    <div className={`${compacto ? "" : "mt-3 w-full"} flex items-center justify-between gap-2 rounded-full bg-secondary p-1`}>
      <button aria-label="Quitar uno" onClick={() => onCambio(-1)} className="flex size-10 items-center justify-center rounded-full bg-background">
        <Minus className="size-4" />
      </button>
      <span className="min-w-6 text-center font-bold">{n}</span>
      <button aria-label="Agregar uno" onClick={() => onCambio(1)} className="flex size-10 items-center justify-center rounded-full bg-success text-success-foreground">
        <Plus className="size-4" />
      </button>
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
