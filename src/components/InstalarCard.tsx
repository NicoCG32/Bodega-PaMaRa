import { useEffect, useState } from "react";
import { Smartphone, X } from "lucide-react";

type BIP = Event & { prompt: () => Promise<void> };

export function InstalarCard() {
  const [mostrar, setMostrar] = useState(false);
  const [evento, setEvento] = useState<BIP | null>(null);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const instalada =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (instalada || localStorage.getItem("pamara-instalar-oculto")) return;
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    setMostrar(true);
    const h = (e: Event) => {
      e.preventDefault();
      setEvento(e as BIP);
    };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  if (!mostrar) return null;

  function ocultar() {
    localStorage.setItem("pamara-instalar-oculto", "1");
    setMostrar(false);
  }

  return (
    <section className="relative space-y-3 rounded-3xl bg-card p-5 shadow-soft">
      <button
        onClick={ocultar}
        aria-label="Ocultar"
        className="absolute right-4 top-4 text-muted-foreground"
      >
        <X className="size-5" />
      </button>
      <h3 className="flex items-center gap-2 text-xl font-semibold">
        <Smartphone className="size-6 text-primary" /> Ponla en tu teléfono
      </h3>
      {evento ? (
        <>
          <p className="text-muted-foreground">
            Agrega PaMaRa a tu pantalla de inicio y ábrela como cualquier app.
          </p>
          <button
            onClick={() => void evento.prompt().then(ocultar)}
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground"
          >
            Instalar en mi teléfono
          </button>
        </>
      ) : ios ? (
        <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
          <li>
            Abre esta página en <b>Safari</b>.
          </li>
          <li>
            Toca el botón <b>Compartir</b> (cuadrito con flecha hacia arriba).
          </li>
          <li>
            Elige <b>"Agregar a pantalla de inicio"</b>.
          </li>
        </ol>
      ) : (
        <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
          <li>
            Abre esta página en <b>Chrome</b>.
          </li>
          <li>
            Toca los <b>tres puntitos ⋮</b> arriba a la derecha.
          </li>
          <li>
            Elige <b>"Agregar a pantalla principal"</b> o <b>"Instalar app"</b>.
          </li>
        </ol>
      )}
    </section>
  );
}
