# 09 · Instalación y distribución Android

## Estado y arquitectura

Las entregas Android son **candidatas beta**, no una certificación de cierre del producto. El proyecto `android/` compila una APK real, firmada, basada en Trusted Web Activity (TWA). Carga `https://pamara-bodega.lovable.app/` usando el navegador compatible del teléfono.

Se eligió TWA porque el producto ya utiliza Google OAuth, micrófono web, notificaciones web y funciones de servidor TanStack Start. Capacitor con recursos locales requeriría separar ese servidor y adaptar OAuth, permisos y push; una reescritura nativa ampliaría innecesariamente el alcance. El APK conserva la web y sus integraciones actuales. [Arquitectura TWA de Chrome](https://developer.chrome.com/docs/android/trusted-web-activity).

```text
APK firmada → navegador Android → web HTTPS / TanStack Start
                                  ├─ localStorage del origen
                                  ├─ Google / Supabase: sesión y snapshots
                                  └─ servidor: IA y recordatorios
```

GitHub Releases aloja el instalador; el servidor continúa alojado por separado. El APK no contiene el build SSR, claves de IA, credenciales de Supabase privilegiadas ni datos del negocio. Los cambios de la web pueden llegar sin cambiar la versión APK: el commit de la release identifica el envoltorio Android, no congela el contenido remoto.

## Compatibilidad e identidad

La configuración canónica está en [`android/release.properties`](../android/release.properties).

| Propiedad | Valor inicial |
| --- | --- |
| Nombre | PaMaRa Bodega |
| Application ID | `app.lovable.pamara_bodega` |
| versionName / versionCode local | `0.1.0-beta.1` / `1` |
| Versión automática | `0.1.0-beta.<1000 + run_number>` / `1000 + run_number` |
| Android mínimo | 8.0, API 26 |
| Android objetivo / compilación | API 36 |
| Build Tools | 36.0.0 |
| Java / Gradle / Android Gradle Plugin | JDK 21 / 8.13 / 8.10.1 |
| Android Browser Helper | 2.7.4 |
| ABI | APK universal sin bibliotecas nativas |

Se necesita un navegador Android actualizado que admita TWA/Custom Tabs. La disponibilidad de la versión actual del navegador también depende de Android; el mínimo del APK no garantiza todas las APIs web en navegadores antiguos. Debe comprobarse cada dispositivo admitido.

El wrapper no solicita cámara, micrófono, contactos, archivos ni notificaciones nativas. El navegador gestiona los permisos del sitio; las notificaciones siguen siendo web push. No se configura delegación nativa de notificaciones en esta beta. La firma debug usa un paquete `.debug` distinto y no se distribuye como release.

## Instalar y actualizar

1. Obtener el `.apk` y `SHA256SUMS.txt` del asset explícito de la release beta, no del ZIP de fuentes.
2. Verificar SHA-256. En PowerShell: `Get-FileHash .\pamara-bodega-0.1.0-beta.1.apk -Algorithm SHA256`.
3. Abrir el APK en Android y autorizar temporalmente la instalación desde esa fuente cuando se solicite.
4. Abrir PaMaRa Bodega con internet disponible. Sin Digital Asset Links publicado aparecerá una barra de navegador; no debe presentarse esa situación como TWA verificada.
5. Para una actualización, instalar sobre la app existente. Conservar application ID y clave de firma, aumentar `versionCode` y actualizar `versionName`. No desinstalar como parte rutinaria de una actualización.

Los datos están en el origen HTTPS y perfil del navegador que atiende la TWA. Si ya se usaba ese mismo origen, navegador y perfil, se utiliza su almacenamiento. Otro navegador, perfil, dominio o teléfono no transfiere automáticamente registros. Borrar datos del sitio/navegador puede borrar datos locales aunque la APK siga instalada. El APK no implementa importación/exportación de respaldos por archivo.

Antes de cambiar teléfono, navegador o dominio, iniciar sesión en Ajustes, esperar la indicación de última copia y comprobar la recuperación con datos de prueba. El respaldo es un snapshot completo: no combina registros entre dispositivos. Se conserva la regla existente de que la nube más reciente prevalece. Una copia indicada en pantalla no acredita resolución de conflictos ni funcionamiento offline.

## Compilar localmente

Instalar JDK 21 y Android SDK con `platform-tools`, `platforms;android-36` y `build-tools;36.0.0`. Definir `JAVA_HOME` y `ANDROID_HOME`. No hace falta compilar la web para construir el wrapper.

```sh
cd android
./gradlew assembleDebug lintDebug
```

En Windows usar `.\gradlew.bat` en PowerShell. Para release, suministrar mediante el entorno de un gestor de secretos:

| Variable | Contenido privado |
| --- | --- |
| `ANDROID_KEYSTORE_PATH` | Ruta absoluta al keystore PKCS12 |
| `ANDROID_KEYSTORE_PASSWORD` | Contraseña del keystore |
| `ANDROID_KEY_ALIAS` | Alias de la clave |
| `ANDROID_KEY_PASSWORD` | Contraseña de la clave |

```sh
cd android
./gradlew assembleRelease lintRelease
cd ..
node --test scripts/android-release.test.mjs
node scripts/android-release.mjs --check-web
```

La compilación release falla si faltan variables de firma. El empaquetador comprueba firma real con `apksigner`, identidad/versión y API con `aapt2`, ausencia de modo depuración, certificado del dominio y árbol Git limpio. Produce APK, manifiesto de procedencia, notas y SHA-256 en `release-output/`. `--allow-dirty` permite únicamente una evaluación local rotulada `-local`, nunca una release para publicar. `--check-web` además exige la asociación publicada por HTTPS. `--inspect-web` registra su estado y permite publicar una beta con barra del navegador si la asociación está pendiente.

CI suministra `ANDROID_VERSION_CODE` y `ANDROID_VERSION_NAME` tanto a Gradle como al verificador. Estos valores cambian sólo para esa compilación: no se generan commits de versionado ni ciclos de autopublicación.

El wrapper fija la distribución de Gradle con checksum; `app/gradle.lockfile` fija las dependencias resueltas. Actualizaciones de bibliotecas requieren regenerar locks deliberadamente y repetir compilación/lint/verificación. El toolchain no garantiza binarios idénticos byte por byte entre entornos.

## Firma y asociación web

La clave privada debe conservarse fuera de Git y de los adjuntos de Releases, con una copia de respaldo recuperable y su contraseña en un gestor seguro. Perderla impide actualizar instalaciones con esa identidad. No crear otra clave para cada versión. [Firma Android](https://developer.android.com/studio/publish/app-signing).

[`public/.well-known/assetlinks.json`](../public/.well-known/assetlinks.json) contiene sólo la huella pública del certificado. Debe desplegarse en la web para que la URL `https://pamara-bodega.lovable.app/.well-known/assetlinks.json` devuelva HTTP 200, `Content-Type: application/json`, sin redirecciones y con paquete/huella coincidentes. El APK declara la asociación recíproca. No confiar dominios adicionales de Google/OAuth que no sean propios; durante la autenticación puede mostrarse UI del navegador.

Comprobar la verificación Android después del despliegue y la instalación:

```sh
adb shell pm verify-app-links --re-verify app.lovable.pamara_bodega
adb shell pm get-app-links app.lovable.pamara_bodega
```

La verificación de Android y el arranque TWA sin barra deben probarse por separado. Un HTTP 200 del JSON no acredita por sí solo el resultado en el teléfono.

## GitHub Releases

`Android checks` compila/linta debug en PR y main sin secretos. `Android APK release` se ejecuta **con cada push a main**, sin filtro de archivos, y también puede iniciarse manualmente desde main. Cada ejecución toma el commit exacto del evento, construye una APK y publica una **prerelease beta**. Si un push contiene varios commits, la entrega corresponde al HEAD de ese push. No se cancelan las ejecuciones anteriores.

Configurar un environment `android-release` limitado a la rama main, sin aprobación manual para este flujo automático, y estos secretos: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. Base64 es codificación, no cifrado; sólo almacenarlo como secreto. No conceder estos secretos a PR.

La primera ejecución usa `versionCode=1001`, y cada ejecución nueva aumenta el número según `github.run_number`. El tag es `android-v<versionName>`. Conservar el archivo/identidad del workflow y el contador: si se reemplaza o reinicia, ajustar la base `1000` para superar cualquier versionCode distribuido. Reejecutar el mismo run conserva versión y tag; iniciar manualmente otro run crea otra versión. El prefijo semántico se obtiene de `release.properties`.

El workflow compila y linta, verifica la firma y comprueba la asociación web. Primero sube todos los assets a un borrador y sólo entonces publica la beta; un fallo deja el borrador sin publicar. Un rerun puede completar ese borrador, pero una release publicada permanece inmutable. Fallos de build, firma o comprobaciones impiden publicar; la falta de asociación HTTPS se indica en las notas de beta porque el fallback con barra sigue siendo utilizable.

La publicación en GitHub no despliega el servidor Lovable ni congela su contenido. Los cambios web deben publicarse en ese hosting para aparecer dentro de la APK. El workflow no promete pruebas manuales en teléfono por cada commit: las notas remiten a la [aceptación Android](android-acceptance.md). Una entrega estable requiere completar esos recorridos y el cierre funcional/documental; este flujo sólo publica betas.

## Límites actuales

- La web debe estar disponible para el arranque; no hay caché offline completa implementada en este wrapper.
- IA, Google y respaldo necesitan red y configuración del servidor.
- El roadmap mantiene pendiente la conexión Firebase web push. Empaquetar la web no resuelve esa configuración ni prueba notificaciones con app cerrada.
- Instalación, actualización, OAuth/retorno, voz, respaldo y permisos deben validarse en dispositivo; el build y lint no los sustituyen.
