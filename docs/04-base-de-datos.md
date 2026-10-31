# 04 — Dominio, entidades y persistencia

## Dominio y representación de datos

### Entidades y conceptos

| Entidad / concepto | Identidad y significado           | Representación / estado                                   |
| ------------------ | --------------------------------- | --------------------------------------------------------- |
| Producto           | Código, stock, precio y atributos | State local                                               |
| Deuda              | Cliente, producto, total y abonos | State privado                                             |
| Cuota              | Monto, fecha y pagada             | Dentro de Deuda                                           |
| Encargo            | Cliente, código, nota y entrega   | State privado                                             |
| Abono              | Monto y fecha                     | Registro de pago de deuda                                 |
| Backup             | Snapshot data y updated_at        | Nube por cuenta; no tablas normalizadas para cada entidad |

### Relaciones de dominio

```text
[Deuda] -- 1:N --> [Cuota]
[Deuda] -- 1:N --> [Abono]
[Producto] -- referenciado por --> [Encargo]
[Cuenta] -- posee --> [Snapshot]
[CatálogoPrivado] -- proyecta --> [Boutique]
```

| Origen          | Cardinalidad / relación | Destino  | Semántica                                    |
| --------------- | ----------------------- | -------- | -------------------------------------------- |
| Deuda           | 1:N                     | Cuota    | Plan de pagos no equivale a abono confirmado |
| Deuda           | 1:N                     | Abono    | Reduce saldo según regla                     |
| Producto        | referenciado por        | Encargo  | Vínculo mediante código normalizado          |
| Cuenta          | posee                   | Snapshot | Aislamiento del respaldo                     |
| CatálogoPrivado | proyecta                | Boutique | No incluir cobros ni datos personales        |

### Persistencia y garantías

localStorage contiene el State; Supabase guarda un snapshot JSON por cuenta según cloudSync. El snapshot de nube más reciente puede reemplazar caché local según reglas existentes. No describir deudas/productos como tablas relacionales remotas si no lo son; permisos de la fila backup no sustituyen validación del contenido y conflictos.

El diagrama describe relaciones del dominio. Los adaptadores y el esquema de persistencia determinan cómo se mantienen esas relaciones al guardar o recuperar datos.

### Consistencia y evolución

- Saldo es total menos abonos válidos; una cuota programada no es un pago por sí misma.
- Códigos se normalizan antes de enlazar catálogo/operación.
- Las dos transcripciones representan alternativas del mismo relato, no movimientos que deban sumarse.
- La IA valida esquema y previsualiza; la persona confirma el registro.
- La boutique sólo expone datos aprobados del catálogo, no deudas ni teléfonos privados.
- Horarios de avisos en UTC y horario Chile deben distinguirse según la configuración real.

Antes de cambiar el formato de almacenamiento, comprueba la migración y la restauración con una copia de prueba. Conserva la versión del respaldo y verifica su compatibilidad con la aplicación que lo abrirá.

## Código y documentación relacionada

[README.md](../README.md) · [src/lib/store.ts](../src/lib/store.ts) · [src/lib/cloudSync.ts](../src/lib/cloudSync.ts) · [src/lib/ai.functions.ts](../src/lib/ai.functions.ts) · [src/lib/vozNativa.ts](../src/lib/vozNativa.ts) · [docs/09-instalacion-y-despliegue.md](09-instalacion-y-despliegue.md).
