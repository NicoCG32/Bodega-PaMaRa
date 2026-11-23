import logoPaMaRa from "@/assets/pamara-editorial-logo.webp";
import { LOGO_PARFUMS } from "./presentaciones";
import { clp } from "./store";
import { TIENDA_WHATSAPP } from "./boutique";
import {
  FORMATOS_COLLAGE,
  distribuirPerfumes,
  presentacionesDeSeleccion,
  validarSeleccion,
  type ArchivoCollage,
  type FormatoCollage,
  type OpcionesCollage,
  type PerfumeCollage,
} from "./collage";

const plum = "#412735";
const gold = "#b18b51";
const sans = "Manrope, Arial, sans-serif";
const serif = '"Cormorant Garamond", Georgia, serif';

function cargarImagen(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = window.setTimeout(() => {
      img.src = "";
      reject(new Error("Una imagen tardó demasiado. Intenta de nuevo."));
    }, 15_000);
    img.onload = () => {
      window.clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error("No se pudo cargar una imagen. Revisa tu conexión e intenta de nuevo."));
    };
    img.src = url;
  });
}

function texto(
  ctx: CanvasRenderingContext2D,
  valor: string,
  x: number,
  y: number,
  max: number,
  size: number,
  color: string,
  familia = sans,
  peso = 600,
) {
  ctx.fillStyle = color;
  ctx.font = `${peso} ${size}px ${familia}`;
  let s = valor.replace(/\s+/g, " ").trim();
  while (ctx.measureText(s).width > max && s.length) s = s.slice(0, -1);
  if (s !== valor.replace(/\s+/g, " ").trim()) s = s.slice(0, -1).trimEnd() + "…";
  ctx.fillText(s, x, y);
}

function titulo(
  ctx: CanvasRenderingContext2D,
  valor: string,
  x: number,
  y: number,
  max: number,
  size: number,
) {
  let tamano = size;
  while (tamano > 30) {
    ctx.font = `600 ${tamano}px ${serif}`;
    if (ctx.measureText(valor).width <= max) break;
    tamano -= 2;
  }
  texto(ctx, valor, x, y, max, tamano, plum, serif);
}

function nombrePerfume(
  ctx: CanvasRenderingContext2D,
  valor: string,
  x: number,
  y: number,
  ancho: number,
  size: number,
) {
  let lineas: string[] = [];
  let tamano = size;
  do {
    ctx.font = `600 ${tamano}px ${serif}`;
    lineas = [];
    let linea = "";
    for (const palabra of valor.split(/\s+/)) {
      const siguiente = linea ? `${linea} ${palabra}` : palabra;
      if (linea && ctx.measureText(siguiente).width > ancho) {
        lineas.push(linea);
        linea = palabra;
      } else linea = siguiente;
    }
    if (linea) lineas.push(linea);
    if (lineas.length <= 2) break;
    tamano -= 1;
  } while (tamano >= 20);
  const visibles = lineas.slice(0, 2);
  visibles.forEach((linea, i) =>
    texto(
      ctx,
      linea,
      x,
      y - (visibles.length - 1 - i) * (tamano + 2),
      ancho,
      tamano,
      "#fff",
      serif,
    ),
  );
}

