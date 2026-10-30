# 02 — Catálogo funcional

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** general / técnica.

## Catálogo de capacidades — revisión 2026-10-29

Revisión documental: 2026-10-29. Base `482ddd6b2f71` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Aplicación web y cliente Android beta documentados. El código actual añade catálogo/boutique y captura paralela; notificaciones, actualización y operación real requieren evidencia específica.

| Módulo          | Capacidad / propósito        | Caso borde o límite                |
| --------------- | ---------------------------- | ---------------------------------- |
| Captura         | Voz/texto y resumen          | Cancelación, demora y alternativas |
| Cobros          | Deudas, abonos y cuotas      | Saldo y vencimiento                |
| Encargos        | Pedidos y entrega            | Producto por código                |
| Bodega          | Stock, rotación y reposición | Sin precio o sin existencia        |
| Boutique        | Catálogo público             | Separación de datos privados       |
| Respaldo/avisos | Sync y recordatorios         | Conflicto, permisos y app cerrada  |

Los módulos propuestos se identifican expresamente. La disponibilidad en una plataforma no se extrapola a las demás; la aceptación debe cubrir los casos borde del recorrido principal.

## Fuentes de implementación y contratos

[README.md](../README.md) · [src/lib/store.ts](../src/lib/store.ts) · [src/lib/cloudSync.ts](../src/lib/cloudSync.ts) · [src/lib/ai.functions.ts](../src/lib/ai.functions.ts) · [src/lib/vozNativa.ts](../src/lib/vozNativa.ts) · [docs/09-instalacion-y-despliegue.md](09-instalacion-y-despliegue.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->
