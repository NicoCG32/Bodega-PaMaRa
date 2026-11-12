import { useEffect, useState, type ReactNode } from "react";
import { Lock, LogOut } from "lucide-react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { esAdmin } from "@/lib/productosSync";

type Estado = "cargando" | "fuera" | "sin-permiso" | "admin";

const G = (
  <svg
    aria-hidden="true"
    width="18"
    height="18"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
  >
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
    />
  </svg>
);

/** El Vault solo abre con la cuenta Google de la Administradora (verificada en la nube). */
export function AdminGate({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>("cargando");
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    const revisar = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return setEstado("fuera");
      setEstado((await esAdmin()) ? "admin" : "sin-permiso");
    };
    void revisar();
    const { data: sub } = supabase.auth.onAuthStateChange((e) => {
      if (e === "SIGNED_IN" || e === "SIGNED_OUT") void revisar();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (estado === "cargando")
    return <p className="pt-10 text-center text-muted-foreground">Abriendo…</p>;
  if (estado === "admin") return <>{children}</>;

  const entrar = async () => {
    setOcupado(true);
    const r = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/bodega",
      extraParams: { prompt: "select_account" },
    });
    setOcupado(false);
    if (r.error) toast.error("No se pudo entrar. Intenta de nuevo.");
  };

  return (
    <div className="login-card">
      <div className="login-icon">
        <Lock size={24} strokeWidth={1.3} />
      </div>
      <p className="eyebrow">Bodega · Acceso privado</p>
      <h2>Tu espacio, en orden.</h2>
      {estado === "fuera" ? (
        <>
          <p className="login-description">Entra con tu cuenta Google para abrir la Bodega.</p>
          <button onClick={entrar} disabled={ocupado} className="google-login">
            {G} {ocupado ? "Entrando…" : "Continuar con Google"}
          </button>
          <p className="login-note">La gestión de PaMaRa AyN, sólo para sus cuentas autorizadas.</p>
        </>
      ) : (
        <>
          <p className="login-description">Esta cuenta no tiene permiso de Administradora.</p>
          <button onClick={() => void supabase.auth.signOut()} className="google-login">
            <LogOut className="size-5" /> Usar otra cuenta
          </button>
        </>
      )}
    </div>
  );
}
