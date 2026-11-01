import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { BodegaCapture } from "@/components/BodegaCapture";
import { CrearTrend, PanelAnuncio, PublicarStock } from "@/components/Promocion";
import { anuncioIndividual } from "@/lib/anuncios";
import {
  actions,
  clp,
  DIAS_REMATE,
  diasQuieto,
  esOtro,
  normCodigo,
  reposicion,
  resumenBodega,
  uid,
  useStore,
  type Producto,
} from "@/lib/store";

function Resumen() {
  const { productos } = useStore();
  const r = resumenBodega(productos);
  const caja = "rounded-3xl bg-card p-3 text-center shadow-soft";
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-2 gap-2">
        <div className={caja}>
          <p className="text-2xl font-extrabold">{r.unidades}</p>
          <p className="text-sm text-muted-foreground">unidades</p>
        </div>
        <div className={`${caja} ${r.remate ? "bg-accent text-accent-foreground" : ""}`}>
          <p className="text-2xl font-extrabold">{r.remate}</p>
          <p className="text-sm">para rematar</p>
        </div>
      </div>
    </div>
  );
}

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

export const Route = createFileRoute("/catalogo")({
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

function Catalogo() {
  const { productos } = useStore();
  const [vista, setVista] = useState<"bodega" | "catalogo">("bodega");
  const [tipo, setTipo] = useState<"perfume" | "otro">("perfume");
  const [f, setF] = useState("");
  const [nuevo, setNuevo] = useState(false);

  const lista = productos
    .filter((p) => (tipo === "otro" ? esOtro(p) : !esOtro(p)))
    .filter((p) => tipo === "otro" || !f || p.codigo.startsWith(f + "-"))
    .filter((p) => vista === "catalogo" || p.stock > 0)
    .sort(ordenar);
  const unidades = productos.filter((p) => p.stock > 0).reduce((a, p) => a + p.stock, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-3xl bg-secondary p-1.5">
        {(["bodega", "catalogo"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVista(v)}
            className={`h-14 rounded-2xl text-lg font-bold ${vista === v ? "bg-primary text-primary-foreground shadow-soft" : ""}`}
          >
            {v === "bodega" ? "📦 Bodega" : "📖 Catálogo"}
          </button>
        ))}
      </div>
      <p className="text-center text-muted-foreground">
        {vista === "bodega"
          ? `Listo para entregar hoy · ${unidades} unidades`
          : "Todo lo que puedes vender o encargar"}
      </p>

      <div className="flex gap-2">
        {(["perfume", "otro"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTipo(t)}
            className={`flex-1 rounded-2xl border-2 py-3 font-bold ${tipo === t ? "border-primary bg-card text-primary" : "border-transparent bg-secondary"}`}
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
              className={`rounded-full px-5 py-2 font-bold ${f === x.k ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            >
              {x.label}
            </button>
          ))}
        </div>
      )}

      {vista === "bodega" && <Resumen />}
      {vista === "bodega" && <Reposicion />}
      {vista === "bodega" && <BodegaCapture />}
      {vista === "bodega" && <PublicarStock />}
      {vista === "bodega" && <CrearTrend />}

      {vista === "bodega" && tipo === "perfume" && (
        <button
          onClick={() => {
            if (lista.length === 0) return alert("No hay perfumes en bodega para enviar.");
            const lineas = lista
              .map((p) => `• ${p.codigo}${detalle(p) ? ` ${detalle(p)}` : ""}`)
              .join("\n");
            const msg = `¡Hola! 🌸 Te saluda PaMaRa AyN. Tengo disponibles para entrega inmediata:\n${lineas}\n\n¿Te interesa alguno? 💛`;
            window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
          }}
          className="h-14 w-full rounded-2xl bg-success text-lg font-bold text-success-foreground"
        >
          📲 Enviar disponibles por WhatsApp
        </button>
      )}

      {nuevo ? (
        <Editor tipo={tipo} onClose={() => setNuevo(false)} />
      ) : (
        <button
          onClick={() => setNuevo(true)}
          className="h-14 w-full rounded-2xl border-2 border-dashed border-primary text-lg font-bold text-primary"
        >
          + Agregar {tipo === "perfume" ? "perfume" : "producto"}
        </button>
      )}

      {lista.length === 0 && (
        <p className="py-6 text-center text-muted-foreground">
          {vista === "bodega"
            ? "No hay nada en la repisa en esta sección."
            : "Aún no hay productos aquí."}
        </p>
      )}
      <ul className="space-y-3">
        {lista.map((p) => (
          <Tarjeta key={p.codigo} p={p} />
        ))}
      </ul>
    </div>
  );
}

function Tarjeta({ p }: { p: Producto }) {
  const [editar, setEditar] = useState(false);
  const [anuncio, setAnuncio] = useState(false);
  const dias = diasQuieto(p);
  const remate = p.stock > 0 && dias >= DIAS_REMATE;
  if (editar)
    return (
      <li>
        <Editor tipo={esOtro(p) ? "otro" : "perfume"} p={p} onClose={() => setEditar(false)} />
      </li>
    );
  return (
    <li className={`rounded-3xl bg-card p-4 shadow-soft ${remate ? "ring-2 ring-accent" : ""}`}>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-2xl font-extrabold">{titulo(p)}</p>
          {detalle(p) && <p className="text-muted-foreground">{detalle(p)}</p>}
          <div className="mt-1 flex flex-wrap gap-1.5">
            <span
              className={`rounded-full px-3 py-0.5 text-sm font-bold ${p.stock > 0 ? "bg-success text-success-foreground" : "bg-secondary"}`}
            >
              {p.stock > 0 ? `En bodega: ${p.stock}` : "A encargo"}
            </span>
            {p.precio ? (
              <span className="rounded-full bg-secondary px-3 py-0.5 text-sm font-bold">
                {clp(p.precio)}
              </span>
            ) : null}
          </div>
        </div>
        <button
          onClick={() => actions.ajustarStock(p.codigo, -1)}
          aria-label="Quitar uno"
          className="flex size-14 items-center justify-center rounded-2xl bg-secondary"
        >
          <Minus />
        </button>
        <button
          onClick={() => actions.ajustarStock(p.codigo, 1)}
          aria-label="Sumar uno"
          className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
        >
          <Plus />
        </button>
      </div>
      {p.stock > 0 && (
        <p
          className={`mt-3 rounded-2xl px-3 py-2 text-sm font-bold ${remate ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}
        >
          {remate
            ? `📦 ${dias} días sin venderse · Sugerencia: rematar o bajar el precio`
            : p.ultimaVenta
              ? `Última venta hace ${dias === 0 ? "menos de un día" : `${dias} días`}`
              : `En bodega hace ${dias === 0 ? "menos de un día" : `${dias} días`}`}
        </p>
      )}
      <div className="mt-2 flex items-center justify-between">
        <button
          onClick={() => setEditar(true)}
          className="flex items-center gap-1 text-sm font-bold text-primary"
        >
          <Pencil className="size-4" /> Editar datos
        </button>
        <button
          onClick={() => actions.toggleBoutique(p.codigo)}
          aria-pressed={p.enBoutique !== false}
          className={`rounded-full px-3 py-2 text-sm font-bold ${p.enBoutique !== false ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
        >
          {p.enBoutique !== false ? "👁 En Boutique" : "🔒 Solo privado"}
        </button>
        {p.stock > 0 && !anuncio && (
          <button
            onClick={() => setAnuncio(true)}
            className="rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-foreground"
          >
            📣 Crear anuncio FB
          </button>
        )}
      </div>
      {anuncio && (
        <div className="mt-3">
          <PanelAnuncio texto={anuncioIndividual(p)} onClose={() => setAnuncio(false)} />
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
  const campo = "h-12 w-full rounded-2xl border-2 border-input bg-background px-4 text-lg";

  function guardar() {
    const st = Math.max(0, parseInt(stock) || 0);
    const pr = parseInt(precio.replace(/\D/g, "")) || undefined;
    let key = p?.codigo ?? "";
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
        </>
      ) : (
        <>
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
      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm font-bold text-muted-foreground">
          Precio
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
