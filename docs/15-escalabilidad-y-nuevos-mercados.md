# 15 — Justificación, proyección y escalabilidad

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** desarrollo del proyecto.

## Justificación y proyección

Revisión documental: 2026-10-29. Base `482ddd6b2f71` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Aplicación web y cliente Android beta documentados. El código actual añade catálogo/boutique y captura paralela; notificaciones, actualización y operación real requieren evidencia específica.

### Ajuste entre problema y solución

| Necesidad                     | Razón del diseño                                                           |
| ----------------------------- | -------------------------------------------------------------------------- |
| Captura dispersa              | Una interpretación revisable conecta el relato con operaciones del dominio |
| Stock y compromisos separados | Códigos de producto enlazan existencias, encargos y operaciones            |
| Pérdida de registros          | Snapshot y recuperación explícitos facilitan continuidad por dispositivo   |

Tiempo de captura revisada y discrepancias de stock/saldo; recuperación de un snapshot y facilidad de uso por la administradora.

### Qué se puede abstraer y qué no

Las entidades, reglas y fronteras de [04-base-de-datos.md](04-base-de-datos.md) permiten evaluar reutilización. Cambiar un nombre o una categoría no prueba compatibilidad con otro sector: datos, permisos, reglas, operación y costos deben validarse de nuevo.

### Extensiones de contexto: hipótesis, no mercados validados

- Pequeños comercios con fiado
- Ventas por encargo
- Emprendimientos de catálogo
- Ferias con inventario y cobros simples

No se atribuyen clientes, ventas, demanda ni superioridad sobre competidores sin evidencia. La primera validación consiste en una necesidad concreta, un flujo útil y disposición real a adoptarlo. Para juegos, el valor inicial es una experiencia disfrutable, no ahorro de horas ni una promesa educativa no ensayada.

### Límites y trade-offs

- Conflictos y pérdida de State entre dispositivos
- Operaciones duplicadas por respuesta tardía de voz
- Exposición de datos de cobro al catálogo público
- Cron/push y custodia de firma Android

### Prioridad de inversión

| Prioridad   | Iniciativa                                                                      | Impacto a comprobar                                                                                                              | Criterio económico                                                    |
| ----------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Alta        | Validación con la administradora, recuperación y flujos web/Android de registro | Tiempo de captura revisada y discrepancias de stock/saldo; recuperación de un snapshot y facilidad de uso por la administradora. | Rango de esfuerzo y costo en capítulo 18; no presupuesto comprometido |
| Media       | Reproducción, soporte y recuperación por plataforma                             | Menos fallos de entrega y pérdida de datos                                                                                       | Costo recurrente separado de implementación                           |
| Estratégica | Validar una extensión/forma de sostenimiento                                    | Uso y aceptación fuera del contexto inicial                                                                                      | Investigar costos, demanda y condiciones antes de monetizar           |

Las cifras CLP/USD, supuestos, sensibilidad y retorno se presentan en [18-analisis-economico-clp-usd.md](18-analisis-economico-clp-usd.md); no son una valoración comercial del repositorio.

## Fuentes de implementación y contratos

[README.md](../README.md) · [src/lib/store.ts](../src/lib/store.ts) · [src/lib/cloudSync.ts](../src/lib/cloudSync.ts) · [src/lib/ai.functions.ts](../src/lib/ai.functions.ts) · [src/lib/vozNativa.ts](../src/lib/vozNativa.ts) · [docs/09-instalacion-y-despliegue.md](09-instalacion-y-despliegue.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->
