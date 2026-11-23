import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Download, ImagePlus, Search, Share2, Sparkles, X } from "lucide-react";
import {
  MAX_PERFUMES_COLLAGE,
  MENSAJE_COLLAGE,
  perfumesParaCollage,
  type ArchivoCollage,
  type OpcionesCollage,
} from "@/lib/collage";
import { useStore } from "@/lib/store";
import "@/collage.css";

type Resultado = { key: string; archivos: (ArchivoCollage & { url: string })[] };
export function CollageEditor() {
  const { productos, precios } = useStore();
  const perfumes = useMemo(() => perfumesParaCollage(productos, precios), [productos, precios]);
  const [codigos, setCodigos] = useState<string[]>([]);
  const [buscar, setBuscar] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [opciones, setOpciones] = useState<OpcionesCollage>({
    titulo: "Tu próxima esencia",
    mensaje: MENSAJE_COLLAGE,
    mostrarPrecios: false,
    mostrarPresentaciones: true,
  });
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [formato, setFormato] = useState("cuadrado");
  const montado = useRef(true);
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);
  useEffect(
    () => () => {
      resultado?.archivos.forEach((a) => URL.revokeObjectURL(a.url));
    },
    [resultado],
  );

  const seleccion = codigos.flatMap((c) => {
    const p = perfumes.find((x) => x.codigo === c);
    return p ? [p] : [];
  });
  const key = JSON.stringify([seleccion.map((p) => [p.codigo, p.precio, p.stock]), opciones]);
  const archivos = resultado?.key === key ? resultado.archivos : [];
  const actual = archivos.find((a) => a.formato.id === formato) ?? archivos[0];
  const q = buscar.trim().toLocaleLowerCase("es");
  const lista = perfumes.filter(
    (p) =>
      (filtro === "todos" || (filtro === "stock" ? p.stock > 0 : p.stock <= 0)) &&
      (!q ||
        `${p.codigo} ${p.referencia.nombre} ${p.referencia.marca}`
          .toLocaleLowerCase("es")
          .includes(q)),
  );
  const puedeCompartir =
    actual &&
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    !!navigator.canShare?.({ files: [actual.archivo] });

  function elegir(codigo: string) {
    setResultado(null);
    setError("");
    setCodigos((prev) => {
      const visibles = prev.filter((c) => perfumes.some((p) => p.codigo === c));
      return visibles.includes(codigo)
        ? visibles.filter((c) => c !== codigo)
        : visibles.length < MAX_PERFUMES_COLLAGE
          ? [...visibles, codigo]
          : visibles;
    });
  }
  function cambiar<K extends keyof OpcionesCollage>(campo: K, valor: OpcionesCollage[K]) {
    setResultado(null);
    setError("");
    setOpciones((prev) => ({ ...prev, [campo]: valor }));
  }
  async function generar() {
    setOcupado(true);
    setError("");
    setResultado(null);
    try {
      const { crearCollages } = await import("@/lib/collage-render");
      const nuevos = await crearCollages(seleccion, opciones);
      if (montado.current)
        setResultado({
          key,
          archivos: nuevos.map((a) => ({ ...a, url: URL.createObjectURL(a.archivo) })),
        });
    } catch (e) {
      if (montado.current)
        setError(e instanceof Error ? e.message : "No se pudo crear el collage. Intenta de nuevo.");
    } finally {
      if (montado.current) setOcupado(false);
    }
  }
  async function compartir() {
    if (!actual) return;
    setError("");
    try {
      await navigator.share({ files: [actual.archivo] });
    } catch (e) {
      if (!(e instanceof Error && e.name === "AbortError"))
        setError("No se pudo compartir. Guarda la imagen y agrégala desde WhatsApp o Facebook.");
    }
  }

  return (
    <div className="collage-editor">
      <header className="collage-heading">
        <p className="eyebrow">Tu selección, lista para compartir</p>
        <h1>Crea un collage.</h1>
        <p>
          Elige tus perfumes y prepara una imagen para Facebook y otra para tus estados de WhatsApp.
        </p>
      </header>
      <div className="collage-workspace">
        <fieldset className="collage-fields" disabled={ocupado}>
          <section className="collage-panel" aria-labelledby="elige-perfumes">
            <div className="collage-panel-heading">
              <h2 id="elige-perfumes">Elige tus perfumes</h2>
              <span aria-live="polite">
                {seleccion.length} de {MAX_PERFUMES_COLLAGE}
              </span>
            </div>
            <p className="collage-help">Puedes combinar entre uno y seis.</p>
            <label className="collage-search">
              <Search size={19} aria-hidden="true" />
              <span className="sr-only">Buscar perfume</span>
              <input
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
                placeholder="Nombre, marca o código"
                type="search"
              />
            </label>
            <div className="collage-filters" aria-label="Disponibilidad">
              {(
                [
                  ["todos", "Todos"],
                  ["stock", "En stock"],
                  ["pedido", "A pedido"],
                ] as const
              ).map(([id, nombre]) => (
                <button
                  type="button"
                  key={id}
                  aria-pressed={filtro === id}
                  onClick={() => setFiltro(id)}
                >
                  {nombre}
                </button>
              ))}
            </div>
            <div className="collage-picker">
              {lista.map((p) => {
                const elegida = codigos.includes(p.codigo);
                return (
                  <button
                    type="button"
                    key={p.codigo}
                    className="collage-product"
                    aria-pressed={elegida}
                    aria-label={`${elegida ? "Quitar" : "Elegir"} ${p.codigo} ${p.referencia.nombre}`}
                    disabled={!elegida && seleccion.length >= MAX_PERFUMES_COLLAGE}
                    onClick={() => elegir(p.codigo)}
                  >
                    <img
                      src={p.referencia.pequena}
                      alt=""
                      width={64}
                      height={64}
                      loading="lazy"
                      decoding="async"
                    />
                    <span>
                      <small>
                        {p.codigo} · {p.stock > 0 ? "En stock" : "A pedido"}
                      </small>
                      <strong>{p.referencia.nombre}</strong>
                      <small>{p.referencia.marca}</small>
                    </span>
                    <span className="collage-check" aria-hidden="true">
                      {elegida ? <Check size={17} /> : <span>+</span>}
                    </span>
                  </button>
                );
              })}
              {!lista.length && (
                <p className="collage-empty">No encontramos perfumes con esa búsqueda.</p>
              )}
            </div>
            {seleccion.length > 0 && (
              <div className="collage-selection" aria-label="Perfumes elegidos">
                {seleccion.map((p) => (
                  <button
                    type="button"
                    key={p.codigo}
                    onClick={() => elegir(p.codigo)}
                    aria-label={`Quitar ${p.codigo} de la selección`}
                  >
                    {p.codigo}
                    <X size={14} aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
          </section>
          <section className="collage-panel" aria-labelledby="personaliza-collage">
            <h2 id="personaliza-collage">Dale tu toque</h2>
            <label className="collage-label" htmlFor="collage-titulo">
              Título <span>(opcional)</span>
            </label>
            <input
              id="collage-titulo"
              maxLength={70}
              value={opciones.titulo}
              onChange={(e) => cambiar("titulo", e.target.value)}
              placeholder="Tu próxima esencia"
            />
            <label className="collage-label" htmlFor="collage-mensaje">
              Mensaje
            </label>
            <textarea
              id="collage-mensaje"
              maxLength={100}
              rows={2}
              value={opciones.mensaje}
              onChange={(e) => cambiar("mensaje", e.target.value)}
            />
            <label className="collage-toggle">
              <input
                type="checkbox"
                checked={opciones.mostrarPresentaciones}
                onChange={(e) => cambiar("mostrarPresentaciones", e.target.checked)}
              />
              <span>
                Incluir los frascos y estuches<small>Según los perfumes que elegiste.</small>
              </span>
            </label>
            <label className="collage-toggle">
              <input
                type="checkbox"
                checked={opciones.mostrarPrecios}
                onChange={(e) => cambiar("mostrarPrecios", e.target.checked)}
              />
              <span>
                Mostrar precios<small>Se usarán los precios actuales de Bodega.</small>
              </span>
            </label>
          </section>
        </fieldset>
        <aside className="collage-output" aria-label="Tus imágenes">
          <div className="collage-panel">
            <h2>Tu próxima publicación</h2>
            <p className="collage-help">Dos formatos, una misma selección.</p>
            <button
              className="collage-generate"
              type="button"
              onClick={generar}
              disabled={!seleccion.length || ocupado}
            >
              <Sparkles size={20} />
              {ocupado ? "Preparando tus imágenes…" : "Crear mis dos imágenes"}
            </button>
            <div role="status" className="collage-status">
              {ocupado
                ? "Estamos preparando el formato cuadrado y el vertical."
                : archivos.length
                  ? "Tus imágenes están listas. Elige un formato para guardarlo."
                  : !seleccion.length
                    ? "Elige al menos un perfume para comenzar."
                    : "Todo listo para crear tu collage."}
            </div>
            {error && (
              <p role="alert" className="collage-error">
                {error}
              </p>
            )}
            {actual ? (
              <>
                <div className="collage-formats" aria-label="Formato de imagen">
                  {archivos.map((a) => (
                    <button
                      type="button"
                      key={a.formato.id}
                      aria-pressed={actual.formato.id === a.formato.id}
                      onClick={() => {
                        setFormato(a.formato.id);
                        setError("");
                      }}
                    >
                      {a.formato.nombre}
                    </button>
                  ))}
                </div>
                <a
                  href={actual.url}
                  download={actual.archivo.name}
                  className="collage-image-link"
                  aria-label={`Guardar ${actual.formato.nombre.toLowerCase()}`}
                >
                  <img
                    className="collage-preview"
                    src={actual.url}
                    alt={`Collage PaMaRa: ${seleccion.map((p) => p.referencia.nombre).join(", ")}`}
                    width={actual.formato.width}
                    height={actual.formato.height}
                  />
                </a>
                <a className="collage-save" href={actual.url} download={actual.archivo.name}>
                  <Download size={19} />
                  Guardar imagen
                </a>
                {puedeCompartir && (
                  <button type="button" className="collage-share" onClick={compartir}>
                    <Share2 size={19} />
                    Compartir imagen
                  </button>
                )}
                <p className="collage-help">
                  Guarda cada formato. Después puedes agregarlo a tu publicación o estado.
                </p>
              </>
            ) : (
              <div className="collage-placeholder">
                <ImagePlus size={45} strokeWidth={1} />
                <strong>Una selección muy tuya.</strong>
                <p>Aquí verás tus imágenes antes de guardarlas.</p>
                <span>Cuadrado · Vertical</span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
