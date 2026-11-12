import { supabase } from "@/integrations/supabase/client";

export const BUCKET_FOTOS = "fotos-productos";

/** Reduce la foto en el teléfono (máx 1200px, JPEG) para que cargue rápido. */
async function comprimir(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const max = 1200;
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((ok, mal) =>
    c.toBlob((b) => (b ? ok(b) : mal(new Error("No se pudo leer la foto"))), "image/jpeg", 0.8),
  );
}

/** Sube la foto y devuelve su ruta guardada. */
export async function subirFoto(file: File, codigo: string): Promise<string> {
  const blob = await comprimir(file);
  const ruta = `${codigo}-${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET_FOTOS)
    .upload(ruta, blob, { contentType: "image/jpeg", upsert: true });
  if (error) throw error;
  return ruta;
}

export async function verFoto(ruta: string): Promise<string | null> {
  const { data } = await supabase.storage.from(BUCKET_FOTOS).createSignedUrl(ruta, 3600);
  return data?.signedUrl ?? null;
}
