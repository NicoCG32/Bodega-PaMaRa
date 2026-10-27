import { toast } from "sonner";

let ultimoAviso = 0;

/** Clear notice when the app had to fall back from Gemini to Lovable AI (uses credits). */
export function avisarMotor(motor: "gemini" | "groq" | "lovable" | undefined) {
  if (motor !== "lovable") return;
  const ahora = Date.now();
  if (ahora - ultimoAviso < 60_000) return;
  ultimoAviso = ahora;
  toast.warning("La IA gratuita no respondió. Usé la IA de Lovable (consume créditos).", { duration: 6000 });
}
