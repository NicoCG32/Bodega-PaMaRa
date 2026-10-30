# 05 — Reglas y núcleo

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** técnica.

## Núcleo e invariantes

Revisión documental: 2026-10-29. Base `482ddd6b2f71` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Aplicación web y cliente Android beta documentados. El código actual añade catálogo/boutique y captura paralela; notificaciones, actualización y operación real requieren evidencia específica.

- Saldo es total menos abonos válidos; una cuota programada no es un pago por sí misma.
- Códigos se normalizan antes de enlazar catálogo/operación.
- Las dos transcripciones representan alternativas del mismo relato, no movimientos que deban sumarse.
- La IA valida esquema y previsualiza; la persona confirma el registro.
- La boutique sólo expone datos aprobados del catálogo, no deudas ni teléfonos privados.
- Horarios de avisos en UTC y horario Chile deben distinguirse según la configuración real.

### Entradas, decisión y efectos

El recorrido de [03-flujo-de-usuario.md](03-flujo-de-usuario.md) proporciona entradas al núcleo. Las reglas anteriores determinan lo aceptado y sus efectos; UI y proveedores externos no deben sustituir silenciosamente esas decisiones. El modelo de [04-base-de-datos.md](04-base-de-datos.md) identifica los estados/referencias afectados.

Las fórmulas y parámetros detallados permanecen en las fuentes especializadas enlazadas. Distinguir parámetros provisionales, azar, reloj y resultados persistidos; cambiar presentación o reexportar no debe presentarse como una nueva evaluación equivalente sin identificarlo.

### Pruebas con propósito

Proteger al menos una transición válida, un rechazo importante y la repetición/reapertura que pueda duplicar efectos. No inventar una suite ni un porcentaje de cobertura: consultar los comandos existentes y la evidencia de su ejecución en [09-instalacion-y-despliegue.md](09-instalacion-y-despliegue.md).

## Fuentes de implementación y contratos

[README.md](../README.md) · [src/lib/store.ts](../src/lib/store.ts) · [src/lib/cloudSync.ts](../src/lib/cloudSync.ts) · [src/lib/ai.functions.ts](../src/lib/ai.functions.ts) · [src/lib/vozNativa.ts](../src/lib/vozNativa.ts) · [docs/09-instalacion-y-despliegue.md](09-instalacion-y-despliegue.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->
