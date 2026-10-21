import { Link } from "@tanstack/react-router";
import { Mic, Wallet, Package, ClipboardList } from "lucide-react";
import type { ReactNode } from "react";
import { useStore, saldo, proximaCuota, diasHasta } from "@/lib/store";

const tabs = [
  { to: "/", label: "Anotar", icon: Mic },
  { to: "/cobros", label: "Cobros", icon: Wallet },
  { to: "/encargos", label: "Encargos", icon: ClipboardList },
  { to: "/catalogo", label: "Catálogo", icon: Package },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { deudas } = useStore();
  const urgentes = deudas.filter((d) => {
    const c = proximaCuota(d);
    return saldo(d) > 0 && c && diasHasta(c.fecha) <= 0;
  }).length;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      <header className="bg-hero px-5 pb-5 pt-6 text-primary-foreground">
        <p className="text-sm uppercase tracking-[0.25em] text-accent">Perfumes · Ropa · Cosmética</p>
        <h1 className="text-3xl font-semibold">PaMaRa AyN</h1>
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
