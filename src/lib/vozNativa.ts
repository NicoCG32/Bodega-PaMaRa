/**
 * Phone-native speech recognition (Web Speech API), run in parallel with the
 * recording so it can be used as a free fallback when Groq fails.
 */
type Rec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export type Escucha = {
  /** Text heard since the previous cut. */
  cortar: () => string;
  /** Stops listening and returns the text since the last cut. */
  parar: () => Promise<string>;
};

export function escucharNativo(): Escucha {
  const W = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
  const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
  let texto = "";
  let interino = "";
  let corte = 0;
  let activo = true;
  let terminar: (() => void) | null = null;
  if (!Ctor) return { cortar: () => "", parar: async () => "" };

  let rec: Rec;
  const arrancar = () => {
    rec = new Ctor();
    rec.lang = "es-CL";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      interino = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) texto += " " + r[0].transcript;
        else interino += " " + r[0].transcript;
      }
    };
    rec.onerror = () => {};
    rec.onend = () => {
      if (interino) texto += interino;
      interino = "";
      if (activo) {
        try { arrancar(); } catch { /* ignore */ }
      } else terminar?.();
    };
    try { rec.start(); } catch { /* ignore */ }
  };
  arrancar();

  const cortar = () => {
    const t = (texto + interino).slice(corte).trim();
    corte = texto.length;
    return t;
  };
  return {
    cortar,
    parar: () =>
      new Promise((ok) => {
        activo = false;
        const fin = setTimeout(() => ok(cortar()), 1500);
        terminar = () => { clearTimeout(fin); ok(cortar()); };
        try { rec.stop(); } catch { ok(cortar()); }
      }),
  };
}

/** Groq first; on any failure use the phone's own transcription. Never Lovable AI. */
export async function transcribirConRespaldo(groq: () => Promise<{ texto: string }>, nativo: () => string | Promise<string>) {
  try {
    const { texto } = await groq();
    if (texto.trim()) return texto.trim();
  } catch (e) {
    console.warn("Groq falló, uso el dictado del teléfono", e);
  }
  return (await nativo()).trim();
}
