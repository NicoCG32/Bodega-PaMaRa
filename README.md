<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="branding/banners/PaMaRa_AyN_banner_oscuro.png" />
  <img src="branding/banners/PaMaRa_AyN_banner_claro.png" alt="Identidad visual de PaMaRa Bodega" width="100%" />
</picture>

# PaMaRa Bodega

**Cobros, encargos y stock con una experiencia cercana.**

[![Estado: Android beta](https://img.shields.io/badge/Estado-Android%20beta-9C5871?style=flat-square&labelColor=263244)](#sobre-el-proyecto) [![Plataforma: Android / Web](https://img.shields.io/badge/Plataforma-Android%20%2F%20Web-386B8F?style=flat-square&labelColor=263244)](#usar-o-descargar) [![Licencia: PolyForm NC](https://img.shields.io/badge/Licencia-PolyForm%20NC-596273?style=flat-square&labelColor=263244)](LICENSING.md)

[![React 19](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#tecnologías) [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=FFFFFF)](#tecnologías) [![TanStack Start](https://img.shields.io/badge/TanStack%20Start-155E75?style=for-the-badge&logo=tanstack&logoColor=FFFFFF)](#tecnologías) [![Android](https://img.shields.io/badge/Android-24633C?style=for-the-badge&logo=android&logoColor=FFFFFF)](#tecnologías)

[Abrir aplicación](https://pamara-bodega.lovable.app) · [Releases y descargas](https://github.com/NicoCG32/pamara-bodega/releases) · [Documentación](docs/README.md) · [Arquitectura](docs/01-arquitectura-general.md) · [Inicio rápido](#ejecutar-desde-el-código)

</div>

---

## Sobre el proyecto

Aplicación para PaMaRa AyN que organiza deudas, abonos, encargos, productos y stock. La entrada por voz o texto produce una propuesta revisable antes de registrar; incluye catálogo web y respaldo/sincronización opcional.

**Estado:** Web y APK Android beta basada en Trusted Web Activity. Android requiere Internet, el backend publicado y un navegador compatible; las notificaciones y la actualización deben validarse en dispositivo.

## Tecnologías

| Área                  | Tecnologías y responsabilidad                                                         |
| --------------------- | ------------------------------------------------------------------------------------- |
| **Aplicación**        | React 19, TypeScript, TanStack Start y Tailwind CSS.                                  |
| **Datos y servicios** | localStorage; snapshots y cuentas con Supabase, IA/voz con Groq y notificaciones FCM. |
| **Android**           | Java, Android Browser Helper y Trusted Web Activity; compilación Gradle.              |

> **Enfoque técnico:** Revisión antes de registrar y sincronización opcional mediante snapshots.

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

[Identidad visual](branding/README.md): logos, banners y variantes de aplicación.

## Licencia y créditos

Código y documentación propios: [PolyForm Noncommercial 1.0.0](LICENSE), con [atribución](NOTICE). Uso comercial fuera de sus permisos: acuerdo previo de créditos y compensación. [Alcance y contacto](LICENSING.md).
