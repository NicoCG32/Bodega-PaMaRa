# Desarrollo local y estructura

Esta guía está dirigida a quien deba ejecutar, comprobar o modificar PaMaRa Bodega. El frontend y el servidor se construyen juntos con **TanStack Start**; abrir únicamente los archivos estáticos no reproduce las funciones de IA, la boutique ni el cron.

## Puntos de entrada

| Ruta o archivo                   | Responsabilidad                                       |
| -------------------------------- | ----------------------------------------------------- |
| `src/routes/index.tsx`           | Boutique pública (`/`).                               |
| `src/routes/bodega.index.tsx`    | Captura principal de Bodega (`/bodega`).              |
| `src/routes/bodega.cobros.tsx`   | Cuentas por cobrar (`/bodega/cobros`).                |
| `src/routes/bodega.encargos.tsx` | Encargos y entrega (`/bodega/encargos`).              |
| `src/routes/bodega.stock.tsx`    | Inventario y captura (`/bodega/stock`).               |
| `src/routes/bodega.ajustes.tsx`  | Precios, nube y avisos (`/bodega/ajustes`).           |
| `src/routes/__root.tsx`          | Estructura de aplicación y envoltorio de rutas.       |
| `src/lib/store.ts`               | Estado local, reglas de precio y operaciones.         |
| `src/lib/*.functions.ts`         | Funciones de servidor: IA, catálogo y token push.     |
| `drizzle/migrations/`            | SQL de respaldos, roles, productos, precios y tokens. |
| `android/`                       | Envoltorio TWA y compilación Gradle.                  |

Los archivos en `src/components/ui/` contienen componentes visuales reutilizables; la lógica del producto vive en rutas, componentes específicos y `src/lib/`. Además, `productosSync.ts` administra la sincronización del inventario compartido y `cloudSync.ts` mantiene el respaldo JSON completo por cuenta. Las rutas antiguas `/vault`, `/cobros`, `/encargos`, `/catalogo` y `/ajustes` redirigen a `/bodega/*`.

## Ejecución

El proyecto versiona `bun.lock` y las siguientes instrucciones usan Bun. Utiliza una versión compatible con la empleada en CI; el workflow `calidad.yml` fija Bun **1.4.3** y Node **24.22.1** para las comprobaciones web.

```bash
bun install --frozen-lockfile
bun run dev
```

```bash
bun run lint
bunx tsc --noEmit
node --test scripts/android-release.test.mjs
bun run test
bun run build
```

Los mismos controles se ejecutan en GitHub Actions con el workflow [`calidad.yml`](../../.github/workflows/calidad.yml).

## Variables y secretos

| Entorno               | Variables utilizadas en código                                                                               | Regla                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Cliente/SSR           | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`; en servidor `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | La clave **publishable** puede estar en cliente; no concede acceso privilegiado por sí misma. |
| Funciones IA          | `GROQ_API_KEY`                                                                                               | Privada, sólo servidor.                                                                       |
| Cron y Supabase admin | `SUPABASE_SERVICE_ROLE_KEY`, `LOVABLE_CRON_SECRET` y opcionalmente `LOVABLE_CRON_SECRET_PREVIOUS`            | Privadas, nunca enviar al navegador ni commitear.                                             |
| Push                  | `FIREBASE_MESSAGING_API_KEY`, `LOVABLE_API_KEY`, y variables `VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_*`   | Separar credenciales servidor de configuración pública web.                                   |
| Android Release       | `ANDROID_KEYSTORE_BASE64` en CI; localmente ruta de keystore y contraseñas indicadas en guía Android         | Mantener fuera de Git.                                                                        |

El `.env` versionado contiene la conexión pública de Supabase y su clave _publishable_. Guarda las credenciales privadas en las variables del servidor o en un archivo `.env.local`, excluido de Git. Para otro despliegue, configura sus propias conexiones, OAuth y servicios de nube.

## Pruebas y datos

Los tests de `src/test/` cubren, entre otros, reglas de precios, proyección de boutique, conteo de bodega, transcripción/IA mediante mocks y flujo de rutas. Son útiles como regresión, pero no sustituyen pruebas en el teléfono ni validan el estado del backend publicado.

Trabajar con una **cuenta y datos sintéticos**. Nunca emplear un respaldo real del negocio como fixture ni pegar contenido de `backups.data` en un issue público.

[Pruebas y limitaciones](03-pruebas-y-limitaciones.md) · [Arquitectura](../tecnica/01-arquitectura.md)
