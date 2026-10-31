# 01 — Arquitectura por niveles

## Arquitectura del sistema por niveles

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

Las flechas muestran el flujo de información entre componentes. Las transacciones y dependencias de código se detallan en los contratos de cada módulo.

### Nivel 3 — Dominio, contratos y adaptadores

localStorage contiene el State; Supabase guarda un snapshot JSON por cuenta según cloudSync. El snapshot de nube más reciente puede reemplazar caché local según reglas existentes. No describir deudas/productos como tablas relacionales remotas si no lo son; permisos de la fila backup no sustituyen validación del contenido y conflictos.

- Saldo es total menos abonos válidos; una cuota programada no es un pago por sí misma.
- Códigos se normalizan antes de enlazar catálogo/operación.
- Las dos transcripciones representan alternativas del mismo relato, no movimientos que deban sumarse.

Consultar [04-base-de-datos.md](04-base-de-datos.md) para entidades, cardinalidades y representación; [05-motor-o-nucleo-de-negocio.md](05-motor-o-nucleo-de-negocio.md) para invariantes. Las piezas marcadas como propuestas pertenecen al diseño del prototipo.

### Nivel 4 — Despliegue y distribución

**Destino:** APK en GitHub Releases + Webpage.

```text
[Revisión de fuente] -> [Verificación de su plataforma] -> [Build / artefacto]
                                                                  |
                                                          [Instalación / hosting]
                                                                  |
                                                          [Usuario y sus datos]
```

El cliente Android beta abre la aplicación publicada mediante Trusted Web Activity. Conserva la firma y el identificador al actualizarlo. La asociación HTTPS del dominio y los servicios de la web se administran por separado de la release del APK. El capítulo [09-instalacion-y-despliegue.md](09-instalacion-y-despliegue.md) concreta la puesta en marcha.

### Calidad y límites arquitectónicos

- Conflictos y pérdida de State entre dispositivos
- Operaciones duplicadas por respuesta tardía de voz
- Exposición de datos de cobro al catálogo público
- Cron/push y custodia de firma Android

El rendimiento y la capacidad dependen del entorno de ejecución. Consulta las guías de instalación y las limitaciones de cada plataforma antes de desplegar.

## Código y documentación relacionada

[README.md](../README.md) · [src/lib/store.ts](../src/lib/store.ts) · [src/lib/cloudSync.ts](../src/lib/cloudSync.ts) · [src/lib/ai.functions.ts](../src/lib/ai.functions.ts) · [src/lib/vozNativa.ts](../src/lib/vozNativa.ts) · [docs/09-instalacion-y-despliegue.md](09-instalacion-y-despliegue.md).
