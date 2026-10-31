# 00 — Problemática, cliente y solución

## Síntesis general — PaMaRa Bodega

**Disponibilidad:** Aplicación web y Android beta para ventas, cobros, encargos e inventario, con catálogo público. Las notificaciones y la actualización deben comprobarse en el dispositivo de uso.

### Problemática

Productos, stock, fiados, abonos, cuotas y encargos pueden quedar repartidos en notas, memoria y mensajes. Capturar operaciones cuesta tiempo y los registros incompletos dificultan saber qué hay, qué se debe cobrar y qué falta entregar.

### Cliente, usuario y beneficiario

| Perfil                | Contexto                              | Necesidad                                            |
| --------------------- | ------------------------------------- | ---------------------------------------------------- |
| Usuario inicial       | Persona que administra PaMaRa         | Registrar sin fricción y conservar sus datos         |
| Beneficiario          | Emprendimiento familiar               | Ordenar stock, cobros y encargos                     |
| Visitante de boutique | Persona que consulta catálogo público | Ver oferta sin acceder a deudas o teléfonos privados |

### Solución y límites

Registro móvil por voz/texto con revisión, catálogo por código y seguimiento de fiados, abonos, cuotas y encargos. Estado local con respaldo de snapshot al iniciar sesión; la boutique pública debe exponer una proyección distinta del registro privado.

### Por qué corresponde al problema

| Fricción / necesidad          | Mecanismo de la solución                                                   |
| ----------------------------- | -------------------------------------------------------------------------- |
| Captura dispersa              | Una interpretación revisable conecta el relato con operaciones del dominio |
| Stock y compromisos separados | Códigos de producto enlazan existencias, encargos y operaciones            |
| Pérdida de registros          | Snapshot y recuperación explícitos facilitan continuidad por dispositivo   |

### Validación pendiente o continua

Tiempo de captura revisada y discrepancias de stock/saldo; recuperación de un snapshot y facilidad de uso por la administradora.

Puedes conocer el origen del proyecto en [16-motivacion-y-contexto.md](16-motivacion-y-contexto.md); el análisis de costos y proyección se separa en [18-analisis-economico-clp-usd.md](18-analisis-economico-clp-usd.md).

## Código y documentación relacionada

[README.md](../README.md) · [src/lib/store.ts](../src/lib/store.ts) · [src/lib/cloudSync.ts](../src/lib/cloudSync.ts) · [src/lib/ai.functions.ts](../src/lib/ai.functions.ts) · [src/lib/vozNativa.ts](../src/lib/vozNativa.ts) · [docs/09-instalacion-y-despliegue.md](09-instalacion-y-despliegue.md).
