# 07 — Diseño y accesibilidad

## Identidad y experiencia de uso

Experiencia cálida y accesible para una persona no especializada: controles grandes, lenguaje directo y revisión de montos/códigos. La vista pública de tienda debe distinguirse de la bodega privada. Tema/responsive no acreditan por sí solos accesibilidad o uso con micrófono real.

### Criterios verificables

- Estados vacíos, carga, confirmación y error distinguibles por texto además de color.
- Orden de foco, teclado y nombres accesibles cuando la plataforma los utilice.
- Legibilidad y controles suficientes para el dispositivo objetivo; considerar área segura y ciclo de vida en móvil.
- Evitar que animación, espera o respuesta tardía apliquen efectos ajenos a la selección vigente.

Comprueba estos criterios en los recorridos principales y en los tamaños de pantalla de la plataforma que vas a utilizar.

## Código y documentación relacionada

[README.md](../README.md) · [src/lib/store.ts](../src/lib/store.ts) · [src/lib/cloudSync.ts](../src/lib/cloudSync.ts) · [src/lib/ai.functions.ts](../src/lib/ai.functions.ts) · [src/lib/vozNativa.ts](../src/lib/vozNativa.ts) · [docs/09-instalacion-y-despliegue.md](09-instalacion-y-despliegue.md).

## Recursos de identidad y distribución

[Catálogo de originales y variantes](../branding/README.md) · [Manifest de identidad](../branding/manifest.json).

La web usa el logotipo completo PaMaRa AyN optimizado en WebP. Favicon, Apple Touch y PWA utilizan el monograma; el launcher Android incorpora el icono preparado. La TWA sigue dependiendo del sitio publicado.

Los banners de presentación se seleccionan por tema en el README. Las aplicaciones incorporan sólo los recursos necesarios, con dimensiones/proporción estables; las variantes y originales permanecen en branding. La identidad visual no amplía funcionalidades ni cambia las condiciones de uso.
