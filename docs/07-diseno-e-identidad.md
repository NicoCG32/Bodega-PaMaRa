# 07 — Diseño y accesibilidad

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** técnica / producto.

## Identidad y experiencia de uso

Revisión documental: 2026-10-29. Base `482ddd6b2f71` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Aplicación web y cliente Android beta documentados. El código actual añade catálogo/boutique y captura paralela; notificaciones, actualización y operación real requieren evidencia específica.

Experiencia cálida y accesible para una persona no especializada: controles grandes, lenguaje directo y revisión de montos/códigos. La vista pública de tienda debe distinguirse de la bodega privada. Tema/responsive no acreditan por sí solos accesibilidad o uso con micrófono real.

### Criterios verificables

- Estados vacíos, carga, confirmación y error distinguibles por texto además de color.
- Orden de foco, teclado y nombres accesibles cuando la plataforma los utilice.
- Legibilidad y controles suficientes para el dispositivo objetivo; considerar área segura y ciclo de vida en móvil.
- Evitar que animación, espera o respuesta tardía apliquen efectos ajenos a la selección vigente.

Son criterios de revisión, no certificaciones de accesibilidad ya obtenidas. La aceptación se registra por resolución/plataforma y recorrido; no se extrapola desde una captura aislada.

## Fuentes de implementación y contratos

[README.md](../README.md) · [src/lib/store.ts](../src/lib/store.ts) · [src/lib/cloudSync.ts](../src/lib/cloudSync.ts) · [src/lib/ai.functions.ts](../src/lib/ai.functions.ts) · [src/lib/vozNativa.ts](../src/lib/vozNativa.ts) · [docs/09-instalacion-y-despliegue.md](09-instalacion-y-despliegue.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->

<!-- IDENTIDAD:2026-10-30 -->

## Recursos de identidad y distribución

[Catálogo de originales y variantes](../branding/README.md) · [Manifest de identidad](../branding/manifest.json).

La web usa el logotipo completo PaMaRa AyN optimizado en WebP. Favicon, Apple Touch y PWA utilizan el monograma; el launcher Android incorpora el icono preparado. La TWA sigue dependiendo del sitio publicado.

Los banners de presentación se seleccionan por tema en el README. Las aplicaciones incorporan sólo los recursos necesarios, con dimensiones/proporción estables; las variantes y originales permanecen en branding. La identidad visual no amplía funcionalidades ni cambia las condiciones de uso.
