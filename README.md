<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="branding/banners/PaMaRa_AyN_banner_oscuro.png" />
  <img src="branding/banners/PaMaRa_AyN_banner_claro.png" alt="PaMaRa AyN: banner de la marca" width="100%" />
</picture>

# PaMaRa Bodega

**La libreta digital de un emprendimiento familiar.**

[![Web y Android beta](https://img.shields.io/badge/Estado-Web%20%7C%20Android%20beta-77354B?style=flat-square)](docs/general/02-alcance-y-funciones.md)
[![React 19](https://img.shields.io/badge/React-19-20232A?style=flat-square&logo=react)](docs/tecnica/01-arquitectura.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](docs/desarrollo/01-desarrollo-local.md)
[![Licencia](https://img.shields.io/badge/Licencia-PolyForm%20NC-596273?style=flat-square)](LICENSE)
[![Calidad](https://github.com/NicoCG32/Bodega-PaMaRa/actions/workflows/calidad.yml/badge.svg)](https://github.com/NicoCG32/Bodega-PaMaRa/actions/workflows/calidad.yml)

[Abrir boutique](https://pamara-bodega.lovable.app/) · [Abrir Vault](https://pamara-bodega.lovable.app/vault) · [Descargas Android](https://github.com/NicoCG32/Bodega-PaMaRa/releases) · [Documentación](docs/README.md)

</div>

## Resumen ejecutivo

PaMaRa Bodega ayuda a administrar un emprendimiento familiar desde el teléfono: reúne inventario, fiados, abonos y encargos, con captura por voz, texto o foto que se revisa antes de guardar. La boutique permite consultar productos y preparar pedidos por WhatsApp. Está disponible como aplicación web y APK Android beta, con respaldo opcional mediante una cuenta de Google.

## Estado real del proyecto

| Nivel | Alcance de esta versión |
| --- | --- |
| ✅ **Implementado** | Vault para inventario, fiados y encargos, boutique consultable, integración con WhatsApp y captura asistida revisable; aplicación web disponible. |
| 🧪 **En validación** | APK Android beta tipo TWA, permisos y uso en teléfono; avisos push sujetos a configuración Firebase y pruebas de recepción, además de sincronización/respaldo opcional. |
| 🧭 **No debe asumirse** | Operación offline completa de la APK, envío automático de pedidos por WhatsApp o notificaciones garantizadas para todas las instalaciones. |

<details>
<summary><strong>¿Cómo leer este estado?</strong></summary>

«Implementado» significa que hay código o una entrega identificable; no equivale por sí solo a una prueba exhaustiva. «En validación» señala pruebas y límites todavía abiertos. «Propuesto» describe una intención, **no una función disponible**. Para evaluación técnica, consulta los documentos y las releases de cada versión.

</details>

## Por qué lo hice

PaMaRa AyN es el emprendimiento de mi mamá. Entre perfumes, otros productos, ventas fiadas y encargos, había información que no debía depender de recordar una conversación o buscar un mensaje antiguo. Empecé esta aplicación para que anotar un movimiento, saber qué hay en bodega y revisar un cobro fuese más sencillo desde el teléfono.

El flujo principal es sencillo: **dictar o escribir, revisar y recién entonces guardar**.

## Qué permite hacer

| Para administrar                                                                 | Para quien visita la boutique                                       |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Registrar fiados, abonos y cuotas; consultar saldos.                             | Ver productos visibles, disponibilidad y precio calculado.          |
| Crear y entregar encargos; contar y ajustar existencias.                         | Filtrar productos y preparar una bolsa de pedido.                   |
| Revisar propuestas obtenidas de voz, texto o una foto de bodega.                 | Enviar la consulta o pedido por WhatsApp.                           |
| Ajustar precios generales, preparar anuncios y gestionar un respaldo con Google. | Elegir comuna de entrega; **la tarifa de envío no se calcula aún**. |

**Estado:** web y Android **beta** mediante Trusted Web Activity (TWA). El APK requiere conexión y el sitio publicado. Los pedidos se coordinan por WhatsApp y se registran por separado en Vault; los avisos push requieren configurar Firebase y comprobar la recepción en el teléfono.

## Cómo está construido

- **Interfaz y servidor web:** React 19, TypeScript, TanStack Start, Vite y Tailwind CSS.
- **Trabajo diario:** estado persistido en `localStorage` con lógica en [`src/lib/store.ts`](src/lib/store.ts).
- **Respaldo:** autenticación con Google y snapshot JSON por cuenta en Supabase, si se inicia sesión.
- **Asistencia:** transcripción y análisis con Groq, más reconocimiento de voz del teléfono cuando está disponible; respuesta revisada antes de guardar.
- **Boutique pública:** catálogo derivado del respaldo, con disponibilidad, precios y pedidos por WhatsApp.

[Arquitectura, límites y diagramas](docs/tecnica/01-arquitectura.md) · [Datos, sincronización y seguridad](docs/tecnica/03-persistencia-y-sincronizacion.md)

## Ejecutar el proyecto

Requiere un entorno de Node/Bun compatible y las variables de los servicios conectados. Las claves privadas permanecen **sólo en el servidor**.

```bash
bun install --frozen-lockfile
bun run dev
```

Verificar antes de publicar:

```bash
bun run lint
bunx tsc --noEmit
bun run test
bun run build
```

[Guía de desarrollo](docs/desarrollo/01-desarrollo-local.md) · [Entrega Android](docs/desarrollo/02-android-y-despliegue.md) · [Guía de pruebas](docs/desarrollo/03-pruebas-y-limitaciones.md)

## Documentación por público

| General                                                               | Técnica                                                   | Desarrollo                                                           |
| --------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------- |
| [Origen y propósito](docs/general/01-origen-y-proposito.md)           | [Arquitectura](docs/tecnica/01-arquitectura.md)           | [Entorno y comandos](docs/desarrollo/01-desarrollo-local.md)         |
| [Funciones y límites](docs/general/02-alcance-y-funciones.md)         | [Dominio y reglas](docs/tecnica/02-dominio-y-reglas.md)   | [Android y despliegue](docs/desarrollo/02-android-y-despliegue.md)   |
| [Experiencia e identidad](docs/general/03-experiencia-e-identidad.md) | [Datos](docs/tecnica/03-persistencia-y-sincronizacion.md) | [Pruebas y pendientes](docs/desarrollo/03-pruebas-y-limitaciones.md) |

[Índice completo y recorridos de lectura](docs/README.md)

## Licencia e identidad

El código y la documentación propios se distribuyen según [PolyForm Noncommercial 1.0.0](LICENSE); consulta [alcance, atribuciones y licencias de terceros](LICENSING.md) y [NOTICE](NOTICE). Los recursos gráficos de **PaMaRa AyN** están en [`branding/`](branding/README.md).
