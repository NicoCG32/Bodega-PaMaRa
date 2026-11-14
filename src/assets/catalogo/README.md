# Imágenes de referencia del catálogo

Cada escena tiene tres versiones WebP cuadradas: `CODIGO-480.webp`, `CODIGO-768.webp` y `CODIGO-1024.webp`. Los códigos corresponden a `src/lib/perfumes.ts`: `M-NN`, `H-NN` y `T-NN`.

Las escenas se guardan sin textos ni logotipo superpuesto. `ProductVisual` añade la marca PaMaRa AyN, el código, el nombre, la marca de referencia y la leyenda mediante elementos HTML y CSS. La ficha ampliada incluye la descripción del aroma de inspiración.

Para añadir una referencia, incorporar los tres tamaños con el código del producto. `src/lib/catalogo-imagenes.ts` los detecta durante la compilación y obtiene el nombre y la marca del catálogo oficial. Las tarjetas utilizan 480 o 768 px; la ficha puede utilizar 1024 px. Vite publica las imágenes como archivos separados con nombres versionados.

Las fotos subidas desde Bodega tienen prioridad. Si una foto falla, se muestra la referencia disponible y, como último recurso, la ilustración del catálogo. Estos archivos no modifican la visibilidad, el stock ni el precio de un producto.
