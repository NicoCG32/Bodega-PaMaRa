import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Flower2,
  Heart,
  Layers3,
  Leaf,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  Link2,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import logo from "@/assets/pamara-logo.webp";
import monograma from "@/assets/pamara-monograma.webp";
import { ProductVisual } from "@/components/ProductVisual";
import { catalogoPublico, registrarFicha } from "@/lib/boutique.functions";
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
      { title: "PaMaRa AyN · Tu esencia, tu sello" },
      {
        name: "description",
        content:
          "Descubre perfumes de inspiración, cosmética y accesorios de PaMaRa AyN. Prepara tu lista y conversemos por WhatsApp. La Serena, Coquimbo y Calama.",
      },
      { property: "og:title", content: "PaMaRa AyN · Tu esencia, tu sello" },
      {
        property: "og:description",
        content: "Fragancias elegidas con cariño. Encuentra lo que va contigo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { p?: string } =>
    typeof s["p"] === "string" && s["p"] ? { p: s["p"] } : {},
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogoQuery),
  component: Boutique,
});

const DISPONIBLE: { id: Disponibilidad; label: string }[] = [
  { id: "todo", label: "Toda la colección" },
  { id: "stock", label: "Entrega hoy" },
  { id: "encargo", label: "A pedido" },
  { id: "remate", label: "Liquidación" },
];
const COLECCIONES = [
  { id: "todo", label: "Toda la colección", icon: Layers3 },
  { id: "mujer", label: "Para ella", icon: Flower2 },
  { id: "hombre", label: "Para él", icon: Leaf },
  { id: "juvenil", label: "Juvenil", icon: Sparkles },
  { id: "cosmetica", label: "Cosmética", icon: Sparkles },
  { id: "accesorios", label: "Accesorios", icon: ShoppingBag },
] satisfies { id: Coleccion; label: string; icon: typeof Layers3 }[];

