import { Link } from "@tanstack/react-router";
import { Mic, Wallet, Package, ClipboardList, Settings } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import logo from "@/assets/pamara-monograma.webp";
import { useStore, saldo, proximaCuota, diasHasta, hoy, clp } from "@/lib/store";

const tabs = [
  { to: "/vault", label: "Anotar", icon: Mic },
  { to: "/cobros", label: "Cobros", icon: Wallet },
  { to: "/encargos", label: "Encargos", icon: ClipboardList },
  { to: "/catalogo", label: "Bodega", icon: Package },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { deudas } = useStore();
  const urgentes = deudas.filter((d) => {
    const c = proximaCuota(d);
    return saldo(d) > 0 && c && diasHasta(c.fecha) <= 0;
  }).length;

  // Daily reminder alarm: notify once per day about due/overdue payments.
  useEffect(() => {
    if (!urgentes || typeof Notification === "undefined" || Notification.permission !== "granted")
      return;
    if (localStorage.getItem("pamara-aviso") === hoy()) return;
    localStorage.setItem("pamara-aviso", hoy());
    const lista = deudas.filter((d) => {
      const c = proximaCuota(d);
      return saldo(d) > 0 && c && diasHasta(c.fecha) <= 0;
    });
    new Notification("PaMaRa AyN · Toca cobrar 🔔", {
      body: lista.map((d) => `${d.cliente}: ${clp(saldo(d))}`).join("\n"),
    });
  }, [urgentes, deudas]);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      <header className="flex items-center justify-between bg-hero px-5 pb-4 pt-5 text-primary-foreground">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <img
            src={logo}
            alt=""
            width={760}
            height={760}
            className="size-14 shrink-0 object-contain"
          />
          <div className="min-w-0">
            <p className="font-display text-lg leading-tight">PaMaRa AyN</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-accent">
              Perfumes · Ropa · Cosmética
            </p>
          </div>
        </div>
        <Link
          to="/ajustes"
          aria-label="Ajustes"
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-foreground/10"
        >
          <Settings className="size-6" />
        </Link>
      </header>
      <main className="flex-1 px-4 pb-32 pt-4">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <ul className="grid grid-cols-4">
          {tabs.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                activeOptions={{ exact: true }}
                className="relative flex flex-col items-center gap-1 py-3 text-sm font-bold text-muted-foreground data-[status=active]:text-primary"
              >
                <Icon className="size-7" />
                {label}
                {to === "/cobros" && urgentes > 0 && (
                  <span className="absolute right-5 top-1.5 flex size-6 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                    {urgentes}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
