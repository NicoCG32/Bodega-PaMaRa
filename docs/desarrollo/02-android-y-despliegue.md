# Despliegue web y distribución Android

## Dos entregas, un mismo producto

La web vive en `https://pamara-bodega.lovable.app/`, usa TanStack Start y servicios configurados en el entorno alojado. El cliente Android usa **Trusted Web Activity** para abrir ese origen en un navegador compatible. El `launchUrl` de la APK apunta a `/` (**Boutique**); la PWA instalada desde el navegador inicia en `/bodega`, según `manifest.webmanifest`. No incluye una copia independiente del servidor ni un almacén SQLite de los datos.

```mermaid
flowchart LR
  A[GitHub main] --> B[Calidad web]
  A --> C[CI Android release]
  C --> D[APK firmada + SHA256]
  D --> E[GitHub Releases beta]
  F[Despliegue web separado] --> G[Dominio HTTPS]
  E --> H[App instalada TWA]
  H --> G
```

La web debe desplegarse para cambiar el comportamiento de una instalación existente; el APK empaqueta el acceso y la identidad Android. Si la web no responde, la TWA tampoco puede operar normalmente.

## Despliegue paralelo en Vercel

Vercel puede ejecutar el mismo proyecto con Nitro y Node.js 24. El repositorio conserva la configuración de Lovable; `NITRO_PRESET=vercel` se configura solo en el proyecto de Vercel. La instalación usa `bun install --frozen-lockfile` y la compilación `bun run build`, sin sobrescribir el directorio de salida que genera Nitro.

Para compartir el backend actual, configurar en Vercel las variables públicas `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` y `VITE_SUPABASE_PROJECT_ID`, y sus equivalentes de servidor. La URL de servidor debe ser accesible desde el host externo. La plantilla [`.env.example`](../../.env.example) enumera las opciones sin incluir credenciales.

Con `PAMARA_BACKEND_ORIGIN=https://pamara-bodega.lovable.app`, la página se renderiza en Vercel y consulta `catalogoPublico` por la llamada RPC que ya utiliza la Boutique en Lovable. TanStack decodifica su respuesta; el despliegue externo valida la proyección pública y descarta campos ajenos a ese contrato. Se mantienen productos visibles, precios y enlaces de fotos correspondientes.

Las llamadas a funciones de servidor pasan primero la comprobación de mismo origen de TanStack Start. Después se reenvían al backend fijo con el token de sesión y el cuerpo original. Lovable conserva las validaciones de cada función y el rol administrador; no se reenvían cookies ni se almacenan respuestas privadas en caché. No es un proxy a destinos arbitrarios.

En este modo, las claves de servicio, Groq y cron permanecen en Lovable. **No definir `PAMARA_BACKEND_ORIGIN` en Lovable**, ni crear otro programador de recordatorios para la copia. Publicar primero el backend compatible y mantener ambos hosts con el mismo commit para conservar el contrato de las funciones.

Antes de usar el paralelo, comprobar el catálogo completo, los rechazos de funciones privadas sin sesión, el inicio con Google y el rol, la sincronización y los collages. Los datos de `localStorage` pertenecen a cada dominio: no aparecen automáticamente en una dirección nueva. Verificar el respaldo de la cuenta antes de registrar movimientos allí. Las cargas que pasan por Vercel están sujetas al límite de cuerpo de sus funciones.

El APK y el programador de avisos continúan apuntando al alojamiento original hasta que se cambien expresamente. Este despliegue comparte los servicios de Lovable; no constituye una migración independiente del backend.

## Configuración existente

Según `android/release.properties` y archivos Gradle:

- Identificador: `app.lovable.pamara_bodega`.
- Versión base: `0.1.0-beta.1` en el archivo local; CI genera identificadores de prerelease crecientes.
- Android mínimo API **26**, objetivo y compilación API **36**.
- JDK **21**; Android SDK / Build Tools **36.0.0**.
- Se necesita un navegador compatible con Trusted Web Activity / Custom Tabs.

## Construir para prueba

Con JDK 21, Android SDK y sus paquetes indicados:

```bash
cd android
./gradlew assembleDebug lintDebug
```

En Windows PowerShell: `./gradlew.bat assembleDebug lintDebug`. Los builds release necesitan un keystore y las variables **`ANDROID_KEYSTORE_PATH`**, **`ANDROID_KEYSTORE_PASSWORD`**, **`ANDROID_KEY_ALIAS`** y **`ANDROID_KEY_PASSWORD`**. No deben agregarse al repositorio.

Desde la raíz hay comprobaciones de release:

```bash
node --test scripts/android-release.test.mjs
node scripts/android-release.mjs --inspect-web
```

El empaquetador inspecciona el APK, la firma, identidad, versión y asociación del dominio, y escribe artefactos en `release-output/`. La revisión de HTTPS/asset links y la firma de la APK deben validarse con la versión concreta que se distribuye.

## GitHub Actions

- `calidad.yml`: lint, tipos, pruebas, build web y prueba del empaquetador.
- `android-check.yml`: compila y ejecuta lint Android en cambios pertinentes.
- `android-release.yml`: **se ejecuta con cada push a `main`**, incluso cambios sólo de documentación, y publica una **prerelease beta** si los secretos y controles están disponibles. Es independiente del despliegue web.

La automatización asigna `versionCode` como `1000 + GITHUB_RUN_NUMBER`. Las releases se publican en canal beta.

## Asociación y actualizaciones

`public/.well-known/assetlinks.json` declara la asociación del dominio con el certificado Android. Debe servirse por HTTPS y coincidir con el paquete/firma; también es necesaria la comprobación de Android en el dispositivo. Si la asociación falla, puede aparecer una barra de navegador.

La actualización exige mismo identificador de paquete, firma compatible y un código de versión mayor. Guardar el keystore de firma y contraseñas fuera del repositorio. **No desinstalar** para simular una actualización: desinstalar o borrar datos del navegador puede afectar el estado local.

## Archivos de la release

Una release beta debería adjuntar APK, `SHA256SUMS.txt`, manifiesto de procedencia, notas y avisos de licencia. Antes de invitar a utilizarla, ejecutar el checklist con cuenta de prueba, dispositivo real y fecha registrada.

[Lista de aceptación Android](../android-acceptance.md) · [Arquitectura](../tecnica/01-arquitectura.md)