function imagenContenida(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale,
    dh = img.naturalHeight * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function dibujar(
  formato: FormatoCollage,
  items: PerfumeCollage[],
  opciones: OpcionesCollage,
  imagenes: Map<string, HTMLImageElement>,
): Promise<ArchivoCollage> {
  const canvas = document.createElement("canvas");
  canvas.width = formato.width;
  canvas.height = formato.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo preparar la imagen en este dispositivo.");
  const vertical = formato.id === "vertical";
  ctx.fillStyle = "#f8f4ed";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#ddcdb6";
  ctx.lineWidth = 2;
  ctx.strokeRect(22, 22, canvas.width - 44, canvas.height - 44);
  imagenContenida(ctx, imagenes.get(logoPaMaRa)!, 47, 35, 104, 90);
  texto(ctx, "PERFUMES DE INSPIRACIÓN", 180, 75, 730, 20, gold);
  titulo(ctx, opciones.titulo.trim().slice(0, 70) || "Tu próxima esencia", 180, 130, 840, 60);
  texto(
    ctx,
    opciones.mensaje.trim().slice(0, 100),
    54,
    vertical ? 219 : 180,
    972,
    vertical ? 30 : 26,
    plum,
  );
  const presentaciones = opciones.mostrarPresentaciones ? presentacionesDeSeleccion(items) : [];
  const cajas = distribuirPerfumes(items.length, formato, presentaciones.length > 0);
  items.forEach((p, i) => {
    const { x, y, width: w, height: h } = cajas[i]!;
    const foto = imagenes.get(p.referencia.mediana)!;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 14);
    ctx.clip();
    ctx.drawImage(foto, x, y, w, h);
    const sombra = ctx.createLinearGradient(0, y + h * 0.46, 0, y + h);
    sombra.addColorStop(0, "#24162000");
    sombra.addColorStop(1, "#241620ef");
    ctx.fillStyle = sombra;
    ctx.fillRect(x, y, w, h);
    const pad = w > 400 ? 24 : 15;
    const font = w > 400 ? 38 : 29;
    ctx.fillStyle = "#f8f4edee";
    ctx.beginPath();
    ctx.roundRect(x + pad, y + pad, 83, 32, 16);
    ctx.fill();
    texto(ctx, p.codigo, x + pad + 12, y + pad + 23, 65, 19, plum, sans, 800);
    const conPrecio = opciones.mostrarPrecios && p.precio !== null;
    const base = y + h - pad - (conPrecio ? 40 : 0);
    nombrePerfume(ctx, p.referencia.nombre, x + pad, base - 32, w - 2 * pad, font);
    texto(ctx, p.referencia.marca, x + pad, base - 6, w - 2 * pad, w > 400 ? 22 : 18, "#e6d6be");
    if (conPrecio)
      texto(ctx, clp(p.precio!), x + pad, y + h - pad - 4, w - 2 * pad, 27, "#fff", sans, 800);
    ctx.restore();
  });
  if (presentaciones.length) {
    const y = formato.height - (vertical ? 400 : 278);
    texto(ctx, "NUESTRAS PRESENTACIONES", 54, y, 700, 18, gold);
    const ancho = 972 / presentaciones.length;
    presentaciones.forEach((p, i) => {
      const lado = vertical ? 180 : 112;
      const x = 54 + i * ancho + (ancho - lado) / 2;
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      imagenContenida(ctx, imagenes.get(p.imagen)!, x, y + 14, lado, lado);
      ctx.restore();
      ctx.textAlign = "center";
      texto(ctx, p.nombre, 54 + (i + 0.5) * ancho, y + lado + 40, ancho - 12, 19, plum);
      ctx.textAlign = "left";
    });
  }
  const pie = formato.height - (vertical ? 116 : 92);
  ctx.fillStyle = plum;
  ctx.fillRect(42, pie - 19, 730, 57);
  texto(
    ctx,
    `WhatsApp +${TIENDA_WHATSAPP.slice(0, 2)} ${TIENDA_WHATSAPP.slice(2, 3)} ${TIENDA_WHATSAPP.slice(3, 7)} ${TIENDA_WHATSAPP.slice(7)}`,
    62,
    pie + 18,
    690,
    27,
    "#fff",
    sans,
    700,
  );
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  imagenContenida(ctx, imagenes.get(LOGO_PARFUMS)!, 820, pie - 22, 190, 67);
  ctx.restore();
  texto(
    ctx,
    "pamara-bodega.lovable.app · Imágenes de inspiración referenciales",
    54,
    formato.height - 35,
    960,
    vertical ? 20 : 18,
    "#766771",
    sans,
    400,
  );
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => {
        canvas.width = 1;
        canvas.height = 1;
        if (!blob) return reject(new Error("No se pudo guardar la imagen. Intenta de nuevo."));
        resolve({
          formato,
          archivo: new File([blob], `pamara-collage-${formato.id}.jpg`, { type: "image/jpeg" }),
        });
      },
      "image/jpeg",
      0.94,
    ),
  );
}

export async function crearCollages(
  items: PerfumeCollage[],
  opciones: OpcionesCollage,
): Promise<ArchivoCollage[]> {
  validarSeleccion(items);
  const urls = new Set([
    logoPaMaRa,
    LOGO_PARFUMS,
    ...items.map((p) => p.referencia.mediana),
    ...(opciones.mostrarPresentaciones
      ? presentacionesDeSeleccion(items).map((p) => p.imagen)
      : []),
  ]);
  const entradas = await Promise.all(
    [...urls].map(async (url) => [url, await cargarImagen(url)] as const),
  );
  if (document.fonts)
    await Promise.race([
      Promise.all([
        document.fonts.load(`600 60px ${serif}`),
        document.fonts.load(`600 30px ${sans}`),
        document.fonts.load(`800 27px ${sans}`),
      ]).catch(() => {}),
      new Promise<void>((resolve) => window.setTimeout(resolve, 4_000)),
    ]);
  const imagenes = new Map(entradas);
  // Render sequentially to bound canvas memory on phones.
  const archivos: ArchivoCollage[] = [];
  for (const formato of FORMATOS_COLLAGE)
    archivos.push(await dibujar(formato, items, opciones, imagenes));
  return archivos;
}
