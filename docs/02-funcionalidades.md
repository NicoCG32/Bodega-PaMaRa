# 02 — Catálogo funcional

## Capacidades y límites

**Disponibilidad:** Aplicación web y Android beta para ventas, cobros, encargos e inventario, con catálogo público. Las notificaciones y la actualización deben comprobarse en el dispositivo de uso.

| Módulo          | Capacidad / propósito        | Caso borde o límite                |
| --------------- | ---------------------------- | ---------------------------------- |
| Captura         | Voz/texto y resumen          | Cancelación, demora y alternativas |
| Cobros          | Deudas, abonos y cuotas      | Saldo y vencimiento                |
| Encargos        | Pedidos y entrega            | Producto por código                |
| Bodega          | Stock, rotación y reposición | Sin precio o sin existencia        |
| Boutique        | Catálogo público             | Separación de datos privados       |
| Respaldo/avisos | Sync y recordatorios         | Conflicto, permisos y app cerrada  |

Las capacidades previstas se distinguen de las disponibles. Consulta los requisitos de la plataforma que vas a utilizar.

## Código y documentación relacionada

[README.md](../README.md) · [src/lib/store.ts](../src/lib/store.ts) · [src/lib/cloudSync.ts](../src/lib/cloudSync.ts) · [src/lib/ai.functions.ts](../src/lib/ai.functions.ts) · [src/lib/vozNativa.ts](../src/lib/vozNativa.ts) · [docs/09-instalacion-y-despliegue.md](09-instalacion-y-despliegue.md).
