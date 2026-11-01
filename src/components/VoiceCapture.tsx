import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mic, Square, Loader2, Keyboard, Check, X } from "lucide-react";
import { toast } from "sonner";
import { avisarMotor } from "@/lib/motor";
import { escucharNativo, transcribirConRespaldo, type Transcripciones } from "@/lib/vozNativa";
import { transcribir, interpretar, type Interpretacion } from "@/lib/ai.functions";
import { actions, clp, fechaBonita, hoy, normCodigo, uid, useStore, saldo, precioVenta } from "@/lib/store";

const tipoLabel: Record<Interpretacion["tipo"], string> = {
  fiado: "Venta fiada",
  abono: "Pago recibido",
  encargo: "Nuevo encargo",
  stock: "Movimiento de stock",
  otro: "Nota",
};

export function VoiceCapture() {
  const tx = useServerFn(transcribir);
  const ai = useServerFn(interpretar);
  const { deudas, productos, precios } = useStore();
  const [estado, setEstado] = useState<"idle" | "grabando" | "pensando">("idle");
  const [texto, setTexto] = useState("");
  const [escribir, setEscribir] = useState(false);
  const [res, setRes] = useState<Interpretacion | null>(null);
  const [fuentes, setFuentes] = useState<Transcripciones | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  async function procesar(t: string, versiones?: Transcripciones) {
    setEstado("pensando");
    try {
      setTexto(t);
      const r = await ai({ data: { texto: t, hoy: hoy(), ...versiones } });
      avisarMotor(r.motor);
      setRes(r);
      setTexto(r.texto_validado);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setEstado("idle");
    }
  }

  async function empezar() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const nativo = escucharNativo();
      chunks.current = [];
      mr.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const respaldo = nativo.parar();
        const blob = new Blob(chunks.current, { type: mr.mimeType || "audio/webm" });
        setEstado("pensando");
        try {
          const buf = new Uint8Array(await blob.arrayBuffer());
          let bin = "";
          for (let i = 0; i < buf.length; i += 0x8000)
            bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
          const t = await transcribirConRespaldo(
            () => tx({ data: { audio: btoa(bin), mime: blob.type } }),
            () => respaldo,
          );
          if (!t.texto)
            throw new Error("No te escuché bien. Intenta de nuevo, más cerca del teléfono.");
          setFuentes(t);
          setEscribir(true);
          await procesar(t.texto, t);
        } catch (e) {
          toast.error((e as Error).message);
          setEstado("idle");
        }
      };
      mr.start();
      rec.current = mr;
      setEstado("grabando");
    } catch {
      toast.error("Necesito permiso para usar el micrófono.");
    }
  }

  function guardar() {
    if (!res) return;
    const cliente = res.cliente?.trim() || "Sin nombre";
    const codigo = res.codigo ? normCodigo(res.codigo) : "";
    if (res.tipo === "fiado") {
      const total = res.total ?? 0;
      const ini = res.abono_inicial ?? 0;
      actions.addDeuda({
        cliente,
        codigo,
        total,
        abonos: ini > 0 ? [{ monto: ini, fecha: hoy() }] : [],
        cuotas: res.cuotas.map((c) => ({
          id: uid(),
          monto: c.monto,
          fecha: c.fecha,
          pagada: false,
        })),
      });
      if (codigo) actions.ajustarStock(codigo, -1);
    } else if (res.tipo === "abono") {
      const d = deudas.find(
        (x) => x.cliente.toLowerCase() === cliente.toLowerCase() && saldo(x) > 0,
      );
      if (!d) {
        toast.error(`No encontré una deuda de ${cliente}.`);
        return;
      }
      actions.abonar(d.id, res.total ?? 0);
    } else if (res.tipo === "encargo") {
      const prod = productos.find((x) => x.codigo === codigo);
      actions.addEncargo({
        cliente,
        codigo,
        nota: res.nota ?? "",
        precio: res.total || (prod ? precioVenta({ ...prod, stock: 0 }, precios).precio : precios?.base),
      });
    } else if (res.tipo === "stock" && codigo) {
      actions.ajustarStock(codigo, res.cantidad ?? 1);
    } else {
      toast("Lo dejé como nota, no hubo nada que guardar.");
      return;
    }
    toast.success("¡Guardado! 💛");
    setRes(null);
    setTexto("");
    setFuentes(null);
  }

  return (
    <section className="space-y-5">
      {!res && (
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-card p-6 text-center shadow-soft">
          <h2 className="text-2xl font-semibold">¿Qué pasó hoy?</h2>
          <p className="text-muted-foreground">
            Toca el botón y cuéntame, como si me mandaras un audio.
          </p>
          <button
            onClick={estado === "grabando" ? () => rec.current?.stop() : empezar}
            disabled={estado === "pensando"}
            aria-label={estado === "grabando" ? "Terminar de grabar" : "Empezar a grabar"}
            className={`flex size-40 items-center justify-center rounded-full text-primary-foreground shadow-soft transition active:scale-95 ${
              estado === "grabando" ? "animate-pulse bg-destructive" : "bg-hero"
            }`}
          >
            {estado === "pensando" ? (
              <Loader2 className="size-16 animate-spin" />
            ) : estado === "grabando" ? (
              <Square className="size-14" fill="currentColor" />
            ) : (
              <Mic className="size-20" />
            )}
          </button>
          <p className="text-lg font-bold">
            {estado === "grabando"
              ? "Te escucho… toca para terminar"
              : estado === "pensando"
                ? "Entendiendo…"
                : "Toca para hablar"}
          </p>
          <p className="text-sm italic text-muted-foreground">
            Ej: “Le fié a Carmen el H-05 en 18 mil, me paga 9 mil el viernes y el resto a fin de
            mes”
          </p>
          <button
            onClick={() => setEscribir((v) => !v)}
            className="flex items-center gap-2 font-bold text-primary underline"
          >
            <Keyboard className="size-5" /> Prefiero escribir
          </button>
          {escribir && (
            <form
              className="w-full space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (texto.trim()) void procesar(texto.trim(), fuentes ?? undefined);
              }}
            >
              <textarea
                value={texto}
                onChange={(e) => {
                  setTexto(e.target.value);
                  setFuentes(null);
                }}
                rows={3}
                placeholder="Escribe aquí lo que pasó…"
                className="w-full rounded-2xl border-2 border-input bg-background p-4 text-lg"
              />
              <button
                disabled={estado === "pensando"}
                className="h-14 w-full rounded-2xl bg-primary text-lg font-bold text-primary-foreground"
              >
                Listo
              </button>
            </form>
          )}
        </div>
      )}

      {res && (
        <div className="space-y-4 rounded-3xl border-2 border-accent bg-card p-5 shadow-soft">
          <p className="text-sm text-muted-foreground">Escuché: “{texto}”</p>
          <h2 className="text-2xl font-semibold text-primary">{tipoLabel[res.tipo]}</h2>
          <p className="text-lg">{res.resumen}</p>
          <dl className="grid grid-cols-2 gap-3 text-base">
            {res.cliente && <Dato k="Clienta/e" v={res.cliente} />}
            {res.codigo && <Dato k="Código" v={normCodigo(res.codigo)} />}
            {res.total != null && (
              <Dato k={res.tipo === "abono" ? "Pagó" : "Total"} v={clp(res.total)} />
            )}
            {res.tipo === "fiado" && <Dato k="Pagó ahora" v={clp(res.abono_inicial ?? 0)} />}
            {res.cantidad != null && <Dato k="Cantidad" v={String(res.cantidad)} />}
          </dl>
          {res.cuotas.length > 0 && (
            <ul className="space-y-2">
              {res.cuotas.map((c, i) => (
                <li
                  key={i}
                  className="flex justify-between rounded-xl bg-secondary px-4 py-3 font-bold"
                >
                  <span className="capitalize">{fechaBonita(c.fecha)}</span>
                  <span>{clp(c.monto)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setRes(null)}
              className="flex h-16 items-center justify-center gap-2 rounded-2xl border-2 border-border text-lg font-bold"
            >
              <X /> Corregir
            </button>
            <button
              onClick={guardar}
              className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-success text-lg font-bold text-success-foreground"
            >
              <Check /> Guardar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Dato({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <dt className="text-sm text-muted-foreground">{k}</dt>
      <dd className="text-lg font-bold">{v}</dd>
    </div>
  );
}
