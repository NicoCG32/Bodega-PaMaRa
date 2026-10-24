import { useSyncExternalStore } from "react";

export type Cuota = { id: string; monto: number; fecha: string; pagada: boolean };
export type Deuda = {
  id: string;
  cliente: string;
  codigo: string;
  total: number;
  abonos: { monto: number; fecha: string }[];
  cuotas: Cuota[];
  creada: string;
};
export type Encargo = {
  id: string;
  cliente: string;
  codigo: string;
  nota: string;
  entregado: boolean;
  creada: string;
};
export type Producto = {
  /** Unique key: H-NN/M-NN/T-NN for perfumes, O-xxxx for other products. */
  codigo: string;
  nombre: string;
  stock: number;
  tipo?: "perfume" | "otro";
  inspiracion?: string;
  version?: string;
  categoria?: string;
  precio?: number;
  fechaIngreso?: string;
  ultimaVenta?: string;
};

export const esOtro = (p: Producto) => p.tipo === "otro" || p.codigo.startsWith("O-");
/** Days since the product last moved (last sale or arrival to stock). */
export function diasQuieto(p: Producto) {
  const ref = p.ultimaVenta && p.fechaIngreso ? (p.ultimaVenta > p.fechaIngreso ? p.ultimaVenta : p.fechaIngreso) : p.ultimaVenta || p.fechaIngreso;
  return ref ? -diasHasta(ref) : 0;
}
export const DIAS_REMATE = 30;

export type State = {
  deudas: Deuda[];
  encargos: Encargo[];
  productos: Producto[];
  telefonos: Record<string, string>;
  actualizado: string;
};

const KEY = "pamara-ayn-v1";
const empty: State = { deudas: [], encargos: [], productos: [], telefonos: {}, actualizado: "" };
let state: State = empty;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...empty, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
}

function set(fn: (s: State) => State) {
  load();
  state = { ...fn(state), actualizado: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

/** Current state (for cloud backup). */
export function getState(): State {
  load();
  return state;
}

/** Listen to any change (for cloud backup). */
export function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Replace the whole state (cloud restore) and persist it locally. */
export function restoreState(s: Partial<State>) {
  load();
  state = { ...empty, ...s };
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export function useStore(): State {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => {
      load();
      return state;
    },
    () => empty,
  );
}

export const uid = () => Math.random().toString(36).slice(2, 10);
export const hoy = () => new Date().toISOString().slice(0, 10);
export const clp = (n: number) => "$" + Math.round(n).toLocaleString("es-CL");

export function saldo(d: Deuda) {
  return Math.max(0, d.total - d.abonos.reduce((a, b) => a + b.monto, 0));
}

/** Next unpaid installment, or null. */
export function proximaCuota(d: Deuda): Cuota | null {
  return [...d.cuotas].filter((c) => !c.pagada).sort((a, b) => a.fecha.localeCompare(b.fecha))[0] ?? null;
}

export function normCodigo(c: string) {
  const m = c.toUpperCase().replace(/\s/g, "").match(/^([HMT])-?(\d{1,3})$/);
  return m ? `${m[1]}-${(m[2] ?? "").padStart(2, "0")}` : c.toUpperCase().trim();
}

export const actions = {
  addDeuda(d: Omit<Deuda, "id" | "creada">) {
    set((s) => ({ ...s, deudas: [{ ...d, id: uid(), creada: hoy() }, ...s.deudas] }));
  },
  abonar(id: string, monto: number) {
    set((s) => ({
      ...s,
      deudas: s.deudas.map((d) => {
        if (d.id !== id) return d;
        const abonos = [...d.abonos, { monto, fecha: hoy() }];
        // mark installments as paid in order, while paid amount covers them
        let pagado = abonos.reduce((a, b) => a + b.monto, 0);
        const cuotas = [...d.cuotas]
          .sort((a, b) => a.fecha.localeCompare(b.fecha))
          .map((c) => {
            if (pagado >= c.monto) {
              pagado -= c.monto;
              return { ...c, pagada: true };
            }
            pagado = 0;
            return { ...c, pagada: false };
          });
        return { ...d, abonos, cuotas };
      }),
    }));
  },
  borrarDeuda(id: string) {
    set((s) => ({ ...s, deudas: s.deudas.filter((d) => d.id !== id) }));
  },
  addEncargo(e: Omit<Encargo, "id" | "creada" | "entregado">) {
    set((s) => ({ ...s, encargos: [{ ...e, id: uid(), creada: hoy(), entregado: false }, ...s.encargos] }));
  },
  toggleEncargo(id: string) {
    set((s) => ({ ...s, encargos: s.encargos.map((e) => (e.id === id ? { ...e, entregado: !e.entregado } : e)) }));
  },
  borrarEncargo(id: string) {
    set((s) => ({ ...s, encargos: s.encargos.filter((e) => e.id !== id) }));
  },
  upsertProducto(p: Producto) {
    set((s) => {
      const exists = s.productos.some((x) => x.codigo === p.codigo);
      return {
        ...s,
        productos: exists ? s.productos.map((x) => (x.codigo === p.codigo ? p : x)) : [...s.productos, p],
      };
    });
  },
  ajustarStock(codigo: string, delta: number) {
    set((s) => {
      const exists = s.productos.some((x) => x.codigo === codigo);
      const productos = exists
        ? s.productos.map((x) => {
            if (x.codigo !== codigo) return x;
            const stock = Math.max(0, x.stock + delta);
            const n = { ...x, stock };
            if (delta > 0 && (x.stock === 0 || !x.fechaIngreso)) n.fechaIngreso = hoy();
            if (delta < 0 && x.stock > 0) n.ultimaVenta = hoy();
            return n;
          })
        : [...s.productos, { codigo, nombre: "", stock: Math.max(0, delta), tipo: "perfume" as const, fechaIngreso: delta > 0 ? hoy() : undefined }];
      return { ...s, productos };
    });
  },
  borrarProducto(codigo: string) {
    set((s) => ({ ...s, productos: s.productos.filter((p) => p.codigo !== codigo) }));
  },
  setTelefono(cliente: string, tel: string) {
    set((s) => ({ ...s, telefonos: { ...s.telefonos, [cliente.toLowerCase()]: tel } }));
  },
};

export function whatsappLink(tel: string | undefined, cliente: string, monto: number, fecha?: string) {
  const msg = `Hola ${cliente} 🌸, te saluda PaMaRa AyN. Te recuerdo con cariño tu pago de ${clp(monto)}${
    fecha ? ` comprometido para el ${fechaBonita(fecha)}` : ""
  }. ¡Muchas gracias por tu confianza! 💛`;
  const num = (tel ?? "").replace(/\D/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}

export function fechaBonita(f: string) {
  const d = new Date(f + "T12:00:00");
  return d.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });
}

export function diasHasta(f: string) {
  const a = new Date(hoy() + "T12:00:00").getTime();
  const b = new Date(f + "T12:00:00").getTime();
  return Math.round((b - a) / 86400000);
}
