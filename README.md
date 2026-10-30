# PaMaRa Bodega

Aplicación para PaMaRa AyN que organiza deudas, abonos, encargos, productos y stock. La entrada por voz o texto produce una propuesta revisable antes de registrar; incluye catálogo web y respaldo/sincronización opcional.

**Estado:** Web y APK Android beta basada en Trusted Web Activity. Android requiere Internet, el backend publicado y un navegador compatible; las notificaciones y la actualización deben validarse en dispositivo.

## Usar o descargar

[Abrir la web](https://pamara-bodega.lovable.app) · [Descargar APK beta y consultar releases](https://github.com/NicoCG32/pamara-bodega/releases) · [Instalación y actualización](docs/09-instalacion-y-despliegue.md). Elige una release publicada y su archivo `.apk`, conserva el checksum y consulta sus notas.

## Ejecutar desde el código

Con Bun y el entorno de prueba configurado, desde la raíz:

```sh
bun install --frozen-lockfile
bun run dev
```

Las claves de proveedores se mantienen en el servidor. [Criterios de aceptación Android](docs/android-acceptance.md).

## Documentación

[Índice completo y rutas de lectura](docs/README.md) · [Recorrido de registro y cobros](docs/03-flujo-de-usuario.md).

| Tipo       | Lectura                                                                                                                                                                          |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| General    | [Problema, cliente y solución](docs/00-problematica-cliente-y-valor.md) · [Motivación](docs/16-motivacion-y-contexto.md)                                                         |
| Técnica    | [Arquitectura y diagramas](docs/01-arquitectura-general.md) · [Dominio y datos](docs/04-base-de-datos.md)                                                                        |
| Desarrollo | [Etapas y metodología](docs/17-desarrollo-y-metodologia.md) · [Proyección](docs/15-escalabilidad-y-nuevos-mercados.md) · [Costos CLP/USD](docs/18-analisis-economico-clp-usd.md) |

## Licencia y créditos

Código y documentación propios: [PolyForm Noncommercial 1.0.0](LICENSE), con [atribución](NOTICE). Uso comercial fuera de sus permisos: acuerdo previo de créditos y compensación. [Alcance y contacto](LICENSING.md).
