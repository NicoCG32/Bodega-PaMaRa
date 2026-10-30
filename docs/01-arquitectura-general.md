# 01 — Arquitectura por niveles

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** técnica.

## Arquitectura del sistema por niveles

Revisión documental: 2026-10-29. Base `482ddd6b2f71` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Aplicación web y cliente Android beta documentados. El código actual añade catálogo/boutique y captura paralela; notificaciones, actualización y operación real requieren evidencia específica.

### Nivel 1 — Contexto y fronteras de ejecución

```text
[Administradora] -> [Web móvil / APK TWA]
                           |
                 [Voz nativa + audio grabado]
                           |
                [RPC IA servidor -> borrador]
                           | confirmación
                     [store.ts local]
                           |
                [Supabase: snapshot privado]

[Visitante] -> [Boutique: catálogo público acotado]
[Job programado] -> [Mensajería / avisos consentidos]
```

Registro móvil por voz/texto con revisión, catálogo por código y seguimiento de fiados, abonos, cuotas y encargos. Estado local con respaldo de snapshot al iniciar sesión; la boutique pública debe exponer una proyección distinta del registro privado.

### Nivel 2 — Componentes y responsabilidades

| Componente     | Responsabilidad                         | Fuente                                                |
| -------------- | --------------------------------------- | ----------------------------------------------------- |
| Estado         | Productos, fiados, abonos y encargos    | [src/lib/store.ts](../src/lib/store.ts)               |
| Motor          | Interpretación a operaciones revisables | [src/lib/motor.ts](../src/lib/motor.ts)               |
| IA             | Proveedores y esquemas del servidor     | [src/lib/ai.functions.ts](../src/lib/ai.functions.ts) |
| Dictado        | Alternativas nativa/grabada y tiempos   | [src/lib/vozNativa.ts](../src/lib/vozNativa.ts)       |
| Sincronización | Snapshot por cuenta                     | [src/lib/cloudSync.ts](../src/lib/cloudSync.ts)       |
| Boutique       | Proyección pública del catálogo         | [src/lib/boutique.ts](../src/lib/boutique.ts)         |

Las flechas del contexto representan comunicación/flujo. No se deduce una dependencia de código o transacción compartida sólo porque dos componentes intercambien datos.

### Nivel 3 — Dominio, contratos y adaptadores

localStorage contiene el State; Supabase guarda un snapshot JSON por cuenta según cloudSync. El snapshot de nube más reciente puede reemplazar caché local según reglas existentes. No describir deudas/productos como tablas relacionales remotas si no lo son; permisos de la fila backup no sustituyen validación del contenido y conflictos.

- Saldo es total menos abonos válidos; una cuota programada no es un pago por sí misma.
- Códigos se normalizan antes de enlazar catálogo/operación.
- Las dos transcripciones representan alternativas del mismo relato, no movimientos que deban sumarse.

Consultar [04-base-de-datos.md](04-base-de-datos.md) para entidades, cardinalidades y representación; [05-motor-o-nucleo-de-negocio.md](05-motor-o-nucleo-de-negocio.md) para invariantes. En un prototipo, las piezas rotuladas propuestas no son clases implementadas.

### Nivel 4 — Despliegue y distribución

**Destino:** APK en GitHub Releases + Webpage.

```text
[Revisión de fuente] -> [Verificación de su plataforma] -> [Build / artefacto]
                                                                  |
                                                          [Instalación / hosting]
                                                                  |
                                                          [Usuario y sus datos]
```

La persistencia y los servicios del contexto anterior conservan sus propias fronteras. Distribuir un APK no incorpora automáticamente el servidor, una PWA no acredita un instalador y el firmware requiere dispositivo. El capítulo [09-instalacion-y-despliegue.md](09-instalacion-y-despliegue.md) concreta la puesta en marcha.

### Calidad y límites arquitectónicos

- Conflictos y pérdida de State entre dispositivos
- Operaciones duplicadas por respuesta tardía de voz
- Exposición de datos de cobro al catálogo público
- Cron/push y custodia de firma Android

No se publican garantías de latencia, disponibilidad o escala sin medición para la revisión/entorno concretos. Un diagrama explica responsabilidades; no es una certificación de ejecución o seguridad del servicio desplegado.

## Fuentes de implementación y contratos

[README.md](../README.md) · [src/lib/store.ts](../src/lib/store.ts) · [src/lib/cloudSync.ts](../src/lib/cloudSync.ts) · [src/lib/ai.functions.ts](../src/lib/ai.functions.ts) · [src/lib/vozNativa.ts](../src/lib/vozNativa.ts) · [docs/09-instalacion-y-despliegue.md](09-instalacion-y-despliegue.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->
