# 00 — Problemática, cliente y solución

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** general.

## Síntesis general — PaMaRa Bodega

Revisión documental: 2026-10-29. Base `482ddd6b2f71` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Aplicación web y cliente Android beta documentados. El código actual añade catálogo/boutique y captura paralela; notificaciones, actualización y operación real requieren evidencia específica.

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

La motivación del creador se presenta en [16-motivacion-y-contexto.md](16-motivacion-y-contexto.md); el análisis de costos y proyección se separa en [18-analisis-economico-clp-usd.md](18-analisis-economico-clp-usd.md). Afinidad personal, un prototipo o cercanía con una organización no equivalen a demanda/venta demostrada.

## Fuentes de implementación y contratos

[README.md](../README.md) · [src/lib/store.ts](../src/lib/store.ts) · [src/lib/cloudSync.ts](../src/lib/cloudSync.ts) · [src/lib/ai.functions.ts](../src/lib/ai.functions.ts) · [src/lib/vozNativa.ts](../src/lib/vozNativa.ts) · [docs/09-instalacion-y-despliegue.md](09-instalacion-y-despliegue.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->
