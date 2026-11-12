import { ShoppingBag } from "lucide-react";
import monograma from "@/assets/pamara-monograma.webp";
import type { ItemPublico } from "@/lib/boutique";

export function ProductVisual({ item }: { item: ItemPublico }) {
  if (item.foto)
    return (
      <img
        src={item.foto}
        alt={item.nombre}
        loading="lazy"
        decoding="async"
        className="product-photo"
      />
    );

  return (
    <div
      className={"product-illustration " + (item.codigo.startsWith("M-") ? "is-rose" : "is-sand")}
      aria-hidden="true"
    >
      <span className="illustration-orbit" />
      {item.perfume ? (
        <div className="perfume-bottle">
          <span className="perfume-cap" />
          <div className="perfume-glass">
            <div className="perfume-label">
              <img src={monograma} alt="" />
              <span>PaMaRa</span>
              <small>AYN · INSPIRACIÓN</small>
            </div>
          </div>
        </div>
      ) : (
        <div className="product-symbol">
          <ShoppingBag strokeWidth={1} />
          <span>PaMaRa AyN</span>
        </div>
      )}
      <span className="illustration-caption">Ilustración de referencia</span>
    </div>
  );
}
