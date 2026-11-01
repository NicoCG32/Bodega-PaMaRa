import { useState } from "react";
import { toast } from "sonner";
import { actions, clp, PRECIOS_INICIALES, useStore, type Precios } from "@/lib/store";

const CAMPOS: { k: keyof Precios; label: string; ayuda: string }[] = [
  { k: "base", label: "Precio general", ayuda: "Para productos sin precio propio" },
  { k: "recargoEncargo", label: "Recargo por encargo (+)", ayuda: "Se suma cuando no hay en repisa" },
  { k: "descuentoRemate", label: "Descuento de liquidación (−)", ayuda: "Se resta tras 30 días sin venderse" },
];

export function PreciosCard() {
  const { precios } = useStore();
  const actual = precios ?? PRECIOS_INICIALES;
  const [v, setV] = useState(() => Object.fromEntries(CAMPOS.map((c) => [c.k, String(actual[c.k])])));
  const num = (k: keyof Precios) => parseInt((v[k] ?? "").replace(/\D/g, "")) || 0;
  const base = num("base");
  return (
    <div className="space-y-3 rounded-3xl bg-card p-5 shadow-soft">
      <p className="text-xl font-bold">💲 Precios de la tienda</p>
      {CAMPOS.map((c) => (
        <label key={c.k} className="block">
          <span className="font-bold">{c.label}</span>
          <span className="block text-sm text-muted-foreground">{c.ayuda}</span>
          <input
            inputMode="numeric"
            value={v[c.k]}
            onChange={(e) => setV({ ...v, [c.k]: e.target.value })}
            className="mt-1 h-14 w-full rounded-2xl border-2 border-input bg-background px-4 text-xl font-bold"
          />
        </label>
      ))}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-secondary p-2">
          <p className="text-sm">🔥 Liquidación</p>
          <p className="font-bold">{clp(Math.max(0, base - num("descuentoRemate")))}</p>
        </div>
        <div className="rounded-2xl bg-secondary p-2">
          <p className="text-sm">📦 En repisa</p>
          <p className="font-bold">{clp(base)}</p>
        </div>
        <div className="rounded-2xl bg-secondary p-2">
          <p className="text-sm">✨ Encargo</p>
          <p className="font-bold">{clp(base + num("recargoEncargo"))}</p>
        </div>
      </div>
      <button
        onClick={() => {
          actions.setPrecios({ base, recargoEncargo: num("recargoEncargo"), descuentoRemate: num("descuentoRemate") });
          toast.success("Precios guardados 💛");
        }}
        className="h-14 w-full rounded-2xl bg-primary text-lg font-bold text-primary-foreground"
      >
        Guardar precios
      </button>
    </div>
  );
}
