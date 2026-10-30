# 08 — Salidas y entregables

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** técnica.

## Salidas, respaldo e informes

Revisión documental: 2026-10-29. Base `482ddd6b2f71` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Aplicación web y cliente Android beta documentados. El código actual añade catálogo/boutique y captura paralela; notificaciones, actualización y operación real requieren evidencia específica.

Snapshot de respaldo y proyección pública de catálogo tienen finalidades diferentes. El APK beta y su checksum son artefactos de distribución; no contienen inventario familiar, cuentas o datos de cobro.

### Separación de entregables

- **Resultado de uso:** información/experiencia que obtiene la persona al completar el recorrido.
- **Datos o respaldo:** sólo los formatos explícitamente implementados y su contrato de restauración.
- **Distribución:** aplicación, APK, ZIP o firmware, con fuente y versión; no incluye datos privados por defecto.
- **Documentación académica:** informes/anexos históricos, cuando el origen formativo aplica; se catalogan en su cuarto nivel, sin reescribirlos como especificación vigente.

Cuando un informe representa una decisión calculada, identificar resultados/datos de origen y sus versiones. Si la exportación recalcula por diseño, declararlo; no afirmar inmutabilidad inexistente. Para un proyecto sin exportador funcional, este texto delimita lo que falta y no lo presenta como disponible.

## Fuentes de implementación y contratos

[README.md](../README.md) · [src/lib/store.ts](../src/lib/store.ts) · [src/lib/cloudSync.ts](../src/lib/cloudSync.ts) · [src/lib/ai.functions.ts](../src/lib/ai.functions.ts) · [src/lib/vozNativa.ts](../src/lib/vozNativa.ts) · [docs/09-instalacion-y-despliegue.md](09-instalacion-y-despliegue.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->
