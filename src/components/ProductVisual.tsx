import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import monograma from "@/assets/pamara-monograma.webp";
import logoEditorial from "@/assets/pamara-editorial-logo.webp";
import { IMAGENES_CATALOGO } from "@/lib/catalogo-imagenes";
import type { ItemPublico } from "@/lib/boutique";

export function ProductVisual({
  item,
  ampliada = false,
}: {
  item: ItemPublico;
  ampliada?: boolean;
}) {
  const [fallidas, setFallidas] = useState<Set<string>>(() => new Set());
  const fallo = (src: string) => setFallidas((prev) => new Set(prev).add(src));
  if (item.foto && !fallidas.has(item.foto))
    return (
      <img
        key={item.foto}
        src={item.foto}
        alt={item.nombre}
        loading={ampliada ? "eager" : "lazy"}
        decoding="async"
        className="product-photo"
        onError={() => fallo(item.foto!)}
      />
    );

  const referencia = item.perfume ? IMAGENES_CATALOGO[item.codigo] : undefined;
  if (referencia && !fallidas.has(referencia.pequena))
    return (
      <div className={"catalog-artwork" + (ampliada ? " is-expanded" : "")}>
        <img
          key={referencia.pequena}
          src={ampliada ? referencia.grande : referencia.pequena}
          srcSet={
            ampliada
              ? `${referencia.mediana} 768w, ${referencia.grande} 1024w`
              : `${referencia.pequena} 480w, ${referencia.mediana} 768w`
          }
          sizes={
            ampliada
              ? "(max-width: 760px) calc(100vw - 64px), 420px"
              : "(max-width: 760px) calc((100vw - 55px) / 2), (max-width: 1100px) calc((100vw - 265px) / 3), (max-width: 1400px) calc((100vw - 360px) / 3), 335px"
          }
          width={1024}
          height={1024}
          loading={ampliada ? "eager" : "lazy"}
          decoding="async"
          alt={`Imagen referencial del aroma inspirado en ${referencia.nombre} de ${referencia.marca}`}
          className="catalog-artwork-scene"
          onError={() => fallo(referencia.pequena)}
        />
        <div className="catalog-artwork-brand" aria-hidden="true">
          <img src={logoEditorial} alt="" width={240} height={196} loading="lazy" />
          <span>{item.codigo}</span>
        </div>
        <div className="catalog-artwork-copy" aria-hidden="true">
          <span className="catalog-artwork-title">{referencia.nombre}</span>
          <span className="catalog-artwork-maker">{referencia.marca}</span>
          <span className="catalog-artwork-reference">Imagen referencial</span>
          {ampliada && (
            <span className="catalog-artwork-description">
              Aroma inspirado en {referencia.nombre} de {referencia.marca}
            </span>
          )}
        </div>
      </div>
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
