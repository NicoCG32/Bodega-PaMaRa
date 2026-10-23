import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getState, restoreState, subscribe, type State } from "./store";

let userId: string | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
let restaurando = false;
let started = false;

/** Email de la usuaria con sesión iniciada (null si no hay). */
export function useSession() {
  const [email, setEmail] = useState<string | null>(null);
  const [listo, setListo] = useState(false);
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
      setListo(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setEmail(s?.user.email ?? null);
      setListo(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return { email, listo };
}

/** Llámala una vez al cargar la app: baja el respaldo y sube cada cambio. */
export function initCloudSync() {
  if (started || typeof window === "undefined") return;
  started = true;
  void supabase.auth.getSession().then(({ data }) => {
    if (data.session?.user) {
      userId = data.session.user.id;
      void bajarRespaldo();
    }
  });
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session?.user) {
      userId = session.user.id;
      void bajarRespaldo();
    } else if (event === "SIGNED_OUT") {
      userId = null;
    }
  });
  subscribe(() => {
    if (userId && !restaurando) programarSubida();
  });
}

async function bajarRespaldo() {
  const { data, error } = await supabase.from("backups").select("data, updated_at").maybeSingle();
  if (error) return;
  if (data?.updated_at) marcarRespaldo(data.updated_at);
  const nube = data?.data as unknown as State | undefined;
  const local = getState();
  const localVacio = !local.deudas.length && !local.encargos.length && !local.productos.length;
  if (!nube) {
    programarSubida(); // primer respaldo: subir lo local
    return;
  }
  if (localVacio || (data!.updated_at ?? "") > (local.actualizado ?? "")) {
    restaurando = true;
    restoreState(nube);
    restaurando = false;
  } else {
    programarSubida(); // lo local es más nuevo: subirlo
  }
}

function programarSubida() {
  clearTimeout(timer);
  timer = setTimeout(() => void subirRespaldo(), 1500);
}

async function subirRespaldo() {
  if (!userId) return;
  const s = getState();
  const ahora = new Date().toISOString();
  const { error } = await supabase.from("backups").upsert({
    user_id: userId,
    data: JSON.parse(JSON.stringify(s)),
    updated_at: ahora,
  });
  if (!error) marcarRespaldo(ahora);
}

let ultimo: string | null = null;
const oyentes = new Set<(v: string | null) => void>();
function marcarRespaldo(v: string | null) {
  ultimo = v;
  oyentes.forEach((l) => l(v));
}

/** Hora (ISO) de la última copia guardada en la nube. */
export function useUltimoRespaldo() {
  const [v, setV] = useState<string | null>(ultimo);
  useEffect(() => {
    setV(ultimo);
    oyentes.add(setV);
    return () => {
      oyentes.delete(setV);
    };
  }, []);
  return v;
}
