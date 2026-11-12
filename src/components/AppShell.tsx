import { Link } from "@tanstack/react-router";
import { Mic, Wallet, Package, ClipboardList, Settings, ArrowUpRight } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import logo from "@/assets/pamara-monograma.webp";
import { useStore, saldo, proximaCuota, diasHasta, hoy, clp } from "@/lib/store";

const tabs = [
  { to: "/bodega", label: "Anotar", icon: Mic },
  { to: "/bodega/cobros", label: "Cobros", icon: Wallet },
  { to: "/bodega/encargos", label: "Encargos", icon: ClipboardList },
  { to: "/bodega/stock", label: "Stock", icon: Package },
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
    <div className="management-shell">
      <header className="management-header">
        <div className="page-width management-header-inner">
          <Link to="/bodega" className="brand-lockup" aria-label="PaMaRa AyN, Bodega">
            <img src={logo} alt="" width={760} height={760} />
            <span>
              <span className="brand-word">PaMaRa</span>
              <span className="brand-caption">AyN · Mi Bodega</span>
            </span>
          </Link>
          <div className="management-tools">
            <Link to="/">
              Ver Boutique <ArrowUpRight size={14} />
            </Link>
            <Link to="/bodega/ajustes" aria-label="Ajustes" className="settings-link">
              <Settings size={19} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </header>
      <div className="page-width management-workspace">
        <nav className="management-nav" aria-label="Administrar Bodega">
          <p className="eyebrow">Tu espacio de trabajo</p>
          <ul>
            {tabs.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <Link to={to} activeOptions={{ exact: true }}>
                  <Icon />
                  <span>{label}</span>
                  {to === "/bodega/cobros" && urgentes > 0 && (
                    <span className="urgent-count">{urgentes}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="management-main">{children}</main>
      </div>
    </div>
  );
}
