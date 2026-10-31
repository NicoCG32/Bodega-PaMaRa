import { useEffect, useState, type ReactNode } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const PIN_KEY = "pamara-admin-pin";
const SES_KEY = "pamara-admin-ok";
export const PIN_INICIAL = "1111";

export const leerPin = () => localStorage.getItem(PIN_KEY) || PIN_INICIAL;
export const pinValido = (p: string) => /^\d{4}$/.test(p);

function Teclado({ onPin, error }: { onPin: (p: string) => void; error?: boolean }) {
  const [v, setV] = useState("");
  useEffect(() => {
    if (v.length === 4) {
      onPin(v);
      setV("");
    }
  }, [v, onPin]);
  const tecla = "h-16 rounded-2xl bg-card text-2xl font-bold shadow-soft active:bg-secondary";
  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-4">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`size-5 rounded-full border-2 border-primary ${i < v.length ? "bg-primary" : ""}`} />
        ))}
      </div>
      {error && <p className="text-center font-bold text-destructive">Clave incorrecta, intenta otra vez</p>}
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
          <button key={n} className={tecla} onClick={() => setV((x) => (x + n).slice(0, 4))}>{n}</button>
        ))}
        <span />
        <button className={tecla} onClick={() => setV((x) => (x + "0").slice(0, 4))}>0</button>
        <button className={tecla} onClick={() => setV((x) => x.slice(0, -1))}>⌫</button>
      </div>
    </div>
  );
}

export function AdminGate({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => setOk(sessionStorage.getItem(SES_KEY) === "1"), []);
  if (ok === null) return null;
  if (ok)
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-2">
          <span className="flex items-center gap-2 font-bold"><ShieldCheck className="size-5 text-primary" /> Administrador</span>
          <button
            className="flex h-10 items-center gap-1 rounded-xl px-3 font-bold text-primary"
            onClick={() => { sessionStorage.removeItem(SES_KEY); setOk(false); }}
          >
            <Lock className="size-4" /> Bloquear
          </button>
        </div>
        {children}
      </div>
    );
  return (
    <div className="mx-auto max-w-xs space-y-5 pt-4">
      <div className="text-center">
        <Lock className="mx-auto size-10 text-primary" />
        <h2 className="mt-2 text-3xl font-semibold">Bodega</h2>
        <p className="text-muted-foreground">Ingresa la clave de Administrador</p>
      </div>
      <Teclado
        error={error}
        onPin={(p) => {
          if (p === leerPin()) { sessionStorage.setItem(SES_KEY, "1"); setError(false); setOk(true); }
          else setError(true);
        }}
      />
    </div>
  );
}

export function CambiarClaveCard() {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [rep, setRep] = useState("");
  const campo = "h-14 w-full rounded-2xl border border-input bg-background px-4 text-center text-2xl tracking-[0.5em]";
  const guardar = (): void => {
    if (actual !== leerPin()) { toast.error("La clave actual no es correcta"); return; }
    if (!pinValido(nueva)) { toast.error("La nueva clave debe tener 4 números"); return; }
    if (nueva !== rep) { toast.error("Las claves nuevas no coinciden"); return; }
    localStorage.setItem(PIN_KEY, nueva);
    setActual(""); setNueva(""); setRep("");
    toast.success("Clave de Administrador cambiada");
  };
  const props = { type: "password", inputMode: "numeric" as const, maxLength: 4, className: campo };
  return (
    <section className="space-y-3 rounded-3xl bg-card p-5 shadow-soft">
      <h3 className="flex items-center gap-2 text-xl font-bold"><ShieldCheck className="size-6 text-primary" /> Clave de Administrador</h3>
      <p className="text-muted-foreground">Protege la Bodega. Cambia la clave cuando lo necesites.</p>
      <input {...props} placeholder="Actual" value={actual} onChange={(e) => setActual(e.target.value.replace(/\D/g, ""))} />
      <input {...props} placeholder="Nueva" value={nueva} onChange={(e) => setNueva(e.target.value.replace(/\D/g, ""))} />
      <input {...props} placeholder="Repetir" value={rep} onChange={(e) => setRep(e.target.value.replace(/\D/g, ""))} />
      <button onClick={guardar} className="h-14 w-full rounded-2xl bg-primary text-lg font-bold text-primary-foreground">Cambiar clave</button>
    </section>
  );
}
