import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Camera, Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { subirFoto, verFoto } from "@/lib/fotos";
import { BodegaCapture } from "@/components/BodegaCapture";
import { CrearTrend, PanelAnuncio, PublicarStock } from "@/components/Promocion";
import { anuncioIndividual } from "@/lib/anuncios";
import {
  actions,
  clp,
  diasQuieto,
  esOtro,
  normCodigo,
  precioVenta,
  reposicion,
  uid,
  useStore,
  type Producto,
} from "@/lib/store";

function Reposicion() {
  const { productos, encargos } = useStore();
  const lista = reposicion(productos, encargos);
  if (lista.length === 0) return null;
  return (
    <div className="rounded-3xl border-2 border-destructive bg-card p-4 shadow-soft">
      <p className="text-lg font-extrabold">⚠️ Por reponer</p>
      <ul className="mt-2 space-y-2">
        {lista.map(({ p, pedidos, rapido }) => (
          <li key={p.codigo} className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate font-bold">
              {titulo(p)} <span className="font-normal text-muted-foreground">{detalle(p)}</span>
            </span>
            <span className="shrink-0 rounded-full bg-secondary px-3 py-0.5 text-sm font-bold">
              {pedidos > 0
                ? `${pedidos} encargo${pedidos > 1 ? "s" : ""}`
                : rapido
                  ? "Se vende rápido"
                  : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const Route = createFileRoute("/bodega/stock")({
  head: () => ({
    meta: [
      { title: "Bodega y Catálogo · PaMaRa AyN" },
      {
        name: "description",
        content: "Lo que hay en la repisa para entregar hoy y lo que se puede encargar.",
      },
      { property: "og:title", content: "Bodega y Catálogo · PaMaRa AyN" },
      { property: "og:description", content: "Perfumes, ropa y cosmética: en bodega o a encargo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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

const ordenar = (a: Producto, b: Producto) =>
  a.codigo.localeCompare(b.codigo, "es", { numeric: true }) || a.nombre.localeCompare(b.nombre);
const titulo = (p: Producto) => (esOtro(p) ? p.nombre || "Sin nombre" : p.codigo);
const detalle = (p: Producto) =>
  esOtro(p)
    ? p.categoria || ""
    : [p.inspiracion, p.version].filter(Boolean).join(" · ") || p.nombre;

type Seccion = "repisas" | "entrada" | "promo";
const SECCIONES: { id: Seccion; label: string }[] = [
  { id: "repisas", label: "📦 Repisas" },
  { id: "entrada", label: "🎙️ Anotar llegada" },
  { id: "promo", label: "📣 Promoción" },
];

function Catalogo() {
  const { productos } = useStore();
  const [seccion, setSeccion] = useState<Seccion>("repisas");
  const [vista, setVista] = useState<"casa" | "acabo">("casa");
  const [tipo, setTipo] = useState<"perfume" | "otro">("perfume");
  const [f, setF] = useState("");
  const [buscar, setBuscar] = useState("");
  const [nuevo, setNuevo] = useState(false);

  const q = buscar.trim().toLowerCase();
  const lista = productos
    .filter((p) => (tipo === "otro" ? esOtro(p) : !esOtro(p)))
    .filter((p) => tipo === "otro" || !f || p.codigo.startsWith(f + "-"))
    .filter((p) => !!buscar.trim() || (vista === "casa" ? p.stock > 0 : p.stock <= 0))
    .filter(
      (p) =>
        !q ||
        [p.codigo, p.nombre, p.inspiracion, normCodigo(buscar)]
          .slice(0, 3)
          .some((x) => x?.toLowerCase().includes(q)) ||
        p.codigo === normCodigo(buscar),
    )
    .sort(ordenar);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-1.5 rounded-3xl bg-secondary p-1.5">
        {SECCIONES.map((x) => (
          <button
            key={x.id}
            onClick={() => setSeccion(x.id)}
            className={`min-h-14 rounded-2xl px-1 text-base font-bold leading-tight ${seccion === x.id ? "bg-primary text-primary-foreground shadow-soft" : ""}`}
          >
            {x.label}
          </button>
        ))}
      </div>

      {seccion === "entrada" && (
        <>
          <p className="text-center text-lg text-muted-foreground">
            Dicta los códigos o saca una foto de lo que llegó.
          </p>
          <BodegaCapture />
        </>
      )}

      {seccion === "promo" && (
        <>
          <PublicarStock />
          <CrearTrend />
          <button
            onClick={() => {
              const disp = productos.filter((p) => p.stock > 0 && !esOtro(p)).sort(ordenar);
              if (disp.length === 0) return alert("No hay perfumes en bodega para enviar.");
              const lineas = disp
                .map((p) => `• ${p.codigo}${detalle(p) ? ` ${detalle(p)}` : ""}`)
                .join("\n");
              const msg = `¡Hola! 🌸 Te saluda PaMaRa AyN. Tengo disponibles para entrega inmediata:\n${lineas}\n\n¿Te interesa alguno? 💛`;
              window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
            }}
            className="h-16 w-full rounded-2xl bg-success text-lg font-bold text-success-foreground"
          >
            📲 Enviar disponibles por WhatsApp
          </button>
        </>
      )}

      {seccion === "repisas" && (
        <>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["casa", "🏠 Tengo en la casa", productos.filter((x) => x.stock > 0).length],
                ["acabo", "📋 Se me acabó", productos.filter((x) => x.stock <= 0).length],
              ] as const
            ).map(([k, label, n]) => (
              <button
                key={k}
                onClick={() => setVista(k)}
                aria-pressed={vista === k}
                className={`min-h-20 rounded-3xl px-2 text-lg font-extrabold leading-tight shadow-soft ${vista === k ? "bg-primary text-primary-foreground" : "bg-card"}`}
              >
                {label}
                <span className="block text-base font-bold opacity-80">{n}</span>
              </button>
            ))}
          </div>
          <Reposicion />
          <input
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="🔎 Buscar: H-17, Sauvage…"
            className="h-14 w-full rounded-2xl border-2 border-input bg-background px-4 text-lg"
          />
          <div className="grid grid-cols-2 gap-2">
            {(["perfume", "otro"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTipo(t)}
                className={`min-h-14 rounded-2xl border-2 font-bold ${tipo === t ? "border-primary bg-card text-primary" : "border-transparent bg-secondary"}`}
              >
                {t === "perfume" ? "🌸 Perfumes" : "🧴 Ropa y Cosmética"}
              </button>
            ))}
          </div>
          {tipo === "perfume" && (
            <div className="flex gap-2 overflow-x-auto">
              {filtros.map((x) => (
                <button
                  key={x.k}
                  onClick={() => setF(x.k)}
                  className={`min-h-12 rounded-full px-5 font-bold ${f === x.k ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
                >
                  {x.label}
                </button>
              ))}
            </div>
          )}

          {nuevo ? (
            <Editor tipo={tipo} onClose={() => setNuevo(false)} />
          ) : (
            <button
              onClick={() => setNuevo(true)}
              className="h-14 w-full rounded-2xl border-2 border-dashed border-primary text-lg font-bold text-primary"
            >
              + Agregar {tipo === "perfume" ? "perfume" : "ropa o cosmética"}
            </button>
          )}

          {lista.length === 0 && (
            <p className="py-6 text-center text-lg text-muted-foreground">
              {buscar.trim()
                ? "No encontré nada con ese nombre."
                : vista === "casa"
                  ? "No tienes nada aquí en la casa."
                  : "¡No se te ha acabado nada!"}
            </p>
          )}
          <ul className="space-y-3">
            {lista.slice(0, 80).map((p) => (
              <Tarjeta key={p.codigo} p={p} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Tarjeta({ p }: { p: Producto }) {
  const { precios } = useStore();
  const [abierta, setAbierta] = useState(false);
  const [editar, setEditar] = useState(false);
  const [anuncio, setAnuncio] = useState(false);
  const dias = diasQuieto(p);
  const v = precioVenta(p, precios);
  const remate = v.estado === "remate";
  if (editar)
    return (
      <li>
        <Editor tipo={esOtro(p) ? "otro" : "perfume"} p={p} onClose={() => setEditar(false)} />
      </li>
    );
  return (
    <li className={`rounded-3xl bg-card p-4 shadow-soft ${remate ? "ring-2 ring-accent" : ""}`}>
      <button onClick={() => setAbierta(!abierta)} className="w-full text-left">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 truncate text-3xl font-extrabold">{titulo(p)}</p>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${remate ? "bg-accent text-accent-foreground" : p.stock > 0 ? "bg-success text-success-foreground" : "bg-secondary text-muted-foreground"}`}
          >
            {remate ? "🔥 Rematar" : p.stock > 0 ? "En la casa" : "Para encargar"}
          </span>
        </div>
        {detalle(p) && <p className="truncate text-lg text-muted-foreground">{detalle(p)}</p>}
        <p className="mt-1 text-2xl font-extrabold text-primary">{clp(v.precio)}</p>
      </button>
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={() => actions.ajustarStock(p.codigo, -1)}
          disabled={p.stock <= 0}
          aria-label="Vendí uno (quitar uno)"
          className="flex h-16 w-20 shrink-0 items-center justify-center rounded-2xl bg-secondary disabled:opacity-40"
        >
          <Minus className="size-8" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-3xl font-extrabold leading-none">{p.stock > 0 ? p.stock : 0}</p>
          <p className="text-base font-bold text-muted-foreground">
            {p.stock === 1 ? "te queda" : p.stock > 0 ? "te quedan" : "se acabó"}
          </p>
        </div>
        <button
          onClick={() => actions.ajustarStock(p.codigo, 1)}
          aria-label="Llegó uno (sumar uno)"
          className="flex h-16 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
        >
          <Plus className="size-8" />
        </button>
      </div>
      <button
        onClick={() => setAbierta(!abierta)}
        className="mt-2 min-h-11 w-full rounded-2xl text-base font-bold text-muted-foreground"
      >
        {abierta ? "▲ Cerrar" : "▼ Más opciones (precio, anuncio)"}
      </button>
      {abierta && (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          {p.stock > 0 && (
            <p
              className={`rounded-2xl px-3 py-2 font-bold ${remate ? "bg-accent text-accent-foreground" : "bg-secondary"}`}
            >
              {remate
                ? `${dias} días sin venderse: se ofrece en liquidación`
                : `${dias === 0 ? "Llegó hoy" : `${dias} días en repisa`}`}
            </p>
          )}
          <p className="text-muted-foreground">
            {p.precio ? "Precio propio" : "Precio general"}: {clp(v.base)}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setEditar(true)}
              className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-secondary font-bold"
            >
              <Pencil className="size-5" /> Editar / precio
            </button>
            <button
              onClick={() => actions.toggleBoutique(p.codigo)}
              aria-pressed={p.enBoutique !== false}
              className={`min-h-14 rounded-2xl font-bold ${p.enBoutique !== false ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
            >
              {p.enBoutique !== false ? "👁 Se ve en tienda" : "🔒 Oculto"}
            </button>
          </div>
          {p.stock > 0 && !anuncio && (
            <button
              onClick={() => setAnuncio(true)}
              className="min-h-14 w-full rounded-2xl bg-accent font-bold text-accent-foreground"
            >
              📣 Crear anuncio de Facebook
            </button>
          )}
          {anuncio && (
            <PanelAnuncio texto={anuncioIndividual(p)} onClose={() => setAnuncio(false)} />
          )}
        </div>
      )}
    </li>
  );
}

function Editor({
  tipo,
  p,
  onClose,
}: {
  tipo: "perfume" | "otro";
  p?: Producto;
  onClose: () => void;
}) {
  const [codigo, setCodigo] = useState(p && !esOtro(p) ? p.codigo : "");
  const [nombre, setNombre] = useState(p?.nombre ?? "");
  const [inspiracion, setInspiracion] = useState(p?.inspiracion ?? "");
  const [version, setVersion] = useState(p?.version ?? "");
  const [categoria, setCategoria] = useState(p?.categoria ?? "");
  const [precio, setPrecio] = useState(p?.precio ? String(p.precio) : "");
  const [stock, setStock] = useState(p ? String(p.stock) : "0");
  const [foto, setFoto] = useState(p?.foto);
  const [descripcion, setDescripcion] = useState(p?.descripcion ?? "");
  const [notas, setNotas] = useState(p?.notas ?? "");
  const [vista, setVista] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  useEffect(() => {
    if (foto && !vista) void verFoto(foto).then(setVista);
  }, [foto, vista]);
  async function elegirFoto(f?: File) {
    if (!f) return;
    setSubiendo(true);
    try {
      setVista(URL.createObjectURL(f));
      setFoto(await subirFoto(f, p?.codigo ?? "nuevo"));
    } catch {
      setVista(null);
      alert("No se pudo subir la foto. Revisa la conexión e inténtalo otra vez.");
    } finally {
      setSubiendo(false);
    }
  }
  const fotoCampo = (
          <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl border-2 border-dashed border-primary/40 bg-secondary text-center">
              {vista ? (
                <img src={vista} alt="Foto del producto" className="max-h-64 w-full object-cover" />
              ) : (
                <>
                  <Camera className="size-10 text-primary" />
                  <span className="text-lg font-bold">Sacar o elegir foto</span>
                </>
              )}
              {subiendo && (
                <span className="pb-2 text-sm font-bold text-muted-foreground">Subiendo foto…</span>
              )}
              {vista && !subiendo && (
                <span className="pb-2 text-sm font-bold text-primary">Toca para cambiar la foto</span>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void elegirFoto(e.target.files?.[0])}
              />
            </label>
  );
  const campo = "h-12 w-full rounded-2xl border-2 border-input bg-background px-4 text-lg";

  function guardar() {
    const st = Math.max(0, parseInt(stock) || 0);
    const pr = parseInt(precio.replace(/\D/g, "")) || undefined;
    let key = p?.codigo ?? "";
    if (subiendo) return alert("Espera un momento, la foto se está subiendo.");
    if (tipo === "perfume") {
      const c = normCodigo(codigo);
      if (!/^[HMT]-\d+$/.test(c)) return alert("Escribe un código como H-05, M-12 o T-03.");
      if (p && c !== p.codigo) actions.borrarProducto(p.codigo);
      key = c;
    } else {
      if (!nombre.trim()) return alert("Escribe el nombre del producto.");
      if (!key) key = "O-" + uid();
    }
    const hoyStr = new Date().toISOString().slice(0, 10);
    actions.upsertProducto({
      codigo: key,
      tipo,
      nombre: nombre.trim(),
      inspiracion: inspiracion.trim() || undefined,
      version: version.trim() || undefined,
      categoria: categoria.trim() || undefined,
      precio: pr,
      foto,
      descripcion: descripcion.trim() || undefined,
      notas: tipo === "perfume" ? notas.trim() || undefined : undefined,
      stock: st,
      fechaIngreso: st > 0 ? (p?.stock ? (p.fechaIngreso ?? hoyStr) : hoyStr) : p?.fechaIngreso,
      ultimaVenta: p?.ultimaVenta,
    });
    onClose();
  }

  return (
    <div className="space-y-3 rounded-3xl bg-card p-4 shadow-soft">
      <p className="text-xl font-bold">
        {p ? "Editar" : "Nuevo"} {tipo === "perfume" ? "perfume" : "producto"}
      </p>
      {tipo === "perfume" ? (
        <>
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Código, ej: H-17"
            className={campo}
            autoFocus
          />
          <input
            value={inspiracion}
            onChange={(e) => setInspiracion(e.target.value)}
            placeholder="¿A quién imita? ej: Cristiano Ronaldo"
            className={campo}
          />
          <input
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="Versión, ej: GOAT"
            className={campo}
          />
          {fotoCampo}
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Notas (opcional), ej: cítricos, lavanda, madera"
            rows={2}
            className={campo + " h-auto py-3"}
          />
        </>
      ) : (
        <>
          {fotoCampo}
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre, ej: Aceite de argán"
            className={campo}
            autoFocus
          />
          <input
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            placeholder="Tipo, ej: Cabello, Ropa, Crema"
            className={campo}
          />
        </>
      )}
      <textarea
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        placeholder="Descripción (opcional): cómo es, para qué ocasión…"
        rows={3}
        className={campo + " h-auto py-3"}
      />
      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm font-bold text-muted-foreground">
          Precio propio (vacío = general)
          <input
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            inputMode="numeric"
            placeholder="$"
            className={campo}
          />
        </label>
        <label className="text-sm font-bold text-muted-foreground">
          En bodega
          <input
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            inputMode="numeric"
            className={campo}
          />
        </label>
      </div>
      <div className="flex gap-2">
        {p && (
          <button
            onClick={() =>
              confirm("¿Borrar este producto?") && (actions.borrarProducto(p.codigo), onClose())
            }
            aria-label="Borrar"
            className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-destructive"
          >
            <Trash2 />
          </button>
        )}
        <button
          onClick={onClose}
          className="h-14 flex-1 rounded-2xl bg-secondary text-lg font-bold"
        >
          Cancelar
        </button>
        <button
          onClick={guardar}
          className="h-14 flex-1 rounded-2xl bg-primary text-lg font-bold text-primary-foreground"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}