function Boutique() {
  const { data: items } = useSuspenseQuery(catalogoQuery);
  const [col, setCol] = useState<Coleccion>("todo");
  const [disp, setDisp] = useState<Disponibilidad>("todo");
  const [buscar, setBuscar] = useState("");
  const [orden, setOrden] = useState("destacados");
  const [pagina, setPagina] = useState(1);
  const catalogRef = useRef<HTMLDivElement>(null);
  const { p: fichaCodigo } = Route.useSearch();
  const navigate = Route.useNavigate();
  const ficha = fichaCodigo ? (items.find((x) => x.codigo === fichaCodigo) ?? null) : null;
  const setFicha = (i: ItemPublico | null) =>
    navigate({ search: i ? { p: i.codigo } : {}, replace: !i, resetScroll: false });
  useEffect(() => {
    if (!ficha) return;
    void registrarFicha({ data: { codigo: ficha.codigo, tipo: "vista" } }).catch(() => {});
    window.__lovableEvents?.track?.("project.ficha_vista", { codigo: ficha.codigo });
  }, [ficha?.codigo]);
  const [copiado, setCopiado] = useState(false);
  const copiarEnlace = async (codigo: string) => {
    void registrarFicha({ data: { codigo, tipo: "compartir" } }).catch(() => {});
    window.__lovableEvents?.track?.("project.ficha_compartida", { codigo });
    const url = `${window.location.origin}/?p=${encodeURIComponent(codigo)}`;
    try {
      if (navigator.share) await navigator.share({ title: "PaMaRa AyN", url });
      else {
        await navigator.clipboard.writeText(url);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }
    } catch {
      /* cancelado */
    }
  };
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
  const q = buscar.trim().toLocaleLowerCase("es");
  const visibles = items
    .filter(
      (i) =>
        enColeccion(i, col) &&
        (disp === "todo" || i.estado === disp) &&
        (!q ||
          [i.nombre, i.inspiracion, i.codigo, i.categoria, i.version].some((value) =>
            value?.toLocaleLowerCase("es").includes(q),
          )),
    )
    .sort((a, b) =>
      orden === "nombre"
        ? (a.inspiracion || a.nombre).localeCompare(b.inspiracion || b.nombre, "es")
        : orden === "precio"
          ? (a.precio ?? Infinity) - (b.precio ?? Infinity)
          : 0,
    );
  const paginas = Math.max(1, Math.ceil(visibles.length / 12));
  const paginaActual = Math.min(pagina, paginas);
  const mostrados = visibles.slice((paginaActual - 1) * 12, paginaActual * 12);
  const cambiarPagina = (n: number) => {
    setPagina(n);
    catalogRef.current?.scrollIntoView({ block: "start" });
  };
  const limpiar = () => {
    setCol("todo");
    setDisp("todo");
    setBuscar("");
    setOrden("destacados");
    setPagina(1);
  };

  return (
    <div className="boutique-page">
      <div className="announcement">
        <div className="page-width">
          <span>Una esencia para cada versión de ti</span>
          <span>
            <MapPin size={11} /> La Serena · Coquimbo · Calama
          </span>
        </div>
      </div>
      <header className="boutique-header">
        <div className="page-width boutique-header-inner">
          <a href="#" className="brand-lockup" aria-label="PaMaRa AyN, inicio">
            <img src={monograma} alt="" width={760} height={760} />
            <span>
              <span className="brand-word">PaMaRa</span>
              <span className="brand-caption">AyN · Perfumes de inspiración</span>
            </span>
          </a>
          <nav className="header-links" aria-label="Navegación principal">
            <a href="#coleccion">La colección</a>
            <a href="#entregas">Entregas</a>
          </nav>
          <button
            onClick={() => setVerBolsa(true)}
            className="bag-trigger"
            aria-label={"Ver mi lista, " + unidades + (unidades === 1 ? " producto" : " productos")}
          >
            <ShoppingBag size={21} strokeWidth={1.4} /> Mi lista
            {unidades > 0 && <span>{unidades}</span>}
          </button>
        </div>
      </header>

      <section className="page-width boutique-hero" aria-labelledby="boutique-title">
        <div className="hero-copy">
          <p className="eyebrow">El arte de encontrar tu esencia</p>
          <h1 id="boutique-title">
            Tu esencia.<em>Tu sello.</em>
          </h1>
          <p className="hero-description">
            Fragancias que hablan de ti.
            <br />
            Descubre tu próxima inspiración con PaMaRa AyN.
          </p>
          <a href="#coleccion" className="primary-link">
            Explorar la colección <ArrowUpRight size={16} strokeWidth={1.4} />
          </a>
          <p className="hero-note">Elegidas con cariño. Para acompañarte cada día.</p>
        </div>
        <div className="hero-signature">
          <span className="eyebrow">Una firma personal</span>
          <img
            src={logo}
            alt="PaMaRa AyN, logotipo metálico"
            width={1442}
            height={1442}
            fetchPriority="high"
            decoding="async"
          />
          <Sparkles className="signature-spark" size={30} strokeWidth={0.8} aria-hidden="true" />
          <span className="eyebrow">Perfumes de inspiración</span>
        </div>
      </section>
      <div className="service-strip">
        <div className="page-width">
          <span>
            <Sparkles /> Una fragancia para cada estilo
          </span>
          <span>
            <Truck /> Entregas en 3 ciudades
          </span>
          <span>
            <Heart /> Atención cercana y personal
          </span>
        </div>
      </div>

      <main id="coleccion" className="page-width catalog-section">
        <div className="catalog-heading">
          <div>
            <p className="eyebrow">La colección</p>
            <h2>Encuentra lo que va contigo</h2>
          </div>
          <p className="catalog-count">{items.length} piezas por descubrir</p>
        </div>
        <div className="catalog-layout">
          <aside className="collection-filters" aria-label="Filtros de la colección">
            <p className="filters-title">
              Explorar <SlidersHorizontal size={16} strokeWidth={1.2} />
            </p>
            <div className="collection-options">
              {COLECCIONES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setCol(id);
                    setPagina(1);
                  }}
                  aria-pressed={col === id}
                  className={"collection-filter" + (col === id ? " is-active" : "")}
                >
                  <span>
                    <Icon /> {label}
                  </span>
                  <small>{items.filter((i) => enColeccion(i, id)).length}</small>
                </button>
              ))}
            </div>
            <label className="filter-label" htmlFor="disponibilidad">
              Disponibilidad
            </label>
            <select
              id="disponibilidad"
              value={disp}
              onChange={(e) => {
                setDisp(e.target.value as Disponibilidad);
                setPagina(1);
              }}
              className="catalog-select"
            >
              {DISPONIBLE.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <button className="clear-filters" onClick={limpiar}>
              Limpiar filtros
            </button>
            <p className="filter-note">
              ¿Cuál será
              <br />
              tu próxima esencia?
              <small>
                Explora, elige y consulta.
                <br />
                Te ayudamos a encontrarla.
              </small>
            </p>
          </aside>
          <div className="catalog-body" ref={catalogRef}>
            <div className="catalog-toolbar">
              <label className="catalog-search">
                <Search />
                <input
                  aria-label="Buscar en la colección"
                  type="search"
                  value={buscar}
                  onChange={(e) => {
                    setBuscar(e.target.value);
                    setPagina(1);
                  }}
                  placeholder="Busca por nombre, marca o código…"
                />
              </label>
              <select
                aria-label="Ordenar colección"
                value={orden}
                onChange={(e) => {
                  setOrden(e.target.value);
                  setPagina(1);
                }}
                className="catalog-select"
              >
                <option value="destacados">Destacados primero</option>
                <option value="nombre">Nombre: A a Z</option>
                <option value="precio">Menor precio</option>
              </select>
            </div>
            <div className="catalog-results">
              <span role="status">
                {visibles.length} {visibles.length === 1 ? "resultado" : "resultados"}
              </span>
              <span>Elegidos con cariño, para ti</span>
            </div>
            {visibles.length === 0 ? (
              <div className="empty-collection">
                <Flower2 size={35} strokeWidth={1} />
                <h3>
                  {items.length ? "Una nueva búsqueda, otra esencia" : "Pronto, nuevas piezas"}
                </h3>
                <p>
                  {items.length
                    ? "Prueba otro nombre o cambia los filtros de la colección."
                    : "Estamos preparando nuestra colección para ti."}
                </p>
                {items.length > 0 && (
                  <button className="clear-filters" onClick={limpiar}>
                    Ver toda la colección
                  </button>
                )}
              </div>
            ) : (
              <ul className="product-grid">
                {mostrados.map((i) => (
                  <li key={i.codigo} className="product-card">
                    <button
                      onClick={() => setFicha(i)}
                      className="product-detail-trigger"
                      aria-label={"Ver " + (i.inspiracion || i.nombre)}
                    >
                      <div className="product-media">
                        <ProductVisual item={i} />
                        <span
                          className={"product-badge" + (i.estado === "remate" ? " is-remate" : "")}
                        >
                          {badge(i)}
                        </span>
                      </div>
                      <div className="product-meta">
                        <span>
                          {i.perfume
                            ? i.codigo.startsWith("M-")
                              ? "Para ella"
                              : i.codigo.startsWith("T-")
                                ? "Juvenil"
                                : "Para él"
                            : i.categoria || "Selección PaMaRa"}
                        </span>
                        <span>{i.perfume ? i.codigo : ""}</span>
                      </div>
                      <h3>{i.inspiracion || i.nombre}</h3>
                      <p className="product-description">
                        {i.inspiracion
                          ? i.nombre.replace(i.inspiracion, "").replace(/^[·\s]+/, "") ||
                            "Perfume de inspiración"
                          : i.version || i.categoria || "Elegido para ti"}
                      </p>
                      <p className="product-price">
                        {i.precio ? clp(i.precio) : "Consultar precio"}
                      </p>
                    </button>
                    <Agregar
                      n={cantidad(i.codigo)}
                      onCambio={(d) => cambiar(i, d)}
                      nombre={i.inspiracion || i.nombre}
                    />
                    <a
                      href={linkConsulta(i)}
                      target="_blank"
                      rel="noreferrer"
                      className="product-consult"
                    >
                      Consultar por WhatsApp <ArrowUpRight size={10} className="inline" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {paginas > 1 && (
              <nav className="catalog-pagination" aria-label="Páginas de la colección">
                <button
                  aria-label="Página anterior"
                  disabled={paginaActual === 1}
                  onClick={() => cambiarPagina(paginaActual - 1)}
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <span>
                  Página {paginaActual} de {paginas}
                </span>
                <button
                  aria-label="Página siguiente"
                  disabled={paginaActual === paginas}
                  onClick={() => cambiarPagina(paginaActual + 1)}
                >
                  Siguiente <ChevronRight size={16} />
                </button>
              </nav>
            )}
          </div>
        </div>
      </main>
      <footer id="entregas" className="boutique-footer">
        <div className="page-width">
          <div className="footer-top">
            <div>
              <p className="eyebrow mb-3">PaMaRa AyN</p>
              <h2>
                Pequeños detalles.
                <br />
                Una esencia que se queda.
              </h2>
            </div>
            <p className="footer-delivery">
              <strong>Con cariño, hasta donde estás.</strong>Coordinamos entregas en La Serena,
              Coquimbo y Calama. Prepara tu lista y conversemos por WhatsApp para confirmar
              disponibilidad, pago y entrega.
            </p>
          </div>
          <div className="footer-bottom">
            <span>PaMaRa AyN · Perfumes, cosmética y accesorios</span>
            <Link to="/bodega">
              Acceso a Bodega <ArrowUpRight size={11} className="inline" />
            </Link>
          </div>
        </div>
      </footer>

      {ficha && (
        <Hoja onClose={() => setFicha(null)} label="Detalle del producto">
          <div className="detail-media">
            <ProductVisual item={ficha} />
          </div>
          <p className="eyebrow mb-3">
            {ficha.codigo} · {ETIQUETA[ficha.estado]}
          </p>
          <h2>{ficha.inspiracion || ficha.nombre}</h2>
          {ficha.inspiracion && <p className="product-description">{ficha.nombre}</p>}
          {ficha.version && <p className="product-description">Versión: {ficha.version}</p>}
          {ficha.categoria && !ficha.perfume && (
            <p className="product-description">{ficha.categoria}</p>
          )}
          {ficha.descripcion && (
            <p className="product-description whitespace-pre-line">{ficha.descripcion}</p>
          )}
          {ficha.notas && (
            <p className="product-description">
              <strong>Notas:</strong> {ficha.notas}
            </p>
          )}
          <p className="mt-4 text-xl font-semibold text-primary">
            {ficha.precio ? clp(ficha.precio) : "Consultar precio"}
          </p>
          <Agregar
            n={cantidad(ficha.codigo)}
            onCambio={(d) => cambiar(ficha, d)}
            nombre={ficha.inspiracion || ficha.nombre}
          />
          <a href={linkConsulta(ficha)} target="_blank" rel="noreferrer" className="whatsapp-link">
            <MessageCircle size={18} /> Consultar este producto
          </a>
          <p className="sheet-note">Conversemos por WhatsApp para coordinar los detalles.</p>
          {ficha.perfume && (
            <div className="cert-seal">
              <ShieldCheck size={22} strokeWidth={1.4} />
              <div>
                <p className="cert-title">Réplica certificada Parfum d'Parfums</p>
                <p className="cert-text">
                  Fórmula segura y no nociva, elaborada bajo los controles regulatorios
                  vigentes. Cuidamos tu piel tanto como tu esencia.
                </p>
              </div>
            </div>
          )}
          <button type="button" className="share-link" onClick={() => copiarEnlace(ficha.codigo)}>
            <Link2 size={15} /> {copiado ? "Enlace copiado" : "Compartir esta ficha"}
          </button>
        </Hoja>
      )}
      {unidades > 0 && !verBolsa && !ficha && (
        <button onClick={() => setVerBolsa(true)} className="floating-list">
          <span>
            <ShoppingBag size={18} strokeWidth={1.4} /> {unidades}{" "}
            {unidades === 1 ? "producto" : "productos"} · {clp(totalBolsa(bolsa))}
          </span>
          <span>
            Ver mi lista <ArrowUpRight size={15} />
          </span>
        </button>
      )}
      {verBolsa && (
        <Hoja onClose={() => setVerBolsa(false)} label="Mi lista">
          <p className="eyebrow mb-3">Tu selección PaMaRa</p>
          <h2>Mi lista</h2>
          {bolsa.length === 0 ? (
            <p className="login-description">
              Tu próxima esencia te está esperando. Explora la colección y agrega lo que te guste.
            </p>
          ) : (
            <>
              <ul className="mt-4">
                {bolsa.map((l) => (
                  <li key={l.item.codigo} className="list-line">
                    <div className="list-line-info">
                      <p className="eyebrow mb-2">{l.item.perfume ? l.item.codigo : "PaMaRa"}</p>
                      <strong>{l.item.inspiracion || l.item.nombre}</strong>
                      <small>
                        {l.item.precio ? clp(l.item.precio * l.cantidad) : "Precio a confirmar"}
                      </small>
                    </div>
                    <Agregar
                      n={l.cantidad}
                      onCambio={(d) => cambiar(l.item, d)}
                      nombre={l.item.inspiracion || l.item.nombre}
                      compacto
                    />
                  </li>
                ))}
              </ul>
              <p className="list-total">
                <span>Total de productos</span>
                <span>{clp(totalBolsa(bolsa))}</span>
              </p>
              <p className="mt-7 text-xs font-medium">¿Dónde te lo entregamos?</p>
              <div className="delivery-choices">
                {COMUNAS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setComuna(c)}
                    aria-pressed={comuna === c}
                    className={comuna === c ? "is-active" : ""}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <a
                href={linkPedido(bolsa, comuna)}
                target="_blank"
                rel="noreferrer"
                className="whatsapp-link"
              >
                <MessageCircle size={18} /> Enviar mi lista por WhatsApp <ArrowUpRight size={16} />
              </a>
              <p className="sheet-note">
                Ahí coordinamos disponibilidad, pago y entrega.
                <br />
                El total de productos no incluye el despacho.
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
  compacto,
  nombre,
}: {
  n: number;
  onCambio: (d: number) => void;
  compacto?: boolean;
  nombre: string;
}) {
  if (n === 0 && !compacto)
    return (
      <button
        onClick={() => onCambio(1)}
        className="add-to-list"
        aria-label={"Agregar " + nombre + " a mi lista"}
      >
        <Plus size={14} strokeWidth={1.4} /> Agregar a mi lista
      </button>
    );
  return (
    <div className={"quantity-control" + (compacto ? " is-compact" : "")}>
      <button aria-label={"Quitar uno de " + nombre} onClick={() => onCambio(-1)}>
        <Minus />
      </button>
      <span aria-live="polite" aria-label={"Cantidad: " + n}>
        {n}
      </span>
      <button aria-label={"Agregar uno de " + nombre} onClick={() => onCambio(1)}>
        <Plus />
      </button>
    </div>
  );
}

function Hoja({
  children,
  onClose,
  label,
}: {
  children: ReactNode;
  onClose: () => void;
  label: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      dialog?.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      className="sheet-backdrop"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="boutique-sheet">
        <button aria-label="Cerrar" onClick={onClose} className="sheet-close">
          <X size={18} />
        </button>
        {children}
      </div>
    </dialog>
  );
}
