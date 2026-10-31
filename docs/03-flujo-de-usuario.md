# 03 — Recorrido y estados

## Recorrido operativo y estados

1. Abrir estado local o iniciar sesión para respaldo.
2. Dictar/escribir o elegir una operación.
3. Revisar cliente, código, montos y cantidades.
4. Confirmar y comprobar saldo/stock/encargo.
5. Respaldar y revisar avisos o catálogo público según rol.

### Confirmación y resultado

Saldo es total menos abonos válidos; una cuota programada no es un pago por sí misma.

Horarios de avisos en UTC y horario Chile deben distinguirse según la configuración real.

### Criterio de aceptación del recorrido

Tiempo de captura revisada y discrepancias de stock/saldo; recuperación de un snapshot y facilidad de uso por la administradora.

Validar inicio, camino principal, error relevante, cancelación y reapertura según la plataforma; registrar también los escenarios aún no ejecutados. Para PaMaRa Bodega, atender especialmente: conflictos y pérdida de state entre dispositivos.

## Código y documentación relacionada

[README.md](../README.md) · [src/lib/store.ts](../src/lib/store.ts) · [src/lib/cloudSync.ts](../src/lib/cloudSync.ts) · [src/lib/ai.functions.ts](../src/lib/ai.functions.ts) · [src/lib/vozNativa.ts](../src/lib/vozNativa.ts) · [docs/09-instalacion-y-despliegue.md](09-instalacion-y-despliegue.md).
