import { useState } from "react";
import { CloudUpload, BellRing, LogOut } from "lucide-react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useUltimoRespaldo } from "@/lib/cloudSync";
import { enablePush } from "@/lib/push";
import { savePushToken } from "@/lib/push.functions";

export function NubeCard() {
  const { email, listo } = useSession();
  const ultimo = useUltimoRespaldo();
  const [ocupado, setOcupado] = useState(false);
  const [avisos, setAvisos] = useState<"sin-pedir" | "activos">("sin-pedir");

  async function entrarConGoogle() {
    setOcupado(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    setOcupado(false);
    if (result.error) {
      toast.error("No se pudo iniciar sesión. Intenta de nuevo.");
    }
  }

  async function activarAvisos() {
    setOcupado(true);
    try {
      const r = await enablePush();
      if (r.status === "registered") {
        await savePushToken({ data: { token: r.token } });
        setAvisos("activos");
        toast.success("Avisos activados en este teléfono 🔔");
      } else if (r.status === "open-in-new-tab") {
        toast.info(
          "Abre la app en su propia pestaña (no dentro del editor) para activar los avisos.",
        );
      } else if (r.status === "denied") {
        toast.error("El navegador bloqueó las notificaciones. Actívalas en los ajustes del sitio.");
      } else if (r.status === "unsupported") {
        toast.error("Este navegador no permite avisos con la app cerrada.");
      } else {
        toast.info("Los avisos aún no están configurados. Avísanos y lo activamos.");
      }
    } finally {
      setOcupado(false);
    }
  }

  if (!listo) return null;

  if (!email) {
    return (
      <section className="space-y-3 rounded-3xl bg-card p-5 shadow-soft">
        <h3 className="flex items-center gap-2 text-xl font-semibold">
          <CloudUpload className="size-6 text-primary" /> Respaldo en la nube
        </h3>
        <p className="text-muted-foreground">
          Guarda una copia de tus datos en internet. Si cambias de teléfono o borras el navegador,
          los recuperas al entrar con tu cuenta. Además podrás recibir avisos de cobro aunque la app
          esté cerrada.
        </p>
        <button
          onClick={entrarConGoogle}
          disabled={ocupado}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-bold text-primary-foreground disabled:opacity-60"
        >
          {ocupado ? "Abriendo Google…" : "Entrar con Google"}
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-3xl bg-card p-5 shadow-soft">
      <h3 className="flex items-center gap-2 text-xl font-semibold">
        <CloudUpload className="size-6 text-success" /> Respaldo activo ✓
      </h3>
      <p className="text-muted-foreground">
        Tus datos se guardan solos en la nube con tu cuenta <b>{email}</b>.
      </p>
      <p className="rounded-2xl bg-secondary px-4 py-2 text-center font-semibold text-secondary-foreground">
        {ultimo
          ? `Última copia: ${new Date(ultimo).toLocaleString("es-CL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`
          : "Preparando la primera copia…"}
      </p>
      {avisos === "activos" ? (
        <p className="rounded-2xl bg-success px-4 py-3 text-center font-bold text-success-foreground">
          Avisos de cobro activos en este teléfono 🔔
        </p>
      ) : (
        <button
          onClick={activarAvisos}
          disabled={ocupado}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-lg font-bold text-accent-foreground disabled:opacity-60"
        >
          <BellRing /> Activar avisos en este teléfono
        </button>
      )}
      <button
        onClick={() => void supabase.auth.signOut()}
        className="flex items-center gap-1 text-sm text-muted-foreground underline"
      >
        <LogOut className="size-4" /> Cerrar sesión
      </button>
    </section>
  );
}
