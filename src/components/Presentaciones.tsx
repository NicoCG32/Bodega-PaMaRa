import { LOGO_PARFUMS, PRESENTACIONES, presentacionParaCodigo } from "@/lib/presentaciones";
import "@/presentaciones.css";

export function Presentaciones() {
  return (
    <section id="presentaciones" className="presentaciones" aria-labelledby="presentaciones-title">
      <div className="page-width">
        <div className="presentaciones-heading">
          <div>
            <p className="eyebrow">El detalle que acompaña tu esencia</p>
            <h2 id="presentaciones-title">
              Nuestras <em>presentaciones.</em>
            </h2>
          </div>
          <p>Conoce los frascos y estuches. Elige tu fragancia y conversemos para pedir la tuya.</p>
        </div>
        <div className="presentaciones-grid">
          {PRESENTACIONES.map((p) => (
            <figure key={p.id}>
              <div className="presentacion-photo">
                <img
                  src={p.imagen}
                  alt={`Frasco y estuche: ${p.nombre.toLowerCase()}`}
                  width={720}
                  height={720}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption>{p.nombre}</figcaption>
            </figure>
          ))}
        </div>
        <div className="presentaciones-bottom">
          <p>
            ¿Cuál va contigo? <a href="#coleccion">Encuentra tu próxima esencia ↗</a>
          </p>
          <img
            src={LOGO_PARFUMS}
            alt="Parfums d’Parfums"
            width={480}
            height={202}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}

export function PresentacionProducto({ codigo }: { codigo: string }) {
  const p = presentacionParaCodigo(codigo);
  if (!p) return null;
  return (
    <div className="presentacion-detail">
      <img
        src={p.imagen}
        alt={`Frasco y estuche: ${p.nombre.toLowerCase()}`}
        width={720}
        height={720}
        loading="lazy"
        decoding="async"
      />
      <div>
        <p className="eyebrow">Frasco y estuche</p>
        <strong>{p.nombre}</strong>
        <p>Consulta por esta presentación al hacer tu pedido.</p>
      </div>
    </div>
  );
}
