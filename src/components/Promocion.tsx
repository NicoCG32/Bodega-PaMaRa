import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Mic, Square } from "lucide-react";
import { toast } from "sonner";
import { crearPromptTrend, transcribir } from "@/lib/ai.functions";
import { avisarMotor } from "@/lib/motor";
import { anuncioMultiple, chatgptUrl, FB_CREAR, filtrarStock, type FiltroStock } from "@/lib/anuncios";
import { useStore } from "@/lib/store";

async function copiar(t: string) {
  try {
    await navigator.clipboard.writeText(t);
    toast.success("Texto copiado. Ahora pégalo en Facebook.");
  } catch {
    toast.error("No pude copiar. Mantén el dedo sobre el texto para copiarlo.");
  }
}

/** Shows ad copy with the 2-tap flow: copy + open Marketplace. */
export function PanelAnuncio({ texto, onClose }: { texto: string; onClose: () => void }) {
  const [t, setT] = useState(texto);
  return (
    <div className="space-y-3 rounded-3xl border-2 border-primary bg-card p-4 shadow-soft">
      <p className="text-lg font-bold">Anuncio listo para Facebook</p>
      <textarea value={t} onChange={(e) => setT(e.target.value)} rows={9} className="w-full rounded-2xl border-2 border-input bg-background p-3 text-base" />
      <div className="grid gap-2">
        <button onClick={() => copiar(t)} className="h-14 rounded-2xl bg-primary text-lg font-bold text-primary-foreground">📋 1. Copiar texto</button>
        <a href={FB_CREAR} target="_blank" rel="noreferrer" className="flex h-14 items-center justify-center rounded-2xl bg-accent text-lg font-bold text-accent-foreground">
          ↗️ 2. Abrir Facebook Marketplace
        </a>
        <button onClick={onClose} className="h-12 rounded-2xl bg-secondary font-bold">Cerrar</button>
      </div>
    </div>
  );
}

export function PublicarStock() {
  const { productos } = useStore();
  const [abierto, setAbierto] = useState(false);
  const [f, setF] = useState<FiltroStock | null>(null);
  if (f) return <PanelAnuncio texto={anuncioMultiple(productos, f)} onClose={() => (setF(null), setAbierto(false))} />;
  if (!abierto)
    return (
      <button onClick={() => setAbierto(true)} className="h-14 w-full rounded-2xl bg-accent text-lg font-bold text-accent-foreground">
        📣 Publicar stock disponible
      </button>
    );
  const opciones: { k: FiltroStock; label: string }[] = [
    { k: "todo", label: "Todo el stock" },
    { k: "M", label: "Solo Mujer" },
    { k: "H", label: "Solo Hombre" },
  ];
  return (
    <div className="space-y-2 rounded-3xl bg-card p-4 shadow-soft">
      <p className="text-lg font-bold">¿Qué quieres publicar?</p>
      {opciones.map((o) => {
        const n = filtrarStock(productos, o.k).length;
        return (
          <button
            key={o.k}
            disabled={n === 0}
            onClick={() => setF(o.k)}
            className="h-14 w-full rounded-2xl bg-secondary text-lg font-bold disabled:opacity-40"
          >
            {o.label} ({n})
          </button>
        );
      })}
      <button onClick={() => setAbierto(false)} className="h-12 w-full font-bold text-muted-foreground">Cancelar</button>
    </div>
  );
}

export function CrearTrend() {
  const { productos } = useStore();
  const tx = useServerFn(transcribir);
  const ai = useServerFn(crearPromptTrend);
  const [estado, setEstado] = useState<"idle" | "grabando" | "pensando">("idle");
  const [idea, setIdea] = useState("");
  const [prompt, setPrompt] = useState("");
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const ref = productos
    .filter((p) => p.stock > 0)
    .map((p) => [p.codigo.startsWith("O-") ? "" : p.codigo, p.inspiracion, p.version, p.codigo.startsWith("O-") ? p.nombre : ""].filter(Boolean).join(" "))
    .join("; ");

  async function generar(t: string) {
    setEstado("pensando");
    try {
      const r = await ai({ data: { idea: t, productos: ref } });
      avisarMotor(r.motor);
      setPrompt(r.prompt);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setEstado("idle");
    }
  }

  async function grabar() {
    if (estado === "grabando") return rec.current?.stop();
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
          for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
          const texto = await transcribirConRespaldo(() => tx({ data: { audio: btoa(bin), mime: blob.type } }), () => respaldo);
          if (!texto) throw new Error("No te escuché bien. Intenta de nuevo.");
          setIdea(texto);
          await generar(texto);
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

  return (
    <div className="space-y-3 rounded-3xl bg-card p-4 shadow-soft">
      <p className="text-lg font-bold">😂 Crear meme o trend</p>
      <p className="text-sm text-muted-foreground">Cuenta tu idea, ej: "un perrito triste porque se acabó el H-05".</p>
      <button
        onClick={grabar}
        disabled={estado === "pensando"}
        className={`flex h-16 w-full items-center justify-center gap-2 rounded-2xl text-lg font-bold ${estado === "grabando" ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}
      >
        {estado === "pensando" ? <Loader2 className="animate-spin" /> : estado === "grabando" ? <Square /> : <Mic />}
        {estado === "grabando" ? "Terminé de hablar" : estado === "pensando" ? "Armando el prompt…" : "Dictar idea"}
      </button>
      <textarea value={idea} onChange={(e) => setIdea(e.target.value)} rows={2} placeholder="…o escríbela aquí" className="w-full rounded-2xl border-2 border-input bg-background p-3 text-base" />
      {idea.trim() && !prompt && estado === "idle" && (
        <button onClick={() => generar(idea.trim())} className="h-12 w-full rounded-2xl bg-secondary font-bold">✨ Armar prompt</button>
      )}
      {prompt && (
        <>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={7} className="w-full rounded-2xl border-2 border-primary bg-background p-3 text-sm" />
          <a href={chatgptUrl(prompt)} target="_blank" rel="noreferrer" className="flex h-14 items-center justify-center rounded-2xl bg-accent text-lg font-bold text-accent-foreground">
            ↗️ Abrir en ChatGPT
          </a>
          <button onClick={() => (setPrompt(""), setIdea(""))} className="h-12 w-full rounded-2xl bg-secondary font-bold">Hacer otro</button>
        </>
      )}
    </div>
  );
}
