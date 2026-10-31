# 05 — Reglas y núcleo

## Núcleo e invariantes

- Saldo es total menos abonos válidos; una cuota programada no es un pago por sí misma.
- Códigos se normalizan antes de enlazar catálogo/operación.
- Las dos transcripciones representan alternativas del mismo relato, no movimientos que deban sumarse.
- La IA valida esquema y previsualiza; la persona confirma el registro.
- La boutique sólo expone datos aprobados del catálogo, no deudas ni teléfonos privados.
- Horarios de avisos en UTC y horario Chile deben distinguirse según la configuración real.

### Entradas, decisión y efectos

El recorrido de [03-flujo-de-usuario.md](03-flujo-de-usuario.md) proporciona entradas al núcleo. Las reglas anteriores determinan lo aceptado y sus efectos; UI y proveedores externos no deben sustituir silenciosamente esas decisiones. El modelo de [04-base-de-datos.md](04-base-de-datos.md) identifica los estados/referencias afectados.

Los documentos especializados enlazados detallan las fórmulas, parámetros y efectos de cada operación.

### Pruebas con propósito

Para comprobar el núcleo, cubre una operación válida, una entrada rechazada y la reapertura o repetición de la operación. Los comandos de prueba están en [instalación y despliegue](09-instalacion-y-despliegue.md).

## Código y documentación relacionada

[README.md](../README.md) · [src/lib/store.ts](../src/lib/store.ts) · [src/lib/cloudSync.ts](../src/lib/cloudSync.ts) · [src/lib/ai.functions.ts](../src/lib/ai.functions.ts) · [src/lib/vozNativa.ts](../src/lib/vozNativa.ts) · [docs/09-instalacion-y-despliegue.md](09-instalacion-y-despliegue.md).
