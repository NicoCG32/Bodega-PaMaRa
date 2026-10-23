import { useState } from "react";
import { MessageCircle, Phone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { actions, clp, diasHasta, fechaBonita, proximaCuota, saldo, useStore, whatsappLink, type Deuda } from "@/lib/store";

export function cuandoTexto(fecha: string) {
  const d = diasHasta(fecha);
  if (d < 0) return { txt: `Atrasado ${-d} día${d === -1 ? "" : "s"}`, cls: "bg-destructive text-destructive-foreground" };
  if (d === 0) return { txt: "¡Hoy!", cls: "bg-accent text-accent-foreground" };
  if (d === 1) return { txt: "Mañana", cls: "bg-secondary text-secondary-foreground" };
  return { txt: `En ${d} días`, cls: "bg-muted text-muted-foreground" };
}

export function DeudaCard({ d }: { d: Deuda }) {
  const { telefonos } = useStore();
  const tel = telefonos[d.cliente.toLowerCase()];
  const [abono, setAbono] = useState("");
  const [abrir, setAbrir] = useState(false);
  const [pedirTel, setPedirTel] = useState<null | "enviar" | "guardar">(null);
  const [numero, setNumero] = useState("");
  const s = saldo(d);
  const c = proximaCuota(d);
  const cuando = c ? cuandoTexto(c.fecha) : null;

  function enviar(t: string) {
    window.open(whatsappLink(t, d.cliente, c ? Math.min(c.monto, s) : s, c?.fecha), "_blank");
  }

  function wsp() {
    if (tel) return enviar(tel);
    setNumero("+56 9 ");
    setPedirTel("enviar");
  }

  function guardarTel() {
    const t = numero.trim();
    if (t.replace(/\D/g, "").length < 8) {
      toast.error("Falta el número completo");
      return;
    }
    actions.setTelefono(d.cliente, t);
    const modo = pedirTel;
    setPedirTel(null);
    if (modo === "enviar") enviar(t);
    else toast.success("Número guardado");
  }

  return (
    <article className="space-y-3 rounded-3xl bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold">{d.cliente}</h3>
          <p className="text-muted-foreground">
            {d.codigo || "Producto"} · total {clp(d.total)}
          </p>
        </div>
        {s > 0 ? (
          <p className="text-right">
            <span className="block text-sm text-muted-foreground">Debe</span>
            <span className="text-2xl font-extrabold text-primary">{clp(s)}</span>
          </p>
        ) : (
          <span className="rounded-full bg-success px-3 py-1 font-bold text-success-foreground">Pagado ✓</span>
        )}
      </div>
      {c && s > 0 && cuando && (
        <div className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-3">
          <span className="capitalize">
            {fechaBonita(c.fecha)} · <b>{clp(Math.min(c.monto, s))}</b>
          </span>
          <span className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-sm font-bold ${cuando.cls}`}>{cuando.txt}</span>
        </div>
      )}
      {s > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={wsp} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-whatsapp text-lg font-bold text-success-foreground">
            <MessageCircle /> Recordar
          </button>
          <button onClick={() => setAbrir((v) => !v)} className="h-14 rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
            Me pagó
          </button>
        </div>
      )}
      {abrir && (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(abono.replace(/\D/g, ""));
            if (!n) return;
            actions.abonar(d.id, n);
            toast.success(`Anotado pago de ${clp(n)}`);
            setAbono("");
            setAbrir(false);
          }}
        >
          <input
            inputMode="numeric"
            autoFocus
            value={abono}
            onChange={(e) => setAbono(e.target.value)}
            placeholder="¿Cuánto? ej: 9000"
            className="h-14 flex-1 rounded-2xl border-2 border-input bg-background px-4 text-lg"
          />
          <button className="h-14 rounded-2xl bg-success px-5 text-lg font-bold text-success-foreground">OK</button>
        </form>
      )}
      {pedirTel && (
        <div className="space-y-3 rounded-2xl bg-secondary p-4">
          <p className="text-lg font-bold">WhatsApp de {d.cliente}</p>
          <input
            type="tel"
            inputMode="tel"
            autoFocus
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className="h-14 w-full rounded-2xl border-2 border-input bg-background px-4 text-xl"
          />
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setPedirTel(null)} className="h-14 rounded-2xl bg-muted text-lg font-bold">
              Cancelar
            </button>
            <button onClick={guardarTel} className="h-14 rounded-2xl bg-whatsapp text-lg font-bold text-success-foreground">
              {pedirTel === "enviar" ? "Enviar" : "Guardar"}
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <button
          onClick={() => {
            setNumero(tel ?? "+56 9 ");
            setPedirTel("guardar");
          }}
          className="flex items-center gap-1 underline"
        >
          <Phone className="size-4" /> {tel || "Agregar teléfono"}
        </button>
        <button
          onClick={() => confirm(`¿Borrar la deuda de ${d.cliente}?`) && actions.borrarDeuda(d.id)}
          className="flex items-center gap-1"
          aria-label="Borrar"
        >
          <Trash2 className="size-4" /> Borrar
        </button>
      </div>
    </article>
  );
}
