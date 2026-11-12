import { useState } from "react";
import { BellRing } from "lucide-react";
import { toast } from "sonner";
import { enablePush } from "@/lib/push";
import { savePushToken } from "@/lib/push.functions";

export function AvisosCobro() {
  const [listo, setListo] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  async function activar() {
    setOcupado(true);
    try {
      const r = await enablePush();
      if (r.status === "registered") {
        await savePushToken({ data: { token: r.token } });
        setListo(true);
        toast.success("Listo 🔔 Te avisaré cada mañana quién te tiene que pagar");
      } else if (r.status === "open-in-new-tab")
        toast.info("Abre la app en su propia pestaña para activar los avisos.");
      else if (r.status === "denied")
        toast.error("El teléfono bloqueó los avisos. Actívalos en los ajustes del sitio.");
      else if (r.status === "unsupported")
        toast.error("Este teléfono no permite avisos. Instala la app en la pantalla de inicio.");
      else toast.info("Los avisos aún no están configurados.");
    } finally {
      setOcupado(false);
    }
  }
  if (listo) return null;
  return (
    <button
      onClick={activar}
      disabled={ocupado}
      className="flex w-full items-center gap-3 rounded-3xl bg-accent p-4 text-left text-accent-foreground shadow-soft"
    >
      <BellRing className="h-8 w-8 shrink-0" />
      <span>
        <span className="block text-lg font-extrabold">Avísame cuando toque cobrar</span>
        <span className="block text-sm">
          Cada mañana te llega un aviso: el día antes y el día del pago.
        </span>
      </span>
    </button>
  );
}
