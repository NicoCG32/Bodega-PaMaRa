import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Camera, Loader2, Mic, Minus, Plus, Square, X } from "lucide-react";
import { toast } from "sonner";
import { avisarMotor } from "@/lib/motor";
import { interpretarBodega, transcribir, type ItemBodega } from "@/lib/ai.functions";
import { escucharNativo, transcribirConRespaldo, type Escucha } from "@/lib/vozNativa";
import { actions, esOtro, hoy, normCodigo, uid, useStore } from "@/lib/store";

type Fila = { clave: string; codigo: string | null; nombre: string; tipo: "perfume" | "otro"; cantidad: number; toque: number };
const CHUNK_MS = 6000;

async function aBase64(blob: Blob) {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(bin);
}

async function fotoReducida(file: File): Promise<string> {
  const img = await createImageBitmap(file);
  const escala = Math.min(1, 1600 / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * escala);
  c.height = Math.round(img.height * escala);
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("No pude preparar la foto. Intenta otra vez.");
  ctx.drawImage(img, 0, 0, c.width, c.height);
  img.close();
  return c.toDataURL("image/jpeg", 0.85);
}

export function BodegaCapture() {
  const tx = useServerFn(transcribir);
  const ai = useServerFn(interpretarBodega);
  const { productos } = useStore();
  const [abierto, setAbierto] = useState(false);
  const [grabando, setGrabando] = useState(false);
  const [pendientes, setPendientes] = useState(0);
  const [filas, setFilas] = useState<Fila[]>([]);
  const [final, setFinal] = useState(false);
  const activo = useRef(false);
  const stream = useRef<MediaStream | null>(null);
  const contador = useRef(0);
  const nativo = useRef<Escucha | null>(null);
  const fotoRef = useRef<HTMLInputElement>(null);
  const sesion = useRef(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const [revisiones, setRevisiones] = useState<{ texto: string; nativo: string; groq: string }[]>([]);

  const otros = productos.filter(esOtro).map((p) => p.nombre).filter(Boolean);

  function agregar(items: ItemBodega[]) {
    setFilas((prev) => {
      let next = [...prev];
      for (const it of items) {
        if (!it.cantidad || it.cantidad < 1) continue;
        const codigo = it.tipo === "perfume" && it.codigo ? normCodigo(it.codigo) : null;
        const nombre = (it.nombre ?? "").trim();
        if (!codigo && !nombre) continue;
        const clave = codigo ?? nombre.toLowerCase();
        const ex = next.find((f) => f.clave === clave);
        const toque = ++contador.current;
        if (ex) next = next.map((f) => (f === ex ? { ...f, cantidad: f.cantidad + Math.round(it.cantidad), toque } : f));
        else next.push({ clave, codigo, nombre, tipo: codigo ? "perfume" : "otro", cantidad: Math.round(it.cantidad), toque });
      }
      return next;
    });
  }

  async function procesar(p: Promise<{ items: ItemBodega[]; motor?: "groq" }>, id = sesion.current) {
    setPendientes((n) => n + 1);
    try {
      const r = await p;
      if (id !== sesion.current) return;
      avisarMotor(r.motor);
      agregar(r.items);
    } catch (e) {
      if (id === sesion.current) toast.error((e as Error).message);
    } finally {
      if (id === sesion.current) setPendientes((n) => n - 1);
    }
  }

  function grabarTramo() {
    const s = stream.current;
    if (!s || !activo.current) return;
    const mr = new MediaRecorder(s);
    recorder.current = mr;
    const id = sesion.current;
    const chunks: Blob[] = [];
    mr.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    mr.onstop = () => {
      const seguir = activo.current && id === sesion.current;
      if (seguir) grabarTramo();
      else s.getTracks().forEach((t) => t.stop());
      const n = nativo.current;
      const respaldo: Promise<string> = !n ? Promise.resolve("") : seguir ? Promise.resolve(n.cortar()) : n.parar();
      if (!seguir && id === sesion.current) nativo.current = null;
      const blob = new Blob(chunks, { type: mr.mimeType || "audio/webm" });
      if (id !== sesion.current) return;
      void procesar(
        (async () => {
          const texto = await transcribirConRespaldo(
            async () => tx({ data: { audio: await aBase64(blob), mime: blob.type } }),
            () => respaldo,
          );
          if (!texto.texto || id !== sesion.current) return { items: [] };
          try {
            return await ai({ data: { ...texto, otros } });
          } catch (e) {
            if (id === sesion.current) setRevisiones((r) => [...r, texto]);
            throw e;
          }
        })(),
        id,
      );
    };
    mr.start();
    setTimeout(() => mr.state === "recording" && mr.stop(), CHUNK_MS);
  }

  async function empezar() {
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      nativo.current = escucharNativo();
      activo.current = true;
      setGrabando(true);
      setFinal(false);
      grabarTramo();
    } catch {
      toast.error("Necesito permiso para usar el micrófono.");
    }
  }

  function parar() {
    activo.current = false;
    setGrabando(false);
    if (recorder.current?.state === "recording") recorder.current.stop();
  }

  async function foto(file: File | undefined) {
    if (!file) return;
    setFinal(false);
    try {
      const imagen = await fotoReducida(file);
      await procesar(ai({ data: { imagen, otros } }));
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  function cambiar(clave: string, d: number) {
    setFilas((prev) => prev.map((f) => (f.clave === clave ? { ...f, cantidad: Math.max(0, f.cantidad + d) } : f)).filter((f) => f.cantidad > 0));
  }

  function guardar() {
    const lista = filas.filter((f) => f.cantidad > 0);
    for (const f of lista) {
      if (f.codigo) actions.ajustarStock(f.codigo, f.cantidad);
      else {
        const ex = productos.find((p) => esOtro(p) && p.nombre.toLowerCase() === f.nombre.toLowerCase());
        if (ex) actions.ajustarStock(ex.codigo, f.cantidad);
        else actions.upsertProducto({ codigo: `O-${uid()}`, nombre: f.nombre, stock: f.cantidad, tipo: "otro", fechaIngreso: hoy() });
      }
    }
    toast.success(`¡Listo! Sumé ${lista.reduce((a, f) => a + f.cantidad, 0)} productos a la bodega 📦`);
    cerrar();
  }

  function cerrar() {
    sesion.current++;
    parar();
    setPendientes(0);
    setRevisiones([]);
    setFilas([]);
    setFinal(false);
    setAbierto(false);
  }

  if (!abierto)
    return (
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => { setAbierto(true); void empezar(); }} className="flex h-20 flex-col items-center justify-center gap-1 rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-soft">
          <Mic /> Dictar bodega
        </button>
        <button onClick={() => { setAbierto(true); fotoRef.current?.click(); }} className="flex h-20 flex-col items-center justify-center gap-1 rounded-2xl bg-accent text-lg font-bold text-accent-foreground shadow-soft">
          <Camera /> Foto a la repisa
        </button>
        <input ref={fotoRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { void foto(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
    );

  const ordenadas = [...filas].sort((a, b) => b.toque - a.toque);
  const total = filas.reduce((a, f) => a + f.cantidad, 0);
  const etiqueta = (f: Fila) => f.codigo ?? f.nombre;

  return (
    <div className="space-y-3 rounded-3xl bg-card p-4 shadow-soft">
      <input ref={fotoRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { void foto(e.target.files?.[0]); e.target.value = ""; }} />
      <div className="flex items-center justify-between">
        <p className="text-xl font-extrabold">{final ? "Tu bodega final" : "Contando la bodega"}</p>
        <button onClick={cerrar} aria-label="Cancelar" className="flex size-11 items-center justify-center rounded-full bg-secondary"><X /></button>
      </div>

      {!final && (
        <>
          {grabando ? (
            <button onClick={parar} className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-destructive text-lg font-bold text-destructive-foreground animate-pulse">
              <Square /> Te escucho… toca para terminar
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => void empezar()} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary font-bold text-primary-foreground"><Mic /> Seguir dictando</button>
              <button onClick={() => fotoRef.current?.click()} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-accent font-bold text-accent-foreground"><Camera /> Otra foto</button>
            </div>
          )}
          <p className="text-center text-sm text-muted-foreground">
            {grabando ? "Di los códigos uno por uno: «H-17, H-15, H-17, aceite de argán…»" : "Revisa la lista y corrige con − y +"}
          </p>
          {pendientes > 0 && (
            <p className="flex items-center justify-center gap-2 font-bold text-primary"><Loader2 className="animate-spin" /> Anotando…</p>
          )}
        </>
      )}

      {filas.length === 0 && pendientes === 0 && !grabando && <p className="py-4 text-center text-muted-foreground">Aún no anoto nada.</p>}

      <ul className="space-y-2">
        {(final ? [...filas].sort((a, b) => etiqueta(a).localeCompare(etiqueta(b), "es", { numeric: true })) : ordenadas).map((f, i) => (
          <li key={f.clave} className={`flex items-center gap-2 rounded-2xl p-2 ${!final && i === 0 ? "bg-success/15 ring-2 ring-success" : "bg-secondary"}`}>
            <div className="min-w-0 flex-1 pl-2">
              <p className="truncate text-xl font-extrabold">{etiqueta(f)}</p>
              {!final && i === 0 && <p className="text-xs font-bold text-success">Recién agregado</p>}
            </div>
            <button onClick={() => cambiar(f.clave, -1)} aria-label="Quitar uno" className="flex size-12 items-center justify-center rounded-xl bg-card"><Minus /></button>
            <span className="w-10 text-center text-2xl font-extrabold">{f.cantidad}</span>
            <button onClick={() => cambiar(f.clave, 1)} aria-label="Sumar uno" className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Plus /></button>
          </li>
        ))}
      </ul>

      {revisiones.map((r, i) => (
        <div key={i} className="space-y-2">
          <textarea aria-label="Dictado pendiente de revisar" value={r.texto} onChange={(e) => setRevisiones((lista) => lista.map((x, j) => j === i ? { texto: e.target.value, groq: "", nativo: "" } : x))} className="w-full rounded-xl border border-input bg-background p-3" />
          <button disabled={pendientes > 0} onClick={() => void procesar((async () => {
            const resultado = await ai({ data: { ...r, otros } });
            setRevisiones((lista) => lista.filter((x) => x !== r));
            return resultado;
          })())} className="h-12 w-full rounded-xl bg-secondary font-bold">Revisar dictado guardado</button>
        </div>
      ))}

      {filas.length > 0 && !grabando && pendientes === 0 && revisiones.length === 0 && (
        final ? (
          <div className="space-y-2">
            <p className="text-center font-bold">{total} productos en total</p>
            <button onClick={guardar} className="h-16 w-full rounded-2xl bg-success text-lg font-bold text-success-foreground">✅ Confirmar e ingresar a bodega</button>
            <button onClick={() => setFinal(false)} className="h-12 w-full rounded-2xl bg-secondary font-bold">Volver a corregir</button>
          </div>
        ) : (
          <button onClick={() => setFinal(true)} className="h-16 w-full rounded-2xl bg-success text-lg font-bold text-success-foreground">Terminé · ver bodega final ({total})</button>
        )
      )}
    </div>
  );
}
